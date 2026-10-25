# SharePlate — Testing & Quality Assurance Plan

**Hacktober HackDays 2026 | SheBuilds Delhi Chapter**  

---

## 1. Test Suite And Status

This page is a test plan, not a historical execution report. Earlier pass counts and “verified” journey results were removed because they were not independently observed for the current revision. Check [CHANGES.md](../CHANGES.md) for exact results of checks actually run.

Current test sources include the API tests in `apps/api/tests/api.test.js`, the frontend suite in `apps/web/src/App.test.tsx`, and mocked upload-flow coverage in `apps/web/src/tests/uploads.test.ts`.

## 2. Important Test Scenarios

- Demo claim rejects an amount greater than remaining quantity.
- Demo claim rejects an expired listing.
- Impact calculations use delivered portions divided by listed portions and share portion totals with the funnel.
- Upload tests cover signed API success, unsigned-preset fallback, and labeled local preview.
- Production SQL/API checks must be run against separately deployed services; the static Pages demo does not exercise them.

---

## 3. Running Automated Checks Locally

### Root Workspace Checks
```bash
npm ci
npm test
npm run build:web
npm run build:api
```
