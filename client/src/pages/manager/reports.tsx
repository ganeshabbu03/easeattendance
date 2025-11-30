import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { StatusBadge } from "@/components/status-badge";
import { TableRowSkeleton } from "@/components/loading-skeleton";
import type { AttendanceWithUser, User } from "@shared/schema";
import { 
  FileText, 
  Download, 
  Filter,
  Calendar,
  Users,
  LogIn,
  LogOut,
  Timer,
  Loader2,
  FileSpreadsheet
} from "lucide-react";

export default function ReportsPage() {
  const { toast } = useToast();
  const today = new Date();
  
  const [dateFrom, setDateFrom] = useState(format(startOfMonth(today), "yyyy-MM-dd"));
  const [dateTo, setDateTo] = useState(format(endOfMonth(today), "yyyy-MM-dd"));
  const [employeeFilter, setEmployeeFilter] = useState<string>("all");

  const { data: attendanceData, isLoading: attendanceLoading } = useQuery<AttendanceWithUser[]>({
    queryKey: ["/api/attendance/all"],
  });

  const { data: employees } = useQuery<User[]>({
    queryKey: ["/api/users/employees"],
  });

  const exportMutation = useMutation({
    mutationFn: async () => {
      const params = new URLSearchParams({
        from: dateFrom,
        to: dateTo,
        ...(employeeFilter !== "all" && { employeeId: employeeFilter }),
      });
      
      const response = await fetch(`/api/attendance/export?${params}`);
      if (!response.ok) throw new Error("Export failed");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `attendance_report_${dateFrom}_${dateTo}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    },
    onSuccess: () => {
      toast({
        title: "Export successful!",
        description: "Your attendance report has been downloaded.",
      });
    },
    onError: () => {
      toast({
        title: "Export failed",
        description: "Unable to export report. Please try again.",
        variant: "destructive",
      });
    },
  });

  const filteredData = attendanceData?.filter(record => {
    const recordDate = new Date(record.date);
    const fromDate = new Date(dateFrom);
    const toDate = new Date(dateTo);
    
    const matchesDate = recordDate >= fromDate && recordDate <= toDate;
    const matchesEmployee = employeeFilter === "all" || record.userId === employeeFilter;

    return matchesDate && matchesEmployee;
  }) || [];

  const presetRanges = [
    { label: "This Week", from: format(subDays(today, 7), "yyyy-MM-dd"), to: format(today, "yyyy-MM-dd") },
    { label: "This Month", from: format(startOfMonth(today), "yyyy-MM-dd"), to: format(endOfMonth(today), "yyyy-MM-dd") },
    { label: "Last 30 Days", from: format(subDays(today, 30), "yyyy-MM-dd"), to: format(today, "yyyy-MM-dd") },
  ];

  const applyPreset = (preset: { from: string; to: string }) => {
    setDateFrom(preset.from);
    setDateTo(preset.to);
  };

  const stats = {
    present: filteredData.filter(r => r.status === "present").length,
    absent: filteredData.filter(r => r.status === "absent").length,
    late: filteredData.filter(r => r.status === "late").length,
    halfDay: filteredData.filter(r => r.status === "half-day").length,
    totalHours: filteredData.reduce((sum, r) => sum + (r.totalHours || 0), 0),
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold font-[Poppins]">Reports</h1>
        <p className="text-muted-foreground mt-1">
          Generate and export attendance reports
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1 overflow-visible">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Filter className="h-5 w-5 text-primary" />
              Report Filters
            </CardTitle>
            <CardDescription>
              Select date range and employees
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Quick Presets</Label>
              <div className="flex flex-col gap-2">
                {presetRanges.map(preset => (
                  <Button
                    key={preset.label}
                    variant="outline"
                    size="sm"
                    onClick={() => applyPreset(preset)}
                    className="justify-start"
                    data-testid={`preset-${preset.label.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date-from">From Date</Label>
              <Input
                id="date-from"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                data-testid="input-date-from"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date-to">To Date</Label>
              <Input
                id="date-to"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                data-testid="input-date-to"
              />
            </div>

            <div className="space-y-2">
              <Label>Employee</Label>
              <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
                <SelectTrigger data-testid="select-employee-report">
                  <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="All Employees" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Employees</SelectItem>
                  {employees?.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              className="w-full"
              onClick={() => exportMutation.mutate()}
              disabled={exportMutation.isPending || filteredData.length === 0}
              data-testid="button-export"
            >
              {exportMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export to CSV
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <div className="lg:col-span-3 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card className="bg-emerald-500/10 border-emerald-500/20 overflow-visible">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold font-[Poppins] text-emerald-600 dark:text-emerald-400">
                  {stats.present}
                </p>
                <p className="text-xs text-muted-foreground">Present</p>
              </CardContent>
            </Card>
            <Card className="bg-red-500/10 border-red-500/20 overflow-visible">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold font-[Poppins] text-red-600 dark:text-red-400">
                  {stats.absent}
                </p>
                <p className="text-xs text-muted-foreground">Absent</p>
              </CardContent>
            </Card>
            <Card className="bg-amber-500/10 border-amber-500/20 overflow-visible">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold font-[Poppins] text-amber-600 dark:text-amber-400">
                  {stats.late}
                </p>
                <p className="text-xs text-muted-foreground">Late</p>
              </CardContent>
            </Card>
            <Card className="bg-orange-500/10 border-orange-500/20 overflow-visible">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold font-[Poppins] text-orange-600 dark:text-orange-400">
                  {stats.halfDay}
                </p>
                <p className="text-xs text-muted-foreground">Half Day</p>
              </CardContent>
            </Card>
            <Card className="bg-blue-500/10 border-blue-500/20 overflow-visible">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold font-[Poppins] text-blue-600 dark:text-blue-400">
                  {stats.totalHours}h
                </p>
                <p className="text-xs text-muted-foreground">Total Hours</p>
              </CardContent>
            </Card>
          </div>

          <Card className="overflow-visible">
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileSpreadsheet className="h-5 w-5 text-primary" />
                Report Preview
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {filteredData.length} records
              </p>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Employee</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Check In</TableHead>
                      <TableHead>Check Out</TableHead>
                      <TableHead>Hours</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendanceLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRowSkeleton key={i} columns={6} />
                      ))
                    ) : filteredData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                          <p>No records found for selected filters</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredData.slice(0, 20).map((record, index) => {
                        const initials = record.user?.name?.split(" ").map(n => n[0]).join("").toUpperCase() || "U";
                        return (
                          <TableRow 
                            key={record.id}
                            className="animate-fade-in hover:bg-muted/50"
                            style={{ animationDelay: `${index * 30}ms` }}
                          >
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                    {initials}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium text-sm">{record.user?.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {record.user?.department}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {format(new Date(record.date), "MMM d, yyyy")}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <LogIn className="h-3 w-3 text-emerald-500" />
                                <span className="text-sm">
                                  {record.checkInTime 
                                    ? format(new Date(record.checkInTime), "hh:mm a")
                                    : "--:--"
                                  }
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <LogOut className="h-3 w-3 text-red-500" />
                                <span className="text-sm">
                                  {record.checkOutTime 
                                    ? format(new Date(record.checkOutTime), "hh:mm a")
                                    : "--:--"
                                  }
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Timer className="h-3 w-3 text-blue-500" />
                                <span className="text-sm">{record.totalHours || 0}h</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={record.status} size="sm" />
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
              
              {filteredData.length > 20 && (
                <p className="text-center text-sm text-muted-foreground mt-4">
                  Showing 20 of {filteredData.length} records. Export to see all.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
