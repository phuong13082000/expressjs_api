import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

class Database {
    constructor() {
        if (!process.env.MONGODB_URI) {
            throw new Error("MongoDB URI environment variable is missing");
        }
        this.uri = process.env.MONGODB_URI;
    }

    async connect() {
        try {
            await mongoose.connect(this.uri);
            console.log("Connected to MongoDB");
        } catch (err) {
            console.error("MongoDB connection error:", err);
            process.exit(1);
        }
    }

    async disconnect() {
        try {
            await mongoose.disconnect();
            console.log("Disconnected from MongoDB");
        } catch (err) {
            console.error("Error disconnecting MongoDB:", err);
        }
    }
}

export default new Database();
