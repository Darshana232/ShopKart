import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";

// GET /cart
export const getCart = async (req, res) => {
  try {
    const customer = await Customer.findById(req.customerId).populate(
      "cart.product"
    );

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.status(200).json({ success: true, cart: customer.cart });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// POST /cart/:productId
export const addToCart = async (req, res) => {
  const { productId } = req.params;

  try {
    // 1. Verify the product exists and has stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    if (product.stock < 1) {
      return res.status(400).json({ message: "Product is out of stock" });
    }

    // 2. Find the user
    const customer = await Customer.findById(req.customerId);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // 3. Check if the product is already in the cart
    const existingItemIndex = customer.cart.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      // Product exists in cart, check stock limit before incrementing
      const currentQuantity = customer.cart[existingItemIndex].quantity;
      if (currentQuantity >= product.stock) {
        return res.status(400).json({ 
          message: `Cannot add more. Only ${product.stock} left in stock.` 
        });
      }
      customer.cart[existingItemIndex].quantity += 1;
    } else {
      // Product is not in cart, add it
      customer.cart.push({ product: productId, quantity: 1 });
    }

    // 4. Save and populate
    await customer.save();
    
    // We populate the product details before sending the response back
    const updatedCustomer = await Customer.findById(req.customerId).populate(
      "cart.product"
    );

    res.status(200).json({ 
      success: true, 
      message: "Added to cart", 
      cart: updatedCustomer.cart 
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// PATCH /cart/:productId
export const updateCartItem = async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;

  if (!quantity || quantity < 1) {
    return res.status(400).json({ message: "Invalid quantity" });
  }

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (quantity > product.stock) {
      return res.status(400).json({ 
        message: `Quantity exceeds stock. Only ${product.stock} available.` 
      });
    }

    const customer = await Customer.findById(req.customerId);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const itemIndex = customer.cart.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Product is not in the cart" });
    }

    customer.cart[itemIndex].quantity = quantity;
    await customer.save();

    const updatedCustomer = await Customer.findById(req.customerId).populate(
      "cart.product"
    );

    res.status(200).json({ 
      success: true, 
      message: "Cart updated", 
      cart: updatedCustomer.cart 
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// DELETE /cart/:productId
export const removeFromCart = async (req, res) => {
  const { productId } = req.params;

  try {
    const customer = await Customer.findById(req.customerId);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Filter out the item to be removed
    customer.cart = customer.cart.filter(
      (item) => item.product.toString() !== productId
    );

    await customer.save();

    const updatedCustomer = await Customer.findById(req.customerId).populate(
      "cart.product"
    );

    res.status(200).json({ 
      success: true, 
      message: "Product removed from cart", 
      cart: updatedCustomer.cart 
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
