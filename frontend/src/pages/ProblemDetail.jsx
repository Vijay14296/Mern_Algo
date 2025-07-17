import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";

const ProblemDetail = () => {
  const { id } = useParams();

  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const res = await API.get(`/problems/${id}`);
        setProblem(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching problem:", err);
        alert("Failed to load problem.");
        setLoading(false);
      }
    };

    fetchProblem();
  }, [id]);

  const handleSubmit = async () => {
    try {
      const res = await API.post(`/submissions`, {
        problemId: id,
        code: code,
        language: "cpp", // change based on UI dropdown later
      });

      alert("Submitted! " + res.data.status);
    } catch (err) {
      console.error("Submission error:", err);
      alert("Submission failed.");
    }
  };

  if (loading) return <div className="text-center mt-10">Loading...</div>;
  if (!problem) return <div className="text-center mt-10">Problem not found</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">{problem.title}</h1>
      <p className="mb-6 whitespace-pre-wrap">{problem.description}</p>

      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Write your code here..."
        rows={12}
        className="w-full border rounded-lg p-4 font-mono bg-gray-100"
      ></textarea>

      <button
        onClick={handleSubmit}
        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Submit Code
      </button>
    </div>
  );
};

export default ProblemDetail;
