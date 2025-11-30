import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, Clock, Calendar as CalendarIcon } from "lucide-react";
import { StatusBadge } from "./status-badge";
import type { Attendance, AttendanceStatus } from "@shared/schema";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday } from "date-fns";

interface AttendanceCalendarProps {
  attendance: Attendance[];
  onDateClick?: (date: Date, record?: Attendance) => void;
}

const statusColors: Record<AttendanceStatus, string> = {
  present: "bg-emerald-500 hover:bg-emerald-600 text-white",
  absent: "bg-red-500 hover:bg-red-600 text-white",
  late: "bg-amber-500 hover:bg-amber-600 text-white",
  "half-day": "bg-orange-500 hover:bg-orange-600 text-white",
};

const statusBgLight: Record<AttendanceStatus, string> = {
  present: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",
  absent: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",
  late: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
  "half-day": "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300",
};

export function AttendanceCalendar({ attendance, onDateClick }: AttendanceCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedRecord, setSelectedRecord] = useState<Attendance | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const days = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const allDays = eachDayOfInterval({ start, end });
    
    const startPadding = start.getDay();
    const paddedDays: (Date | null)[] = Array(startPadding).fill(null);
    
    return [...paddedDays, ...allDays];
  }, [currentDate]);

  const getAttendanceForDate = (date: Date): Attendance | undefined => {
    return attendance.find(a => {
      const attendanceDate = new Date(a.date);
      return isSameDay(attendanceDate, date);
    });
  };

  const handleDateClick = (date: Date | null) => {
    if (!date) return;
    const record = getAttendanceForDate(date);
    if (record) {
      setSelectedRecord(record);
      setDialogOpen(true);
    }
    onDateClick?.(date, record);
  };

  const formatTime = (time: Date | string | null | undefined) => {
    if (!time) return "--:--";
    return format(new Date(time), "hh:mm a");
  };

  return (
    <>
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
              data-testid="button-prev-month"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              data-testid="button-next-month"
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

              const record = getAttendanceForDate(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isCurrentDay = isToday(day);

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => handleDateClick(day)}
                  data-testid={`calendar-day-${format(day, "yyyy-MM-dd")}`}
                  className={`
                    aspect-square rounded-lg flex flex-col items-center justify-center
                    text-sm font-medium transition-all duration-200
                    ${!isCurrentMonth ? "opacity-30" : ""}
                    ${isCurrentDay ? "ring-2 ring-primary ring-offset-2 dark:ring-offset-background" : ""}
                    ${record ? statusBgLight[record.status] : "hover:bg-muted"}
                    ${record ? "cursor-pointer transform hover:scale-105" : ""}
                  `}
                >
                  <span className={isCurrentDay ? "font-bold" : ""}>
                    {format(day, "d")}
                  </span>
                  {record && (
                    <span className={`w-2 h-2 rounded-full mt-1 ${statusColors[record.status].split(" ")[0]}`} />
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 mt-6 pt-4 border-t">
            {(["present", "absent", "late", "half-day"] as AttendanceStatus[]).map(status => (
              <div key={status} className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${statusColors[status].split(" ")[0]}`} />
                <span className="text-sm text-muted-foreground capitalize">{status.replace("-", " ")}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-[Poppins]">
              <CalendarIcon className="h-5 w-5 text-primary" />
              Attendance Details
            </DialogTitle>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium">{format(new Date(selectedRecord.date), "EEEE, MMMM d, yyyy")}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <StatusBadge status={selectedRecord.status} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Check In</span>
                <span className="font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4 text-emerald-500" />
                  {formatTime(selectedRecord.checkInTime)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Check Out</span>
                <span className="font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4 text-red-500" />
                  {formatTime(selectedRecord.checkOutTime)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total Hours</span>
                <span className="font-medium">{selectedRecord.totalHours || 0} hours</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
