# SharePlate — Rescue Food. Reduce Waste. Feed Communities.

[![Hacktober HackDays 2026](https://img.shields.io/badge/Event-Hacktober_HackDays_2026-15803d?style=for-the-badge)](https://shebuilds.dev)
[![Track](https://img.shields.io/badge/Track-Tech_for_Social_Good-047857?style=for-the-badge)]()
[![Powered by](https://img.shields.io/badge/Powered_by-MLH-E11D48?style=for-the-badge)](https://mlh.io)
[![Cloudinary](https://img.shields.io/badge/Media-Cloudinary_Real_Pipeline-3B82F6?style=for-the-badge)](https://cloudinary.com)
[![Supabase](https://img.shields.io/badge/Database-Supabase_PostgreSQL-10B981?style=for-the-badge)](https://supabase.com)
[![Deploy Target](https://img.shields.io/badge/Deploy-GitHub_Pages-22C55E?style=for-the-badge)](https://pratitdedhia.github.io/SharePlate/)

> 🌐 **Live Deployed Demo:** [https://pratitdedhia.github.io/SharePlate/](https://pratitdedhia.github.io/SharePlate/)  
> 📖 **Project Journey & Hackathon Submission:** [Notion Documentation](<<FILL: https://your-notion-page-url>>)  
> 📂 **GitHub Repository:** [https://github.com/pratitdedhia/SharePlate](https://github.com/pratitdedhia/SharePlate)

**SharePlate** is a full-stack, community-driven food rescue web application built for **Hacktober HackDays 2026** (organized by the SheBuilds Delhi Chapter and powered by Major League Hacking) under the **Tech for Social Good** track.

SharePlate bridges the critical communication gap between high-volume commercial food institutions (university canteens, banquet caterers, corporate cafeterias, and bakeries) and local community organizations (NGOs, community kitchens, shelter coordinators, and volunteer runners) to redistribute wholesome surplus food before it spoils.

---

## 🏛️ Deployed Demo vs. Production Architecture Notice

To provide instant, zero-friction evaluation for hackathon judges without requiring cloud credentials or infrastructure deployment:
- **Live Deployed Web App (`apps/web` on GitHub Pages):** Operates with `VITE_DEMO_MODE=true` using an in-browser transactional store (`demoStore`). It features a real, direct-to-Cloudinary image upload pipeline using unsigned upload presets, responsive image delivery (`srcset` at 400w/800w/1200w), food safety controls, and real measured bandwidth savings.
- **In-Repo Production Architecture (`apps/api` + `supabase/`):** A complete Node.js/Express REST API and PostgreSQL database schema with Row Level Security (RLS) policies, cryptographic SHA-based upload signature endpoints (`/api/uploads/signature`), and concurrency-safe atomic stored procedures (`claim_donation_atomic`).

---

## 📸 Overview & Key Features

- **🔐 Role-Based Food Rescue Access:** Professional authentication flows with session persistence, inline error handling, and role-based redirects.
- **⚡ 1-Click Quick Demo Access:** Instant evaluation buttons for Judges on `/login` to continue immediately as Donor, Recipient, Volunteer, or Admin with seeded personas.
- **🛡️ Strict Role-Based Dashboards & RBAC:** Dedicated, purpose-built dashboards for all 4 roles (`/dashboard/donor`, `/dashboard/recipient`, `/dashboard/volunteer`, `/dashboard/admin`), protected against unauthorized cross-role navigation via `RoleGuard`.
- **📋 Food Safety & Expiration Controls:** Prepared-at timestamps, consume-within hours, storage instructions, and veg/non-veg tags. Donations past pickup deadlines are automatically greyed out and protected against claims.
- **📸 Real Cloudinary Pipeline:**
  - Direct unsigned upload to Cloudinary via configured upload preset with client validation (JPEG/PNG/WebP, max 5 MB).
  - Server-signed upload endpoint ready when Express runs.
  - Dynamic transformations: `c_fill, g_auto, f_auto, q_auto`, responsive `srcset` (400w, 800w, 1200w), and `loading="lazy"`.
  - Real bandwidth savings measurement comparing original file size against the delivered transformed WebP blob.
  - Verified badges displayed strictly on images actually served from `res.cloudinary.com`.
- **🔒 Over-Claim & Expiration Protection:** In the deployed demo, `demoStore` prevents over-claiming and claiming expired batches. In the production backend, PostgreSQL stored procedures (`claim_donation_atomic` with `SELECT ... FOR UPDATE`) guarantee ACID concurrency safety.
- **🛡️ Privacy-Preserving Logistics:** Sensitive loading-dock access instructions and personal donor phone numbers are masked in public queries and revealed strictly to confirmed claimants.
- **📊 Unified Impact Math:** A single pure calculation engine (`apps/web/src/lib/impactMath.ts`) derives hero statistics, impact charts, and rescue rates (`delivered / listed * 100`). The funnel never contradicts the metrics.

---

## 🛠️ Technology Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS | Modular components, HashRouter for Pages compatibility, Rollup production bundle |
| **Media Cloud** | Cloudinary | Direct client upload preset, server signatures, auto-format (`f_auto`), smart crop (`g_auto`) |
| **Production Backend** | Node.js 24 LTS, Express, TypeScript | REST API, Zod schema validation, Helmet security headers, CORS |
| **Production Database** | PostgreSQL 15+ (Supabase) | Multi-tenant Row Level Security (RLS), atomic stored procedures (`claim_donation_atomic`) |
| **Testing** | Vitest, Node.js Test Runner | 36 frontend tests (impact math, claim flows, upload fallback), 2 backend tests |
| **Documentation** | Notion (Mandatory Hackathon Platform) | 12 structured markdown guides under `docs/notion/` |

---

## 🏗️ Architecture Diagram

```mermaid
graph TD
    subgraph Client ["Frontend (apps/web) - GitHub Pages Deployed"]
        Browser["React 18 + Vite Web App (HashRouter)"]
        Uploader["ImageUploader Component"]
        Store["DemoStore (Browser-Local Storage)"]
        Impact["Unified Impact Math Engine"]
    end

    subgraph Media ["Cloudinary Media Cloud"]
        CloudAPI["Cloudinary Upload Endpoint (api.cloudinary.com)"]
        EdgeCDN["Dynamic Delivery CDN (f_auto, q_auto, c_fill, g_auto)"]
    end

    subgraph ProductionServer ["Production Express API (apps/api - In Repo)"]
        ExpressApp["Express Server (:5000)"]
        Signer["Upload Signature Generator (/api/uploads/signature)"]
        Controllers["Donations & Claims Handlers"]
    end

    subgraph ProductionDB ["Production PostgreSQL (supabase/ - In Repo)"]
        RLS["Row Level Security Policies"]
        AtomicRPC["claim_donation_atomic() RPC"]
        Tables["profiles, donations, claims, reports, logs"]
    end

    Browser -->|Unsigned Direct Upload (Preset)| CloudAPI
    Browser -->|Read Transformed WebP (srcset)| EdgeCDN
    Browser -->|Local State Mutations| Store
    Store --> Impact
    
    Browser -.->|Optional Signed Upload| Signer
    Browser -.->|Fullstack Mode Mutations| Controllers
    Controllers -.-> AtomicRPC
    Controllers -.-> Tables
    Tables -.-> RLS
```

---

## ⚡ Quickstart & Local Installation

### Prerequisites
- Node.js (v20+ LTS recommended, v24 LTS verified)
- Git

### 1. Install Workspace Dependencies
```bash
# Clone the repository
git clone https://github.com/pratitdedhia/SharePlate.git
cd SharePlate

# Install all workspace dependencies
npm ci
```

### 2. Configure Environment Variables
Copy the example files:
```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

To enable real Cloudinary uploads in `apps/web/.env`:
```env
VITE_DEMO_MODE=true
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_unsigned_preset
VITE_NOTION_URL=https://your-public-notion-page-url
```

### 3. Launch Development Servers
Open two terminal windows:

**Terminal 1 (Backend API):**
```bash
cd apps/api
npm run dev
# Express API starts on http://localhost:5000
```

**Terminal 2 (Frontend Web):**
```bash
cd apps/web
npm run dev
# Vite Web App starts on http://localhost:5173
```
Open **`http://localhost:5173`** in your browser.

---

## 🧪 Automated Testing & Verification

All automated tests execute with 100% passing results across 38 tests:

### Run Backend API Tests:
```bash
npm test --workspace=@shareplate/api
# Result: 2 passed, 0 failed
```

### Run Frontend Unit & Integration Tests:
```bash
npm test --workspace=@shareplate/web
# Result: 36 passed, 0 failed (App, Impact Math, Claim Flow, Upload Fallback)
```

### Run All Workspace Tests:
```bash
npm test
# Total: 38 passed, 0 failed
```

### Verify Production Compilation:
```bash
npm run build
# Compiles apps/api (tsc) and bundles apps/web (vite build) with exit code 0
```

---

## 🎬 Recommended 2–3 Minute Evaluation Demo Script

1. **Homepage:** Open `https://pratitdedhia.github.io/SharePlate/`. Review the mission statement, live trust metrics (derived via single calculation engine), and food safety guidance.
2. **List Surplus Food (Donor):** Switch to the **Canteen / Donor** persona using the top navigation role switcher. Click **+ Donate Food** (`#/donations/new`). Upload a photo via the real Cloudinary uploader or select a verified preset. Notice the real measured bandwidth savings. Enter 45 portions of *Vegetable Pulao*, set dietary tag *Veg*, allergen tags, and a 4-hour pickup deadline.
3. **Reserve Portions (NGO):** Switch persona to **NGO / Recipient** (Robin Hood Army). Browse `#/donations`. Claim 20 portions. Observe the available count drop from 45 to 25.
4. **Over-Claim & Expiration Defense:** Try claiming 30 portions on a 25-portion item to verify the over-claim guard. Notice expired listings are disabled.
5. **Pickup & Delivery Progression:** Open **My Claims** (`#/my-claims`). View the revealed private pickup instructions. Click **Mark Picked Up**, then **Confirm Delivery**.
6. **Impact Dashboard:** Open `#/impact`. Show the real-time portion funnel updating and the CO₂e avoided metric recalculating dynamically.

---

## 📁 Repository Structure

```
SharePlate/
├── .github/
│   └── workflows/
│       └── deploy-pages.yml    # GitHub Pages CI/CD workflow
├── apps/
│   ├── web/                    # React 18, Vite, Tailwind CSS, TypeScript frontend
│   │   ├── src/
│   │   │   ├── components/     # UI components (CloudinaryImage, ImageUploader, DemoModeBanner, etc.)
│   │   │   ├── contexts/       # AuthContext, ToastContext
│   │   │   ├── lib/            # cloudinary.ts, impactMath.ts, mockData.ts, utils.ts
│   │   │   ├── pages/          # 13 complete pages (Home, Browse, Detail, Create, Claims, Impact, etc.)
│   │   │   ├── routes/         # ProtectedRoute, RoleGuard, AppRoutes
│   │   │   ├── services/       # donations, claims, impact, uploads API services
│   │   │   └── tests/          # Vitest test suites (claimFlow, impactMath, uploadsFallback)
│   │   ├── .env.example
│   │   └── package.json
│   └── api/                    # Node.js, Express, TypeScript, Zod REST API
│       ├── src/
│       │   ├── config/         # env.ts, supabase.ts, cloudinary.ts
│       │   ├── middleware/     # auth.ts, rbac.ts, validate.ts, errorHandler.ts
│       │   ├── routes/         # health, uploads, donations, claims, impact, profile, reports
│       │   └── validators/     # Zod request validation schemas
│       ├── tests/              # Node.js test runner suite
│       ├── .env.example
│       └── package.json
├── legacy/
│   └── index.html              # Preserved legacy single-file demo (archived)
├── supabase/
│   ├── schema.sql              # Complete PostgreSQL schema (tables, RLS, atomic RPCs, triggers)
│   ├── seed.sql                # Realistic Indian demo dataset (Mumbai, Delhi, Pune, Noida)
│   └── migrations/             # Timestamped migration mirror
├── docs/
│   ├── DEMO_SCRIPT.md          # 3-minute demo script & 6 judge Q&As
│   ├── NOTION_SUBMISSION_CHECKLIST.md # Notion import & submission instructions
│   ├── cloudinary.md           # Mandatory Cloudinary integration evidence
│   ├── architecture.md         # System architecture & deployment targets
│   ├── deployment.md           # Production deployment & GitHub Pages guide
│   ├── team-contributions.md   # Team task breakdown with verifiable contributions
│   └── notion/                 # 12 complete Notion-ready documentation subpages
├── CHANGES.md                  # Comprehensive record of all changes, test logs & manual steps
├── .env.example
├── .gitignore
├── LICENSE
└── package.json
```

---

## 🚧 Limitations & Production Roadmap

While SharePlate provides an end-to-end interactive experience in demo mode and complete backend code in the monorepo, real-world deployment requires the following operational milestones:

1. **Transactional OTP & SMS Gateway:** Integrate Twilio or Fast2SMS so volunteer couriers and canteen managers receive instant SMS/WhatsApp alerts for pickups without requiring an open web browser.
2. **Official NGO Verification:** In the demo, NGOs register with self-reported 80G/FCRA IDs. Production requires integrating with government registry APIs (NGO Darpan) for KYC verification.
3. **Dynamic Route Optimization:** Volunteers currently coordinate individual pickups manually. Future releases will integrate Mapbox/Google Maps Matrix API to bundle nearby pick-up stops into optimized multi-batch courier routes.
4. **Production Cloud Deployment of Express + Supabase:** Host `apps/api` on Render/Fly.io and connect with a production Supabase PostgreSQL instance with automated backups and read-replicas.
5. **Multilingual Localization (i18n):** Expand UI and donor submission forms into Hindi, Marathi, Tamil, and Bengali to support diverse regional canteen staff and grassroot volunteers.

---

## 🛡️ Food Safety Disclaimer

SharePlate is a community coordination technology platform. **SharePlate does not physically inspect, store, or certify food safety.**
- **Donors** are legally responsible under FSSAI regulations for accurate ingredient disclosures, declared allergens, and truthful preparation timestamps.
- **Recipients & Volunteers** must verify visual condition, odor, and temperature upon pickup, and distribute meals in accordance with local hygiene guidelines.

---

## 👥 Team Task Allocation

*(Note: Real names are subject to final confirmation before submission. See [docs/team-contributions.md](docs/team-contributions.md) for detailed task tracking.)*

- **<<FILL: Member 1 Real Name>> (Frontend Engineering & Cloudinary Integration):**
  - Architecture of React 18 + Vite frontend, responsive layouts, and Tailwind design system.
  - Integration of Cloudinary upload component, unsigned preset support, dynamic transformations, and real bandwidth savings computation.
- **<<FILL: Member 2 Real Name>> (Backend Architecture & Security):**
  - Node.js/Express REST API (`apps/api`), Zod request validation, role-based access control (RBAC), and cryptographic signature endpoint.
- **<<FILL: Member 3 Real Name>> (Database Engineering & Concurrency):**
  - PostgreSQL schema design (`supabase/`), Row Level Security policies, atomic reservation stored procedures (`claim_donation_atomic`).
- **<<FILL: Member 4 Real Name>> (QA, Documentation & Notion Journey):**
  - Unit test authoring (38 automated tests), unified impact calculation math, Notion documentation portfolio (`docs/notion/`), and demo walkthrough.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) for Hacktober HackDays 2026.