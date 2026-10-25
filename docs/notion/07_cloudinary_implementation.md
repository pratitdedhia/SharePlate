# 07. Cloudinary Implementation Evidence

**Hackathon Requirement:** Mandatory Use of Cloudinary in Application  

---

## 1. Architectural Implementation Details

Cloudinary is used by the React frontend when public Cloudinary configuration is supplied. The Pages demo uses an unsigned preset. The Express API contains an optional signed-upload path; it is not deployed with GitHub Pages.

### 1.1 Backend Signature Endpoint (`apps/api/src/routes/uploads.ts`)
```typescript
router.post('/signature', authenticateToken, (req, res) => {
  const signatureData = generateUploadSignature(req.user.id);
  res.status(200).json({ success: true, ...signatureData });
});
```
- Parameters signed: `folder: shareplate/donations/:userId`, `timestamp`.
- Hash algorithm: SHA-1 / SHA-256 via Cloudinary SDK `cloudinary.utils.api_sign_request()`.
- Result: The secret key never leaves the backend environment.

### 1.2 Frontend Image Uploader Component (`apps/web/src/components/donations/ImageUploader.tsx`)
- Drag-and-drop or file selection.
- Validates JPEG, PNG, or WebP under 5MB.
- Validates image MIME types (JPEG, PNG, WebP) and a 5 MB maximum before upload.
- Upload order is signed API path, then unsigned preset, then a local preview labeled “Demo preview — not uploaded to Cloudinary”.
- Sends `shareplate` and `food-donation` tags plus context on unsigned upload.
- Stores the Cloudinary `public_id` and delivery URL on successful upload. The UI displays response format and dimensions and measures transformed bytes where fetch succeeds.

### 1.3 Dynamic Transformation Helper (`apps/web/src/lib/cloudinary.ts`)
```typescript
export const getCloudinaryUrl = (publicIdOrUrl, options) => {
  const { width = 800, height = 600, crop = 'fill', gravity = 'auto', quality = 'auto', format = 'auto' } = options;
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/c_${crop},w_${width},h_${height},g_${gravity},q_${quality},f_${format}/${publicIdOrUrl}`;
};
```

---

## 2. Delivery Behavior
- Listing images that resolve to Cloudinary use `c_fill,g_auto,f_auto,q_auto` with responsive `srcset` widths of 400, 800, and 1200 pixels and lazy loading.
- Byte savings are shown only from the selected file's `file.size` and a successful fetch of the transformed URL. No fixed compression savings are claimed.
- If Cloudinary is not configured, the UI identifies the local preview or Unsplash fallback; neither is presented as an uploaded Cloudinary asset.
