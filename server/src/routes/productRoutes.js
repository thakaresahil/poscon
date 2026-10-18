import { Router } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import {
  getBestsellers,
  getLatestProducts,
  getProductsByCategory,
} from "../controllers/productController.js";

const router = Router();

router.get("/data", asyncHandler(getLatestProducts));
router.get("/home/bestseller", asyncHandler(getBestsellers));
router.get("/browseproducts/:category", asyncHandler(getProductsByCategory));

export default router;
