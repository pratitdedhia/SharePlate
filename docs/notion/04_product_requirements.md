# 04. Product Requirements Document (PRD)

---

## 1. Functional Requirements

### FR-1: Account Creation & Role Authorization
- Support registration as `donor`, `recipient`, and `volunteer`.
- Block public registration as `admin` to prevent privilege escalation.
- Support session persistence and quick demo persona switching for evaluation.

### FR-2: Surplus Food Listing Creation
- Mandatory fields: Title, description, category, total quantity (>0), quantity unit, pickup deadline (future timestamp), approximate location.
- Optional fields: Ingredients, allergens, preparation timestamp, private pickup instructions.
- Cloudinary photo upload with client preview, file-type constraints, and 5MB size limit.

### FR-3: Food Discovery & Filtering
- Search across title, description, and location strings.
- Filter by Category (`cooked_meals`, `bakery`, `produce`, `packaged`, `dairy`).
- Filter by City (`Delhi NCR`, `Mumbai`, `Pune`, `Noida`).
- Status toggle (`Available Now`, `Reserved`, `Delivered`, `All`).

### FR-4: Concurrency-Safe Portion Reservation
- Production path: atomically reserve a specified quantity via `claim_donation_atomic`. The deployed browser demo uses the local demo store instead.
- Prevent overclaiming or claiming by the listing's own donor.
- Update listing status to `reserved` when available quantity reaches 0.

### FR-5: Protected Logistics & Lifecycle Execution
- Restrict exact pickup notes to authorized claimants and donors.
- Recipient can cancel a demo claim, restoring portions in the browser-local store; production restoration is handled by the database path.
- Recipient/Volunteer can mark claim as `collected`.
- Recipient/Volunteer can mark claim as `delivered`.

### FR-6: Database-Driven Impact Metrics
- Aggregate metrics dynamically: portions listed, portions reserved, portions delivered, completed rescues, active donors, partner NGOs.
- Compute CO₂e offset using FAO/UNEP meal portion conversion (0.4 kg/meal * 2.5 kg CO₂e/kg food).

---

## 2. Non-Functional Requirements
- **Performance:** Initial page load under 1.5s; Cloudinary transformations loaded from edge CDN.
- **Accessibility:** Keyboard navigable controls, high-contrast text (`#1C1917` on `#FAF9F6`), visible focus rings.
- **Reliability:** The browser demo uses seeded data stored in localStorage. Missing upload configuration yields a labeled local preview, not a Cloudinary upload.
