// src/app/admin/requests/[id]/page.js
"use client";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "../../../components/DashboardLayout";
import styles from "../../../styles/Dashboard.module.css";
import toast from "react-hot-toast";
import { FullPageLoader } from "../../../components/Spinner";
import { useMessagePolling } from "../../../hooks/useMessagePolling";

export default function AdminRequestDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [request, setRequest] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newMessage, setNewMessage] = useState("");

  // Initial messages loaded separately so the hook can take over
  const [initialMessages, setInitialMessages] = useState([]);
  const [initLoaded, setInitLoaded] = useState(false);

  // Auto-scroll ref
  const messagesEndRef = useRef(null);

  // ── Initial data fetch ───────────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const [reqRes, staffRes, msgRes] = await Promise.all([
          fetch(`http://localhost:5000/api/requests/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:5000/api/staff", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`http://localhost:5000/api/requests/${id}/messages`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        if (reqRes.ok && staffRes.ok && msgRes.ok) {
          setRequest(await reqRes.json());
          setStaffList(await staffRes.json());
          setInitialMessages(await msgRes.json());
          setInitLoaded(true);
        } else {
          toast.error("Failed to load request details");
          router.push("/admin");
        }
      } catch (error) {
        console.error(error);
        toast.error("Server error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, router]);

  // ── Live polling (starts only after initial load) ────────────────
  const { messages, setMessages } = useMessagePolling(
    initLoaded ? id : null,
    initialMessages,
  );

  // ── Auto-scroll whenever messages change ─────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Handlers ─────────────────────────────────────────────────────
  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    try {
      const token = sessionStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/requests/${id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        },
      );
      if (res.ok) {
        setRequest(await res.json());
        toast.success("Status updated");
      } else {
        const err = await res.json();
        toast.error(err.error || "Update failed");
      }
    } catch {
      toast.error("Server error");
    } finally {
      setUpdating(false);
    }
  };

  const handleAssignStaff = async (staffId) => {
    if (!staffId) return;
    setUpdating(true);
    try {
      const token = sessionStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/requests/${id}/assign`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ staff_id: staffId }),
        },
      );
      if (res.ok) {
        setRequest(await res.json());
        toast.success("Staff assigned");
      } else {
        const err = await res.json();
        toast.error(err.error || "Assignment failed");
      }
    } catch {
      toast.error("Server error");
    } finally {
      setUpdating(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setUpdating(true);
    const toastId = toast.loading("Sending message...");
    try {
      const token = sessionStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/requests/${id}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ message: newMessage }),
        },
      );
      if (res.ok) {
        const savedMsg = await res.json();
        // Add optimistically — polling deduplicates automatically
        setMessages((prev) => {
          const exists = prev.some((m) => m.id === savedMsg.id);
          return exists ? prev : [...prev, savedMsg];
        });
        setNewMessage("");
        toast.success("Message sent", { id: toastId });
      } else {
        toast.error("Failed to send", { id: toastId });
      }
    } catch {
      toast.error("Server error", { id: toastId });
    } finally {
      setUpdating(false);
    }
  };

  const handleReopen = async () => {
    if (
      !confirm("Reopen this closed request? It will be set to 'In Progress'.")
    )
      return;
    setUpdating(true);
    const toastId = toast.loading("Reopening request...");
    try {
      const token = sessionStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/requests/${id}/reopen`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (res.ok) {
        setRequest(await res.json());
        toast.success("Request reopened", { id: toastId });
      } else {
        toast.error("Failed to reopen", { id: toastId });
      }
    } catch {
      toast.error("Server error", { id: toastId });
    } finally {
      setUpdating(false);
    }
  };

  // ── Helpers ──────────────────────────────────────────────────────
  const getStatusClass = (status) => {
    if (status === "Pending") return styles.statusPending;
    if (status === "In Progress") return styles.statusInProgress;
    if (status === "Resolved") return styles.statusResolved;
    if (status === "Closed") return styles.statusClosed;
    return "";
  };

  const formatDate = (d) => new Date(d).toLocaleString();

  // ── Render guards ─────────────────────────────────────────────────
  if (loading)
    return (
      <DashboardLayout role="admin" userName="Admin">
        <FullPageLoader />
      </DashboardLayout>
    );
  if (!request)
    return (
      <DashboardLayout role="admin" userName="Admin">
        <div className={styles.card}>Request not found.</div>
      </DashboardLayout>
    );

  const isClosed = request.status === "Closed";

  // ── JSX ───────────────────────────────────────────────────────────
  return (
    <DashboardLayout role="admin" userName="Mnguni">
      <div className={styles.pageHeader}>
        <button onClick={() => router.back()} className={styles.secondaryBtn}>
          ← Back
        </button>
        <h1 className={styles.pageTitle}>Request #{request.id}</h1>
      </div>

      <div className={styles.detailGrid}>
        {/* ── Left: Request info ── */}
        <div className={styles.detailCard}>
          <h3>Request Information</h3>

          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Student:</span>
            <span>{request.student_name}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Room:</span>
            <span>{request.room}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Category:</span>
            <span>{request.category}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Urgency:</span>
            <span
              className={request.urgency === "High" ? styles.urgentText : ""}
            >
              {request.urgency}
            </span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Description:</span>
            <p>{request.description}</p>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Reported:</span>
            <span>{formatDate(request.created_at)}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Status:</span>
            <span className={getStatusClass(request.status)}>
              {request.status}
            </span>
          </div>

          {request.image_url && (
            <div className={styles.imagePreview}>
              <span className={styles.detailLabel}>Image:</span>
              <img
                src={`http://localhost:5000${request.image_url}`}
                alt="Issue"
                className={styles.requestImage}
                onError={(e) => (e.target.style.display = "none")}
              />
            </div>
          )}
        </div>

        {/* ── Right: Actions + messages ── */}
        <div className={styles.detailCard}>
          {/* Status selector */}
          <div className={styles.formGroup}>
            <label>Status</label>
            <select
              value={request.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className={`${styles.statusDropdown} ${getStatusClass(request.status)}`}
              disabled={updating}
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          {/* Staff assignment */}
          <div className={styles.formGroup}>
            <label>Assign to Staff</label>
            <select
              value={request.staff_id || ""}
              onChange={(e) => handleAssignStaff(e.target.value)}
              className={styles.assignSelect}
              disabled={updating}
            >
              <option value="">Unassigned</option>
              {staffList.map((staff) => (
                <option key={staff.id} value={staff.id}>
                  {staff.name} ({staff.role})
                </option>
              ))}
            </select>
          </div>

          {request.staff_name && (
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Current:</span>
              <span>
                {request.staff_name} ({request.staff_role})
              </span>
            </div>
          )}

          {isClosed && (
            <button
              onClick={handleReopen}
              className={styles.warningBtn}
              style={{ marginTop: 16, width: "100%" }}
            >
              Reopen Request
            </button>
          )}

          <hr style={{ margin: "24px 0" }} />

          {/* Conversation heading with live indicator */}
          <h3
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 12,
            }}
          >
            Conversation
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                fontSize: 11,
                fontWeight: 500,
                color: "#27ae60",
                background: "#e9f7ef",
                padding: "2px 8px",
                borderRadius: 999,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#27ae60",
                  display: "inline-block",
                  animation: "livePulse 2s infinite",
                }}
              />
              Live
            </span>
          </h3>

          {/* Message list */}
          <div className={styles.messagesContainer}>
            {messages.length === 0 && (
              <p
                style={{
                  textAlign: "center",
                  color: "#666",
                  fontStyle: "italic",
                }}
              >
                No messages yet. Start the conversation.
              </p>
            )}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`${styles.messageItem} ${
                  msg.is_from_student
                    ? styles.studentMessage
                    : styles.adminMessage
                }`}
              >
                <div className={styles.messageBubble}>
                  <div className={styles.messageHeader}>
                    <strong>{msg.user_name}</strong>
                    <span style={{ fontSize: 10, color: "#888" }}>
                      {formatDate(msg.created_at)}
                    </span>
                  </div>
                  <p className={styles.messageText}>{msg.message}</p>
                </div>
              </div>
            ))}
            {/* Auto-scroll anchor */}
            <div ref={messagesEndRef} />
          </div>

          {/* Send form */}
          <form onSubmit={handleSendMessage} className={styles.messageForm}>
            <textarea
              rows={2}
              placeholder="Reply to student..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className={styles.messageInput}
              disabled={updating}
            />
            <button
              type="submit"
              className={styles.secondaryBtn}
              disabled={updating}
            >
              {updating ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>
      </div>

      {/* Pulse keyframe — scoped to this page */}
      <style>{`
        @keyframes livePulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.25; }
        }
      `}</style>
    </DashboardLayout>
  );
}
