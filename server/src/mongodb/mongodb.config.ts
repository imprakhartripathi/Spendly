import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const mongoDBurl = process.env.MONGODB_URI as string;

if (!mongoDBurl) {
  console.error("❌🚨 MongoDB URI is missing! Set MONGODB_URI in .env");
  process.exit(1);
}

export const connectMongoDB = async () => {
  try {
    await mongoose.connect(mongoDBurl, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log("✅✌️ Connected to MongoDB Atlas");
  } catch (error) {
    console.error("❌🚨 Error connecting to MongoDB Atlas:", error);
    process.exit(1);
  }
};
