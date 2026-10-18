import { Router } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import validate from "../middleware/validate.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";
import {
  adminOrderQuerySchema,
  messageQuerySchema,
  messageStatusSchema,
  orderStatusSchema,
  productSchema,
} from "../validation/schemas.js";
import {
  createProduct,
  deleteProduct,
  getAllOrders,
  getStats,
  updateOrderStatus,
  updateProduct,
} from "../controllers/adminController.js";
import { getMessages, updateMessageStatus } from "../controllers/contactController.js";

const router = Router();

router.use("/admin", authenticateToken, requireAdmin);

router.get("/admin/stats", asyncHandler(getStats));
router.get("/admin/orders", validate(adminOrderQuerySchema, "query"), asyncHandler(getAllOrders));
router.patch("/admin/orders/:id(\\d+)", validate(orderStatusSchema), asyncHandler(updateOrderStatus));
router.post("/admin/products", validate(productSchema), asyncHandler(createProduct));
router.put("/admin/products/:id(\\d+)", validate(productSchema), asyncHandler(updateProduct));
router.delete("/admin/products/:id(\\d+)", asyncHandler(deleteProduct));
router.get("/admin/messages", validate(messageQuerySchema, "query"), asyncHandler(getMessages));
router.patch("/admin/messages/:id(\\d+)", validate(messageStatusSchema), asyncHandler(updateMessageStatus));

export default router;
