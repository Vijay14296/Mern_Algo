import React from "react";
import { Link } from "react-router-dom";
import { ClipboardList, Trophy } from "lucide-react";

const UserDashboard = () => {
  // Dummy data
  const username = "Vijay";
  const stats = { solved: 12, submissions: 30, xp: 200 };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 relative">
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="relative z-10 max-w-5xl mx-auto text-center text-white">
        <h1 className="text-4xl font-bold mb-4 text-purple-300">
          Welcome, {username} 👨‍💻
        </h1>
        <p className="text-gray-300 mb-10 text-lg">
          Here's your coding journey at a glance
        </p>

        {/* Stats Cards */}
        <div className="grid sm:grid-cols-3 gap-6 mb-10">
          <div className="bg-white/10 p-6 rounded-2xl shadow-md hover:shadow-xl transition backdrop-blur-md">
            <h2 className="text-xl font-semibold text-purple-200 mb-2">
              Problems Solved
            </h2>
            <p className="text-3xl font-bold text-cyan-300">{stats.solved}</p>
          </div>
          <div className="bg-white/10 p-6 rounded-2xl shadow-md hover:shadow-xl transition backdrop-blur-md">
            <h2 className="text-xl font-semibold text-purple-200 mb-2">
              Total Submissions
            </h2>
            <p className="text-3xl font-bold text-cyan-300">{stats.submissions}</p>
          </div>
          <div className="bg-white/10 p-6 rounded-2xl shadow-md hover:shadow-xl transition backdrop-blur-md">
            <h2 className="text-xl font-semibold text-purple-200 mb-2">
              XP
            </h2>
            <p className="text-3xl font-bold text-cyan-300">{stats.xp}</p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex flex-col sm:flex-row justify-center gap-6">
          <Link
            to="/problems"
            className="flex items-center justify-center gap-2 bg-purple-500/80 hover:bg-purple-600 px-6 py-4 rounded-xl font-semibold text-lg transition shadow-md hover:shadow-lg"
          >
            <ClipboardList size={24} /> Browse Problems
          </Link>
          <Link
            to="/leaderboard"
            className="flex items-center justify-center gap-2 bg-yellow-500/80 hover:bg-yellow-600 px-6 py-4 rounded-xl font-semibold text-lg transition shadow-md hover:shadow-lg"
          >
            <Trophy size={24} /> Leaderboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
