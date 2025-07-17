import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CreateProblem = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    testCases: '[\n  {"input": "1 2", "output": "3"}\n]',
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    let parsedTestCases = [];

    try {
      parsedTestCases = JSON.parse(form.testCases).map((tc) => ({
        input: tc.input,
        expectedOutput: tc.output,
      }));
    } catch (jsonErr) {
      setError("❌ Invalid JSON format in test cases.");
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "http://localhost:5000/api/problems",
        {
          title: form.title,
          description: form.description,
          testCases: parsedTestCases,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("✅ Problem created successfully!");
      navigate("/admin");
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error || "Failed to create problem. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">
        ➕ Create New Problem
      </h1>

      {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold mb-1">Title</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded-xl"
            placeholder="Enter problem title"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded-xl"
            rows={5}
            placeholder="Describe the problem"
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="testCases"
            className="block text-sm font-medium text-gray-700"
          >
            Test Cases
          </label>
          <textarea
            id="testCases"
            name="testCases"
            rows={5}
            className="mt-1 p-2 border border-gray-300 rounded-md w-full"
            value={form.testCases}
            onChange={handleChange}
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            Provide test cases in JSON format.<br />
            Example: <code>[&#123;"input": "4 5", "output": "9"&#125;]</code>
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`${
            loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
          } text-white font-semibold py-2 px-4 rounded-xl w-full transition`}
        >
          {loading ? "🚧 Creating..." : "🚀 Create Problem"}
        </button>
      </form>
    </div>
  );
};

export default CreateProblem;
