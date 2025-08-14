import React, { useState } from "react";
import API from "../services/api";
import { useNavigate, Link } from "react-router-dom";

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log("Trying login with:", { email, password });

    try {
      const res = await API.post("/auth/login", { email, password });
      const { token, role } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("role", role);

      onLogin(token, role);

      if (role === "admin") navigate("/admin");
      else navigate("/problems");
    } catch (err) {
      console.error("Login error:", err);
      alert("Login failed. Please check credentials.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 relative">
      {/* Optional subtle overlay for mysterious vibe */}
      <div className="absolute inset-0 bg-black/20"></div>

      <div className="relative z-10 w-full max-w-md p-10 rounded-3xl backdrop-blur-md bg-white/10 shadow-2xl border border-white/20">
        <h2 className="text-4xl font-bold text-center text-purple-300 mb-6">
          CodeMyst
        </h2>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-gray-200 font-medium mb-1">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-3 bg-white/10 text-gray-100 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder-gray-300"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-gray-200 font-medium mb-1">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full px-4 py-3 bg-white/10 text-gray-100 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder-gray-300"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-purple-500/80 text-white font-semibold rounded-xl hover:bg-purple-600 transition"
          >
            Login
          </button>
        </form>

        <p className="text-sm text-center text-gray-300 mt-5">
          Don’t have an account?{" "}
          <Link to="/register" className="text-purple-300 font-medium hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
