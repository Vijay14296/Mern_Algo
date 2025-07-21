import axios from "axios";
import Problem from "../models/Problem.js"; // make sure path is correct

export const submitCode = async (req, res) => {
  const { code, language, problemId } = req.body;

  if (!code || !language || !problemId) {
    return res.status(400).json({ error: "Code, language, and problemId are required" });
  }

  try {
    const problem = await Problem.findById(problemId);

    if (!problem) {
      return res.status(404).json({ error: "Problem not found" });
    }

    const testCases = problem.testCases || [];
    if (testCases.length === 0) {
      return res.status(400).json({ error: "No test cases available" });
    }

    let allPassed = true;
    const results = [];

    for (const test of testCases) {
      const input = test.input || "";
      const expectedOutput = (test.expectedOutput || "").trim();

      try {
        const { data } = await axios.post("http://localhost:8002/run", {
          code,
          language,
          input, // 🟢 this will be passed to input()
        });

        const actualOutput = (data.output || "").trim(); // ✅ match dockerRunner field


        const passed = actualOutput === expectedOutput;
        if (!passed) allPassed = false;

        results.push({
          input,
          expectedOutput,
          actualOutput,
          passed,
        });
      } catch (err) {
        return res.status(200).json({
          verdict: "Runtime Error",
          error: err?.response?.data?.error || err.message,
        });
      }
    }

    const verdict = allPassed ? "Accepted ✅" : "Wrong Answer ❌";

    return res.status(200).json({
      verdict,
      results,
    });

  } catch (err) {
    console.error("submitCode error:", err.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
