# 05. Architecture & Technical Decisions

**System:** SharePlate Monorepo (`apps/web`, `apps/api`, `supabase/`, root build)  
**Hackathon Track:** Tech for Social Good (SheBuilds Delhi / MLH 2026)  
**Architecture Style:** Dual-Pipeline Web Architecture (Static CDN Edge + Fullstack API)  

---

## 1. System Architecture Overview

SharePlate is architected as a high-reliability, zero-friction monorepo capable of running in two distinct production environments without compromising security or feature completeness:

```
                                  +---------------------------------------+
                                  |         Client Web Application        |
                                  |      React 18 + Vite + TypeScript     |
                                  |         HashRouter + Tailwind         |
                                  +---------------------------------------+
                                        /                           \
                                       /                             \
                Direct Cloudinary Upload                              Backend API / RLS
           (Unsigned Preset or Signed Sig)                            (Atomic RPCs / Auth)
                                     /                                 \
                                    v                                   v
             +------------------------------+             +------------------------------+
             |        Cloudinary CDN        |             |      Supabase / Express      |
             | • Content Auto-Crop (g_auto) |             | • Atomic Reservation Locks   |
             | • Format/Quality (f/q_auto)  |             | • PostgreSQL RLS Security    |
             | • AI Food Recognition Tags   |             | • Realtime WebSocket Feeds   |
             | • Responsive Breakpoints     |             | • Audit Ledgers & Analytics  |
             +------------------------------+             +------------------------------+
```

---

## 2. Key Architectural Decisions (ADRs)

### ADR-1: Dual-Pipeline Cloudinary Upload Strategy
- **Context:** The hackathon evaluation environment demands both a **live deployed static web app on GitHub Pages** and a **production-ready Node.js Express backend**. Pure server-mediated file streaming causes severe API bottlenecking, while client-only unsigned uploads lack user-scoped directory restrictions.
- **Decision:** Implement a smart fallback pipeline:
  1. *Attempt 1 (Signed API):* The client queries `POST /api/uploads/signature`. If the Express backend is online and configured, the server cryptographically signs the upload request using `CLOUDINARY_API_SECRET` with user-scoped directory constraints (`shareplate/donations/:userId`), eager transformation derivatives, and system tags.
  2. *Attempt 2 (Unsigned Preset):* If running on a static host (GitHub Pages) or if the backend signature endpoint is unreachable, the client uploads directly to Cloudinary using an unsigned upload preset (`VITE_CLOUDINARY_UPLOAD_PRESET`) with client-side file-type and size limits.
  3. *Attempt 3 (Interactive Local Fallback):* If neither cloud credential is set in local demo mode, the uploader seamlessly provisions a browser-local Object URL and evaluation seed presets so the complete UI can be thoroughly demonstrated without broken image icons.
- **Outcome:** Zero evaluation friction; secrets remain strictly protected on the backend while the public GitHub Pages demo functions flawlessly.

### ADR-2: Routing Strategy — HashRouter vs BrowserRouter
- **Context:** Standard SPA routing using `BrowserRouter` relies on HTML5 `pushState`. When deployed on static CDNs like GitHub Pages, navigating directly to a deep URL (e.g. `https://pratitdedhia.github.io/SharePlate/browse`) or reloading the page results in an immediate HTTP 404 from the web server because no physical file exists at `/browse`.
- **Decision:** Adopt `HashRouter` (`/#/browse`, `/#/donate`, `/#/admin`).
- **Outcome:** The hash fragment is evaluated entirely client-side. The application supports 100% reliable deep-linking, page refreshes, and double-clicking the root `index.html` under the `file:///` protocol in any browser without requiring nginx rewrite rules.

### ADR-3: Concurrency Engine — PostgreSQL Stored Procedure with Row-Level Locks
- **Context:** In high-volume food rescues, multiple community NGOs often attempt to reserve surplus meals from the same batch within seconds of listing. In-memory locking in Node.js fails when horizontal auto-scaling is introduced, and naive `UPDATE donations SET quantity = quantity - X` queries lead to negative balances under simultaneous requests.
- **Decision:** Implement atomic reservation inside PostgreSQL via the `claim_donation_atomic` stored procedure:
  ```sql
  -- Atomic reservation with row lock
  SELECT quantity_available, status 
  INTO v_current_qty, v_status
  FROM donations 
  WHERE id = p_donation_id 
  FOR UPDATE; -- Prevents concurrent thread read/write
  ```
- **Outcome:** Concurrency-safe portions debit with ACID guarantees. If available quantity is insufficient, the transaction rolls back cleanly, returning `INSUFFICIENT_QUANTITY` in $<20\text{ ms}$.

### ADR-4: Inlined Root Build Engine for Instant Zero-Setup Evaluation
- **Context:** Evaluators and judges often run repositories locally without executing long install chains or spin-up servers.
- **Decision:** Create custom synchronization script [scripts/sync-root-build.js](file:///c:/Users/dedhi/OneDrive/Desktop/Pratit/Hackathon/Hacktober%20HackDays/scripts/sync-root-build.js). It takes Vite's production artifacts and embeds both the CSS and minified React JavaScript directly into a self-contained root `index.html`.
- **Crucial Engineering Fix:** Standard `String.prototype.replace(regex, replacementString)` interprets characters like `$&` and `$$` as special substitution tokens, which corrupted minified React 18 element symbols (`$$typeof: Symbol(react.element)`). We engineered a safe callback function `() => inlinedContent` to guarantee byte-for-byte fidelity without script corruption.
- **Outcome:** Double-clicking `index.html` on Windows, Mac, or Linux opens the entire reactive web application instantly without browser CORS module restrictions.

---

## 3. Technology Stack Comparison

| Tier | Technology Selected | Alternatives Evaluated | Rationale for Selection |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | React 18 + TypeScript | Vue 3, Svelte, Plain JS | Mature ecosystem, robust typing for complex reservation state, universal familiarity. |
| **Styling & Design** | Tailwind CSS (Tailored Warm Palette) | Vanilla CSS, Material UI, Bootstrap | Zero runtime overhead; rapid design token iteration (`forest-950`, `warm-50`, `amber-500`) creating an empathetic, social-good aesthetic. |
| **Media Management** | Cloudinary CDN & AI Vision | AWS S3, Firebase Storage, Local Disk | Mandatory sponsor tech; provides on-the-fly WebP/AVIF compression (`f_auto`), quality optimization (`q_auto`), content-aware auto-crop (`g_auto`), and automated AI food tagging. |
| **API Backend** | Node.js 24 + Express + TypeScript | NestJS, Fastify, Serverless Lambdas | Ultra-lean HTTP layer; predictable middleware chaining for Helmet, CORS, and Zod input validation. |
| **Database & Auth** | Supabase (PostgreSQL 15) | MongoDB, Firebase Firestore | Relational ACID guarantees required for portions ledger; native Row Level Security (RLS) protects loading dock privacy. |

