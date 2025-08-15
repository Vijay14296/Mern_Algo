import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";
import CodeEditor from "../components/CodeEditor";

const BadgeToast = ({ badges }) => {
  const [visible, setVisible] = useState(false);
  const [newBadge, setNewBadge] = useState("");

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
    <div className="fixed top-5 right-5 bg-yellow-400 text-gray-900 font-bold px-4 py-2 rounded-lg shadow-lg z-50 animate-bounce">
      🎉 New Badge Earned: {newBadge}
    </div>
  );
};

const ProblemDetail = () => {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);
  const [gamification, setGamification] = useState(null);
  const [badgeToast, setBadgeToast] = useState([]);

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const res = await API.get(`/problems/${id}`);
        setProblem(res.data);
      } catch (err) {
        console.error("❌ Error fetching problem:", err);
      }
    };
    fetchProblem();
  }, [id]);

  const handleRunComplete = (code, verdict, gamificationData) => {
    if (gamificationData) {
      if (gamificationData.badges?.length) {
        const oldBadges = gamification?.badges || [];
        const newEarned = gamificationData.badges.filter(b => !oldBadges.includes(b));
        if (newEarned.length) setBadgeToast(newEarned);
      }
      setGamification(gamificationData);
    }
  };

  if (!problem) return <div className="p-4 text-white">Loading problem...</div>;

  return (
    <div className="h-screen bg-gray-900 text-white overflow-auto p-6">
      {badgeToast.length > 0 && <BadgeToast badges={badgeToast} />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-full">
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 overflow-auto">
          <h1 className="text-3xl font-extrabold mb-4 text-indigo-400">{problem.title}</h1>
          <p className="mb-4 text-gray-300 leading-relaxed whitespace-pre-line">{problem.description}</p>

          <div className="mb-2"><strong className="text-indigo-300">Difficulty:</strong> {problem.difficulty}</div>
          <div className="mb-2"><strong className="text-indigo-300">Tags:</strong> {problem.tags.join(", ")}</div>
          <div className="mb-2"><strong className="text-indigo-300">Time Limit:</strong> {problem.timeLimit}s</div>
          <div className="mb-4"><strong className="text-indigo-300">Memory Limit:</strong> {problem.memoryLimit} MB</div>

          <div className="mb-4">
            <h2 className="font-semibold mb-2 text-indigo-300">📥 Test Cases</h2>
            {problem.testCases.map((tc, idx) => (
              <div key={idx} className="mb-2">
                <p className="text-green-300"><strong>Input {idx + 1}:</strong></p>
                <pre className="bg-gray-900 p-2 rounded text-sm">{tc.input}</pre>

                <p className="text-yellow-300"><strong>Expected Output {idx + 1}:</strong></p>
                <pre className="bg-gray-900 p-2 rounded text-sm">{tc.expectedOutput}</pre>

                {tc.hidden && <span className="text-red-400 text-sm font-semibold">Hidden Test Case</span>}
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col">
          <div className="bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-700 flex-1 overflow-auto">
            <CodeEditor
              problemId={id}
              problem={problem}
              onRunComplete={handleRunComplete}
            />
          </div>

          {gamification && (
            <div className="bg-gray-800 mt-4 p-4 rounded-xl border border-green-400/40 shadow-lg">
              <h3 className="text-lg font-semibold text-green-300 mb-2">🏆 Gamification</h3>
              <p className="text-gray-200">
                XP: <span className="font-medium text-green-200">{gamification.xp}</span><br/>
                Problems Solved: <span className="font-medium text-green-200">{gamification.problemsSolved}</span><br/>
                Badges: {gamification.badges.length ? gamification.badges.join(", ") : "None"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProblemDetail;
