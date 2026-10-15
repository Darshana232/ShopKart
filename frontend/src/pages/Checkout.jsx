import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../api/axiosInstance";
import {
  ShieldCheck,
  CreditCard,
  Truck,
  ArrowLeft,
  AlertCircle,
  Loader2,
} from "lucide-react";

/**
 * Helper to dynamically load Razorpay's Standard Checkout script
 */
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      return resolve(true);
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Checkout = () => {
  const { cartItems, cartCount, cartSubtotal, clearCart } = useCart();
  const { customer } = useAuth();
  const navigate = useNavigate();

  // Shipping address form state
  const [formData, setFormData] = useState({
    fullName: customer?.fullName || "",
    phone: customer?.phone || "",
    addressLine1: "",
    city: "",
    state: "",
    pincode: "",
  });

  // Validation errors
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (!customer) {
      navigate("/login");
    }
  }, [customer, navigate]);

  // Form input change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field-level error on typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    setGeneralError("");
    setPaymentError("");
  };

  // Client-side validation function
  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = "Full name must be at least 2 characters";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else {
      const cleanPhone = formData.phone.trim().replace(/[\s-]/g, "");
      const phoneRegex = /^(\+91)?[6-9]\d{9}$/;
      if (!phoneRegex.test(cleanPhone)) {
        newErrors.phone = "Enter a valid 10-digit mobile number";
      }
    }

    if (!formData.addressLine1.trim()) {
      newErrors.addressLine1 = "Street address is required";
    } else if (formData.addressLine1.trim().length < 5) {
      newErrors.addressLine1 = "Address must be at least 5 characters";
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!formData.state.trim()) {
      newErrors.state = "State is required";
    }

    if (!formData.pincode.trim()) {
      newErrors.pincode = "Pincode is required";
    } else {
      const pincodeRegex = /^\d{6}$/;
      if (!pincodeRegex.test(formData.pincode.trim())) {
        newErrors.pincode = "Pincode must contain 6 digits";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Main checkout and payment initiation
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setGeneralError("");
    setPaymentError("");

    if (cartItems.length === 0) {
      setGeneralError("Your cart is empty. Add items before checking out.");
      return;
    }

    if (!validateForm()) {
      setGeneralError("Please fix the validation errors in the shipping form.");
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Create pending ShopKart order and Razorpay Order on backend
      const res = await axiosInstance.post("/orders/create-payment-order", {
        shippingAddress: {
          fullName: formData.fullName.trim(),
          phone: formData.phone.trim(),
          addressLine1: formData.addressLine1.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          pincode: formData.pincode.trim(),
        },
      });

      if (!res.data.success) {
        setGeneralError(res.data.message || "Failed to initialize order.");
        setIsProcessing(false);
        return;
      }

      const { shopKartOrderId, razorpayOrderId, amount, currency, key } = res.data;

      // 2. Load Razorpay Standard Checkout SDK
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setPaymentError(
          "Razorpay checkout SDK failed to load. Please check your internet connection."
        );
        setIsProcessing(false);
        return;
      }

      // Check if keys are placeholder
      const isPlaceholderKey = !key || key.includes("placeholder");

      // 3. Configure Razorpay Standard Checkout Options
      const options = {
        key: key,
        amount: amount,
        currency: currency || "INR",
        name: "ShopKart",
        description: `Order #${shopKartOrderId.slice(-6).toUpperCase()}`,
        order_id: razorpayOrderId,
        prefill: {
          name: formData.fullName,
          contact: formData.phone,
          email: customer?.email || "",
        },
        theme: {
          color: "#4f46e5",
        },
        // Callback handler invoked upon successful payment in Razorpay modal
        handler: async function (response) {
          // CRITICAL SECURITY RULE: Never trust browser. Send signature to backend!
          setIsVerifying(true);
          try {
            const verifyRes = await axiosInstance.post("/orders/verify-payment", {
              shopKartOrderId: shopKartOrderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.data.success) {
              // 1. Clear frontend global cart state
              clearCart();
              // 2. Navigate to Order Success page
              navigate(`/order-success/${shopKartOrderId}`);
            } else {
              setPaymentError(
                verifyRes.data.message ||
                  "Payment signature verification failed. Your cart was NOT cleared."
              );
            }
          } catch (verifyErr) {
            console.error("Verification error:", verifyErr);
            setPaymentError(
              verifyErr.response?.data?.message ||
                "Failed to verify payment signature on backend."
            );
          } finally {
            setIsVerifying(false);
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          },
        },
      };

      if (isPlaceholderKey) {
        setPaymentError(
          `Razorpay Test Mode credentials required: RAZORPAY_KEY_ID is currently "${key}". Please configure real Test Keys from your Razorpay Dashboard in backend/.env to complete test checkout.`
        );
        setIsProcessing(false);
        return;
      }

      // 4. Open Razorpay Checkout Modal
      const paymentObject = new window.Razorpay(options);

      paymentObject.on("payment.failed", function (failResponse) {
        console.error("Payment failed:", failResponse.error);
        setPaymentError(
          `Payment Failed: ${failResponse.error?.description || "Transaction was declined"}. Your cart has NOT been cleared.`
        );
        setIsProcessing(false);
      });

      paymentObject.open();
    } catch (error) {
      console.error("Order creation error:", error);
      const errMsg =
        error.response?.data?.message ||
        "An unexpected error occurred while initiating your order.";
      setGeneralError(errMsg);
      setIsProcessing(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="checkout-empty-container" style={{ maxWidth: "600px", margin: "4rem auto", padding: "2rem", textAlign: "center" }}>
        <AlertCircle size={48} style={{ color: "#f59e0b", marginBottom: "1rem" }} />
        <h2>Your Cart is Empty</h2>
        <p style={{ color: "#6b7280", margin: "1rem 0 1.5rem" }}>
          You need at least one item in your cart to proceed to checkout.
        </p>
        <Link to="/products" className="btn btn-primary">
          <ArrowLeft size={16} /> Explore Products
        </Link>
      </div>
    );
  }

  return (
    <div className="checkout-page-container" style={{ maxWidth: "1100px", margin: "0 auto", padding: "2rem 1.5rem" }}>
      {/* Breadcrumb / Back Navigation */}
      <div style={{ marginBottom: "1.5rem" }}>
        <Link to="/cart" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", color: "#6b7280", textDecoration: "none", fontSize: "0.95rem" }}>
          <ArrowLeft size={16} /> Back to Cart
        </Link>
      </div>

      <h1 style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "2rem" }}>
        <CreditCard size={32} /> Checkout & Payment
      </h1>

      {/* Error Alerts */}
      {generalError && (
        <div className="alert alert-danger" style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.75rem", background: "#fef2f2", color: "#991b1b", padding: "1rem", borderRadius: "8px", border: "1px solid #fecaca" }}>
          <AlertCircle size={20} />
          <span>{generalError}</span>
        </div>
      )}

      {paymentError && (
        <div className="alert alert-danger" style={{ marginBottom: "1.5rem", display: "flex", alignItems: "flex-start", gap: "0.75rem", background: "#fff1f2", color: "#be123c", padding: "1rem", borderRadius: "8px", border: "1px solid #fecdd3" }}>
          <AlertCircle size={20} style={{ flexShrink: 0, marginTop: "2px" }} />
          <div>
            <strong>Payment Notice:</strong>
            <p style={{ margin: "0.25rem 0 0" }}>{paymentError}</p>
          </div>
        </div>
      )}

      <div className="checkout-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "2rem" }}>
        {/* Left Column: Shipping Form */}
        <div className="shipping-form-card" style={{ background: "white", padding: "2rem", borderRadius: "12px", border: "1px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <h2 style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "1.25rem", marginBottom: "1.5rem" }}>
            <Truck size={22} style={{ color: "#4f46e5" }} /> Shipping Details
          </h2>

          <form onSubmit={handlePlaceOrder} noValidate>
            <div style={{ marginBottom: "1.25rem" }}>
              <label style={{ display: "block", marginBottom: "0.4rem", fontWeight: 500, fontSize: "0.9rem" }}>
                Full Name *
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="e.g. Aarav Sharma"
                className={`form-input ${errors.fullName ? "input-error" : ""}`}
                style={{ width: "100%", padding: "0.75rem", borderRadius: "6px", border: errors.fullName ? "1px solid #ef4444" : "1px solid #d1d5db" }}
              />
              {errors.fullName && (
                <span style={{ color: "#ef4444", fontSize: "0.8rem", marginTop: "0.25rem", display: "block" }}>
                  {errors.fullName}
                </span>
              )}
            </div>

            <div style={{ marginBottom: "1.25rem" }}>
              <label style={{ display: "block", marginBottom: "0.4rem", fontWeight: 500, fontSize: "0.9rem" }}>
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="10-digit mobile number"
                className={`form-input ${errors.phone ? "input-error" : ""}`}
                style={{ width: "100%", padding: "0.75rem", borderRadius: "6px", border: errors.phone ? "1px solid #ef4444" : "1px solid #d1d5db" }}
              />
              {errors.phone && (
                <span style={{ color: "#ef4444", fontSize: "0.8rem", marginTop: "0.25rem", display: "block" }}>
                  {errors.phone}
                </span>
              )}
            </div>

            <div style={{ marginBottom: "1.25rem" }}>
              <label style={{ display: "block", marginBottom: "0.4rem", fontWeight: 500, fontSize: "0.9rem" }}>
                Address Line 1 *
              </label>
              <input
                type="text"
                name="addressLine1"
                value={formData.addressLine1}
                onChange={handleChange}
                placeholder="House / Flat / Street address"
                className={`form-input ${errors.addressLine1 ? "input-error" : ""}`}
                style={{ width: "100%", padding: "0.75rem", borderRadius: "6px", border: errors.addressLine1 ? "1px solid #ef4444" : "1px solid #d1d5db" }}
              />
              {errors.addressLine1 && (
                <span style={{ color: "#ef4444", fontSize: "0.8rem", marginTop: "0.25rem", display: "block" }}>
                  {errors.addressLine1}
                </span>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.25rem" }}>
              <div>
                <label style={{ display: "block", marginBottom: "0.4rem", fontWeight: 500, fontSize: "0.9rem" }}>
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="e.g. Bengaluru"
                  className={`form-input ${errors.city ? "input-error" : ""}`}
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "6px", border: errors.city ? "1px solid #ef4444" : "1px solid #d1d5db" }}
                />
                {errors.city && (
                  <span style={{ color: "#ef4444", fontSize: "0.8rem", marginTop: "0.25rem", display: "block" }}>
                    {errors.city}
                  </span>
                )}
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "0.4rem", fontWeight: 500, fontSize: "0.9rem" }}>
                  State *
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="e.g. Karnataka"
                  className={`form-input ${errors.state ? "input-error" : ""}`}
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "6px", border: errors.state ? "1px solid #ef4444" : "1px solid #d1d5db" }}
                />
                {errors.state && (
                  <span style={{ color: "#ef4444", fontSize: "0.8rem", marginTop: "0.25rem", display: "block" }}>
                    {errors.state}
                  </span>
                )}
              </div>
            </div>

            <div style={{ marginBottom: "1.75rem" }}>
              <label style={{ display: "block", marginBottom: "0.4rem", fontWeight: 500, fontSize: "0.9rem" }}>
                Pincode *
              </label>
              <input
                type="text"
                name="pincode"
                maxLength={6}
                value={formData.pincode}
                onChange={handleChange}
                placeholder="6-digit postal code"
                className={`form-input ${errors.pincode ? "input-error" : ""}`}
                style={{ width: "100%", padding: "0.75rem", borderRadius: "6px", border: errors.pincode ? "1px solid #ef4444" : "1px solid #d1d5db" }}
              />
              {errors.pincode && (
                <span style={{ color: "#ef4444", fontSize: "0.8rem", marginTop: "0.25rem", display: "block" }}>
                  {errors.pincode}
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={isProcessing || isVerifying}
              className="btn btn-primary"
              style={{
                width: "100%",
                padding: "0.9rem",
                fontSize: "1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                opacity: isProcessing || isVerifying ? 0.7 : 1,
                cursor: isProcessing || isVerifying ? "not-allowed" : "pointer",
              }}
            >
              {isProcessing || isVerifying ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  {isVerifying ? "Verifying Payment Signature..." : "Preparing Razorpay Checkout..."}
                </>
              ) : (
                <>
                  <ShieldCheck size={18} />
                  Place Order & Pay ₹{cartSubtotal.toFixed(2)}
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Order Review Summary */}
        <div className="order-summary-card" style={{ background: "#f9fafb", padding: "2rem", borderRadius: "12px", border: "1px solid #e5e7eb", height: "fit-content" }}>
          <h2 style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>Order Summary</h2>
          <p style={{ color: "#6b7280", fontSize: "0.9rem", marginBottom: "1.25rem" }}>
            Review your {cartCount} {cartCount === 1 ? "item" : "items"} before payment.
          </p>

          <div className="summary-items-list" style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxHeight: "300px", overflowY: "auto", marginBottom: "1.25rem" }}>
            {cartItems.map((item) => (
              <div
                key={item.product?._id || item._id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "0.75rem",
                  paddingBottom: "0.75rem",
                  borderBottom: "1px solid #e5e7eb",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  {item.product?.image && (
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      style={{ width: "42px", height: "42px", objectFit: "cover", borderRadius: "6px" }}
                    />
                  )}
                  <div>
                    <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 600 }}>{item.product?.name}</h4>
                    <span style={{ fontSize: "0.85rem", color: "#6b7280" }}>
                      Qty: {item.quantity} × ₹{item.product?.price}
                    </span>
                  </div>
                </div>
                <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>
                  ₹{(item.product?.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", fontSize: "0.95rem" }}>
            <span style={{ color: "#6b7280" }}>Items Subtotal:</span>
            <span>₹{cartSubtotal.toFixed(2)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", fontSize: "0.95rem" }}>
            <span style={{ color: "#6b7280" }}>Standard Shipping:</span>
            <span style={{ color: "#059669", fontWeight: 500 }}>FREE</span>
          </div>

          <hr style={{ margin: "1rem 0", borderColor: "#e5e7eb" }} />

          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem", fontSize: "1.25rem", fontWeight: "bold" }}>
            <span>Total Payable:</span>
            <span style={{ color: "#4f46e5" }}>₹{cartSubtotal.toFixed(2)}</span>
          </div>

          <div style={{ background: "#eef2ff", border: "1px solid #c7d2fe", borderRadius: "8px", padding: "0.85rem", fontSize: "0.85rem", color: "#3730a3" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontWeight: 600, marginBottom: "0.25rem" }}>
              <ShieldCheck size={16} /> 100% Secure Checkout
            </div>
            Encrypted payment with Razorpay Test Mode. Key Secret is strictly protected on the backend.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
