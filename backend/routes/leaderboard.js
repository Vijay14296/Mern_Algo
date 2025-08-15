import express from "express";
import User from "../models/User.js";

const router = express.Router();

// Get top N users
router.get("/", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const users = await User.find({})
      .select("username xp level problemsSolved badges")
      .sort({ xp: -1 }) // Sort by XP descending
      .limit(limit);

    res.json(users);
  } catch (err) {
    console.error("Leaderboard error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
