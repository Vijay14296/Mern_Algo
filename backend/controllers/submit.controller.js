import axios from "axios";
import Problem from "../models/Problem.js";

const MICROSERVICE_URL = "http://13.127.15.229:8000/run";


export const submitCode = async (req, res) => {
  console.log("SubmitCode called with body:", req.body);
  const { code, language, problemId } = req.body;

  if (!code || !language || !problemId) {
    return res.status(400).json({ error: "Code, language, and problemId are required" });
  }

  try {
    const problem = await Problem.findById(problemId);
    console.log("Fetched problem:", problem);

    if (!problem) {
      return res.status(404).json({ error: "Problem not found" });
    }

    const testCases = problem.testCases || [];
    console.log(`Number of test cases: ${testCases.length}`);

    if (testCases.length === 0) {
      return res.status(400).json({ error: "No test cases available" });
    }

    let allPassed = true;
    const results = [];

    for (const [index, test] of testCases.entries()) {
      const input = test.input || "";
      const expectedOutput = (test.expectedOutput || "").trim();

      console.log(`Running test case #${index + 1} with input: "${input}" and expected output: "${expectedOutput}"`);

      try {
        const { data } = await axios.post(MICROSERVICE_URL, {
          code,
          language,
          input,
        });

        console.log(`Microservice response for test case #${index + 1}:`, data);

        // Check if stdout is present
        const actualOutputRaw = data.stdout ?? data.output ?? "";
        const actualOutput = actualOutputRaw.trim();

        console.log(`Trimmed actual output for test case #${index + 1}: "${actualOutput}"`);

        const passed = actualOutput === expectedOutput;
        if (!passed) allPassed = false;

        results.push({
          input,
          expectedOutput,
          actualOutput,
          passed,
        });
      } catch (err) {
        console.error(`Error from microservice on test case #${index + 1}:`, err.message, err.response?.data);

        return res.status(200).json({
          verdict: "Runtime Error",
          error: err?.response?.data?.error || err.message,
        });
      }
    }

    const verdict = allPassed ? "Accepted ✅" : "Wrong Answer ❌";

    console.log("Final verdict:", verdict);
    console.log("Results array:", results);

    return res.status(200).json({
      verdict,
      results,
    });

  } catch (err) {
    console.error("submitCode error:", err.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
