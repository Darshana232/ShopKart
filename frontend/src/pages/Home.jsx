
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ShoppingBag, ArrowRight, ShieldCheck, Zap, Database } from "lucide-react";

const Home = () => {
  const { customer } = useAuth();

  return (
    <div className="home-container">
      <section className="hero-card">
        <div className="badge">Assignment 2 — Customer Auth</div>
        <h1>Welcome to <span className="text-gradient">ShopKart</span></h1>
        <p className="hero-subtitle">
          Your full-stack e-commerce learning platform built with MongoDB Atlas, Express, React, and Node.js.
        </p>

        {customer ? (
          <div className="welcome-banner">
            <h3>Hello, {customer.fullName}! 👋</h3>
            <p>You are securely authenticated via HttpOnly JWT Cookie.</p>
            <Link to="/profile" className="btn btn-primary">
              View Your Profile <ArrowRight size={18} />
            </Link>
          </div>
        ) : (
          <div className="cta-group">
            <Link to="/register" className="btn btn-primary btn-lg">
              Get Started (Register) <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn btn-outline btn-lg">
              Login to Account
            </Link>
          </div>
        )}
      </section>

      <section className="features-grid">
        <div className="feature-card">
          <ShieldCheck className="feature-icon" />
          <h3>Secure Authentication</h3>
          <p>Passwords hashed with bcrypt (10 salt rounds) and session managed via HttpOnly JWT cookies.</p>
        </div>
        <div className="feature-card">
          <Database className="feature-icon" />
          <h3>MongoDB Atlas</h3>
          <p>Cloud document database storing customer records with Mongoose schema validation.</p>
        </div>
        <div className="feature-card">
          <Zap className="feature-icon" />
          <h3>Vite + React SPA</h3>
          <p>Fast client-side routing, React Context global state, and controlled form handling.</p>
        </div>
      </section>
    </div>
  );
};

export default Home;
