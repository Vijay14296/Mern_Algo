import React, { useState } from "react";
import API from "../services/api";
import { useNavigate, Link } from "react-router-dom";

const Register = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      console.log("Sending registration data:", { username, email, password });
      const res = await API.post("/auth/register", { username, email, password });
      alert("Registration successful!");
      navigate("/login");
    } catch (err) {
      console.error("Registration error:", err.response?.data || err.message);
      alert(err.response?.data?.error || "Registration failed. Try a different email.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 relative">
      <div className="absolute inset-0 bg-black/20"></div>

      <div className="relative z-10 w-full max-w-md p-10 rounded-3xl backdrop-blur-md bg-white/10 shadow-2xl border border-white/20">
        <h2 className="text-4xl font-bold text-center text-purple-300 mb-6">
          CodeMyst
        </h2>

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-gray-200 font-medium mb-1">Username</label>
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 text-gray-100 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder-gray-300"
              required
            />
          </div>

          <div>
            <label className="block text-gray-200 font-medium mb-1">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 text-gray-100 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder-gray-300"
              required
            />
          </div>

          <div>
            <label className="block text-gray-200 font-medium mb-1">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 text-gray-100 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder-gray-300"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-purple-500/80 text-white font-semibold rounded-xl hover:bg-purple-600 transition"
          >
            Register
          </button>
        </form>

        <p className="text-sm text-center text-gray-300 mt-5">
          Already have an account?{" "}
          <Link to="/login" className="text-purple-300 font-medium hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
