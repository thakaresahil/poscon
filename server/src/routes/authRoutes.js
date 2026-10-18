import { Router } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import validate from "../middleware/validate.js";
import { authLimiter } from "../middleware/rateLimit.js";
import { loginSchema, signupSchema } from "../validation/schemas.js";
import { login, signup } from "../controllers/authController.js";

const router = Router();

router.post("/signup/user", authLimiter, validate(signupSchema), asyncHandler(signup));
router.post("/login", authLimiter, validate(loginSchema), asyncHandler(login));

export default router;
