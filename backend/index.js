import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

// Route imports
import authRoutes from "./routes/auth.routes.js";
import problemRoutes from "./routes/problem.routes.js";
import submitRoutes from "./routes/submit.routes.js"; // ✅ submit controller route
import aiRoutes from "./routes/aiRoutes.js";


// --- Global error handlers ---
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

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
app.use("/api/auth", authRoutes);
app.use("/api/problems", problemRoutes);
app.use("/api/code", submitRoutes);
app.use("/api/ai", aiRoutes);
// Health check route
app.get("/", (req, res) => {
  res.send("🚀 Online Judge Backend is running");
});

console.log("Connecting to MongoDB:", process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    // Optional: exit after short delay so Render knows deployment failed
    setTimeout(() => process.exit(1), 1000);
  });

// Optional keep-alive to prevent unexpected exit (uncomment if needed)
// setInterval(() => {}, 1 << 30);
