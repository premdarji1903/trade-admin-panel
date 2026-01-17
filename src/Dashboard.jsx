/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";

export default function Dashboard() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [clientName, setClientName] = useState("");
  const [symbol, setSymbol] = useState("");

  const [page, setPage] = useState(1);
  const [limit] = useState(40);
  const [totalPages, setTotalPages] = useState(1);

  const [showTokenBox, setShowTokenBox] = useState(false);
  const [clientIdInput, setClientIdInput] = useState("");
  const [tokenInput, setTokenInput] = useState("");

  const navigate = useNavigate();

  // ✅ Unified fetch with filters + pagination
  const fetchTrades = async (pageNo = 1) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const query = new URLSearchParams({
        page: pageNo,
        limit: limit,
      });

      if (clientName) query.append("clientName", clientName);
      if (symbol) query.append("symbol", symbol);
      if (startDate) query.append("start", startDate);
      if (endDate) query.append("end", endDate);
      console.log(query.toString());
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
      setTrades(data.trades || []);
      setTotalPages(data.totalPages || 1);
      setPage(data.page || pageNo);
    } catch (err) {
      console.error("Error fetching trades:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    setStartDate(today);
    setEndDate(today);
  }, []);

  // refetch when filters or page change
  useEffect(() => {
    fetchTrades(page);
  }, [page, startDate, endDate, clientName, symbol]);

  const handleAdvancedFilter = () => {
    setPage(1);
    fetchTrades(1);
  };

  const getDurationInMinutes = (start, end) => {
    if (!start || !end) return "-";
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();
    if (isNaN(startTime) || isNaN(endTime)) return "-";

    const diffMs = Math.max(endTime - startTime, 0);
    const totalSeconds = Math.floor(diffMs / 1000);

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes}m ${seconds}s`;
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
          headers: { "Content-Type": "application/json" },
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

  const calculateTotalPnL = () => {
    return trades.reduce((total, trade) => {
      const pnl = (trade.exit_price || 0) - (trade.entry_price || 0);

      const multiplier = trade.symbol?.toLowerCase().includes("naturalgas")
        ? 1250
        : trade.symbol?.toLowerCase().includes("nifty")
        ? 65
        : trade.symbol?.toLowerCase().includes("crude")
        ? 100
        : 1;

      return total + pnl * multiplier * trade.quantity;
    }, 0);
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

        {/* ✅ Filters */}
        <div style={styles.dateFilter}>
          <div>
            <label>Client Name: </label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              style={styles.dateInput}
            />
          </div>

          <div>
            <label>Symbol: </label>
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              style={styles.dateInput}
            />
          </div>

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

          <button style={styles.filterButton} onClick={handleAdvancedFilter}>
            Apply Filter
          </button>
        </div>

        {/* Total PnL */}
        <div
          style={{
            marginTop: "10px",
            fontWeight: "bold",
            color: calculateTotalPnL() < 0 ? "red" : "black",
          }}
        >
          Total PnL: {trades.length ? calculateTotalPnL().toFixed(2) : 0}
        </div>

        {/* Trades table */}
        {loading ? (
          <p>Loading trades...</p>
        ) : trades.length === 0 ? (
          <p>No trades found.</p>
        ) : (
          <>
            <div style={{ overflowX: "auto", marginTop: "20px" }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Order ID</th>
                    <th>Symbol</th>
                    <th>Qty</th>
                    <th>Buy</th>
                    <th>Exit</th>
                    <th>PnL</th>
                    <th>Status</th>
                    <th>Buy Time</th>
                    <th>Exit Time</th>
                    <th>Duration </th>
                  </tr>
                </thead>
                <tbody>
                  {trades.map((t) => {
                    const pnl = (t.exit_price || 0) - (t.entry_price || 0);
                    const multiplier = t.symbol
                      ?.toLowerCase()
                      .includes("naturalgas")
                      ? 1250
                      : t.symbol?.toLowerCase().includes("nifty")
                      ? 65
                      : t.symbol?.toLowerCase().includes("crude")
                      ? 100
                      : 1;
                    const finalPnl = pnl * multiplier * t.quantity;

                    return (
                      <tr key={t._id}>
                        <td>{t.clientName}</td>
                        <td>{t.orderId}</td>
                        <td>{t.symbol}</td>
                        <td>{t.quantity}</td>
                        <td>{t.entry_price}</td>
                        <td>{t.exit_price || "-"}</td>
                        <td style={{ color: finalPnl < 0 ? "red" : "black" }}>
                          {finalPnl.toFixed(2)}
                        </td>
                        <td>{t.status}</td>
                        <td>{t.created_at}</td>
                        <td>{t.exit_time || "-"}</td>
                        <td>
                          {getDurationInMinutes(t.created_at, t.exit_time)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ✅ Pagination with filters */}
            <div style={styles.pagination}>
              <button
                onClick={() => {
                  const newPage = Math.max(page - 1, 1);
                  setPage(newPage);
                  fetchTrades(newPage);
                }}
                disabled={page === 1}
                style={styles.pageButton}
              >
                Prev
              </button>
              <span style={styles.pageInfo}>
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => {
                  const newPage = Math.min(page + 1, totalPages);
                  setPage(newPage);
                  fetchTrades(newPage);
                }}
                disabled={page === totalPages}
                style={styles.pageButton}
              >
                Next
              </button>
            </div>
          </>
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
    textAlign: "left", // align text to left inside card
    margin: "0 auto", // optional: keeps card centered horizontally
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
    tableLayout: "auto",
  },

  th: {
    backgroundColor: "#2563EB",
    color: "#fff",
    padding: "10px 16px", // more horizontal padding for gap
    fontWeight: "600",
    border: "1px solid #ddd",
    textAlign: "left", // align headers to left
    minWidth: "120px",
  },

  td: {
    padding: "8px 16px", // more horizontal padding for gap
    border: "1px solid #ddd",
    textAlign: "left", // align cell content to left
    fontSize: "14px",
    whiteSpace: "nowrap",
  },
  footer: {
    marginTop: "25px",
    fontSize: "12px",
    color: "#9CA3AF",
  },
  logoutButton: {
    // display: "block",
    margin: "0 0 20px auto", // center button and add margin below
    padding: "10px 20px",
    backgroundColor: "#EF4444",
    color: "#fff",
    border: "none",
    borderRadius: "20px",
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
  container: {
    display: "flex",
    alignItems: "center",
    marginBottom: "20px",
    gap: "10px",
  },
  input: {
    padding: "8px 12px",
    fontSize: "16px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    width: "250px",
  },
  button: {
    padding: "8px 16px",
    fontSize: "16px",
    borderRadius: "5px",
    border: "none",
    backgroundColor: "#4CAF50",
    color: "#fff",
    cursor: "pointer",
    transition: "background-color 0.3s",
  },
  buttonHover: {
    backgroundColor: "#45a049",
  },
};
