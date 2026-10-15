
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { ArrowLeft, Star, Package, ShieldCheck, Tag, Heart, ShoppingCart } from "lucide-react";

const ProductDetail = () => {
  const { id } = useParams(); 
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { customer } = useAuth();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart, actionLoading, cartItems } = useCart();
  const navigate = useNavigate();

  const quantityInCart = product ? cartItems.find((item) => item.product._id === product._id)?.quantity || 0 : 0;


  const handleWishlistToggle = async () => {
    if (!customer) {
      navigate("/login");
      return;
    }
    await toggleWishlist(product._id);
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get(`/products/${id}`);
        if (res.data.success) {
          setProduct(res.data.product);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load product details.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="loading-container py-12">
        <div className="spinner"></div>
        <p>Loading product details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="empty-catalog py-12">
        <h3>Product Not Found</h3>
        <p>{error || "The requested product does not exist."}</p>
        <Link to="/products" className="btn btn-primary">
          <ArrowLeft size={16} /> Back to Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="detail-page-container">
      <Link to="/products" className="back-link">
        <ArrowLeft size={18} /> Back to Products
      </Link>

      <div className="product-detail-card">
        {}
        <div className="detail-image-wrapper">
          <img src={product.image} alt={product.name} className="detail-image" />
        </div>

        {}
        <div className="detail-info">
          <div className="detail-category-badge">
            <Tag size={14} /> {product.category}
          </div>

          <h1 className="detail-title">{product.name}</h1>

          <div className="detail-rating-row">
            <div className="rating-pill">
              <Star size={16} className="star-icon" />
              <span>{product.rating}</span>
            </div>
            <span className="reviews-count">based on {product.numReviews} customer reviews</span>
          </div>

          <div className="detail-price-row">
            <span className="price-tag">${product.price.toFixed(2)}</span>
            <span className="stock-badge">
              <Package size={14} /> In Stock ({product.stock} units)
            </span>
          </div>

          <hr className="divider" />

          <div className="detail-description">
            <h3>Description</h3>
            <p>{product.description}</p>
          </div>

          <div className="detail-actions" style={{ display: "flex", gap: "1rem" }}>
            <button
              onClick={() => addToCart(product._id)}
              disabled={actionLoading === product._id || quantityInCart >= product.stock}
              className="btn btn-lg btn-primary btn-full"
            >
              <ShoppingCart size={20} />
              {actionLoading === product._id ? "Adding..." : (quantityInCart >= product.stock ? "Max Stock Reached" : "Add to Cart")}
            </button>
            <button
              onClick={handleWishlistToggle}
              className={`btn btn-lg ${isInWishlist(product._id) ? "btn-primary" : "btn-outline"} btn-full`}
            >
              <Heart size={20} className={isInWishlist(product._id) ? "heart-filled" : ""} />
              {isInWishlist(product._id) ? "Saved" : "Save"}
            </button>
          </div>

          <div className="detail-guarantees">
            <div className="guarantee-item">
              <ShieldCheck size={18} className="guarantee-icon" />
              <span>Genuine Product & 1-Year Warranty</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
