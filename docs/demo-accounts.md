# SharePlate Demo Accounts & Presentation Guide
**Hacktober HackDays 2026 | SheBuilds Delhi Chapter | Powered by MLH**

---

## 1. Quick Demo Login for Judges

To provide a smooth hackathon evaluation experience without forcing judges to register multiple separate accounts, SharePlate integrates **1-Click Seeded Demo Authentication** directly on `/login`.

Clicking any demo button authenticates into a realistic fictional persona and routes immediately to the corresponding specialized dashboard.

---

## 2. Seeded Demonstration Personas

### 1. Donor Demo
- **Persona:** Priya Sharma (Canteen Lead)
- **Organization:** DTU Campus Central Canteen
- **Email:** `donor@shareplate.demo`
- **City:** Delhi NCR (Rohini & Pitampura)
- **Dashboard:** `/dashboard/donor`
- **Features to Explore:**
  - View total listings, active portions, and meals saved.
  - Inspect "+ Create Donation" with Cloudinary food photo upload.
  - Review incoming claims from Robin Hood Army.
  - Mark food batches collected or delivered.

### 2. Recipient Demo
- **Persona:** Rajesh Kumar (Distribution Coordinator)
- **Organization:** Robin Hood Army - Delhi Chapter
- **Email:** `recipient@shareplate.demo`
- **City:** Delhi NCR (North & West Delhi)
- **Dashboard:** `/dashboard/recipient`
- **Features to Explore:**
  - Browse food donations available across Delhi NCR.
  - Reserve food batches with atomic portion reservations.
  - Monitor upcoming pickups before expiration deadlines.
  - Update claim status to "Collected" or "Delivered".

### 3. Volunteer Demo
- **Persona:** Ananya Sen (Logistics Courier)
- **Organization:** Youth For Food Relief
- **Email:** `volunteer@shareplate.demo`
- **City:** Delhi NCR (South Delhi & Noida)
- **Dashboard:** `/dashboard/volunteer`
- **Features to Explore:**
  - Review transport opportunities board.
  - Accept pickup routes between donor canteens and community shelters.
  - Access donor pickup instructions and gate security contacts.
  - Confirm drop-off completions.

### 4. Admin Demo
- **Persona:** SharePlate Operations Admin
- **Organization:** SharePlate Foundation
- **Email:** `admin@shareplate.org`
- **City:** Delhi NCR (Pan-India)
- **Dashboard:** `/dashboard/admin`
- **Features to Explore:**
  - Monitor aggregate impact metrics (meals rescued, active claims, carbon offset).
  - Safety & Allergen moderation queue with resolve/dismiss controls.
  - User privilege management and account deactivation toggle.
  - Immutable system audit trail.

---

## 3. Demo Reset Script

During presentations or repeated judge evaluations, you can restore demo data back to the clean baseline anytime:

```bash
npm run db:reset-demo
```

Or execute the SQL migration in Supabase SQL Editor:
```bash
supabase/seed.sql
```

This clears transient session records while safely retaining the 4 standard demo personas, 6 realistic donation listings, and verified claims.
