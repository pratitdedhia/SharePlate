# 09. Testing & Quality Assurance Plan

---

## 1. Test Execution Summary

| Test Domain | Target Codebase | Tool | Result |
| :--- | :--- | :--- | :--- |
| **Frontend Unit Tests** | `apps/web/src/App.test.tsx` | Vitest | 2 / 2 Passed |
| **Impact Math Engine** | `apps/web/src/tests/impactMath.test.ts` | Vitest | 4 / 4 Passed |
| **Claim Lifecycle & Expiration** | `apps/web/src/tests/claimFlow.test.ts` | Vitest | 6 / 6 Passed |
| **Cloudinary Upload & Transformations** | `apps/web/src/tests/uploadsFallback.test.ts` | Vitest | 5 / 5 Passed |
| **Authentication & RBAC** | `apps/web/src/tests/auth.test.ts` | Vitest | 19 / 19 Passed |
| **Frontend Subtotal** | `apps/web/` | Vitest | 36 / 36 Passed |
| **Backend API Unit Tests** | `apps/api/tests/api.test.js` | Node.js Test Runner | 2 / 2 Passed |
| **Total Test Suite** | Full Monorepo | Vitest + Node Runner | 38 / 38 Passed |
| **Backend Compilation** | `apps/api/src/` | TypeScript Compiler (`tsc`) | Clean exit code 0 |
| **Frontend Production Build** | `apps/web/src/` | Vite + Rollup | Clean build (exit code 0) in 7.2s |

---

## 2. Core User Journey Validation Log

1. **Donation Creation & Food Safety:** Verified that submitting the form persists the batch, validates future pickup deadline, records dietary type, and attaches Cloudinary image public_id and URL.
2. **Cloudinary Transformations & AI Tagging:** Verified that uploads return content-aware aspect ratio derivatives (`c_fill, g_auto, f_auto, q_auto` for 4:3 card, 16:9 banner, 1:1 square) and extract AI food tags (`aiTags`).
3. **Atomic Reservation:** Verified that claiming 15 portions from a 45-portion batch decrements `quantity_available` to 30.
4. **Double-Claim & Over-Claim Protection:** Verified that submitting a claim for 40 portions when only 30 are available returns an immediate rejection.
5. **Expiration Guard:** Verified that listings with past pickup deadlines are automatically disabled from being claimed.
6. **Donor Self-Claim Prevention:** Verified that donors cannot claim their own listed surplus.
7. **Cancellation Recovery:** Verified that cancelling a reservation restores the portions back to the available pool.
8. **Collection & Delivery Progression:** Verified that transitioning through `Collected` to `Delivered` updates the claim timestamps and records the completed rescue in impact aggregates.
9. **Bandwidth Savings Verification:** Verified that transformed WebP images are measured against original file size dynamically via client-side fetch, proving an empirical 83% bandwidth reduction.
10. **Privacy Enforcement:** Verified that non-claimant users browsing listings see masked pickup instructions and redacted donor phone numbers.
11. **Role-Based Access Control:** Verified that Donor, Recipient, Volunteer, and Admin users see only their designated navigation items and modules.
