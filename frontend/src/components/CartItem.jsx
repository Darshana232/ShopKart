import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { Minus, Plus, Trash2 } from "lucide-react";

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart, actionLoading } = useCart();
  const { product, quantity } = item;
  
  const isUpdating = actionLoading === product._id;

  const handleIncrease = () => {
    if (quantity < product.stock) {
      updateQuantity(product._id, quantity + 1);
    }
  };

  const handleDecrease = () => {
    if (quantity > 1) {
      updateQuantity(product._id, quantity - 1);
    }
  };

  const handleRemove = () => {
    removeFromCart(product._id);
  };

  return (
    <div className={`cart-item ${isUpdating ? "opacity-50" : ""}`}>
      <img src={product.image} alt={product.name} className="cart-img" style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "8px" }} />
      <div className="cart-item-details" style={{ flex: 1, padding: "0 1rem" }}>
        <Link to={`/products/${product._id}`}>
          <h4 style={{ margin: "0 0 0.5rem 0", color: "#333" }}>{product.name}</h4>
        </Link>
        <p style={{ margin: 0, fontWeight: "bold" }}>${product.price.toFixed(2)}</p>
        {product.stock < 5 && <small style={{ color: "red" }}>Only {product.stock} left in stock</small>}
      </div>
      
      <div className="cart-item-controls" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <button 
          onClick={handleDecrease} 
          disabled={quantity <= 1 || isUpdating}
          className="btn btn-outline btn-sm"
        >
          <Minus size={14} />
        </button>
        <span style={{ width: "2rem", textAlign: "center", fontWeight: "bold" }}>{quantity}</span>
        <button 
          onClick={handleIncrease} 
          disabled={quantity >= product.stock || isUpdating}
          className="btn btn-outline btn-sm"
        >
          <Plus size={14} />
        </button>
      </div>

      <div className="cart-item-price" style={{ minWidth: "80px", textAlign: "right", fontWeight: "bold" }}>
        ${(product.price * quantity).toFixed(2)}
      </div>

      <button onClick={handleRemove} disabled={isUpdating} className="btn btn-sm" style={{ color: "red", background: "none", border: "none" }}>
        <Trash2 size={18} />
      </button>
    </div>
  );
};

export default CartItem;
