import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { AdminAuthProvider } from "@/hooks/use-admin-auth";
import { AdminLayout } from "@/components/admin-layout";
import { ProtectedRoute } from "@/components/protected-route";

import LoginPage from "@/pages/login";
import TwoFAPage from "@/pages/two-fa";
import DashboardPage from "@/pages/dashboard";
import MoviesPage from "@/pages/movies";
import BannersPage from "@/pages/banners";
import SectionsPage from "@/pages/sections";
import UsersPage from "@/pages/users";
import InterpretersPage from "@/pages/interpreters";
import AnalyticsPage from "@/pages/analytics";
import SettingsPage from "@/pages/settings";
import NotFoundPage from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/2fa" component={TwoFAPage} />

      <Route>
        <ProtectedRoute>
          <AdminLayout>
            <Switch>
              <Route path="/" component={DashboardPage} />
              <Route path="/movies" component={MoviesPage} />
              <Route path="/banners" component={BannersPage} />
              <Route path="/sections" component={SectionsPage} />
              <Route path="/users" component={UsersPage} />
              <Route path="/interpreters" component={InterpretersPage} />
              <Route path="/analytics" component={AnalyticsPage} />
              <Route path="/settings" component={SettingsPage} />
              <Route component={NotFoundPage} />
            </Switch>
          </AdminLayout>
        </ProtectedRoute>
      </Route>
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL?.replace(/\/$/, "") ?? ""}>
        <AdminAuthProvider>
          <Router />
        </AdminAuthProvider>
      </WouterRouter>
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}
