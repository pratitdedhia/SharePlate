# SharePlate — Cloudinary Integration Architecture

**Hacktober HackDays 2026 Mandatory Technology**  
**Role:** Direct image upload and responsive media delivery; upload configuration is required for real Cloudinary storage.

## Deployment Status

The GitHub Pages build targets `apps/web` in demo mode. With `VITE_CLOUDINARY_CLOUD_NAME` and `VITE_CLOUDINARY_UPLOAD_PRESET` set as repository Variables, the static app uploads unsigned directly to Cloudinary. If the Express `/uploads/signature` API is reachable and configured, the app tries signed upload first. If neither path is available, it shows a labeled local preview; that preview is not uploaded. The API and Supabase are not deployed with the Pages demo.

---

## 1. Why Cloudinary is Critical for SharePlate

In community food rescue, visual inspection is paramount:
1. **Sensory Verification:** Recipients (NGO coordinators and community kitchen heads) need to verify freshness, packaging integrity, and portion volume before dispatching volunteers.
2. **Responsive delivery:** Listing images request automatic format and quality transformations at 400, 800, and 1200 pixel widths. The uploader reports measured original and transformed bytes only when the transformed asset can be fetched.
3. **Secret handling:** The signed API path keeps the Cloudinary API secret on the server. The static demo uses an unsigned preset and does not include an API secret in client code.

---

## 2. Upload Order

```mermaid
sequenceDiagram
    autonumber
    actor Donor as Food Donor (Browser)
    participant API as Express API Server
    participant Cloud as Cloudinary Media Cloud
    participant DB as Supabase PostgreSQL

    Donor->>Donor: Selects photo & validates format (JPEG/PNG/WebP, <5MB)
    Donor->>API: POST /api/uploads/signature (when API is configured)
    Note over API: Signed parameters are generated on the server; API secret remains server-side
    API-->>Donor: Returns signed upload parameters
    Donor->>Cloud: Signed upload; if unavailable, unsigned upload_preset
    Cloud-->>Donor: { secure_url, public_id, bytes, format, width, height }
    Donor->>Donor: Store URL and public_id in the demo browser store
```

---

## 3. Dynamic Transformations & Delivery Optimization

SharePlate leverages Cloudinary's dynamic URL transformations on all listing views:

### 3.1 Listing Images
```
https://res.cloudinary.com/:cloud/image/upload/c_fill,w_800,h_600,g_auto,q_auto,f_auto/:publicId
```
- `c_fill,w_600,h_400`: Ensures uniform aspect ratios across all cards, preventing layout shifts.
- `g_auto`: AI-assisted gravity focuses the crop on the main subject (the food tray).
- `q_auto`: Automatically adjusts compression level based on image content.
- `f_auto`: Automatically selects the most modern format supported by the client browser (e.g., AVIF or WebP on Chrome, JPEG on older clients).

Listing views use a `srcset` at 400/800/1200 widths and `loading="lazy"`.

### 3.2 Detail View (`DonationDetailPage.tsx`)
```
https://res.cloudinary.com/:cloud/image/upload/c_fill,w_1000,h_600,g_auto,q_auto,f_auto/:publicId
```

---

## 4. Security & Isolation Controls

1. **Secret Isolation:** `CLOUDINARY_API_SECRET` resides strictly in `apps/api/.env` and is never bundled in frontend assets.
2. **Upload presets:** The unsigned preset must be configured as unsigned in Cloudinary. Do not put `CLOUDINARY_API_SECRET` or signed credentials in Vite variables.
3. **Size & Type Constraints:** Pre-upload checks reject files larger than 5MB or non-image MIME types.
4. **Fallback labeling:** If no upload path is configured, a local preview is labeled “Demo preview — not uploaded to Cloudinary”. Unsplash is only a visibly labeled delivery fallback; it is not presented as uploaded media.

---

## 5. Environment Configuration

### Backend (`apps/api/.env`)
```bash
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_FOLDER=shareplate/donations
CLOUDINARY_MAX_FILE_SIZE_MB=5
```

### Frontend (`apps/web/.env`)
```bash
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_unsigned_upload_preset
```
