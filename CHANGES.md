# Changes And Submission Status

No commits were created. No `.env` files containing real values were edited; only `.env.example` files changed.

## Tier 1

1. **GitHub Pages target:** Added `.github/workflows/deploy-pages.yml` to install with `npm ci`, build `apps/web` in demo mode with public repository Variables, and publish only `apps/web/dist`. Replaced `BrowserRouter` with `HashRouter`; production Vite builds use `/SharePlate/` while local development keeps `/`; changed root `serve` to serve `apps/web/dist`. **Incomplete:** `index.html` remains at the root in this active workspace because the available workspace file tools do not support a move/copy operation, and the shell path discovered is a separate checkout with its own uncommitted changes. The Pages workflow will not publish the root page, but it has not been moved to `legacy/index.html` here.
2. **Cloudinary:** Added `VITE_CLOUDINARY_UPLOAD_PRESET`; removed the fake cloud default; implemented signed, unsigned-preset, then labeled local-preview behavior; included unsigned upload tags/context; retained JPEG/PNG/WebP and 5 MB client validation; store Cloudinary `public_id` and delivery URL; request responsive `c_fill,g_auto,f_auto,q_auto` listing variants at 400/800/1200 widths with lazy loading; report original bytes and measured transformed bytes plus returned format/dimensions when available. Replaced demo food photo URLs with the editable `DEMO_SEED_IMAGES` array under `shareplate/seed/`. **Manual asset work required:** Upload the six seed images and replace the expected IDs in that array with the real Cloudinary public IDs. No Cloudinary account or preset was available to verify a live upload.
3. **Demo honesty:** Persisted listing/claim demo state in browser `localStorage`; added persistent footer/About/dashboard notices; replaced Cloudinary/live/verified/concurrency claims in the deployed app and documentation. Demo reservations check positive whole quantities, availability, and pickup deadline; they do not guarantee cross-device concurrency. Supabase/Express are described as repository production architecture, not deployed services.
4. **Impact metrics:** Added one `calculateImpactMetrics` function for portions, funnel percentages, estimate values, and rescue rate. Rescue rate is delivered portions divided by listed portions. Added tests for the funnel calculation and demo overclaim/expiry behavior.
5. **Notion link:** Added `VITE_NOTION_URL` to frontend types/examples, workflow Variables, desktop/mobile Navbar, About, and footer. README and Notion index contain `<<FILL: public Notion page URL>>` pending the public page URL.
6. **Build and test gate:** **Not verified.** Exact attempts/results:
   - `npm run build --workspace=@shareplate/web` from the terminal failed because PowerShell blocked `npm.ps1` (`PSSecurityException: UnauthorizedAccess`).
   - `npm.cmd run build --workspace=@shareplate/web` then failed with `ENOENT` because the terminal was in `C:\Users\dedhi` and there was no `package.json` there.
   - The VS Code task runner rejected `vscode-vfs://github/pratitdedhia/SharePlate` as a task working directory (`Cannot create a task outside the current workspace folder`). The only filesystem checkout found was a separate local copy with pre-existing uncommitted changes, so it was not used to validate this workspace.
   - `npm ci`, `npm test`, `npm run build:web`, and `npm run build:api` were not observed. Editor diagnostics reported no errors for the inspected/changed TypeScript files; this is not a substitute for compilation or test execution.

## Tier 2

7. **Optional Cloudinary effects:** Skipped. Auto-tagging/moderation and background removal/quality enhancement depend on account capabilities and were not enabled or assumed.
8. **Food-safety fields and expiry:** Demo claim rejection and expiration of available demo listings were added. Prepared-at/consume-within/storage/veg fields and SQL/API expiry enforcement were skipped as optional follow-up.
9. **Focused tests:** Added demo claim/expiry and shared impact tests, plus mocked upload-order tests for signed, unsigned, and local-preview paths in `apps/web/src/tests/uploads.test.ts`. Test execution remains unverified because the workspace shell could not run npm.
10. **Accessibility/mobile pass:** Listing images have alt text, responsive sources, and lazy loading. A full keyboard/accessibility audit and 360 px browser check were not run because no browser validation was available in the active workspace.
11. **Metadata/favicon:** Skipped as optional; no verified Cloudinary Open Graph image or favicon asset was provided.

## Tier 3

12. **Documentation:** Updated README, Cloudinary, architecture, deployment, testing, API, database, security, demo-account, team, and Notion source docs to distinguish the browser demo from the production architecture. Replaced the generic repository clone URL. Historical pass counts, performance claims, and unverifiable team assignments were removed or marked for confirmation.
13. **Limitations and roadmap:** Added real OTP/SMS, NGO verification, route optimization, Supabase/Express deployment, and multilingual support to the README roadmap.
14. **Demo script:** Added `docs/DEMO_SCRIPT.md` with a three-minute donor/Cloudinary upload, NGO claim, volunteer delivery, impact walkthrough, and six honest judge Q&As.
15. **Notion checklist:** Added `docs/NOTION_SUBMISSION_CHECKLIST.md` for Markdown import, public sharing, `VITE_NOTION_URL`, and Unstop form content.

## Manual Steps Before Submission

- Move the root `index.html` into `legacy/index.html` in the active checkout, preserving its contents. The new Pages workflow already excludes it.
- Add GitHub repository Actions Variables `VITE_CLOUDINARY_CLOUD_NAME`, `VITE_CLOUDINARY_UPLOAD_PRESET`, and `VITE_NOTION_URL`. The upload preset must be unsigned and appropriately restricted. Never add the Cloudinary API secret to a `VITE_*` variable.
- Upload the six seed images to Cloudinary under `shareplate/seed/` and update the public IDs in `DEMO_SEED_IMAGES`.
- Import `docs/notion/*.md` into Notion, verify citations/dates/contributions, resolve the `<<FILL: ...>>` entries, publish the page, and open its public URL in a signed-out browser.
- Replace the Notion URL placeholder at the top of `README.md` and set the same URL in the repository Variable. Push the finished changes to `main` to run Pages deployment; no push or commit was made here.
- Run `npm ci`, `npm test`, `npm run build:web`, and `npm run build:api` from the active repository checkout and replace no results with estimates. Then verify the Pages URL and a real Cloudinary upload.
- Confirm actual team names, team size, and each person's contributions in `README.md`, `docs/team-contributions.md`, and `docs/notion/10_team_contributions.md`.
- Complete the 360 px accessibility/browser check and only then describe that verification in the submission.
