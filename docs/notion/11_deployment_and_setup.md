# 11. Deployment & Local Setup Guide

## Local Demo

Install from the root lockfile with `npm ci`. Start the frontend with `npm run dev --workspace=@shareplate/web`. The demo uses browser-local data.

## Cloudinary

For real uploads, set `VITE_CLOUDINARY_CLOUD_NAME` and `VITE_CLOUDINARY_UPLOAD_PRESET` in `apps/web/.env` or as GitHub repository Variables. The preset must be configured for unsigned uploads in Cloudinary. The API secret belongs only in `apps/api/.env`; never add it to a `VITE_*` variable.

## GitHub Pages Demo

`.github/workflows/deploy-pages.yml` builds `apps/web` with `VITE_DEMO_MODE=true` and publishes `apps/web/dist`. Set repository Variables `VITE_CLOUDINARY_CLOUD_NAME`, `VITE_CLOUDINARY_UPLOAD_PRESET`, and `VITE_NOTION_URL`. The Notion URL is optional and public.

The Pages demo does not deploy Supabase or Express. The signed upload API and production database path require separate hosting and are not part of the static deployment.
