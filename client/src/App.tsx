import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

// Page Imports
import Dashboard from "./pages/dashboard";
import Services from "./pages/services";
import Bookings from "./pages/bookings";
import Customers from "./pages/customers";
import Availability from "./pages/availability";
import Settings from "./pages/settings";
import AuthPage from "./pages/auth";
import PublicBooking from "./pages/public-booking";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/services" component={Services} />
      <Route path="/bookings" component={Bookings} />
      <Route path="/customers" component={Customers} />
      <Route path="/availability" component={Availability} />
      <Route path="/settings" component={Settings} />
      
      {/* Auth routes */}
      <Route path="/login">
        <AuthPage isLogin={true} />
      </Route>
      <Route path="/register">
        <AuthPage isLogin={false} />
      </Route>

      {/* Public facing booking wizard */}
      <Route path="/book/:org" component={PublicBooking} />

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
