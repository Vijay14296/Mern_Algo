import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

const ProblemList = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const res = await API.get("/problems");
        setProblems(res.data);
      } catch (err) {
        console.error("Error fetching problems:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProblems();
  }, []);

  if (loading) return <div className="text-center mt-10">Loading...</div>;
  if (!problems.length) return <div className="text-center mt-10">No problems found.</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Practice Problems</h1>
      <ul className="space-y-4">
        {problems.map((problem) => (
          <li key={problem._id} className="border p-4 rounded shadow-sm hover:bg-gray-50">
            <Link to={`/problems/${problem._id}`}>
              <h2 className="text-lg font-semibold">{problem.title}</h2>
              <p className="text-sm text-gray-600">{problem.difficulty}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProblemList;
