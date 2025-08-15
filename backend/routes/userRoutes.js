import express from "express";
import User from "../models/User.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

// Function to calculate level from XP
const calculateLevel = (xp) => {
  if (xp < 100) return 1;
  if (xp < 300) return 2;
  if (xp < 600) return 3;
  if (xp < 1000) return 4;
  return Math.floor(xp / 500) + 1;
};

router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "username xp problemsSolved badges totalSubmissions email role problemStats streak lastSubmissionAt"
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const level = calculateLevel(user.xp ?? 0);
    const problemStats = user.problemStats || {
      easySolved: 0,
      mediumSolved: 0,
      hardSolved: 0,
    };

    let streak = user.streak || 0;
    const now = new Date();
    if (user.lastSubmissionAt) {
      const diffHours = (now - user.lastSubmissionAt) / (1000 * 60 * 60);
      if (diffHours > 48) {
        streak = 0;
      }
    }

    res.json({
      username: user.username,
      email: user.email,
      role: user.role,
      xp: user.xp ?? 0,
      level,
      problemsSolved: user.problemsSolved ?? [],
      totalSubmissions: user.totalSubmissions ?? 0,
      badges: user.badges ?? [],
      problemStats,
      streak,
    });
  } catch (err) {
    console.error("Error in /me route:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
