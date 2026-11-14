/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiActivity,
  FiAlertCircle,
  FiArrowRight,
  FiEye,
  FiEyeOff,
  FiLock,
  FiMail,
  FiShield,
  FiTrendingUp,
  FiUsers,
} from "react-icons/fi";
import "./admin.css";
export default function AdminLogin() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate(); // React Router hook

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("https://trade-client-server.onrender.com/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        // Login successful
         localStorage.setItem("token", data.token);
        // alert("✅ Login successful! Redirecting to dashboard...");
         navigate("/dashboard");
        // You can add redirect here later
      } else {
        const data = await res.json();
        setError(data.message || "❌ Invalid email or password");
      }
    } catch (err) {
      setError("❌ Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ap ap-login">
      {/* Brand panel (desktop) */}
      <aside className="ap-login-brand">
        <div className="ap-brand">
          <span className="ap-brand-logo">
            <FiActivity />
          </span>
          <span>
            Trade Admin
            <small>Control Center</small>
          </span>
        </div>

        <div className="ap-login-hero">
          <div className="ap-eyebrow">
            <span className="ap-live-dot" /> Markets live
          </div>
          <h2>
            Every trade.
            <br />
            <span className="ap-grad-text">One command center.</span>
          </h2>
          <p>
            Monitor client trades, track PnL in real time and manage broker
            access — all from a single dashboard.
          </p>

          {/* Decorative chart */}
          <div className="ap-login-chart">
            <div className="ap-login-chart-head">
              <div>
                <div className="ap-kv-k">Today's PnL</div>
                <div className="ap-login-chart-val ap-pos">+₹48,250.00</div>
              </div>
              <span className="ap-badge ap-badge--green">+12.4%</span>
            </div>
            <svg viewBox="0 0 320 110" preserveAspectRatio="none" aria-hidden="true">
              <defs>
                <linearGradient id="apArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#5b8cff" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#5b8cff" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="apLine" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#5b8cff" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
              <path
                d="M0,88 C20,84 30,70 50,72 C70,74 80,90 100,80 C120,70 130,48 150,52 C170,56 180,66 200,54 C220,42 232,30 252,34 C272,38 284,22 300,16 L320,10 L320,110 L0,110 Z"
                fill="url(#apArea)"
              />
              <path
                className="ap-login-line"
                d="M0,88 C20,84 30,70 50,72 C70,74 80,90 100,80 C120,70 130,48 150,52 C170,56 180,66 200,54 C220,42 232,30 252,34 C272,38 284,22 300,16 L320,10"
                fill="none"
                stroke="url(#apLine)"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <ul className="ap-login-feats">
            <li>
              <FiTrendingUp /> Live PnL tracking
            </li>
            <li>
              <FiUsers /> Client management
            </li>
            <li>
              <FiShield /> Secure access
            </li>
          </ul>
        </div>

        <p className="ap-login-copy">
          © {new Date().getFullYear()} Trader Admin Panel
        </p>
      </aside>

      {/* Form */}
      <main className="ap-login-main">
        <div className="ap-login-card">
          <div className="ap-login-mobile-brand">
            <span className="ap-brand-logo">
              <FiActivity />
            </span>
          </div>

          <h1 className="ap-title">Welcome back</h1>
          <p className="ap-subtitle">Sign in to access the admin panel</p>

          <form className="ap-login-form" onSubmit={handleSubmit}>
            <div className="ap-field">
              <label className="ap-label" htmlFor="email">
                Email Address
              </label>
              <div className="ap-input-wrap">
                <FiMail />
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="admin@trader.com"
                  autoComplete="username"
                  value={formData.email}
                  onChange={handleChange}
                  className="ap-input ap-input--lg"
                  required
                />
              </div>
            </div>

            <div className="ap-field">
              <label className="ap-label" htmlFor="password">
                Password
              </label>
              <div className="ap-input-wrap">
                <FiLock />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter password"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  className="ap-input ap-input--lg"
                  style={{ paddingRight: 46 }}
                  required
                />
                <button
                  type="button"
                  className="ap-eye"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            {error && (
              <div className="ap-login-error" role="alert">
                <FiAlertCircle /> {error}
              </div>
            )}

            <button
              type="submit"
              className="ap-btn ap-btn--primary ap-login-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="ap-spinner" /> Signing in...
                </>
              ) : (
                <>
                  Login <FiArrowRight />
                </>
              )}
            </button>
          </form>

          <div className="ap-login-secure">
            <FiShield /> Secured admin access
          </div>
          <p className="ap-login-copy ap-login-copy--mobile">
            © {new Date().getFullYear()} Trader Admin Panel
          </p>
        </div>
      </main>
    </div>
  );
}
