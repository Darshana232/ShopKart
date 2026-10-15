import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import {
  ArrowLeft,
  MapPin,
  CreditCard,
  Calendar,
  CheckCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";

const STATUS_STEPS = ["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"];

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const { customer } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!customer) {
      navigate("/login");
      return;
    }

    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await axiosInstance.get(`/orders/${id}`);
        if (res.data.success) {
          setOrder(res.data.order);
        } else {
          setError(res.data.message || "Failed to load order");
        }
      } catch (err) {
        console.error("Error fetching single order:", err);
        setError(
          err.response?.data?.message ||
            "Unable to retrieve this order. Please verify you own this order."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrder();
    }
  }, [id, customer, navigate]);

  // Bonus demo helper: allows cycling order status progression
  const handleUpdateStatus = async (newStatus) => {
    try {
      setUpdatingStatus(true);
      const res = await axiosInstance.patch(`/orders/${id}/status`, {
        status: newStatus,
      });
      if (res.data.success) {
        setOrder(res.data.order);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update order status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container py-12" style={{ textAlign: "center", padding: "4rem 1rem" }}>
        <Loader2 size={36} className="animate-spin" style={{ margin: "0 auto 1rem", color: "#4f46e5" }} />
        <p style={{ color: "#6b7280" }}>Loading order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div style={{ maxWidth: "600px", margin: "4rem auto", padding: "2rem", textAlign: "center" }}>
        <AlertCircle size={48} style={{ color: "#ef4444", margin: "0 auto 1rem" }} />
        <h2>Order Not Accessible</h2>
        <p style={{ color: "#6b7280", margin: "1rem 0 1.5rem" }}>{error}</p>
        <Link to="/orders" className="btn btn-primary">
          <ArrowLeft size={16} /> Back to My Orders
        </Link>
      </div>
    );
  }

  const currentStepIndex = STATUS_STEPS.indexOf(order.status);
  const formattedDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="order-details-container" style={{ maxWidth: "900px", margin: "0 auto", padding: "2rem 1.5rem" }}>
      {/* Top Navigation */}
      <div style={{ marginBottom: "1.5rem" }}>
        <Link
          to="/orders"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            color: "#6b7280",
            textDecoration: "none",
            fontSize: "0.95rem",
          }}
        >
          <ArrowLeft size={16} /> Back to All Orders
        </Link>
      </div>

      {/* Header Info */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        <div>
          <h1 style={{ margin: "0 0 0.4rem", fontSize: "1.75rem" }}>
            Order #{order._id.slice(-8).toUpperCase()}
          </h1>
          <span style={{ color: "#6b7280", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
            <Calendar size={14} /> Placed on {formattedDate}
          </span>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <span
            style={{
              padding: "0.35rem 0.85rem",
              borderRadius: "999px",
              fontWeight: 600,
              fontSize: "0.85rem",
              background: order.paymentStatus === "PAID" ? "#dcfce7" : "#fee2e2",
              color: order.paymentStatus === "PAID" ? "#166534" : "#991b1b",
              border: order.paymentStatus === "PAID" ? "1px solid #bbf7d0" : "1px solid #fecaca",
            }}
          >
            Payment: {order.paymentStatus}
          </span>
          <span
            style={{
              padding: "0.35rem 0.85rem",
              borderRadius: "999px",
              fontWeight: 600,
              fontSize: "0.85rem",
              background: "#e0e7ff",
              color: "#3730a3",
              border: "1px solid #c7d2fe",
            }}
          >
            Fulfillment: {order.status}
          </span>
        </div>
      </div>

      {/* Order Progress Stepper */}
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          border: "1px solid #e5e7eb",
          padding: "2rem",
          marginBottom: "2rem",
        }}
      >
        <h3 style={{ margin: "0 0 1.5rem", fontSize: "1.1rem" }}>Order Status Timeline</h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${STATUS_STEPS.length}, 1fr)`,
            position: "relative",
            gap: "0.5rem",
          }}
        >
          {STATUS_STEPS.map((step, idx) => {
            const isCompleted = idx <= currentStepIndex;
            const isCurrent = idx === currentStepIndex;

            return (
              <div key={step} style={{ textAlign: "center" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background: isCompleted ? "#4f46e5" : "#f3f4f6",
                    color: isCompleted ? "white" : "#9ca3af",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 0.5rem",
                    border: isCurrent ? "3px solid #c7d2fe" : "none",
                    fontWeight: 600,
                  }}
                >
                  {isCompleted ? <CheckCircle size={18} /> : idx + 1}
                </div>
                <span
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: isCompleted ? 600 : 400,
                    color: isCompleted ? "#111827" : "#9ca3af",
                  }}
                >
                  {step}
                </span>
              </div>
            );
          })}
        </div>

        {/* Bonus Challenge: Status update test controls */}
        <div
          style={{
            marginTop: "1.5rem",
            paddingTop: "1.25rem",
            borderTop: "1px dashed #e5e7eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "0.75rem",
          }}
        >
          <span style={{ fontSize: "0.85rem", color: "#6b7280" }}>
            ⭐ <strong>Bonus Feature:</strong> Simulate lifecycle progression:
          </span>
          <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
            {STATUS_STEPS.map((step) => (
              <button
                key={step}
                disabled={updatingStatus || order.status === step}
                onClick={() => handleUpdateStatus(step)}
                className="btn btn-outline btn-sm"
                style={{
                  fontSize: "0.75rem",
                  padding: "0.25rem 0.5rem",
                  background: order.status === step ? "#e0e7ff" : "white",
                  borderColor: order.status === step ? "#6366f1" : "#d1d5db",
                }}
              >
                Mark {step}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
        {/* Shipping Address */}
        <div
          style={{
            background: "white",
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
            padding: "1.5rem",
          }}
        >
          <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "1.1rem", margin: "0 0 1rem" }}>
            <MapPin size={18} style={{ color: "#4f46e5" }} /> Shipping Address
          </h3>
          <p style={{ margin: 0, lineHeight: 1.6, color: "#374151" }}>
            <strong>{order.shippingAddress?.fullName}</strong>
            <br />
            Phone: {order.shippingAddress?.phone}
            <br />
            {order.shippingAddress?.addressLine1}
            <br />
            {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
          </p>
        </div>

        {/* Payment & Security Details */}
        <div
          style={{
            background: "white",
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
            padding: "1.5rem",
          }}
        >
          <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "1.1rem", margin: "0 0 1rem" }}>
            <CreditCard size={18} style={{ color: "#4f46e5" }} /> Payment Details
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.9rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#6b7280" }}>Method:</span>
              <span style={{ fontWeight: 500 }}>Razorpay Standard Checkout</span>
            </div>
            {order.razorpayOrderId && (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#6b7280" }}>Razorpay Order ID:</span>
                <span style={{ fontFamily: "monospace", fontSize: "0.85rem" }}>{order.razorpayOrderId}</span>
              </div>
            )}
            {order.razorpayPaymentId && (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#6b7280" }}>Payment Reference:</span>
                <span style={{ fontFamily: "monospace", fontSize: "0.85rem" }}>{order.razorpayPaymentId}</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#6b7280" }}>Verification:</span>
              <span style={{ color: "#059669", fontWeight: 600 }}>HMAC SHA-256 Verified</span>
            </div>
          </div>
        </div>
      </div>

      {/* Itemized Snapshot Breakdown */}
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          border: "1px solid #e5e7eb",
          padding: "1.5rem",
          marginBottom: "2rem",
        }}
      >
        <h3 style={{ margin: "0 0 1.25rem", fontSize: "1.1rem" }}>
          Items in this Order ({order.items.length})
        </h3>
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
                    style={{ width: "56px", height: "56px", objectFit: "cover", borderRadius: "8px" }}
                  />
                )}
                <div>
                  <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: 600 }}>{item.name}</h4>
                  <span style={{ fontSize: "0.85rem", color: "#6b7280" }}>
                    Snapshot Price: ₹{item.price} × {item.quantity}
                  </span>
                </div>
              </div>
              <span style={{ fontWeight: 600, fontSize: "1rem" }}>
                ₹{(item.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        <hr style={{ margin: "1.5rem 0", borderColor: "#e5e7eb" }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "1.2rem", fontWeight: "bold" }}>Total Amount:</span>
          <span style={{ fontSize: "1.4rem", fontWeight: "bold", color: "#4f46e5" }}>
            ₹{order.totalAmount.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
