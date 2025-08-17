// worker/gamification.worker.js
import { Worker } from "bullmq";
import connection from "./config/redis.js";
import connectDB from "./config/db.js";
import { updateGamification } from "./utils/gamification.js";

// ---------- Config ----------
const QUEUE_NAME = "gamification";
const CONCURRENCY = Number(process.env.GAMIFICATION_CONCURRENCY || 8);
const LEADERBOARD_ZSET = "leaderboard:xp";

// ---------- Init ----------
console.log("🔹 [Worker] Initializing connections...");
await connectDB();
console.log("✅ [Worker] MongoDB fully connected");

const redis = connection.duplicate ? connection.duplicate() : connection;
console.log("✅ [Worker] Redis duplicate ready");

// ---------- Worker ----------
const worker = new Worker(
  QUEUE_NAME,
  async (job) => {
    console.log("🟢 [Worker] Job received", { jobId: job.id, data: job.data });

    const { userId, problemId, problemDifficulty } = job.data;
    if (!userId || !problemId || !problemDifficulty) {
      throw new Error("Missing required job data");
    }

    try {
      console.log(`⚡ [Worker] Processing gamification for user ${userId}...`);
      const result = await updateGamification(userId, problemId, problemDifficulty);

      console.log("✅ [Worker] Gamification updated", {
        jobId: job.id,
        xp: result?.xp,
        level: result?.level,
        newlySolved: result?.newlySolved,
        badges: result?.badges,
      });

      if (typeof result?.xp === "number") {
        await redis.zadd(LEADERBOARD_ZSET, result.xp, String(userId));
        console.log("⚡ [Worker] Leaderboard updated", { userId, xp: result.xp });
      }

      // ✅ Just return the result; backend will handle socket emission
      return result;
    } catch (err) {
      console.error("❌ [Worker] Failed processing job", { jobId: job.id, error: err?.message });
      throw err;
    }
  },
  {
    connection,
    concurrency: CONCURRENCY,
    lockDuration: 30000,
  }
);

// ---------- Worker Events ----------
worker.on("completed", (job) => console.log("✅ [Worker] Job completed", { jobId: job.id }));
worker.on("failed", (job, err) => console.error("🔴 [Worker] Job failed", { jobId: job?.id, error: err?.message }));
worker.on("error", (err) => console.error("🔴 [Worker] Worker error", err));
worker.on("stalled", (jobId) => console.warn("⚠️ [Worker] Job stalled", { jobId }));

// ---------- Startup ----------
console.log("🚀 [Worker] Gamification worker running...", {
  queue: QUEUE_NAME,
  concurrency: CONCURRENCY,
});

// ---------- Graceful Shutdown ----------
const shutdown = async (sig) => {
  console.log(`🛑 [Worker] Received ${sig}, shutting down...`);
  try { await worker.close(); } catch (e) { console.error("Close worker err:", e?.message); }
  try { if (redis?.quit) await redis.quit(); } catch (e) { console.error("Close redis err:", e?.message); }
  process.exit(0);
};
["SIGINT", "SIGTERM"].forEach(sig => process.on(sig, () => shutdown(sig)));
