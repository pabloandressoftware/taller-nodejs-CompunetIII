import mongoose from "mongoose";

const url = process.env.DATABASE_URL!;

export async function connectDB() {
    try {
        await mongoose.connect(url);
        console.log("connected successful");
    } catch (error) {
        console.log("connection refused");
    }
}