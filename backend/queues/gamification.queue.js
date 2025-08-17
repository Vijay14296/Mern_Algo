import { Queue } from "bullmq";
import connection from "../config/redis.js";

// Reuse queue across imports
const gamificationQueue = new Queue("gamification", {
  connection,

  // Optional advanced config
  defaultJobOptions: {
    removeOnComplete: true,      // auto-clean completed jobs
    removeOnFail: false,         // keep failed jobs for debugging
    attempts: 3,                 // default retry attempts
    backoff: { type: "exponential", delay: 2000 }, // exponential retry delay
  },

  // Keep events lightweight for large-scale workloads
  streams: {
    events: { maxLen: 1000 }, // trim event stream to avoid Redis bloat
  },
});

// Optional: register queue event listeners for observability
gamificationQueue.on("error", (err) => {
  console.error("❌ [Queue] Redis connection error:", err);
});

gamificationQueue.on("waiting", ({ jobId }) => {
  console.log(`⏳ [Queue] Job waiting: ${jobId}`);
});

gamificationQueue.on("active", ({ jobId }) => {
  console.log(`⚡ [Queue] Job started: ${jobId}`);
});

gamificationQueue.on("completed", ({ jobId }) => {
  console.log(`✅ [Queue] Job completed: ${jobId}`);
});

gamificationQueue.on("failed", ({ jobId, failedReason }) => {
  console.error(`🔴 [Queue] Job failed: ${jobId} | Reason: ${failedReason}`);
});

export default gamificationQueue;
