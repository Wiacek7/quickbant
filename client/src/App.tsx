import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import Events from "@/pages/Events";
import ChatRoom from "@/pages/ChatRoom";
import ChatTest from "@/pages/ChatTest";
import AuthTest from "@/pages/AuthTest";
import Profile from "@/pages/Profile";
import Referrals from "@/pages/Referrals";
import Challenges from "@/pages/Challenges";
import NotFound from "@/pages/not-found";
import { MobileNav } from "@/components/Navigation/MobileNav";
import { DesktopNav } from "@/components/Navigation/DesktopNav";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <>
      <DesktopNav notificationCount={0} />
      <MobileNav notificationCount={0} />
      <Switch>
        <Route path="/" component={Events} />
        <Route path="/home" component={Home} />
        <Route path="/landing" component={Landing} />
        <Route path="/chat/:eventId" component={ChatRoom} />
        <Route path="/chat-test" component={ChatTest} />
        <Route path="/auth-test" component={AuthTest} />
        <Route path="/profile" component={Profile} />
        <Route path="/referrals" component={Referrals} />
        <Route path="/challenges" component={Challenges} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="eventchat-theme">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;