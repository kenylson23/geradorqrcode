import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import LinkTreePage from "@/pages/LinkTreePage";
import ImagePage from "@/pages/ImagePage";
import VCardPage from "@/pages/VCardPage";
import FacebookPage from "@/pages/FacebookPage";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/l" component={LinkTreePage} />
      <Route path="/c" component={VCardPage} />
      <Route path="/i/:data" component={ImagePage} />
      <Route path="/fb/:data" component={FacebookPage} />
      <Route component={NotFound} />
    </Switch>
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
