# 11. Deployment & Local Setup Guide

---

## 1. Quick Local Execution

### Install Dependencies
```bash
# In workspace root
npm install --workspace=@shareplate/api
npm install --workspace=@shareplate/web
```

### Run Locally
```bash
# Terminal 1: Backend Express API
cd apps/api
npm run dev

# Terminal 2: Frontend Web App
cd apps/web
npm run dev
```
Visit `http://localhost:5173` to explore SharePlate in your browser.

---

## 2. Cloud Service Configuration

### Supabase
1. Run `supabase/schema.sql` in your Supabase SQL editor.
2. (Optional) Run `supabase/seed.sql` to populate sample Indian canteens, NGOs, and food batches.
3. Configure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `apps/web/.env`.

### Cloudinary
1. Create a free Cloudinary account.
2. Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` in `apps/api/.env`.
3. Set `VITE_CLOUDINARY_CLOUD_NAME` in `apps/web/.env`.

---

## 3. Production Deployment Notes
- **Frontend:** Deployable to Vercel with root directory set to `apps/web`.
- **Backend:** Deployable to Render or Railway with root directory set to `apps/api`.
