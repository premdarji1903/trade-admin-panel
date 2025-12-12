import React, { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import { FaEdit, FaTrash } from "react-icons/fa";
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

  const handleEdit = (client) => {
    setSelectedClient(client);
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
            broker: selectedClient.broker ?? '',
          }),
        }
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
        { method: "DELETE" }
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

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedClient(null);
  };

  const fetchClients = async (pageNumber = 1) => {
    try {
      setLoading(true);
      const res = await axios.get(
        `https://trade-client-server.onrender.com/clients/all-clients?page=${pageNumber}&limit=10`
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
        }
      );

      // Update UI
      setClients((prev) =>
        prev.map((client) =>
          client._id === clientId ? { ...client, isPaid: newValue } : client
        )
      );
    } catch (error) {
      console.error("Error updating isPaid:", error);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>👥 Clients List</h2>

      {loading ? (
        <p>Loading clients...</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>No.</th>
              <th style={styles.th}>Client Name</th>
              <th style={styles.th}>Broker</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Phone</th>
              <th style={styles.th}>Paid</th>
              <th style={styles.th}>Trade</th>
              <th style={styles.th}>Last Login Date</th>
              <th style={styles.th}>Last Login Time</th>
              <th style={styles.th}>Edit Client</th>
              <th style={styles.th}>Remove Client</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client, index) => (
              <tr key={client._id}>
                <td style={styles.td}>{index + 1 + (page - 1) * 10}</td>
                <td style={styles.td}>{client.clientName || "N/A"}</td>
                <td style={styles.td}>{client.broker || "N/A"}</td>
                <td style={styles.td}>{client.email || "-"}</td>
                <td style={styles.td}>{client.mobileNumber || "-"}</td>
                <td style={styles.td}>
                  <label style={styles.switch}>
                    <input
                      type="checkbox"
                      checked={client.isPaid || false}
                      onChange={() =>
                        handleTogglePaid(client._id, client.isPaid || false)
                      }
                      style={{ display: "none" }}
                    />
                    <span
                      style={{
                        ...styles.slider,
                        backgroundColor: client.isPaid ? "#2e7d32" : "#ccc",
                      }}
                    >
                      <span
                        style={{
                          ...styles.sliderBefore,
                          transform: client.isPaid
                            ? "translateX(18px)"
                            : "translateX(0)",
                        }}
                      />
                    </span>
                  </label>
                </td>
                <td style={styles.td}>
                  {client.trade && client.trade.length > 0
                    ? client.trade.join(", ")
                    : "No trades"}
                </td>
                <td style={styles.td}>
                  {client?.lastLogin
                    ? dayjs
                        .utc(client.lastLogin) // 👈 treat given time as UTC
                        .tz("Asia/Kolkata") // 👈 convert to IST
                        .format("YYYY-MM-DD")
                    : "-"}
                </td>
                <td style={styles.td}>
                  {client?.lastLogin
                    ? dayjs
                        .utc(client.lastLogin) // 👈 treat given time as UTC
                        .tz("Asia/Kolkata") // 👈 convert to IST
                        .format("hh:mm:ss A")
                    : "-"}
                </td>
                <td style={styles.td}>
                  <FaEdit
                    style={{ cursor: "pointer", color: "#007bff" }}
                    onClick={() => handleEdit(client)}
                  />
                </td>
                <td style={styles.td}>
                  <FaTrash
                    style={{ cursor: "pointer", color: "#dc3545" }}
                    onClick={() => handleOpenDeleteModal(client)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Pagination Controls */}
      <div style={styles.pagination}>
        <button
          style={styles.pageBtn}
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
        >
          ← Prev
        </button>
        <span style={styles.pageText}>
          Page {page} of {totalPages}
        </span>
        <button
          style={styles.pageBtn}
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          Next →
        </button>
      </div>
      {isDrawerOpen && (
        <>
          {/* Overlay */}
          <div
            onClick={closeDrawer}
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.4)",
              backdropFilter: "blur(2px)",
              zIndex: 999,
              opacity: isDrawerOpen ? 1 : 0,
              transition: "opacity 0.3s ease-in-out",
            }}
          />

          {/* Drawer Panel */}
          <div
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              width: "380px",
              height: "100%",
              backgroundColor: "#fff",
              boxShadow: "-4px 0 20px rgba(0,0,0,0.2)",
              borderTopLeftRadius: "16px",
              borderBottomLeftRadius: "16px",
              padding: "24px",
              zIndex: 1000,
              transform: isDrawerOpen ? "translateX(0)" : "translateX(100%)",
              transition: "transform 0.35s cubic-bezier(0.25, 1, 0.5, 1)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <h2
              style={{
                marginBottom: "16px",
                fontSize: "1.5rem",
                color: "#222",
                fontWeight: 600,
                borderBottom: "1px solid #eee",
                paddingBottom: "8px",
              }}
            >
              ✏️ Edit Client
            </h2>

            {selectedClient && (
              <div style={{ flex: 1, overflowY: "auto", paddingRight: "4px" }}>
                <p
                  style={{
                    fontSize: "1rem",
                    marginBottom: "8px",
                    color: "#444",
                  }}
                >
                  <strong>Client Name:</strong>{" "}
                  <span style={{ color: "#007bff" }}>
                    {selectedClient.clientName}
                  </span>
                </p>

                <p
                  style={{
                    fontSize: "1rem",
                    marginBottom: "8px",
                    color: "#444",
                  }}
                >
                  <strong>Client Name:</strong>{" "}
                  <span style={{ color: "#007bff" }}>
                    {selectedClient.broker}
                  </span>
                </p>

                <div style={{ marginTop: "12px" }}>
                  <label
                    htmlFor="tradeSelect"
                    style={{
                      display: "block",
                      fontWeight: "bold",
                      color: "#333",
                      marginBottom: "8px",
                      fontSize: "1rem",
                    }}
                  >
                    Select Trades:
                  </label>

                  {/* Checkbox options */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    {["Nifty", "Natural Gas", "Crude Oil"].map((trade) => (
                      <label
                        key={trade}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          background: "#fff",
                          border: "1px solid #ddd",
                          borderRadius: "8px",
                          padding: "10px 12px",
                          cursor: "pointer",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                          transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#f1f8ff";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "#fff";
                        }}
                      >
                        <input
                          type="checkbox"
                          value={trade}
                          checked={selectedClient.trade?.includes(trade)}
                          onChange={(e) => {
                            const { checked, value } = e.target;
                            setSelectedClient((prev) => {
                              let updatedTrades = [...(prev.trade || [])];
                              if (checked) {
                                updatedTrades.push(value);
                              } else {
                                updatedTrades = updatedTrades.filter(
                                  (t) => t !== value
                                );
                              }
                              return { ...prev, trade: updatedTrades };
                            });
                          }}
                          style={{
                            width: "18px",
                            height: "18px",
                            accentColor: "#007bff",
                            cursor: "pointer",
                          }}
                        />
                        <span style={{ fontSize: "1rem", color: "#333" }}>
                          {trade}
                        </span>
                      </label>
                    ))}
                  </div>

                  <div>
                    <label style={{ fontSize: "14px", color: "#555" }}>
                      Select Broker:
                    </label>

                    <select
                      style={{
                        width: "100%",
                        padding: "8px",
                        marginTop: "5px",
                        fontSize: "14px",
                        borderRadius: "6px",
                        border: "1px solid #ccc",
                        color: "#333",
                      }}
                      value={selectedClient.broker || ""}
                      onChange={(e) =>
                        setSelectedClient((prev) => ({
                          ...prev,
                          broker: e.target.value,
                        }))
                      }
                    >
                      <option value="">-- Select Broker --</option>

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
                    <div
                      style={{
                        marginTop: "14px",
                        background: "#f8f9fa",
                        padding: "10px 12px",
                        borderRadius: "8px",
                        boxShadow: "inset 0 0 4px rgba(0,0,0,0.05)",
                      }}
                    >
                      <strong>Selected:</strong>
                      <ul
                        style={{
                          listStyle: "none",
                          padding: 0,
                          margin: "6px 0 0 0",
                        }}
                      >
                        {selectedClient.trade.map((trade, idx) => (
                          <li
                            key={idx}
                            style={{
                              backgroundColor: "#fff",
                              marginBottom: "6px",
                              padding: "6px 10px",
                              borderRadius: "6px",
                              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                              fontSize: "0.95rem",
                            }}
                          >
                            {trade}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "12px",
                    marginTop: "24px",
                  }}
                >
                  {/* ✏️ Edit Button */}
                  <button
                    onClick={handleEditClient} // Replace this with your edit function
                    style={{
                      background: "linear-gradient(90deg, #28a745, #34d058)",
                      color: "white",
                      border: "none",
                      padding: "10px 16px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontWeight: 600,
                      letterSpacing: "0.5px",
                      boxShadow: "0 3px 8px rgba(40,167,69,0.3)",
                      transition: "all 0.25s ease",
                      minWidth: "100px",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow =
                        "0 5px 12px rgba(40,167,69,0.4)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow =
                        "0 3px 8px rgba(40,167,69,0.3)";
                    }}
                  >
                    ✏️ Edit
                  </button>

                  {/* ❌ Close Button */}
                  <button
                    onClick={closeDrawer}
                    style={{
                      background: "linear-gradient(90deg, #007bff, #00a2ff)",
                      color: "white",
                      border: "none",
                      padding: "10px 16px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontWeight: 600,
                      letterSpacing: "0.5px",
                      boxShadow: "0 3px 8px rgba(0,123,255,0.3)",
                      transition: "all 0.25s ease",
                      minWidth: "100px",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow =
                        "0 5px 12px rgba(0,123,255,0.4)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow =
                        "0 3px 8px rgba(0,123,255,0.3)";
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
      {popupMessage && (
        <div
          style={{
            position: "fixed",
            bottom: "30px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "#333",
            color: "#fff",
            padding: "12px 20px",
            borderRadius: "8px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
            zIndex: 2000,
            fontWeight: "500",
            animation: "fadeInOut 2.5s ease",
          }}
        >
          {popupMessage}
        </div>
      )}

      {showDeleteModal && (
        <>
          {/* Dim background */}
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.45)",
              zIndex: 999,
            }}
            onClick={() => setShowDeleteModal(false)}
          />

          {/* Confirmation Box */}
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background: "#fff",
              padding: "25px 30px",
              borderRadius: "12px",
              boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
              zIndex: 1000,
              width: "350px",
              textAlign: "center",
              animation: "fadeInScale 0.3s ease",
            }}
          >
            <h3 style={{ marginBottom: "10px", color: "#d93025" }}>
              ⚠️ Confirm Delete
            </h3>
            <p style={{ marginBottom: "20px", color: "#555" }}>
              Are you sure you want to permanently remove this client?
            </p>
            <div
              style={{ display: "flex", justifyContent: "center", gap: "12px" }}
            >
              <button
                onClick={handleConfirmDelete}
                style={{
                  background: "linear-gradient(90deg, #dc3545, #ff6b81)",
                  color: "#fff",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "600",
                  transition: "transform 0.2s ease",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "scale(1.05)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
              >
                Yes, Delete
              </button>

              <button
                onClick={() => setShowDeleteModal(false)}
                style={{
                  background: "#e9ecef",
                  color: "#333",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "500",
                  transition: "background 0.2s ease",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#d6d8db")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "#e9ecef")
                }
              >
                Cancel
              </button>
            </div>

            {deleteToast && (
              <div
                style={{
                  position: "fixed",
                  bottom: "30px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "#333",
                  color: "#fff",
                  padding: "12px 20px",
                  borderRadius: "8px",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
                  fontWeight: "500",
                  zIndex: 2000,
                  animation: "fadeInOut 2.5s ease",
                }}
              >
                {deleteToast}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ClientsList;

// --- Inline Styles ---
const styles = {
  container: {
    maxWidth: "900px",
    margin: "40px auto",
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  heading: {
    textAlign: "center",
    color: "#333",
    marginBottom: "20px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  pagination: {
    marginTop: "20px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "10px",
  },
  pageBtn: {
    padding: "6px 12px",
    border: "none",
    background: "#1976d2",
    color: "#fff",
    borderRadius: "6px",
    cursor: "pointer",
  },
  pageText: {
    fontSize: "14px",
  },
  switch: {
    position: "relative",
    display: "inline-block",
    width: "42px",
    height: "24px",
  },

  sliderBefore: {
    position: "absolute",
    content: '""',
    height: "18px",
    width: "18px",
    left: "3px",
    bottom: "3px",
    backgroundColor: "white",
    transition: "0.4s",
    borderRadius: "50%",
  },
  slider: {
    position: "absolute",
    cursor: "pointer",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#ccc",
    borderRadius: "34px",
    transition: ".4s",
  },
  switchInput: {
    opacity: 0,
    width: 0,
    height: 0,
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
  td: {
    padding: "10px",
    borderBottom: "1px solid #ddd",
    fontSize: "14px",
    color: "#333",
    textAlign: "center",
    verticalAlign: "middle",
  },
  th: {
    padding: "12px 10px",
    backgroundColor: "#1976d2",
    color: "#fff",
    textAlign: "center",
    verticalAlign: "middle",
    fontSize: "14px",
    fontWeight: "600",
    borderBottom: "2px solid #1565c0",
  },
};
