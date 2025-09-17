/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
export default function AdminLogin() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Trader Admin Login</h1>
        <p style={styles.subtitle}>Sign in to access the admin panel</p>

        <form style={styles.form} onSubmit={handleSubmit}>
          <div style={styles.row}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="admin@trader.com"
              value={formData.email}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.row}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter password"
              value={formData.password}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        {error && <p style={styles.error}>{error}</p>}
        <p style={styles.footer}>
          © {new Date().getFullYear()} Trader Admin Panel
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    height: "100vh",
    display: "flex",
    justifyContent: "center", // Center horizontally
    alignItems: "center", // Center vertically
    background: "linear-gradient(135deg, #ffffff, #e6f0ff, #2563EB)", // Smooth gradient white → light blue → blue
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    padding: "20px",
  },
  card: {
    width: "100%",
    maxWidth: "400px",
    background: "#fff",
    padding: "35px",
    borderRadius: "14px",
    boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
    textAlign: "center",
  },
  title: {
    fontSize: "1.8rem",
    marginBottom: "10px",
    fontWeight: "600",
    color: "#111827",
  },
  subtitle: {
    fontSize: "14px",
    marginBottom: "25px",
    color: "#6B7280",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  row: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
  },
  label: {
    marginBottom: "6px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#374151",
  },
  input: {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #D1D5DB",
    fontSize: "15px",
    outline: "none",
    transition: "all 0.2s ease",
  },
  button: {
    padding: "14px",
    backgroundColor: "#2563EB",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "500",
    transition: "background-color 0.3s ease",
  },
  error: {
    marginTop: "15px",
    color: "red",
    fontSize: "14px",
  },
  footer: {
    marginTop: "25px",
    fontSize: "12px",
    color: "#9CA3AF",
  },
};

// Hover/focus styles (inline hack)
styles.input[":focus"] = {
  borderColor: "#2563EB",
  boxShadow: "0 0 5px rgba(37,99,235,0.3)",
};
styles.button[":hover"] = {
  backgroundColor: "#1D4ED8",
};
