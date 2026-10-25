# SharePlate — Testing & Quality Assurance Plan

**Hacktober HackDays 2026 | SheBuilds Delhi Chapter**  

---

## 1. Test Suite Overview

Our test strategy covers frontend unit tests, core domain math validation, stateful claim concurrency simulations, fallback upload order verification, backend API controllers, and end-to-end user journeys:

| Scope | Tooling | Target | Status |
| :--- | :--- | :--- | :--- |
| **Frontend Unit & Logic** | Vitest (`apps/web`) | `App.test.tsx` (baseline app rendering) | ✅ Passed (2/2) |
| **Impact Calculation Engine** | Vitest (`apps/web`) | `tests/impactMath.test.ts` (funnel conservation & rescue rate) | ✅ Passed (4/4) |
| **Claim Lifecycle & Expiration** | Vitest (`apps/web`) | `tests/claimFlow.test.ts` (over-claim guard, expiration, self-claim block) | ✅ Passed (6/6) |
| **Cloudinary Upload Fallback Order** | Vitest (`apps/web`) | `tests/uploadsFallback.test.ts` (signed -> unsigned -> demo preview) | ✅ Passed (5/5) |
| **Frontend Subtotal** | Vitest (`apps/web`) | All 4 test files | ✅ Passed (36/36) |
| **Backend API Health** | Node.js Test Runner (`apps/api`) | Health route, express bootstrap | ✅ Passed (2/2) |
| **Total Test Suite** | Node & Vitest | Full workspace suite | ✅ Passed (38/38) |
| **TypeScript Type Checks** | `tsc --noEmit` | Strict compilation on web & API | ✅ Passed (0 errors) |
| **Production Build** | `vite build` | Asset bundling, CSS/JS generation | ✅ Passed (clean exit 0) |

---

## 2. Test Scenarios Executed

### Scenario 1: Donation Creation & Validation
- **Action:** Donor submits title, 45 portions of Vegetable Biryani, 4-hour deadline, dietary flag (`veg`), storage note, and Cloudinary photo.
- **Expected:** Listing appears immediately with status `available` and `quantity_available: 45`.
- **Result:** Verified.

### Scenario 2: Concurrency-Safe Claiming
- **Action:** Recipient claims 20 portions.
- **Expected:** Available quantity decrements to 25. Claim row created with status `claimed`.
- **Result:** Verified in `demoStore` and via SQL `claim_donation_atomic`.

### Scenario 3: Double Reservation & Over-Claim Prevention
- **Action:** Attempting to claim 30 portions when only 25 remain.
- **Expected:** Request rejected with descriptive error message: "Requested quantity exceeds available quantity".
- **Result:** Verified in Vitest unit test suite.

### Scenario 4: Expired Listing Protection
- **Action:** Attempting to claim a donation whose `pickup_deadline` has lapsed into the past.
- **Expected:** Request rejected with "This donation has expired and cannot be claimed". Listing auto-greys out in UI.
- **Result:** Verified in Vitest unit test suite.

### Scenario 5: Self-Claim Prevention
- **Action:** Donor attempts to claim their own surplus listing.
- **Expected:** Request rejected with "Donors cannot claim their own donations".
- **Result:** Verified in Vitest unit test suite.

### Scenario 6: Claim Cancellation & Portion Release
- **Action:** Recipient cancels claim.
- **Expected:** Claim status changes to `cancelled`. 20 portions returned back to available pool.
- **Result:** Verified in `demoStore` and via SQL `cancel_claim_atomic`.

### Scenario 7: Full Lifecycle Delivery (Claimed → Collected → Delivered)
- **Action:** Recipient marks food collected upon pickup, then confirms delivery to community shelter.
- **Expected:** Claim status updates to `collected`, then `delivered`. Impact metrics increment delivered portions by 20.
- **Result:** Verified.

### Scenario 8: Cloudinary Upload Fallback Order
- **Action:** Testing the 3 upload tiers:
  1. Signed upload via backend API when configured.
  2. Direct unsigned upload to `https://api.cloudinary.com/v1_1/<cloud>/image/upload` with preset when API is unreachable.
  3. Clear demo preview strictly labeled as not uploaded if cloud name is absent.
- **Expected:** Strict fallback sequence followed without misleading user.
- **Result:** Verified with mock fetch/XHR in Vitest.

---

## 3. Running Automated Checks Locally

### Backend Tests
```bash
cmd /c npm test --workspace=@shareplate/api
```

### Frontend Tests
```bash
cmd /c npm test --workspace=@shareplate/web
```

### Full Workspace Test Suite
```bash
cmd /c npm test
```

### Production Builds
```bash
cmd /c npm run build
```
