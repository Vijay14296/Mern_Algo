import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import problemRoutes from "./routes/problem.routes.js";
dotenv.config();

const app = express();
app.use(express.json());

app.use("/api/auth", authRoutes);
console.log("Auth routes registered at /api/auth");

app.use("/api", problemRoutes);
const PORT = process.env.PORT || 5000;

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB Connected");
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch((err) => console.error("DB Connection Error:", err));
