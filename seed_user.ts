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

        const hashedPassword = await bcrypt.hash("password123", 10);

        // Seed Manager
        const existingManager = await User.findOne({ email: "sarah@company.com" });
        if (!existingManager) {
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
        } else {
            console.log("Manager user already exists");
        }

        // Seed Employee
        const existingEmployee = await User.findOne({ email: "john@company.com" });
        if (!existingEmployee) {
            const employee = new User({
                id: randomUUID(),
                name: "John Doe",
                email: "john@company.com",
                password: hashedPassword,
                role: "employee",
                employeeId: "EMP002",
                department: "Engineering",
                createdAt: new Date(),
            });
            await employee.save();
            console.log("Employee user created");
        } else {
            console.log("Employee user already exists");
        }

        // Seed 100 random employees
        console.log("Seeding 100 random employees...");
        const departments = ["Engineering", "Human Resources", "Sales", "Marketing", "Finance", "Operations"];
        const employeesToInsert = [];

        for (let i = 1; i <= 100; i++) {
            const email = `employee${i}@company.com`;
            const existing = await User.findOne({ email });

            if (!existing) {
                employeesToInsert.push({
                    id: randomUUID(),
                    name: `Employee ${i}`,
                    email: email,
                    password: hashedPassword,
                    role: "employee",
                    employeeId: `EMP${2000 + i}`,
                    department: departments[Math.floor(Math.random() * departments.length)],
                    createdAt: new Date(),
                });
            }
        }

        if (employeesToInsert.length > 0) {
            await User.insertMany(employeesToInsert);
            console.log(`Successfully seeded ${employeesToInsert.length} new employees.`);
        } else {
            console.log("All 100 sample employees already exist.");
        }

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
})();
