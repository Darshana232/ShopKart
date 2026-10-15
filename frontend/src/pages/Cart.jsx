import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import CartItem from "../components/CartItem";
import { ShoppingCart, ArrowLeft } from "lucide-react";

const Cart = () => {
  const { cartItems, loading, cartSubtotal, cartCount } = useCart();
  const { customer } = useAuth();
  const navigate = useNavigate();

  if (!customer) {
    navigate("/login");
    return null;
  }

  if (loading && cartItems.length === 0) {
    return (
      <div className="loading-container py-12">
        <div className="spinner"></div>
        <p>Loading your cart...</p>
      </div>
    );
  }

  return (
    <div className="cart-page-container" style={{ maxWidth: "1000px", margin: "0 auto", padding: "2rem" }}>
      <h1 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <ShoppingCart /> Your Cart
      </h1>
      
      {cartItems.length === 0 ? (
        <div className="empty-catalog py-12" style={{ textAlign: "center", marginTop: "3rem" }}>
          <ShoppingCart size={48} className="empty-icon" style={{ opacity: 0.5, marginBottom: "1rem" }} />
          <h3>Your cart is empty</h3>
          <p>Looks like you haven't added anything to your cart yet.</p>
          <Link to="/products" className="btn btn-primary" style={{ marginTop: "1rem" }}>
            <ArrowLeft size={16} /> Start Shopping
          </Link>
        </div>
      ) : (
        <div className="cart-content" style={{ display: "flex", gap: "2rem", marginTop: "2rem", flexWrap: "wrap" }}>
          <div className="cart-items-list" style={{ flex: "1 1 60%", display: "flex", flexDirection: "column", gap: "1rem" }}>
            {cartItems.map(item => (
              <CartItem key={item.product._id} item={item} />
            ))}
          </div>
          
          <div className="cart-summary" style={{ flex: "1 1 30%", background: "#f8f9fa", padding: "1.5rem", borderRadius: "8px", height: "fit-content" }}>
            <h3>Order Summary</h3>
            <hr style={{ margin: "1rem 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <span>Items:</span>
              <span>{cartCount}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem", fontSize: "1.2rem", fontWeight: "bold" }}>
              <span>Subtotal:</span>
              <span>${cartSubtotal.toFixed(2)}</span>
            </div>
            <button 
              onClick={() => navigate("/checkout")} 
              className="btn btn-primary btn-full" 
              style={{ width: "100%" }}
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
