import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { randomUUID } from "crypto";

const userSchema = new mongoose.Schema({
    id: String,
    name: String,
    email: String,
    password: String,
    role: String,
    employeeId: String,
    department: String,
    createdAt: Date,
});

const User = mongoose.model("User", userSchema);

(async () => {
    try {
        await mongoose.connect("mongodb://localhost:27017/animated-attendance");

        const existing = await User.findOne({ email: "sarah@company.com" });
        if (existing) {
            console.log("User already exists");
            return;
        }

        const hashedPassword = await bcrypt.hash("password123", 10);
        const manager = new User({
            id: randomUUID(),
            name: "Sarah Johnson",
            email: "sarah@company.com",
            password: hashedPassword,
            role: "manager",
            employeeId: "EMP001",
            department: "Human Resources",
            createdAt: new Date(),
        });

        await manager.save();
        console.log("Manager user created");
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
})();
