import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AttendanceCalendar } from "@/components/attendance-calendar";
import { StatusBadge } from "@/components/status-badge";
import { CalendarSkeleton, TableRowSkeleton } from "@/components/loading-skeleton";
import type { Attendance, DashboardStats } from "@shared/schema";
import { Calendar, Table as TableIcon, LogIn, LogOut, Timer, Filter } from "lucide-react";

export default function AttendanceHistoryPage() {
  const [view, setView] = useState<"calendar" | "table">("calendar");
  const [monthFilter, setMonthFilter] = useState<string>("all");

  const { data: history, isLoading: historyLoading } = useQuery<Attendance[]>({
    queryKey: ["/api/attendance/my-history"],
  });

  const { data: summary, isLoading: summaryLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/attendance/my-summary"],
  });

  const months = [
    { value: "all", label: "All Time" },
    { value: "0", label: "January" },
    { value: "1", label: "February" },
    { value: "2", label: "March" },
    { value: "3", label: "April" },
    { value: "4", label: "May" },
    { value: "5", label: "June" },
    { value: "6", label: "July" },
    { value: "7", label: "August" },
    { value: "8", label: "September" },
    { value: "9", label: "October" },
    { value: "10", label: "November" },
    { value: "11", label: "December" },
  ];

  const filteredHistory = history?.filter(record => {
    if (monthFilter === "all") return true;
    const recordMonth = new Date(record.date).getMonth();
    return recordMonth === parseInt(monthFilter);
  }) || [];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-[Poppins]">Attendance History</h1>
          <p className="text-muted-foreground mt-1">
            View and track your attendance records
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Select value={monthFilter} onValueChange={setMonthFilter}>
            <SelectTrigger className="w-40" data-testid="select-month-filter">
              <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Filter by month" />
            </SelectTrigger>
            <SelectContent>
              {months.map(month => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-emerald-500/10 border-emerald-500/20 overflow-visible">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold font-[Poppins] text-emerald-600 dark:text-emerald-400">
              {summary?.totalPresent || 0}
            </p>
            <p className="text-sm text-muted-foreground">Present</p>
          </CardContent>
        </Card>
        <Card className="bg-red-500/10 border-red-500/20 overflow-visible">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold font-[Poppins] text-red-600 dark:text-red-400">
              {summary?.totalAbsent || 0}
            </p>
            <p className="text-sm text-muted-foreground">Absent</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/10 border-amber-500/20 overflow-visible">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold font-[Poppins] text-amber-600 dark:text-amber-400">
              {summary?.totalLate || 0}
            </p>
            <p className="text-sm text-muted-foreground">Late</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-500/10 border-blue-500/20 overflow-visible">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold font-[Poppins] text-blue-600 dark:text-blue-400">
              {summary?.totalHours || 0}h
            </p>
            <p className="text-sm text-muted-foreground">Hours</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={view} onValueChange={(v) => setView(v as "calendar" | "table")}>
        <TabsList className="mb-4">
          <TabsTrigger value="calendar" className="gap-2" data-testid="tab-calendar">
            <Calendar className="h-4 w-4" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="table" className="gap-2" data-testid="tab-table">
            <TableIcon className="h-4 w-4" />
            Table
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="mt-0">
          {historyLoading ? (
            <CalendarSkeleton />
          ) : (
            <AttendanceCalendar attendance={filteredHistory} />
          )}
        </TabsContent>

        <TabsContent value="table" className="mt-0">
          <Card className="overflow-visible">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TableIcon className="h-5 w-5 text-primary" />
                Attendance Records
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Date</TableHead>
                      <TableHead>Check In</TableHead>
                      <TableHead>Check Out</TableHead>
                      <TableHead>Hours</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {historyLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRowSkeleton key={i} columns={5} />
                      ))
                    ) : filteredHistory.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          No attendance records found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredHistory.map((record, index) => (
                        <TableRow 
                          key={record.id}
                          className="animate-fade-in hover:bg-muted/50"
                          style={{ animationDelay: `${index * 50}ms` }}
                          data-testid={`table-row-${record.id}`}
                        >
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {format(new Date(record.date), "MMM d, yyyy")}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(record.date), "EEEE")}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <LogIn className="h-4 w-4 text-emerald-500" />
                              <span>
                                {record.checkInTime 
                                  ? format(new Date(record.checkInTime), "hh:mm a")
                                  : "--:--"
                                }
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <LogOut className="h-4 w-4 text-red-500" />
                              <span>
                                {record.checkOutTime 
                                  ? format(new Date(record.checkOutTime), "hh:mm a")
                                  : "--:--"
                                }
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Timer className="h-4 w-4 text-blue-500" />
                              <span>{record.totalHours || 0}h</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={record.status} size="sm" />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
