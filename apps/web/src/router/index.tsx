import { Routes, Route, Outlet } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { DashboardPage } from "../pages/DashboardPage";
import { SessionsPage } from "../pages/SessionsPage";
import { DSAPage } from "../pages/DSAPage";
import { ProjectsPage } from "../pages/ProjectsPage";
import { ProjectDetailPage } from "../pages/ProjectDetailPage";
import { ArticlesPage } from "../pages/ArticlesPage";
import { SnippetsPage } from "../pages/SnippetsPage";
import { DailyReportsPage } from "../pages/DailyReportsPage";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";

// Placeholder for ProtectedRoute until implemented
function ProtectedRoute() {
  return <Outlet />;
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/sessions" element={<SessionsPage />} />
          <Route path="/dsa" element={<DSAPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:id" element={<ProjectDetailPage />} />
          <Route path="/articles" element={<ArticlesPage />} />
          <Route path="/snippets" element={<SnippetsPage />} />
          <Route path="/daily-reports" element={<DailyReportsPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default AppRouter;
