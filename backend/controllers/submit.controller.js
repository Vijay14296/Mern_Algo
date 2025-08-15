import Problem from "../models/Problem.js";
import { updateGamification } from "../utils/gamification.js";
import User from "../models/User.js";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

export const submitCode = async (req, res) => {
  const { code, language, problemId } = req.body;
  const userId = req.userId;

  console.log("📥 Request Body:", { codeLength: code?.length, language, problemId, userId });

  if (!code || !language || !problemId) {
    return res.status(400).json({ error: "Code, language, and problemId are required" });
  }

  try {
    const problem = await Problem.findById(problemId);
    if (!problem) return res.status(404).json({ error: "Problem not found" });

    console.log("✅ Problem Found:", problem.title);

    const testCases = problem.testCases || [];
    if (!testCases.length) return res.status(400).json({ error: "No test cases available" });

    let allPassed = true;
    const results = [];

    // Run code for each test case
    for (const [index, test] of testCases.entries()) {
      const input = test.input || "";
      const expectedOutput = (test.expectedOutput || "").trim();
      const isHidden = !!test.hidden;

      try {
        const { data } = await axios.post(process.env.API_URL, {
          code,
          language,
          input,
          timeLimit: problem.timeLimit || 5,
          memoryLimit: problem.memoryLimit || 256,
        });

        const actualOutput = (data.stdout ?? data.output ?? "").trim();
        const runtimeError = data.error || data.stderr || null;
        const passed = !runtimeError && actualOutput === expectedOutput;

        if (!passed) allPassed = false;

        results.push({
          input,
          expectedOutput: isHidden ? undefined : expectedOutput,
          actualOutput: isHidden ? undefined : actualOutput,
          passed,
          hidden: isHidden,
          runtimeError,
        });
      } catch (err) {
        console.error(`❌ Test case #${index + 1} error:`, err.message);
        results.push({
          input,
          expectedOutput: isHidden ? undefined : expectedOutput,
          actualOutput: undefined,
          passed: false,
          hidden: isHidden,
          runtimeError: err?.response?.data?.error || err.message,
        });
        allPassed = false;
      }
    }

    // Call gamification util
    // Call gamification util
    let gamificationData = {};
    if (userId && allPassed) {
      try {
        gamificationData = await updateGamification(userId, problemId, problem.difficulty);
      } catch (err) {
        console.error("⚠️ Gamification update failed:", err);
      }
    }


    return res.status(200).json({
      verdict: allPassed ? "Accepted ✅" : "Wrong Answer ❌",
      results,
      starterCode: problem.starterCode,
      functionSignatures: problem.functionSignatures,
      gamification: gamificationData,
    });

  } catch (err) {
    console.error("🔥 submitCode error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
