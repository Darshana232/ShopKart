// frontend/src/components/Navbar.jsx
//
// WHAT:  Navigation header that dynamically updates based on customer authentication state.
//
// CONCEPTS DEMONSTRATED:
//   - Conditional rendering based on `customer` state from AuthContext
//   - Navigation using React Router's `Link` component (no full browser page reloads)

import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { ShoppingBag, User, LogOut, LogIn, UserPlus, Heart, ShoppingCart, Package } from "lucide-react";

const Navbar = () => {
  const { customer, logout } = useAuth();
  const { wishlistCount } = useWishlist();
  const { cartCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        <Link to="/" className="brand-logo">
          <ShoppingBag className="brand-icon" />
          <span>ShopKart</span>
        </Link>

        <nav className="nav-links">
          <Link to="/products" className="nav-item">
            <ShoppingBag size={18} />
            <span>Products</span>
          </Link>
          {customer ? (
            <>
              <Link to="/wishlist" className="nav-item nav-wishlist-badge">
                <Heart size={18} className={wishlistCount > 0 ? "heart-filled" : ""} />
                <span>Wishlist</span>
                {wishlistCount > 0 && <span className="nav-badge">{wishlistCount}</span>}
              </Link>
              <Link to="/cart" className="nav-item nav-wishlist-badge">
                <ShoppingCart size={18} />
                <span>Cart</span>
                {cartCount > 0 && <span className="nav-badge">{cartCount}</span>}
              </Link>
              <Link to="/orders" className="nav-item">
                <Package size={18} />
                <span>Orders</span>
              </Link>
              <Link to="/profile" className="nav-item">
                <User size={18} />
                <span>{customer.fullName}</span>
              </Link>
              <button onClick={handleLogout} className="btn btn-outline btn-sm">
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-item">
                <LogIn size={18} />
                <span>Login</span>
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                <UserPlus size={16} />
                <span>Register</span>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
