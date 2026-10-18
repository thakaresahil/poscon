import { Router } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import validate from "../middleware/validate.js";
import { authenticateToken } from "../middleware/auth.js";
import {
  addToCartSchema,
  buyItemSchema,
  updateCartSchema,
} from "../validation/schemas.js";
import {
  addToCart,
  buyItems,
  getCart,
  removeCartItem,
  updateCartItem,
} from "../controllers/cartController.js";

const router = Router();

router.get("/cartdata", authenticateToken, asyncHandler(getCart));
router.post("/addtocart", authenticateToken, validate(addToCartSchema), asyncHandler(addToCart));
router.patch("/cart/:id(\\d+)", authenticateToken, validate(updateCartSchema), asyncHandler(updateCartItem));
router.delete("/cart/:id(\\d+)", authenticateToken, asyncHandler(removeCartItem));
router.patch("/buyitem", authenticateToken, validate(buyItemSchema), asyncHandler(buyItems));

export default router;
