# SharePlate — 3-Minute Demo Presentation Script & Judge Q&A

**Event:** Hacktober HackDays 2026 (SheBuilds Delhi Chapter, Powered by MLH)  
**Theme:** Tech for Social Good  
**Mandatory Technology Stack:** Cloudinary  
**Live Deployed URL:** [https://pratitdedhia.github.io/SharePlate/](https://pratitdedhia.github.io/SharePlate/)  

---

## Part 1: 3-Minute Live Demo Flow

### Timing Breakdown
- **0:00 – 0:30 (Mission & Live Problem Context):**
  - Open the deployed app at `https://pratitdedhia.github.io/SharePlate/`.
  - Point out the hero title: *"Rescue Food. Reduce Waste. Feed Communities."*
  - Explain: *"Every day in Delhi NCR and across India, college canteens and caterers throw away untouched meals while shelters face budget shortages. SharePlate bridges this window within minutes."*
  - Show the **Live Trust Metrics** on the landing page (Delivered portions, active participants, and CO₂e emissions avoided).
  - Point out the persistent demo notice in the footer/dashboard explaining the architecture.

### Step 1: Donor Posts Surplus Food with Cloudinary (0:30 – 1:15)
- Click **"Portal Login"** and use the **1-Click Quick Demo** button: **"Continue as Donor (DTU Canteen - Priya Sharma)"**.
- Redirects to `/dashboard/donor`. Show the donor's dashboard with active batches and metrics.
- Click **"+ Post Food Donation"** (`/donations/new`).
- **Show Cloudinary in Action:**
  - Drag and drop or browse a photo (or select a seed preset).
  - Point to the live progress bar: *"Our frontend connects directly to Cloudinary using an unsigned upload preset on static hosting, or via server-signed cryptographic SHA signatures when running with our Express API."*
  - Show the measured optimization box: *"Notice that the client measures actual delivered payload against the original photo — achieving 70%+ bandwidth savings with automatic WebP transcoding (`f_auto, q_auto`)."*
- Enter food safety specifications:
  - Title: *Fresh Vegetable Pulao & Raita*
  - Category: *Cooked Meals*
  - Quantity: *40 portions*
  - Dietary: *Vegetarian*
  - Prepared at: *Today, 12:30 PM*
  - Consume within: *5 hours*
  - Storage: *Keep insulated in thermal container above 60°C*
  - Pickup deadline: *4 hours from now*
- Click **"Publish Surplus Food Donation"**.
- The listing appears immediately in the active inventory.

### Step 2: Recipient NGO Discovers & Claims Portions (1:15 – 2:00)
- Sign out or use the 1-click persona switcher on `/login` to sign in as **Recipient NGO (Robin Hood Army Delhi - Rajesh Kumar)**.
- Redirects to `/dashboard/recipient`.
- Browse the live inventory on `/donations`. Find the newly listed *Vegetable Pulao*.
- Click **"View Details & Reserve"** (`/donations/:id`).
- Point out:
  - Visual verification with Cloudinary-optimized responsive image (`CloudinaryImage.tsx`).
  - Transparent food safety info (prepared at, consume within, storage guidance).
  - Private pickup address and phone number are masked until reservation.
- Click **"Reserve Food Portions"**:
  - Request *25 portions* (with note: *"Reserved for evening shelter distribution near Sector 17"*).
  - Confirm reservation.
  - Notice the available count drops from 40 to 15 instantly!

### Step 3: Volunteer Coordinates Pickup & Delivery (2:00 – 2:30)
- Sign in as **Volunteer Courier (Ananya Sen - Youth For Food Relief)**.
- Redirects to `/dashboard/volunteer` (Active Routes & Dispatch board).
- Navigate to **"My Claims / Active Routes"** (`/my-claims`).
- Show that full donor security instructions and contact phone number are now revealed to the claimant.
- Advance the lifecycle:
  - Click **"Mark Picked Up"** → status transitions to `collected`.
  - Click **"Confirm Delivery"** → status transitions to `delivered`.

### Step 4: Live Impact Verification (2:30 – 3:00)
- Navigate to **"Impact"** (`/impact`).
- Show the **Portion Distribution & Rescue Funnel**:
  - The delivered portions, reserved portions, and available portions conserve the exact total listed ($25 + \text{existing} = \text{delivered}$).
  - Rescue completion rate and defensible CO₂e avoided update dynamically based on FAO/UNEP factors.
- Conclude: *"SharePlate proves that with the Cloudinary media pipeline and concurrency-safe reservation flows, surplus food rescue can be fast, safe, and transparent."*

---

## Part 2: 6 Judge Questions & Honest Answers

### Q1: Is the backend API actually deployed on your GitHub Pages link?
**Honest Answer:**
> *"No, the GitHub Pages deployment hosts the React 18 + Vite frontend as a static Single Page Application. In this demo deployment, interactive actions update state in browser memory (`demoStore`), and Cloudinary uploads use an unsigned upload preset directly from the client.  
> However, the complete production backend is fully built in this repository under `apps/api` (Node/Express with Zod validation and cryptographic upload signing) and `supabase/` (PostgreSQL schema with Row Level Security and the `claim_donation_atomic` stored procedure). We intentionally transparently document this in our UI and docs rather than faking live cloud sync."*

### Q2: How does SharePlate satisfy the Cloudinary tech stack requirement?
**Honest Answer:**
> *"Cloudinary is our core media pipeline for visual food safety verification:  
> 1. On our live GitHub Pages demo, donors upload directly to Cloudinary using an **unsigned upload preset** with tags (`shareplate, food-donation`) and context metadata.  
> 2. On our Express API path, we implement **cryptographic SHA-256 signatures** via `/api/uploads/signature` to enforce user-scoped directory isolation.  
> 3. All images are rendered through `CloudinaryImage.tsx` utilizing dynamic `c_fill, g_auto, f_auto, q_auto` transformations and responsive `srcset` breakpoints (400w, 800w, 1200w).  
> 4. We measure real delivered payload size via `measureTransformedDelivery` against original file size rather than displaying hardcoded claims."*

### Q3: How do you prevent double-claiming or overselling surplus food?
**Honest Answer:**
> *"In our production PostgreSQL architecture (`supabase/schema.sql`), the `claim_donation_atomic` RPC function executes `SELECT ... FOR UPDATE` row-level exclusive locks. If two NGOs attempt to claim portions concurrently, the database serializes the transactions, deducts portions atomically, and aborts if available portions are insufficient.  
> In our deployed demo store (`mockData.ts`), we mirrored this invariant: claims check available portions, prevent donors from self-claiming, reject claims exceeding available inventory, and reject any listing past its pickup deadline."*

### Q4: How does SharePlate handle food safety and liability?
**Honest Answer:**
> *"Food rescue must never compromise beneficiary health. Rather than claiming to 'certify' food safety, SharePlate enforces strict transparency:  
> 1. Donors must provide preparation timestamps (`prepared_at`), a maximum consume-within window in hours, and storage holding notes (e.g. thermal holding at 60°C+).  
> 2. Listings automatically expire once the pickup deadline passes, and the system prohibits claiming expired food.  
> 3. Recipient NGOs verify temperature and organoleptic properties upon physical handover."*

### Q5: How do your environmental impact metrics work?
**Honest Answer:**
> *"Our impact metrics are derived from a single pure function (`calculateImpactMetrics` in `impactMath.ts`) over donation and claim records. We count **only delivered portions** toward environmental offset. We calculate food mass using the FAO average portion benchmark of 400g per meal, and apply the UNEP food waste emissions factor of 2.5 kg CO₂e saved per kg of food rescued from landfills."*

### Q6: What are the biggest real-world limitations and next steps?
**Honest Answer:**
> *"The current prototype requires three key additions for production field deployment:  
> 1. Real SMS/WhatsApp notifications via Twilio or WhatsApp Business API so shelter coordinators receive instant alerts without watching a web screen.  
> 2. NGO credential verification (validating FCRA / 80G tax status or government registration before enabling claims).  
> 3. Multilingual voice and interface support in regional languages (Hindi, Marathi, Punjabi) for canteen kitchen staff."*
