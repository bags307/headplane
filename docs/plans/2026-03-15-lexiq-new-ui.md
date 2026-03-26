# LexIQ New UI Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace headplane's top-nav layout and mist color palette with a left-sidebar layout and inferx-dash design system (blue primary, Tremor-inspired tokens, 256px sidebar + 64px header).

**Architecture:** All changes are confined to `app/lexiq/` — upstream files stay untouched. Design tokens go into a new `app/lexiq/lexiq.css` file imported by the root layout. New primitive components (`Card`, `Badge`, `Button`, `Table`) live in `app/lexiq/components/`. The layout shell (`app/lexiq/layout/`) is fully rewritten. Route pages are updated one by one to use new components.

**Tech Stack:** Tailwind CSS v4 (`@theme` tokens), React 19, lucide-react, existing headplane server infrastructure

**Design Reference:** `/Users/brianbagdasarian/projects/inferx-dash-new` — use this as the visual target throughout.

**Key constraint:** Do NOT use Tremor (incompatible with Tailwind v4). Replicate Tremor patterns manually.

**Test command:** `pnpm dev:ui` from `/Users/brianbagdasarian/projects/headplane` — verify at `http://localhost:3001/admin`

---

## Task 1: Design tokens — create `app/lexiq/lexiq.css`

**Files:**

- Create: `app/lexiq/lexiq.css`
- Modify: `app/lexiq/layout/app.tsx` (add import)

**Step 1: Create the CSS file**

Create `/Users/brianbagdasarian/projects/headplane/app/lexiq/lexiq.css` with exact content:

```css
/* LexIQ Design Tokens — Inferx-dash inspired, Tailwind v4 @theme */

@theme {
  /* Brand / Primary */
  --color-brand: #3b82f6;
  --color-brand-faint: #eff6ff;
  --color-brand-muted: #bfdbfe;
  --color-brand-subtle: #60a5fa;
  --color-brand-emphasis: #1d4ed8;

  /* Dark brand */
  --color-brand-dark-faint: #0b1229;
  --color-brand-dark-muted: #172554;
  --color-brand-dark-subtle: #1e40af;
  --color-brand-dark-emphasis: #60a5fa;

  /* Surface — light */
  --color-surface: #ffffff;
  --color-surface-muted: #f9fafb;
  --color-surface-subtle: #f3f4f6;
  --color-surface-emphasis: #374151;

  /* Surface — dark */
  --color-surface-dark: #111827;
  --color-surface-dark-muted: #131a2b;
  --color-surface-dark-subtle: #1f2937;

  /* Border */
  --color-border: #e5e7eb;
  --color-border-dark: #374151;

  /* Content / Text — light */
  --color-content-subtle: #9ca3af;
  --color-content: #6b7280;
  --color-content-emphasis: #374151;
  --color-content-strong: #111827;

  /* Content / Text — dark */
  --color-content-dark-subtle: #4b5563;
  --color-content-dark: #6b7280;
  --color-content-dark-emphasis: #e5e7eb;
  --color-content-dark-strong: #f9fafb;

  /* Status */
  --color-status-green: #16a34a;
  --color-status-yellow: #ca8a04;
  --color-status-red: #dc2626;
  --color-status-gray: #6b7280;

  /* Sidebar */
  --sidebar-width: 16rem; /* 256px */
  --header-height: 4rem; /* 64px */

  /* Shadows — Tremor-equivalent */
  --shadow-card: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --shadow-dropdown: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
}
```

**Step 2: Import it from the layout**

In `app/lexiq/layout/app.tsx`, add at the very top (before other imports):

```typescript
import "~/lexiq/lexiq.css";
```

**Step 3: Verify dev:ui starts without errors**

```bash
cd /Users/brianbagdasarian/projects/headplane && pnpm dev:ui
```

Expected: server starts on port 3001, no CSS errors

**Step 4: Commit**

```bash
git add app/lexiq/lexiq.css app/lexiq/layout/app.tsx
git commit -m "feat(lexiq): add design token CSS with inferx-dash color system"
```

---

## Task 2: Sidebar component

**Files:**

- Create: `app/lexiq/components/sidebar.tsx`

**Step 1: Create the sidebar**

Create `/Users/brianbagdasarian/projects/headplane/app/lexiq/components/sidebar.tsx`:

```typescript
import { Globe, Lock, Server, Settings, Users } from 'lucide-react'
import { NavLink } from 'react-router'
import cn from '~/utils/cn'

const navItems = [
  { to: '/machines', icon: Server, label: 'Machines', key: 'machines' },
  { to: '/users', icon: Users, label: 'Users', key: 'users' },
  { to: '/acls', icon: Lock, label: 'Access Control', key: 'policy' },
  { to: '/dns', icon: Globe, label: 'DNS', key: 'dns' },
  { to: '/settings', icon: Settings, label: 'Settings', key: 'settings' },
] as const

interface SidebarProps {
  access: {
    machines: boolean
    users: boolean
    policy: boolean
    dns: boolean
    settings: boolean
  }
  configAvailable: boolean
}

export default function Sidebar({ access, configAvailable }: SidebarProps) {
  return (
    <aside
      className={cn(
        'flex h-screen w-64 flex-shrink-0 flex-col',
        'bg-white dark:bg-gray-900',
        'border-r border-gray-200 dark:border-gray-700',
      )}
    >
      {/* Logo area — matches header height */}
      <div
        className={cn(
          'flex h-16 flex-shrink-0 items-center gap-3 px-6',
          'border-b border-gray-200 dark:border-gray-700',
        )}
      >
        <div
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-md',
            'bg-blue-500',
          )}
        >
          <Server className="h-5 w-5 text-white" />
        </div>
        <span className="text-xl font-bold text-gray-900 dark:text-white">
          LexIQ
        </span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            if (!access[item.key]) return null
            if ((item.key === 'dns' || item.key === 'settings') && !configAvailable) return null

            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  prefetch="intent"
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-md px-3 py-2.5',
                      'text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400'
                        : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800',
                    )
                  }
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {item.label}
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}
```

**Step 2: Commit**

```bash
git add app/lexiq/components/sidebar.tsx
git commit -m "feat(lexiq): add sidebar component with inferx-dash nav style"
```

---

## Task 3: Header component (top bar)

**Files:**

- Modify: `app/lexiq/layout/header.tsx`

**Step 1: Rewrite header.tsx**

Replace the entire content of `app/lexiq/layout/header.tsx` with:

```typescript
import { CircleUser, Moon, Sun } from 'lucide-react'
import { useLocation, useSubmit } from 'react-router'
import { Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger } from '~/components/menu'
import Link from '~/components/link'
import cn from '~/utils/cn'

export interface HeaderProps {
  user: {
    subject: string
    name: string
    email?: string
    username?: string
    picture?: string
  }
  access: {
    ui: boolean
    machines: boolean
    dns: boolean
    users: boolean
    policy: boolean
    settings: boolean
  }
  configAvailable: boolean
}

const pageTitles: Record<string, string> = {
  '/machines': 'Machines',
  '/users': 'Users',
  '/acls': 'Access Control',
  '/dns': 'DNS',
  '/settings': 'Settings',
  '/settings/auth-keys': 'Auth Keys',
  '/settings/restrictions': 'Restrictions',
}

function getPageTitle(pathname: string): string {
  for (const [path, title] of Object.entries(pageTitles)) {
    if (pathname.startsWith(path)) return title
  }
  return 'Dashboard'
}

export default function Header({ user }: HeaderProps) {
  const submit = useSubmit()
  const location = useLocation()
  const pageTitle = getPageTitle(location.pathname)

  return (
    <header
      className={cn(
        'flex h-16 flex-shrink-0 items-center justify-between px-6',
        'bg-white dark:bg-gray-900',
        'border-b border-gray-200 dark:border-gray-700',
      )}
    >
      {/* Left: page title */}
      <div>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
          {pageTitle}
        </h1>
      </div>

      {/* Right: user menu */}
      <div className="flex items-center gap-3">
        <Menu>
          <MenuTrigger
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full overflow-hidden',
              'bg-blue-500 text-white text-sm font-medium',
              'hover:opacity-90 transition-opacity',
            )}
          >
            {user.picture ? (
              <img alt={user.name} className="h-8 w-8" src={user.picture} />
            ) : (
              <span>{user.name.charAt(0).toUpperCase()}</span>
            )}
          </MenuTrigger>
          <MenuContent align="end" className="w-56">
            <MenuItem disabled>
              <div className="py-1">
                <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                {user.email && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                )}
              </div>
            </MenuItem>
            <MenuSeparator />
            <MenuItem>
              <Link external to="https://headplane.net">Docs</Link>
            </MenuItem>
            <MenuSeparator />
            <MenuItem
              variant="danger"
              onClick={() => submit({}, { action: '/logout', method: 'POST' })}
            >
              Sign out
            </MenuItem>
          </MenuContent>
        </Menu>
      </div>
    </header>
  )
}
```

**Step 2: Commit**

```bash
git add app/lexiq/layout/header.tsx
git commit -m "feat(lexiq): rewrite header as top-bar (title left, user menu right)"
```

---

## Task 4: Layout shell — sidebar + header

**Files:**

- Modify: `app/lexiq/layout/app.tsx`

**Step 1: Rewrite the layout shell**

Replace the component body in `app/lexiq/layout/app.tsx` (keep the MOCK_MODE loader as-is, only change the component):

The `AppLayout` component and its imports should become:

```typescript
import { Outlet } from 'react-router'
import { ErrorBanner } from '~/components/error-banner'
import type { Route } from './+types/app'
import Footer from './footer'
import Header from './header'
import Sidebar from '~/lexiq/components/sidebar'
import '~/lexiq/lexiq.css'

// ... (keep loader unchanged) ...

export default function AppLayout({ loaderData }: Route.ComponentProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <Sidebar
        access={loaderData.access}
        configAvailable={loaderData.configAvailable}
      />

      {/* Right column */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <Header
          access={loaderData.access}
          configAvailable={loaderData.configAvailable}
          user={loaderData.user}
        />

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return (
    <div className="mx-auto my-24 w-fit">
      <ErrorBanner className="max-w-2xl" error={error} />
    </div>
  )
}
```

**Step 2: Verify in dev:ui**

```bash
cd /Users/brianbagdasarian/projects/headplane && pnpm dev:ui
```

Visit `http://localhost:3001/admin/machines`. Expected:

- 256px sidebar on left with LexIQ branding and nav items
- 64px top header showing "Machines" title and user avatar
- Scrollable main content area

**Step 3: Commit**

```bash
git add app/lexiq/layout/app.tsx
git commit -m "feat(lexiq): sidebar + header shell layout"
```

---

## Task 5: Primitive components — Card, Badge, Button

**Files:**

- Create: `app/lexiq/components/card.tsx`
- Create: `app/lexiq/components/badge.tsx`
- Create: `app/lexiq/components/button.tsx`

**Step 1: Create Card**

`app/lexiq/components/card.tsx`:

```typescript
import cn from '~/utils/cn'

interface CardProps {
  children: React.ReactNode
  className?: string
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-md bg-white dark:bg-gray-900',
        'border border-gray-200 dark:border-gray-700',
        'shadow-sm',
        className,
      )}
    >
      {children}
    </div>
  )
}

Card.Header = function CardHeader({ children, className }: CardProps) {
  return (
    <div className={cn('px-6 py-4 border-b border-gray-200 dark:border-gray-700', className)}>
      {children}
    </div>
  )
}

Card.Body = function CardBody({ children, className }: CardProps) {
  return <div className={cn('px-6 py-4', className)}>{children}</div>
}

Card.Title = function CardTitle({ children, className }: CardProps) {
  return (
    <h3 className={cn('text-sm font-medium text-gray-900 dark:text-white', className)}>
      {children}
    </h3>
  )
}
```

**Step 2: Create Badge**

`app/lexiq/components/badge.tsx`:

```typescript
import cn from '~/utils/cn'

type BadgeColor = 'green' | 'yellow' | 'red' | 'gray' | 'blue'

interface BadgeProps {
  children: React.ReactNode
  color?: BadgeColor
  className?: string
}

const colorMap: Record<BadgeColor, string> = {
  green: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  yellow: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  red: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  gray: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
}

export function Badge({ children, color = 'gray', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        colorMap[color],
        className,
      )}
    >
      {children}
    </span>
  )
}
```

**Step 3: Create Button**

`app/lexiq/components/button.tsx`:

```typescript
import cn from '~/utils/cn'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: 'sm' | 'md'
  children: React.ReactNode
}

const variantMap: Record<ButtonVariant, string> = {
  primary: 'bg-blue-500 text-white hover:bg-blue-600 dark:hover:bg-blue-400',
  secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700',
  ghost: 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800',
  danger: 'bg-red-500 text-white hover:bg-red-600',
}

const sizeMap = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
}

export function Button({ variant = 'primary', size = 'md', className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center gap-2 rounded-md font-medium transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-blue-500/40',
        variantMap[variant],
        sizeMap[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
```

**Step 4: Commit**

```bash
git add app/lexiq/components/
git commit -m "feat(lexiq): add Card, Badge, Button primitive components"
```

---

## Task 6: Apply new components to Machines overview

**Files:**

- Modify: `app/lexiq/routes/machines/overview.tsx`

**Step 1: Update the page wrapper and imports**

At the top of the machines overview component (`export default function Page`), update the outer wrapper div from whatever it is to:

```typescript
<div className="space-y-6">
  {/* Page header */}
  <div className="flex items-center justify-between">
    <div>
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Machines</h2>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {loaderData.nodes.length} device{loaderData.nodes.length !== 1 ? 's' : ''} connected
      </p>
    </div>
    {/* Keep existing action buttons here */}
  </div>

  {/* Keep existing search/filter controls */}

  {/* Keep existing machine list — just update wrapper */}
</div>
```

The goal is NOT to rewrite the machines logic — just wrap the existing JSX in the new page structure. Add these imports at the top:

```typescript
import { Card } from "~/lexiq/components/card";
import { Badge } from "~/lexiq/components/badge";
import { Button } from "~/lexiq/components/button";
```

**Step 2: Verify**

Visit `http://localhost:3001/admin/machines` in dev:ui. Expected:

- Sidebar on left, header on top showing "Machines"
- Machine list renders normally under the new layout

**Step 3: Commit**

```bash
git add app/lexiq/routes/machines/overview.tsx
git commit -m "feat(lexiq): apply new layout structure to machines page"
```

---

## Task 7: Remove footer — replace with sidebar footer

**Files:**

- Modify: `app/lexiq/layout/app.tsx`
- Modify: `app/lexiq/layout/footer.tsx`

**Step 1: Move footer info to sidebar bottom**

The existing footer shows version + baseUrl. Move this into the sidebar component at the bottom (below nav items):

In `app/lexiq/components/sidebar.tsx`, add a footer section at the bottom of the aside:

```typescript
// At bottom of <aside>, after nav:
<div className="flex-shrink-0 px-3 py-4 border-t border-gray-200 dark:border-gray-700">
  <p className="text-xs text-gray-400 dark:text-gray-500">
    LexIQ Network
  </p>
</div>
```

**Step 2: Remove footer from AppLayout**

In `app/lexiq/layout/app.tsx`, remove the `<Footer ... />` component and its import since it's no longer needed at the page level.

**Step 3: Commit**

```bash
git add app/lexiq/layout/app.tsx app/lexiq/components/sidebar.tsx
git commit -m "feat(lexiq): move version info to sidebar footer, remove page footer"
```

---

## Task 8: Push and verify all pages

**Step 1: Run dev:ui and check all routes**

```bash
cd /Users/brianbagdasarian/projects/headplane && pnpm dev:ui
```

Verify these routes render without errors:

- `http://localhost:3001/admin/machines`
- `http://localhost:3001/admin/users`
- `http://localhost:3001/admin/acls`
- `http://localhost:3001/admin/dns`
- `http://localhost:3001/admin/settings`
- `http://localhost:3001/admin/settings/auth-keys`

**Step 2: Push**

```bash
git push origin feature/new-ui
```

**Step 3: Update docs/dev/ui/README.md**

Add a section documenting the new component system:

```markdown
## Component Library (`app/lexiq/components/`)

LexIQ provides these primitive components (Tremor-inspired, Tailwind v4 native):

- `Card` — surface container with header/body/title sub-components
- `Badge` — semantic status badge (green/yellow/red/gray/blue)
- `Button` — primary/secondary/ghost/danger variants
- `Sidebar` — the app sidebar (used by layout, not in routes directly)

Import from `~/lexiq/components/<name>`.
```

**Step 4: Commit and push**

```bash
git add docs/dev/ui/README.md
git commit -m "docs: document lexiq component library"
git push origin feature/new-ui
```
