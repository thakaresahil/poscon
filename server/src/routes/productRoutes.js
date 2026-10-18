import { Router } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import validate from "../middleware/validate.js";
import { productQuerySchema } from "../validation/schemas.js";
import {
  getBestsellers,
  getCategories,
  getLatestProducts,
  getProductById,
  searchProducts,
} from "../controllers/productController.js";

const router = Router();

router.get("/data", asyncHandler(getLatestProducts));
router.get("/home/bestseller", asyncHandler(getBestsellers));
router.get("/products", validate(productQuerySchema, "query"), asyncHandler(searchProducts));
router.get("/products/categories", asyncHandler(getCategories));
router.get("/products/:id", asyncHandler(getProductById));

export default router;
