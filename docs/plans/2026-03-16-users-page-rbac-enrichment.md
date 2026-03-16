# Users Page RBAC + OIDC Enrichment Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add three enrichments to the headplane users page: (1) OIDC/Local provider badge per user, (2) org name display from the Keycloak token, and (3) `view-users` role gating so users without the role only see themselves.

**Architecture:** All changes are in `app/lexiq/routes/users/` and `app/lexiq/mocks/users.ts`. The loader passes two new fields to the component: `canViewUsers` (boolean from OIDC token role check) and `orgName` (string from OIDC token `organization` claim). The component renders a provider badge column and an org header. No new API calls — all data comes from the existing OIDC context and headscale user `provider` field.

**Tech Stack:** React Router v7 SSR, TypeScript, Tailwind CSS v4, existing headplane server context (`context.oidc`, `context.auth`)

---

## Full Context for Fresh Agent

### Repository

- **Repo:** `/Users/brianbagdasarian/projects/headplane` (fork: `bags307/headplane`)
- **Active branch:** `feature/new-ui`
- **Upstream:** `tale/headplane` — DO NOT modify `app/server/`, `app/routes/`, or `app/root.tsx`
- **Our UI layer:** `app/lexiq/` — all UI work goes here

### Architecture

```
app/
├── server/          ← UPSTREAM ONLY. Never touch.
├── routes/          ← UPSTREAM ONLY. Never touch.
├── lexiq/
│   ├── routes/      ← Our UI pages. All changes here.
│   │   └── users/
│   │       └── overview.tsx   ← MODIFY this file
│   ├── mocks/
│   │   └── users.ts           ← MODIFY this file
│   ├── components/
│   │   └── badge.tsx          ← USE this (already exists)
│   └── layout/
└── routes.ts        ← Points /users → lexiq/routes/users/overview.tsx
```

### Dev workflow

```bash
cd /Users/brianbagdasarian/projects/headplane
pnpm dev:ui   # Runs on port 3001, MOCK_MODE=true, no auth, full HMR
```

Visit `http://localhost:3001/admin/users` to test.

### MOCK_MODE

When `MOCK_MODE=true`, the loader returns early with data from `~/lexiq/mocks/users.ts`. The real loader (using `context.auth`, `context.oidc`) is bypassed. Mocks must reflect the enriched shape.

### Keycloak Token Structure (CONFIRMED)

The OIDC access token for the `headplane` client contains:

```json
{
  "organization": ["conifer-holdings"],
  "resource_access": {
    "headplane": {
      "roles": ["view-users"]
    }
  }
}
```

- `organization[0]` = the org this user belongs to
- `resource_access.headplane.roles.includes("view-users")` = can see all users in their org

In the server loader, the OIDC connector is at `context.oidc`. The principal (logged-in user) is obtained via `context.auth.require(request)`. For OIDC users, `principal.kind === "oidc"` and the token claims can be accessed via the OIDC session.

**IMPORTANT:** Do not add new dependencies. The role check should use the existing `principal` object from `context.auth.require()`. Headplane already stores the OIDC `sub` and role in the session. Check the `context.auth.roleForSubject()` method which already returns the headplane role. For the `view-users` check, use `context.oidc` to get the token claims OR check if the principal's role has the capability.

**Simplification:** The existing `Capabilities.read_users` check in the loader already handles who can see users. For this implementation, add `canViewUsers` to the loader return as `true` always (since the capability check already filters). The `view-users` Keycloak role enrichment can be added in a future iteration. Focus on the OIDC/Local badge and org name.

### Headscale User Type

```typescript
// app/types/User.ts
interface User {
  id: string;
  name: string;
  createdAt: string;
  displayName?: string;
  email?: string;
  providerId?: string; // e.g. "https://auth.remodl.ai/realms/remodl/1fad5a9f-..."
  provider?: string; // "oidc" for OIDC users, undefined for local
  profilePicUrl?: string;
}
```

- `provider === "oidc"` → OIDC user
- `provider` is undefined/absent → Local user (created via CLI)

### Existing Badge component

```typescript
// app/lexiq/components/badge.tsx — already exists, use this
import { Badge } from "~/lexiq/components/badge";
// Usage: <Badge color="blue">OIDC</Badge> or <Badge color="gray">Local</Badge>
```

### Current loader return shape (DO NOT BREAK)

```typescript
return {
  writable: boolean,
  oidc: { issuer: string } | undefined,
  roles: string[],          // headplane RBAC roles per user
  magic: string | undefined,
  users: UserMachine[],     // User + machines[]
  headscaleUsers: { id, name, claimed }[],
  userLinks: Record<string, string | undefined>,
}
```

### New fields to ADD to loader return

```typescript
canViewUsers: true,         // always true since loader already checks Capabilities.read_users
orgName: string | undefined // from context.oidc?.connector?.get()... OR hardcode from config
```

For `orgName`: headplane doesn't expose org name from the token directly in server context. Simplest approach: read it from headscale config (`context.hs.c?.dns.base_domain` gives the tailnet domain, not the org). **Use the headscale server URL domain as fallback, or skip `orgName` for now and just add the OIDC/Local badge.**

**REVISED SCOPE:** Focus on what's achievable without additional Keycloak API calls:

1. OIDC/Local badge (zero new API calls — just `user.provider === "oidc"`)
2. `canViewUsers: true` in loader (future: wire to token role)
3. Page heading update ("Users" → "Users — {tailnet domain}" using `magic` that's already returned)

---

## Task 1: Update mock data to include provider info for multiple user types

**Files:**

- Modify: `app/lexiq/mocks/users.ts`

**Goal:** Add a second mock user (local/CLI user) so both OIDC and Local badges are visible in dev:ui.

**Step 1: Read current mock**

Read `/Users/brianbagdasarian/projects/headplane/app/lexiq/mocks/users.ts` to understand current shape.

**Step 2: Update the mock**

Replace the content of `app/lexiq/mocks/users.ts` with:

```typescript
const mockOidcUser = {
  id: "1",
  name: "brian",
  displayName: "Brian Bagdasarian",
  email: "bb@coniferhg.com",
  createdAt: "2026-01-01T00:00:00Z",
  provider: "oidc",
  providerId: "https://auth.remodl.ai/realms/remodl/1fad5a9f-bb52-43c8-931b-b7f52e3205c5",
  profilePicUrl: undefined as string | undefined,
};

const mockLocalUser = {
  id: "2",
  name: "admin-cli",
  displayName: "Admin CLI",
  email: undefined as string | undefined,
  createdAt: "2026-01-10T00:00:00Z",
  provider: undefined as string | undefined,
  providerId: undefined as string | undefined,
  profilePicUrl: undefined as string | undefined,
};

const mockNode = {
  id: "1",
  machineKey: "mkey:abc123",
  nodeKey: "nodekey:abc123",
  discoKey: "discokey:abc123",
  ipAddresses: ["100.64.0.1", "fd7a:115c:a1e0::1"],
  name: "macstudio",
  givenName: "macstudio",
  user: mockOidcUser,
  lastSeen: new Date().toISOString(),
  expiry: null,
  createdAt: "2026-01-01T00:00:00Z",
  registerMethod: "REGISTER_METHOD_OIDC" as const,
  tags: [],
  online: true,
  approvedRoutes: [],
  availableRoutes: [],
  subnetRoutes: [],
};

export function mockLoader() {
  return {
    writable: true,
    canViewUsers: true,
    orgName: "conifer-holdings",
    oidc: {
      issuer: "https://auth.remodl.ai/realms/remodl",
    },
    roles: ["owner", "no-oidc"],
    magic: "lexiq.local",
    users: [
      { ...mockOidcUser, machines: [mockNode] },
      { ...mockLocalUser, machines: [] },
    ],
    headscaleUsers: [
      { id: "1", name: "Brian Bagdasarian", claimed: true },
      { id: "2", name: "admin-cli", claimed: false },
    ],
    userLinks: {
      "1": "1fad5a9f-bb52-43c8-931b-b7f52e3205c5",
    },
  };
}
```

**Step 3: Verify dev:ui still starts**

```bash
cd /Users/brianbagdasarian/projects/headplane && pnpm dev:ui
```

Visit `http://localhost:3001/admin/users` — should render without errors.

**Step 4: Commit**

```bash
git add app/lexiq/mocks/users.ts
git commit -m "feat(mock): add local user to users mock, add canViewUsers + orgName fields"
```

---

## Task 2: Add `canViewUsers` and `orgName` to the real loader

**Files:**

- Modify: `app/lexiq/routes/users/overview.tsx`

**Goal:** Pass `canViewUsers` and `orgName` from the server loader so the component can use them.

**Step 1: Read the loader**

Read `app/lexiq/routes/users/overview.tsx` lines 22-119 to understand the existing loader.

**Step 2: Add new fields to the loader return**

In the `return` statement of the loader (around line 106), add two fields:

```typescript
return {
  writable: writablePermission,
  canViewUsers: true, // TODO: wire to token resource_access.headplane.roles["view-users"]
  orgName: context.hs.c?.dns.base_domain, // tailnet domain as org display name
  oidc: context.config.oidc ? { issuer: context.config.oidc.issuer } : undefined,
  roles,
  magic,
  users,
  headscaleUsers,
  userLinks,
};
```

**Step 3: Verify TypeScript compiles**

```bash
cd /Users/brianbagdasarian/projects/headplane && pnpm typecheck
```

Expected: no new errors related to the users route.

**Step 4: Commit**

```bash
git add app/lexiq/routes/users/overview.tsx
git commit -m "feat(users): add canViewUsers and orgName to loader return"
```

---

## Task 3: Add Provider badge column to the users table component

**Files:**

- Modify: `app/lexiq/routes/users/overview.tsx` (the `Page` component, not the loader)

**Goal:** Add a "Provider" column to the users table showing an OIDC or Local badge for each user.

**Step 1: Read the Page component**

Read `app/lexiq/routes/users/overview.tsx` from line 123 to end to understand the existing table/list structure.

**Step 2: Add the Badge import**

Near the top of the file (after existing imports), add:

```typescript
import { Badge } from "~/lexiq/components/badge";
```

**Step 3: Find where user rows are rendered**

Look for the `UserRow` component usage and where the user list is mapped/rendered. The `UserRow` component is in `./components/user-row`. We need to either:

- Add the badge ABOVE the UserRow list (as a separate column header + cell), OR
- Wrap each row with a badge indicator

**Simplest approach:** Add an info line below each user's name showing their provider type. Find where `users.map(...)` or `<UserRow />` is called. Before or after each `<UserRow />`, add:

```tsx
<div className="flex items-center gap-2 mt-1">
  {user.provider === "oidc" ? <Badge color="blue">OIDC</Badge> : <Badge color="gray">Local</Badge>}
  {loaderData.orgName && user.provider === "oidc" && (
    <span className="text-xs text-gray-500 dark:text-gray-400">{loaderData.orgName}</span>
  )}
</div>
```

**If the users are rendered as a list/cards** (not a standard HTML table), find the outermost user mapping and add the badge. The exact location depends on what you find in the component.

**Step 4: Update the page heading**

Find the page title/heading element. Change it to show the org name when available:

```tsx
<h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
  Users
  {loaderData.orgName && (
    <span className="ml-2 text-base font-normal text-gray-500 dark:text-gray-400">
      — {loaderData.orgName}
    </span>
  )}
</h2>
```

**Step 5: Verify in dev:ui**

Visit `http://localhost:3001/admin/users`. Expected:

- Page heading shows "Users — lexiq.local"
- Each user row has a blue "OIDC" or gray "Local" badge
- OIDC users show the org name next to their badge

**Step 6: Commit**

```bash
git add app/lexiq/routes/users/overview.tsx
git commit -m "feat(users): add OIDC/Local provider badge and org name display"
```

---

## Task 4: Update mocks index and push

**Files:**

- Modify: `app/lexiq/mocks/index.ts` (if it re-exports users mock)
- No change needed if index.ts already exports from users.ts

**Step 1: Check index.ts**

Read `app/lexiq/mocks/index.ts`. If it exports from `./users`, no change needed. If it exports individual functions, ensure `mockLoader` from users is exported.

**Step 2: Push to origin**

```bash
git push origin feature/new-ui
```

**Step 3: Update docs/dev/ui/README.md**

Add a note about the users page enrichment pattern:

```markdown
## Users Page Enrichment

The users page shows:

- **Provider badge**: `user.provider === "oidc"` → blue "OIDC" badge, otherwise gray "Local"
- **Org name**: from `loaderData.orgName` (tailnet base domain in real mode, "conifer-holdings" in mock)
- **canViewUsers**: always `true` when loader runs (capability check already gates access)

Future: wire `canViewUsers` to `resource_access.headplane.roles["view-users"]` from the OIDC token.
```

**Step 4: Commit and push**

```bash
git add docs/dev/ui/README.md
git commit -m "docs: document users page enrichment pattern"
git push origin feature/new-ui
```

---

## What NOT to do

- Do NOT add Keycloak Admin API calls (no service account, no runtime token exchange)
- Do NOT modify `app/routes/users/` (upstream, read-only)
- Do NOT modify `app/server/` (upstream, read-only)
- Do NOT add new npm dependencies
- Do NOT wire `canViewUsers` to the actual Keycloak token yet — leave it as `true` for now with a TODO comment

## Testing

After completing all tasks, verify:

1. `pnpm dev:ui` starts without errors
2. `http://localhost:3001/admin/users` shows the users list
3. First user (Brian Bagdasarian) has blue "OIDC" badge + "conifer-holdings" org
4. Second user (admin-cli) has gray "Local" badge, no org
5. Page heading shows "Users — lexiq.local"
6. No TypeScript errors: `pnpm typecheck`
