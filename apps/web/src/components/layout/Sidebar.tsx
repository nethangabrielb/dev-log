import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Clock,
  Code2,
  FolderKanban,
  BookOpen,
  FileCode,
  ClipboardList,
} from "lucide-react";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/sessions", label: "Sessions", icon: Clock },
  { to: "/dsa", label: "DSA", icon: Code2 },
  { to: "/projects", label: "Projects", icon: FolderKanban },
  { to: "/articles", label: "Articles", icon: BookOpen },
  { to: "/snippets", label: "Snippets", icon: FileCode },
  { to: "/daily-reports", label: "Daily Reports", icon: ClipboardList },
];

export function Sidebar() {
  return (
    <aside
      className="fixed left-0 top-0 bottom-0 w-56 border-r flex flex-col z-30"
      style={{
        backgroundColor: "var(--bg-surface)",
        borderColor: "var(--border)",
      }}
    >
      <div
        className="h-14 flex items-center px-6 border-b"
        style={{ borderColor: "var(--border)" }}
      >
        <span
          className="font-semibold text-lg tracking-tight"
          style={{ color: "var(--text-primary)" }}
        >
          Dev<span style={{ color: "var(--accent)" }}>Log</span>
        </span>
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? "bg-[var(--bg-elevated)] text-[var(--accent)] font-semibold"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                }`
              }
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
