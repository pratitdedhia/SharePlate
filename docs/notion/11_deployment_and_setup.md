# 11. Deployment & Setup Guide

**Official Repository:** `https://github.com/pratitdedhia/SharePlate`  
**Live Deployed URL (GitHub Pages):** `https://pratitdedhia.github.io/SharePlate/`  

---

## 1. Live Deployment Target: GitHub Pages

The deployed demo is hosted on **GitHub Pages** via an automated GitHub Actions CI/CD workflow (`.github/workflows/deploy-pages.yml`).

### 1.1 Automated Workflow
- On every push to `main`, the workflow:
  1. Installs workspace dependencies with `npm ci`.
  2. Builds `apps/web` injecting GitHub Repository Variables (`vars.*`):
     - `VITE_DEMO_MODE=true`
     - `VITE_CLOUDINARY_CLOUD_NAME`
     - `VITE_CLOUDINARY_UPLOAD_PRESET`
     - `VITE_NOTION_URL`
  3. Uploads `apps/web/dist` and deploys to GitHub Pages with `actions/deploy-pages@v4`.
- Client routing uses `HashRouter` ensuring URLs like `#/donations` or `#/impact` work seamlessly without requiring server-side fallback rules.

### 1.2 GitHub Repository Variables Configuration
1. Open **Settings > Secrets and variables > Actions > Variables tab** in your repository.
2. Add:
   - `VITE_CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name
   - `VITE_CLOUDINARY_UPLOAD_PRESET`: Name of your unsigned upload preset
   - `VITE_NOTION_URL`: Your public Notion project journey page link

---

## 2. Cloudinary Unsigned Upload Preset Setup

To enable direct client uploads on static hosts without an active backend:
1. In the Cloudinary Dashboard, open **Settings > Upload > Upload presets**.
2. Click **Add upload preset**.
3. Select **Unsigned** as the signing mode.
4. Set folder to `shareplate/donations` and save.
5. Provide this preset name as `VITE_CLOUDINARY_UPLOAD_PRESET`.

---

## 3. Local Development Quickstart

```bash
# Clone the repository
git clone https://github.com/pratitdedhia/SharePlate.git
cd SharePlate

# Install all workspace dependencies
npm install

# Run frontend dev server
npm run dev

# Or run frontend and Express backend concurrently
npm run dev:all
```
