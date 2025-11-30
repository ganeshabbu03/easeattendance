import { app, setupApp } from "../server/app.js";
import mongoose from "mongoose";

let isReady = false;

export default async (req: any, res: any) => {
    if (!isReady) {
        if (mongoose.connection.readyState === 0) {
            const mongoUri = process.env.MONGODB_URI;
            if (!mongoUri) {
                throw new Error("MONGODB_URI environment variable is not defined");
            }
            await mongoose.connect(mongoUri);
        }
        await setupApp();
        isReady = true;
    }
    app(req, res);
};
