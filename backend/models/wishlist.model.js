
import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

wishlistSchema.index({ customer: 1, product: 1 }, { unique: true });

const Wishlist = mongoose.model("Wishlist", wishlistSchema);

export default Wishlist;
