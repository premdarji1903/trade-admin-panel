/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [showTokenBox, setShowTokenBox] = useState(false); // Toggle box
  const [clientIdInput, setClientIdInput] = useState("");
  const [tokenInput, setTokenInput] = useState("");
  const navigate = useNavigate();

  const fetchTrades = async (start, end, pageNo = 1) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const query = new URLSearchParams();
      if (start) query.append("start", start);
      if (end) query.append("end", end);
      query.append("page", pageNo);
      query.append("limit", limit);
      const res = await fetch(
        `https://trade-client-server.onrender.com/trades?${query.toString()}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("token");
        navigate("/");
        return;
      }
      const data = await res.json();
      setTrades(data?.trades);
      setTotalPages(data.totalPages);
      setPage(data.page);
    } catch (error) {
      console.error("Error fetching trades:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleUpdateToken = async () => {
    if (!clientIdInput || !tokenInput) {
      alert("Please fill Client ID and Token");
      return;
    }
    try {
      const res = await fetch(
        `https://trade-client-server.onrender.com/client/${clientIdInput}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token: tokenInput }),
        }
      );
      if (res.ok) {
        alert("Token updated successfully");
        setShowTokenBox(false);
        localStorage.setItem("token", tokenInput);
      } else {
        const err = await res.json();
        alert("Error updating token: " + (err.message || res.status));
      }
    } catch (error) {
      console.error("Error updating token:", error);
      alert("Error updating token");
    }
  };

  useEffect(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const todayStr = `${yyyy}-${mm}-${dd}`;
    setStartDate(todayStr);
    setEndDate(todayStr);
    fetchTrades(todayStr, todayStr, 1);
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      fetchTrades(startDate, endDate, page);
    }
  }, [page, startDate, endDate]);

  const handleFilter = () => {
    fetchTrades(startDate, endDate);
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>Dashboard</h1>
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={handleLogout} style={styles.logoutButton}>
              Logout
            </button>
            <button
              style={styles.updateTokenButton}
              onClick={() => setShowTokenBox((prev) => !prev)}
            >
              Update Token
            </button>
            <button
              style={styles.clientsButton}
              onClick={() => navigate("/clients")}
            >
              Clients
            </button>
          </div>
        </div>

        {/* Token update box */}
        {showTokenBox && (
          <div style={styles.tokenBox}>
            <input
              type="text"
              placeholder="Client ID"
              value={clientIdInput}
              onChange={(e) => setClientIdInput(e.target.value)}
              style={styles.tokenInput}
            />
            <input
              type="text"
              placeholder="New Token"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              style={styles.tokenInput}
            />
            <button style={styles.saveTokenButton} onClick={handleUpdateToken}>
              Save Token
            </button>
          </div>
        )}

        <p style={styles.subtitle}>View Trades</p>

        {/* Date range filter */}
        <div style={styles.dateFilter}>
          <div>
            <label>Start Date: </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={styles.dateInput}
            />
          </div>
          <div>
            <label>End Date: </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={styles.dateInput}
            />
          </div>
          <button style={styles.filterButton} onClick={handleFilter}>
            Filter
          </button>
        </div>

        {/* Trades table */}
        {loading ? (
          <p>Loading trades...</p>
        ) : trades.length === 0 ? (
          <p>No trades found.</p>
        ) : (
          <div style={{ overflowX: "auto", marginTop: "20px" }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>Client Name</th>
                  <th>Order ID</th>
                  <th>Symbol</th>
                  <th>Transaction</th>
                  <th>Quantity</th>
                  <th>Entry Price</th>
                  <th>Exit Price</th>
                  <th>PnL</th>
                  <th>Trend</th>
                  <th>Status</th>
                  <th>Created At</th>
                  <th>Exit Time</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((trade) => (
                  <tr key={trade._id}>
                    <td>{trade.clientName}</td>
                    <td>{trade.orderId}</td>
                    <td>{trade.symbol}</td>
                    <td>{trade.transactionType}</td>
                    <td>{trade.quantity}</td>
                    <td>{trade.entry_price}</td>
                    <td>{trade.exit_price || "-"}</td>
                    <td>{trade.pnl || 0}</td>
                    <td>{trade.trend}</td>
                    <td>{trade.status}</td>
                    <td>{trade.created_at}</td>
                    <td>{trade.exit_time || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div style={styles.pagination}>
              <button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
                style={styles.pageButton}
              >
                Prev
              </button>
              <span style={styles.pageInfo}>
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={page === totalPages}
                style={styles.pageButton}
              >
                Next
              </button>
            </div>
          </div>
        )}

        <p style={styles.footer}>
          © {new Date().getFullYear()} Trader Admin Panel
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    background: "linear-gradient(135deg, #ffffff, #e6f0ff, #2563EB)",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    padding: "20px",
    paddingTop: "50px",
  },
  card: {
    width: "100%",
    maxWidth: "1200px",
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
  dateFilter: {
    display: "flex",
    justifyContent: "center",
    gap: "15px",
    marginBottom: "20px",
    flexWrap: "wrap",
  },
  dateInput: {
    padding: "8px",
    borderRadius: "6px",
    border: "1px solid #D1D5DB",
    outline: "none",
  },
  filterButton: {
    padding: "10px 16px",
    backgroundColor: "#2563EB",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "500",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "20px",
  },
  th: {
    backgroundColor: "#2563EB",
    color: "#fff",
    padding: "10px",
    fontWeight: "600",
    border: "1px solid #ddd",
  },
  td: {
    padding: "8px",
    border: "1px solid #ddd",
    textAlign: "center",
    fontSize: "14px",
  },
  footer: {
    marginTop: "25px",
    fontSize: "12px",
    color: "#9CA3AF",
  },
  logoutButton: {
    display: "block",
    margin: "0 auto 20px", // center button and add margin below
    padding: "10px 20px",
    backgroundColor: "#EF4444",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
  },
  pagination: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginTop: "20px",
    gap: "10px",
  },

  pageButton: {
    padding: "6px 12px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    backgroundColor: "#f9fafb",
    cursor: "pointer",
    fontWeight: "500",
  },

  pageInfo: {
    fontSize: "14px",
    color: "#374151",
  },
  updateTokenButton: {
    padding: "10px 16px",
    backgroundColor: "#2563EB",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "500",
  },
  tokenBox: {
    display: "flex",
    gap: "10px",
    marginTop: "10px",
    justifyContent: "center",
  },
  tokenInput: {
    padding: "8px",
    borderRadius: "6px",
    border: "1px solid #D1D5DB",
  },
  saveTokenButton: {
    padding: "8px 12px",
    backgroundColor: "#10B981",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  clientsButton: {
    backgroundColor: "#2e7d32",
    color: "#fff",
    border: "none",
    padding: "8px 14px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "500",
  },
};
