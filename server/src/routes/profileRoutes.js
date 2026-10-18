import { Router } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import validate from "../middleware/validate.js";
import { authenticateToken } from "../middleware/auth.js";
import { authLimiter } from "../middleware/rateLimit.js";
import { passwordChangeSchema, profileSchema } from "../validation/schemas.js";
import { changePassword, getProfile, updateProfile } from "../controllers/profileController.js";

const router = Router();

router.get("/profile", authenticateToken, asyncHandler(getProfile));
router.patch("/profile", authenticateToken, validate(profileSchema), asyncHandler(updateProfile));
router.patch(
  "/profile/password",
  authenticateToken,
  authLimiter,
  validate(passwordChangeSchema),
  asyncHandler(changePassword)
);

export default router;
