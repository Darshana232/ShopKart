
import express from "express";
import {
  register,
  login,
  getProfile,
  logout,
} from "../controllers/customer.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

router.get("/me", verifyToken, getProfile);

export default router;
