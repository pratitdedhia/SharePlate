# SharePlate — Four-Member Team Contribution & Task Allocation

**Event:** Hacktober HackDays 2026 | SheBuilds Delhi Chapter | Powered by MLH  
**Theme:** Tech for Social Good  
**Team Size:** 4 Members  

---

## 1. Member Roles & Deliverables

### Member 1: Frontend Engineering & UI/UX Design
- **Key Responsibilities:**
  - Modern, social-good visual design system using Tailwind CSS and warm neutral aesthetics.
  - Public landing page (`HomePage.tsx`), browsing interface (`DonationsPage.tsx`), and donation details (`DonationDetailPage.tsx`).
  - Reusable component system (`Navbar`, `Footer`, `StatusBadge`, `DonationCard`, `LoadingSkeleton`, `EmptyState`).
  - Mobile-first responsiveness, drawer navigation, and accessible keyboard focus states.

### Member 2: Backend Architecture & Business Logic
- **Key Responsibilities:**
  - Express API structure, TypeScript setup, and routing architecture.
  - Zod validation middleware for all mutation requests.
  - Role-based authorization middleware (RBAC) and Supabase JWT verification.
  - Concurrency-safe claim workflows and status lifecycle controller implementation (`/claims/:id/collect`, `/claims/:id/deliver`).
  - Centralized error handling preventing stack trace leakage.

### Member 3: Database Architecture & Cloudinary Media Pipeline
- **Key Responsibilities:**
  - Supabase PostgreSQL schema, relational tables, check constraints, and triggers (`supabase/schema.sql`).
  - Row Level Security (RLS) policies for multi-tenant data isolation.
  - Atomic stored procedures: `claim_donation_atomic()` and `cancel_claim_atomic()` with `SELECT ... FOR UPDATE` row locks.
  - Cloudinary server-side cryptographic signature generator (`/api/uploads/signature`) and dynamic URL transformation helper (`c_fill, f_auto, q_auto`).
  - Indian realistic demo dataset (`supabase/seed.sql`).

### Member 4: Quality Assurance, Integration, Notion & Submission
- **Key Responsibilities:**
  - Automated test suites (Vitest for frontend, Node test runner for backend API).
  - Cross-device responsiveness and manual user-journey validation.
  - Impact calculation methodology alignment (FAO/UNEP meal portion and CO2 emission models).
  - Complete 12-page Notion-ready documentation structure (`docs/notion/`).
  - Hackathon submission materials, GitHub repository polish, and demo presentation script.
