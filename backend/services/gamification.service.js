import gamificationQueue from "../queues/gamification.queue.js";

export const enqueueGamification = async ({ userId, problemId, problemDifficulty }) => {
  console.log("🟢 [Service] Enqueueing gamification job", { userId, problemId, problemDifficulty });

  if (!userId || !problemId || !problemDifficulty) {
    console.error("🔴 [Service] Missing required data for enqueue");
    throw new Error("userId, problemId, and problemDifficulty are required");
  }

  try {
    // Add retry, backoff, jobId for deduplication, and job prioritization
    const job = await gamificationQueue.add(
      "xp-badge-job",
      { userId, problemId, problemDifficulty },
      {
        jobId: `${userId}-${problemId}`, // ensures no duplicate job for same user/problem
        attempts: 3,                     // retry up to 3 times on failure
        backoff: { type: "exponential", delay: 2000 }, // exponential retry delay
        removeOnComplete: true,          // keeps Redis clean
        removeOnFail: false,             // keep failed jobs for debugging
        priority: problemDifficulty === "hard" ? 1 : problemDifficulty === "medium" ? 5 : 10, 
        // higher priority = processed first
      }
    );

    console.log(`✅ [Service] Gamification job enqueued [id=${job.id}] with priority and retries`);
    return job;
  } catch (error) {
    console.error("❌ [Service] Failed to enqueue gamification job", error);
    throw error;
  }
};
