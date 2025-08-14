import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CreateProblem = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    testCases: '[{"input": "1 2", "output": "3"}]',
    starterCode: { java: "", python: "", cpp: "" },
    functionSignatures: '["public static void main(String[] args)"]',
    difficulty: "Easy",
    tags: "",
    timeLimit: 2,
    memoryLimit: 256,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, dataset } = e.target;
    if (dataset.lang) {
      setForm({ ...form, starterCode: { ...form.starterCode, [dataset.lang]: value } });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    let parsedTestCases = [], parsedSignatures = [], parsedTags = [];
    try {
      parsedTestCases = JSON.parse(form.testCases).map((tc) => ({
        input: tc.input,
        expectedOutput: tc.output,
        hidden: tc.hidden || false,
      }));
    } catch {
      setError("❌ Invalid JSON format in test cases.");
      setLoading(false);
      return;
    }

    try {
      parsedSignatures = JSON.parse(form.functionSignatures);
      if (!Array.isArray(parsedSignatures)) throw new Error();
    } catch {
      setError("❌ Function signatures must be a JSON array of strings.");
      setLoading(false);
      return;
    }

    parsedTags = form.tags.split(",").map((t) => t.trim()).filter(Boolean);

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        import.meta.env.VITE_API_URL+"/api/problems",
        {
          title: form.title,
          description: form.description,
          testCases: parsedTestCases,
          starterCode: form.starterCode,
          functionSignatures: parsedSignatures,
          difficulty: form.difficulty,
          tags: parsedTags,
          timeLimit: form.timeLimit,
          memoryLimit: form.memoryLimit,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("✅ Problem created successfully!");
      navigate("/admin");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to create problem.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 relative">
      <div className="absolute inset-0 bg-black/20"></div>

      <div className="relative z-10 max-w-4xl mx-auto p-10 rounded-3xl backdrop-blur-md bg-white/10 shadow-2xl border border-white/20">
        <h1 className="text-4xl font-bold text-center text-green-400 mb-6">
          ➕ Create New Problem
        </h1>

        {error && <p className="text-red-400 mb-4 text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-5 text-gray-100">
          {/* Title */}
          <div>
            <label className="block font-semibold mb-1">Title</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              placeholder="Enter problem title"
              className="w-full p-3 rounded-xl bg-white/10 border border-white/20 placeholder-gray-400 focus:ring-2 focus:ring-cyan-400 focus:outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-semibold mb-1">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={5}
              required
              placeholder="Describe the problem"
              className="w-full p-3 rounded-xl bg-white/10 border border-white/20 placeholder-gray-400 focus:ring-2 focus:ring-cyan-400 focus:outline-none"
            />
          </div>

          {/* Test Cases */}
          <div>
            <label className="block font-semibold mb-1">Test Cases (JSON)</label>
            <textarea
              name="testCases"
              value={form.testCases}
              onChange={handleChange}
              rows={5}
              required
              placeholder='[{"input":"1 2","output":"3"}]'
              className="w-full p-3 rounded-xl bg-white/10 border border-white/20 placeholder-gray-400 focus:ring-2 focus:ring-cyan-400 focus:outline-none"
            />
            <p className="text-sm text-gray-400 mt-1">
              JSON array. Include "hidden": true for hidden test cases.
            </p>
          </div>

          {/* Starter Code */}
          {["java", "python", "cpp"].map((lang) => (
            <div key={lang}>
              <label className="block font-semibold mb-1">Starter Code ({lang.toUpperCase()})</label>
              <textarea
                data-lang={lang}
                value={form.starterCode[lang]}
                onChange={handleChange}
                rows={4}
                placeholder={`Optional starter code for ${lang}`}
                className="w-full p-3 rounded-xl bg-white/10 border border-white/20 placeholder-gray-400 focus:ring-2 focus:ring-cyan-400 focus:outline-none mb-2"
              />
            </div>
          ))}

          {/* Function Signatures */}
          <div>
            <label className="block font-semibold mb-1">Function Signatures</label>
            <textarea
              name="functionSignatures"
              value={form.functionSignatures}
              onChange={handleChange}
              rows={2}
              placeholder='["public static void main(String[] args)"]'
              className="w-full p-3 rounded-xl bg-white/10 border border-white/20 placeholder-gray-400 focus:ring-2 focus:ring-cyan-400 focus:outline-none"
            />
            <p className="text-sm text-gray-400 mt-1">
              JSON array of expected function signatures
            </p>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block font-semibold mb-1">Difficulty</label>
            <select
              name="difficulty"
              value={form.difficulty}
              onChange={handleChange}
              className="w-full p-3 rounded-xl bg-white/10 border border-white/20 focus:ring-2 focus:ring-cyan-400 focus:outline-none"
            >
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="block font-semibold mb-1">Tags (comma-separated)</label>
            <input
              name="tags"
              value={form.tags}
              onChange={handleChange}
              placeholder="e.g., arrays, strings"
              className="w-full p-3 rounded-xl bg-white/10 border border-white/20 placeholder-gray-400 focus:ring-2 focus:ring-cyan-400 focus:outline-none"
            />
          </div>

          {/* Time & Memory Limits */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block font-semibold mb-1">Time Limit (s)</label>
              <input
                name="timeLimit"
                type="number"
                value={form.timeLimit}
                onChange={handleChange}
                className="w-full p-3 rounded-xl bg-white/10 border border-white/20 focus:ring-2 focus:ring-cyan-400 focus:outline-none"
              />
            </div>
            <div className="flex-1">
              <label className="block font-semibold mb-1">Memory Limit (MB)</label>
              <input
                name="memoryLimit"
                type="number"
                value={form.memoryLimit}
                onChange={handleChange}
                className="w-full p-3 rounded-xl bg-white/10 border border-white/20 focus:ring-2 focus:ring-cyan-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl text-white font-semibold transition shadow-md hover:shadow-lg ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-500/80 hover:bg-green-600"
            }`}
          >
            {loading ? "🚧 Creating..." : "🚀 Create Problem"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateProblem;
