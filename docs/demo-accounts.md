# SharePlate Demo Accounts & Presentation Guide
**Hacktober HackDays 2026 | SheBuilds Delhi Chapter | Powered by MLH**

**Deployment status:** These are fictional browser demo profiles. The static Pages app stores listing and claim data in the current browser. Supabase and Express are in the repository but are not deployed with this demo.

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
  - Inspect "+ Create Donation". A real Cloudinary upload requires configured public cloud and unsigned preset values; otherwise it remains a labeled local preview.
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
  - Reserve available quantities in the browser-local demo store; cross-device atomicity is not provided by the demo.
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
  - Demo activity records; they are not an immutable audit trail.

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

This script resets repository demo data where configured. It does not clear a visitor's browser-local store. In the demo browser, clear the `shareplate_demo_store` localStorage entry to restore initial local data. The sample profiles and listings are fictional demo content, not verified partner organizations.
