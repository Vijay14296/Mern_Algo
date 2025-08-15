import React, { useEffect, useState } from "react";
import API from "../services/api";

const Leaderboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await API.get("/leaderboard?limit=10");
        setUsers(res.data);
      } catch (err) {
        console.error("Leaderboard fetch error:", err);
      }
      setLoading(false);
    };

    fetchLeaderboard();
  }, []);

  if (loading) return <p className="text-white text-center mt-10">Loading leaderboard...</p>;

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900">
      <div className="max-w-5xl mx-auto relative z-10">
        <h2 className="text-4xl font-bold text-yellow-400 text-center mb-8">🏆 Leaderboard</h2>
        <div className="bg-white/10 p-6 rounded-2xl shadow-md backdrop-blur-md overflow-auto">
          <table className="w-full text-white table-auto">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left px-4 py-2 text-purple-200">Rank</th>
                <th className="text-left px-4 py-2 text-purple-200">Username</th>
                <th className="px-4 py-2 text-purple-200">XP</th>
                <th className="px-4 py-2 text-purple-200">Level</th>
                <th className="px-4 py-2 text-purple-200">Badges</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, idx) => (
                <tr
                  key={user._id}
                  className={`border-b border-gray-700 ${
                    idx % 2 === 0 ? "bg-white/5" : ""
                  }`}
                >
                  <td className="px-4 py-2">{idx + 1}</td>
                  <td className="px-4 py-2">{user.username}</td>
                  <td className="px-4 py-2">{user.xp}</td>
                  <td className="px-4 py-2">{user.level}</td>
                  <td className="px-4 py-2 flex flex-wrap gap-1">
                    {user.badges?.map((b) => (
                      <span
                        key={b.name}
                        className="bg-yellow-400 text-gray-900 px-2 py-1 rounded-full text-sm flex items-center gap-1"
                      >
                        {b.icon}
                      </span>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
