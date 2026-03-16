# Headplane

> A feature-complete web UI for [Headscale](https://headscale.net)

<picture>
    <source
        media="(prefers-color-scheme: dark)"
        srcset="./docs/assets/preview-dark.png"
    >
    <source
        media="(prefers-color-scheme: light)"
        srcset="./docs/assets/preview-light.png"
    >
    <img
        alt="Preview"
        src="./docs/assets/preview-dark.png"
    >
</picture>

Headscale is the de-facto self-hosted version of Tailscale, a popular Wireguard
based VPN service. By default, it does not ship with a web UI, which is where
Headplane comes in. Headplane is a feature-complete web UI for Headscale, allowing
you to manage your nodes, networks, and ACLs with ease.

Headplane aims to replicate the functionality offered by the official Tailscale
product and dashboard, being one of the most feature complete Headscale UIs available.
These are some of the features that Headplane offers:

- Machine management, including expiry, network routing, name, and owner management
- Access Control List (ACL) and tagging configuration for ACL enforcement
- Support for OpenID Connect (OIDC) as a login provider
- The ability to edit DNS settings and automatically provision Headscale
- Configurability for Headscale's settings

## LexIQ Fork

This is the LexIQ fork of Headplane. The backend server is unmodified from upstream.
The frontend UI has been replaced with a LexIQ-branded interface under `app/lexiq/`.

See [docs/dev/ui/README.md](./docs/dev/ui/README.md) for the full UI development guide.

### Quick Start

```bash
# Install dependencies (requires Node 22, pnpm 10)
nvm use 22 && pnpm install

# Develop the UI without a backend (mock data, full HMR, port 3001)
pnpm dev:ui

# Run against a real headscale instance (port 3000)
pnpm dev
```

### UI Architecture

```
app/
├── server/          ← UPSTREAM ONLY — never modify
├── routes/          ← UPSTREAM ONLY — never modify
├── lexiq/
│   ├── routes/      ← LexIQ UI pages (copied from upstream + MOCK_MODE guards)
│   ├── components/  ← Primitive components: Card, Badge, Button, Sidebar, ThemeProvider
│   ├── layout/      ← App shell: sidebar (256px) + header (64px)
│   ├── mocks/       ← Mock fixture data for dev:ui mode
│   └── lexiq.css    ← Design tokens (@theme CSS variables)
└── routes.ts        ← Routing manifest — UI routes → lexiq/, server routes unchanged
```

### Branches

| Branch           | Purpose                                                              |
| ---------------- | -------------------------------------------------------------------- |
| `feature/ui`     | Scaffold — mock data, route wiring, dev:ui setup                     |
| `feature/new-ui` | Active — LexIQ design system (sidebar layout, dark mode, components) |

## Deployment

Refer to the [website](https://headplane.net) for detailed installation instructions.

## Versioning

Headplane uses [semantic versioning](https://semver.org/) for its releases (since v0.6.0).
Pre-release builds are available under the `next` tag and get updated when a new release
PR is opened and actively in testing.

## Contributing

Headplane is an open-source project and contributions are welcome! If you have
any suggestions, bug reports, or feature requests, please open an issue. Also
refer to the [contributor guidelines](./docs/CONTRIBUTING.md) for more info.

---

<picture>
    <source
        media="(prefers-color-scheme: dark)"
        srcset="./docs/assets/acls-dark.png"
    >
    <source
        media="(prefers-color-scheme: light)"
        srcset="./docs/assets/acls-light.png"
    >
    <img
        alt="ACLs"
        src="./docs/assets/acls-dark.png"
    >
</picture>

<picture>
    <source
        media="(prefers-color-scheme: dark)"
        srcset="./docs/assets/machine-dark.png"
    >
    <source
        media="(prefers-color-scheme: light)"
        srcset="./docs/assets/machine-light.png"
    >
    <img
        alt="Machine Management"
        src="./docs/assets/machine-dark.png"
    >
</picture>

> Copyright (c) 2025 Aarnav Tale
