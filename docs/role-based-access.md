# SharePlate Role-Based Access Control (RBAC)
**Hacktober HackDays 2026 | SheBuilds Delhi Chapter | Powered by MLH**

---

## 1. Role Hierarchy & Matrix

SharePlate enforces a 4-tier role-based access model across both client and server:

| Role | Role Identifier | Primary Capabilities | Restricted Capabilities |
|---|---|---|---|
| **Donor** | `donor` | List surplus food batches, manage listings, view incoming NGO claims, confirm collections | Cannot claim food, cannot access moderation queue |
| **Recipient** | `recipient` | Browse available food, atomically claim portions, track pickup logistics, confirm deliveries | Cannot create food listings, cannot access admin panel |
| **Volunteer** | `volunteer` | View transport opportunities, accept delivery routes, update transport status, complete drops | Cannot create food listings, cannot manage other users |
| **Admin** | `admin` | Full platform oversight, user management, listing moderation, safety reports resolution | Governance only; actions logged to audit trail |

---

## 2. Frontend Route Protection & Role Guards

### RoleGuard Component (`src/routes/RoleGuard.tsx`)
```tsx
<Route
  path="/dashboard/donor"
  element={
    <ProtectedRoute>
      <RoleGuard allowedRoles={['donor']}>
        <DonorDashboard />
      </RoleGuard>
    </ProtectedRoute>
  }
/>
```

When an authenticated user attempts to access an unauthorized portal (e.g. a `recipient` attempting to access `/dashboard/donor`):
1. `RoleGuard` detects `!allowedRoles.includes(user.role)`.
2. Triggers an inline notification informing the user of the restriction.
3. Automatically redirects the user to their own verified role dashboard (`/dashboard/${user.role}`).
4. URL tampering is thereby neutralized without degrading user experience.

---

## 3. Backend Express RBAC Middleware

Privileged API endpoints in the Express server enforce role checking via `requireRoles`:

```typescript
// apps/api/src/middleware/rbac.ts
export const requireRoles = (allowedRoles: Array<AuthenticatedUser['role']>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Forbidden: Resource requires one of [${allowedRoles.join(', ')}]`,
      });
      return;
    }
    next();
  };
};
```

---

## 4. PostgreSQL Row Level Security (RLS)

- `profiles`: All users can view public profile details; users can update only their own row.
- `donations`: Active listings viewable by all; inserts and updates strictly restricted to `auth.uid() = donor_id`.
- `claims`: Recipients can create claims via atomic RPC function `claim_donation_atomic`; claims viewable only by recipient or donor.
- `reports`: Submissions restricted to authenticated reporters; review and resolution restricted to platform administrators.
