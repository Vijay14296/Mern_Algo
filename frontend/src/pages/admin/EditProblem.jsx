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
  });
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/problems/${id}`);
        const problem = res.data;

        setForm({
          title: problem.title,
          description: problem.description,
          testCases: JSON.stringify(
            problem.testCases.map((tc) => ({
              input: tc.input,
              output: tc.expectedOutput,
            })),
            null,
            2
          ),
        });
      } catch (err) {
        console.error(err);
        setError("Failed to fetch problem.");
      }
    };

    fetchProblem();
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const token = localStorage.getItem("token");
      const parsedTestCases = JSON.parse(form.testCases).map((tc) => ({
        input: tc.input,
        expectedOutput: tc.output,
      }));

      await axios.put(
        `http://localhost:5000/api/problems/${id}`,
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

      alert("✅ Problem updated successfully!");
      navigate("/admin");
    } catch (err) {
      console.error(err);
      setError("Failed to update problem.");
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center text-yellow-600">
        ✏️ Edit Problem
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
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Test Cases (JSON)</label>
          <textarea
            name="testCases"
            value={form.testCases}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded-xl"
            rows={6}
          />
          <p className="text-sm text-gray-500 mt-1">
            Format: <code>[&#123;"input": "1 2", "output": "3"&#125;]</code>
          </p>
        </div>

        <button
          type="submit"
          className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 px-4 rounded-xl w-full"
        >
          💾 Save Changes
        </button>
      </form>
    </div>
  );
};

export default EditProblem;
