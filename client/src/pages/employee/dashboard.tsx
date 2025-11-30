import { useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { StatCard } from "@/components/stat-card";
import { StatusBadge } from "@/components/status-badge";
import { DashboardSkeleton } from "@/components/loading-skeleton";
import type { EmployeeDashboard, Attendance } from "@shared/schema";
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Timer, 
  LogIn, 
  LogOut,
  Calendar,
  TrendingUp,
  Sparkles,
  Sun,
  Coffee
} from "lucide-react";

export default function EmployeeDashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: dashboard, isLoading } = useQuery<EmployeeDashboard>({
    queryKey: ["/api/dashboard/employee"],
  });

  const checkInMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/attendance/checkin", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/employee"] });
      queryClient.invalidateQueries({ queryKey: ["/api/attendance/today"] });
      toast({
        title: "Checked in successfully!",
        description: `Welcome to work, ${user?.name?.split(" ")[0]}!`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Check-in failed",
        description: error.message || "Unable to check in. Please try again.",
        variant: "destructive",
      });
    },
  });

  const checkOutMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/attendance/checkout", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/employee"] });
      queryClient.invalidateQueries({ queryKey: ["/api/attendance/today"] });
      toast({
        title: "Checked out successfully!",
        description: "Have a great rest of your day!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Check-out failed",
        description: error.message || "Unable to check out. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const todayStatus = dashboard?.todayStatus;
  const stats = dashboard?.monthlyStats;
  const recentAttendance = dashboard?.recentAttendance || [];

  const isCheckedIn = !!todayStatus?.checkInTime;
  const isCheckedOut = !!todayStatus?.checkOutTime;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: "Good morning", icon: Sun };
    if (hour < 17) return { text: "Good afternoon", icon: Coffee };
    return { text: "Good evening", icon: Sparkles };
  };

  const greeting = getGreeting();
  const GreetingIcon = greeting.icon;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <GreetingIcon className="h-4 w-4" />
            <span className="text-sm">{greeting.text}</span>
          </div>
          <h1 className="text-3xl font-bold font-[Poppins]">
            Welcome back, {user?.name?.split(" ")[0]}!
          </h1>
          <p className="text-muted-foreground mt-1">
            {format(new Date(), "EEEE, MMMM d, yyyy")}
          </p>
        </div>
        
        <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20 overflow-visible">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">Today's Status</p>
              {todayStatus ? (
                <div className="flex items-center gap-2">
                  <StatusBadge status={todayStatus.status} size="lg" />
                  {isCheckedIn && !isCheckedOut && (
                    <span className="flex items-center gap-1 text-sm text-emerald-600 dark:text-emerald-400">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                      Active
                    </span>
                  )}
                </div>
              ) : (
                <Badge variant="outline" className="text-muted-foreground">
                  Not checked in
                </Badge>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button
                size="lg"
                onClick={() => checkInMutation.mutate()}
                disabled={isCheckedIn || checkInMutation.isPending}
                className={`
                  relative overflow-visible transition-all
                  ${!isCheckedIn ? "bg-emerald-600 hover:bg-emerald-700 animate-pulse-subtle" : ""}
                `}
                data-testid="button-checkin"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Check In
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => checkOutMutation.mutate()}
                disabled={!isCheckedIn || isCheckedOut || checkOutMutation.isPending}
                className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950"
                data-testid="button-checkout"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Check Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Present Days"
          value={stats?.totalPresent || 0}
          icon={CheckCircle2}
          description="This month"
          variant="success"
          delay={0}
        />
        <StatCard
          title="Absent Days"
          value={stats?.totalAbsent || 0}
          icon={XCircle}
          description="This month"
          variant="danger"
          delay={100}
        />
        <StatCard
          title="Late Days"
          value={stats?.totalLate || 0}
          icon={Clock}
          description="This month"
          variant="warning"
          delay={200}
        />
        <StatCard
          title="Hours Worked"
          value={stats?.totalHours || 0}
          icon={Timer}
          description="This month"
          variant="info"
          delay={300}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="overflow-visible">
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Recent Attendance
            </CardTitle>
            <Button variant="ghost" size="sm" asChild className="text-muted-foreground">
              <a href="/history">View all</a>
            </Button>
          </CardHeader>
          <CardContent>
            {recentAttendance.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No recent attendance records</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentAttendance.slice(0, 5).map((record, index) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover-elevate animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                    data-testid={`attendance-record-${record.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-center min-w-[50px]">
                        <p className="text-2xl font-bold font-[Poppins]">
                          {format(new Date(record.date), "d")}
                        </p>
                        <p className="text-xs text-muted-foreground uppercase">
                          {format(new Date(record.date), "MMM")}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium">
                          {format(new Date(record.date), "EEEE")}
                        </p>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          {record.checkInTime && (
                            <span className="flex items-center gap-1">
                              <LogIn className="h-3 w-3 text-emerald-500" />
                              {format(new Date(record.checkInTime), "hh:mm a")}
                            </span>
                          )}
                          {record.checkOutTime && (
                            <span className="flex items-center gap-1">
                              <LogOut className="h-3 w-3 text-red-500" />
                              {format(new Date(record.checkOutTime), "hh:mm a")}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <StatusBadge status={record.status} size="sm" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-visible">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Monthly Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/20">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-medium">Present</p>
                    <p className="text-sm text-muted-foreground">On-time arrivals</p>
                  </div>
                </div>
                <span className="text-2xl font-bold font-[Poppins] text-emerald-600 dark:text-emerald-400">
                  {stats?.totalPresent || 0}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/20">
                    <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="font-medium">Late</p>
                    <p className="text-sm text-muted-foreground">Arrived after time</p>
                  </div>
                </div>
                <span className="text-2xl font-bold font-[Poppins] text-amber-600 dark:text-amber-400">
                  {stats?.totalLate || 0}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-500/20">
                    <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="font-medium">Half Day</p>
                    <p className="text-sm text-muted-foreground">Partial attendance</p>
                  </div>
                </div>
                <span className="text-2xl font-bold font-[Poppins] text-orange-600 dark:text-orange-400">
                  {stats?.totalHalfDay || 0}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-500/20">
                    <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <p className="font-medium">Absent</p>
                    <p className="text-sm text-muted-foreground">Days missed</p>
                  </div>
                </div>
                <span className="text-2xl font-bold font-[Poppins] text-red-600 dark:text-red-400">
                  {stats?.totalAbsent || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
