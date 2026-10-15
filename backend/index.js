
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import customerRoutes from "./routes/customer.routes.js";
import productRoutes from "./routes/product.routes.js";
import wishlistRoutes from "./routes/wishlist.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import orderRoutes from "./routes/order.routes.js";

dotenv.config();

const app = express();

app.use(express.json());

app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:5173", 
    credentials: true,              
  })
);

app.use("/customers", customerRoutes);
app.use("/products", productRoutes);
app.use("/wishlist", wishlistRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", orderRoutes);

app.get("/", (req, res) => {
  res.json({ message: "ShopKart API is running 🛒" });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected successfully");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1); 
  });
