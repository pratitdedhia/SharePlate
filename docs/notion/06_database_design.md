# 06. Database Design & Security Strategy

**Deployment note:** This describes the repository's production PostgreSQL/Supabase design. The static Pages demo does not use this database or its RLS/atomic guarantees.

---

## 1. Schema Definition & Relational Tables

Our schema consists of five primary tables in PostgreSQL:

1. **`profiles`:** User metadata (`full_name`, `role`, `organization_name`, `phone`, `city`, `service_area`).
2. **`donations`:** Surplus listings (`title`, `category`, `quantity_total`, `quantity_available`, `pickup_deadline`, `pickup_instructions`, `image_url`, `cloudinary_public_id`, `status`).
3. **`claims`:** Portion reservations (`donation_id`, `recipient_id`, `quantity_claimed`, `status`, `claimed_at`, `collected_at`, `delivered_at`, `cancelled_at`).
4. **`reports`:** Food safety and guideline reports (`reporter_id`, `donation_id`, `reason`, `status`).
5. **`activity_logs`:** Audit trail for donation creation, claim reservations, cancellations, and delivery verifications.

---

## 2. Row Level Security (RLS) Policy Matrix

| Table | Operation | Target Role | Security Rule |
| :--- | :--- | :--- | :--- |
| `profiles` | SELECT | Public | Allowed (public profiles visible to build community trust). |
| `profiles` | UPDATE | Owner | Allowed only if `auth.uid() = id` (role modification blocked). |
| `donations` | SELECT | Public | Active listings (`available`, `reserved`, `claimed`, `delivered`) visible to all. |
| `donations` | INSERT | Authenticated | Allowed only for donors (`auth.uid() = donor_id`). |
| `donations` | UPDATE/DELETE | Owner Donor | Allowed only if `auth.uid() = donor_id`. |
| `claims` | SELECT | Participants | Allowed if `auth.uid() = recipient_id OR auth.uid() IN (SELECT donor_id FROM donations)`. |
| `claims` | INSERT | Recipient | Allowed only if `auth.uid() = recipient_id`. |
| `claims` | UPDATE | Participants | Allowed for status lifecycle progression by recipient or donor. |

---

## 3. Atomic Stored Procedures

### Preventing Double Claims (`claim_donation_atomic`)
```sql
SELECT * INTO v_donation
FROM public.donations
WHERE id = p_donation_id
FOR UPDATE; -- Exclusive row-level lock

IF v_donation.quantity_available < p_quantity THEN
    RAISE EXCEPTION 'Requested quantity exceeds available';
END IF;

UPDATE public.donations
SET quantity_available = quantity_available - p_quantity
WHERE id = p_donation_id;
```
By locking the row, simultaneous requests are queued sequentially. The second request immediately detects that `quantity_available` has decreased and aborts cleanly.
