# AGENTS.md

This file provides guidance to AI agents working with this repository.

## Overview

This is the **LexIQ fork** of [Headplane](https://github.com/tale/headplane), a web UI
for [Headscale](https://headscale.net). The backend is unmodified from upstream. The
frontend has been replaced with a LexIQ-branded UI under `app/lexiq/`.

## Repository Structure

```
app/
├── server/          ← UPSTREAM ONLY. Auth, sessions, Headscale API client. Never modify.
├── routes/          ← UPSTREAM ONLY. Original route files. Never modify.
├── lexiq/
│   ├── routes/      ← Custom UI routes. All UI work goes here.
│   ├── mocks/       ← Mock fixture data for dev:ui mode.
│   ├── layout/      ← Custom app layout/shell.
│   └── components/  ← Shared UI components.
├── components/      ← Upstream shared components. Prefer lexiq/components/ for new work.
└── routes.ts        ← Routing manifest. UI routes → lexiq/. Server routes → unchanged.
```

## Development Commands

```bash
pnpm dev:ui          # Frontend dev server, mock data, no backend required (MOCK_MODE=true)
pnpm dev             # Full dev server, requires config.example.yaml and running headscale
pnpm build           # Production build
pnpm typecheck       # TypeScript type checking
pnpm test:unit       # Unit tests
pnpm lint            # Lint with oxlint
```

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
