import React from "react";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white shadow-2xl rounded-2xl p-10 max-w-xl w-full text-center">
        <h1 className="text-4xl font-bold text-blue-700 mb-4">
          Welcome, Admin 👨‍💻
        </h1>
        <p className="text-gray-600 mb-8">
          Use the buttons below to manage coding problems.
        </p>

        <div className="flex flex-col gap-4">
          <button
            onClick={() => navigate("/admin/create")}
            className="bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-semibold transition"
          >
            ➕ Create New Problem
          </button>

          <button
            onClick={() => navigate("/admin/problems")}
            className="bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-semibold transition"
          >
            🛠️ Manage Existing Problems
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
