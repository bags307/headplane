import { FileKey2, Shield } from "lucide-react";
import { Link } from "react-router";

import cn from "~/utils/cn";

import type { Route } from "./+types/overview";

export async function loader({ context }: Route.LoaderArgs) {
  if (process.env.MOCK_MODE) {
    const { mockLoader } = await import("~/lexiq/mocks/settings");
    return mockLoader();
  }
  const oidcConnector = await context.oidc?.connector.get();
  return {
    config: context.hs.writable(),
    isOidcEnabled: oidcConnector?.isValid ?? false,
  };
}

interface SettingsCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  to: string;
  linkLabel: string;
}

function SettingsCard({ icon, title, description, to, linkLabel }: SettingsCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-lg border border-gray-200 bg-white p-5",
        "dark:border-gray-700 dark:bg-gray-900",
      )}
    >
      <div className="mb-3 flex items-center gap-3">
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-md",
            "bg-gray-100 dark:bg-gray-800",
          )}
        >
          {icon}
        </div>
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h2>
      </div>
      <p className="mb-4 flex-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
      <Link
        to={to}
        className={cn(
          "inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium",
          "bg-blue-50 text-blue-600 hover:bg-blue-100",
          "dark:bg-blue-950 dark:text-blue-400 dark:hover:bg-blue-900",
          "transition-colors",
        )}
      >
        {linkLabel} →
      </Link>
    </div>
  );
}

export default function Page({ loaderData: { config, isOidcEnabled } }: Route.ComponentProps) {
  return (
    <div className="max-w-2xl">
      <h1 className="mb-1.5 text-2xl font-medium">Settings</h1>
      <p className="text-md mb-8 text-gray-500 dark:text-gray-400">
        Manage authentication keys and access restrictions for your network.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SettingsCard
          icon={<FileKey2 className="h-5 w-5 text-gray-600 dark:text-gray-300" />}
          title="Pre-Auth Keys"
          description="Generate and manage pre-authentication keys to add devices to your tailnet without manual approval."
          to="/settings/auth-keys"
          linkLabel="Manage Keys"
        />

        {config && isOidcEnabled && (
          <SettingsCard
            icon={<Shield className="h-5 w-5 text-gray-600 dark:text-gray-300" />}
            title="Authentication Restrictions"
            description="Restrict OIDC login to specific email domains, groups, or users to control who can join your tailnet."
            to="/settings/restrictions"
            linkLabel="Manage Restrictions"
          />
        )}
      </div>
    </div>
  );
}
