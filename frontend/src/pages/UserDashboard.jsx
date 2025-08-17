import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ClipboardList, Trophy } from "lucide-react";
import API from "../services/api";
import { io } from "socket.io-client";

let socket;

const BadgeToast = ({ badges }) => {
  const [visible, setVisible] = useState(false);
  const [newBadge, setNewBadge] = useState({});

  useEffect(() => {
    if (badges && badges.length > 0) {
      const latestBadge = badges[badges.length - 1];
      setNewBadge(latestBadge);
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [badges]);

  if (!visible) return null;

  return (
    <div className="fixed top-5 right-5 bg-yellow-400 text-gray-900 font-bold px-4 py-2 rounded-lg shadow-lg z-50 animate-bounce flex items-center gap-2">
      🎉 New Badge Earned: {newBadge.icon} {newBadge.name}
    </div>
  );
};

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [badgeToast, setBadgeToast] = useState([]);
  const navigate = useNavigate();

  // Initial fetch + real-time setup
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }
        const res = await API.get("/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch (err) {
        console.error("❌ Error fetching user stats:", err);
        if (err.response?.status === 403) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      }
    };

    fetchUser();

    // --- Socket.IO Real-time setup ---
    if (!socket) {
      socket = io(import.meta.env.VITE_BACKEND_URL || "http://localhost:5000");
    }

    // Wait until user is loaded to join their room
    if (user?._id) socket.emit("joinRoom", user._id);

    socket.on("gamificationUpdate", (data) => {
      console.log("🔔 Real-time gamification update:", data);

      // Show newly earned badges
      if (data.badges?.length > 0 && user?.badges) {
        const oldBadgeNames = user.badges.map((b) => b.name);
        const newEarned = data.badges.filter((b) => !oldBadgeNames.includes(b.name));
        if (newEarned.length) setBadgeToast(newEarned);
      }

      setUser((prev) => ({ ...prev, ...data }));
    });

    return () => socket.off("gamificationUpdate");
  }, [user?._id, navigate]);

  if (!user)
    return <p className="text-white text-center mt-10">Loading dashboard...</p>;

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 relative">
      {badgeToast.length > 0 && <BadgeToast badges={badgeToast} />}

      <div className="absolute inset-0 bg-black/20"></div>
      <div className="relative z-10 max-w-5xl mx-auto text-center text-white">
        <h1 className="text-4xl font-bold mb-4 text-purple-300">
          Welcome, {user.username} 👨‍💻
        </h1>
        <p className="text-gray-300 mb-10 text-lg">
          Here's your coding journey at a glance
        </p>

        {/* Stats Cards */}
        <div className="grid sm:grid-cols-5 gap-6 mb-10">
          <StatCard title="Problems Solved" value={user.problemsSolved.length || 0} />
          <StatCard title="Total Submissions" value={user.totalSubmissions || 0} />
          <StatCard title="XP" value={user.xp || 0} />
          <StatCard title="Streak" value={user.streak || 0} />
          <div className="bg-white/10 p-6 rounded-2xl shadow-md hover:shadow-xl transition backdrop-blur-md">
            <h2 className="text-xl font-semibold text-purple-200 mb-2">Problem Stats</h2>
            <div className="flex flex-col gap-1 text-cyan-200">
              <p>Easy: {user.problemStats?.easySolved || 0}</p>
              <p>Medium: {user.problemStats?.mediumSolved || 0}</p>
              <p>Hard: {user.problemStats?.hardSolved || 0}</p>
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className="bg-white/10 p-6 rounded-2xl shadow-md hover:shadow-xl transition backdrop-blur-md mb-10">
          <h2 className="text-xl font-semibold text-purple-200 mb-2">Badges</h2>
          {user.badges?.length ? (
            <div className="flex flex-wrap justify-center gap-2">
              {user.badges.map((badge, idx) => (
                <span
                  key={idx}
                  className="bg-yellow-400 text-gray-900 px-3 py-1 rounded-full font-semibold text-sm flex items-center gap-1"
                >
                  {badge.icon} {badge.name}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-300">No badges yet</p>
          )}
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

const StatCard = ({ title, value }) => (
  <div className="bg-white/10 p-6 rounded-2xl shadow-md hover:shadow-xl transition backdrop-blur-md">
    <h2 className="text-xl font-semibold text-purple-200 mb-2">{title}</h2>
    <p className="text-3xl font-bold text-cyan-300">{value}</p>
  </div>
);

export default UserDashboard;
