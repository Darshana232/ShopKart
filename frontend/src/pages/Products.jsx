
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { Search, Star, ArrowUpDown, Filter, Eye, Heart, ShoppingCart } from "lucide-react";

const CATEGORIES = ["All", "Electronics", "Fashion", "Footwear", "Home & Living", "Accessories"];

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const { customer } = useAuth();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart, actionLoading, cartItems } = useCart();
  const navigate = useNavigate();

  const getQuantityInCart = (productId) => {
    const item = cartItems.find((item) => item.product._id === productId);
    return item ? item.quantity : 0;
  };

  const handleWishlistClick = async (productId) => {
    if (!customer) {
      navigate("/login");
      return;
    }
    await toggleWishlist(productId);
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCategory !== "All") params.category = selectedCategory;
      if (searchTerm) params.search = searchTerm;
      if (sortBy !== "newest") params.sort = sortBy;

      const res = await axiosInstance.get("/products", { params });
      if (res.data.success) {
        setProducts(res.data.products);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {

    const timer = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(timer);
  }, [selectedCategory, searchTerm, sortBy]);

  return (
    <div className="catalog-container">
      {}
      <div className="catalog-header">
        <div>
          <h1>Explore Our <span className="text-gradient">Catalog</span></h1>
          <p>Discover high quality products with instant search and category filtering.</p>
        </div>

        {}
        <div className="search-box">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {}
      <div className="toolbar">
        {}
        <div className="category-pills">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`pill ${selectedCategory === cat ? "pill-active" : ""}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {}
        <div className="sort-wrapper">
          <ArrowUpDown size={16} className="sort-icon" />
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select">
            <option value="newest">Newest Arrivals</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
      </div>

      {}
      {loading ? (
        <div className="loading-container py-12">
          <div className="spinner"></div>
          <p>Loading products from MongoDB Atlas...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="empty-catalog">
          <Filter size={48} className="empty-icon" />
          <h3>No products match your criteria</h3>
          <p>Try searching for something else or reset your category filter.</p>
          <button
            onClick={() => {
              setSelectedCategory("All");
              setSearchTerm("");
              setSortBy("newest");
            }}
            className="btn btn-outline"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="products-grid">
          {products.map((product) => (
            <div key={product._id} className="product-card">
              <div className="product-image-container">
                <img src={product.image} alt={product.name} className="product-image" />
                <span className="category-badge">{product.category}</span>
                <button
                  onClick={() => handleWishlistClick(product._id)}
                  className={`wishlist-heart-btn ${isInWishlist(product._id) ? "active" : ""}`}
                  title={isInWishlist(product._id) ? "Remove from Wishlist" : "Add to Wishlist"}
                >
                  <Heart size={18} className={isInWishlist(product._id) ? "heart-filled" : ""} />
                </button>
              </div>

              <div className="product-card-body">
                <div className="product-rating">
                  <Star size={14} className="star-icon" />
                  <span>{product.rating}</span>
                  <span className="num-reviews">({product.numReviews})</span>
                </div>

                <h3 className="product-title">{product.name}</h3>
                <p className="product-desc">{product.description}</p>

                <div className="product-card-footer">
                  <div className="product-price">${product.price.toFixed(2)}</div>
                  <div className="product-actions">
                    <button
                      onClick={() => handleWishlistClick(product._id)}
                      className={`btn btn-sm ${isInWishlist(product._id) ? "btn-primary" : "btn-outline"}`}
                    >
                      <Heart size={14} className={isInWishlist(product._id) ? "heart-filled" : ""} />
                    </button>
                    <button 
                      onClick={() => addToCart(product._id)}
                      disabled={actionLoading === product._id || getQuantityInCart(product._id) >= product.stock}
                      className="btn btn-primary btn-sm"
                    >
                      <ShoppingCart size={14} /> 
                      {actionLoading === product._id ? "..." : "Add"}
                    </button>
                    <Link to={`/products/${product._id}`} className="btn btn-outline btn-sm">
                      <Eye size={16} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;
