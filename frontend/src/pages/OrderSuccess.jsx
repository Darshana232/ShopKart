import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import {
  CheckCircle2,
  Package,
  ShoppingBag,
  ArrowRight,
  MapPin,
  CreditCard,
  Calendar,
  Loader2,
  AlertCircle,
} from "lucide-react";

const OrderSuccess = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get(`/orders/${id}`);
        if (res.data.success) {
          setOrder(res.data.order);
        } else {
          setError(res.data.message || "Failed to load order confirmation");
        }
      } catch (err) {
        console.error("Error fetching order confirmation:", err);
        setError(
          err.response?.data?.message || "Could not retrieve order details."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrder();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="loading-container py-12" style={{ textAlign: "center", padding: "4rem 1rem" }}>
        <Loader2 size={36} className="animate-spin" style={{ margin: "0 auto 1rem", color: "#4f46e5" }} />
        <p style={{ color: "#6b7280" }}>Retrieving your order confirmation...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div style={{ maxWidth: "600px", margin: "4rem auto", padding: "2rem", textAlign: "center" }}>
        <AlertCircle size={48} style={{ color: "#ef4444", margin: "0 auto 1rem" }} />
        <h2>Order Confirmation Not Found</h2>
        <p style={{ color: "#6b7280", margin: "1rem 0 1.5rem" }}>
          {error || "Unable to display this order confirmation."}
        </p>
        <Link to="/orders" className="btn btn-primary">
          View My Orders
        </Link>
      </div>
    );
  }

  const formattedDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="order-success-container" style={{ maxWidth: "800px", margin: "0 auto", padding: "2.5rem 1.5rem" }}>
      {/* Header Banner */}
      <div
        className="success-header"
        style={{
          background: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)",
          border: "1px solid #a7f3d0",
          borderRadius: "16px",
          padding: "2.5rem 2rem",
          textAlign: "center",
          marginBottom: "2rem",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "68px",
            height: "68px",
            borderRadius: "50%",
            background: "#10b981",
            color: "white",
            marginBottom: "1rem",
            boxShadow: "0 4px 14px rgba(16, 185, 129, 0.4)",
          }}
        >
          <CheckCircle2 size={40} />
        </div>
        <h1 style={{ color: "#065f46", fontSize: "1.85rem", margin: "0 0 0.5rem" }}>
          Order Placed Successfully!
        </h1>
        <p style={{ color: "#047857", fontSize: "1rem", margin: 0 }}>
          Thank you for shopping with ShopKart. Your payment has been verified.
        </p>
      </div>

      {/* Order Meta Card */}
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          border: "1px solid #e5e7eb",
          padding: "1.5rem",
          marginBottom: "1.5rem",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "1.25rem",
        }}
      >
        <div>
          <span style={{ fontSize: "0.85rem", color: "#6b7280", display: "flex", alignItems: "center", gap: "0.3rem" }}>
            <Package size={14} /> Order Reference
          </span>
          <strong style={{ fontSize: "1rem", color: "#111827", display: "block", marginTop: "0.25rem" }}>
            #{order._id.slice(-8).toUpperCase()}
          </strong>
        </div>

        <div>
          <span style={{ fontSize: "0.85rem", color: "#6b7280", display: "flex", alignItems: "center", gap: "0.3rem" }}>
            <Calendar size={14} /> Order Date
          </span>
          <strong style={{ fontSize: "0.95rem", color: "#111827", display: "block", marginTop: "0.25rem" }}>
            {formattedDate}
          </strong>
        </div>

        <div>
          <span style={{ fontSize: "0.85rem", color: "#6b7280", display: "flex", alignItems: "center", gap: "0.3rem" }}>
            <CreditCard size={14} /> Payment Status
          </span>
          <span
            style={{
              display: "inline-block",
              marginTop: "0.25rem",
              background: "#dcfce7",
              color: "#15803d",
              fontWeight: 600,
              fontSize: "0.85rem",
              padding: "0.2rem 0.6rem",
              borderRadius: "999px",
            }}
          >
            {order.paymentStatus}
          </span>
        </div>

        <div>
          <span style={{ fontSize: "0.85rem", color: "#6b7280" }}>Fulfillment Status</span>
          <span
            style={{
              display: "inline-block",
              marginTop: "0.25rem",
              background: "#e0e7ff",
              color: "#4338ca",
              fontWeight: 600,
              fontSize: "0.85rem",
              padding: "0.2rem 0.6rem",
              borderRadius: "999px",
            }}
          >
            {order.status}
          </span>
        </div>
      </div>

      {/* Items Snapshot Breakdown */}
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          border: "1px solid #e5e7eb",
          padding: "1.5rem",
          marginBottom: "1.5rem",
        }}
      >
        <h3 style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>Purchased Items (Price Snapshot)</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {order.items.map((item, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingBottom: "1rem",
                borderBottom: idx < order.items.length - 1 ? "1px solid #f3f4f6" : "none",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.name}
                    style={{ width: "52px", height: "52px", objectFit: "cover", borderRadius: "8px" }}
                  />
                )}
                <div>
                  <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: 600 }}>{item.name}</h4>
                  <span style={{ fontSize: "0.85rem", color: "#6b7280" }}>
                    Qty: {item.quantity} × ₹{item.price}
                  </span>
                </div>
              </div>
              <div style={{ fontWeight: 600, fontSize: "1rem" }}>
                ₹{(item.price * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        <hr style={{ margin: "1.25rem 0", borderColor: "#f3f4f6" }} />

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.2rem", fontWeight: "bold" }}>
          <span>Total Paid:</span>
          <span style={{ color: "#4f46e5" }}>₹{order.totalAmount.toFixed(2)}</span>
        </div>
      </div>

      {/* Shipping Details Snapshot */}
      {order.shippingAddress && (
        <div
          style={{
            background: "white",
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
            padding: "1.5rem",
            marginBottom: "2rem",
          }}
        >
          <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "1.1rem", marginBottom: "0.75rem" }}>
            <MapPin size={18} style={{ color: "#4f46e5" }} /> Delivery Destination
          </h3>
          <p style={{ margin: 0, lineHeight: 1.6, color: "#374151" }}>
            <strong>{order.shippingAddress.fullName}</strong> ({order.shippingAddress.phone})
            <br />
            {order.shippingAddress.addressLine1}
            <br />
            {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
          </p>
        </div>
      )}

      {/* Navigation Buttons */}
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
        <Link to="/orders" className="btn btn-outline" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
          <Package size={16} /> View My Orders
        </Link>
        <Link to="/products" className="btn btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
          <ShoppingBag size={16} /> Continue Shopping <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccess;
