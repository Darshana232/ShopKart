import express from "express";
import {
  createPaymentOrder,
  verifyPayment,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
} from "../controllers/order.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

// All order endpoints are protected by verifyToken
router.post("/create-payment-order", verifyToken, createPaymentOrder);
router.post("/verify-payment", verifyToken, verifyPayment);
router.get("/", verifyToken, getMyOrders);
router.get("/:id", verifyToken, getOrderById);
router.patch("/:id/status", verifyToken, updateOrderStatus);

export default router;
