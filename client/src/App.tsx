import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import Dashboard from "@/pages/Dashboard";
import Calendar from "@/pages/Calendar";
import Income from "@/pages/Income";
import Expenses from "@/pages/Expenses";
import Assets from "@/pages/Assets";
import Liabilities from "@/pages/Liabilities";
import Investments from "@/pages/Investments";
import Business from "@/pages/Business";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/calendar" component={Calendar} />
      <Route path="/income" component={Income} />
      <Route path="/expenses" component={Expenses} />
      <Route path="/assets" component={Assets} />
      <Route path="/liabilities" component={Liabilities} />
      <Route path="/investments" component={Investments} />
      <Route path="/business" component={Business} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const style = {
    "--sidebar-width": "16rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SidebarProvider style={style as React.CSSProperties}>
          <div className="flex h-screen w-full">
            <AppSidebar />
            <div className="flex flex-1 flex-col">
              <header className="flex items-center justify-between border-b p-4">
                <SidebarTrigger data-testid="button-sidebar-toggle" />
                <ThemeToggle />
              </header>
              <main className="flex-1 overflow-auto p-6">
                <div className="mx-auto max-w-7xl">
                  <Router />
                </div>
              </main>
            </div>
          </div>
        </SidebarProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
