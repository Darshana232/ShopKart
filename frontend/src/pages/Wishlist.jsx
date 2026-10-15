
import { useWishlist } from "../context/WishlistContext";
import { Link } from "react-router-dom";
import { Heart, Trash2, Eye, ShoppingBag, ArrowRight } from "lucide-react";

const Wishlist = () => {
  const { wishlist, loading, removeFromWishlist } = useWishlist();

  if (loading) {
    return (
      <div className="loading-container py-12">
        <div className="spinner"></div>
        <p>Loading your saved wishlist...</p>
      </div>
    );
  }

  return (
    <div className="wishlist-page-container">
      <div className="wishlist-header">
        <div>
          <h1>My Saved <span className="text-gradient">Wishlist</span></h1>
          <p>Manage your favorite products and save them for later purchase.</p>
        </div>
        <div className="wishlist-count-badge">
          <Heart size={18} className="heart-filled" />
          <span>{wishlist.length} Items Saved</span>
        </div>
      </div>

      {wishlist.length === 0 ? (
        <div className="empty-catalog py-12">
          <div className="empty-heart-icon">
            <Heart size={48} />
          </div>
          <h3>Your Wishlist is Empty</h3>
          <p>Explore our product catalog and click the heart icon on any product to save it here!</p>
          <Link to="/products" className="btn btn-primary mt-4">
            Browse Catalog <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="products-grid">
          {wishlist.map((item) => {
            const product = item.product;
            if (!product) return null; 

            return (
              <div key={item._id} className="product-card">
                <div className="product-image-container">
                  <img src={product.image} alt={product.name} className="product-image" />
                  <span className="category-badge">{product.category}</span>
                  <button
                    onClick={() => removeFromWishlist(product._id)}
                    className="icon-btn-danger remove-wishlist-btn"
                    title="Remove from Wishlist"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="product-card-body">
                  <h3 className="product-title">{product.name}</h3>
                  <p className="product-desc">{product.description}</p>

                  <div className="product-card-footer">
                    <div className="product-price">${product.price.toFixed(2)}</div>
                    <div className="product-actions">
                      <Link to={`/products/${product._id}`} className="btn btn-outline btn-sm">
                        <Eye size={16} /> Details
                      </Link>
                      <button
                        onClick={() => removeFromWishlist(product._id)}
                        className="btn btn-outline btn-sm text-danger"
                      >
                        <Trash2 size={14} /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
