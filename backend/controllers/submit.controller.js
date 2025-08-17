// controllers/submit.controller.js
import Problem from "../models/Problem.js";
import User from "../models/User.js"; // added
import axios from "axios";
import dotenv from "dotenv";
import { enqueueGamification } from "../services/gamification.service.js";
import { emitToUser } from "../config/socket.js"; // added

dotenv.config();

const VERDICT = {
  ACCEPTED: "Accepted ✅",
  WRONG: "Wrong Answer ❌",
};

export const submitCode = async (req, res) => {
  const requestId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const t0 = Date.now();

  const { code, language, problemId } = req.body || {};
  const userId = req?.user?.id;

  console.log(`[${requestId}] 🟢 Submit request`, {
    codeLength: code?.length ?? null,
    language,
    problemId,
    userId,
  });

  if (!code || !language || !problemId) {
    console.warn(`[${requestId}] 🔴 Missing required fields`, {
      hasCode: !!code,
      hasLanguage: !!language,
      hasProblemId: !!problemId,
    });
    return res.status(400).json({ error: "Code, language, and problemId are required" });
  }

  if (!process.env.API_URL) {
    console.error(`[${requestId}] 🔴 Compiler API_URL not set in .env`);
    return res.status(500).json({ error: "Compiler service misconfigured" });
  }

  try {
    const problem = await Problem.findById(problemId).lean();
    if (!problem) {
      console.warn(`[${requestId}] 🔴 Problem not found in DB`, { problemId });
      return res.status(404).json({ error: "Problem not found" });
    }

    console.log(`[${requestId}] 🟢 Problem loaded`, {
      title: problem.title,
      difficulty: problem.difficulty,
      testCasesCount: problem.testCases?.length,
    });

    const testCases = Array.isArray(problem.testCases) ? problem.testCases : [];
    if (testCases.length === 0) {
      console.warn(`[${requestId}] 🟡 No test cases for problem`, { problemId });
      return res.status(400).json({ error: "No test cases available" });
    }

    const runTestCase = async (test, idx) => {
      const payload = {
        code,
        language,
        input: test.input,
        timeLimit: problem.timeLimit || 5,
        memoryLimit: problem.memoryLimit || 256,
      };

      console.log(`[${requestId}] ➡️ Compiler request`, {
        idx,
        payloadPreview: { language: payload.language, inputLength: payload.input?.length },
      });

      try {
        const { data } = await axios.post(process.env.API_URL, payload, { timeout: 25_000 });
        const actualOutput = (data.stdout ?? data.output ?? "").trim();
        const runtimeError = data.error || (data.stderr ? String(data.stderr).trim() : null);
        const expectedOutput = String(test.expectedOutput ?? "").trim();

        const passed = !runtimeError && actualOutput === expectedOutput;

        console.log(`[${requestId}] ⬅️ Compiler response`, {
          idx,
          passed,
          hasRuntimeError: !!runtimeError,
          stdoutSample: actualOutput?.slice(0, 50),
        });

        return {
          input: test.input,
          expectedOutput: test.hidden ? undefined : expectedOutput,
          actualOutput: test.hidden ? undefined : actualOutput,
          passed,
          hidden: !!test.hidden,
          runtimeError,
        };
      } catch (err) {
        console.error(`[${requestId}] ❌ Compiler request failed`, {
          idx,
          message: err?.message,
          status: err?.response?.status,
          responseData: err?.response?.data,
        });
        return {
          input: test.input,
          passed: false,
          hidden: !!test.hidden,
          runtimeError: err?.message || "Unknown error",
          responseData: err?.response?.data,
        };
      }
    };

    // ✅ Run all test cases in parallel
    const results = await Promise.all(testCases.map((t, i) => runTestCase(t, i)));
    const allPassed = results.every(r => r.passed);

    // ✅ Enqueue gamification
    let gamification = null;
    if (userId && allPassed) {
      try {
        console.log(`[${requestId}] 🟢 All tests passed → enqueue gamification`, {
          userId,
          problemId,
          difficulty: problem.difficulty,
        });

        const job = await enqueueGamification({
          userId,
          problemId,
          problemDifficulty: problem.difficulty,
        });

        gamification = {
          enqueued: true,
          jobId: job?.id ?? null,
          queue: "gamification",
          note: "XP/badges will update shortly via worker/socket",
        };

        console.log(`[${requestId}] ✅ Gamification job enqueued`, { jobId: job?.id });
      } catch (e) {
        console.error(`[${requestId}] 🔴 Gamification enqueue failed`, { error: e?.message });
        gamification = { enqueued: false, error: e?.message || "Enqueue failed" };
      }
    } else {
      console.log(`[${requestId}] 🟡 Skipping gamification`, { userIdPresent: !!userId, allPassed });
    }

    const verdict = allPassed ? VERDICT.ACCEPTED : VERDICT.WRONG;
    const durationMs = Date.now() - t0;

    console.log(`[${requestId}] ✅ Final verdict`, {
      verdict,
      durationMs,
      resultsCount: results.length,
    });

    // --- Send verdict to frontend
    res.status(200).json({
      verdict,
      results,
      starterCode: problem.starterCode ?? {},
      functionSignatures: problem.functionSignatures ?? {},
      gamification,
      meta: { requestId, durationMs },
    });

    // --- NEW: Fetch latest gamification from DB and emit via socket ---
    if (userId) {
      try {
        const user = await User.findById(userId)
          .select("xp level badges streak problemsSolved problemStats")
          .lean();

        if (user) {
          console.log(`[${requestId}] 🔔 Emitting latest gamification to frontend`, user);
          emitToUser(String(userId), "gamificationUpdate", user);
        } else {
          console.warn(`[${requestId}] ⚠️ User not found for gamification emit`, { userId });
        }
      } catch (err) {
        console.error(`[${requestId}] ⚠️ Failed to fetch/emit gamification`, err.message);
      }
    }

  } catch (err) {
    console.error(`[${requestId}] ❌ Fatal submitCode error`, {
      message: err?.message,
      stack: err?.stack,
    });
    return res.status(500).json({
      error: "Internal Server Error",
      meta: { requestId, reason: err?.message },
    });
  }
};
