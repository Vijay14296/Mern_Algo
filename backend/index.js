import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import axios from "axios";

// Route imports
import authRoutes from "./routes/auth.routes.js";
import problemRoutes from "./routes/problem.routes.js";
import submitRoutes from "./routes/submit.routes.js"; // ✅ submit controller route

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;


// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.CORS_ORIGIN || "*",
  credentials: true
}));


// Register routes
app.use("/api/auth", authRoutes);          // ➤ Auth routes
app.use("/api/problems", problemRoutes);   // ➤ Problem CRUD
app.use("/api/code", submitRoutes);        // ➤ Code submission

// Optional: Health check route
app.get("/", (req, res) => {
  res.send("🚀 Online Judge Backend is running");
});
console.log("Connecting to:", process.env.MONGO_URI);

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
  });
