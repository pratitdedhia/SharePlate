# 10. Team Contribution Board

**Team Size:** 4 Members  
**Track:** Tech for Social Good | Hacktober HackDays 2026  

---

## 1. Member Contribution Matrix

### Member 1: Frontend Engineering & UI/UX
- **Scope:** Layouts, Design System, Browsing & Listing UI.
- **Contributions:**
  - Designed the warm off-white and forest green aesthetic tokens.
  - Implemented `Navbar`, `Footer`, `StatusBadge`, `DonationCard`, and `DonationFilters`.
  - Built `HomePage.tsx`, `DonationsPage.tsx`, and `DonationDetailPage.tsx`.
  - Implemented mobile responsive drawer and focus states.

### Member 2: Backend Architecture & Business Logic
- **Scope:** Express REST API, Authentication, Validation.
- **Contributions:**
  - Configured Express application, Helmet security headers, and CORS rules.
  - Implemented Zod schema validation middleware for all mutation routes.
  - Built JWT authentication and RBAC middleware.
  - Developed claim lifecycle endpoints: `/claims/mine`, `/claims/:id/collect`, and `/claims/:id/deliver`.

### Member 3: Database Architecture & Cloudinary Media Pipeline
- **Scope:** Supabase PostgreSQL Schema, RLS, Cloudinary Integration.
- **Contributions:**
  - Wrote relational schema with constraints and updated_at triggers.
  - Implemented atomic stored procedures `claim_donation_atomic()` and `cancel_claim_atomic()` with row-level locks.
  - Implemented server-side Cloudinary upload signature generator (`/api/uploads/signature`).
  - Authored realistic Indian demo dataset (`supabase/seed.sql`).

### Member 4: Quality Assurance, Integration, Notion & Submission
- **Scope:** Testing, Environmental Methodology, Documentation.
- **Contributions:**
  - Automated test setup: Vitest for frontend, Node test runner for backend.
  - Aligned environmental calculations with FAO meal portions (0.4 kg) and UNEP emission factors (2.5 kg CO₂e/kg).
  - Authored the comprehensive 12-page Notion-ready documentation workspace.
  - Prepared final demo walkthrough script and hackathon submission readiness checklist.
