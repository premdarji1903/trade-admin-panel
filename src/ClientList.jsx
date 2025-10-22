import React, { useEffect, useState } from "react";
import axios from "axios";

const ClientsList = () => {
  const [clients, setClients] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchClients = async (pageNumber = 1) => {
    try {
      setLoading(true);
      const res = await axios.get(
        `https://trade-client-server.onrender.com/clients?page=${pageNumber}&limit=10`
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
      await axios.patch(`https://trade-client-server.onrender.com/clients/${clientId}/isPaid`, {
        isPaid: newValue,
      });

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
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Phone</th>
              <th style={styles.th}>Paid</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client, index) => (
              <tr key={client._id}>
                <td style={styles.td}>{index + 1 + (page - 1) * 10}</td>
                <td style={styles.td}>{client.clientName || "N/A"}</td>
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
