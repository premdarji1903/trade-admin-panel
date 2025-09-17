import React, { useState, useEffect } from "react";

export default function Dashboard() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(""); // YYYY-MM-DD
  const [endDate, setEndDate] = useState(""); // YYYY-MM-DD

  // Function to fetch trades for the given date range
  const fetchTrades = async (start, end) => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (start) query.append("start", start);
      if (end) query.append("end", end);

      const res = await fetch(`https://trade-client-server.onrender.com/trades?${query.toString()}`);
      const data = await res.json();
      setTrades(data);
    } catch (error) {
      console.error("Error fetching trades:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch today's trades by default
  useEffect(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const todayStr = `${yyyy}-${mm}-${dd}`;
    setStartDate(todayStr);
    setEndDate(todayStr);
    fetchTrades(todayStr, todayStr);
  }, []);

  const handleFilter = () => {
    fetchTrades(startDate, endDate);
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Dashboard</h1>
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
};
