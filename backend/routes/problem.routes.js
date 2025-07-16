// routes/problem.routes.js
import express from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import { isAdmin } from "../middleware/role.middleware.js";
import Problem from "../models/Problem.js";

const router = express.Router();


router.post("/problems", verifyToken, async (req, res) => {
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


router.get("/problems", async (req, res) => {
    try {
        const problems = await Problem.find().select("-testCases");
        res.json(problems);
    } catch (err) {
        console.error("Fetch Problems Error:", err);
        res.status(500).json({ error: "Failed to fetch problems" });
    }
});


router.get("/problems/:id", async (req, res) => {
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


router.put("/problems/:id", verifyToken, isAdmin, async (req, res) => {
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


router.delete("/problems/:id", verifyToken, isAdmin, async (req, res) => {
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
