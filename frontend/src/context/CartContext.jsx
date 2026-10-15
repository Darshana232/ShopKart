import { createContext, useContext, useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null); // stores productId currently being modified
  const { customer } = useAuth();

  const fetchCart = async () => {
    if (!customer) {
      setCartItems([]);
      return;
    }
    setLoading(true);
    try {
      const res = await axiosInstance.get("/cart");
      if (res.data.success) {
        setCartItems(res.data.cart);
      }
    } catch (error) {
      console.error("Failed to fetch cart", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [customer]);

  const addToCart = async (productId) => {
    setActionLoading(productId);
    try {
      const res = await axiosInstance.post(`/cart/${productId}`);
      if (res.data.success) {
        setCartItems(res.data.cart);
        return { success: true };
      }
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to add to cart";
      return { success: false, message: msg };
    } finally {
      setActionLoading(null);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    setActionLoading(productId);
    try {
      const res = await axiosInstance.patch(`/cart/${productId}`, { quantity });
      if (res.data.success) {
        setCartItems(res.data.cart);
        return { success: true };
      }
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to update quantity";
      return { success: false, message: msg };
    } finally {
      setActionLoading(null);
    }
  };

  const removeFromCart = async (productId) => {
    setActionLoading(productId);
    try {
      const res = await axiosInstance.delete(`/cart/${productId}`);
      if (res.data.success) {
        setCartItems(res.data.cart);
        return { success: true };
      }
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to remove item";
      return { success: false, message: msg };
    } finally {
      setActionLoading(null);
    }
  };

  const clearCart = () => {
    setCartItems([]);
  };

  // Derived state
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const cartSubtotal = cartItems.reduce(
    (total, item) => total + (item.product?.price || 0) * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        loading,
        actionLoading,
        cartCount,
        cartSubtotal,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
