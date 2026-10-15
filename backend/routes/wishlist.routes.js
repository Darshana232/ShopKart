
import express from "express";
import {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
} from "../controllers/wishlist.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(verifyToken);

router.post("/", addToWishlist);

router.get("/", getWishlist);

router.delete("/:productId", removeFromWishlist);

export default router;
