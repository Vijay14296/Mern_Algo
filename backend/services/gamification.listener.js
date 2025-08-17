// services/gamification.listener.js
import { QueueEvents } from "bullmq";
import connection from "../config/redis.js";
import { emitToUser } from "../config/socket.js";
import UserGamification from "../models/User.js"; // Your gamification model

const QUEUE_NAME = "gamification";

const queueEvents = new QueueEvents(QUEUE_NAME, { connection });

queueEvents.on("completed", async ({ jobId, returnvalue }) => {
  console.log(`✅ [Backend Listener] Job completed: ${jobId}`);
  console.log("🔹 [Backend Listener] returnvalue from worker:", returnvalue);

  try {
    if (!returnvalue || !returnvalue.userId) {
      console.warn(`⚠️ [Backend Listener] Missing userId or returnvalue for job ${jobId}`);
      return;
    }

    const userId = returnvalue.userId;

    console.log(`🔍 [Backend Listener] Fetching latest gamification for user ${userId}...`);
    const latestGamification = await UserGamification.findOne({ userId }).lean();

    if (!latestGamification) {
      console.warn(`⚠️ [Backend Listener] No gamification record found for user ${userId}`);
      return;
    }

    console.log(`🔔 [Backend Listener] Emitting latest gamification to user ${userId}`);

    emitToUser(String(userId), "gamificationUpdate", {
      xp: latestGamification.xp,
      level: latestGamification.level,
      newlySolved: latestGamification.newlySolved,
      badges: latestGamification.badges || [],
      streak: latestGamification.streak,
      problemsSolved: latestGamification.problemsSolved,
      problemStats: latestGamification.problemStats || {},
    });

    console.log(`✅ [Backend Listener] Latest gamification emitted for user ${userId}`);
  } catch (err) {
    console.error("⚠️ [Backend Listener] Failed to fetch/emit gamification:", err.message);
  }
});
