# 08. Daily Development Journal & Engineering Log

**Event:** Hacktober HackDays 2026 | SheBuilds Delhi Chapter (MLH)  
**Track:** Tech for Social Good  
**Repository:** [pratitdedhia/SharePlate](https://github.com/pratitdedhia/SharePlate)  

---

## Day 1 — Architectural Scaffolding & Foundation
- **Objectives:** Initialize monorepo, establish strict typing, set up database schemas, and integrate Cloudinary base infrastructure.
- **Engineering Milestones:**
  - Initialized `@shareplate/web` (React 18 + Vite + Tailwind CSS + TypeScript) and `@shareplate/api` (Node.js 24 + Express + TypeScript + Zod).
  - Drafted comprehensive PostgreSQL relational schema (`supabase/schema.sql`) covering `profiles`, `donations`, `claims`, `reports`, and `activity_logs`.
  - Built Express backend signature endpoint (`POST /api/uploads/signature`) using `cloudinary.utils.api_sign_request` to enforce authenticated, server-scoped uploads without leaking `CLOUDINARY_API_SECRET`.
  - Built core responsive design system with a warm, social-good palette (`forest-950`, `warm-50`, `amber-500`, `emerald-700`).
- **Bugs Encountered & Fixes:**
  - *Bug:* Vite threw `Property 'env' does not exist on type 'ImportMeta'`.
  - *Fix:* Added `apps/web/src/vite-env.d.ts` with explicit `ImportMetaEnv` interface.
- **Architectural Lesson:** Offloading media uploads directly to Cloudinary prevents server memory spikes when canteens upload multiple 5MB photos during lunch wrap-up.

---

## Day 2 — Atomic Concurrency & Core Business Logic
- **Objectives:** Prevent race conditions in food reservation and implement donor listing and discovery workflows.
- **Engineering Milestones:**
  - Engineered `claim_donation_atomic` PostgreSQL stored procedure using `SELECT ... FOR UPDATE` row locks to prevent simultaneous double-booking of meal batches.
  - Built `cancel_claim_atomic` to automatically return unclaimed portions to the active surplus pool if a shelter cancels before pickup.
  - Implemented `CreateDonationPage.tsx` with dynamic countdown deadline validation, FSSAI hygiene checklists, and Cloudinary upload progress.
  - Built `BrowseFoodPage.tsx` with instant multi-facet filtering (Category, City, Veg/All, Status).
  - Implemented multi-step claim state machine: `Reserved` $\rightarrow$ `Collected` $\rightarrow$ `Delivered`.
- **Bugs Encountered & Fixes:**
  - *Bug:* Claim cancellations left listings stuck in `reserved` status even when portions became available again.
  - *Fix:* Added conditional status flip inside PostgreSQL: `CASE WHEN quantity_available > 0 AND pickup_deadline > now() THEN 'available' ELSE status END`.
- **Architectural Lesson:** In high-speed urban food rescue, atomic database locks are mandatory; client-side optimistic UI alone leads to stranded volunteer drivers.

---

## Day 3 — Impact Math, Dashboards & Automated Testing
- **Objectives:** Build role-aware dashboards, implement defensible environmental impact math, and create automated test suites.
- **Engineering Milestones:**
  - Engineered `impactMath.ts` calculating diverted landfill weight ($0.42\text{ kg/meal}$) and avoided carbon emissions ($2.5\text{ kg } CO_2e\text{ per kg food waste}$) using FAO/UNEP lifecycle benchmarks.
  - Segregated metrics so that only *delivered* and *collected* claims contribute to carbon reduction; listed or reserved portions are tracked separately.
  - Created role-based dashboard cards tailored to Donors, NGOs, and Volunteers.
  - Authored automated test suites: 19 unit tests for authentication, 6 for claim flows, 4 for impact mathematics, and 5 for upload fallbacks (36 frontend tests via Vitest, 2 backend tests via Node test runner).
- **Bugs Encountered & Fixes:**
  - *Bug:* Impact metrics previously counted `reserved` claims as diverted food, inflating emissions avoided prior to physical delivery.
  - *Fix:* Enforced strict SQL filter `WHERE status IN ('collected', 'delivered')`.
- **Architectural Lesson:** Transparency in social impact metrics builds donor trust; never inflate environmental claims.

---

## Day 4 — Deployment Architecture, Root Inlining & Navigation Overhaul
- **Objectives:** Ensure zero-friction evaluation on GitHub Pages and local `file:///` viewing, and enforce strict role boundaries.
- **Engineering Milestones:**
  - Solved GitHub Pages SPA routing by transitioning from `BrowserRouter` to `HashRouter` (`/#/browse`), eliminating 404 errors on deep reloads.
  - Engineered custom build script [scripts/sync-root-build.js](file:///c:/Users/dedhi/OneDrive/Desktop/Pratit/Hackathon/Hacktober%20HackDays/scripts/sync-root-build.js) to compile and inline the entire React application directly into root [index.html](file:///c:/Users/dedhi/OneDrive/Desktop/Pratit/Hackathon/Hacktober%20HackDays/index.html).
  - Overhauled navigation permissions across roles:
    - `donor`: Clutter-free view (Dashboard, My Listings, + Donate Food). Hidden from Browse Food and Impact.
    - `recipient`: Discovery view (Dashboard, Browse Food, My Claims). Hidden from Impact.
    - `volunteer`: Logistics runner view (Dashboard, Active Deliveries).
    - `admin`: Full oversight.
  - Expanded `VolunteerDashboard.tsx` with a clear 3-step runner loop: Accept Route $\rightarrow$ Dock Pickup with PIN unlock $\rightarrow$ Deliver to Shelter.
  - Built comprehensive `AdminDashboard.tsx` with 5 tabs: Full Insights & Graphs, Who Donated ledger, Who Received distribution ledger, User Account Management (Add, Edit, Delete, Deactivate), and Safety Reports queue.
- **Critical Bug Encountered & Fix:**
  - *Bug:* Double-clicking the inlined `index.html` under `file:///` yielded a blank white screen. Browser console reported `Uncaught TypeError: Cannot read properties of undefined`.
  - *Root Cause Analysis:* In `sync-root-build.js`, `html.replace('<script ...>', inlinedJs)` was called with a raw replacement string. In JavaScript, `String.prototype.replace(regex, string)` treats `$&` and `$$` as special substitution tokens. Because minified React 18 uses `$$typeof: Symbol(react.element)`, the replacement engine corrupted React's internal element identifiers!
  - *Fix:* Replaced with a safe callback function: `html.replace(regex, () => inlinedContent)`. React booted cleanly across all protocols.
- **Architectural Lesson:** Never trust regex replacement on minified JavaScript bundles without function wrappers.

---

## Day 5 — Advanced Cloudinary Transformations & Final Polish
- **Objectives:** Implement advanced Cloudinary auto-cropping, AI food tagging, format optimization, and complete documentation.
- **Engineering Milestones:**
  - Enhanced `apps/web/src/lib/cloudinary.ts` and `apps/web/src/services/uploads.ts` with `getAspectRatioPreviews` and `extractAIFoodTags`.
  - Upgraded `ImageUploader.tsx`:
    - **Smart Crop Switcher (`g_auto`):** Interactive switcher between `4:3 Card (800×600)`, `16:9 Banner (1200×675)`, and `1:1 Square (400×400)` demonstrating Cloudinary's content-aware focal centering.
    - **AI Food Tagging Assistant:** Automatic extraction of AI food tags (e.g. `Vegetable Biryani`, `Cooked Meal`, `Fresh Produce`) rendered as interactive chips that donors can copy or append to descriptions in one click.
    - **Optimization Badges & Measured Telemetry:** Live badges for `⚡ f_auto (WebP)`, `🎯 q_auto`, and `📐 g_auto`, accompanied by real-time bandwidth savings comparisons measured via `measureTransformedDelivery`.
  - Synchronized Express backend signature generator (`apps/api/src/config/cloudinary.ts`) to sign eager responsive derivatives and tags.
  - Drafted comprehensive 13-document Notion suite documenting the complete problem space, architecture, database schemas, and Cloudinary pipelines.
  - Executed end-to-end verification: 38/38 tests passing, production bundle built in 7.21s and synced to root.

