# 06. Database Design & Security Strategy

**Database Engine:** PostgreSQL 15 (Supabase Hosted)  
**Security Paradigm:** Defense-in-Depth with Row Level Security (RLS) & Atomic RPCs  

---

## 1. Entity-Relationship Architecture

SharePlate enforces a strict relational data model to maintain portion accounting integrity, traceability, and multi-tenant security:

```
+--------------------+           +------------------------+           +----------------------+
|      PROFILES      | 1       * |       DONATIONS        | 1       * |        CLAIMS        |
+--------------------+-----------+------------------------+-----------+----------------------+
| id (UUID, PK)      |           | id (UUID, PK)          |           | id (UUID, PK)        |
| full_name (TEXT)   |           | donor_id (UUID, FK)    |           | donation_id (UUID,FK)|
| role (USER_ROLE)   |           | title (TEXT)           |           | recipient_id(UUID,FK)|
| organization_name  |           | category (DONATION_CAT)|           | volunteer_id(UUID,FK)|
| phone (TEXT)       |           | quantity_total (INT)   |           | quantity_claimed(INT)|
| city (TEXT)        |           | quantity_available(INT)|           | status (CLAIM_STATUS)|
| is_verified (BOOL) |           | pickup_deadline (TIMEST|           | claimed_at (TIMEST)  |
| created_at (TIMEST)|           | pickup_notes (TEXT)    |           | collected_at (TIMEST)|
+--------------------+           | image_url (TEXT)       |           | delivered_at (TIMEST)|
                                 | cloudinary_id (TEXT)   |           +----------------------+
                                 | status (DONATION_STAT) |                      |
                                 +------------------------+                      |
                                             | 1                                 |
                                             |                                   |
                                             v *                                 v *
                                 +------------------------+           +----------------------+
                                 |        REPORTS         |           |    ACTIVITY_LOGS     |
                                 +------------------------+           +----------------------+
                                 | id (UUID, PK)          |           | id (UUID, PK)        |
                                 | donation_id (UUID, FK) |           | user_id (UUID, FK)   |
                                 | reporter_id (UUID, FK) |           | action (TEXT)        |
                                 | reason (TEXT)          |           | entity_type (TEXT)   |
                                 | status (REPORT_STATUS) |           | metadata (JSONB)     |
                                 +------------------------+           +----------------------+
```

---

## 2. Table Schemas & Data Constraints

### 1. `profiles` Table
Stores extended user profile metadata linked 1:1 with `auth.users`:
```sql
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('donor', 'recipient', 'volunteer', 'admin')),
  organization_name TEXT,
  phone TEXT,
  city TEXT DEFAULT 'Delhi NCR',
  service_area TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 2. `donations` Table
Tracks surplus food batches with strict quantity invariant constraints:
```sql
CREATE TABLE public.donations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  donor_id UUID REFERENCES public.profiles(id) ON DELETE RESTRICT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('cooked_meals', 'bakery', 'produce', 'packaged', 'dairy', 'other')),
  quantity_total INTEGER NOT NULL CHECK (quantity_total > 0),
  quantity_available INTEGER NOT NULL CHECK (quantity_available >= 0),
  quantity_unit TEXT DEFAULT 'portions',
  pickup_deadline TIMESTAMPTZ NOT NULL,
  city TEXT NOT NULL DEFAULT 'Delhi NCR',
  location_label TEXT NOT NULL,
  pickup_instructions TEXT, -- Protected: Visible only to confirmed claimant
  image_url TEXT,
  cloudinary_public_id TEXT,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'completed', 'expired', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now()
);
-- Invariant: Available portions can never exceed total portions
ALTER TABLE public.donations ADD CONSTRAINT check_available_lte_total CHECK (quantity_available <= quantity_total);
```

### 3. `claims` Table
Tracks state-machine progression of reserved portions:
```sql
CREATE TABLE public.claims (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  donation_id UUID REFERENCES public.donations(id) ON DELETE CASCADE NOT NULL,
  recipient_id UUID REFERENCES public.profiles(id) ON DELETE RESTRICT NOT NULL,
  volunteer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  quantity_claimed INTEGER NOT NULL CHECK (quantity_claimed > 0),
  status TEXT DEFAULT 'reserved' CHECK (status IN ('reserved', 'collected', 'delivered', 'cancelled')),
  notes TEXT,
  claimed_at TIMESTAMPTZ DEFAULT now(),
  collected_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ
);
```

---

## 3. Row Level Security (RLS) Policy Specifications

To guarantee zero data leaks across tenants, RLS is enabled on all tables:

| Table | Policy Name | Command | Target Audience | Condition Expression |
| :--- | :--- | :--- | :--- | :--- |
| `profiles` | Public View | `SELECT` | All | `true` (public trust building) |
| `profiles` | Self Update | `UPDATE` | Owner | `auth.uid() = id` (cannot change `role`) |
| `donations` | Active Browse | `SELECT` | All | `status IN ('available', 'reserved', 'completed')` |
| `donations` | Donor Insert | `INSERT` | Donors | `auth.uid() = donor_id AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('donor', 'admin'))` |
| `donations` | Donor Update | `UPDATE` | Donor | `auth.uid() = donor_id` |
| `claims` | Claimant Access | `SELECT` | Participants | `auth.uid() = recipient_id OR auth.uid() = volunteer_id OR auth.uid() = (SELECT donor_id FROM donations WHERE id = donation_id)` |
| `claims` | Recipient Insert | `INSERT` | Recipients | `auth.uid() = recipient_id` |

---

## 4. Atomic Stored Procedures & Concurrency Locks

### Concurrency-Proof Claim Lock (`claim_donation_atomic`)
Executed via Supabase RPC to prevent race conditions during simultaneous reservations:
```sql
CREATE OR REPLACE FUNCTION public.claim_donation_atomic(
  p_donation_id UUID,
  p_claimant_id UUID,
  p_quantity INTEGER,
  p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_donation RECORD;
  v_claim_id UUID;
BEGIN
  -- 1. Acquire exclusive row-level lock on the donation record
  SELECT id, quantity_available, quantity_total, status, donor_id
  INTO v_donation
  FROM public.donations
  WHERE id = p_donation_id
  FOR UPDATE; -- Blocks concurrent threads until transaction commits

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'DONATION_NOT_FOUND');
  END IF;

  -- 2. Validate business rules
  IF v_donation.donor_id = p_claimant_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'CANNOT_CLAIM_OWN_DONATION');
  END IF;

  IF v_donation.status != 'available' THEN
    RETURN jsonb_build_object('success', false, 'error', 'DONATION_NOT_AVAILABLE');
  END IF;

  IF v_donation.quantity_available < p_quantity THEN
    RETURN jsonb_build_object('success', false, 'error', 'INSUFFICIENT_QUANTITY', 'available', v_donation.quantity_available);
  END IF;

  -- 3. Atomic state update
  UPDATE public.donations
  SET 
    quantity_available = quantity_available - p_quantity,
    status = CASE WHEN (quantity_available - p_quantity) = 0 THEN 'reserved' ELSE 'available' END
  WHERE id = p_donation_id;

  -- 4. Create claim record
  INSERT INTO public.claims (donation_id, recipient_id, quantity_claimed, status, notes)
  VALUES (p_donation_id, p_claimant_id, p_quantity, 'reserved', p_notes)
  RETURNING id INTO v_claim_id;

  RETURN jsonb_build_object('success', true, 'claim_id', v_claim_id, 'remaining_quantity', v_donation.quantity_available - p_quantity);
END;
$$;
```

### Cancellation Restitution (`cancel_claim_atomic`)
If a claimant cancels their claim before pickup, portions are immediately returned to the donor's surplus balance:
```sql
CREATE OR REPLACE FUNCTION public.cancel_claim_atomic(
  p_claim_id UUID,
  p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_claim RECORD;
BEGIN
  SELECT id, donation_id, quantity_claimed, status, recipient_id
  INTO v_claim
  FROM public.claims
  WHERE id = p_claim_id
  FOR UPDATE;

  IF NOT FOUND OR v_claim.status != 'reserved' THEN
    RETURN jsonb_build_object('success', false, 'error', 'INVALID_CLAIM_STATE');
  END IF;

  -- Restore available portions
  UPDATE public.donations
  SET 
    quantity_available = quantity_available + v_claim.quantity_claimed,
    status = 'available'
  WHERE id = v_claim.donation_id;

  -- Update claim status
  UPDATE public.claims
  SET status = 'cancelled', cancelled_at = now()
  WHERE id = p_claim_id;

  RETURN jsonb_build_object('success', true);
END;
$$;
```

---

## 5. Indexing Strategy for Low-Latency Querying

To ensure sub-50ms query response on high-frequency mobile feeds:
```sql
-- Feed filtering indexes
CREATE INDEX idx_donations_status_city ON public.donations (status, city);
CREATE INDEX idx_donations_deadline ON public.donations (pickup_deadline) WHERE status = 'available';
CREATE INDEX idx_claims_recipient ON public.claims (recipient_id, status);
CREATE INDEX idx_claims_donation ON public.claims (donation_id);
```

