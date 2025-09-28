import mongoose from "mongoose";

export async function connectDB() {
    try {
        const url = process.env.DATABASE_URL;
        
        if (!url) {
            throw new Error("DATABASE_URL environment variable is not defined");
        }
        
        console.log("🔌 Attempting to connect to MongoDB Atlas...");
        await mongoose.connect(url);
        console.log("✅ Connected to MongoDB Atlas successfully");
    } catch (error) {
        console.error("❌ MongoDB connection error:", error);
        throw error; // Re-lanzar el error para que se maneje en el servidor
    }
}