import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../services/api";

const AdminProblemList = () => {
  const [problems, setProblems] = useState([]);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const res = await API.get("/problems", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setProblems(res.data);
      } catch (err) {
        console.error("Error fetching problems:", err);
      }
    };

    fetchProblems();
  }, []);

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
      <h1 className="text-3xl font-bold text-center mb-6">Admin: All Problems</h1>

      <div className="flex justify-end mb-4">
        <Link
          to="/admin/create"
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
        >
          ➕ Create New Problem
        </Link>
      </div>

      {problems.length === 0 ? (
        <p className="text-center text-gray-500">No problems found.</p>
      ) : (
        <ul className="space-y-4">
          {problems.map((problem) => (
            <li
              key={problem._id}
              className="border rounded-lg p-4 shadow-md hover:shadow-lg transition"
            >
              <h3 className="text-xl font-semibold">{problem.title}</h3>
              <p className="text-gray-700">{problem.description}</p>

              <div className="mt-2 flex gap-4">
                <Link
                  to={`/problems/${problem._id}`}
                  className="text-blue-600 hover:underline"
                >
                  View
                </Link>
                <Link
                  to={`/admin/edit/${problem._id}`}
                  className="text-yellow-600 hover:underline"
                >
                  Edit
                </Link>
                <button
                  className="text-red-600 hover:underline"
                  onClick={() => handleDelete(problem._id)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminProblemList;
