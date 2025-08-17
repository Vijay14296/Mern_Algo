import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config(); // Load .env variables

const connectDB = async () => {
  try {
    console.log("🌐 Connecting to MongoDB...");
    
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: process.env.MONGO_DB, // optional
    });

    if (mongoose.connection.readyState === 1) {
      console.log("✅ MongoDB fully connected and ready");
    } else {
      console.log("⏳ Waiting for MongoDB connection...");
      await new Promise((resolve, reject) => {
        mongoose.connection.once("open", () => {
          console.log("✅ MongoDB connection open event received");
          resolve();
        });
        mongoose.connection.once("error", (err) => {
          console.error("❌ MongoDB connection error event:", err);
          reject(err);
        });
      });
    }
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
    process.exit(1);
  }
};

export default connectDB;
