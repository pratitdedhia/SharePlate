# 12. Final Submission Summary & Demo Script

**Hacktober HackDays 2026 | SheBuilds Delhi Chapter | Powered by MLH**  
**Project Name:** SharePlate  
**Tagline:** Rescue Food. Reduce Waste. Feed Communities.  
**Track:** Tech for Social Good  
**Mandatory Technology:** Cloudinary  

---

## 1. Executive Summary
SharePlate is a community-driven food rescue web application built for **Hacktober HackDays 2026**. It enables college canteens, corporate cafeterias, and caterers to post surplus meals in under two minutes, and connects them with nearby community kitchens and NGOs to reserve, pick up, and distribute food before it spoils.

### Key Highlights
- **100% Full-Stack Working Implementation:** React 18, Vite, Tailwind CSS, Express, Supabase PostgreSQL, and Cloudinary.
- **Mandatory Cloudinary Pipeline:** Cryptographic server-issued signature generator (`/api/uploads/signature`), direct client upload with live progress, and responsive dynamic transformations (`c_fill, w_800, f_auto, q_auto`).
- **ACID Concurrency Safety:** PostgreSQL atomic stored procedures (`SELECT ... FOR UPDATE`) prevent double-reserving surplus food.
- **Privacy First:** Sensitive loading-dock access instructions and donor contact phone numbers are masked in public browsing and revealed strictly to confirmed claimants.
- **Defensible Impact Metrics:** Live metrics dynamically distinguish between listed, reserved, and actually delivered meals, computing CO₂e avoided based on FAO/UNEP benchmarks.

---

## 2. Recommended 2–3 Minute Evaluation Demo Script

1. **Homepage & Mission (0:00 – 0:30):**
   - Open `http://localhost:5173`.
   - Point out the mission statement and the live trust metrics strip (Delivered portions, Active Donors, Partner NGOs, CO₂e avoided).
   - Highlight the *How It Works* section and the factual food safety guidance notice.

2. **Donor Surplus Listing Flow (0:30 – 1:15):**
   - Select the **Canteen / Donor** persona using the top navigation role switcher.
   - Click **+ Donate Food** (`/donations/new`).
   - Upload a food photograph using the **Cloudinary Uploader** (or pick a verified sample preset). Watch the live upload progress and Cloudinary Ready badge.
   - Enter food details: *Fresh Vegetable Pulao*, *Cooked Meals*, *45 portions*, allergen tags (*Dairy*), and a 4-hour pickup deadline.
   - Submit the form. Notice the newly listed food card in `/donations`.

3. **Recipient Discovery & Atomic Claim (1:15 – 2:00):**
   - Switch persona to **NGO / Recipient** (Robin Hood Army).
   - Browse `/donations` and use category pills (*Cooked Meals*) or search to find the Pulao listing.
   - Click **Details & Claim** (`/donations/:id`).
   - Reserve 20 portions via the claim modal.
   - Confirm reservation. Notice the available portions drop from 45 to 25 immediately!

4. **Pickup, Delivery & Impact Verification (2:00 – 2:45):**
   - Open **My Claims** (`/my-claims`).
   - View the revealed private pickup instructions and donor contact.
   - Progress the claim through the lifecycle: click **Mark Picked Up** (moves status to `collected`), then click **Confirm Delivery** (moves status to `delivered`).
   - Open **Impact Dashboard** (`/impact`). Show the portion breakdown chart updating in real time, with 20 additional meals recorded in the verified delivered column and CO₂e offset recalculated.

5. **Cloudinary Evidence & Architecture (2:45 – 3:00):**
   - Open **About Page** (`/about`) and the GitHub repository.
   - Point to the server signature generation in `apps/api/src/routes/uploads.ts` and the 12 Notion documentation files under `docs/notion/`.

---

## 3. Future Roadmap
1. **Automated WhatsApp / SMS Webhook Alerts:** Notify local shelter coordinators via Twilio or WhatsApp Business API the moment a canteen posts food within 3 km.
2. **Offline-First Mobile PWA:** Service Worker caching for volunteer runners operating in underground basements or low-reception loading docks.
3. **Smart Route Bundling:** Optimize volunteer routes to collect batches from two adjacent canteens on a single run.
