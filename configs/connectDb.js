import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

if (!process.env.MONGODB_URI) {
    throw new Error('MongoDB URI environment variable is missing');
}

async function connectDb() {
    try {
        await mongoose.connect(process.env.MONGODB_URI)
        console.log("Connected to MongoDB")
    } catch (err) {
        console.log("MongoDB connection error:", err)
        process.exit(1);
    }
}

export default connectDb;
