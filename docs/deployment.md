# SharePlate — Deployment & Setup Guide

**Hacktober HackDays 2026 | SheBuilds Delhi Chapter**  
**Official Repository:** `https://github.com/pratitdedhia/SharePlate`  
**Live Deployed URL:** `https://pratitdedhia.github.io/SharePlate/`  

---

## 1. Live Deployment Target: GitHub Pages (Current Deployed Demo)

The official Hacktober HackDays 2026 deployed demo is hosted on **GitHub Pages** via an automated GitHub Actions CI/CD workflow.

### 1.1 Automated CI/CD Workflow (`.github/workflows/deploy-pages.yml`)
- Triggered automatically on every push to `main` and via manual `workflow_dispatch`.
- Steps:
  1. Checks out repository and configures Node.js 20 with npm caching.
  2. Runs `npm ci` for deterministic dependency installation.
  3. Builds `apps/web` with production environment variables read from **GitHub Repository Variables** (`vars.*`):
     - `VITE_DEMO_MODE=true`
     - `VITE_CLOUDINARY_CLOUD_NAME=${{ vars.VITE_CLOUDINARY_CLOUD_NAME }}`
     - `VITE_CLOUDINARY_UPLOAD_PRESET=${{ vars.VITE_CLOUDINARY_UPLOAD_PRESET }}`
     - `VITE_NOTION_URL=${{ vars.VITE_NOTION_URL }}`
  4. Uploads `apps/web/dist` via `actions/upload-pages-artifact@v3`.
  5. Deploys to GitHub Pages via `actions/deploy-pages@v4`.

### 1.2 GitHub Repository Variables Setup
To enable direct Cloudinary uploads and Notion linking on your GitHub Pages deployment:
1. Navigate to your GitHub repository: **Settings > Secrets and variables > Actions > Variables tab**.
2. Click **New repository variable** and define:
   - `VITE_CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name (e.g. `dxy...`)
   - `VITE_CLOUDINARY_UPLOAD_PRESET`: Name of your unsigned upload preset (e.g. `shareplate_preset`)
   - `VITE_NOTION_URL`: Your public Notion page URL (e.g. `https://your-page.notion.site/...`)

---

## 2. Cloudinary Unsigned Upload Preset Setup

For static hosts (GitHub Pages) where no Express server is running to sign requests, Cloudinary provides **Unsigned Upload Presets** to allow direct browser uploads safely without exposing API secrets:

1. Log into your account at [cloudinary.com](https://cloudinary.com).
2. Go to **Settings (gear icon) > Upload > Upload presets**.
3. Click **Add upload preset**.
4. Set **Signing Mode** to **Unsigned**.
5. Set **Folder** to `shareplate/donations`.
6. (Optional) Set **Allowed formats** to `jpg, png, webp` and max file size to `5 MB`.
7. Click **Save** and copy the preset name into `VITE_CLOUDINARY_UPLOAD_PRESET`.

---

## 3. Local Development Quickstart

### Prerequisites
- Node.js (v20+ LTS recommended)
- Git

### 3.1 Clone & Install
```bash
# Clone the repository
git clone https://github.com/pratitdedhia/SharePlate.git
cd SharePlate

# Install all workspace dependencies
npm install
```

### 3.2 Environment Setup
Copy the example environment files:
```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

### 3.3 Running Locally
```bash
# Run both backend API (:5000) and web frontend (:5173) concurrently:
npm run dev:all

# Or run frontend only (interactive demo mode):
npm run dev
```

---

## 4. Production Cloud Deployment (Optional Full-Stack Stack)

To deploy the full-stack architecture with the Express backend and Supabase PostgreSQL:

### Frontend (Vercel)
- Set **Root Directory** to `apps/web`.
- Configure Environment Variables:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `VITE_API_BASE_URL` (deployed Express URL)
  - `VITE_CLOUDINARY_CLOUD_NAME`
  - `VITE_CLOUDINARY_UPLOAD_PRESET`
  - `VITE_DEMO_MODE=false`
- Build Command: `npm run build`
- Output Directory: `dist`

### Backend (Render / Railway / Fly.io)
- Select `apps/api`.
- Build Command: `npm run build`
- Start Command: `npm start`
- Environment Variables:
  - `PORT=5000`
  - `SUPABASE_URL`, `SUPABASE_ANON_KEY`
  - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
  - `FRONTEND_ORIGIN` (your frontend domain)
