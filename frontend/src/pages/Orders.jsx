import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import {
  Package,
  ChevronRight,
  ShoppingBag,
  Loader2,
  AlertCircle,
} from "lucide-react";

const getStatusBadgeStyle = (status) => {
  switch (status) {
    case "DELIVERED":
      return { background: "#dcfce7", color: "#166534", border: "1px solid #bbf7d0" };
    case "SHIPPED":
      return { background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a" };
    case "CONFIRMED":
      return { background: "#e0e7ff", color: "#3730a3", border: "1px solid #c7d2fe" };
    case "PLACED":
      return { background: "#e0f2fe", color: "#0369a1", border: "1px solid #bae6fd" };
    case "CANCELLED":
      return { background: "#fee2e2", color: "#991b1b", border: "1px solid #fecaca" };
    default:
      return { background: "#f3f4f6", color: "#374151", border: "1px solid #e5e7eb" };
  }
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { customer } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!customer) {
      navigate("/login");
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await axiosInstance.get("/orders");
        if (res.data.success) {
          setOrders(res.data.orders);
        } else {
          setError(res.data.message || "Failed to load orders");
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError(err.response?.data?.message || "Could not retrieve your orders.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [customer, navigate]);

  if (loading) {
    return (
      <div className="loading-container py-12" style={{ textAlign: "center", padding: "4rem 1rem" }}>
        <Loader2 size={36} className="animate-spin" style={{ margin: "0 auto 1rem", color: "#4f46e5" }} />
        <p style={{ color: "#6b7280" }}>Loading your orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: "600px", margin: "4rem auto", padding: "2rem", textAlign: "center" }}>
        <AlertCircle size={48} style={{ color: "#ef4444", margin: "0 auto 1rem" }} />
        <h2>Unable to Load Orders</h2>
        <p style={{ color: "#6b7280", margin: "1rem 0 1.5rem" }}>{error}</p>
        <button onClick={() => window.location.reload()} className="btn btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="orders-page-container" style={{ maxWidth: "900px", margin: "0 auto", padding: "2rem 1.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <h1 style={{ display: "flex", alignItems: "center", gap: "0.6rem", margin: 0, fontSize: "1.75rem" }}>
          <Package size={28} /> My Orders
        </h1>
        <span style={{ color: "#6b7280", fontSize: "0.95rem" }}>
          {orders.length} {orders.length === 1 ? "order" : "orders"} placed
        </span>
      </div>

      {orders.length === 0 ? (
        <div
          className="empty-orders-state"
          style={{
            background: "white",
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
            padding: "4rem 2rem",
            textAlign: "center",
          }}
        >
          <ShoppingBag size={54} style={{ color: "#9ca3af", margin: "0 auto 1.25rem", opacity: 0.6 }} />
          <h3 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>You have not placed any orders yet</h3>
          <p style={{ color: "#6b7280", marginBottom: "1.5rem", maxWidth: "400px", margin: "0 auto 1.5rem" }}>
            Explore our curated catalog and place your first order today!
          </p>
          <Link to="/products" className="btn btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
            <ShoppingBag size={16} /> Start Shopping
          </Link>
        </div>
      ) : (
        <div className="orders-list" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {orders.map((order) => {
            const formattedDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });

            return (
              <div
                key={order._id}
                className="order-card"
                style={{
                  background: "white",
                  borderRadius: "12px",
                  border: "1px solid #e5e7eb",
                  overflow: "hidden",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                  transition: "transform 0.15s ease, box-shadow 0.15s ease",
                }}
              >
                {/* Order Card Header */}
                <div
                  style={{
                    background: "#f9fafb",
                    padding: "1rem 1.5rem",
                    borderBottom: "1px solid #e5e7eb",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "0.75rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
                    <div>
                      <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "#6b7280", fontWeight: 600, display: "block" }}>
                        Order Placed
                      </span>
                      <span style={{ fontSize: "0.9rem", color: "#111827", fontWeight: 500 }}>
                        {formattedDate}
                      </span>
                    </div>

                    <div>
                      <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "#6b7280", fontWeight: 600, display: "block" }}>
                        Total Amount
                      </span>
                      <span style={{ fontSize: "0.9rem", color: "#111827", fontWeight: 700 }}>
                        ₹{order.totalAmount.toFixed(2)}
                      </span>
                    </div>

                    <div>
                      <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "#6b7280", fontWeight: 600, display: "block" }}>
                        Order #
                      </span>
                      <span style={{ fontSize: "0.9rem", color: "#4f46e5", fontWeight: 600 }}>
                        {order._id.slice(-8).toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span
                      style={{
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        padding: "0.25rem 0.65rem",
                        borderRadius: "999px",
                        ...getStatusBadgeStyle(order.status),
                      }}
                    >
                      {order.status}
                    </span>
                    <span
                      style={{
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        padding: "0.25rem 0.65rem",
                        borderRadius: "999px",
                        background: order.paymentStatus === "PAID" ? "#dcfce7" : "#fee2e2",
                        color: order.paymentStatus === "PAID" ? "#15803d" : "#b91c1c",
                        border: order.paymentStatus === "PAID" ? "1px solid #bbf7d0" : "1px solid #fecaca",
                      }}
                    >
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* Order Items Preview */}
                <div style={{ padding: "1.5rem" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.25rem" }}>
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "1rem",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              style={{ width: "48px", height: "48px", objectFit: "cover", borderRadius: "8px" }}
                            />
                          ) : (
                            <div
                              style={{
                                width: "48px",
                                height: "48px",
                                background: "#f3f4f6",
                                borderRadius: "8px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <Package size={20} color="#9ca3af" />
                            </div>
                          )}
                          <div>
                            <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 600 }}>{item.name}</h4>
                            <span style={{ fontSize: "0.85rem", color: "#6b7280" }}>
                              Qty: {item.quantity} × ₹{item.price}
                            </span>
                          </div>
                        </div>
                        <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Actions footer */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      paddingTop: "1rem",
                      borderTop: "1px solid #f3f4f6",
                      flexWrap: "wrap",
                      gap: "0.75rem",
                    }}
                  >
                    <span style={{ fontSize: "0.85rem", color: "#6b7280" }}>
                      Delivering to: <strong>{order.shippingAddress?.fullName}</strong> ({order.shippingAddress?.city})
                    </span>

                    <Link
                      to={`/orders/${order._id}`}
                      className="btn btn-outline btn-sm"
                      style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}
                    >
                      View Details <ChevronRight size={14} />
                    </Link>
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

export default Orders;
