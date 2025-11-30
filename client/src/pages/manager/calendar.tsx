import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StatusBadge } from "@/components/status-badge";
import { CalendarSkeleton } from "@/components/loading-skeleton";
import type { AttendanceWithUser, AttendanceStatus } from "@shared/schema";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Users,
  Building2,
  Filter
} from "lucide-react";

const statusColors: Record<AttendanceStatus, string> = {
  present: "bg-emerald-500",
  absent: "bg-red-500",
  late: "bg-amber-500",
  "half-day": "bg-orange-500",
};

export default function TeamCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: attendanceData, isLoading } = useQuery<AttendanceWithUser[]>({
    queryKey: ["/api/attendance/all"],
  });

  const departments = [...new Set(attendanceData?.map(a => a.user?.department).filter(Boolean) || [])];

  const filteredData = departmentFilter === "all" 
    ? attendanceData 
    : attendanceData?.filter(a => a.user?.department === departmentFilter);

  const days = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const allDays = eachDayOfInterval({ start, end });
    
    const startPadding = start.getDay();
    const paddedDays: (Date | null)[] = Array(startPadding).fill(null);
    
    return [...paddedDays, ...allDays];
  }, [currentDate]);

  const getAttendanceForDate = (date: Date) => {
    return filteredData?.filter(a => isSameDay(new Date(a.date), date)) || [];
  };

  const getDayStats = (date: Date) => {
    const dayAttendance = getAttendanceForDate(date);
    return {
      present: dayAttendance.filter(a => a.status === "present").length,
      absent: dayAttendance.filter(a => a.status === "absent").length,
      late: dayAttendance.filter(a => a.status === "late").length,
      halfDay: dayAttendance.filter(a => a.status === "half-day").length,
      total: dayAttendance.length,
    };
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setDialogOpen(true);
  };

  const selectedDayAttendance = selectedDate ? getAttendanceForDate(selectedDate) : [];

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold font-[Poppins]">Team Calendar</h1>
          <p className="text-muted-foreground mt-1">View team attendance at a glance</p>
        </div>
        <CalendarSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-[Poppins]">Team Calendar</h1>
          <p className="text-muted-foreground mt-1">
            View team attendance at a glance
          </p>
        </div>

        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger className="w-full lg:w-48" data-testid="select-department-calendar">
            <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="All Departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map(dept => (
              <SelectItem key={dept} value={dept!}>{dept}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="overflow-visible">
        <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4">
          <CardTitle className="flex items-center gap-2 font-[Poppins]">
            <CalendarIcon className="h-5 w-5 text-primary" />
            {format(currentDate, "MMMM yyyy")}
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              data-testid="button-prev-month-team"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              data-testid="button-next-month-team"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              if (!day) {
                return <div key={`empty-${index}`} className="aspect-square" />;
              }

              const stats = getDayStats(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isCurrentDay = isToday(day);

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => handleDateClick(day)}
                  data-testid={`team-calendar-day-${format(day, "yyyy-MM-dd")}`}
                  className={`
                    aspect-square rounded-lg p-1 flex flex-col items-center justify-start
                    text-sm transition-all duration-200 hover:bg-muted cursor-pointer
                    ${!isCurrentMonth ? "opacity-30" : ""}
                    ${isCurrentDay ? "ring-2 ring-primary ring-offset-2 dark:ring-offset-background" : ""}
                  `}
                >
                  <span className={`text-xs mb-1 ${isCurrentDay ? "font-bold" : ""}`}>
                    {format(day, "d")}
                  </span>
                  {stats.total > 0 && (
                    <div className="flex flex-wrap gap-0.5 justify-center">
                      {stats.present > 0 && (
                        <span className={`w-2 h-2 rounded-full ${statusColors.present}`} title={`${stats.present} present`} />
                      )}
                      {stats.absent > 0 && (
                        <span className={`w-2 h-2 rounded-full ${statusColors.absent}`} title={`${stats.absent} absent`} />
                      )}
                      {stats.late > 0 && (
                        <span className={`w-2 h-2 rounded-full ${statusColors.late}`} title={`${stats.late} late`} />
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 mt-6 pt-4 border-t">
            {(["present", "absent", "late", "half-day"] as AttendanceStatus[]).map(status => (
              <div key={status} className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${statusColors[status]}`} />
                <span className="text-sm text-muted-foreground capitalize">{status.replace("-", " ")}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-[Poppins]">
              <CalendarIcon className="h-5 w-5 text-primary" />
              {selectedDate && format(selectedDate, "EEEE, MMMM d, yyyy")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-2">
              <div className="p-3 rounded-lg bg-emerald-500/10 text-center">
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {selectedDayAttendance.filter(a => a.status === "present").length}
                </p>
                <p className="text-xs text-muted-foreground">Present</p>
              </div>
              <div className="p-3 rounded-lg bg-red-500/10 text-center">
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {selectedDayAttendance.filter(a => a.status === "absent").length}
                </p>
                <p className="text-xs text-muted-foreground">Absent</p>
              </div>
              <div className="p-3 rounded-lg bg-amber-500/10 text-center">
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {selectedDayAttendance.filter(a => a.status === "late").length}
                </p>
                <p className="text-xs text-muted-foreground">Late</p>
              </div>
              <div className="p-3 rounded-lg bg-orange-500/10 text-center">
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {selectedDayAttendance.filter(a => a.status === "half-day").length}
                </p>
                <p className="text-xs text-muted-foreground">Half Day</p>
              </div>
            </div>

            <ScrollArea className="h-64">
              <div className="space-y-2">
                {selectedDayAttendance.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No attendance records for this day
                  </p>
                ) : (
                  selectedDayAttendance.map((record, index) => {
                    const initials = record.user?.name?.split(" ").map(n => n[0]).join("").toUpperCase() || "U";
                    return (
                      <div
                        key={record.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50 animate-fade-in"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
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
                        <StatusBadge status={record.status} size="sm" />
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
