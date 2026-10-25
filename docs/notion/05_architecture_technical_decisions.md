# 05. Architecture & Technical Decisions

**Deployment note:** GitHub Pages serves `apps/web` in browser-local demo mode. Supabase and Express are available as repository production architecture, not deployed services.

---

## 1. Technical Stack Rationale

### Frontend: React 18 + Vite + Tailwind CSS + TypeScript
- **Why Vite:** Instant Hot Module Replacement (HMR) and optimized Rollup-based production builds (built in ~3.3s).
- **Why Tailwind CSS:** Enables rapid iteration on a cohesive, warm social-good color scheme without bloated CSS runtime libraries.
- **Why TypeScript:** Catches invalid status transitions and missing API properties at compile-time across both frontend and backend.

### Backend: Node.js 24 + Express + Zod
- **Why Express:** Lightweight, battle-tested HTTP layer with clear middleware chaining for authentication, CORS, Helmet headers, and input validation.
- **Why Zod:** Provides runtime schema validation for incoming JSON payloads with clear, user-friendly error messages.

### Cloudinary: Mandatory Hackathon Integration
- **Static demo upload:** With the public cloud name and unsigned preset configured, the browser uploads directly to Cloudinary using `upload_preset`.
- **Optional signed path:** If the Express signature endpoint is reachable and configured, the browser tries the server-signed path first. The API secret remains server-side.
- **No-upload fallback:** If neither upload path is available, the app shows a labeled local preview and does not record it as a Cloudinary asset.
- **Responsive delivery:** Cloudinary assets request `c_fill,g_auto,f_auto,q_auto` variants at 400, 800, and 1200 pixel widths. No fixed compression percentage is claimed.

### Database: Supabase PostgreSQL
- **ACID Transactions:** Concurrency-sensitive quantity reservations are handled natively in PostgreSQL via `SELECT ... FOR UPDATE` row locks.
- **Row Level Security (RLS):** Guarantees multi-tenant isolation at the database layer rather than relying solely on application-level filtering.

---

## 2. Alternatives Considered

| Decision Area | Chosen Approach | Alternative Considered | Why Alternative Was Rejected |
| :--- | :--- | :--- | :--- |
| **Media Handling** | Unsigned preset for static demo; signed upload supported by API | Storing base64 strings in Postgres | Cloudinary provides image delivery and transformation; the unsigned preset must be restricted in Cloudinary settings. |
| **Claim Concurrency** | Browser-local demo store; SQL atomic procedure for production | Treating the demo as shared transactional state | Browser-local data cannot guarantee concurrent reservation across browsers or devices. |
| **Claim Concurrency** | PostgreSQL Stored Procedure with Row Lock | In-memory Node.js lock | Node.js in-memory locks fail when scaling across multiple server instances. |
| **Authentication** | Supabase Auth | Custom JWT + bcrypt | Supabase Auth provides secure password hashing, session refresh, and native RLS integration out of the box. |
