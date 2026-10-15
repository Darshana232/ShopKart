import express from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import {
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
} from "../controllers/cart.controller.js";

const router = express.Router();

// All cart routes must be authenticated
router.use(verifyToken);

router.get("/", getCart);
router.post("/:productId", addToCart);
router.patch("/:productId", updateCartItem);
router.delete("/:productId", removeFromCart);

export default router;
