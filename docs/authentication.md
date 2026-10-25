# SharePlate Authentication Architecture & Guide
**Hacktober HackDays 2026 | SheBuilds Delhi Chapter | Powered by MLH**

---

## 1. Overview & Experience Principles

SharePlate's authentication system delivers a hospital-management-grade, high-integrity user access experience tailored directly to food rescue:
- **Zero Ambiguity:** Strict email format, password matching, Indian mobile number verification, and inline form feedback.
- **Trusted Role Authorization:** User roles are never trusted from client-provided state alone; roles are authorized strictly against PostgreSQL database records (`public.profiles`) and server-side RBAC middleware.
- **Session Continuity:** Authenticated sessions persist seamlessly across browser reloads via Supabase Auth and token storage.
- **Hackathon Quick Demo Access:** Instant 1-click evaluation for judges across all 4 platform personas with pre-seeded, realistic demonstration data.

---

## 2. Authentication Flow

### Standard Login (`/login`)
1. **User Input:** User provides email and password.
2. **Password Visibility:** Integrated toggle button allows users to inspect or mask their input.
3. **Validation:** Checks email structure and non-empty password.
4. **Credential Verification:**
   - In production / live configuration, calls `supabase.auth.signInWithPassword({ email, password })`.
   - In offline / local evaluation preview mode, verifies against pre-seeded or registered demo credentials.
5. **Authoritative Profile Check:**
   - Queries `public.profiles` for `id`, `role`, and `is_active`.
   - If `is_active === false`, the login is immediately aborted and the user is alerted that their account has been suspended by governance.
6. **Session Establishment:** Token is stored in `localStorage` (`shareplate_token`) and profile in `shareplate_current_user`.
7. **Role-Specific Redirection:** Automatically routes user directly to their authorized portal:
   - Donor: `/dashboard/donor`
   - Recipient: `/dashboard/recipient`
   - Volunteer: `/dashboard/volunteer`
   - Admin: `/dashboard/admin`

---

## 3. Quick Demo Access (Judges & Evaluation)

Below the login form, the **Quick Demo Access** section exposes four 1-click persona buttons:

| Demo Persona | Role | Seeded Organization | Default Destination |
|---|---|---|---|
| **Continue as Donor** | `donor` | DTU Campus Central Canteen | `/dashboard/donor` |
| **Continue as Recipient** | `recipient` | Robin Hood Army - Delhi Chapter | `/dashboard/recipient` |
| **Continue as Volunteer** | `volunteer` | Youth For Food Relief | `/dashboard/volunteer` |
| **Continue as Admin** | `admin` | SharePlate Operations Admin | `/dashboard/admin` |

Each demo button authenticates into a real session state with verified database records and redirects immediately to the designated dashboard. Every demo session is marked with a prominent `DEMO ACCOUNT` badge.

---

## 4. Password Recovery Flow (`/forgot-password` & `/reset-password`)

1. **Request Reset:** User navigates to `/forgot-password`, enters their registered email, and submits.
2. **Supabase PKCE Dispatch:**
   - Invokes `supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/reset-password' })`.
   - Displays clear success alert with instructions.
3. **Password Update:**
   - User follows the reset link to `/reset-password`.
   - Submits new password with confirmation and password visibility toggles.
   - Invokes `supabase.auth.updateUser({ password: newPassword })`.
   - Redirects to `/login` upon success.

---

## 5. Session Restoration & Protected Routes

- `AuthProvider` initializes session state on startup.
- `ProtectedRoute` renders an accessible spinner while the session is evaluated, preventing flash-of-unauthenticated-state.
- Unauthenticated requests to protected endpoints are redirected to `/login` with `state: { from: location }`.
- `RoleGuard` prevents cross-role URL manipulation (e.g. donor attempting to navigate to `/dashboard/admin` is redirected to `/dashboard/donor`).
