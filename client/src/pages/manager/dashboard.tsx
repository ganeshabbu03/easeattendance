import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { StatCard } from "@/components/stat-card";
import { DashboardSkeleton } from "@/components/loading-skeleton";
import type { ManagerDashboard } from "@shared/schema";
import { 
  Users, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  TrendingUp,
  Calendar,
  BarChart3,
  Building2,
  AlertCircle,
  Sun,
  Coffee,
  Sparkles
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, PieChart, Pie, Cell } from "recharts";

export default function ManagerDashboardPage() {
  const { user } = useAuth();

  const { data: dashboard, isLoading } = useQuery<ManagerDashboard>({
    queryKey: ["/api/dashboard/manager"],
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: "Good morning", icon: Sun };
    if (hour < 17) return { text: "Good afternoon", icon: Coffee };
    return { text: "Good evening", icon: Sparkles };
  };

  const greeting = getGreeting();
  const GreetingIcon = greeting.icon;

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const COLORS = ["hsl(142, 71%, 45%)", "hsl(0, 84%, 60%)", "hsl(43, 96%, 56%)"];

  const pieData = [
    { name: "Present", value: dashboard?.todayPresent || 0 },
    { name: "Absent", value: dashboard?.todayAbsent || 0 },
    { name: "Late", value: dashboard?.todayLate || 0 },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <GreetingIcon className="h-4 w-4" />
            <span className="text-sm">{greeting.text}</span>
          </div>
          <h1 className="text-3xl font-bold font-[Poppins]">
            Manager Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            {format(new Date(), "EEEE, MMMM d, yyyy")}
          </p>
        </div>
        
        <Card className="bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent border-purple-500/20 overflow-visible">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-purple-500/20">
              <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Employees</p>
              <p className="text-3xl font-bold font-[Poppins]">
                {dashboard?.totalEmployees || 0}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Present Today"
          value={dashboard?.todayPresent || 0}
          icon={CheckCircle2}
          description="Employees at work"
          variant="success"
          delay={0}
        />
        <StatCard
          title="Absent Today"
          value={dashboard?.todayAbsent || 0}
          icon={XCircle}
          description="Not checked in"
          variant="danger"
          delay={100}
        />
        <StatCard
          title="Late Arrivals"
          value={dashboard?.todayLate || 0}
          icon={Clock}
          description="Arrived after 9 AM"
          variant="warning"
          delay={200}
        />
        <StatCard
          title="Total Employees"
          value={dashboard?.totalEmployees || 0}
          icon={Users}
          description="In your team"
          variant="info"
          delay={300}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="overflow-visible">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Weekly Attendance Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dashboard?.weeklyTrend || []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="day" 
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="present" 
                    stroke="hsl(142, 71%, 45%)" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(142, 71%, 45%)', strokeWidth: 2 }}
                    name="Present"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="absent" 
                    stroke="hsl(0, 84%, 60%)" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(0, 84%, 60%)', strokeWidth: 2 }}
                    name="Absent"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="late" 
                    stroke="hsl(43, 96%, 56%)" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(43, 96%, 56%)', strokeWidth: 2 }}
                    name="Late"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-visible">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Department Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dashboard?.departmentStats || []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="department" 
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="present" 
                    fill="hsl(142, 71%, 45%)" 
                    radius={[4, 4, 0, 0]}
                    name="Present"
                  />
                  <Bar 
                    dataKey="absent" 
                    fill="hsl(0, 84%, 60%)" 
                    radius={[4, 4, 0, 0]}
                    name="Absent"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="overflow-visible">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Today's Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              {pieData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[index] }}
                  />
                  <span className="text-sm text-muted-foreground">{entry.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 overflow-visible">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Absent Today
            </CardTitle>
            <Badge variant="outline" className="bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30">
              {dashboard?.absentToday?.length || 0} employees
            </Badge>
          </CardHeader>
          <CardContent>
            {!dashboard?.absentToday || dashboard.absentToday.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
                <p className="text-muted-foreground">Everyone is present today!</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {dashboard.absentToday.map((employee, index) => {
                  const initials = employee.name?.split(" ").map(n => n[0]).join("").toUpperCase() || "U";
                  return (
                    <div
                      key={employee.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover-elevate animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                      data-testid={`absent-employee-${employee.id}`}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border border-red-200 dark:border-red-800">
                          <AvatarFallback className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{employee.name}</p>
                          <p className="text-sm text-muted-foreground">{employee.department}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30">
                        Absent
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
