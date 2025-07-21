import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";
import CodeEditor from "../components/CodeEditor";

const ProblemDetail = () => {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const res = await API.get(`/problems/${id}`);
        setProblem(res.data);
      } catch (err) {
        console.error("❌ Error fetching problem:", err);
      }
    };

    fetchProblem();
  }, [id]);

  if (!problem) return <div className="p-4">Loading problem...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-2">{problem.title}</h1>
      <p className="mb-4 text-gray-700">{problem.description}</p>

      <h2 className="font-semibold mb-1">Sample Input:</h2>
      <pre className="bg-gray-100 p-2 rounded mb-2">{problem.testCases[0]?.input}</pre>

      <h2 className="font-semibold mb-1">Expected Output:</h2>
      <pre className="bg-gray-100 p-2 rounded mb-4">{problem.testCases[0]?.expectedOutput}</pre>

      <CodeEditor problemId={id} problem={problem} />
    </div>
  );
};

export default ProblemDetail;
