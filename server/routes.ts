import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.js";
import { registerSchema, loginSchema } from "@shared/schema";
import { z } from "zod";
import { format, startOfMonth, endOfMonth, subDays, startOfWeek, endOfWeek } from "date-fns";
import bcrypt from "bcrypt";

const WORK_START_HOUR = 9;
const SALT_ROUNDS = 10;

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = registerSchema.parse(req.body);

      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const hashedPassword = await hashPassword(validatedData.password);
      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword,
      });

      const { password, ...userWithoutPassword } = user;
      res.status(201).json({ user: userWithoutPassword });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);

      const user = await storage.getUserByEmail(validatedData.email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const isValid = await verifyPassword(validatedData.password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const { password, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/auth/me", async (req, res) => {
    const userId = req.headers["x-user-id"] as string;
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { password, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  });

  app.get("/api/users/employees", async (req, res) => {
    try {
      const employees = await storage.getEmployees();
      const employeesWithoutPassword = employees.map(({ password, ...rest }) => rest);
      res.json(employeesWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/attendance/checkin", async (req, res) => {
    try {
      const userId = req.headers["x-user-id"] as string;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const today = format(new Date(), "yyyy-MM-dd");
      const existingAttendance = await storage.getAttendanceByUserAndDate(userId, today);

      if (existingAttendance?.checkInTime) {
        return res.status(400).json({ message: "Already checked in today" });
      }

      const now = new Date();
      const isLate = now.getHours() >= WORK_START_HOUR;
      const status = isLate ? "late" : "present";

      if (existingAttendance) {
        const updated = await storage.updateAttendance(existingAttendance.id, {
          checkInTime: now,
          status,
        });
        return res.json(updated);
      }

      const attendance = await storage.createAttendance({
        userId,
        date: today,
        checkInTime: now,
        checkOutTime: null,
        status,
        totalHours: 0,
      });

      res.status(201).json(attendance);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/attendance/checkout", async (req, res) => {
    try {
      const userId = req.headers["x-user-id"] as string;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const today = format(new Date(), "yyyy-MM-dd");
      const existingAttendance = await storage.getAttendanceByUserAndDate(userId, today);

      if (!existingAttendance?.checkInTime) {
        return res.status(400).json({ message: "Not checked in yet" });
      }

      if (existingAttendance.checkOutTime) {
        return res.status(400).json({ message: "Already checked out today" });
      }

      const now = new Date();
      const checkInTime = new Date(existingAttendance.checkInTime);
      const hoursWorked = Math.round((now.getTime() - checkInTime.getTime()) / (1000 * 60 * 60));

      let status = existingAttendance.status;
      if (hoursWorked < 4) {
        status = "half-day";
      }

      const updated = await storage.updateAttendance(existingAttendance.id, {
        checkOutTime: now,
        totalHours: hoursWorked,
        status,
      });

      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/attendance/today", async (req, res) => {
    try {
      const userId = req.headers["x-user-id"] as string;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const today = format(new Date(), "yyyy-MM-dd");
      const attendance = await storage.getAttendanceByUserAndDate(userId, today);

      res.json(attendance || null);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/attendance/my-history", async (req, res) => {
    try {
      const userId = req.headers["x-user-id"] as string;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const attendance = await storage.getAttendanceByUser(userId);
      res.json(attendance);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/attendance/my-summary", async (req, res) => {
    try {
      const userId = req.headers["x-user-id"] as string;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const now = new Date();
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);

      const attendance = await storage.getAttendanceByUser(userId);
      const monthlyAttendance = attendance.filter(a => {
        const date = new Date(a.date);
        return date >= monthStart && date <= monthEnd;
      });

      const summary = {
        totalPresent: monthlyAttendance.filter(a => a.status === "present").length,
        totalAbsent: monthlyAttendance.filter(a => a.status === "absent").length,
        totalLate: monthlyAttendance.filter(a => a.status === "late").length,
        totalHalfDay: monthlyAttendance.filter(a => a.status === "half-day").length,
        totalHours: monthlyAttendance.reduce((sum, a) => sum + (a.totalHours || 0), 0),
      };

      res.json(summary);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/attendance/all", async (req, res) => {
    try {
      const attendance = await storage.getAllAttendance();
      res.json(attendance);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/attendance/employee/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const attendance = await storage.getAttendanceByUser(id);
      res.json(attendance);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/attendance/today-status", async (req, res) => {
    try {
      const todayAttendance = await storage.getTodayAttendance();
      res.json(todayAttendance);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/attendance/export", async (req, res) => {
    try {
      const { from, to, employeeId } = req.query;

      const fromDate = from ? new Date(from as string) : startOfMonth(new Date());
      const toDate = to ? new Date(to as string) : endOfMonth(new Date());

      const attendance = await storage.getAttendanceByDateRange(
        fromDate,
        toDate,
        employeeId as string | undefined
      );

      const csvHeader = "Employee Name,Employee ID,Department,Date,Check In,Check Out,Hours,Status\n";
      const csvRows = attendance.map(a => {
        const checkIn = a.checkInTime ? format(new Date(a.checkInTime), "hh:mm a") : "";
        const checkOut = a.checkOutTime ? format(new Date(a.checkOutTime), "hh:mm a") : "";
        return `"${a.user?.name || ""}","${a.user?.employeeId || ""}","${a.user?.department || ""}","${a.date}","${checkIn}","${checkOut}","${a.totalHours || 0}","${a.status}"`;
      }).join("\n");

      const csv = csvHeader + csvRows;

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename=attendance_report_${format(fromDate, "yyyy-MM-dd")}_${format(toDate, "yyyy-MM-dd")}.csv`);
      res.send(csv);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/dashboard/employee", async (req, res) => {
    try {
      const userId = req.headers["x-user-id"] as string;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const today = format(new Date(), "yyyy-MM-dd");
      const now = new Date();
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);

      const todayStatus = await storage.getAttendanceByUserAndDate(userId, today);
      const allAttendance = await storage.getAttendanceByUser(userId);

      const monthlyAttendance = allAttendance.filter(a => {
        const date = new Date(a.date);
        return date >= monthStart && date <= monthEnd;
      });

      const recentAttendance = allAttendance.slice(0, 7);

      const monthlyStats = {
        totalPresent: monthlyAttendance.filter(a => a.status === "present").length,
        totalAbsent: monthlyAttendance.filter(a => a.status === "absent").length,
        totalLate: monthlyAttendance.filter(a => a.status === "late").length,
        totalHalfDay: monthlyAttendance.filter(a => a.status === "half-day").length,
        totalHours: monthlyAttendance.reduce((sum, a) => sum + (a.totalHours || 0), 0),
      };

      res.json({
        todayStatus,
        monthlyStats,
        recentAttendance,
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/dashboard/manager", async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      const employees = allUsers.filter(u => u.role === "employee");
      const today = format(new Date(), "yyyy-MM-dd");

      const todayAttendance = await storage.getTodayAttendance();

      const presentToday = todayAttendance.filter(a => a.status === "present" || a.status === "late");
      const absentToday = employees.filter(emp =>
        !todayAttendance.find(a => a.userId === emp.id)
      );
      const lateToday = todayAttendance.filter(a => a.status === "late");

      const weekStart = startOfWeek(new Date());
      const weekEnd = endOfWeek(new Date());
      const weeklyAttendance = await storage.getAttendanceByDateRange(weekStart, weekEnd);

      const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const weeklyTrend = weekDays.map((day, index) => {
        const dayDate = new Date(weekStart);
        dayDate.setDate(weekStart.getDate() + index);
        const dayStr = format(dayDate, "yyyy-MM-dd");

        const dayAttendance = weeklyAttendance.filter(a => a.date === dayStr);

        return {
          day,
          present: dayAttendance.filter(a => a.status === "present").length,
          absent: dayAttendance.filter(a => a.status === "absent").length,
          late: dayAttendance.filter(a => a.status === "late").length,
        };
      });

      const departments = [...new Set(employees.map(e => e.department))];
      const departmentStats = departments.map(dept => {
        const deptEmployees = employees.filter(e => e.department === dept);
        const deptTodayAttendance = todayAttendance.filter(a =>
          deptEmployees.find(e => e.id === a.userId)
        );

        return {
          department: dept,
          present: deptTodayAttendance.filter(a => a.status === "present" || a.status === "late").length,
          absent: deptEmployees.length - deptTodayAttendance.length,
        };
      });

      res.json({
        totalEmployees: employees.length,
        todayPresent: presentToday.length,
        todayAbsent: absentToday.length,
        todayLate: lateToday.length,
        weeklyTrend,
        departmentStats,
        absentToday: absentToday.map(({ password, ...rest }) => rest),
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  return httpServer;
}
