import React, { useEffect, useState } from "react";
import API from "../services/api";
import { Link, useLocation } from "react-router-dom";

const ProblemList = () => {
  const [problems, setProblems] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const res = await API.get("/problems");
        setProblems(res.data);
      } catch (err) {
        console.error("Error fetching problems:", err);
      }
    };

    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.role === "admin" && location.pathname.startsWith("/admin")) {
      setIsAdmin(true);
    }

    fetchProblems();
  }, [location.pathname]);

  const handleDelete = async (id) => {
    try {
      await API.delete(`/problems/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setProblems((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Delete failed");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-6">
        {isAdmin ? "Admin: Manage Problems" : "Problem List"}
      </h1>

      {isAdmin && (
        <div className="flex justify-end mb-4">
          <Link
            to="/admin/create"
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
          >
            ➕ Create New Problem
          </Link>
        </div>
      )}

      {problems.length === 0 ? (
        <p className="text-center text-gray-500">No problems found.</p>
      ) : (
        <ul className="space-y-4">
          {problems.map((problem) => (
            <li
              key={problem._id}
              className="border rounded-lg p-4 shadow-md hover:shadow-lg transition"
            >
              <Link to={`/problems/${problem._id}`}>
                <h3 className="text-xl font-semibold text-blue-700 hover:underline">
                  {problem.title}
                </h3>
              </Link>
              <p className="text-gray-700 mt-1">{problem.description}</p>

              {isAdmin && (
                <div className="mt-3 flex gap-6">
                  <Link
                    to={`/admin/edit/${problem._id}`}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    ✏️ Edit
                  </Link>
                  <button
                    className="text-red-600 hover:underline font-medium"
                    onClick={() => handleDelete(problem._id)}
                  >
                    🗑️ Delete
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ProblemList;
