# 09. Testing & Quality Assurance Plan

---

## 1. Test Execution Summary

| Test Domain | Target Codebase | Tool | Result |
| :--- | :--- | :--- | :--- |
| **Frontend Unit Tests** | `apps/web/src/App.test.tsx` | Vitest | 2 / 2 Passed (549ms) |
| **Backend API Unit Tests** | `apps/api/tests/api.test.js` | Node.js Test Runner | 2 / 2 Passed (564ms) |
| **Backend Compilation** | `apps/api/src/` | TypeScript Compiler (`tsc`) | Clean exit code 0 |
| **Frontend Production Build** | `apps/web/src/` | Vite + Rollup | Clean build in 3.35s |

---

## 2. Core User Journey Validation Log

1. **Donation Creation:** Verified that submitting the form persists the batch, validates future pickup deadline, and attaches Cloudinary image URL.
2. **Atomic Reservation:** Verified that claiming 15 portions from a 45-portion batch decrements `quantity_available` to 30.
3. **Double-Claim Protection:** Verified that submitting a claim for 40 portions when only 30 are available returns an immediate HTTP 400 error.
4. **Cancellation Recovery:** Verified that cancelling a reservation restores the portions back to the available pool.
5. **Collection & Delivery Progression:** Verified that transitioning through `Collected` to `Delivered` updates the claim timestamps and records the completed rescue in impact aggregates.
6. **Privacy Enforcement:** Verified that non-claimant users browsing `/api/donations/:id` see masked pickup instructions and redacted donor phone numbers.
