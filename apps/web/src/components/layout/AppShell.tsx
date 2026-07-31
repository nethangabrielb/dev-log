import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";

export function AppShell() {
  return (
    <div
      className="min-h-screen flex text-left"
      style={{
        backgroundColor: "var(--bg-base)",
        color: "var(--text-primary)",
      }}
    >
      <Sidebar />
      <main className="flex-1 pl-56 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
