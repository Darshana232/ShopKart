
import { createContext, useContext, useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null);

  const checkAuth = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/customers/me");
      if (res.data.success) {
        setCustomer(res.data.customer);
      }
    } catch (err) {

      setCustomer(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      const res = await axiosInstance.post("/customers/login", { email, password });
      if (res.data.success) {
        setCustomer(res.data.customer);
        return { success: true, message: res.data.message };
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed";
      setError(msg);
      return { success: false, message: msg };
    }
  };

  const register = async (fullName, email, password, phone) => {
    setError(null);
    try {
      const res = await axiosInstance.post("/customers/register", {
        fullName,
        email,
        password,
        phone,
      });
      if (res.data.success) {
        return { success: true, message: res.data.message };
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed";
      setError(msg);
      return { success: false, message: msg };
    }
  };

  const logout = async () => {
    try {
      await axiosInstance.post("/customers/logout");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setCustomer(null); 
    }
  };

  return (
    <AuthContext.Provider
      value={{
        customer,
        loading,
        error,
        setError,
        login,
        register,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
