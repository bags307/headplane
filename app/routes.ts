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
      route("/:id", "lexiq/routes/machines/machine.tsx"),
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
