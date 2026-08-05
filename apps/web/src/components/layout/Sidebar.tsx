import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Clock,
  Code2,
  FolderKanban,
  BookOpen,
  FileCode,
  ClipboardList,
  BarChart3,
  LogOut,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth, useLogout } from "@/hooks/useAuth";

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

interface NavGroup {
  label?: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    items: [
      { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
      { to: "/sessions", label: "Sessions", icon: Clock, end: true },
      { to: "/dsa", label: "DSA", icon: Code2 },
      { to: "/projects", label: "Projects", icon: FolderKanban },
      { to: "/articles", label: "Articles", icon: BookOpen },
      { to: "/snippets", label: "Snippets", icon: FileCode },
      { to: "/daily-reports", label: "Daily Reports", icon: ClipboardList },
    ],
  },
  {
    label: "Analyze",
    items: [
      { to: "/sessions/overview", label: "Sessions Overview", icon: BarChart3 },
      { to: "/projects/overview", label: "Projects Overview", icon: FolderKanban },
      { to: "/articles/overview", label: "Articles Overview", icon: BookOpen },
      { to: "/dsa/overview", label: "DSA Overview", icon: Code2 },
    ],
  },
];

export function Sidebar() {
  const { user } = useAuth();
  const { mutate: logout, isPending } = useLogout();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-56 border-r border-border bg-bg-surface flex flex-col z-30">
      <div className="h-14 flex items-center px-6 border-b border-border">
        <span className="font-semibold text-lg tracking-tight text-text-primary">
          Dev<span className="text-accent font-bold">Log</span>
        </span>
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="space-y-1">
            {group.label && (
              <p className="px-3 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                {group.label}
              </p>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? "bg-bg-elevated text-accent font-semibold"
                        : "text-text-secondary hover:text-text-primary hover:bg-bg-hover"
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>
      <footer className="p-3 border-t border-border space-y-1">
        <div className="px-3 py-1 overflow-hidden">
          <p className="text-sm font-semibold truncate text-text-primary">
            {user?.username ?? "User"}
          </p>
          <p className="text-xs truncate text-text-muted">
            {user?.email ?? ""}
          </p>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 px-3 text-sm font-medium rounded-md text-text-secondary hover:text-text-primary hover:bg-bg-hover"
          onClick={() => logout()}
          disabled={isPending}
        >
          <LogOut className="h-4 w-4" />
          <span>{isPending ? "Logging out..." : "Log out"}</span>
        </Button>
      </footer>
    </aside>
  );
}
