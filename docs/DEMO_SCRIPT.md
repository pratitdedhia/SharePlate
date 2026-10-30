# SharePlate — Live Judge Presentation Demo Guide & Pitch Script

**Event:** Hacktober HackDays 2026 (SheBuilds Delhi Chapter, Powered by MLH)  
**Track:** Tech for Social Good  
**Key Technology Integration:** Cloudinary Media Cloud  
**Live Deployed URL:** [https://pratitdedhia.github.io/SharePlate/](https://pratitdedhia.github.io/SharePlate/)  
**GitHub Repository:** [https://github.com/pratitdedhia/SharePlate](https://github.com/pratitdedhia/SharePlate)  

---

## 🎤 Part 1: 60-Second Elevator Pitch Script

> *"Judges, in urban India over 68 million tonnes of food are wasted annually, while local shelters and community kitchens struggle daily to feed people. High-volume kitchens like university canteens and caterers produce fresh, edible surplus every afternoon, but they discard it simply because they have no fast, reliable way to coordinate pickup before the food spoils.*  
>  
> *We built **SharePlate** to solve this critical time window. Donors can list surplus portions in under 60 seconds with strict preparation timestamps and food safety disclosures. Partner NGOs immediately see available food, inspect visual condition and packaging via our **Cloudinary** media pipeline, and reserve portions atomically.*  
>  
> *Cloudinary is essential here: commercial kitchen donors upload large smartphone photos, and Cloudinary automatically compresses them by up to 70–80% using modern WebP formats and smart auto-crop. This makes the platform lightning-fast for shelter coordinators operating on low-bandwidth mobile networks in the field.*  
>  
> *And for last-mile delivery, SharePlate introduces **On-My-Way Trip Planning** with **Two-Party Verification**: everyday commuters carry meals along trips they already take, and reward points are released **only** after both the donor kitchen and the recipient NGO confirm the handover. Let us walk you through the live end-to-end flow."*

---

## ⏱️ Part 2: Primary Judge Presentation Path (< 4 Minutes)

This path demonstrates the complete food rescue loop across Donor, Recipient, and Volunteer roles.

### Step 1: The Food Surplus Problem & SharePlate's Mission (0:00 – 0:30)
1. Open the hosted application at `https://pratitdedhia.github.io/SharePlate/`.
2. Highlight the headline: *"Rescue Food. Reduce Waste. Feed Communities."*
3. Point out the **Architecture & Demo Notice** banner:
   - *"Our hosted GitHub Pages demo runs as a static client with local browser storage (`demoStore`) and direct unsigned Cloudinary CDN uploads. The complete production backend — Express REST API and PostgreSQL with atomic RPC procedures and two-party verification — is included in our repository."*
4. Highlight the **Demonstration Impact Metrics Strip** on the homepage, noting that numbers are computed dynamically by a single calculation engine, not hardcoded.

### Step 2: Donor Lists Surplus Food with Safety Details (0:30 – 1:15)
1. Click **"Portal Login"** (`#/login`).
2. Click the 1-click demo button: **"Continue as Donor (DTU Canteen - Priya Sharma)"**.
3. From the Donor Dashboard, click **"+ Post Food Donation"** (`#/donations/new`).
4. Enter donation details:
   - **Title:** *Fresh Vegetable Pulao & Raita*
   - **Category:** *Cooked Meals*
   - **Quantity:** *45 portions*
   - **Dietary Type:** *Vegetarian*
   - **Preparation Timestamp:** *Today, 12:30 PM*
   - **Consume Within:** *5 hours*
   - **Storage Requirement:** *Keep insulated in thermal container above 60°C*
   - **Pickup Deadline:** *4 hours from now* (point out: listings automatically expire after this time)
   - **Pickup Instructions (Masked):** *Report to Gate 2 Security; canteen staff will bring containers down.*

### Step 3: Cloudinary Image Pipeline & Transformed Delivery (1:15 – 1:50)
1. In the photo section:
   - **Primary Action:** Drag-and-drop or upload a food photo (JPEG/PNG/WebP, up to 5 MB).
   - *Or click a preloaded evaluation asset (e.g., "Fresh Biryani (Sample)").*
2. **Demonstrate Cloudinary Features:**
   - **Smart Auto-Crop (`g_auto`):** Click between the **4:3 Food Card**, **16:9 Banner**, and **1:1 Square** preview tabs. Show how Cloudinary content-aware auto-cropping (`c_fill, g_auto`) keeps the food perfectly centered.
   - **Modern Format & Quality Transcoding (`f_auto, q_auto`):** Point out the badges showing automatic delivery in lightweight WebP format.
   - **Real Measured Bandwidth Savings:** On a live upload, show the measured payload comparison (original file KB vs. delivered WebP KB) calculated dynamically by `measureTransformedDelivery`.
   - **AI Tagging Notice:** Point out the Cloudinary AI tags (if configured) or the clear disclosure stating that AI tags assist search indexing and do *not* certify food safety.
3. Click **"Publish Food Listing"**. The new listing appears instantly in active inventory.

### Step 4: Recipient Reserves Portions & Sees Real-Time Inventory Update (1:50 – 2:25)
1. Switch role to **Recipient NGO (Robin Hood Army Delhi - Rajesh Kumar)** using the demo persona switcher on `#/login`.
2. Browse active inventory on **Browse Food** (`#/donations`).
3. Click on the newly published *Vegetable Pulao* listing (`#/donations/:id`).
4. Point out:
   - Transformed listing banner loaded via `CloudinaryImage.tsx` with responsive `srcset` (400w, 800w, 1200w) and lazy loading.
   - Donor safety disclosures (preparation timestamp, consume-within window, storage notes, declared allergens).
   - Food safety disclaimer prominently visible.
   - Private pickup instructions and donor phone number remain masked until reservation.
5. Click **"Reserve Food Portions"**:
   - Request **20 portions** (leaving 25 available).
   - Enter note: *"Collecting for community shelter distribution."*
   - Click **Confirm Reservation**.
6. The available count immediately drops from **45 to 25 portions**.

### Step 5: Volunteer "On-My-Way" Commute Trip Planner (2:25 – 3:00)
1. Switch role to **Volunteer (Youth For Food Relief - Ananya Sen)** via `#/login` or click **Dashboard**.
2. Open Tab 1: **"1. Trip Planner"**:
   - Volunteer enters starting location: *DTU Main Campus, Rohini Sector 17*
   - Destination: *Connaught Place Metro Hub, Central Delhi*
   - Corridor: *Delhi North-West Corridor* (or test Mumbai / Pune presets).
3. Browse rescue tasks along the commute:
   - Tasks display pickup dock, drop-off shelter, portions, deadline, and handling rules.
   - Check the box to bundle tasks into the trip.
4. Review the **Interactive Stop Order & Navigation Route**:
   - `[Origin] -> [Stop 1: DTU Canteen Pickup] -> [Stop 2: Robin Hood Army Shelter Drop-off] -> [Destination]`
   - Point out **"Open Route in Google Maps"**: SharePlate generates a single Google Maps directions URL with sequential waypoints and automatic waypoint partitioning (handling Google Maps limits of $\le 9$ intermediate waypoints per leg).
   - Point out that personal commute origin and destination are kept strictly separate from donation tasks.
5. Click **"Accept Route & Open Checklist"**.

### Step 6: Two-Party Verification Across Portals & Donor Rewards (3:00 – 3:35)
1. In Tab 2: **"2. Route Checklist & Verification"**:
   - Stop-by-stop checklist with unlocked dock instructions and contact numbers.
2. Demonstrate **Strict Two-Party Verification Engine**:
   - Point out: *Points are NEVER released merely because a volunteer accepts a route or clicks complete.*
   - **Step 1: Pickup Handover:** Volunteer initiates handover at the donor dock, generating a secure 4-digit code (e.g. `4821` with 15-minute expiration and 3-attempt lockout). The volunteer cannot self-confirm. Switch to **Donor** persona, enter the OTP, and click *"Verify & Release Food"*. Claim moves to *IN TRANSIT*. Points remain 0!
   - **Step 2: Delivery Verification:** Volunteer arrives at the recipient shelter and initiates delivery handoff. Switch to **Recipient** persona, enter the OTP with confirmed portion count, and click *"Verify Receipt & Release Rewards"*.
   - **Points Release:** Volunteer rewards points are released into their ledger (`50 base + 40x2 = 130 points`).
   - **Donor Rewards:** Switch to **Donor Dashboard** (`#/dashboard/donor`) &rarr; open **Donor Rewards Ledger** to show the donor also received points ($\min(200, 20 + 2 \times \text{portions})$) strictly upon verified physical delivery!
   - Show dispute capability: clicking *"Flag Delivery Dispute"* marks the task disputed and holds points at 0.
3. In Tab 3: **"3. Points & Rewards"**:
   - Review pending vs. released points counters.
   - Milestone progression: Bronze Courier -> Silver -> Gold Champion.
   - Transparent formula breakdown card (`min(150, 50 + 2 * portions)`).
   - Immutable audit ledger table.
   - Point out the clear disclosure: Amazon vouchers are an **illustrative future corporate partner concept**, not cash or redeemable today.

### Step 7: Live Impact Funnel & Defensible Environmental Offsets (3:35 – 4:00)
1. Navigate to **Impact** (`#/impact`).
2. Point out the **Demonstration Dataset Metrics** header: explicitly labeled as demo data to avoid confusing sample figures with real-world verified metrics.
3. Show the **Portion Distribution & Rescue Funnel**:
   - The delivered, reserved, and available portions conserve the exact total listed ($20\text{ delivered} + 25\text{ available} = 45\text{ listed}$).
   - The rescue completion rate updates dynamically.
4. Show the **Environmental Savings**:
   - Derived strictly from delivered portions using FAO standard meal weight (400g/portion) and UNEP food waste emissions factor (2.5 kg CO₂e / kg food avoided).
5. Conclude:
   - *"SharePlate demonstrates a practical, end-to-end food rescue workflow backed by a real Cloudinary media pipeline, an on-my-way commute rescue model, and tamper-resistant two-party verification."*

---

## 🛡️ Part 3: Dependable Fallback Plan (Zero-Panic Demo)

If anything unexpected occurs during a live presentation, use these instant fallback steps:

| Potential Issue | Immediate Fallback Action |
| :--- | :--- |
| **No Internet / Slow Network during upload** | Do not wait for a live file upload. Click one of the 3 preloaded evaluation presets: **"Fresh Biryani (Sample)"**, **"Roti & Sabzi (Sample)"**, or **"Bakery Loaves (Sample)"**. They load instantly via Cloudinary CDN or cached preview. |
| **Unset or Invalid Cloudinary Credentials** | The application automatically falls back to a labeled **local demo preview** (`URL.createObjectURL`). An informational badge confirms: *"Demo preview — local object URL"*. The listing still creates and progresses normally without throwing errors. |
| **Accidental Logout or Missing Session** | Navigate to `#/login`. Click any of the four **1-Click Quick Demo** persona cards (Donor, Recipient, Volunteer, Admin). You will be authenticated immediately into that role. |
| **Accidental State Corruption or Over-Claim Testing** | Click the browser **Refresh** button, or execute `npm run db:reset-demo` in your terminal to reseed the standard demo inventory. |

---

## ❓ Part 4: Likely Judge Questions & Honest, Defensible Answers

### Q1: Is the backend database actually deployed on GitHub Pages?
> **Honest Answer:**  
> *"No. The GitHub Pages deployment is a static Single Page Application hosting the React 18 + Vite frontend. It uses browser-local memory (`demoStore`) for demo state so anyone can evaluate the full workflow instantly without configuring servers or database accounts.*  
>  
> *However, our repository includes the complete production backend under `apps/api` (Node.js/Express with Zod validation, security middleware, and cryptographic upload signing) and `supabase/` (PostgreSQL schema with Row Level Security, `claim_donation_atomic`, and two-party verification stored procedures). We intentionally document this distinction clearly in our UI and documentation rather than claiming persistent cloud sync that isn't deployed."*

### Q2: Why is Cloudinary necessary in this product? What is the practical value?
> **Honest Answer:**  
> *"Visual condition is the single most important factor for an NGO deciding whether to send a volunteer across town to pick up surplus food. But commercial kitchen staff upload high-resolution photos straight from smartphone cameras (often 3–6 MB each).*  
>  
> *Cloudinary solves two critical operational problems:*  
> *1. **Mobile Bandwidth Optimization:** Cloudinary dynamically transcodes images to WebP (`f_auto`) and optimizes quality (`q_auto`), reducing payload sizes by up to 70–80% for field coordinators on low-bandwidth mobile connections.*  
> *2. **Consistent Layout Framing (`g_auto`):** Cloudinary's content-aware smart cropping automatically centers the food whether viewed as a 4:3 listing card, 16:9 banner, or 1:1 mobile thumbnail.*  
>  
> *In our hosted demo, uploads go directly to Cloudinary via an unsigned upload preset. In our production Express API, uploads are authenticated using server-issued SHA-256 signatures."*

### Q3: How do you handle food safety and liability? Does Cloudinary verify the food?
> **Honest Answer:**  
> *"No software algorithm or image recognition tool can certify that food is microbiologically safe to eat. We are very explicit about this:*  
> *1. **Cloudinary AI tags** are strictly for visual categorization and search filtering (e.g., 'Cooked Meal', 'Rice & Grains'). They do not certify hygiene or temperature.*  
> *2. **Donors certify** preparation timestamps, declare known allergens, and provide specific storage requirements (e.g., hot holding at 60°C+).*  
> *3. **Listings auto-expire** after the donor's pickup deadline to prevent claiming stale food.*  
> *4. **Recipients and volunteers must inspect** food freshness, aroma, and temperature at the physical handover before distributing it to the community."*

### Q4: How does Volunteer Trip Planning work? Is the routing real?
> **Honest Answer:**  
> *"We built the volunteer workflow around commute trip planning ('on-my-way food rescue'): volunteers enter their origin and destination, browse rescue tasks along that corridor, and view a sequential stop order.*  
>  
> *For real navigation, SharePlate generates a single Google Maps directions link that strings together all donor pickup and recipient delivery stops as sequential waypoints, ending at the volunteer's selected commute destination. If a trip exceeds Google Maps' URL parameter limit of 9 intermediate stops, our routing engine automatically partitions the trip into ordered route segments without dropping any stops. Personal origin and destination are kept strictly separate from donation tasks so personal travel can never advance claim status."*

### Q5: How do you prevent volunteers from gaming points? Why two-party verification?
> **Honest Answer:**  
> *"In many volunteer apps, runners can simply click 'Accepted' and 'Delivered' to farm reward points. In SharePlate, **points cannot be released by the volunteer alone**.*  
>  
> *We enforce a strict two-party verification state machine across separate authenticated accounts:*  
> *1. At pickup, the volunteer arrives and generates a 4-digit code (with 15-minute expiration and 3-attempt lockout). The donor kitchen verifies the food handover and enters the code from their own portal.*  
> *2. At delivery, the recipient NGO coordinator inspects the food, inputs the confirmed portions received, and enters the delivery code from their own portal.*  
> *3. Points release ONLY after both authenticated parties confirm. If portions are missing or food is damaged, the task is marked disputed and awards 0 points.*  
> *4. In addition to volunteer points (\(\min(150, 50 + 2 \times \text{portions})\)), verified deliveries also credit the **Donor Rewards Ledger** (\(\min(200, 20 + 2 \times \text{portions})\)), motivating commercial kitchens to donate reliably.*  
>  
> *In production, this is enforced by PostgreSQL stored procedures in `supabase/schema.sql`, not just frontend checks."*

### Q6: Can volunteers redeem Amazon vouchers for cash today?
> **Honest Answer:**  
> *"No. As clearly labeled on our dashboard, Amazon gift vouchers and fuel credits represent an **illustrative future corporate partner incentive concept**. SharePlate does not offer cash conversion or simulated gift card codes without an active commercial sponsor contract. Demo points and balances are demonstration metrics."*

### Q7: How do you calculate bandwidth savings? Are the percentages real?
> **Honest Answer:**  
> *"When a user uploads a live image file, our client-side utility `measureTransformedDelivery` fetches the delivered Cloudinary asset blob and calculates the exact percentage reduction against the original file's byte count. If the measurement fetch fails or if a preloaded sample asset is selected, we do not invent a fake number — we explicitly state that bandwidth savings are calculated only on live file uploads."*

### Q8: Are the impact metrics on your dashboard real-world community figures?
> **Honest Answer:**  
> *"No, they are calculated from our demo dataset to demonstrate our real-time impact math engine. We explicitly label them as 'Demonstration Dataset Metrics'.*  
>  
> *The calculation engine itself is completely real: a pure function in `impactMath.ts` processes all donation and claim records. It counts **only confirmed delivered portions** toward environmental savings, applying FAO standard portion weights (400g/meal) and UNEP food waste emissions factors (2.5 kg CO₂e avoided per kg of food rescued)."*
