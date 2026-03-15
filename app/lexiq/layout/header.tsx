import { Moon, Sun } from "lucide-react";
import { useLocation, useSubmit } from "react-router";

import Link from "~/components/link";
import { Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger } from "~/components/menu";
import { useTheme } from "~/lexiq/components/theme-provider";
import cn from "~/utils/cn";

export interface HeaderProps {
  user: {
    subject: string;
    name: string;
    email?: string;
    username?: string;
    picture?: string;
  };
  access: {
    ui: boolean;
    machines: boolean;
    dns: boolean;
    users: boolean;
    policy: boolean;
    settings: boolean;
  };
  configAvailable: boolean;
}

const pageTitles: Record<string, string> = {
  "/machines": "Machines",
  "/users": "Users",
  "/acls": "Access Control",
  "/dns": "DNS",
  "/settings/auth-keys": "Auth Keys",
  "/settings/restrictions": "Authentication Restrictions",
  "/settings": "Settings",
};

function getPageTitle(pathname: string): string {
  // Longest match first
  const sorted = Object.entries(pageTitles).sort((a, b) => b[0].length - a[0].length);
  for (const [path, title] of sorted) {
    if (pathname.startsWith(path)) return title;
  }
  return "Dashboard";
}

export default function Header({ user }: HeaderProps) {
  const submit = useSubmit();
  const location = useLocation();
  const pageTitle = getPageTitle(location.pathname);
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <header
      className={cn(
        "flex h-16 flex-shrink-0 items-center justify-between px-6",
        "bg-white dark:bg-gray-900",
        "border-b border-gray-200 dark:border-gray-700",
      )}
    >
      {/* Left: page title */}
      <h1 className="text-lg font-semibold text-gray-900 dark:text-white">{pageTitle}</h1>

      {/* Right: theme toggle + user avatar menu */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          className="flex h-8 w-8 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
          aria-label="Toggle theme"
          type="button"
        >
          {resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
        <Menu>
          <MenuTrigger
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full overflow-hidden",
              "bg-blue-500 text-white text-sm font-medium",
              "hover:opacity-90 transition-opacity cursor-pointer",
            )}
          >
            {user.picture ? (
              <img alt={user.name} className="h-8 w-8" src={user.picture} />
            ) : (
              <span>{user.name.charAt(0).toUpperCase()}</span>
            )}
          </MenuTrigger>
          <MenuContent align="end">
            <MenuItem disabled>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                {user.email && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                )}
              </div>
            </MenuItem>
            <MenuSeparator />
            <MenuItem>
              <Link external to="https://headplane.net">
                Docs
              </Link>
            </MenuItem>
            <MenuSeparator />
            <MenuItem
              variant="danger"
              onClick={() => submit({}, { action: "/logout", method: "POST" })}
            >
              Sign out
            </MenuItem>
          </MenuContent>
        </Menu>
      </div>
    </header>
  );
}
