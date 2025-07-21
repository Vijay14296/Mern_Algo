import express from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import { isAdmin } from "../middleware/role.middleware.js";
import Problem from "../models/Problem.js";

const router = express.Router();

// ✅ Admin-only: Create a new problem
router.post("/", verifyToken, isAdmin, async (req, res) => {
    try {
        const { title, description, testCases } = req.body;

        const newProblem = new Problem({
            title,
            description,
            testCases,
            createdBy: req.user.id,
        });

        await newProblem.save();

        res.status(201).json({ message: "Problem created", problem: newProblem });
    } catch (err) {
        console.error("Create Problem Error:", err);
        res.status(500).json({ error: "Server error while creating problem" });
    }
});

// ✅ Public: Get all problems (no auth needed)
router.get("/", async (req, res) => {
    try {
        const problems = await Problem.find().select("-testCases");
        res.json(problems);
    } catch (err) {
        console.error("Fetch Problems Error:", err);
        res.status(500).json({ error: "Failed to fetch problems" });
    }
});

// ✅ Public: Get single problem by ID
router.get("/:id", async (req, res) => {
    try {
        const problem = await Problem.findById(req.params.id);
        if (!problem) {
            return res.status(404).json({ error: "Problem not found" });
        }
        res.json(problem);
    } catch (err) {
        console.error("Fetch Problem Error:", err);
        res.status(500).json({ error: "Failed to fetch problem" });
    }
});

// ✅ Admin-only: Update a problem
router.put("/:id", verifyToken, isAdmin, async (req, res) => {
    try {
        const updated = await Problem.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ error: "Problem not found" });
        }

        res.json({ message: "Problem updated", problem: updated });
    } catch (err) {
        console.error("Update Problem Error:", err);
        res.status(500).json({ error: "Failed to update problem" });
    }
});

// ✅ Admin-only: Delete a problem
router.delete("/:id", verifyToken, isAdmin, async (req, res) => {
    try {
        const deleted = await Problem.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ error: "Problem not found" });
        }
        res.json({ message: "Problem deleted" });
    } catch (err) {
        console.error("Delete Problem Error:", err);
        res.status(500).json({ error: "Failed to delete problem" });
    }
});

export default router;
