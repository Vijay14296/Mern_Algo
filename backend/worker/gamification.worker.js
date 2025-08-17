import { Worker } from "bullmq";
import connection from "../config/redis.js";
import { updateGamification } from "../utils/gamification.js";
import connectDB from "../config/db.js";
import { getIO } from "../config/socket.js"; // ✅ use getIO instead of importing index.js
import User from "../models/User.js"; // import User to fetch leaderboard

// Ensure DB connection
await connectDB();

const worker = new Worker(
  "gamification",
  async (job) => {
    console.log("🟢 [Worker] Job received", job.data);

    const { userId, problemId, problemDifficulty } = job.data;
    if (!userId || !problemId || !problemDifficulty) {
      console.error("🔴 [Worker] Missing data", job.data);
      throw new Error("Missing required data");
    }

    try {
      // 1️⃣ Update gamification for the specific user
      const result = await updateGamification(userId, problemId, problemDifficulty);
      console.log("✅ [Worker] Gamification processed successfully", result);

      // 2️⃣ Emit real-time update to the specific user
      const io = getIO(); // ✅ safely access initialized Socket.IO instance
      io.to(userId).emit("gamificationUpdate", result);
      console.log(`🟢 [Worker] Real-time update emitted to user ${userId}`);

      // 3️⃣ Fetch top 10 users for leaderboard
      const topUsers = await User.find({})
        .select("username xp level badges")
        .sort({ xp: -1 })
        .limit(10);

      // 4️⃣ Emit leaderboard update to all connected clients
      io.emit("leaderboardUpdate", topUsers);
      console.log("🟢 [Worker] Real-time leaderboard update emitted");

      return result;
    } catch (err) {
      console.error(`❌ [Worker] Gamification failed for user ${userId}:`, err);
      throw err;
    }
  },
  { connection, concurrency: 5 }
);

// Event listeners
worker.on("completed", (job) => console.log("✅ [Worker] Job completed", job.id));
worker.on("failed", (job, err) => console.error("❌ [Worker] Job failed", job.id, err));

console.log("🚀 [Worker] Gamification worker running...");
