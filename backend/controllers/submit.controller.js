import axios from "axios";
import Problem from "../models/Problem.js";
import dotenv from "dotenv";
dotenv.config();
const MICROSERVICE_URL = process.env.API_URL;

export const submitCode = async (req, res) => {
  const { code, language, problemId } = req.body;

  if (!code || !language || !problemId) {
    return res.status(400).json({
      error: "Code, language, and problemId are required",
    });
  }

  try {
    const problem = await Problem.findById(problemId);
    if (!problem) return res.status(404).json({ error: "Problem not found" });

    const testCases = problem.testCases || [];
    if (!testCases.length) return res.status(400).json({ error: "No test cases available" });

    let allPassed = true;
    const results = [];

    for (const [index, test] of testCases.entries()) {
      const input = test.input || "";
      const expectedOutput = (test.expectedOutput || "").trim();
      const isHidden = !!test.hidden;

      try {
        const { data } = await axios.post(MICROSERVICE_URL, {
          code,
          language,
          input,
          timeLimit: problem.timeLimit || 5,
          memoryLimit: problem.memoryLimit || 256,
        });

        const actualOutputRaw = data.stdout ?? data.output ?? "";
        const actualOutput = actualOutputRaw.trim();
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
        console.error(`Test case #${index + 1} error:`, err.message, err.response?.data);

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

    return res.status(200).json({
      verdict: allPassed ? "Accepted ✅" : "Wrong Answer ❌",
      results,
      starterCode: problem.starterCode,
      functionSignatures: problem.functionSignatures,
    });

  } catch (err) {
    console.error("submitCode error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
