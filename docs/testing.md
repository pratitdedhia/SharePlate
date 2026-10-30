# SharePlate — Testing & Quality Assurance Plan

**Hacktober HackDays 2026 | SheBuilds Delhi Chapter**  

---

## 1. Test Suite Overview

Our test strategy covers frontend unit tests, core domain math validation, stateful claim concurrency simulations, fallback upload order verification, backend API controllers, and end-to-end user journeys:

| Scope | Tooling | Target | Status |
| :--- | :--- | :--- | :--- |
| **Frontend Unit & Logic** | Vitest (`apps/web`) | `App.test.tsx` (baseline app rendering) | ✅ Passed (2/2) |
| **Impact Calculation Engine** | Vitest (`apps/web`) | `tests/impactMath.test.ts` (funnel conservation & rescue rate) | ✅ Passed (4/4) |
| **Authentication & RBAC** | Vitest (`apps/web`) | `tests/auth.test.ts` (role guards, multi-role sessions) | ✅ Passed (19/19) |
| **Claim Lifecycle & Concurrency** | Vitest (`apps/web`) | `tests/claimFlow.test.ts` (over-claim, expiration, isolation, donor rewards, volunteer routing, 2-party OTP) | ✅ Passed (45/45) |
| **Features & Safety Integration** | Vitest (`apps/web`) | `tests/features.test.ts` (food safety disclaimers, dietary tags) | ✅ Passed (14/14) |
| **Cloudinary Upload & Error Validation** | Vitest (`apps/web`) | `tests/uploadsFallback.test.ts` (signed, unsigned, local fallback, error surfacing) | ✅ Passed (6/6) |
| **Page Render Safety** | Vitest (`apps/web`) | `tests/renderPage.test.tsx` (SSR hydration & render integrity) | ✅ Passed (1/1) |
| **Frontend Subtotal** | Vitest (`apps/web`) | All 7 test suites | ✅ Passed (89/89) |
| **Backend API Health** | Node.js Test Runner (`apps/api`) | Health route, express bootstrap | ✅ Passed (2/2) |
| **Total Test Suite** | Node & Vitest | Full workspace suite | ✅ Passed (91/91) |
| **TypeScript Type Checks** | `tsc --noEmit` | Strict compilation on web & API | ✅ Passed (0 errors) |
| **Production Build** | `npm run build:web` | Asset bundling, root index.html mirroring | ✅ Passed (clean exit 0) |

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

### Scenario 9: Multi-Account Isolation & Donor Claim Visibility
- **Action:** NGO reserves portions from Donor A. Querying claims from Donor A, Donor B, and NGO accounts.
- **Expected:** Donor A receives only claims on donations they own, with recipient profile included. Donor B receives zero claims.
- **Result:** Verified in Vitest integration test suite.

### Scenario 10: Volunteer Multi-Stop Route Sequencing & Waypoint Partitioning
- **Action:** Volunteer bundles multiple pickup and drop-off tasks along their personal commute corridor. Generating Google Maps directions URLs.
- **Expected:** Waypoints sequenced in proper pickup-before-delivery order. Trips exceeding Google Maps' 9-intermediate-waypoint limit are automatically partitioned into ordered legs without dropping stops.
- **Result:** Verified in Vitest integration test suite.

### Scenario 11: Two-Party Verification Engine (Pickup & Delivery OTP)
- **Action:** Volunteer arrives at donor dock and initiates handover. Generates 4-digit OTP with 15-minute expiration. Donor kitchen enters the code. Later, recipient shelter enters delivery OTP and confirms portion count.
- **Expected:** Volunteer cannot self-confirm. Cross-account users (unrelated donors or recipients) are rejected. Wrong codes increment attempt counters and lock out after 3 failures. Expired codes are rejected. Successful verification atomically updates claim lifecycle and releases rewards.
- **Result:** Verified across 14 dedicated Vitest tests.

### Scenario 12: Persisted Donor Rewards Ledger
- **Action:** Testing reward points issuance upon donation creation, reservation, pickup, cancellation, dispute, and delivery confirmation.
- **Expected:** Zero points awarded for listings, reservations, pickups, cancellations, or disputes. Points awarded strictly upon recipient NGO delivery verification ($\min(200, 20 + 2 \times \text{portions})$). Duplicate delivery confirmations cannot credit points twice. Donors cannot inspect other donors' reward ledgers.
- **Result:** Verified in Vitest integration test suite.

### Scenario 13: Cloudinary Upload Error Surfacing
- **Action:** Attempting browser upload when unsigned preset is configured but Cloudinary API returns error (e.g., misspelled preset or unsigned mode not enabled in dashboard).
- **Expected:** Service throws descriptive error with actionable troubleshooting advice instead of silently swallowing into a demo preview.
- **Result:** Verified in Vitest upload service test suite.

---

## 3. Running Automated Checks Locally

### Backend Tests
```bash
npm test --workspace=@shareplate/api
```

### Frontend Tests
```bash
npm test --workspace=@shareplate/web
```

### Full Workspace Test Suite
```bash
npm test
```

### Production Builds
```bash
npm run build
```
