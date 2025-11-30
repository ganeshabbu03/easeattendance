import { type User, type InsertUser, type Attendance, type InsertAttendance, type AttendanceWithUser, type AttendanceStatus } from "@shared/schema";
import { randomUUID } from "crypto";
import { format, startOfMonth, endOfMonth, subDays } from "date-fns";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByEmployeeId(employeeId: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  getEmployees(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  
  getAttendance(id: string): Promise<Attendance | undefined>;
  getAttendanceByUserAndDate(userId: string, date: string): Promise<Attendance | undefined>;
  getAttendanceByUser(userId: string): Promise<Attendance[]>;
  getAllAttendance(): Promise<AttendanceWithUser[]>;
  getAttendanceByDateRange(from: Date, to: Date, userId?: string): Promise<AttendanceWithUser[]>;
  createAttendance(attendance: InsertAttendance): Promise<Attendance>;
  updateAttendance(id: string, updates: Partial<Attendance>): Promise<Attendance | undefined>;
  getTodayAttendance(): Promise<AttendanceWithUser[]>;
}

function generateEmployeeId(): string {
  const num = Math.floor(Math.random() * 9000) + 1000;
  return `EMP${num}`;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private attendance: Map<string, Attendance>;
  private employeeIdCounter: number = 1;

  constructor() {
    this.users = new Map();
    this.attendance = new Map();
    this.seedData();
  }

  private seedData() {
    const departments = ["Engineering", "Product", "Design", "Marketing", "Sales", "Human Resources"];
    
    const manager: User = {
      id: randomUUID(),
      name: "Sarah Johnson",
      email: "sarah@company.com",
      password: "$2b$10$qMTxkL3xGBT9Rq6rz6YjdOJhqjHpRqLQQQ5TvJ0pJ1E0PfDHnLCJy",
      role: "manager",
      employeeId: "EMP001",
      department: "Human Resources",
      createdAt: new Date("2024-01-01"),
    };
    this.users.set(manager.id, manager);

    const employees: User[] = [
      {
        id: randomUUID(),
        name: "John Doe",
        email: "john@company.com",
        password: "$2b$10$qMTxkL3xGBT9Rq6rz6YjdOJhqjHpRqLQQQ5TvJ0pJ1E0PfDHnLCJy",
        role: "employee",
        employeeId: "EMP002",
        department: "Engineering",
        createdAt: new Date("2024-01-15"),
      },
      {
        id: randomUUID(),
        name: "Jane Smith",
        email: "jane@company.com",
        password: "$2b$10$qMTxkL3xGBT9Rq6rz6YjdOJhqjHpRqLQQQ5TvJ0pJ1E0PfDHnLCJy",
        role: "employee",
        employeeId: "EMP003",
        department: "Product",
        createdAt: new Date("2024-02-01"),
      },
      {
        id: randomUUID(),
        name: "Mike Wilson",
        email: "mike@company.com",
        password: "$2b$10$qMTxkL3xGBT9Rq6rz6YjdOJhqjHpRqLQQQ5TvJ0pJ1E0PfDHnLCJy",
        role: "employee",
        employeeId: "EMP004",
        department: "Design",
        createdAt: new Date("2024-02-15"),
      },
      {
        id: randomUUID(),
        name: "Emily Brown",
        email: "emily@company.com",
        password: "$2b$10$qMTxkL3xGBT9Rq6rz6YjdOJhqjHpRqLQQQ5TvJ0pJ1E0PfDHnLCJy",
        role: "employee",
        employeeId: "EMP005",
        department: "Marketing",
        createdAt: new Date("2024-03-01"),
      },
      {
        id: randomUUID(),
        name: "David Lee",
        email: "david@company.com",
        password: "$2b$10$qMTxkL3xGBT9Rq6rz6YjdOJhqjHpRqLQQQ5TvJ0pJ1E0PfDHnLCJy",
        role: "employee",
        employeeId: "EMP006",
        department: "Sales",
        createdAt: new Date("2024-03-15"),
      },
    ];

    employees.forEach(emp => this.users.set(emp.id, emp));

    const allEmployees = [manager, ...employees];
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const date = subDays(today, i);
      const dateStr = format(date, "yyyy-MM-dd");
      
      if (date.getDay() === 0 || date.getDay() === 6) continue;

      allEmployees.forEach(emp => {
        if (i === 0 && Math.random() > 0.7) return;

        const rand = Math.random();
        let status: AttendanceStatus;
        let checkInHour = 8 + Math.floor(Math.random() * 2);
        let checkInMinute = Math.floor(Math.random() * 60);
        let totalHours = 8;

        if (rand < 0.7) {
          status = "present";
          checkInHour = 8;
          checkInMinute = Math.floor(Math.random() * 45);
        } else if (rand < 0.85) {
          status = "late";
          checkInHour = 9 + Math.floor(Math.random() * 2);
          checkInMinute = Math.floor(Math.random() * 30);
        } else if (rand < 0.95) {
          status = "half-day";
          totalHours = 4;
        } else {
          status = "absent";
          totalHours = 0;
        }

        const checkInTime = status !== "absent" 
          ? new Date(date.getFullYear(), date.getMonth(), date.getDate(), checkInHour, checkInMinute)
          : null;
        
        const checkOutTime = (status !== "absent" && (i > 0 || Math.random() > 0.5))
          ? new Date(date.getFullYear(), date.getMonth(), date.getDate(), checkInHour + totalHours, checkInMinute)
          : null;

        const attendance: Attendance = {
          id: randomUUID(),
          userId: emp.id,
          date: dateStr,
          checkInTime: checkInTime,
          checkOutTime: checkOutTime,
          status,
          totalHours: checkOutTime ? totalHours : 0,
          createdAt: date,
        };

        this.attendance.set(attendance.id, attendance);
      });
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }

  async getUserByEmployeeId(employeeId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.employeeId === employeeId
    );
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getEmployees(): Promise<User[]> {
    return Array.from(this.users.values()).filter(u => u.role === "employee");
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    let employeeId = insertUser.employeeId;
    
    if (!employeeId) {
      do {
        employeeId = generateEmployeeId();
      } while (await this.getUserByEmployeeId(employeeId));
    }

    const user: User = { 
      ...insertUser, 
      id, 
      employeeId,
      createdAt: new Date() 
    };
    this.users.set(id, user);
    return user;
  }

  async getAttendance(id: string): Promise<Attendance | undefined> {
    return this.attendance.get(id);
  }

  async getAttendanceByUserAndDate(userId: string, date: string): Promise<Attendance | undefined> {
    return Array.from(this.attendance.values()).find(
      (a) => a.userId === userId && a.date === date
    );
  }

  async getAttendanceByUser(userId: string): Promise<Attendance[]> {
    return Array.from(this.attendance.values())
      .filter((a) => a.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async getAllAttendance(): Promise<AttendanceWithUser[]> {
    const attendanceList = Array.from(this.attendance.values())
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return Promise.all(
      attendanceList.map(async (a) => ({
        ...a,
        user: await this.getUser(a.userId),
      }))
    );
  }

  async getAttendanceByDateRange(from: Date, to: Date, userId?: string): Promise<AttendanceWithUser[]> {
    const fromStr = format(from, "yyyy-MM-dd");
    const toStr = format(to, "yyyy-MM-dd");
    
    const attendanceList = Array.from(this.attendance.values())
      .filter((a) => {
        const matchesDate = a.date >= fromStr && a.date <= toStr;
        const matchesUser = !userId || a.userId === userId;
        return matchesDate && matchesUser;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return Promise.all(
      attendanceList.map(async (a) => ({
        ...a,
        user: await this.getUser(a.userId),
      }))
    );
  }

  async createAttendance(insertAttendance: InsertAttendance): Promise<Attendance> {
    const id = randomUUID();
    const attendance: Attendance = {
      ...insertAttendance,
      id,
      createdAt: new Date(),
    };
    this.attendance.set(id, attendance);
    return attendance;
  }

  async updateAttendance(id: string, updates: Partial<Attendance>): Promise<Attendance | undefined> {
    const existing = this.attendance.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...updates };
    this.attendance.set(id, updated);
    return updated;
  }

  async getTodayAttendance(): Promise<AttendanceWithUser[]> {
    const today = format(new Date(), "yyyy-MM-dd");
    const todayAttendance = Array.from(this.attendance.values())
      .filter((a) => a.date === today);
    
    return Promise.all(
      todayAttendance.map(async (a) => ({
        ...a,
        user: await this.getUser(a.userId),
      }))
    );
  }
}

export const storage = new MemStorage();
