import { useLocation, Link } from "wouter";
import { 
  LayoutDashboard, 
  Clock, 
  History, 
  User, 
  Users, 
  Calendar, 
  FileText, 
  LogOut,
  Building2,
  CheckCircle2
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

const employeeMenuItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Mark Attendance", url: "/attendance", icon: Clock },
  { title: "Attendance History", url: "/history", icon: History },
  { title: "Profile", url: "/profile", icon: User },
];

const managerMenuItems = [
  { title: "Dashboard", url: "/manager/dashboard", icon: LayoutDashboard },
  { title: "All Employees", url: "/manager/employees", icon: Users },
  { title: "Team Calendar", url: "/manager/calendar", icon: Calendar },
  { title: "Reports", url: "/manager/reports", icon: FileText },
  { title: "Profile", url: "/profile", icon: User },
];

export function AppSidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const menuItems = user?.role === "manager" ? managerMenuItems : employeeMenuItems;
  const initials = user?.name?.split(" ").map(n => n[0]).join("").toUpperCase() || "U";

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="p-4">
        <Link href={user?.role === "manager" ? "/manager/dashboard" : "/dashboard"}>
          <div className="flex items-center gap-3 px-2 cursor-pointer group">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                <CheckCircle2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-sidebar animate-pulse" />
            </div>
            <div>
              <h1 className="font-bold text-lg font-[Poppins] text-sidebar-foreground">AttendEase</h1>
              <p className="text-xs text-muted-foreground">Attendance System</p>
            </div>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {user?.role === "manager" ? "Management" : "Navigation"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item, index) => {
                const isActive = location === item.url;
                return (
                  <SidebarMenuItem 
                    key={item.title}
                    className="animate-slide-in-left"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={`
                        group transition-all duration-200
                        ${isActive ? "bg-sidebar-accent" : ""}
                      `}
                    >
                      <Link href={item.url} data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, "-")}`}>
                        <item.icon className={`h-4 w-4 transition-colors ${isActive ? "text-primary" : ""}`} />
                        <span>{item.title}</span>
                        {isActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 mt-auto">
        <SidebarSeparator className="mb-4" />
        <div className="flex items-center gap-3 p-3 rounded-xl bg-sidebar-accent/50">
          <Avatar className="h-10 w-10 border-2 border-primary/20">
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name || "User"}</p>
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline" 
                className={`text-xs capitalize ${
                  user?.role === "manager" 
                    ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30" 
                    : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30"
                }`}
              >
                {user?.role || "employee"}
              </Badge>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground px-1">
          <Building2 className="h-3.5 w-3.5" />
          <span className="truncate">{user?.department || "Department"}</span>
        </div>
        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground px-1">
          <span className="font-mono">{user?.employeeId || "EMP000"}</span>
        </div>

        <Button
          variant="ghost"
          className="w-full mt-4 justify-start text-muted-foreground hover:text-destructive"
          onClick={handleLogout}
          data-testid="button-logout"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
