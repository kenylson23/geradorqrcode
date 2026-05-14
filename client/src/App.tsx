import { Switch, Route } from "wouter";
import { lazy, Suspense } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";

const LinkTreePage = lazy(() => import("@/pages/LinkTreePage"));
const LinksPage = lazy(() => import("@/pages/LinksPage"));
const VCardPage = lazy(() => import("@/pages/VCardPage"));
const BusinessPage = lazy(() => import("@/pages/BusinessPage"));
const ImagePage = lazy(() => import("@/pages/ImagePage"));
const FacebookPage = lazy(() => import("@/pages/FacebookPage"));
const InstagramPage = lazy(() => import("@/pages/InstagramPage"));

function Router() {
  return (
    <Suspense fallback={null}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/l" component={LinkTreePage} />
        <Route path="/ll" component={LinksPage} />
        <Route path="/c" component={VCardPage} />
        <Route path="/b" component={BusinessPage} />
        <Route path="/i/:data" component={ImagePage} />
        <Route path="/fb/:data" component={FacebookPage} />
        <Route path="/ig/:data" component={InstagramPage} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
