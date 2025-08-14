import dotenv from "dotenv";
dotenv.config();
import fetch from "node-fetch"; // Node <18
import Problem from "../models/Problem.js"; // Your Mongoose model

export const getAIFeedback = async (req, res) => {
  const { problemId, code, language } = req.body;

  console.log("🔥 Incoming request body:", req.body);

  if (!problemId || !code || !language) {
    console.warn("⚠️ Missing required fields in request body");
    return res.status(400).json({ error: "problemId, code, and language are required" });
  }

  try {
    // Fetch problem from DB
    const problem = await Problem.findById(problemId);
    if (!problem) {
      console.warn(`⚠️ Problem not found for id: ${problemId}`);
      return res.status(404).json({ error: "Problem not found" });
    }

    // Construct prompt
    const prompt = `Problem Description:\n${problem.description}\n\nThe following ${language} code was written:\n${code}\nProvide a **short hint** to improve or fix the code. Do not give full code. Keep it concise.`;

    console.log("📝 Prompt sent to Gemini API:\n", prompt);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    );

    const data = await response.json();
    console.log("💬 Raw response from Gemini API:", JSON.stringify(data, null, 2));

    const feedback =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No hints available.";

    console.log("✅ Feedback sent to frontend:", feedback);

    res.json({ feedback });
  } catch (err) {
    console.error("🚨 AI Feedback Error:", err);
    res.status(500).json({ error: "Failed to get AI feedback" });
  }
};
