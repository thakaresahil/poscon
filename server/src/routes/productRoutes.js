import { Router } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import {
  getBestsellers,
  getLatestProducts,
  getProductById,
  getProductsByCategory,
} from "../controllers/productController.js";

const router = Router();

router.get("/data", asyncHandler(getLatestProducts));
router.get("/home/bestseller", asyncHandler(getBestsellers));
router.get("/browseproducts/:category", asyncHandler(getProductsByCategory));
router.get("/products/:id", asyncHandler(getProductById));

export default router;
