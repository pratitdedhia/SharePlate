# SharePlate — Notion Documentation & Unstop Submission Checklist

**Hacktober HackDays 2026 | SheBuilds Delhi Chapter | Powered by MLH**  
**Submission Deadline:** 25 Oct 2026, 10:00 PM IST  
**Mandatory Tracks:** Tech for Social Good  
**Required Tech Stack:** Cloudinary & Notion Project Journey  

---

## Step 1: Import Markdown Files into Notion

1. Open your workspace at [notion.so](https://notion.so).
2. Create a new root page named:  
   **`SharePlate — Tech for Social Good | Hacktober HackDays 2026`**
3. Import or copy the files in `docs/notion/` in order:
   - `00_index.md` (Table of Contents / Hub)
   - `01_project_overview.md`
   - `02_problem_research.md`
   - `03_user_personas.md`
   - `04_product_requirements.md`
   - `05_architecture_technical_decisions.md`
   - `06_database_design.md`
   - `07_cloudinary_implementation.md` (Mandatory Cloudinary section)
   - `08_daily_development_journal.md`
   - `09_testing_quality_assurance.md`
   - `10_team_contributions.md` (Replace bracketed role placeholders with real names)
   - `11_deployment_and_setup.md`
   - `12_final_submission.md`
4. Notion Tip: You can drag and drop markdown files directly into Notion or use **Settings & Members > Import > Markdown & CSV**.

---

## Step 2: Make Your Notion Page Public & Copy the Link

1. At the top right of your Notion page, click the **Share** button.
2. Toggle on **"Share to web"** (Publish to web).
3. Ensure **"Allow duplicate as template"** or public viewing is enabled.
4. Click **"Copy web link"**.
   - Your public link will look like: `https://your-workspace.notion.site/SharePlate-abc123...`

---

## Step 3: Link Notion into the Application & GitHub

1. **GitHub Repository Variables:**
   - Go to your repository on GitHub: **Settings > Secrets and variables > Actions > Variables**.
   - Add or update the variable:  
     `VITE_NOTION_URL` = `https://your-workspace.notion.site/SharePlate-...`
2. **Local / Build Environment:**
   - Add `VITE_NOTION_URL=https://your-workspace.notion.site/SharePlate-...` into `apps/web/.env`.
3. When set, a prominent **"Project Journey (Notion)"** button will automatically appear in the top Navbar, on `/about`, and in the Footer!

---

## Step 4: What to Put in the Unstop / MLH Submission Form

### 1. Project Title
`SharePlate`

### 2. Tagline
`Rescue Food. Reduce Waste. Feed Communities.`

### 3. Track
`Tech for Social Good`

### 4. Live Deployed URL
`https://pratitdedhia.github.io/SharePlate/`

### 5. GitHub Repository URL
`https://github.com/pratitdedhia/SharePlate`

### 6. Notion Project Journey URL
*(Paste your public Notion page URL generated in Step 2)*

### 7. Cloudinary Tech Stack Evidence
*(Paste this exact paragraph)*:
> "SharePlate utilizes Cloudinary end-to-end for real-time visual food verification. In our deployed GitHub Pages application, donors upload surplus food images directly to Cloudinary using an unsigned upload preset with custom tags (`shareplate,food-donation`) and context metadata, avoiding the exposure of secrets. In our Express API, uploads are signed using server-generated SHA-256 signatures scoped to donor directories. Images are delivered via responsive breakpoints (`srcset` at 400w, 800w, 1200w) with automatic format negotiation (`f_auto`), perceptual quality compression (`q_auto`), and AI-gravity cropping (`c_fill, g_auto`). Real-time bandwidth savings are measured directly on the client by comparing original file sizes against delivered WebP payloads."

### 8. Short Project Description (Elevator Pitch)
> "In Indian cities, college canteens and event caterers discard wholesome surplus meals every day due to lack of coordination, while nearby shelters struggle with food costs. SharePlate connects food donors with local NGOs and community kitchens in under 60 seconds. Featuring Cloudinary-powered visual food safety verification, food safety metadata (preparation timestamps, consume-within hours, storage guidance, dietary labels), and defensible FAO/UNEP ecological impact calculations, SharePlate ensures surplus meals reach people, not landfills."
