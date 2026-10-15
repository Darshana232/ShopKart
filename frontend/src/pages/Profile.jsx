
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { User, Mail, Phone, ShieldCheck, LogOut, IdCard } from "lucide-react";

const Profile = () => {
  const { customer, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <div className="avatar-circle">
            <User size={40} />
          </div>
          <h2>{customer?.fullName}</h2>
          <div className="badge badge-success">
            <ShieldCheck size={14} /> Authenticated Customer
          </div>
        </div>

        <div className="profile-details">
          <div className="detail-item">
            <div className="detail-icon">
              <Mail size={18} />
            </div>
            <div className="detail-content">
              <span className="detail-label">Email Address</span>
              <span className="detail-value">{customer?.email}</span>
            </div>
          </div>

          <div className="detail-item">
            <div className="detail-icon">
              <Phone size={18} />
            </div>
            <div className="detail-content">
              <span className="detail-label">Phone Number</span>
              <span className="detail-value">{customer?.phone}</span>
            </div>
          </div>

          <div className="detail-item">
            <div className="detail-icon">
              <IdCard size={18} />
            </div>
            <div className="detail-content">
              <span className="detail-label">Customer ID (MongoDB _id)</span>
              <span className="detail-value monospace">{customer?._id}</span>
            </div>
          </div>
        </div>

        <div className="profile-actions">
          <button onClick={handleLogout} className="btn btn-outline btn-full text-danger">
            <LogOut size={18} />
            <span>Logout of Account</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
