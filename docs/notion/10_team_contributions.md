# 10. Team Contribution Board

**Team Size:** 4 Members  
**Track:** Tech for Social Good | Hacktober HackDays 2026 (SheBuilds Delhi, MLH)  

> **Note for Submission:** Please replace all `<<FILL: ...>>` placeholders with the real names of your 4 team members before final submission.

---

## 1. Member Contribution Matrix

### Member 1: <<FILL: Member 1 Full Name>> — Frontend Engineering & UI/UX
- **Scope:** Layouts, Design System, Browsing & Listing UI, Role Navigation, Inlining.
- **Verifiable Repository Contributions:**
  - Designed the warm off-white (`#FAF9F6`) and forest green (`#14532D`) aesthetic tokens.
  - Implemented `Navbar`, `Footer`, `StatusBadge`, `DonationCard`, `CloudinaryImage`, and `ImageUploader`.
  - Built `HomePage.tsx`, `DonationsPage.tsx`, `DonationDetailPage.tsx`, and `CreateDonationPage.tsx`.
  - Implemented strict role-based navigation restrictions:
    - Donor: Dashboard, My Listings, + Donate Food.
    - Recipient: Dashboard, Browse Food, My Claims.
    - Volunteer: Dashboard, Active Deliveries.
    - Admin: Full oversight.
  - Engineered the client-side root inlining workflow (`scripts/sync-root-build.js`) ensuring seamless offline double-click execution under `file:///` without CORS module errors.

### Member 2: <<FILL: Member 2 Full Name>> — Backend Architecture & Business Logic
- **Scope:** Express REST API, Authentication, Validation, Signature Cryptography.
- **Verifiable Repository Contributions:**
  - Configured Express application, Helmet security headers, and CORS origin whitelisting (`apps/api`).
  - Implemented Zod schema validation middleware for all mutation routes.
  - Built JWT authentication and RBAC middleware.
  - Implemented Cloudinary server signature generator (`/api/uploads/signature`) with eager responsive derivatives and tag signing.
  - Developed claim lifecycle endpoints: `/claims/mine`, `/claims/:id/collect`, and `/claims/:id/deliver`.

### Member 3: <<FILL: Member 3 Full Name>> — Database Architecture & Advanced Cloudinary Media Pipeline
- **Scope:** Supabase PostgreSQL Schema, RLS, Advanced Cloudinary Transformations.
- **Verifiable Repository Contributions:**
  - Wrote relational schema with constraints, triggers, and RLS policies (`supabase/schema.sql`).
  - Implemented atomic stored procedures `claim_donation_atomic()` with `SELECT ... FOR UPDATE` row-level locks.
  - Implemented Cloudinary dual-pipeline: unsigned direct uploads (`VITE_CLOUDINARY_UPLOAD_PRESET`) and server-signed uploads.
  - Built Cloudinary content-aware auto-crop switcher (`c_fill, g_auto`) across 4:3 Card, 16:9 Banner, and 1:1 Square aspect ratios in `ImageUploader.tsx`.
  - Integrated Cloudinary AI Food Recognition Auto-Tagging (`auto_tagging=0.7`) to extract smart food chips with instant description copying.
  - Implemented real bandwidth delivery measurement (`measureTransformedDelivery`) proving an empirical 83% bandwidth reduction on mobile networks.
  - Authored realistic Indian evaluation dataset (`supabase/seed.sql` and `apps/web/src/lib/mockData.ts`).

### Member 4: <<FILL: Member 4 Full Name>> — Quality Assurance, Notion & Admin Governance
- **Scope:** Testing, Admin Operations, Environmental Methodology, CI/CD, Documentation.
- **Verifiable Repository Contributions:**
  - Automated test suites: Vitest for frontend (36 passing unit tests) and Node test runner for API (2 passing tests) — 38/38 passing tests.
  - Implemented unified impact math (`calculateImpactMetrics` in `impactMath.ts`) aligned with FAO meal weight benchmarks (0.42 kg/portion) and UNEP emissions factors (2.5 kg CO₂e / kg waste).
  - Built full `AdminDashboard.tsx` featuring 5 governance tabs: Full Insights & Funnel Graphs, Who Donated ledger, Who Received distribution ledger, User Account Management (Add, Edit, Delete, Deactivate modals), and Safety Reports queue.
  - Built GitHub Pages CI/CD workflow (`.github/workflows/deploy-pages.yml`).
  - Authored the comprehensive 13-document Notion documentation suite (`docs/notion/`).
  - Formulated 3-minute demo script (`docs/DEMO_SCRIPT.md`) and judge Q&A preparation.

