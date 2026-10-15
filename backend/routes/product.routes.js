
import express from "express";
import {
  getProducts,
  getProductById,
  seedProducts,
} from "../controllers/product.controller.js";

const router = express.Router();

router.get("/", getProducts);

router.post("/seed", seedProducts);

router.get("/:id", getProductById);

export default router;
