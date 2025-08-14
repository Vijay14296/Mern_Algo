import React from "react";
import { useNavigate } from "react-router-dom";
import { PlusCircle, ClipboardList } from "lucide-react";

const AdminDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 relative px-4">
      {/* Optional subtle overlay */}
      <div className="absolute inset-0 bg-black/20"></div>

      <div className="relative z-10 w-full max-w-xl p-12 rounded-3xl backdrop-blur-md bg-white/10 shadow-2xl border border-white/20 text-center transform hover:scale-105 transition-transform duration-300">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-purple-300 mb-4">
          Welcome, Admin 👨‍💻
        </h1>
        <p className="text-gray-300 mb-10 text-lg sm:text-xl">
          Manage coding problems efficiently from the buttons below.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <button
            onClick={() => navigate("/admin/create")}
            className="flex items-center justify-center gap-3 bg-purple-500/80 hover:bg-purple-600 text-white py-4 px-6 rounded-2xl font-semibold text-lg transition-all shadow-md hover:shadow-lg"
          >
            <PlusCircle size={24} />
            Create New Problem
          </button>

          <button
            onClick={() => navigate("/admin/problems")}
            className="flex items-center justify-center gap-3 bg-cyan-500/80 hover:bg-cyan-600 text-white py-4 px-6 rounded-2xl font-semibold text-lg transition-all shadow-md hover:shadow-lg"
          >
            <ClipboardList size={24} />
            Manage Problems
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
