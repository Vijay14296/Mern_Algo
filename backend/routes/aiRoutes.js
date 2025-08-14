import express from "express";
import { getAIFeedback } from "../controllers/ai.Controller.js";

const router = express.Router();

router.post("/feedback", getAIFeedback);

export default router;
