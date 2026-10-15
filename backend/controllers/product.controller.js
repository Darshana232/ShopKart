
import Product from "../models/product.model.js";

const SAMPLE_PRODUCTS = [
  {
    name: "Wireless Noise-Canceling Headphones",
    description: "Premium over-ear wireless headphones with active noise cancellation, 30-hour battery life, and crystal-clear audio.",
    price: 199.99,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
    stock: 25,
    rating: 4.8,
    numReviews: 48,
  },
  {
    name: "Minimalist Leather Smartwatch",
    description: "Sleek smartwatch featuring heart rate monitoring, step tracking, GPS navigation, and 7-day battery life.",
    price: 149.50,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
    stock: 18,
    rating: 4.6,
    numReviews: 32,
  },
  {
    name: "Ergonomic Mechanical Keyboard",
    description: "Custom RGB backlit mechanical keyboard with tactile blue switches and durable aluminum frame.",
    price: 89.99,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80",
    stock: 30,
    rating: 4.7,
    numReviews: 64,
  },
  {
    name: "Classic Denim Jacket",
    description: "Timeless vintage denim jacket made with 100% premium cotton and classic brass buttons.",
    price: 79.99,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&auto=format&fit=crop&q=80",
    stock: 12,
    rating: 4.4,
    numReviews: 19,
  },
  {
    name: "Urban Running Sneakers",
    description: "Lightweight breathable mesh sneakers designed for max comfort and high-impact shock absorption.",
    price: 119.00,
    category: "Footwear",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80",
    stock: 20,
    rating: 4.9,
    numReviews: 85,
  },
  {
    name: "Stainless Steel Insulated Water Bottle",
    description: "Double-wall vacuum insulated flask that keeps drinks cold for 24 hours or hot for 12 hours.",
    price: 29.99,
    category: "Home & Living",
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80",
    stock: 45,
    rating: 4.5,
    numReviews: 27,
  },
  {
    name: "Polarized Aviator Sunglasses",
    description: "UV400 protection polarized sunglasses with lightweight titanium metal frame.",
    price: 49.99,
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&auto=format&fit=crop&q=80",
    stock: 15,
    rating: 4.3,
    numReviews: 14,
  },
  {
    name: "Waterproof Travel Backpack",
    description: "Spacious 35L laptop travel backpack with anti-theft hidden pockets and USB charging port.",
    price: 65.00,
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80",
    stock: 22,
    rating: 4.8,
    numReviews: 53,
  },
];

export const getProducts = async (req, res) => {
  try {
    const { category, search, sort } = req.query;

    let query = {};

    if (category && category !== "All") {
      query.category = category;
    }

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    let sortOption = { createdAt: -1 }; 
    if (sort === "price_asc") {
      sortOption = { price: 1 };
    } else if (sort === "price_desc") {
      sortOption = { price: -1 };
    } else if (sort === "rating") {
      sortOption = { rating: -1 };
    }

    const products = await Product.find(query).sort(sortOption);

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(500).json({ message: "Invalid product ID or product not found" });
  }
};

export const seedProducts = async (req, res) => {
  try {
    await Product.deleteMany({}); 
    const createdProducts = await Product.insertMany(SAMPLE_PRODUCTS);

    res.status(201).json({
      success: true,
      message: `${createdProducts.length} sample products seeded successfully!`,
      products: createdProducts,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
