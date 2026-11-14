/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiArrowDownRight,
  FiArrowUpRight,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiFilter,
  FiInbox,
  FiLayers,
  FiSearch,
  FiTrendingDown,
  FiTrendingUp,
  FiUser,
  FiUsers,
} from "react-icons/fi";
import { Topbar, Skeleton } from "./AdminLayout";
import { getInitials, getHue } from "./adminUtils";
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

  // same multiplier logic as calculateTotalPnL, per row (display only)
  const getTradePnl = (t) => {
    const pnl = (t.exit_price || 0) - (t.entry_price || 0);
    const multiplier = t.symbol?.toLowerCase().includes("naturalgas")
      ? 1250
      : t.symbol?.toLowerCase().includes("nifty")
      ? 65
      : t.symbol?.toLowerCase().includes("crude")
      ? 100
      : 1;
    return pnl * multiplier * t.quantity;
  };

  const getStatusTone = (status = "") => {
    const s = String(status).toLowerCase();
    if (/(reject|cancel|fail|error|\bsl\b)/.test(s)) return "red";
    if (/(open|pending|active|running|placed)/.test(s)) return "amber";
    if (/(close|complete|exit|filled|done|success|target)/.test(s))
      return "green";
    return "blue";
  };

  const totalPnL = trades.length ? calculateTotalPnL() : 0;
  const rowPnls = trades.map(getTradePnl);
  const winners = rowPnls.filter((p) => p > 0).length;
  const losers = rowPnls.filter((p) => p < 0).length;
  const fmt = (n) =>
    Number(n).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <div className="ap">
      <Topbar active="trades" onLogout={handleLogout} />

      <main className="ap-main">
        {/* Header */}
        <div className="ap-page-head">
          <div>
            <div className="ap-eyebrow">
              <span className="ap-live-dot" /> Dashboard
            </div>
            <h1 className="ap-title">Trade Book</h1>
            <p className="ap-subtitle">
              View Trades
              {startDate && endDate && (
                <>
                  {" "}
                  · {startDate === endDate ? startDate : `${startDate} → ${endDate}`}
                </>
              )}
            </p>
          </div>
          <button
            className="ap-btn"
            onClick={() => navigate("/clients")}
          >
            <FiUsers /> Clients
          </button>
        </div>

        {/* Stats */}
        <section className="ap-stats">
          <div
            className={`ap-card ap-stat ${
              totalPnL < 0 ? "ap-stat--red" : "ap-stat--green"
            }`}
          >
            <div className="ap-stat-top">
              <span className="ap-stat-label">Total PnL</span>
              <span className="ap-stat-icon">
                {totalPnL < 0 ? <FiTrendingDown /> : <FiTrendingUp />}
              </span>
            </div>
            <div className={`ap-stat-value ${totalPnL < 0 ? "ap-neg" : "ap-pos"}`}>
              {totalPnL > 0 ? "+" : ""}₹{fmt(totalPnL)}
            </div>
            <div className="ap-stat-hint">Current page</div>
          </div>

          <div className="ap-card ap-stat">
            <div className="ap-stat-top">
              <span className="ap-stat-label">Trades</span>
              <span className="ap-stat-icon">
                <FiLayers />
              </span>
            </div>
            <div className="ap-stat-value">{trades.length}</div>
            <div className="ap-stat-hint">
              Page {page} of {totalPages}
            </div>
          </div>

          <div className="ap-card ap-stat ap-stat--green">
            <div className="ap-stat-top">
              <span className="ap-stat-label">Winners</span>
              <span className="ap-stat-icon">
                <FiArrowUpRight />
              </span>
            </div>
            <div className="ap-stat-value">{winners}</div>
            <div className="ap-stat-hint">
              {trades.length
                ? `${Math.round((winners / trades.length) * 100)}% win rate`
                : "—"}
            </div>
          </div>

          <div className="ap-card ap-stat ap-stat--red">
            <div className="ap-stat-top">
              <span className="ap-stat-label">Losers</span>
              <span className="ap-stat-icon">
                <FiArrowDownRight />
              </span>
            </div>
            <div className="ap-stat-value">{losers}</div>
            <div className="ap-stat-hint">
              {trades.length
                ? `${Math.round((losers / trades.length) * 100)}% of trades`
                : "—"}
            </div>
          </div>
        </section>

        {/* Token update box */}
        {showTokenBox && (
          <div className="ap-card ap-token-box">
            <input
              type="text"
              placeholder="Client ID"
              value={clientIdInput}
              onChange={(e) => setClientIdInput(e.target.value)}
              className="ap-input"
            />
            <input
              type="text"
              placeholder="New Token"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              className="ap-input"
            />
            <button className="ap-btn ap-btn--success" onClick={handleUpdateToken}>
              Save Token
            </button>
          </div>
        )}

        {/* Filters */}
        <section className="ap-card ap-filters">
          <div className="ap-field">
            <label className="ap-label">Client Name</label>
            <div className="ap-input-wrap">
              <FiUser />
              <input
                type="text"
                placeholder="Search client"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="ap-input"
              />
            </div>
          </div>

          <div className="ap-field">
            <label className="ap-label">Symbol</label>
            <div className="ap-input-wrap">
              <FiSearch />
              <input
                type="text"
                placeholder="e.g. NIFTY"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="ap-input"
              />
            </div>
          </div>

          <div className="ap-field">
            <label className="ap-label">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="ap-input"
            />
          </div>

          <div className="ap-field">
            <label className="ap-label">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="ap-input"
            />
          </div>

          <button
            className="ap-btn ap-btn--primary"
            style={{ height: 42 }}
            onClick={handleAdvancedFilter}
          >
            <FiFilter /> Apply Filter
          </button>
        </section>

        {/* Trades */}
        <section className="ap-card ap-panel">
          <div className="ap-panel-head">
            <div className="ap-panel-title">
              Trades <span className="ap-count">{trades.length}</span>
            </div>
            {!loading && trades.length > 0 && (
              <span
                className={`ap-pnl ${totalPnL < 0 ? "ap-neg" : "ap-pos"}`}
              >
                {totalPnL > 0 ? "+" : ""}
                {totalPnL.toFixed(2)}
              </span>
            )}
          </div>

          {loading ? (
            <Skeleton rows={7} />
          ) : trades.length === 0 ? (
            <div className="ap-empty">
              <div className="ap-empty-icon">
                <FiInbox />
              </div>
              <h3>No trades found.</h3>
              <p>Try changing the date range or filters.</p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="ap-table-wrap">
                <table className="ap-table">
                  <thead>
                    <tr>
                      <th>Client</th>
                      <th>Order ID</th>
                      <th>Symbol</th>
                      <th className="ap-right">Qty</th>
                      <th className="ap-right">Buy</th>
                      <th className="ap-right">Exit</th>
                      <th className="ap-right">PnL</th>
                      <th>Status</th>
                      <th>Buy Time</th>
                      <th>Exit Time</th>
                      <th>Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trades.map((t, i) => {
                      const finalPnl = rowPnls[i];
                      return (
                        <tr key={t._id}>
                          <td>
                            <div className="ap-ident">
                              <span
                                className="ap-avatar"
                                style={{
                                  "--h": getHue(t.clientName || ""),
                                  width: 30,
                                  height: 30,
                                  fontSize: 11.5,
                                  borderRadius: 9,
                                }}
                              >
                                {getInitials(t.clientName)}
                              </span>
                              <span className="ap-strong">{t.clientName}</span>
                            </div>
                          </td>
                          <td className="ap-mono ap-dim">{t.orderId}</td>
                          <td>
                            <span className="ap-symbol">
                              <span className="ap-symbol-dot" />
                              {t.symbol}
                            </span>
                          </td>
                          <td className="ap-right ap-num">{t.quantity}</td>
                          <td className="ap-right ap-num">{t.entry_price}</td>
                          <td className="ap-right ap-num">
                            {t.exit_price || "-"}
                          </td>
                          <td className="ap-right">
                            <span
                              className={`ap-pnl ${
                                finalPnl < 0 ? "ap-neg" : "ap-pos"
                              }`}
                            >
                              {finalPnl.toFixed(2)}
                            </span>
                          </td>
                          <td>
                            <span
                              className={`ap-badge ap-badge--${getStatusTone(
                                t.status
                              )}`}
                            >
                              {t.status}
                            </span>
                          </td>
                          <td className="ap-num ap-dim">{t.created_at}</td>
                          <td className="ap-num ap-dim">{t.exit_time || "-"}</td>
                          <td className="ap-num">
                            {getDurationInMinutes(t.created_at, t.exit_time)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile / tablet cards */}
              <div className="ap-cards">
                {trades.map((t, i) => {
                  const finalPnl = rowPnls[i];
                  return (
                    <article className="ap-mcard" key={t._id}>
                      <div className="ap-mcard-head">
                        <div className="ap-ident">
                          <span
                            className="ap-avatar"
                            style={{ "--h": getHue(t.clientName || "") }}
                          >
                            {getInitials(t.clientName)}
                          </span>
                          <div className="ap-ident-text">
                            <div className="ap-ident-name">{t.clientName}</div>
                            <div className="ap-ident-sub ap-symbol">
                              <span className="ap-symbol-dot" />
                              {t.symbol}
                            </div>
                          </div>
                        </div>
                        <span
                          className={`ap-pnl ${finalPnl < 0 ? "ap-neg" : "ap-pos"}`}
                        >
                          {finalPnl.toFixed(2)}
                        </span>
                      </div>

                      <div className="ap-mcard-grid ap-mcard-grid--3">
                        <div className="ap-kv">
                          <div className="ap-kv-k">Qty</div>
                          <div className="ap-kv-v">{t.quantity}</div>
                        </div>
                        <div className="ap-kv">
                          <div className="ap-kv-k">Buy</div>
                          <div className="ap-kv-v">{t.entry_price}</div>
                        </div>
                        <div className="ap-kv">
                          <div className="ap-kv-k">Exit</div>
                          <div className="ap-kv-v">{t.exit_price || "-"}</div>
                        </div>
                      </div>

                      <div className="ap-mcard-grid">
                        <div className="ap-kv">
                          <div className="ap-kv-k">Buy Time</div>
                          <div className="ap-kv-v">{t.created_at}</div>
                        </div>
                        <div className="ap-kv">
                          <div className="ap-kv-k">Exit Time</div>
                          <div className="ap-kv-v">{t.exit_time || "-"}</div>
                        </div>
                      </div>

                      <div className="ap-mcard-foot">
                        <div className="ap-mcard-meta">
                          <span className="ap-mono">#{t.orderId}</span>
                          <span>
                            <FiClock />
                            {getDurationInMinutes(t.created_at, t.exit_time)}
                          </span>
                        </div>
                        <span
                          className={`ap-badge ap-badge--${getStatusTone(
                            t.status
                          )}`}
                        >
                          {t.status}
                        </span>
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* Pagination with filters */}
              <div className="ap-pager">
                <div className="ap-pager-info">
                  <span>Page </span>
                  <b>{page}</b> / {totalPages}
                </div>
                <div className="ap-pager-btns">
                  <button
                    onClick={() => {
                      const newPage = Math.max(page - 1, 1);
                      setPage(newPage);
                      fetchTrades(newPage);
                    }}
                    disabled={page === 1}
                    className="ap-btn"
                  >
                    <FiChevronLeft /> Prev
                  </button>
                  <button
                    onClick={() => {
                      const newPage = Math.min(page + 1, totalPages);
                      setPage(newPage);
                      fetchTrades(newPage);
                    }}
                    disabled={page === totalPages}
                    className="ap-btn"
                  >
                    Next <FiChevronRight />
                  </button>
                </div>
              </div>
            </>
          )}
        </section>

        <p className="ap-footer">
          © {new Date().getFullYear()} Trader Admin Panel
        </p>
      </main>
    </div>
  );
}
