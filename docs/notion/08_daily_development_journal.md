# 08. Daily Development Journal & Engineering Log

**Hacktober HackDays 2026 | SheBuilds Delhi Chapter**  

---

## Day 1 — Foundation & Core Scaffolding
- **Tasks Completed:**
  - Workspace inspection: identified empty workspace and provisioned Node.js LTS v24 and npm v11.
  - Initialized monorepo structure with `@shareplate/web` (Vite, React 18, Tailwind CSS) and `@shareplate/api` (Express, TypeScript, Zod).
  - Drafted comprehensive PostgreSQL schema (`supabase/schema.sql`) with tables, check constraints, RLS policies, and triggers.
  - Implemented Cloudinary server signature generator (`POST /api/uploads/signature`) and dynamic image helper.
  - Scaffolding of core UI: Navbar, Footer, StatusBadge, and Home landing page with live metrics strip.
- **Bugs Encountered & Fixes:**
  - *Bug:* TypeScript compilation initially failed with `Property 'env' does not exist on type 'ImportMeta'`.
  - *Fix:* Created `src/vite-env.d.ts` declaring Vite client environment types.
- **Lessons Learned:** Isolating Cloudinary signing to the backend prevents leaking secrets while avoiding server disk bottlenecks.

---

## Day 2 — Core Lifecycle & Business Logic Implementation
- **Tasks Completed:**
  - Built atomic PostgreSQL RPC functions: `claim_donation_atomic` and `cancel_claim_atomic` using `SELECT ... FOR UPDATE` locks.
  - Implemented full donation creation form (`CreateDonationPage.tsx`) with Cloudinary image upload, progress bar, allergen tags, and countdown validation.
  - Developed Browse & Filter experience (`DonationsPage.tsx`) with real-time text search, category pills, and city selector.
  - Built single donation detail view (`DonationDetailPage.tsx`) with modal for reserving specific portion amounts.
  - Implemented recipient claim tracker (`MyClaimsPage.tsx`) with three-step status lifecycle progression: `Claimed` → `Collected` → `Delivered`.
- **Bugs Encountered & Fixes:**
  - *Bug:* Cancelling a claim previously failed to restore available quantity if the donation was already marked `reserved`.
  - *Fix:* Enhanced `cancel_claim_atomic()` to check if the deadline is still in the future and flip status back to `available`.
- **Lessons Learned:** Multi-tenant privacy requires masking sensitive pickup instructions in public queries while preserving access for authorized claimants.

---

## Day 3 — Testing, Polish & Hackathon Submission Readiness
- **Tasks Completed:**
  - Built role-aware Dashboard (`DashboardPage.tsx`) with custom KPI cards for Donors, NGOs, Volunteers, and Admins.
  - Implemented live Impact dashboard (`ImpactPage.tsx`) with defensible CO₂e avoided calculation based on FAO/UNEP benchmarks.
  - Created safety moderation view (`AdminPage.tsx`) for reviewing reported food listings.
  - Created interactive evaluation switcher allowing hackathon judges to test any role in one click.
  - Executed automated unit tests (`vitest run` on frontend, `node --test` on API) with 100% passing results.
  - Executed production builds (`vite build` in 3.35s, `tsc` with 0 errors).
  - Authored comprehensive 12-page Notion documentation suite and GitHub README.
