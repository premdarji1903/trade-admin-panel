import React, { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import {
  FiAlertCircle,
  FiAlertTriangle,
  FiBarChart2,
  FiCheck,
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiDroplet,
  FiEdit2,
  FiGlobe,
  FiMail,
  FiPhone,
  FiSave,
  FiServer,
  FiTrash2,
  FiUsers,
  FiX,
  FiZap,
  FiCreditCard,
  FiRefreshCw,
} from "react-icons/fi";
import { Topbar, Toast, Skeleton } from "./AdminLayout";
import { getInitials, getHue } from "./adminUtils";
dayjs.extend(utc);
dayjs.extend(timezone);
const ClientsList = () => {
  const [clients, setClients] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [targetClient, setTargetClient] = useState(null);
  const [deleteToast, setDeleteToast] = useState("");
  const [balanceClient, setBalanceClient] = useState(null);
  const [balanceData, setBalanceData] = useState(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [balanceError, setBalanceError] = useState("");

  const handleEdit = (client) => {
    setSelectedClient({
      ...client,
      ipFlag: client.ipFlag || "PRIMARY",
    });
    setIsDrawerOpen(true);
  };

  const handleOpenDeleteModal = (client) => {
    setTargetClient(client);
    setShowDeleteModal(true);
  };
  const handleEditClient = async () => {
    if (!selectedClient?._id) {
      alert("❌ No client selected");
      return;
    }

    try {
      const response = await fetch(
        `https://trade-client-server.onrender.com/clients/${selectedClient._id}/trades`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            trade: selectedClient.trade || [],
            broker: selectedClient.broker ?? "",
            ip: selectedClient.ip ?? "",
            ipFlag: selectedClient.ipFlag ?? "",
          }),
        },
      );

      const data = await response.json();
      if (response.ok) {
        setPopupMessage(data.message || "✅ Trades updated successfully");
        setTimeout(() => {
          setPopupMessage("");
          setIsDrawerOpen(false);
          fetchClients(page);
          // Close drawer after popup
        }, 2000);
      } else {
        setPopupMessage(`❌ ${data.message || "Failed to update trades"}`);
        setTimeout(() => setPopupMessage(""), 2500);
      }
    } catch (error) {
      console.error("Error updating trades:", error);
      setPopupMessage("❌ Something went wrong while updating trades");
      setTimeout(() => {
        setPopupMessage("");
        fetchClients(page);
      }, 2500);
    }
  };

  const handleConfirmDelete = async () => {
    if (!targetClient?._id) return;

    try {
      const response = await fetch(
        `https://trade-client-server.onrender.com/clients/${targetClient._id}`,
        { method: "DELETE" },
      );
      const data = await response.json();

      if (response.ok) {
        setDeleteToast(data.message || "✅ Client deleted successfully");
        setShowDeleteModal(false);
        fetchClients(page);
        // Remove deleted client from UI
        // setClients(prev => prev.filter(c => c._id !== targetClient._id));

        setTimeout(() => {
          setDeleteToast("");
        }, 2500);
      } else {
        setDeleteToast(`❌ ${data.message || "Failed to delete client"}`);
        setTimeout(() => setDeleteToast(""), 2500);
      }
    } catch (err) {
      console.error("Delete error:", err);
      setDeleteToast("❌ Something went wrong while deleting");
      setTimeout(() => setDeleteToast(""), 2500);
    }
  };

  // 💰 Get Client Balance
  const fetchBalance = async (client) => {
    setBalanceError("");
    setBalanceData(null);
    if (!client?.clientId) {
      setBalanceError("❌ Client ID not available for this client");
      return;
    }
    setBalanceLoading(true);
    try {
      const response = await fetch(
        `https://trade-client-server.onrender.com/clients/${encodeURIComponent(
          client.clientId,
        )}/balance`,
      );
      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        setBalanceData(data);
      } else {
        setBalanceError(
          data.message ||
            (response.status === 404
              ? "❌ Client not found"
              : "❌ Error fetching balance"),
        );
      }
    } catch (error) {
      console.error("Error fetching balance:", error);
      setBalanceError("❌ Something went wrong while fetching balance");
    } finally {
      setBalanceLoading(false);
    }
  };

  const handleOpenBalance = (client) => {
    setBalanceClient(client);
    fetchBalance(client);
  };

  const closeBalance = () => {
    setBalanceClient(null);
    setBalanceData(null);
    setBalanceError("");
  };

  const formatBrokerError = (err) => {
    if (!err) return "Unable to fetch balance";
    if (typeof err === "string") return err;
    return (
      err.message ||
      err.errorMessage ||
      err.error_message ||
      err.error ||
      JSON.stringify(err)
    );
  };

  const formatINR = (n) =>
    Number(n || 0).toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    });

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedClient(null);
  };

  const fetchClients = async (pageNumber = 1) => {
    try {
      setLoading(true);
      const res = await axios.get(
        `https://trade-client-server.onrender.com/clients/all-clients?page=${pageNumber}&limit=10`,
      );
      setClients(res.data.clients || []);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.error("Error fetching clients:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients(page);
  }, [page]);

  // Toggle isPaid field
  const handleTogglePaid = async (clientId, currentValue) => {
    try {
      const newValue = !currentValue;
      await axios.patch(
        `https://trade-client-server.onrender.com/clients/${clientId}/isPaid`,
        {
          isPaid: newValue,
        },
      );

      // Update UI
      setClients((prev) =>
        prev.map((client) =>
          client._id === clientId ? { ...client, isPaid: newValue } : client,
        ),
      );
    } catch (error) {
      console.error("Error updating isPaid:", error);
    }
  };

  const formatLoginDate = (lastLogin) =>
    lastLogin
      ? dayjs
          .utc(lastLogin) // 👈 treat given time as UTC
          .tz("Asia/Kolkata") // 👈 convert to IST
          .format("YYYY-MM-DD")
      : "-";

  const formatLoginTime = (lastLogin) =>
    lastLogin
      ? dayjs
          .utc(lastLogin) // 👈 treat given time as UTC
          .tz("Asia/Kolkata") // 👈 convert to IST
          .format("hh:mm:ss A")
      : "-";

  const paidCount = clients.filter((c) => c.isPaid).length;
  const unpaidCount = clients.length - paidCount;

  const tradeIcons = {
    Nifty: <FiBarChart2 />,
    "Natural Gas": <FiZap />,
    "Crude Oil": <FiDroplet />,
  };

  const renderPaidSwitch = (client) => (
    <label className="ap-switch">
      <input
        type="checkbox"
        checked={client.isPaid || false}
        onChange={() => handleTogglePaid(client._id, client.isPaid || false)}
      />
      <span className="ap-switch-track" />
      <span className="ap-switch-text">{client.isPaid ? "Paid" : "Unpaid"}</span>
    </label>
  );

  const renderTrades = (client) =>
    client.trade && client.trade.length > 0 ? (
      <div className="ap-chips">
        {client.trade.map((t) => (
          <span className="ap-chip" key={t}>
            {t}
          </span>
        ))}
      </div>
    ) : (
      <span className="ap-dim">No trades</span>
    );

  return (
    <div className="ap">
      <Topbar active="clients" />

      <main className="ap-main">
        {/* Header */}
        <div className="ap-page-head">
          <div>
            <div className="ap-eyebrow">
              <FiUsers /> Management
            </div>
            <h1 className="ap-title">Clients</h1>
            <p className="ap-subtitle">
              Manage subscriptions, brokers & trade access
            </p>
          </div>
        </div>

        {/* Stats */}
        <section className="ap-stats ap-stats--3">
          <div className="ap-card ap-stat ap-stat--violet">
            <div className="ap-stat-top">
              <span className="ap-stat-label">Clients</span>
              <span className="ap-stat-icon">
                <FiUsers />
              </span>
            </div>
            <div className="ap-stat-value">{clients.length}</div>
            <div className="ap-stat-hint">On this page</div>
          </div>
          <div className="ap-card ap-stat ap-stat--green">
            <div className="ap-stat-top">
              <span className="ap-stat-label">Paid</span>
              <span className="ap-stat-icon">
                <FiCheckCircle />
              </span>
            </div>
            <div className="ap-stat-value">{paidCount}</div>
            <div className="ap-stat-hint">Active subscriptions</div>
          </div>
          <div className="ap-card ap-stat ap-stat--amber">
            <div className="ap-stat-top">
              <span className="ap-stat-label">Unpaid</span>
              <span className="ap-stat-icon">
                <FiAlertCircle />
              </span>
            </div>
            <div className="ap-stat-value">{unpaidCount}</div>
            <div className="ap-stat-hint">Pending payment</div>
          </div>
        </section>

        {/* List */}
        <section className="ap-card ap-panel">
          <div className="ap-panel-head">
            <div className="ap-panel-title">
              Clients List <span className="ap-count">{clients.length}</span>
            </div>
          </div>

          {loading ? (
            <Skeleton rows={8} />
          ) : clients.length === 0 ? (
            <div className="ap-empty">
              <div className="ap-empty-icon">
                <FiUsers />
              </div>
              <h3>No clients found</h3>
              <p>Clients will appear here once they sign up.</p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="ap-table-wrap">
                <table className="ap-table">
                  <thead>
                    <tr>
                      <th>No.</th>
                      <th>Client</th>
                      <th>Broker</th>
                      <th>Phone</th>
                      <th>Paid</th>
                      <th>Trade</th>
                      <th>Last Login</th>
                      <th className="ap-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map((client, index) => (
                      <tr key={client._id}>
                        <td className="ap-dim ap-num">
                          {String(index + 1 + (page - 1) * 10).padStart(2, "0")}
                        </td>
                        <td>
                          <div className="ap-ident">
                            <span
                              className="ap-avatar"
                              style={{ "--h": getHue(client.clientName || "") }}
                            >
                              {getInitials(client.clientName)}
                            </span>
                            <div className="ap-ident-text">
                              <div className="ap-ident-name">
                                {client.clientName || "N/A"}
                              </div>
                              <div className="ap-ident-sub">
                                {client.email || "-"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          {client.broker ? (
                            <span className="ap-chip ap-chip--broker">
                              {client.broker}
                            </span>
                          ) : (
                            <span className="ap-dim">N/A</span>
                          )}
                        </td>
                        <td className="ap-num">{client.mobileNumber || "-"}</td>
                        <td>{renderPaidSwitch(client)}</td>
                        <td>{renderTrades(client)}</td>
                        <td>
                          <div className="ap-stack ap-num">
                            <span>{formatLoginDate(client?.lastLogin)}</span>
                            <small>{formatLoginTime(client?.lastLogin)}</small>
                          </div>
                        </td>
                        <td className="ap-right">
                          <div className="ap-actions">
                            <button
                              className="ap-balance-btn"
                              title="Balance Info"
                              onClick={() => handleOpenBalance(client)}
                            >
                              <FiCreditCard /> Balance
                            </button>
                            <button
                              className="ap-icon-btn ap-icon-btn--edit"
                              title="Edit Client"
                              onClick={() => handleEdit(client)}
                            >
                              <FiEdit2 />
                            </button>
                            <button
                              className="ap-icon-btn ap-icon-btn--delete"
                              title="Remove Client"
                              onClick={() => handleOpenDeleteModal(client)}
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile / tablet cards */}
              <div className="ap-cards">
                {clients.map((client, index) => (
                  <article className="ap-mcard" key={client._id}>
                    <div className="ap-mcard-head">
                      <div className="ap-ident">
                        <span
                          className="ap-avatar"
                          style={{ "--h": getHue(client.clientName || "") }}
                        >
                          {getInitials(client.clientName)}
                        </span>
                        <div className="ap-ident-text">
                          <div className="ap-ident-name">
                            {client.clientName || "N/A"}
                          </div>
                          <div className="ap-ident-sub">
                            #{index + 1 + (page - 1) * 10}
                            {client.broker && (
                              <>
                                {" · "}
                                <span style={{ textTransform: "capitalize" }}>
                                  {client.broker}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="ap-actions">
                        <button
                          className="ap-icon-btn ap-icon-btn--balance"
                          title="Balance Info"
                          onClick={() => handleOpenBalance(client)}
                        >
                          <FiCreditCard />
                        </button>
                        <button
                          className="ap-icon-btn ap-icon-btn--edit"
                          title="Edit Client"
                          onClick={() => handleEdit(client)}
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          className="ap-icon-btn ap-icon-btn--delete"
                          title="Remove Client"
                          onClick={() => handleOpenDeleteModal(client)}
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>

                    <div className="ap-mcard-meta">
                      <span>
                        <FiMail /> {client.email || "-"}
                      </span>
                      <span>
                        <FiPhone /> {client.mobileNumber || "-"}
                      </span>
                      <span>
                        <FiClock /> {formatLoginDate(client?.lastLogin)}{" "}
                        {client?.lastLogin &&
                          `· ${formatLoginTime(client?.lastLogin)}`}
                      </span>
                    </div>

                    <div className="ap-mcard-foot">
                      {renderTrades(client)}
                      {renderPaidSwitch(client)}
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}

          {/* Pagination Controls */}
          <div className="ap-pager">
            <div className="ap-pager-info">
              <span>Page </span>
              <b>{page}</b> / {totalPages}
            </div>
            <div className="ap-pager-btns">
              <button
                className="ap-btn"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <FiChevronLeft /> Prev
              </button>
              <button
                className="ap-btn"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next <FiChevronRight />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Edit Drawer */}
      {isDrawerOpen && (
        <>
          <div className="ap-overlay" onClick={closeDrawer} />

          <aside className="ap-drawer" role="dialog" aria-modal="true">
            <div className="ap-handle" />
            <div className="ap-drawer-head">
              <div>
                <h2>Edit Client</h2>
                <p>Update trades, broker & IP settings</p>
              </div>
              <button className="ap-icon-btn" onClick={closeDrawer} title="Close">
                <FiX />
              </button>
            </div>

            {selectedClient && (
              <>
                <div className="ap-drawer-body">
                  <div className="ap-profile">
                    <span
                      className="ap-avatar"
                      style={{ "--h": getHue(selectedClient.clientName || "") }}
                    >
                      {getInitials(selectedClient.clientName)}
                    </span>
                    <div className="ap-ident-text">
                      <div className="ap-ident-name" style={{ fontSize: 16 }}>
                        {selectedClient.clientName}
                      </div>
                      <div className="ap-ident-sub">
                        Client Broker:{" "}
                        <span style={{ color: "#c4b5fd", textTransform: "capitalize" }}>
                          {selectedClient.broker || "—"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Trades */}
                  <div>
                    <div className="ap-section-title">
                      Select Trades
                      <span className="ap-count">
                        {selectedClient.trade?.length || 0} selected
                      </span>
                    </div>
                    <div className="ap-trade-opts">
                      {["Nifty", "Natural Gas", "Crude Oil"].map((trade) => {
                        const on = !!selectedClient.trade?.includes(trade);
                        return (
                          <label
                            key={trade}
                            className={`ap-trade-opt ${on ? "is-on" : ""}`}
                          >
                            <input
                              type="checkbox"
                              value={trade}
                              checked={on}
                              onChange={(e) => {
                                const { checked, value } = e.target;
                                setSelectedClient((prev) => {
                                  let updatedTrades = [...(prev.trade || [])];
                                  if (checked) {
                                    updatedTrades.push(value);
                                  } else {
                                    updatedTrades = updatedTrades.filter(
                                      (t) => t !== value,
                                    );
                                  }
                                  return { ...prev, trade: updatedTrades };
                                });
                              }}
                            />
                            <span className="ap-trade-opt-icon">
                              {tradeIcons[trade]}
                            </span>
                            <span className="ap-trade-opt-name">{trade}</span>
                            <span className="ap-trade-opt-check">
                              <FiCheck />
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Broker */}
                  <div className="ap-field">
                    <label className="ap-section-title" style={{ margin: 0 }}>
                      Select Broker
                    </label>
                    <select
                      className="ap-select"
                      value={selectedClient.broker || ""}
                      onChange={(e) =>
                        setSelectedClient((prev) => ({
                          ...prev,
                          broker: e.target.value,
                        }))
                      }
                    >
                      <option value="">-- Select Broker --</option>
                      {selectedClient.broker && (
                        <option value={selectedClient.broker} hidden>
                          {selectedClient.broker}
                        </option>
                      )}
                      {["dhan", "angel one", "paytm money", "zerodha"]
                        .filter((b) => b !== selectedClient.broker) // 🚀 remove already selected broker
                        .map((broker) => (
                          <option key={broker} value={broker}>
                            {broker}
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Selected trades preview */}
                  {selectedClient.trade?.length > 0 && (
                    <div className="ap-selected">
                      <div className="ap-section-title" style={{ marginBottom: 8 }}>
                        Selected
                      </div>
                      <div className="ap-chips">
                        {selectedClient.trade.map((trade, idx) => (
                          <span className="ap-chip" key={idx}>
                            {trade}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedClient.broker === "dhan" && (
                    <div className="ap-dhan">
                      <div className="ap-section-title">
                        <FiServer /> Dhan IP Settings
                      </div>

                      {/* IP */}
                      <div className="ap-field">
                        <label className="ap-label">IP Address</label>
                        <div className="ap-input-wrap">
                          <FiGlobe />
                          <input
                            type="text"
                            className="ap-input ap-mono"
                            placeholder="Enter IP"
                            value={selectedClient.ip || ""}
                            onChange={(e) =>
                              setSelectedClient((prev) => ({
                                ...prev,
                                ip: e.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>

                      {/* IP FLAG (manual selection) */}
                      <div className="ap-field">
                        <label className="ap-label">IP Flag</label>
                        <div className="ap-segment">
                          {["PRIMARY", "SECONDARY"].map((flag) => (
                            <label
                              key={flag}
                              className={
                                selectedClient.ipFlag === flag ? "is-on" : ""
                              }
                            >
                              <input
                                type="radio"
                                name="ipFlag"
                                value={flag}
                                checked={selectedClient.ipFlag === flag}
                                onChange={(e) =>
                                  setSelectedClient((prev) => ({
                                    ...prev,
                                    ipFlag: e.target.value,
                                  }))
                                }
                              />
                              {flag}
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="ap-drawer-foot">
                  <button className="ap-btn" onClick={closeDrawer}>
                    Close
                  </button>
                  <button
                    className="ap-btn ap-btn--primary"
                    onClick={handleEditClient}
                  >
                    <FiSave /> Save Changes
                  </button>
                </div>
              </>
            )}
          </aside>
        </>
      )}

      <Toast message={popupMessage} />
      <Toast message={deleteToast} />

      {/* Balance Info */}
      {balanceClient && (
        <>
          <div className="ap-overlay" onClick={closeBalance} />
          <div
            className="ap-modal ap-balance-modal"
            role="dialog"
            aria-modal="true"
          >
            <div className="ap-balance-head">
              <div className="ap-ident">
                <span
                  className="ap-avatar"
                  style={{ "--h": getHue(balanceClient.clientName || "") }}
                >
                  {getInitials(balanceClient.clientName)}
                </span>
                <div className="ap-ident-text">
                  <div className="ap-ident-name">
                    {balanceData?.clientName || balanceClient.clientName || "N/A"}
                  </div>
                  <div className="ap-ident-sub">
                    Balance Info
                    {(balanceData?.clientId) && (
                      <span className="ap-mono"> · {balanceData.clientId}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="ap-actions">
                <button
                  className="ap-icon-btn"
                  title="Refresh"
                  disabled={balanceLoading}
                  onClick={() => fetchBalance(balanceClient)}
                >
                  <FiRefreshCw className={balanceLoading ? "ap-spin" : ""} />
                </button>
                <button className="ap-icon-btn" title="Close" onClick={closeBalance}>
                  <FiX />
                </button>
              </div>
            </div>

            <div className="ap-balance-body">
              {balanceLoading ? (
                <div className="ap-balance-card is-loading">
                  <div className="ap-skel-row" style={{ width: "40%", height: 14, marginTop: 0 }} />
                  <div className="ap-skel-row" style={{ width: "70%", height: 38 }} />
                  <div className="ap-skel-row" style={{ width: "30%", height: 14 }} />
                </div>
              ) : balanceError ? (
                <div className="ap-balance-state ap-balance-state--error">
                  <div className="ap-modal-icon">
                    <FiAlertTriangle />
                  </div>
                  <h3>Couldn&apos;t load balance</h3>
                  <p>{balanceError}</p>
                </div>
              ) : balanceData && (!balanceData.broker || !balanceData.balances?.length) ? (
                <div className="ap-balance-state">
                  <div className="ap-empty-icon">
                    <FiCreditCard />
                  </div>
                  <h3>No broker linked</h3>
                  <p>Link a broker to this client to see balance.</p>
                </div>
              ) : (
                balanceData?.balances?.map((b, i) =>
                  b.success ? (
                    <div className="ap-balance-card" key={`${b.broker}-${i}`}>
                      <div className="ap-balance-card-top">
                        <span className="ap-chip ap-chip--broker">{b.broker}</span>
                        <span className="ap-badge ap-badge--green">Connected</span>
                      </div>
                      <div className="ap-kv-k">Available Balance</div>
                      <div
                        className={`ap-balance-amount ${
                          Number(b.availableBalance) < 0 ? "ap-neg" : ""
                        }`}
                      >
                        {formatINR(b.availableBalance)}
                      </div>
                    </div>
                  ) : (
                    <div
                      className="ap-balance-card ap-balance-card--error"
                      key={`${b.broker}-${i}`}
                    >
                      <div className="ap-balance-card-top">
                        <span className="ap-chip ap-chip--broker">{b.broker}</span>
                        <span className="ap-badge ap-badge--red">Failed</span>
                      </div>
                      <div className="ap-balance-err">
                        <FiAlertCircle />
                        <span>{formatBrokerError(b.error)}</span>
                      </div>
                    </div>
                  ),
                )
              )}
            </div>

            <div className="ap-modal-actions">
              <button className="ap-btn" onClick={closeBalance}>
                Close
              </button>
            </div>
          </div>
        </>
      )}

      {/* Delete confirmation */}
      {showDeleteModal && (
        <>
          <div className="ap-overlay" onClick={() => setShowDeleteModal(false)} />
          <div className="ap-modal" role="alertdialog" aria-modal="true">
            <div className="ap-modal-icon">
              <FiAlertTriangle />
            </div>
            <h3>Confirm Delete</h3>
            <p>
              Are you sure you want to permanently remove{" "}
              {targetClient?.clientName ? (
                <b>{targetClient.clientName}</b>
              ) : (
                "this client"
              )}
              ?
            </p>
            <div className="ap-modal-actions">
              <button className="ap-btn" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
              <button className="ap-btn ap-btn--danger" onClick={handleConfirmDelete}>
                <FiTrash2 /> Yes, Delete
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ClientsList;
