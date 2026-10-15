import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product reference is required"],
    },
    name: {
      type: String,
      required: [true, "Product snapshot name is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Product snapshot price is required"],
      min: [0, "Item price cannot be negative"],
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be at least 1"],
    },
    image: {
      type: String,
      default: "",
    },
  },
  { _id: true }
);

const shippingAddressSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Recipient full name is required"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Contact phone number is required"],
      trim: true,
    },
    addressLine1: {
      type: String,
      required: [true, "Street address is required"],
      trim: true,
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
    },
    state: {
      type: String,
      required: [true, "State is required"],
      trim: true,
    },
    pincode: {
      type: String,
      required: [true, "6-digit postal pincode is required"],
      trim: true,
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: [true, "Customer reference is required"],
      index: true,
    },
    items: {
      type: [orderItemSchema],
      validate: {
        validator: function (items) {
          return items && items.length > 0;
        },
        message: "Order must contain at least one item",
      },
    },
    shippingAddress: {
      type: shippingAddressSchema,
      required: [true, "Shipping address is required"],
    },
    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
      min: [0, "Total amount cannot be negative"],
    },
    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED"],
      default: "PENDING",
      index: true,
    },
    status: {
      type: String,
      enum: [
        "PENDING_PAYMENT",
        "PLACED",
        "CONFIRMED",
        "SHIPPED",
        "DELIVERED",
        "CANCELLED",
      ],
      default: "PENDING_PAYMENT",
      index: true,
    },
    razorpayOrderId: {
      type: String,
      default: null,
      index: true,
    },
    razorpayPaymentId: {
      type: String,
      default: null,
    },
    razorpaySignature: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual alias: allows referencing order.user as an alias to order.customer
orderSchema.virtual("user").get(function () {
  return this.customer;
});

// Compound index for querying user orders in reverse chronological order
orderSchema.index({ customer: 1, createdAt: -1 });

const Order = mongoose.model("Order", orderSchema);

export default Order;
