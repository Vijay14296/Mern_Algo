import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const EditProblem = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    testCases: "",
    starterCode: { java: "", python: "", cpp: "" },
    functionSignatures: '["public static void main(String[] args)"]',
    difficulty: "Easy",
    tags: "",
    timeLimit: 2,
    memoryLimit: 256,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const res = await axios.get(
          import.meta.env.VITE_API_URL+`/api/problems/${id}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        const problem = res.data;
        setForm({
          title: problem.title,
          description: problem.description,
          testCases: JSON.stringify(
            problem.testCases.map((tc) => ({
              input: tc.input,
              output: tc.expectedOutput,
              hidden: tc.hidden || false,
            })),
            null,
            2
          ),
          starterCode: problem.starterCode || { java: "", python: "", cpp: "" },
          functionSignatures: JSON.stringify(problem.functionSignatures || []),
          difficulty: problem.difficulty || "Easy",
          tags: (problem.tags || []).join(", "),
          timeLimit: problem.timeLimit || 2,
          memoryLimit: problem.memoryLimit || 256,
        });
      } catch (err) {
        console.error(err);
        setError("Failed to fetch problem.");
      } finally {
        setLoading(false);
      }
    };
    fetchProblem();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("starterCode.")) {
      const lang = name.split(".")[1];
      setForm((prev) => ({ ...prev, starterCode: { ...prev.starterCode, [lang]: value } }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    let parsedTestCases = [], parsedSignatures = [], parsedTags = [];
    try {
      parsedTestCases = JSON.parse(form.testCases).map((tc) => ({
        input: tc.input,
        expectedOutput: tc.output,
        hidden: tc.hidden || false,
      }));
    } catch {
      setError("❌ Invalid JSON format in test cases.");
      return;
    }
    try {
      parsedSignatures = JSON.parse(form.functionSignatures);
      if (!Array.isArray(parsedSignatures)) throw new Error();
    } catch {
      setError("❌ Function signatures must be a JSON array of strings.");
      return;
    }
    parsedTags = form.tags.split(",").map((t) => t.trim()).filter(Boolean);

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        import.meta.env.VITE_API_URL+`/api/problems/${id}`,
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
      alert("✅ Problem updated successfully!");
      navigate("/admin");
    } catch (err) {
      console.error(err);
      setError("Failed to update problem.");
    }
  };

  if (loading)
    return <p className="text-center text-gray-300 mt-10">Loading problem...</p>;

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 relative">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/20"></div>

      <div className="relative z-10 max-w-4xl mx-auto p-10 rounded-3xl backdrop-blur-md bg-white/10 shadow-2xl border border-white/20">
        <h1 className="text-4xl font-bold text-center text-yellow-400 mb-6">
          ✏️ Edit Problem
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
              className="w-full p-3 rounded-xl bg-white/10 border border-white/20 placeholder-gray-400 focus:ring-2 focus:ring-purple-400 focus:outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-semibold mb-1">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              rows={4}
              className="w-full p-3 rounded-xl bg-white/10 border border-white/20 placeholder-gray-400 focus:ring-2 focus:ring-purple-400 focus:outline-none"
            />
          </div>

          {/* Test Cases */}
          <div>
            <label className="block font-semibold mb-1">Test Cases (JSON)</label>
            <textarea
              name="testCases"
              value={form.testCases}
              onChange={handleChange}
              required
              rows={6}
              className="w-full p-3 rounded-xl bg-white/10 border border-white/20 placeholder-gray-400 focus:ring-2 focus:ring-purple-400 focus:outline-none"
            />
            <p className="text-sm text-gray-400 mt-1">
              Format: <code>[&#123;"input": "1 2", "output": "3", "hidden": false&#125;]</code>
            </p>
          </div>

          {/* Starter Code */}
          <div>
            <label className="block font-semibold mb-1">Starter Code</label>
            {["java", "python", "cpp"].map((lang) => (
              <textarea
                key={lang}
                name={`starterCode.${lang}`}
                value={form.starterCode[lang]}
                onChange={handleChange}
                rows={3}
                placeholder={`Starter code for ${lang}`}
                className="w-full p-3 mb-2 rounded-xl bg-white/10 border border-white/20 placeholder-gray-400 focus:ring-2 focus:ring-purple-400 focus:outline-none"
              />
            ))}
          </div>

          {/* Function Signatures */}
          <div>
            <label className="block font-semibold mb-1">Function Signatures</label>
            <textarea
              name="functionSignatures"
              value={form.functionSignatures}
              onChange={handleChange}
              rows={2}
              placeholder='["public static void main(String[] args)"]'
              className="w-full p-3 rounded-xl bg-white/10 border border-white/20 placeholder-gray-400 focus:ring-2 focus:ring-purple-400 focus:outline-none"
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
              className="w-full p-3 rounded-xl bg-white/10 border border-white/20 placeholder-gray-400 focus:ring-2 focus:ring-purple-400 focus:outline-none"
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
              className="w-full p-3 rounded-xl bg-white/10 border border-white/20 placeholder-gray-400 focus:ring-2 focus:ring-purple-400 focus:outline-none"
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
                className="w-full p-3 rounded-xl bg-white/10 border border-white/20 placeholder-gray-400 focus:ring-2 focus:ring-purple-400 focus:outline-none"
              />
            </div>
            <div className="flex-1">
              <label className="block font-semibold mb-1">Memory Limit (MB)</label>
              <input
                name="memoryLimit"
                type="number"
                value={form.memoryLimit}
                onChange={handleChange}
                className="w-full p-3 rounded-xl bg-white/10 border border-white/20 placeholder-gray-400 focus:ring-2 focus:ring-purple-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3 bg-yellow-500/80 hover:bg-yellow-600 text-white font-semibold rounded-xl transition shadow-md hover:shadow-lg"
          >
            💾 Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProblem;
