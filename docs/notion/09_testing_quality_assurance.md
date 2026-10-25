# 09. Testing & Quality Assurance Plan

---

## 1. Test Status

Historical pass counts and durations were removed because they could not be verified for this revision. Run the root workspace commands `npm ci`, `npm test`, `npm run build:web`, and `npm run build:api`; record only observed output in the repository's `CHANGES.md`.

---

## 2. Core User Journey Validation Log

1. **Impact math:** Unit test covers rescue rate (delivered portions ÷ listed portions) and ensures funnel percentages sum to 100.
2. **Demo claim guards:** Unit test covers over-available and expired claims.
3. **Upload fallback order:** `apps/web/src/tests/uploads.test.ts` covers mocked signed, unsigned, and local-preview paths. Execute it as part of `npm test` before reporting a pass.
4. **Browser workflows:** Manually check real Cloudinary upload with the configured unsigned preset, and verify that no-config previews remain labeled and are not stored as uploaded assets.
5. **Production-only paths:** API auth, Supabase RLS, signed uploads, and atomic SQL claims require separate deployment-backed checks; they are not validated by the static demo.
