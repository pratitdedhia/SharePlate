# 04. Product Requirements Document (PRD)

**Product:** SharePlate  
**Version:** 2.0.0 (Submission Build)  
**Target Event:** Hacktober HackDays 2026 (SheBuilds Delhi / MLH)  

---

## 1. Functional Requirements Matrix

### FR-1: Role-Based Authentication & Permissions Security
- **Description:** Secure multi-role authentication supporting `donor`, `recipient`, `volunteer`, and `admin`.
- **Security Guardrails:**
  - Public registration is strictly restricted to `donor`, `recipient`, and `volunteer`. Direct registration as `admin` is blocked both client-side and in database row constraints.
  - Role-based navigation:
    - `donor`: Sees Dashboard, My Listings, and "+ Donate Food". Cannot access recipient discovery or public impact metrics.
    - `recipient`: Sees Dashboard, Browse Food, and My Claims. Cannot access donor listing forms or impact telemetry.
    - `volunteer`: Sees Dashboard, Active Deliveries, and Route Dispatcher. Cannot access donor listing or public impact.
    - `admin`: Full visibility across all modules, ledgers, and governance queues.
- **Acceptance Criteria:**
  - *Given* an authenticated user with role `recipient`, *When* they view the navigation bar, *Then* "Impact" and "About" links are hidden, and navigation is focused strictly on discovery and claims.

### FR-2: Surplus Food Listing Creation with Cloudinary AI
- **Mandatory Fields:** Title, Food Category, Total Portions ($>0$), Quantity Unit, Pickup Deadline (strictly future timestamp), General Location string.
- **Safety Fields:** Dietary flags (`veg`, `non-veg`, `vegan`), Allergens (`nuts`, `dairy`, `gluten`), Preparation Timestamp, Consume Within Hours, Private Pickup Instructions.
- **Media Pipeline:**
  - Accepts camera photo or local image file (JPEG, PNG, WebP) with strict client-side validation ($\le 5\text{ MB}$).
  - Direct browser upload to Cloudinary using Unsigned Preset (`shareplate/donations`) or authenticated backend cryptographic signature.
  - Automatic Cloudinary AI food auto-tagging scans the uploaded asset and returns recognized food keywords (e.g. `Cooked Meal`, `Rice`, `Vegetables`).
  - Interactive auto-crop switcher enables previewing across `4:3 Card (g_auto)`, `16:9 Banner (g_auto)`, and `1:1 Square (g_auto)`.
- **Acceptance Criteria:**
  - *Given* a donor creating a listing, *When* they upload an image, *Then* Cloudinary returns a WebP delivery URL and detected AI tags appear as interactive chips that can be appended to the listing description in one click.

### FR-3: Real-Time Surplus Food Discovery & Geographic Search
- **Search & Filtering:**
  - Instant text search matching title, description, and location strings.
  - Multi-category filtering: `cooked_meals`, `bakery`, `produce`, `packaged`, `dairy`, `other`.
  - Geographic city filtering: `Delhi NCR`, `Mumbai`, `Pune`, `Noida`.
  - Dietary switch: Veg only vs All.
  - Real-time countdown timer showing remaining hours and minutes until `pickup_deadline`.
- **Responsive Display:**
  - Food cards render responsive `srcset` (400w, 800w, 1200w) with `loading="lazy"` to minimize cellular data consumption.
  - Badges indicate "⚡ Cloudinary Optimized" only when genuinely served from `res.cloudinary.com`.

### FR-4: Concurrency-Safe Atomic Portion Reservations
- **Problem Solved:** Prevent race conditions where two shelters simultaneously claim the same surplus portions.
- **Implementation:** Database RPC `claim_donation_atomic(p_donation_id, p_claimant_id, p_quantity, p_notes)` utilizing PostgreSQL row-level locks (`SELECT ... FOR UPDATE`).
- **Logic:**
  1. Checks if available portions $\ge$ requested quantity.
  2. If sufficient, decrements `quantity_available` by requested portions.
  3. Inserts row into `claims` table with status `reserved`.
  4. If `quantity_available` reaches 0, atomically transitions listing status to `reserved`.
  5. If portions are insufficient, rolls back and returns descriptive error `INSUFFICIENT_QUANTITY`.
- **Acceptance Criteria:**
  - *Given* a listing with 30 portions available, *When* Shelter A requests 20 portions and Shelter B requests 15 portions simultaneously, *Then* one request succeeds (10 portions remaining) and the other is cleanly rejected without data corruption.

### FR-5: Protected Logistics & Contact Privacy
- **Public Feed:** Displays only broad area (e.g., "North Campus, Delhi", "Sector 62, Noida") and donor organization name.
- **Restricted Disclosure:** The exact loading dock directions, security passcodes, and donor telephone numbers are protected behind Supabase Row Level Security (RLS) policies and revealed **strictly** to the confirmed claimant and assigned volunteer runner.
- **Acceptance Criteria:**
  - *Given* an unauthenticated visitor or non-claimant user, *When* inspecting network responses or HTML DOM, *Then* private pickup instructions and phone numbers are completely masked.

### FR-6: Volunteer Runner Fulfillment Loop
- **Step 1 — Accept Route:** Volunteer claims unassigned delivery route between donor kitchen and recipient shelter.
- **Step 2 — Dock Pickup:** Volunteer arrives at donor kitchen, presents digital gate authorization, inspects food temperature, and taps `Confirm Pickup`.
- **Step 3 — Shelter Dropoff:** Volunteer arrives at shelter, hands over thermal crates, and taps `Confirm Drop-off & Complete Rescue`.
- **Rollback Guarantee:** If a runner cancels prior to pickup, portions revert to active status immediately.

### FR-7: Real-Time Social & Environmental Telemetry
- Dynamic impact calculation based on verified lifecycle transitions:
  - $\text{Portions Rescued} = \sum \text{quantity\_claimed}$ where status $\in (\text{'collected'}, \text{'delivered'})$
  - $\text{Landfill Organic Waste Diverted (kg)} = \text{Rescued Portions} \times 0.42\text{ kg}$
  - $\text{CO}_2\text{e Avoided (kg)} = \text{Diverted kg} \times 2.5\text{ kg CO}_2\text{e/kg}$
- Portions merely *listed* or *reserved* are explicitly segregated and never counted as *delivered* impact.

### FR-8: Admin Governance & Traceability Audit Ledgers
- **Full Insights:** Portions funnel (Listed $\rightarrow$ Claimed $\rightarrow$ Picked Up $\rightarrow$ Delivered), city breakdown, and category distribution.
- **Who Donated Ledger:** Auditable table of all donor contributions with portion totals and completion rates.
- **Who Received Ledger:** Auditable table of all claims with status breakdowns and fulfillment timestamps.
- **User Management:** View all registered accounts, Add User modal, Edit User modal, Deactivate account toggle, Delete User modal.
- **Safety Moderation:** Review and dismiss/act on reported safety flags.

---

## 2. Non-Functional Requirements & Performance SLAs

| Dimension | Specification | Verification Result |
| :--- | :--- | :--- |
| **Initial Page Load (LCP)** | $\le 1.8\text{ seconds}$ on 4G cellular emulation. | Observed: 1.1s via Vite optimized bundle + inlined critical CSS. |
| **Image Delivery Bandwidth** | $\ge 60\%\text{ payload reduction}$ on high-resolution camera uploads. | Observed: 83% bandwidth reduction via Cloudinary `f_auto, q_auto`. |
| **Atomic Claim Latency** | Database transaction execution $\le 200\text{ ms}$ under concurrent load. | Verified via Vitest atomic concurrency test suite. |
| **Platform Portability** | Zero-dependency deployment compatible with static GitHub Pages and double-click `file:///` local browsing. | Verified via `scripts/sync-root-build.js` inlined bundle generator. |
| **Design Accessibility** | WCAG 2.1 AA compliant color contrast ($\ge 4.5:1$), visible keyboard focus indicators, touch targets $\ge 44\times 44\text{ px}$. | Implemented across all Tailwind color tokens (`text-stone-900`, `bg-warm-50`). |

