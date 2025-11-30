import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: String,
});

const User = mongoose.model("User", userSchema);

(async () => {
    try {
        await mongoose.connect("mongodb://localhost:27017/animated-attendance");
        const user = await User.findOne({ email: "sarah@company.com" });
        if (user) {
            console.log("User found:", user);
        } else {
            console.log("User not found");
        }
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
})();
