import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["employee", "manager"] }).notNull().default("employee"),
  employeeId: text("employee_id").notNull().unique(),
  department: text("department").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const attendance = pgTable("attendance", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  date: date("date").notNull(),
  checkInTime: timestamp("check_in_time"),
  checkOutTime: timestamp("check_out_time"),
  status: text("status", { enum: ["present", "absent", "late", "half-day"] }).notNull().default("present"),
  totalHours: integer("total_hours").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const registerSchema = insertUserSchema.extend({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  department: z.string().min(1, "Department is required"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const insertAttendanceSchema = createInsertSchema(attendance).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;
export type Attendance = typeof attendance.$inferSelect;

export type AttendanceStatus = "present" | "absent" | "late" | "half-day";
export type UserRole = "employee" | "manager";

export interface AttendanceWithUser extends Attendance {
  user?: User;
}

export interface DashboardStats {
  totalPresent: number;
  totalAbsent: number;
  totalLate: number;
  totalHalfDay: number;
  totalHours: number;
}

export interface EmployeeDashboard {
  todayStatus: Attendance | null;
  monthlyStats: DashboardStats;
  recentAttendance: Attendance[];
}

export interface ManagerDashboard {
  totalEmployees: number;
  todayPresent: number;
  todayAbsent: number;
  todayLate: number;
  weeklyTrend: { day: string; present: number; absent: number; late: number }[];
  departmentStats: { department: string; present: number; absent: number }[];
  absentToday: User[];
}
