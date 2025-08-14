import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

const difficultyColors = {
  Easy: "bg-green-500",
  Medium: "bg-yellow-500",
  Hard: "bg-red-500",
};

const ProblemList = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await API.get("/problems", {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("✅ Problems fetched:", res.data);

        // Access the `problems` array from the response
        if (res.data && res.data.problems) {
          setProblems(res.data.problems);
        } else {
          console.warn("⚠️ Expected array but got:", res.data);
          setProblems([]);
        }
      } catch (err) {
        console.error("Error fetching problems:", err);
        setProblems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProblems();
  }, []);

  if (loading) return <div className="text-center mt-10 text-white">Loading...</div>;
  if (!problems.length) return <div className="text-center mt-10 text-white">No problems found.</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-indigo-400 text-center">📝 Practice Problems</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {problems.map((problem) => (
          <Link
            key={problem._id}
            to={`/problems/${problem._id}`}
            className="group block border border-gray-700 rounded-xl p-5 bg-gray-800 hover:bg-gray-700 transition-shadow shadow-md hover:shadow-xl"
          >
            <div className="flex justify-between items-start">
              <h2 className="text-xl font-semibold text-white group-hover:text-indigo-300">
                {problem.title}
              </h2>
              <span
                className={`px-2 py-1 text-xs font-semibold text-white rounded ${
                  difficultyColors[problem.difficulty] || "bg-gray-500"
                }`}
              >
                {problem.difficulty || "Unknown"}
              </span>
            </div>

            <p className="text-gray-400 mt-2 text-sm line-clamp-3">
              {problem.description || "No description available"}
            </p>

            <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-300">
              {problem.tags?.map((tag, idx) => (
                <span
                  key={idx}
                  className="bg-gray-700 px-2 py-1 rounded-full hover:bg-gray-600 transition"
                >
                  #{tag}
                </span>
              ))}
            </div>

            <div className="mt-3 flex justify-between text-gray-400 text-xs">
              <span>⏱ {problem.timeLimit || 2}s</span>
              <span>💾 {problem.memoryLimit || 256}MB</span>
              
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ProblemList;
