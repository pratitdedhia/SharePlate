# 05. Architecture & Technical Decisions

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
- **Direct Signed Upload:** Rather than streaming megabyte files through our Node.js server, the server issues a cryptographically signed signature, allowing the browser to upload directly to Cloudinary.
- **Transformations on the Fly:** Dynamic format and quality conversion (`f_auto, q_auto`) drastically reduces mobile bandwidth consumption for volunteers on 4G networks.

### Database: Supabase PostgreSQL
- **ACID Transactions:** Concurrency-sensitive quantity reservations are handled natively in PostgreSQL via `SELECT ... FOR UPDATE` row locks.
- **Row Level Security (RLS):** Guarantees multi-tenant isolation at the database layer rather than relying solely on application-level filtering.

---

## 2. Alternatives Considered

| Decision Area | Chosen Approach | Alternative Considered | Why Alternative Was Rejected |
| :--- | :--- | :--- | :--- |
| **Media Handling** | Cloudinary Signed Upload | Storing base64 strings in Postgres | Storing images directly in database causes severe bloat, slow backup cycles, and poor CDN caching. |
| **Media Handling** | Cloudinary Server-Issued Signature | Unsigned Cloudinary Presets | Unsigned presets allow malicious users to upload arbitrary content or bypass folder constraints. |
| **Claim Concurrency** | PostgreSQL Stored Procedure with Row Lock | In-memory Node.js lock | Node.js in-memory locks fail when scaling across multiple server instances. |
| **Authentication** | Supabase Auth | Custom JWT + bcrypt | Supabase Auth provides secure password hashing, session refresh, and native RLS integration out of the box. |
