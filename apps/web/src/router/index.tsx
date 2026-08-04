import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { ErrorBoundary } from "../components/common/ErrorBoundary";
import { ActiveSessionProvider } from "../features/sessions/context/ActiveSessionContext";
import { AppShell } from "../components/layout/AppShell";
import { DashboardPage } from "../pages/DashboardPage";
import { SessionsPage } from "../pages/SessionsPage";
import { SessionsOverviewPage } from "../pages/SessionsOverviewPage";
import { DSAPage } from "../pages/DSAPage";
import { ProjectsPage } from "../pages/ProjectsPage";
import { ProjectDetailPage } from "../pages/ProjectDetailPage";
import { ArticlesPage } from "../pages/ArticlesPage";
import { SnippetsPage } from "../pages/SnippetsPage";
import { DailyReportsPage } from "../pages/DailyReportsPage";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute />}>
        <Route
          element={
            <ErrorBoundary>
              <ActiveSessionProvider>
                <AppShell />
              </ActiveSessionProvider>
            </ErrorBoundary>
          }
        >
          <Route path="/" element={<DashboardPage />} />
          <Route path="/sessions" element={<SessionsPage />} />
          <Route path="/sessions/overview" element={<SessionsOverviewPage />} />
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
