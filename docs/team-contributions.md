# SharePlate — Four-Member Team Contribution & Task Allocation

**Event:** Hacktober HackDays 2026 | SheBuilds Delhi Chapter | Powered by MLH  
**Theme:** Tech for Social Good  
**Team Size:** 4 Members  

> ⚠️ **Action Item for Submitter:** Replace the bracketed names below with your team's real member names prior to submission.

---

## 1. Member Roles & Verifiable Deliverables

### Member 1: [Team Member 1 — Full Name] — Frontend Engineering & UI/UX Design
- **Verified Code Contributions in Repository:**
  - Modern, social-good visual design system using Tailwind CSS and warm neutral aesthetics (`apps/web/src/index.css`, `tailwind.config.js`).
  - Core interfaces: Landing page (`HomePage.tsx`), inventory feed (`DonationsPage.tsx`), details view (`DonationDetailPage.tsx`), and donation form (`CreateDonationPage.tsx`).
  - Reusable component system (`Navbar`, `Footer`, `StatusBadge`, `DonationCard`, `CloudinaryImage`, `LoadingSkeleton`, `EmptyState`, `ConfirmDialog`).
  - Mobile responsiveness (verified down to 360px), accessible form labels, and keyboard-friendly modal interactions.

### Member 2: [Team Member 2 — Full Name] — Backend Architecture & Business Logic
- **Verified Code Contributions in Repository:**
  - Express API structure, TypeScript setup, and routing architecture (`apps/api/src/server.ts`, `apps/api/src/routes/`).
  - Zod validation middleware for all mutation requests (`apps/api/src/middleware/validation.ts`).
  - Role-based authorization middleware (RBAC) and Supabase JWT token verification (`apps/api/src/middleware/auth.ts`).
  - Concurrency-safe claim workflows and status lifecycle controller implementation (`/claims/:id/collect`, `/claims/:id/deliver`).
  - API health test suite (`apps/api/tests/health.test.js`).

### Member 3: [Team Member 3 — Full Name] — Database Architecture & Cloudinary Media Pipeline
- **Verified Code Contributions in Repository:**
  - Supabase PostgreSQL schema, relational tables, check constraints, and triggers (`supabase/schema.sql`).
  - Multi-tenant Row Level Security (RLS) policies isolating donor, recipient, and volunteer records.
  - Concurrency-safe atomic RPC functions: `claim_donation_atomic()` with `SELECT ... FOR UPDATE` row locks.
  - Cloudinary pipeline: Direct unsigned upload preset integration for static deployment (`apps/web/src/lib/cloudinary.ts`), server-side cryptographic signature endpoint (`apps/api/src/routes/uploads.ts`), dynamic responsive transforms (`f_auto, q_auto, c_fill, g_auto`), and real delivered bytes measurement (`measureTransformedDelivery`).
  - Realistic seed dataset (`supabase/seed.sql` and `apps/web/src/lib/mockData.ts`).

### Member 4: [Team Member 4 — Full Name] — Quality Assurance, Notion & Submission
- **Verified Code Contributions in Repository:**
  - Automated test suites: Vitest for web (`App.test.tsx`, `impactMath.test.ts`, `claimFlow.test.ts`, `uploadsFallback.test.ts`, `auth.test.ts`) and Node test runner for API.
  - Defensible impact methodology: single source of truth (`calculateImpactMetrics` in `impactMath.ts`) using FAO 400g meal averages and UNEP 2.5 kg CO₂e/kg emission factors.
  - GitHub Pages CI/CD workflow (`.github/workflows/deploy-pages.yml`) deploying `apps/web` with repository variables.
  - Complete structured Notion documentation workspace (`docs/notion/*.md`).
  - 3-Minute Demo walkthrough script (`docs/DEMO_SCRIPT.md`) and judge Q&A preparation.
