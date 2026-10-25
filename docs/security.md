# SharePlate — Security & Trust Model

**Hacktober HackDays 2026 | SheBuilds Delhi Chapter**  

---

## 1. Threat Model & Defense Strategy

### 1.1 Insecure Direct Object References (IDOR)
- **Threat:** Malicious user edits or cancels another donor's food listing or views another recipient's private claim details.
- **Mitigation:**
  - Database Row Level Security (RLS) policies enforce `auth.uid() = donor_id` on `donations` update/delete.
  - Claims update policies enforce `auth.uid() = recipient_id OR auth.uid() = (SELECT donor_id FROM donations WHERE id = donation_id)`.
  - Express API verifies user ID from verified Supabase JWT rather than trusting request parameters.

### 1.2 Race Conditions & Inventory Overselling
- **Threat:** Two NGOs attempt to claim the last 20 portions of a popular donation at the exact same millisecond.
- **Mitigation:**
  - `claim_donation_atomic()` stored procedure uses `SELECT ... FOR UPDATE` row locking. The second transaction must wait until the first commits or rolls back, preventing overselling.

### 1.3 Privilege Escalation & Admin Bypass
- **Threat:** An untrusted user modifies their role to `admin` during registration or updates their profile to claim administrative rights.
- **Mitigation:**
  - The `on_auth_user_created` trigger strictly sanitizes `raw_user_meta_data->>'role'`, defaulting any invalid or elevated attempt (`admin`) to `donor`.
  - The `profiles` RLS policy prevents updating the `role` column via client requests (`WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()))`).
  - Frontend `RoleGuard` and Backend Express RBAC middleware reject non-admin users attempting to access `/api/reports`, `/admin`, or `/dashboard/admin`.
  - Account status is checked (`is_active === true`); deactivated accounts are denied session establishment both on frontend and server APIs.

### 1.4 Address & Contact Privacy Leakage
- **Threat:** Publishing exact residential addresses or personal phone numbers publicly leads to harassment or uncoordinated drop-ins.
- **Mitigation:**
  - Location is labeled as approximate (e.g. "DTU Campus, Rohini Sector 17").
  - The `pickup_instructions` field is masked in public API queries and revealed only to the authorized claimant or donor.
  - Donors are encouraged to specify loading docks or public meeting points.

### 1.5 Media Upload Exploits
- **Threat:** Uploading executable scripts disguised as images or flooding Cloudinary storage with gigabyte files.
- **Mitigation:**
  - MIME-type validation (`image/jpeg`, `image/png`, `image/webp`).
  - 5MB maximum file size limit.
  - Cryptographic server-issued signatures with strictly constrained folder paths.
