import { Switch, Route, Router as WouterRouter } from "wouter";
import { setBaseUrl } from "@workspace/api-client-react";
setBaseUrl(import.meta.env.VITE_API_URL ?? "");
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { Layout } from "@/components/layout";
import NotFound from "@/pages/not-found";

import Home from "@/pages/home";
import Movies from "@/pages/movies";
import MovieDetail from "@/pages/movie-detail";
import TVChannels from "@/pages/tv";
import Interpreted from "@/pages/interpreted";
import Category from "@/pages/category";
import AdRedirect from "@/pages/ad-redirect";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60_000, retry: 1 },
  },
});

function Router() {
  return (
    <Switch>
      <Route>
        <Layout>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/movies" component={Movies} />
            <Route path="/movies/:id" component={MovieDetail} />
            <Route path="/movie/:slug" component={MovieDetail} />
            <Route path="/category/:slug" component={Category} />
            <Route path="/tv" component={TVChannels} />
            <Route path="/interpreted" component={Interpreted} />
            <Route component={NotFound} />
          </Switch>
        </Layout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <Router />
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
