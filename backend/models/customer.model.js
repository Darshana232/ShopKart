
import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"], 
      trim: true,                                
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,       
      lowercase: true,    
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
    },
    cart: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          default: 1,
          min: [1, "Quantity can not be less than 1"],
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Customer = mongoose.model("Customer", customerSchema);

export default Customer;
