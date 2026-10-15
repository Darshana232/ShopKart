
import { createContext, useContext, useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "./AuthContext";

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { customer } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = async () => {
    if (!customer) {
      setWishlist([]);
      return;
    }

    try {
      setLoading(true);
      const res = await axiosInstance.get("/wishlist");
      if (res.data.success) {
        setWishlist(res.data.wishlist);
      }
    } catch (err) {
      console.error("Error fetching wishlist:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [customer]);

  const isInWishlist = (productId) => {
    return wishlist.some((item) => {

      const id = item.product?._id || item.product;
      return id === productId;
    });
  };

  const addToWishlist = async (productId) => {
    if (!customer) return false;

    try {
      const res = await axiosInstance.post("/wishlist", { productId });
      if (res.data.success) {

        fetchWishlist();
        return true;
      }
    } catch (err) {
      console.error("Add to wishlist failed:", err);
      return false;
    }
  };

  const removeFromWishlist = async (productId) => {
    if (!customer) return false;

    try {
      const res = await axiosInstance.delete(`/wishlist/${productId}`);
      if (res.data.success) {
        setWishlist((prev) =>
          prev.filter((item) => {
            const id = item.product?._id || item.product;
            return id !== productId;
          })
        );
        return true;
      }
    } catch (err) {
      console.error("Remove from wishlist failed:", err);
      return false;
    }
  };

  const toggleWishlist = async (productId) => {
    if (isInWishlist(productId)) {
      return await removeFromWishlist(productId);
    } else {
      return await addToWishlist(productId);
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount: wishlist.length,
        loading,
        isInWishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        fetchWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};
