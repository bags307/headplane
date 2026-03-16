import { FileKey2, Globe, Lock, Server, Settings, Shield, Users } from "lucide-react";
import { NavLink, useLocation } from "react-router";

import cn from "~/utils/cn";

const navItems = [
  { to: "/machines", icon: Server, label: "Machines", key: "machines" },
  { to: "/users", icon: Users, label: "Users", key: "users" },
  { to: "/acls", icon: Lock, label: "Access Control", key: "policy" },
  { to: "/dns", icon: Globe, label: "DNS", key: "dns" },
  { to: "/settings", icon: Settings, label: "Settings", key: "settings" },
] as const;

const settingsSubItems = [
  { to: "/settings/auth-keys", icon: FileKey2, label: "Pre-Auth Keys" },
  { to: "/settings/restrictions", icon: Shield, label: "Restrictions" },
];

interface SidebarProps {
  access: {
    machines: boolean;
    users: boolean;
    policy: boolean;
    dns: boolean;
    settings: boolean;
  };
  configAvailable: boolean;
}

export default function Sidebar({ access, configAvailable }: SidebarProps) {
  const location = useLocation();
  const inSettings = location.pathname.startsWith("/settings");

  return (
    <aside
      className={cn(
        "flex h-screen w-64 flex-shrink-0 flex-col",
        "bg-white dark:bg-gray-900",
        "border-r border-gray-200 dark:border-gray-700",
      )}
    >
      {/* Logo area */}
      <div
        className={cn(
          "flex h-16 flex-shrink-0 items-center gap-3 px-6",
          "border-b border-gray-200 dark:border-gray-700",
        )}
      >
        <div className={cn("flex h-9 w-9 items-center justify-center rounded-md", "bg-blue-500")}>
          <Server className="h-5 w-5 text-white" />
        </div>
        <span className="text-xl font-bold text-gray-900 dark:text-white">LexIQ</span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            if (!access[item.key]) return null;
            if ((item.key === "dns" || item.key === "settings") && !configAvailable) return null;

            return (
              <li key={item.to}>
                <NavLink
                  end={item.key === "settings"}
                  to={item.to}
                  prefetch="intent"
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-md px-3 py-2.5",
                      "text-sm font-medium transition-colors",
                      isActive || (item.key === "settings" && inSettings)
                        ? "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400"
                        : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800",
                    )
                  }
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {item.label}
                </NavLink>

                {/* Settings sub-items */}
                {item.key === "settings" && inSettings && (
                  <ul className="mt-1 space-y-0.5 pl-4">
                    {settingsSubItems.map((sub) => (
                      <li key={sub.to}>
                        <NavLink
                          to={sub.to}
                          prefetch="intent"
                          className={({ isActive }) =>
                            cn(
                              "flex items-center gap-2.5 rounded-md px-3 py-2",
                              "text-sm transition-colors",
                              isActive
                                ? "bg-blue-50 font-medium text-blue-600 dark:bg-blue-950 dark:text-blue-400"
                                : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800",
                            )
                          }
                        >
                          <sub.icon className="h-4 w-4 flex-shrink-0" />
                          {sub.label}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Sidebar footer */}
      <div className="flex-shrink-0 border-t border-gray-200 px-4 py-3 dark:border-gray-700">
        <p className="text-xs text-gray-400 dark:text-gray-500">LexIQ Network</p>
      </div>
    </aside>
  );
}
