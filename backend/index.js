import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import { createServer } from "http";

import leaderboardRoutes from "./routes/leaderboard.js";
import authRoutes from "./routes/auth.routes.js";
import problemRoutes from "./routes/problem.routes.js";
import submitRoutes from "./routes/submit.routes.js";
import aiRoutes from "./routes/aiRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import { initSocket } from "./config/socket.js"; // ✅ new import

// --- Global error handlers ---
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  })
);

// Register routes
app.use("/api/auth", authRoutes);
app.use("/api/problems", problemRoutes);
app.use("/api/code", submitRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/users", userRoutes);
app.use("/api/leaderboard", leaderboardRoutes);

// Health check route
app.get("/", (req, res) => res.send("🚀 Online Judge Backend is running"));

// Create HTTP server
const httpServer = createServer(app);

// Connect MongoDB & start server
console.log("Connecting to MongoDB:", process.env.MONGO_URI);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");

    // ✅ Initialize socket AFTER DB connection
    initSocket(httpServer);

    httpServer.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    setTimeout(() => process.exit(1), 1000);
  });
import "./services/gamification.listener.js";   // ✅ add this line