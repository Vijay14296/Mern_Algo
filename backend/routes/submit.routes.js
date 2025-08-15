
import express from "express";
import { submitCode } from "../controllers/submit.controller.js";
import {verifyToken} from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/submit", verifyToken, submitCode);

export default router;
