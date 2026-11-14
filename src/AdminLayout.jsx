import { useNavigate } from "react-router-dom";
import { FiActivity, FiBarChart2, FiLogOut, FiUsers } from "react-icons/fi";
import "./admin.css";

export function Topbar({ active, onLogout }) {
  const navigate = useNavigate();

  return (
    <header className="ap-topbar">
      <div className="ap-topbar-inner">
        <div className="ap-brand">
          <span className="ap-brand-logo">
            <FiActivity />
          </span>
          <span className="ap-brand-text">
            Trade Admin
            <small>Control Center</small>
          </span>
        </div>

        <nav className="ap-nav">
          <button
            className={active === "trades" ? "is-active" : ""}
            onClick={() => navigate("/dashboard")}
          >
            <FiBarChart2 /> Trades
          </button>
          <button
            className={active === "clients" ? "is-active" : ""}
            onClick={() => navigate("/clients")}
          >
            <FiUsers /> Clients
          </button>
        </nav>

        {onLogout && (
          <button
            className="ap-btn ap-btn--ghost-danger ap-logout"
            onClick={onLogout}
            title="Logout"
          >
            <FiLogOut />
            <span className="ap-logout-label">Logout</span>
          </button>
        )}
      </div>
    </header>
  );
}

export function Toast({ message }) {
  if (!message) return null;
  const isError = message.trim().startsWith("❌");
  return (
    <div className={`ap-toast ${isError ? "ap-toast--error" : ""}`} role="status">
      {message}
    </div>
  );
}

export function Skeleton({ rows = 6 }) {
  return (
    <div className="ap-skeleton">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="ap-skel-row"
          style={{ animationDelay: `${i * 80}ms` }}
        />
      ))}
    </div>
  );
}
