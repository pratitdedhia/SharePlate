# 12. Final Submission Summary & Demo Script

**Hacktober HackDays 2026 | SheBuilds Delhi Chapter | Powered by MLH**  
**Project Name:** SharePlate  
**Tagline:** Rescue Food. Reduce Waste. Feed Communities.  
**Track:** Tech for Social Good  
**Mandatory Technology:** Cloudinary  

---

## 1. Submission Summary

SharePlate is a community food-rescue prototype for Hacktober HackDays 2026, SheBuilds Delhi, powered by MLH. The GitHub Pages target is the React app in `apps/web`, configured for browser-local demo data. Supabase and Express code are present as the production architecture but are not deployed for the demo.

## 2. Verified Technical Paths

- Static demo image uploads use an unsigned Cloudinary preset when its public cloud name and preset are configured. A reachable, configured Express signature endpoint is attempted first. Otherwise the uploader shows a clearly labeled local preview.
- The repository's Supabase schema contains the production atomic claim function. The browser demo uses local storage and does not provide cross-device claim concurrency.
- Home and Impact use the same impact calculation; rescue rate is delivered portions divided by listed portions. Environmental figures are estimates.
- Notion publication, Cloudinary account configuration, and final Pages deployment must be completed and checked manually.

## 3. Demo Script

See [docs/DEMO_SCRIPT.md](../DEMO_SCRIPT.md) for the timed flow and judge Q&A. Run it against the deployed Pages URL only after confirming the latest workflow succeeded and real Cloudinary uploads work.

## 4. Submission Checklist

See [docs/NOTION_SUBMISSION_CHECKLIST.md](../NOTION_SUBMISSION_CHECKLIST.md) for importing the Markdown pages, publishing the Notion page, setting `VITE_NOTION_URL`, and preparing the Unstop submission.

## 5. Limitations & Roadmap

- Deploy Supabase and Express, then connect the UI to shared production data.
- Add real OTP/SMS and NGO verification.
- Add volunteer route optimization.
- Add multilingual UI and content.
