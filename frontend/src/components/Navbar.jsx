import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  if (!token) return null; // hide navbar when not logged in

  // Determine dashboard link based on role
  const dashboardLink = role === "admin" ? "/admin" : "/dashboard";

  return (
    <nav className="backdrop-blur-md bg-gradient-to-r from-indigo-900 via-purple-900 to-blue-900 shadow-lg px-8 py-3 flex justify-between items-center border-b border-white/20 font-sans relative z-20">
      <h1 className="text-2xl font-bold text-purple-300 tracking-tight">
        CodeMyst
      </h1>

      <div className="space-x-6 flex items-center">
        <Link
          to="/problems"
          className="text-gray-300 hover:text-purple-300 transition-colors duration-200 font-medium"
        >
          Problems
        </Link>

        <Link
          to={dashboardLink}
          className="text-gray-300 hover:text-purple-300 transition-colors duration-200 font-medium"
        >
          Dashboard
        </Link>

        <button
          onClick={handleLogout}
          className="bg-white/10 hover:bg-white/20 text-gray-200 px-4 py-2 rounded-xl transition duration-200 border border-white/20 shadow-sm"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
