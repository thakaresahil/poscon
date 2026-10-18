import { Router } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import validate from "../middleware/validate.js";
import { contactLimiter } from "../middleware/rateLimit.js";
import { contactSchema } from "../validation/schemas.js";
import { sendMessage } from "../controllers/contactController.js";

const router = Router();

router.post("/contact", contactLimiter, validate(contactSchema), asyncHandler(sendMessage));

export default router;
