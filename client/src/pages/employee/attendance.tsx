import { useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { StatusBadge } from "@/components/status-badge";
import type { Attendance } from "@shared/schema";
import { 
  Clock, 
  LogIn, 
  LogOut, 
  Timer, 
  MapPin, 
  CalendarClock,
  CheckCircle2,
  AlertCircle,
  Sparkles
} from "lucide-react";

export default function MarkAttendancePage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: todayStatus, isLoading } = useQuery<Attendance | null>({
    queryKey: ["/api/attendance/today"],
  });

  const checkInMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/attendance/checkin", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/attendance/today"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/employee"] });
      toast({
        title: "Checked in successfully!",
        description: `Have a productive day, ${user?.name?.split(" ")[0]}!`,
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
      queryClient.invalidateQueries({ queryKey: ["/api/attendance/today"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/employee"] });
      toast({
        title: "Checked out successfully!",
        description: "Great work today! See you tomorrow.",
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

  const isCheckedIn = !!todayStatus?.checkInTime;
  const isCheckedOut = !!todayStatus?.checkOutTime;

  const currentTime = format(new Date(), "hh:mm:ss a");

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold font-[Poppins]">Mark Attendance</h1>
        <p className="text-muted-foreground mt-1">
          Track your daily work hours
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 overflow-visible">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-primary" />
              Today's Attendance
            </CardTitle>
            <CardDescription>
              {format(new Date(), "EEEE, MMMM d, yyyy")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="text-center py-8">
              <div className="text-6xl font-bold font-[Poppins] mb-2">
                {format(new Date(), "hh:mm")}
              </div>
              <p className="text-lg text-muted-foreground">
                {format(new Date(), "a")}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => checkInMutation.mutate()}
                disabled={isCheckedIn || checkInMutation.isPending}
                className={`
                  relative h-16 px-12 text-lg font-medium
                  ${!isCheckedIn 
                    ? "bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 shadow-lg shadow-emerald-500/30" 
                    : ""
                  }
                `}
                data-testid="button-checkin-main"
              >
                {isCheckedIn ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 mr-2" />
                    Checked In
                  </>
                ) : (
                  <>
                    <LogIn className="h-5 w-5 mr-2" />
                    Check In
                  </>
                )}
                {!isCheckedIn && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-ping" />
                )}
              </Button>

              <Button
                size="lg"
                variant="outline"
                onClick={() => checkOutMutation.mutate()}
                disabled={!isCheckedIn || isCheckedOut || checkOutMutation.isPending}
                className={`
                  h-16 px-12 text-lg font-medium
                  ${isCheckedIn && !isCheckedOut 
                    ? "border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:hover:bg-red-950 shadow-lg" 
                    : ""
                  }
                `}
                data-testid="button-checkout-main"
              >
                {isCheckedOut ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 mr-2" />
                    Checked Out
                  </>
                ) : (
                  <>
                    <LogOut className="h-5 w-5 mr-2" />
                    Check Out
                  </>
                )}
              </Button>
            </div>

            {todayStatus && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center animate-fade-in">
                  <LogIn className="h-6 w-6 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Check In</p>
                  <p className="text-lg font-bold font-[Poppins]">
                    {todayStatus.checkInTime 
                      ? format(new Date(todayStatus.checkInTime), "hh:mm a")
                      : "--:--"
                    }
                  </p>
                </div>
                
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-center animate-fade-in" style={{ animationDelay: "100ms" }}>
                  <LogOut className="h-6 w-6 text-red-600 dark:text-red-400 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Check Out</p>
                  <p className="text-lg font-bold font-[Poppins]">
                    {todayStatus.checkOutTime 
                      ? format(new Date(todayStatus.checkOutTime), "hh:mm a")
                      : "--:--"
                    }
                  </p>
                </div>
                
                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-center animate-fade-in" style={{ animationDelay: "200ms" }}>
                  <Timer className="h-6 w-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Hours Worked</p>
                  <p className="text-lg font-bold font-[Poppins]">
                    {todayStatus.totalHours || 0}h
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="overflow-visible">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-20 flex items-center justify-center">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
                </div>
              ) : todayStatus ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Today</span>
                    <StatusBadge status={todayStatus.status} size="lg" />
                  </div>
                  
                  {isCheckedIn && !isCheckedOut && (
                    <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 animate-pulse-subtle">
                      <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="font-medium">Currently Active</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Working since {format(new Date(todayStatus.checkInTime!), "hh:mm a")}
                      </p>
                    </div>
                  )}

                  {isCheckedOut && (
                    <div className="p-4 rounded-lg bg-muted/50 border border-border">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="font-medium">Work day completed</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Total: {todayStatus.totalHours} hours
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    Not checked in yet
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Click "Check In" to start your day
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="overflow-visible bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Quick Tip</h3>
                  <p className="text-sm text-muted-foreground">
                    Check in before 9:00 AM to be marked as "Present". 
                    Checking in after 9:00 AM will mark you as "Late".
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-visible">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-lg bg-muted/50 border border-border">
                <p className="font-medium">{user?.department || "Office"}</p>
                <p className="text-sm text-muted-foreground">
                  {user?.employeeId || "Employee"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
