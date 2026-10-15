
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { UserPlus, User, Mail, Lock, Phone, AlertCircle, CheckCircle2 } from "lucide-react";

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setSubmitting(true);
    const result = await register(
      formData.fullName,
      formData.email,
      formData.password,
      formData.phone
    );
    setSubmitting(false);

    if (result.success) {
      setSuccessMsg("Account created successfully! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="auth-card-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon-wrapper">
            <UserPlus className="auth-icon" />
          </div>
          <h2>Create Account</h2>
          <p>Join ShopKart to start shopping & managing your wishlist</p>
        </div>

        {error && (
          <div className="alert alert-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="alert alert-success">
            <CheckCircle2 size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <div className="input-wrapper">
              <User className="input-icon" size={18} />
              <input
                type="text"
                id="fullName"
                name="fullName"
                placeholder="Darshana Jain"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={18} />
              <input
                type="email"
                id="email"
                name="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <div className="input-wrapper">
              <Phone className="input-icon" size={18} />
              <input
                type="tel"
                id="phone"
                name="phone"
                placeholder="9876543210"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                type="password"
                id="password"
                name="password"
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={submitting}>
            {submitting ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{" "}
            <Link to="/login" className="link">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
