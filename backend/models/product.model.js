
import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price cannot be negative"],
    },
    category: {
      type: String,
      required: [true, "Product category is required"],
      enum: ["Electronics", "Fashion", "Footwear", "Home & Living", "Accessories"],
    },
    image: {
      type: String,
      default: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
    },
    stock: {
      type: Number,
      required: true,
      default: 15,
      min: 0,
    },
    rating: {
      type: Number,
      default: 4.5,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 12,
    },
  },
  {
    timestamps: true, 
  }
);

productSchema.index({ name: "text", description: "text" });

const Product = mongoose.model("Product", productSchema);

export default Product;
