import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/status-badge";
import { TableRowSkeleton } from "@/components/loading-skeleton";
import type { AttendanceWithUser, User, Attendance } from "@shared/schema";
import { 
  Users, 
  Search, 
  Filter, 
  Calendar,
  LogIn,
  LogOut,
  Timer,
  Eye,
  Building2,
  X
} from "lucide-react";

export default function AllEmployeesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: attendanceData, isLoading: attendanceLoading } = useQuery<AttendanceWithUser[]>({
    queryKey: ["/api/attendance/all"],
  });

  const { data: employeeAttendance, isLoading: employeeLoading } = useQuery<Attendance[]>({
    queryKey: ["/api/attendance/employee", selectedEmployee?.id],
    enabled: !!selectedEmployee,
  });

  const departments = [...new Set(attendanceData?.map(a => a.user?.department).filter(Boolean) || [])];

  const filteredData = attendanceData?.filter(record => {
    const matchesSearch = 
      record.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.user?.employeeId?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || record.status === statusFilter;
    const matchesDepartment = departmentFilter === "all" || record.user?.department === departmentFilter;

    return matchesSearch && matchesStatus && matchesDepartment;
  }) || [];

  const handleViewEmployee = (user: User) => {
    setSelectedEmployee(user);
    setDialogOpen(true);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setDepartmentFilter("all");
  };

  const hasFilters = searchQuery || statusFilter !== "all" || departmentFilter !== "all";

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold font-[Poppins]">All Employees</h1>
        <p className="text-muted-foreground mt-1">
          View and manage team attendance records
        </p>
      </div>

      <Card className="overflow-visible">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40" data-testid="select-status-filter">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="present">Present</SelectItem>
                <SelectItem value="absent">Absent</SelectItem>
                <SelectItem value="late">Late</SelectItem>
                <SelectItem value="half-day">Half Day</SelectItem>
              </SelectContent>
            </Select>

            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-full md:w-48" data-testid="select-department-filter">
                <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept!}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {hasFilters && (
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="text-muted-foreground"
                data-testid="button-clear-filters"
              >
                <X className="h-4 w-4 mr-2" />
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-visible">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Attendance Records
          </CardTitle>
          <Badge variant="outline">
            {filteredData.length} records
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Check In</TableHead>
                  <TableHead>Check Out</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendanceLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRowSkeleton key={i} columns={8} />
                  ))
                ) : filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No attendance records found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((record, index) => {
                    const initials = record.user?.name?.split(" ").map(n => n[0]).join("").toUpperCase() || "U";
                    return (
                      <TableRow 
                        key={record.id}
                        className="animate-fade-in hover:bg-muted/50"
                        style={{ animationDelay: `${index * 30}ms` }}
                        data-testid={`employee-row-${record.id}`}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{record.user?.name}</p>
                              <p className="text-xs text-muted-foreground font-mono">
                                {record.user?.employeeId}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-normal">
                            {record.user?.department}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {format(new Date(record.date), "MMM d, yyyy")}
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
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => record.user && handleViewEmployee(record.user)}
                            data-testid={`button-view-${record.id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-[Poppins]">
              <Users className="h-5 w-5 text-primary" />
              Employee Details
            </DialogTitle>
          </DialogHeader>
          {selectedEmployee && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-2 border-primary/20">
                  <AvatarFallback className="text-xl bg-primary/10 text-primary">
                    {selectedEmployee.name?.split(" ").map(n => n[0]).join("").toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{selectedEmployee.name}</h3>
                  <p className="text-muted-foreground">{selectedEmployee.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {selectedEmployee.department}
                    </Badge>
                    <span className="text-xs text-muted-foreground font-mono">
                      {selectedEmployee.employeeId}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Recent Attendance
                </h4>
                {employeeLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-12 bg-muted animate-pulse rounded-lg" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {employeeAttendance?.slice(0, 5).map((record, index) => (
                      <div
                        key={record.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div>
                          <p className="font-medium">
                            {format(new Date(record.date), "MMM d, yyyy")}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {record.checkInTime && format(new Date(record.checkInTime), "hh:mm a")}
                            {record.checkOutTime && ` - ${format(new Date(record.checkOutTime), "hh:mm a")}`}
                          </p>
                        </div>
                        <StatusBadge status={record.status} size="sm" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
