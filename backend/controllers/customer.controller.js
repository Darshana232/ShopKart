

import Customer from "../models/customer.model.js";
import bcrypt from "bcrypt";
import generateToken from "../utils/generateToken.js";

export const register = async (req, res) => {
  try {

    const { fullName, email, password, phone } = req.body;

    if (!fullName || !email || !password || !phone) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer) {
      return res.status(400).json({ message: "Email is already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const customer = await Customer.create({
      fullName,
      email,
      password: hashedPassword, 
      phone,
    });

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      customer: {
        _id: customer._id,
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phone,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const customer = await Customer.findOne({ email });

    if (!customer) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const isPasswordValid = await bcrypt.compare(password, customer.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    generateToken(res, customer._id);

    res.status(200).json({
      success: true,
      message: "Login successful",
      customer: {
        _id: customer._id,
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phone,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getProfile = async (req, res) => {
  try {

    const customer = await Customer.findById(req.customerId).select("-password");

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.status(200).json({ success: true, customer });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const logout = (req, res) => {

  res.cookie("shopkart_token", "", {
    httpOnly: true,
    maxAge: 0, 
  });

  res.status(200).json({ success: true, message: "Logged out successfully" });
};
