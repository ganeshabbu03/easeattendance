import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AuthProvider, useAuth } from "@/lib/auth";
import { ThemeProvider } from "@/lib/theme";
import { ThemeToggle } from "@/components/theme-toggle";
import { ProfilePopover } from "@/components/profile-popover";
import { AppSidebar } from "@/components/app-sidebar";
import NotFound from "@/pages/not-found";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import EmployeeDashboard from "@/pages/employee/dashboard";
import MarkAttendance from "@/pages/employee/attendance";
import AttendanceHistory from "@/pages/employee/history";
import Profile from "@/pages/employee/profile";
import ManagerDashboard from "@/pages/manager/dashboard";
import AllEmployees from "@/pages/manager/employees";
import TeamCalendar from "@/pages/manager/calendar";
import Reports from "@/pages/manager/reports";

function ProtectedRoute({ 
  component: Component, 
  requiredRole 
}: { 
  component: React.ComponentType; 
  requiredRole?: "employee" | "manager" 
}) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Redirect to={user?.role === "manager" ? "/manager/dashboard" : "/dashboard"} />;
  }

  return <Component />;
}

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3.5rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <header className="sticky top-0 z-50 flex items-center justify-between gap-4 px-4 py-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <SidebarTrigger data-testid="button-sidebar-toggle" className="-ml-1" />
            <div className="flex items-center gap-2">
              <ProfilePopover />
              <ThemeToggle />
            </div>
          </header>
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function Router() {
  const { isAuthenticated, user } = useAuth();
  const [location] = useLocation();

  if (location === "/" && isAuthenticated) {
    if (user?.role === "manager") {
      return <Redirect to="/manager/dashboard" />;
    }
    return <Redirect to="/dashboard" />;
  }

  if (location === "/" && !isAuthenticated) {
    return <Redirect to="/login" />;
  }

  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      
      <Route path="/dashboard">
        <AuthenticatedLayout>
          <ProtectedRoute component={EmployeeDashboard} requiredRole="employee" />
        </AuthenticatedLayout>
      </Route>
      
      <Route path="/attendance">
        <AuthenticatedLayout>
          <ProtectedRoute component={MarkAttendance} requiredRole="employee" />
        </AuthenticatedLayout>
      </Route>
      
      <Route path="/history">
        <AuthenticatedLayout>
          <ProtectedRoute component={AttendanceHistory} requiredRole="employee" />
        </AuthenticatedLayout>
      </Route>
      
      <Route path="/profile">
        <AuthenticatedLayout>
          <ProtectedRoute component={Profile} />
        </AuthenticatedLayout>
      </Route>

      <Route path="/manager/dashboard">
        <AuthenticatedLayout>
          <ProtectedRoute component={ManagerDashboard} requiredRole="manager" />
        </AuthenticatedLayout>
      </Route>
      
      <Route path="/manager/employees">
        <AuthenticatedLayout>
          <ProtectedRoute component={AllEmployees} requiredRole="manager" />
        </AuthenticatedLayout>
      </Route>
      
      <Route path="/manager/calendar">
        <AuthenticatedLayout>
          <ProtectedRoute component={TeamCalendar} requiredRole="manager" />
        </AuthenticatedLayout>
      </Route>
      
      <Route path="/manager/reports">
        <AuthenticatedLayout>
          <ProtectedRoute component={Reports} requiredRole="manager" />
        </AuthenticatedLayout>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
