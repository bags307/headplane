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
├── server/          ← UPSTREAM ONLY. Never touch. Auth, sessions, Headscale API client.
├── routes/          ← UPSTREAM ONLY. Never touch. Kept as reference.
├── lexiq/
│   ├── routes/      ← OUR UI. Custom React components + thin loaders.
│   ├── mocks/       ← Mock fixture data for dev:ui mode.
│   ├── layout/      ← Custom app shell / layout component.
│   └── components/  ← Shared UI components / design system.
└── routes.ts        ← Routing manifest. UI routes point to lexiq/, server routes unchanged.
```

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
```

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
