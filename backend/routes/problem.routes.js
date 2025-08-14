import express from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import { isAdmin } from "../middleware/role.middleware.js";
import Problem from "../models/Problem.js";

const router = express.Router();

// ============================
// ✅ Create a new problem (Admin-only)
// Supports multi-language starter code
// ============================
router.post("/", verifyToken, isAdmin, async (req, res) => {
  try {
    const {
      title,
      description,
      testCases,
      starterCode = {},      // Expect object: { java: '', python: '', cpp: '' }
      functionSignatures = [],
      difficulty = "Easy",
      tags = [],
      timeLimit = 2,
      memoryLimit = 256,
    } = req.body;

    if (!title || !description || !testCases?.length) {
      return res.status(400).json({ error: "Title, description, and testCases are required" });
    }

    const newProblem = new Problem({
      title,
      description,
      testCases,
      starterCode,
      functionSignatures,
      difficulty,
      tags,
      timeLimit,
      memoryLimit,
      createdBy: req.user.id,
    });

    await newProblem.save();
    res.status(201).json({ message: "Problem created", problem: newProblem });
  } catch (err) {
    console.error("Create Problem Error:", err);
    res.status(500).json({ error: "Server error while creating problem" });
  }
});

// ============================
// ✅ Get all problems (Public)
// Supports pagination, filtering by tags/difficulty, and search
// ============================
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filter = {};

    if (req.query.tags) filter.tags = { $in: req.query.tags.split(",") };
    if (req.query.difficulty) filter.difficulty = req.query.difficulty;
    if (req.query.search) filter.title = { $regex: req.query.search, $options: "i" };

    const total = await Problem.countDocuments(filter);
    const problems = await Problem.find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .select("title description difficulty tags createdAt updatedAt"); // public fields only

    res.json({
      meta: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
      problems,
    });
  } catch (err) {
    console.error("Fetch Problems Error:", err);
    res.status(500).json({ error: "Failed to fetch problems" });
  }
});

// ============================
// ✅ Get single problem by ID
// Admin sees hidden test cases; normal users see only visible
// ============================
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) return res.status(404).json({ error: "Problem not found" });

    const isAdminUser = req.user?.isAdmin;
    const testCases = isAdminUser
      ? problem.testCases
      : problem.testCases.filter((tc) => !tc.hidden);

    res.json({
      _id: problem._id,
      title: problem.title,
      description: problem.description,
      difficulty: problem.difficulty,
      tags: problem.tags,
      starterCode: problem.starterCode,
      functionSignatures: problem.functionSignatures,
      timeLimit: problem.timeLimit,
      memoryLimit: problem.memoryLimit,
      testCases,
      createdBy: problem.createdBy,
      createdAt: problem.createdAt,
      updatedAt: problem.updatedAt,
    });
  } catch (err) {
    console.error("Fetch Problem Error:", err);
    res.status(500).json({ error: "Failed to fetch problem" });
  }
});

// ============================
// ✅ Update a problem (Admin-only)
// Supports updating starterCode for all languages
// ============================
router.put("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const allowedFields = [
      "title",
      "description",
      "testCases",
      "starterCode",
      "functionSignatures",
      "difficulty",
      "tags",
      "timeLimit",
      "memoryLimit",
    ];

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const updated = await Problem.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    });

    if (!updated) return res.status(404).json({ error: "Problem not found" });

    res.json({ message: "Problem updated", problem: updated });
  } catch (err) {
    console.error("Update Problem Error:", err);
    res.status(500).json({ error: "Failed to update problem" });
  }
});

// ============================
// ✅ Delete a problem (Admin-only)
// ============================
router.delete("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const deleted = await Problem.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Problem not found" });

    res.json({ message: "Problem deleted" });
  } catch (err) {
    console.error("Delete Problem Error:", err);
    res.status(500).json({ error: "Failed to delete problem" });
  }
});

export default router;
