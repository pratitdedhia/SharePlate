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
git clone https://github.com/your-team/shareplate.git
cd shareplate

# Install dependencies in both workspaces
npm install --workspace=@shareplate/api
npm install --workspace=@shareplate/web
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
   ```

---

## 4. Production Deployment

### Frontend (Vercel)
- Connect your GitHub repository to Vercel.
- Set **Root Directory** to `apps/web`.
- Configure Environment Variables:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `VITE_API_BASE_URL` (your deployed backend URL)
  - `VITE_CLOUDINARY_CLOUD_NAME`
  - `VITE_DEMO_MODE=false`
- Build Command: `npm run build`
- Output Directory: `dist`

### Backend (Render / Railway / Fly.io)
- Connect repository and select `apps/api`.
- Build Command: `npm run build`
- Start Command: `npm start`
- Add all required environment variables (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `CLOUDINARY_*`, `FRONTEND_ORIGIN`).
