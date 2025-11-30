import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: String,
});

const User = mongoose.model("User", userSchema);

(async () => {
    try {
        await mongoose.connect("mongodb://localhost:27017/animated-attendance");
        const count = await User.countDocuments();
        console.log(`Total users in database: ${count}`);
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
})();
