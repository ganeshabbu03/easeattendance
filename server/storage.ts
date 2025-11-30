import { type User, type InsertUser, type Attendance, type InsertAttendance, type AttendanceWithUser, type AttendanceStatus } from "@shared/schema";
import { randomUUID } from "crypto";
import { format } from "date-fns";
import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcrypt";

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

// Mongoose Schemas
const userSchema = new Schema<User>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ["employee", "manager"] },
  employeeId: { type: String, required: true, unique: true },
  department: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const attendanceSchema = new Schema<Attendance>({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true, ref: 'User' },
  date: { type: String, required: true },
  checkInTime: { type: Date },
  checkOutTime: { type: Date },
  status: { type: String, required: true },
  totalHours: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

const UserModel = mongoose.model<User>('User', userSchema);
const AttendanceModel = mongoose.model<Attendance>('Attendance', attendanceSchema);

export class MongoStorage implements IStorage {
  constructor() {
    // Connection logic will be in index.ts
  }

  async getUser(id: string): Promise<User | undefined> {
    const user = await UserModel.findOne({ id });
    return user?.toObject();
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const user = await UserModel.findOne({ email });
    return user?.toObject();
  }

  async getUserByEmployeeId(employeeId: string): Promise<User | undefined> {
    const user = await UserModel.findOne({ employeeId });
    return user?.toObject();
  }

  async getAllUsers(): Promise<User[]> {
    const users = await UserModel.find();
    return users.map(u => u.toObject());
  }

  async getEmployees(): Promise<User[]> {
    const users = await UserModel.find({ role: "employee" });
    return users.map(u => u.toObject());
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    let employeeId = insertUser.employeeId;

    if (!employeeId) {
      do {
        employeeId = generateEmployeeId();
      } while (await this.getUserByEmployeeId(employeeId));
    }

    const user = new UserModel({
      id,
      ...insertUser,
      role: insertUser.role || "employee",
      employeeId,
      createdAt: new Date(),
    });

    await user.save();
    return user.toObject();
  }

  async getAttendance(id: string): Promise<Attendance | undefined> {
    const attendance = await AttendanceModel.findOne({ id });
    return attendance?.toObject();
  }

  async getAttendanceByUserAndDate(userId: string, date: string): Promise<Attendance | undefined> {
    const attendance = await AttendanceModel.findOne({ userId, date });
    return attendance?.toObject();
  }

  async getAttendanceByUser(userId: string): Promise<Attendance[]> {
    const attendance = await AttendanceModel.find({ userId }).sort({ date: -1 });
    return attendance.map(a => a.toObject());
  }

  async getAllAttendance(): Promise<AttendanceWithUser[]> {
    const attendance = await AttendanceModel.find().sort({ date: -1 });

    // Manual join since we are using string IDs not ObjectId for references in this schema design
    // to keep compatibility with existing frontend/types
    const result: AttendanceWithUser[] = [];
    for (const a of attendance) {
      const user = await this.getUser(a.userId);
      if (user) {
        result.push({ ...a.toObject(), user });
      }
    }
    return result;
  }

  async getAttendanceByDateRange(from: Date, to: Date, userId?: string): Promise<AttendanceWithUser[]> {
    const fromStr = format(from, "yyyy-MM-dd");
    const toStr = format(to, "yyyy-MM-dd");

    const query: any = {
      date: { $gte: fromStr, $lte: toStr }
    };

    if (userId) {
      query.userId = userId;
    }

    const attendance = await AttendanceModel.find(query).sort({ date: -1 });

    const result: AttendanceWithUser[] = [];
    for (const a of attendance) {
      const user = await this.getUser(a.userId);
      if (user) {
        result.push({ ...a.toObject(), user });
      }
    }
    return result;
  }

  async createAttendance(insertAttendance: InsertAttendance): Promise<Attendance> {
    const id = randomUUID();
    const attendance = new AttendanceModel({
      id,
      ...insertAttendance,
      checkInTime: insertAttendance.checkInTime || null,
      checkOutTime: insertAttendance.checkOutTime || null,
      status: insertAttendance.status || "present",
      totalHours: insertAttendance.totalHours || 0,
      createdAt: new Date(),
    });

    await attendance.save();
    return attendance.toObject();
  }

  async updateAttendance(id: string, updates: Partial<Attendance>): Promise<Attendance | undefined> {
    const attendance = await AttendanceModel.findOneAndUpdate(
      { id },
      { $set: updates },
      { new: true }
    );
    return attendance?.toObject();
  }

  async getTodayAttendance(): Promise<AttendanceWithUser[]> {
    const today = format(new Date(), "yyyy-MM-dd");
    const attendance = await AttendanceModel.find({ date: today });

    const result: AttendanceWithUser[] = [];
    for (const a of attendance) {
      const user = await this.getUser(a.userId);
      if (user) {
        result.push({ ...a.toObject(), user });
      }
    }
    return result;
  }
}

export const storage = new MongoStorage();
