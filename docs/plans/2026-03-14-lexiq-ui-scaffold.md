# LexIQ UI Scaffold Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Scaffold a clean custom UI layer (`app/lexiq/`) in the headplane fork that routes all UI pages through LexIQ-owned React components, enables upstream merges with zero conflicts, and provides a mock-data dev mode for frontend-only development.

**Architecture:** `app/routes.ts` is the single routing manifest — UI routes are redirected to `app/lexiq/routes/` while all server infrastructure (`app/server/`), auth routes, and utility routes remain at their original paths. `MOCK_MODE=true` env var short-circuits loaders to return fixture data from `app/lexiq/mocks/`, enabling HMR development without any running backend.

**Tech Stack:** React Router v7 (SSR), Hono, TypeScript, pnpm, Vite

---

## Task 1: Create feature branch

**Files:** none

**Step 1: Create and switch to feature branch**

```bash
cd /Users/brianbagdasarian/projects/headplane
git checkout -b feature/ui
```

**Step 2: Verify**

```bash
git branch --show-current
```

Expected: `feature/ui`

**Step 3: Commit**
No files changed yet — branch creation only.

---

## Task 2: Add `docs/dev/ui/README.md`

**Files:**

- Create: `docs/dev/ui/README.md`

**Step 1: Create directory and file**

Content:

```markdown
# LexIQ UI Development Guide

This document explains how the custom LexIQ UI is structured within the headplane fork,
and how to develop it without running the headscale/headplane backend.

## Architecture Overview

Headplane is a full-stack React Router v7 SSR application. The backend server
(`app/server/`) handles authentication, session management, and Headscale API
communication. The frontend (`app/routes/`) contains React components colocated
with their server-side loaders and actions.

### How We've Separated the Custom UI

We do NOT modify `app/server/` or `app/routes/`. Instead:
```

app/
├── server/ ← UPSTREAM ONLY. Never touch. Auth, sessions, Headscale API client.
├── routes/ ← UPSTREAM ONLY. Never touch. Kept as reference.
├── lexiq/
│ ├── routes/ ← OUR UI. Custom React components + thin loaders.
│ ├── mocks/ ← Mock fixture data for dev:ui mode.
│ ├── layout/ ← Custom app shell / layout component.
│ └── components/ ← Shared UI components / design system.
└── routes.ts ← Routing manifest. UI routes point to lexiq/, server routes unchanged.

````

`app/routes.ts` is the ONLY file that bridges upstream and our custom UI. When upstream
adds new routes, you add a matching entry in `lexiq/routes/` and update `routes.ts`.

### Merge Conflict Strategy

- `app/server/` → upstream writes here, we never touch → zero conflicts
- `app/routes/` → upstream writes here, we never touch → zero conflicts
- `app/routes.ts` → minimal change (path swaps). New upstream routes are one-line adds.
- `app/lexiq/` → upstream doesn't know this exists → zero conflicts

---

## Running the UI Dev Server (No Backend Required)

```bash
pnpm dev:ui
````

This starts the React Router dev server with `MOCK_MODE=true`. All route loaders
return fixture data from `app/lexiq/mocks/` instead of calling the Headscale API.
Full HMR is available. No Docker, no headscale, no headplane backend needed.

### Adding Mock Data

Each page has a corresponding mock file in `app/lexiq/mocks/`. To update fixture data:

1. Open `app/lexiq/mocks/<page>.ts`
2. Export a `mockLoader` function returning the shape expected by the route component
3. The route's loader automatically uses this when `MOCK_MODE=true`

---

## Adding a New Page

1. Create `app/lexiq/routes/<section>/overview.tsx`
2. Add loader (with mock branch), action (if needed), and default React component export
3. Update `app/routes.ts` to point the URL to your new file
4. Add mock fixture to `app/lexiq/mocks/<section>.ts`
5. Test with `pnpm dev:ui`

---

## Syncing with Upstream

```bash
git fetch upstream
git merge upstream/main
```

Conflicts will only ever appear in `app/routes.ts` (new route additions). Resolve by
adding matching entries pointing to `app/lexiq/routes/`.

````

**Step 2: Commit**
```bash
git add docs/dev/ui/README.md
git commit -m "docs: add LexIQ UI development guide"
````

---

## Task 3: Update root `README.md`

**Files:**

- Modify: `README.md`

**Step 1: Add LexIQ fork notice after the opening paragraph**

Add this section after the existing intro content, before the `## Deployment` section:

````markdown
## LexIQ Fork

This is the LexIQ fork of Headplane. The backend server is unmodified from upstream.
The frontend UI has been replaced with a LexIQ-branded interface under `app/lexiq/`.

See [docs/dev/ui/README.md](./docs/dev/ui/README.md) for the UI development guide.

```bash
# Develop the UI without a backend (mock data, full HMR)
pnpm dev:ui

# Run against a real headscale instance
pnpm dev
```
````

````

**Step 2: Commit**
```bash
git add README.md
git commit -m "docs: add LexIQ fork notice to README"
````

---

## Task 4: Create `AGENTS.md`

**Files:**

- Create: `AGENTS.md`

**Step 1: Create the file**

```markdown
# AGENTS.md

This file provides guidance to AI agents working with this repository.

## Overview

This is the **LexIQ fork** of [Headplane](https://github.com/tale/headplane), a web UI
for [Headscale](https://headscale.net). The backend is unmodified from upstream. The
frontend has been replaced with a LexIQ-branded UI under `app/lexiq/`.

## Repository Structure
```

app/
├── server/ ← UPSTREAM ONLY. Auth, sessions, Headscale API client. Never modify.
├── routes/ ← UPSTREAM ONLY. Original route files. Never modify.
├── lexiq/
│ ├── routes/ ← Custom UI routes. All UI work goes here.
│ ├── mocks/ ← Mock fixture data for dev:ui mode.
│ ├── layout/ ← Custom app layout/shell.
│ └── components/ ← Shared UI components.
├── components/ ← Upstream shared components. Prefer lexiq/components/ for new work.
└── routes.ts ← Routing manifest. UI routes → lexiq/. Server routes → unchanged.

````

## Development Commands

```bash
pnpm dev:ui          # Frontend dev server, mock data, no backend required (MOCK_MODE=true)
pnpm dev             # Full dev server, requires config.example.yaml and running headscale
pnpm build           # Production build
pnpm typecheck       # TypeScript type checking
pnpm test:unit       # Unit tests
pnpm lint            # Lint with oxlint
````

## Critical Rules

### Never Modify Upstream Files

- `app/server/` — authentication, sessions, Headscale API client
- `app/routes/` — original route components
- Any file NOT under `app/lexiq/` or `app/routes.ts`

### Route File Structure

Every file in `app/lexiq/routes/` must export:

1. `loader` — async function fetching data. MUST check `process.env.MOCK_MODE` first.
2. Default export — React component rendering the page.
3. Optionally `action` — form submission handler.

```typescript
// Pattern for every lexiq route file
export async function loader({ request, context }: Route.LoaderArgs) {
  if (process.env.MOCK_MODE) {
    const { mockLoader } = await import('~/lexiq/mocks/<page>')
    return mockLoader()
  }
  // real loader logic using context.auth, context.hsApi, etc.
}

export default function Page() {
  const data = useLoaderData<typeof loader>()
  return <div>...</div>
}
```

### Mock Data

Every route in `app/lexiq/routes/` has a corresponding mock in `app/lexiq/mocks/`.
Mock files export a `mockLoader()` function returning the same shape as the real loader.

### Updating `app/routes.ts`

This is the ONLY file that wires upstream routing to our UI. When adding a new page:

- Add the URL → `lexiq/routes/path` mapping
- Never change existing server/auth/utility route paths

## Upstream Sync

Pull upstream updates:

```bash
git fetch upstream
git merge upstream/main
```

Expected conflicts: only `app/routes.ts` (new route additions from upstream).
Resolution: add matching entries pointing to `app/lexiq/routes/`.

## Key Concepts

### React Router v7 SSR

- Loaders run server-side on every page load
- Actions handle form submissions server-side
- `context` (AppLoadContext) is injected by `app/server/index.ts`
- `context.auth` — authentication/authorization
- `context.hsApi` — Headscale API client
- `context.hs` — Headscale configuration reader
- `context.oidc` — OIDC configuration

### MOCK_MODE

When `MOCK_MODE=true`, loaders return fixture data and skip all context usage.
This enables full frontend development without any backend services.

## Testing

Unit tests live in `tests/unit/`. Integration tests in `tests/integration/`.
Run with `pnpm test:unit` and `pnpm test:integration`.

For UI components, use Vitest with the `unit` project config.

````

**Step 2: Commit**
```bash
git add AGENTS.md
git commit -m "docs: add AGENTS.md for AI agent guidance"
````

---

## Task 5: Scaffold `app/lexiq/` directory structure

**Files:**

- Create: `app/lexiq/mocks/index.ts`
- Create: `app/lexiq/mocks/machines.ts`
- Create: `app/lexiq/mocks/users.ts`
- Create: `app/lexiq/mocks/acls.ts`
- Create: `app/lexiq/mocks/dns.ts`
- Create: `app/lexiq/mocks/settings.ts`
- Create: `app/lexiq/routes/home.tsx`
- Create: `app/lexiq/routes/machines/overview.tsx`
- Create: `app/lexiq/routes/users/overview.tsx`
- Create: `app/lexiq/routes/acls/overview.tsx`
- Create: `app/lexiq/routes/dns/overview.tsx`
- Create: `app/lexiq/routes/settings/overview.tsx`
- Create: `app/lexiq/routes/settings/auth-keys/overview.tsx`
- Create: `app/lexiq/routes/settings/restrictions/overview.tsx`
- Create: `app/lexiq/layout/app.tsx`

**Step 1: Create mock fixtures**

`app/lexiq/mocks/machines.ts`:

```typescript
export function mockLoader() {
  return {
    nodes: [],
    users: [],
    magic: undefined,
    stats: undefined,
    writable: true,
  };
}
```

`app/lexiq/mocks/users.ts`:

```typescript
export function mockLoader() {
  return {
    users: [],
    writable: true,
  };
}
```

`app/lexiq/mocks/acls.ts`:

```typescript
export function mockLoader() {
  return {
    policy: '{\n  "acls": [\n    { "action": "accept", "src": ["*"], "dst": ["*:*"] }\n  ]\n}',
    writable: true,
  };
}
```

`app/lexiq/mocks/dns.ts`:

```typescript
export function mockLoader() {
  return {
    config: null,
    writable: true,
  };
}
```

`app/lexiq/mocks/settings.ts`:

```typescript
export function mockLoader() {
  return {
    config: null,
    writable: true,
    authKeys: [],
  };
}
```

`app/lexiq/mocks/index.ts`:

```typescript
export * from "./machines";
export * from "./users";
export * from "./acls";
export * from "./dns";
export * from "./settings";
```

**Step 2: Create stub route components**

Each file follows this pattern. Example — `app/lexiq/routes/machines/overview.tsx`:

```typescript
import { useLoaderData } from 'react-router'
import type { Route } from './+types/overview'

export async function loader({ request, context }: Route.LoaderArgs) {
  if (process.env.MOCK_MODE) {
    const { mockLoader } = await import('~/lexiq/mocks/machines')
    return mockLoader()
  }
  // Delegate to original loader logic
  const { loader: originalLoader } = await import('~/routes/machines/overview')
  return originalLoader({ request, context } as any)
}

export { machineAction as action } from '~/routes/machines/machine-actions'

export default function MachinesPage() {
  const data = useLoaderData<typeof loader>()
  return (
    <div>
      <h1>Machines</h1>
      <p>LexIQ UI — coming soon</p>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}
```

Create the same stub pattern for all other pages:

- `app/lexiq/routes/home.tsx`
- `app/lexiq/routes/users/overview.tsx`
- `app/lexiq/routes/acls/overview.tsx`
- `app/lexiq/routes/dns/overview.tsx`
- `app/lexiq/routes/settings/overview.tsx`
- `app/lexiq/routes/settings/auth-keys/overview.tsx`
- `app/lexiq/routes/settings/restrictions/overview.tsx`

**Step 3: Create layout stub**

`app/lexiq/layout/app.tsx`:

```typescript
import { Outlet } from 'react-router'

export default function LexIQLayout() {
  return (
    <div>
      <nav>LexIQ Navigation — placeholder</nav>
      <main>
        <Outlet />
      </main>
    </div>
  )
}
```

**Step 4: Commit**

```bash
git add app/lexiq/
git commit -m "feat: scaffold app/lexiq/ routes, mocks, and layout stubs"
```

---

## Task 6: Update `app/routes.ts` to use lexiq routes

**Files:**

- Modify: `app/routes.ts`

**Step 1: Swap UI routes to lexiq paths**

```typescript
import { index, layout, prefix, route } from "@react-router/dev/routes";

export default [
  // Utility Routes — UPSTREAM, do not change
  route("/healthz", "routes/util/healthz.ts"),

  // API Routes — UPSTREAM, do not change
  ...prefix("/api", [route("/info", "routes/util/info.ts")]),

  // Authentication Routes — UPSTREAM, do not change
  route("/login", "routes/auth/login/page.tsx"),
  route("/logout", "routes/auth/logout.ts"),
  route("/oidc/callback", "routes/auth/oidc-callback.ts"),
  route("/oidc/start", "routes/auth/oidc-start.ts"),
  route("/ssh", "routes/ssh/console.tsx"),

  // All the main logged-in routes — LEXIQ UI
  layout("lexiq/layout/app.tsx", [
    index("lexiq/routes/home.tsx"),
    route("/onboarding", "routes/users/onboarding.tsx"),
    route("/onboarding/skip", "routes/users/onboarding-skip.tsx"),

    ...prefix("/machines", [
      index("lexiq/routes/machines/overview.tsx"),
      route("/:id", "routes/machines/machine.tsx"),
    ]),

    route("/users", "lexiq/routes/users/overview.tsx"),
    route("/acls", "lexiq/routes/acls/overview.tsx"),
    route("/dns", "lexiq/routes/dns/overview.tsx"),

    ...prefix("/settings", [
      index("lexiq/routes/settings/overview.tsx"),
      route("/auth-keys", "lexiq/routes/settings/auth-keys/overview.tsx"),
      route("/restrictions", "lexiq/routes/settings/restrictions/overview.tsx"),
    ]),
  ]),
];
```

**Step 2: Commit**

```bash
git add app/routes.ts
git commit -m "feat: route UI pages through app/lexiq/"
```

---

## Task 7: Add `dev:ui` npm script

**Files:**

- Modify: `package.json`

**Step 1: Add script**

In `package.json`, add to the `scripts` object:

```json
"dev:ui": "MOCK_MODE=true react-router dev"
```

**Step 2: Commit**

```bash
git add package.json
git commit -m "feat: add dev:ui script for mock-data frontend development"
```

---

## Task 8: Test `dev:ui`

**Step 1: Run the dev server**

```bash
cd /Users/brianbagdasarian/projects/headplane
pnpm dev:ui
```

Expected: Vite dev server starts, no errors, serves on `http://localhost:5173/admin`

**Step 2: Verify pages load**

Check each route loads without crashing:

- `http://localhost:5173/admin/` → home stub
- `http://localhost:5173/admin/machines` → machines stub with mock data
- `http://localhost:5173/admin/users` → users stub
- `http://localhost:5173/admin/dns` → dns stub
- `http://localhost:5173/admin/acls` → acls stub

**Step 3: Stop server and fix any errors**

If type errors appear from missing `+types/` generated files, run:

```bash
pnpm typecheck
```

React Router generates `+types/` during build/dev. Errors here are expected on first run and resolve after the dev server starts.

---

## Task 9: Push to origin

**Step 1: Push feature branch**

```bash
git push -u origin feature/ui
```

**Step 2: Confirm**

```bash
git log --oneline origin/feature/ui
```

---

## Task 10: Update READMEs post-test

**Files:**

- Modify: `README.md` — add confirmed `dev:ui` usage with actual port
- Modify: `docs/dev/ui/README.md` — add any learnings from testing

**Step 1: Update if needed, commit and push**

```bash
git add README.md docs/dev/ui/README.md
git commit -m "docs: update README with confirmed dev:ui workflow"
git push
```
