
import Wishlist from "../models/wishlist.model.js";
import Product from "../models/product.model.js";

export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const customerId = req.customerId; 

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const existingWishlistItem = await Wishlist.findOne({
      customer: customerId,
      product: productId,
    });

    if (existingWishlistItem) {
      return res.status(400).json({ message: "Product is already in your wishlist" });
    }

    const wishlistItem = await Wishlist.create({
      customer: customerId,
      product: productId,
    });

    await wishlistItem.populate("product");

    res.status(201).json({
      success: true,
      message: "Product added to wishlist ❤️",
      wishlistItem,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getWishlist = async (req, res) => {
  try {
    const customerId = req.customerId;

    const wishlistItems = await Wishlist.find({ customer: customerId })
      .populate("product")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: wishlistItems.length,
      wishlist: wishlistItems,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const customerId = req.customerId;

    const deletedItem = await Wishlist.findOneAndDelete({
      customer: customerId,
      product: productId,
    });

    if (!deletedItem) {
      return res.status(404).json({ message: "Item not found in wishlist" });
    }

    res.status(200).json({
      success: true,
      message: "Product removed from wishlist 💔",
      productId,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
