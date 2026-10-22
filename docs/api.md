# SharePlate — REST API Contract & Specification

**Base URL:** `http://localhost:5000/api`  
**Authentication Scheme:** HTTP Bearer Token (`Authorization: Bearer <supabase_access_token>`)  
**Standard Response Format:** JSON `{ "success": boolean, "message"?: string, "data"?: any, "errors"?: any[] }`

---

## 1. System Health & Integration Status

### `GET /api/health`
Returns runtime health status and configuration verification for Cloudinary and Supabase.
- **Access:** Public
- **Response 200 OK:**
```json
{
  "status": "ok",
  "service": "SharePlate API",
  "version": "1.0.0",
  "timestamp": "2026-10-22T18:00:00.000Z",
  "environment": "development",
  "integrations": {
    "supabase": "connected",
    "cloudinary": "ready"
  },
  "event": "Hacktober HackDays 2026",
  "organizer": "SheBuilds Delhi Chapter"
}
```

---

## 2. Cloudinary Media Uploads

### `POST /api/uploads/signature`
Issues an authenticated cryptographic signature enabling the client browser to upload an image directly to Cloudinary without exposing backend secrets.
- **Access:** Authenticated (any verified user)
- **Response 200 OK:**
```json
{
  "success": true,
  "isConfigured": true,
  "signature": "c8a417b79d8e7c10b7a4f91244e8f7...",
  "timestamp": 1729620000,
  "folder": "shareplate/donations/a0000000-0000-0000-0000-000000000001",
  "apiKey": "123456789012345",
  "cloudName": "your-cloud-name",
  "maxFileSize": 5242880
}
```

---

## 3. Food Donations

### `GET /api/donations`
Query parameters:
- `category` (optional): `cooked_meals`, `bakery`, `produce`, `packaged`, `dairy`, `other`
- `city` (optional): Filter by city string (e.g. `Delhi NCR`, `Mumbai`, `Pune`)
- `status` (optional): `available`, `reserved`, `delivered`, `all` (default `available`)
- `search` (optional): Substring search across title, description, and location label.
- `limit` (default: 20), `offset` (default: 0).
- **Access:** Public (sensitive pickup instructions are masked).

### `GET /api/donations/:id`
Returns full donation details.
- **Access:** Public (sensitive `pickup_instructions` and donor phone number are redacted for unauthenticated browsers or non-claimants, revealed only to the owner donor or claim recipient).

### `POST /api/donations`
Publishes a new surplus food batch.
- **Access:** Authenticated (`donor` or `admin` role required)
- **Request Body (Zod Validated):**
```json
{
  "title": "Fresh Vegetable Pulao & Raita",
  "description": "Surplus lunchtime batch prepared in sanitized kitchen, packed in thermal containers.",
  "category": "cooked_meals",
  "quantity_total": 45,
  "quantity_unit": "portions",
  "pickup_deadline": "2026-10-23T18:00:00.000Z",
  "city": "Delhi NCR",
  "location_label": "DTU Campus, Rohini Sector 17",
  "pickup_instructions": "Report to Gate 2 security; canteen staff will bring containers down.",
  "ingredients": "Basmati rice, green peas, carrots, cumin, coriander",
  "allergens": "Dairy (ghee)",
  "image_url": "https://res.cloudinary.com/.../shareplate/demo/vegetable_biryani_01.jpg",
  "cloudinary_public_id": "shareplate/demo/vegetable_biryani_01"
}
```
- **Response 201 Created:** `{ "success": true, "data": { "id": "...", "status": "available", ... } }`

### `POST /api/donations/:id/cancel`
Cancels an unclaimed donation listing.
- **Access:** Owner Donor or Admin.

---

## 4. Reservations & Claims

### `POST /api/donations/:id/claims`
Atomically reserves a specified quantity of portions.
- **Access:** Authenticated (`recipient`, `volunteer`, or `admin`)
- **Request Body:**
```json
{
  "quantity": 25,
  "notes": "Reserved for evening food distribution at Rohini transit camp"
}
```
- **Response 201 Created:**
```json
{
  "success": true,
  "message": "Successfully reserved 25 portions!",
  "data": {
    "claim_id": "f0000000-0000-0000-0000-000000000001",
    "quantity_claimed": 25,
    "remaining_available": 20,
    "status": "claimed"
  }
}
```

### `GET /api/claims/mine`
Retrieves all claims associated with the current user (claims made as recipient, or claims on listings owned as donor).
- **Access:** Authenticated.

### `PATCH /api/claims/:id/cancel`
Cancels an active claim and atomically returns the reserved portions to the donation.
- **Access:** Recipient or Owner Donor.

### `POST /api/claims/:id/collect`
Marks claimed food as picked up / in transit.
- **Access:** Recipient, Volunteer, or Donor.

### `POST /api/claims/:id/deliver`
Marks claimed food as distributed to community beneficiaries. Triggers completion transition on the parent donation if all portions have been delivered.
- **Access:** Recipient, Volunteer, or Admin.

---

## 5. Impact Metrics

### `GET /api/impact/summary`
Returns database-computed impact aggregations.
- **Response 200 OK:**
```json
{
  "success": true,
  "metrics": {
    "donationsListed": 6,
    "portionsListed": 290,
    "portionsReserved": 40,
    "portionsDelivered": 90,
    "completedRescues": 2,
    "activeDonors": 4,
    "participatingRecipients": 3,
    "activeClaims": 1,
    "completionRatePercent": 100,
    "estimatedFoodRescuedKg": 36,
    "estimatedCo2eSavedKg": 90,
    "methodologyNote": "Estimates based on FAO average meal portion (400g) and UNEP food waste emission factor (2.5 kg CO2e/kg food). Only delivered portions are counted."
  }
}
```
