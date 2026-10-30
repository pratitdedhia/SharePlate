# 12. Final Submission Summary & Evaluation Walkthrough

**Hacktober HackDays 2026 | SheBuilds Delhi Chapter | Powered by MLH**  
**Project Name:** SharePlate  
**Tagline:** Rescue Food. Reduce Waste. Feed Communities.  
**Track:** Tech for Social Good  
**Mandatory Technology:** Cloudinary (Advanced Transformations, Smart Auto-Crop, AI Tagging, Format Optimization)  
**Mandatory Documentation:** Notion (13 Complete Documents in `docs/notion/`)  
**Live Deployed Application:** [https://pratitdedhia.github.io/SharePlate/](https://pratitdedhia.github.io/SharePlate/)  
**GitHub Repository:** [https://github.com/pratitdedhia/SharePlate](https://github.com/pratitdedhia/SharePlate)  

---

## 1. Executive Summary

SharePlate is a community-driven food rescue web platform engineered for **Hacktober HackDays 2026 (SheBuilds Delhi / MLH)** under the **Tech for Social Good** track. It bridges the critical logistics gap between commercial kitchens (university dining halls, corporate cafeterias, caterers) with sudden edible food surplus and community shelters (NGOs, DUSIB night shelters, children's homes) facing chronic meal shortages across high-density Indian metropolitan hubs (Delhi NCR, Mumbai).

### Key Architectural Highlights
- **100% Verified, Working Implementation:** Built with React 18, Vite, Tailwind CSS, Express, TypeScript, Supabase PostgreSQL, and Cloudinary.
- **Advanced Cloudinary Media Pipeline:**
  - **Smart Content Auto-Cropping (`g_auto`):** Interactive switcher between `4:3 Food Card`, `16:9 Banner`, and `1:1 Square` thumbnail ensuring dishes remain centered across viewports.
  - **AI Food Recognition Auto-Tagging:** Extracts food category tags from pixel data, enabling 1-click description and dietary tag additions.
  - **Format & Quality Optimization (`f_auto, q_auto`):** Delivers next-gen WebP/AVIF formats at optimal perceptual quality.
  - **Real Measured Bandwidth Telemetry:** Measures delivered payload via `measureTransformedDelivery` against camera upload bytes, delivering substantial bandwidth reduction (typically 70–85%) on mobile cellular networks when live uploads are performed.
  - **Dual-Path Architecture:** Direct unsigned preset uploads (`shareplate/donations`) for static GitHub Pages deployment, plus server-side cryptographic signatures on the Express backend (`/api/uploads/signature`).
- **Concurrency & Double-Booking Safety:** PostgreSQL stored procedures (`claim_donation_atomic`) using `SELECT ... FOR UPDATE` row-level locks guarantee race-condition-free reservations.
- **Privacy & Protected Logistics:** Sensitive kitchen loading dock instructions and donor phone numbers are masked in public feeds and revealed exclusively to verified claimants upon reservation.
- **Tailored Role Experience:**
  - `Donor`: Clean dashboard, my listings, + Donate Food, and **Donor Rewards Ledger** (points balance and delivery verification history).
  - `Recipient`: Clean dashboard, browse surplus food, my claims, and interactive delivery OTP verification with portion counts.
  - `Volunteer`: Dedicated Last-Mile Runner courier portal with "On-My-Way" Commute Trip Planner, multi-stop Google Maps route links with automatic waypoint partitioning (<= 9 waypoints per leg), and two-party OTP handoffs at donor pickup and recipient delivery.
  - `Admin`: Comprehensive governance with 5 tabs (Full Insights & Portion Funnel, Who Donated ledger, Who Received distribution ledger, User Account lifecycle with Add/Edit/Delete modals, and Safety Reports queue).
- **Two-Party OTP Verification Engine:** Prevents volunteer self-claims. 4-digit codes expire after 15 minutes with a 3-attempt lockout. Donors verify at pickup; recipient NGOs confirm receipt and portion counts at delivery to release reward points.
- **Persisted Donor Rewards System:** Awards points strictly upon verified recipient delivery confirmation ($\min(200, 20 + 2 \times \text{portions})$). Zero rewards for listings, reservations, pickups, cancellations, or disputes.
- **Portability:** Zero-dependency static deployment on GitHub Pages, and self-contained root `index.html` capable of offline double-click execution under `file:///` in any browser.

---

## 2. Recommended 3-Minute Judge Evaluation Walkthrough

```
[0:00 - 0:30] Mission, Live Trust Metrics & Honest Provenance Badges
      │
[0:30 - 1:15] Donor Journey: AI Tagging & Smart Auto-Crop Image Uploader
      │
[1:15 - 1:45] Recipient Journey: Browse Food & Atomic Race-Condition Lock
      │
[1:45 - 2:15] Volunteer Courier: PIN Dock Unlock & Last-Mile Delivery
      │
[2:15 - 2:45] Admin Governance: Portions Funnel, Audit Ledgers & User CRUD
      │
[2:45 - 3:00] Cloudinary Technical Evidence & 13 Notion Documents
```

### Step 1: Homepage & Social Vision (0:00 – 0:30)
1. Open the live deployment: [https://pratitdedhia.github.io/SharePlate/](https://pratitdedhia.github.io/SharePlate/).
2. Point out the mission statement, honest demo mode notice, and live trust metrics strip (Delivered portions, Active Donors, Partner NGOs, $CO_2e$ avoided calculated using FAO/UNEP lifecycle benchmarks).
3. Highlight the role switcher in the header enabling one-click evaluation of all 4 user roles.

### Step 2: Donor Journey with Cloudinary AI & Auto-Crop (0:30 – 1:15)
1. Switch to **Canteen / Donor** persona. Notice navigation automatically streamlines to Dashboard, My Listings, and "+ Donate Food".
2. Click **+ Donate Food** (`#/donations/new`).
3. Upload a photo or select an evaluation seed asset (e.g., *Fresh Biryani*).
4. Demonstrate Cloudinary's **Smart Crop Switcher (`g_auto`)**: toggle between `4:3 Card`, `16:9 Banner`, and `1:1 Square` to see how the food plate remains centered.
5. Demonstrate the **AI Food Recognition Assistant**: click any detected AI tag chip (`Dum Biryani`, `Rice & Grains`, `Warm Cooked Meal`) to copy it and watch it populate the description!
6. Point out the Cloudinary optimization telemetry: live uploads display the calculated bandwidth reduction comparing raw camera file bytes against the delivered WebP image.
7. Submit the listing and verify it appears on `#/donations`.

### Step 3: Recipient Discovery & Atomic Reservation (1:15 – 1:45)
1. Switch to **NGO / Recipient** persona (Robin Hood Army). Notice navigation focuses strictly on Browse Food and My Claims.
2. Open **Browse Food** (`#/donations`), filter by `Cooked Meals` or search "Biryani".
3. Click **Details & Claim** (`#/donations/:id`).
4. Reserve 20 portions via the claim modal. Confirm reservation: the available portion count drops immediately, atomically locking the claim!

### Step 4: Volunteer Commute Route & Two-Party OTP Handover (1:45 – 2:15)
1. Switch to **Volunteer Courier** persona.
2. Open the **Trip Planner** tab: enter origin and destination, check surplus tasks along the commute, view the sequential route stop list, and click **Open Route in Google Maps** (handles waypoint partitioning for legs $>9$ stops).
3. Demonstrate **Two-Party Verification**:
   - Volunteer initiates pickup handover (generating 4-digit code). Switch to Donor to verify and release the food into transit.
   - Volunteer arrives at recipient shelter and initiates delivery. Switch to Recipient NGO to verify the OTP and confirm received portions.
4. Check **Points & Rewards**: volunteer points are released immediately upon verified receipt; donor rewards points are credited to the donor's ledger!

### Step 5: Admin Governance & Traceability Ledgers (2:15 – 2:45)
1. Switch to **Admin** persona and navigate to the **Admin Dashboard** (`#/admin`):
   - **Full Insights Tab:** Interactive portion conversion funnel (Listed $\rightarrow$ Claimed $\rightarrow$ Picked Up $\rightarrow$ Delivered), city breakdown, and $CO_2e$ avoided.
   - **Who Donated Tab:** Full historical ledger of all donor contributions and donor reward point status.
   - **Who Received Tab:** Full distribution ledger of all recipient NGO claims.
   - **User Accounts Tab:** Interactive table of all registered logins with functional modals to **Add User**, **Edit User**, **Toggle Active/Deactivate**, or **Delete User**.
   - **Safety Reports Tab:** Moderation queue for reviewing reported listings.

### Step 6: Cloudinary Evidence & Documentation Portfolio (2:45 – 3:00)
1. Open the **About Page** (`#/about`) and review the 13 Notion engineering guides under `docs/notion/`.
2. Emphasize that all 91 automated tests pass cleanly and the root `index.html` runs natively without setup.

---

## 3. Future Roadmap

1. **Automated WhatsApp Business Webhooks:** Dispatch instantaneous alerts to verified shelter coordinators within 3 km of a published surplus listing.
2. **Govt. NGO Darpan & FSSAI Verification APIs:** Automated validation of NGO 80G tax exemption and canteen food safety registration numbers.
3. **Mapbox Matrix Route Optimization:** Multi-stop pickup route bundling for volunteer two-wheelers collecting from adjacent canteens on a single loop.
4. **Multilingual Audio Prompts:** Voice-guided listing creation in Hindi, Punjabi, and Marathi for commercial kitchen staff.

