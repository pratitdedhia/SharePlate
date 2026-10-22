# SharePlate — Testing & Quality Assurance Plan

**Hacktober HackDays 2026 | SheBuilds Delhi Chapter**  

---

## 1. Test Suite Overview

Our test strategy covers frontend units, backend API controllers, and end-to-end user journeys:

| Scope | Tooling | Target | Status |
| :--- | :--- | :--- | :--- |
| **Frontend Unit & Logic** | Vitest (`apps/web`) | Portion math, environmental calculations | ✅ Passed (2/2) |
| **Backend API Health** | Node.js Test Runner (`apps/api`) | Health route, express bootstrap | ✅ Passed (2/2) |
| **TypeScript Type Checks** | `tsc --noEmit` | Strict compilation on web & API | ✅ Passed (0 errors) |
| **Production Build** | `vite build` | Asset bundling, CSS/JS generation | ✅ Passed (3.35s) |

---

## 2. Test Scenarios Executed

### Scenario 1: Donation Creation
- **Action:** Donor submits title, 45 portions of Vegetable Biryani, 4-hour deadline, and Cloudinary photo.
- **Expected:** Listing appears immediately with status `available` and `quantity_available: 45`.
- **Result:** Verified.

### Scenario 2: Concurrency-Safe Claiming
- **Action:** Recipient claims 20 portions.
- **Expected:** Available quantity decrements to 25. Claim row created with status `claimed`.
- **Result:** Verified via `claim_donation_atomic`.

### Scenario 3: Double Reservation Prevention
- **Action:** Attempting to claim 30 portions when only 25 remain.
- **Expected:** Request rejected with descriptive error message: "Requested quantity exceeds available quantity".
- **Result:** Verified.

### Scenario 4: Claim Cancellation & Portion Release
- **Action:** Recipient cancels claim.
- **Expected:** Claim status changes to `cancelled`. 20 portions returned back to available pool.
- **Result:** Verified via `cancel_claim_atomic`.

### Scenario 5: Full Lifecycle Delivery (Claimed → Collected → Delivered)
- **Action:** Recipient marks food collected upon pickup, then confirms delivery to community shelter.
- **Expected:** Claim status updates to `collected`, then `delivered`. Impact metrics increment delivered portions by 20.
- **Result:** Verified.

---

## 3. Running Automated Checks Locally

### Backend Tests
```bash
cd apps/api
npm test
```

### Frontend Tests
```bash
cd apps/web
npm test
```

### Production Builds
```bash
cd apps/api && npm run build
cd apps/web && npm run build
```
