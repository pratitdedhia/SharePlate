# SharePlate — Deployment & Setup Guide

**Hacktober HackDays 2026 | SheBuilds Delhi Chapter**  

---

## 1. Local Development Quickstart

### Prerequisites
- Node.js (v20+ LTS recommended, v24 verified)
- Git

### 1.1 Clone & Install
```bash
# Clone the repository
git clone https://github.com/pratitdedhia/SharePlate.git
cd shareplate

# Install dependencies from the root lockfile
npm ci
```

### 1.2 Environment Setup
Copy the example environment files:
```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

### 1.3 Running Locally
Open two terminal windows:

**Terminal 1 (Backend API):**
```bash
cd apps/api
npm run dev
# Server starts at http://localhost:5000
```

**Terminal 2 (Frontend Web):**
```bash
cd apps/web
npm run dev
# Vite server starts at http://localhost:5173
```

---

## 2. Supabase Cloud Configuration

1. Create a free project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** tab in your Supabase dashboard.
3. Paste and run `supabase/schema.sql`.
4. (Optional) Run `supabase/seed.sql` to populate sample Indian canteens, NGOs, and food records.
5. In **Project Settings > API**, retrieve your `Project URL` and `anon public key`.
6. Add them to `apps/web/.env` and `apps/api/.env`.

---

## 3. Cloudinary Setup

1. Create a free account at [cloudinary.com](https://cloudinary.com).
2. From the Cloudinary Dashboard, copy:
   - **Cloud Name**
   - **API Key**
   - **API Secret**
3. Configure `apps/api/.env`:
   ```bash
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```
4. Configure `apps/web/.env`:
   ```bash
   VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
   VITE_CLOUDINARY_UPLOAD_PRESET=your_unsigned_upload_preset
   ```

The static demo uses the unsigned preset directly. Keep the API secret only in `apps/api/.env`; never add it to a Vite variable.

---

## 4. GitHub Pages Demo Deployment

The workflow at `.github/workflows/deploy-pages.yml` runs on pushes to `main`, installs with `npm ci`, builds `apps/web` with `VITE_DEMO_MODE=true`, and deploys only `apps/web/dist` to Pages. The Vite base path and `HashRouter` support the repository URL `https://pratitdedhia.github.io/SharePlate/`.

In GitHub repository **Settings > Secrets and variables > Actions > Variables**, add:

- `VITE_CLOUDINARY_CLOUD_NAME` (public Cloudinary cloud name)
- `VITE_CLOUDINARY_UPLOAD_PRESET` (public unsigned preset name)
- `VITE_NOTION_URL` (public Notion project page URL; omit or leave empty to hide the link)

These are public values and are read from `vars.*`, not Actions secrets. The Pages site is configured for demo mode and stores donation/claim data in the visitor's browser. Supabase and Express have not been deployed as part of this demo. A successful workflow run is required before describing the target URL as an active deployment.

## 5. Deploying the Production Architecture

Deploying Supabase and Express is not covered by the Pages workflow. Configure Supabase and a hosted API separately, then set the corresponding client environment variables and disable demo mode only after the production path is ready and verified.
