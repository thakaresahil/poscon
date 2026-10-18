import { Router } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import validate from "../middleware/validate.js";
import { authenticateToken } from "../middleware/auth.js";
import { paymentSchema, shippingSchema } from "../validation/schemas.js";
import {
  getOrderById,
  getOrders,
  payOrder,
  placeOrder,
} from "../controllers/orderController.js";

const router = Router();

router.post("/orders", authenticateToken, validate(shippingSchema), asyncHandler(placeOrder));
router.get("/orders", authenticateToken, asyncHandler(getOrders));
router.get("/orders/:id(\\d+)", authenticateToken, asyncHandler(getOrderById));
router.post("/orders/:id(\\d+)/pay", authenticateToken, validate(paymentSchema), asyncHandler(payOrder));

export default router;
