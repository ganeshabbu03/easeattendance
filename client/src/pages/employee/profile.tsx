import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/lib/auth";
import { ProfileSkeleton } from "@/components/loading-skeleton";
import type { DashboardStats } from "@shared/schema";
import { 
  User, 
  Mail, 
  Building2, 
  BadgeCheck, 
  Calendar, 
  Clock,
  CheckCircle2,
  XCircle,
  Timer,
  TrendingUp
} from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();

  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/attendance/my-summary"],
  });

  if (!user) {
    return <ProfileSkeleton />;
  }

  const initials = user.name?.split(" ").map(n => n[0]).join("").toUpperCase() || "U";

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold font-[Poppins]">My Profile</h1>
        <p className="text-muted-foreground mt-1">
          View your profile information and stats
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 overflow-visible">
          <CardContent className="p-8 text-center">
            <div className="relative inline-block mb-6">
              <Avatar className="h-32 w-32 border-4 border-primary/20">
                <AvatarFallback className="text-4xl font-bold bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2 p-2 rounded-full bg-emerald-500 border-4 border-background">
                <CheckCircle2 className="h-4 w-4 text-white" />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold font-[Poppins] mb-1">{user.name}</h2>
            <p className="text-muted-foreground mb-4">{user.email}</p>
            
            <Badge 
              variant="outline"
              className={`
                text-sm capitalize px-4 py-1
                ${user.role === "manager" 
                  ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30" 
                  : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30"
                }
              `}
            >
              {user.role}
            </Badge>

            <Separator className="my-6" />

            <div className="space-y-4 text-left">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Building2 className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Department</p>
                  <p className="font-medium">{user.department}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <BadgeCheck className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Employee ID</p>
                  <p className="font-mono font-medium">{user.employeeId}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Joined</p>
                  <p className="font-medium">
                    {format(new Date(user.createdAt), "MMMM d, yyyy")}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 overflow-visible">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Monthly Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-800/10 border border-emerald-200/50 dark:border-emerald-700/30">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-emerald-500/20">
                      <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <span className="text-4xl font-bold font-[Poppins] text-emerald-600 dark:text-emerald-400">
                      {stats?.totalPresent || 0}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">Present Days</p>
                  <p className="text-xs text-muted-foreground mt-1">This month</p>
                </div>

                <div className="p-6 rounded-xl bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-800/10 border border-red-200/50 dark:border-red-700/30">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-red-500/20">
                      <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>
                    <span className="text-4xl font-bold font-[Poppins] text-red-600 dark:text-red-400">
                      {stats?.totalAbsent || 0}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">Absent Days</p>
                  <p className="text-xs text-muted-foreground mt-1">This month</p>
                </div>

                <div className="p-6 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-800/10 border border-amber-200/50 dark:border-amber-700/30">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-amber-500/20">
                      <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                    </div>
                    <span className="text-4xl font-bold font-[Poppins] text-amber-600 dark:text-amber-400">
                      {stats?.totalLate || 0}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">Late Days</p>
                  <p className="text-xs text-muted-foreground mt-1">This month</p>
                </div>

                <div className="p-6 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 border border-blue-200/50 dark:border-blue-700/30">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-blue-500/20">
                      <Timer className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-4xl font-bold font-[Poppins] text-blue-600 dark:text-blue-400">
                      {stats?.totalHours || 0}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">Hours Worked</p>
                  <p className="text-xs text-muted-foreground mt-1">This month</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-visible">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <User className="h-4 w-4" />
                Full Name
              </p>
              <p className="font-medium text-lg">{user.name}</p>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address
              </p>
              <p className="font-medium text-lg">{user.email}</p>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Department
              </p>
              <p className="font-medium text-lg">{user.department}</p>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <BadgeCheck className="h-4 w-4" />
                Employee ID
              </p>
              <p className="font-mono font-medium text-lg">{user.employeeId}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
