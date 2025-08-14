import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../services/api";

const AdminProblemList = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const res = await API.get("/problems?page=1&limit=20", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setProblems(res.data.problems || []);
      } catch (err) {
        console.error("Error fetching problems:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProblems();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this problem?")) return;
    try {
      await API.delete(`/problems/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setProblems((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Delete failed");
    }
  };

  if (loading)
    return <p className="text-center text-gray-300 mt-10">Loading problems...</p>;

  return (
    <div className="min-h-screen w-screen p-6 bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 relative">
  {/* Subtle overlay */}
  <div className="absolute inset-0 bg-black/20"></div>

  <div className="relative z-10 max-w-6xl mx-auto">
    <h1 className="text-4xl font-bold text-purple-300 text-center mb-6">
      Admin: All Problems
    </h1>

    <div className="flex justify-end mb-6">
      <Link
        to="/admin/create"
        className="px-5 py-3 bg-purple-500/80 hover:bg-purple-600 text-white rounded-xl font-semibold transition shadow-md hover:shadow-lg"
      >
        ➕ Create New Problem
      </Link>
    </div>

    {problems.length === 0 ? (
      <p className="text-center text-gray-300">No problems found.</p>
    ) : (
      <ul className="space-y-4">
        {problems.map((problem) => (
          <li
            key={problem._id}
            className="bg-white/10 border border-white/20 rounded-2xl p-5 shadow-md hover:shadow-xl transition backdrop-blur-md"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-2xl font-semibold text-purple-200">{problem.title}</h3>
                <p className="text-gray-200 mt-1">{problem.description}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {problem.tags?.map((tag, idx) => (
                    <span
                      key={idx}
                      className="bg-white/20 text-gray-100 px-2 py-1 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-gray-300 mt-2">
                  Difficulty: <span className="font-medium text-cyan-300">{problem.difficulty}</span> | Time Limit: <span className="font-medium text-cyan-300">{problem.timeLimit}s</span> | Memory Limit: <span className="font-medium text-cyan-300">{problem.memoryLimit}MB</span>
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <Link to={`/problems/${problem._id}`} className="text-cyan-300 hover:text-purple-300 hover:underline transition">
                  View
                </Link>
                <Link to={`/admin/edit/${problem._id}`} className="text-yellow-400 hover:text-yellow-300 hover:underline transition">
                  Edit
                </Link>
                <button className="text-red-400 hover:text-red-300 hover:underline transition" onClick={() => handleDelete(problem._id)}>
                  Delete
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    )}
  </div>
</div>

  );
};

export default AdminProblemList;
