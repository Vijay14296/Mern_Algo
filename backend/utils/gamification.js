// backend/utils/gamification.js
import User from "../models/User.js";

// XP per difficulty
const XP_BY_DIFFICULTY = {
  Easy: 10,
  Medium: 20,
  Hard: 30,
};

// Badge thresholds
const BADGE_RULES = [
  { type: "problemsSolved", threshold: 1, badge: "First Blood", icon: "🥇" },
  { type: "problemsSolved", threshold: 10, badge: "Rising Star", icon: "🏅" },
  { type: "problemsSolved", threshold: 50, badge: "Algorithm Master", icon: "🌟" },
  { type: "xp", threshold: 200, badge: "XP Beginner", icon: "🎖️" },
  { type: "xp", threshold: 500, badge: "XP Pro", icon: "🏆" },
];

// Level calculation
const calculateLevel = (xp) => {
  if (xp < 100) return 1;
  if (xp < 300) return 2;
  if (xp < 600) return 3;
  if (xp < 1000) return 4;
  return Math.floor(xp / 500) + 1;
};

export const updateGamification = async (userId, problemId, problemDifficulty) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    // --- Initialize defaults ---
    user.totalSubmissions = user.totalSubmissions || 0;
    user.problemsSolved = user.problemsSolved || [];
    user.badges = user.badges || [];
    user.problemStats = user.problemStats || { easySolved: 0, mediumSolved: 0, hardSolved: 0 };
    user.streak = user.streak || 0;

    user.totalSubmissions += 1;
    user.lastSubmissionAt = new Date();

    let newlySolved = false;
    if (!user.problemsSolved.includes(problemId)) {
      newlySolved = true;
      user.problemsSolved.push(problemId);
      user.lastProblemSolvedAt = new Date();

      // XP update
      const earnedXP = XP_BY_DIFFICULTY[problemDifficulty] || 10;
      user.xp = (user.xp || 0) + earnedXP;

      // Problem stats
      if (problemDifficulty === "Easy") user.problemStats.easySolved += 1;
      if (problemDifficulty === "Medium") user.problemStats.mediumSolved += 1;
      if (problemDifficulty === "Hard") user.problemStats.hardSolved += 1;

      // Streak logic
      const today = new Date().setHours(0, 0, 0, 0);
      const lastSolved = user.lastSolvedDate ? new Date(user.lastSolvedDate).setHours(0, 0, 0, 0) : null;

      if (!lastSolved) {
        user.streak = 1;
      } else {
        const diffDays = (today - lastSolved) / (1000 * 60 * 60 * 24);
        if (diffDays === 1) {
          user.streak += 1;
        } else if (diffDays > 1) {
          user.streak = 1;
        }
        // same day, no change
      }
      user.lastSolvedDate = new Date();
    }

    // Check badges
    for (const rule of BADGE_RULES) {
      if (rule.type === "problemsSolved" && user.problemsSolved.length >= rule.threshold) {
        if (!user.badges.some((b) => b.name === rule.badge)) {
          user.badges.push({ name: rule.badge, icon: rule.icon });
        }
      }
      if (rule.type === "xp" && (user.xp || 0) >= rule.threshold) {
        if (!user.badges.some((b) => b.name === rule.badge)) {
          user.badges.push({ name: rule.badge, icon: rule.icon });
        }
      }
    }

    // Level
    user.level = calculateLevel(user.xp || 0);

    await user.save();

    return {
      xp: user.xp,
      level: user.level,
      badges: user.badges,
      problemsSolved: user.problemsSolved.length,
      totalSubmissions: user.totalSubmissions,
      problemStats: user.problemStats,
      streak: user.streak,
    };
  } catch (err) {
    console.error("Gamification update error:", err);
    throw err;
  }
};
