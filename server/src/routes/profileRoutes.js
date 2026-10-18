import { Router } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import { authenticateToken } from "../middleware/auth.js";
import { getProfile } from "../controllers/profileController.js";

const router = Router();

router.get("/profile", authenticateToken, asyncHandler(getProfile));

export default router;
