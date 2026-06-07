// src/app/student/requests/[id]/page.js
"use client";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "../../../components/DashboardLayout";
import styles from "../../../styles/Dashboard.module.css";
import Spinner from "../../../components/Spinner";
import toast from "react-hot-toast";
import { useMessagePolling } from "../../../hooks/useMessagePolling";

export default function StudentRequestDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
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
        const [reqRes, msgRes] = await Promise.all([
          fetch(`http://localhost:5000/api/requests/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`http://localhost:5000/api/requests/${id}/messages`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        if (reqRes.ok && msgRes.ok) {
          setRequest(await reqRes.json());
          setInitialMessages(await msgRes.json());
          setInitLoaded(true);
        } else if (reqRes.status === 401) {
          router.push("/login");
        } else {
          toast.error("Failed to load request");
          router.push("/student/requests");
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
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setSending(true);
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
      setSending(false);
    }
  };

  const handleConfirmResolution = async () => {
    if (!confirm("Mark this issue as fully closed? This cannot be undone."))
      return;
    const toastId = toast.loading("Closing request...");
    try {
      const token = sessionStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/requests/${id}/confirm`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ confirmed: true }),
        },
      );
      if (res.ok) {
        setRequest(await res.json());
        toast.success("Request closed. Thank you!", { id: toastId });
      } else {
        toast.error("Failed to close", { id: toastId });
      }
    } catch {
      toast.error("Server error", { id: toastId });
    }
  };

  const handleReportIncomplete = async () => {
    const reportMsg = prompt(
      "Please describe what is still not working or incomplete:",
    );
    if (!reportMsg || !reportMsg.trim()) return;
    setSending(true);
    const toastId = toast.loading("Sending report...");
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
          body: JSON.stringify({ message: `[INCOMPLETE REPORT] ${reportMsg}` }),
        },
      );
      if (res.ok) {
        const savedMsg = await res.json();
        setMessages((prev) => {
          const exists = prev.some((m) => m.id === savedMsg.id);
          return exists ? prev : [...prev, savedMsg];
        });
        toast.success("Report sent. Admin has been notified.", { id: toastId });
      } else {
        toast.error("Failed to send", { id: toastId });
      }
    } catch {
      toast.error("Server error", { id: toastId });
    } finally {
      setSending(false);
    }
  };

  // ── Helpers ──────────────────────────────────────────────────────
  const formatDate = (d) => new Date(d).toLocaleString();

  const getStatusClass = (status) => {
    if (status === "Pending") return styles.statusPending;
    if (status === "In Progress") return styles.statusInProgress;
    if (status === "Resolved") return styles.statusResolved;
    if (status === "Closed") return styles.statusClosed;
    return "";
  };

  // ── Render guards ─────────────────────────────────────────────────
  if (loading) {
    return (
      <DashboardLayout role="student" userName="Student">
        <div
          style={{ display: "flex", justifyContent: "center", padding: "50px" }}
        >
          <Spinner size="large" />
        </div>
      </DashboardLayout>
    );
  }
  if (!request) return null;

  const isResolved = request.status === "Resolved";
  const isClosed = request.status === "Closed";

  // ── JSX ───────────────────────────────────────────────────────────
  return (
    <DashboardLayout
      role="student"
      userName={request.student_name || "Student"}
    >
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
            <span className={styles.detailLabel}>Category:</span>
            <span>{request.category}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Room:</span>
            <span>{request.room}</span>
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

          {request.staff_name && (
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Assigned to:</span>
              <span>
                {request.staff_name} ({request.staff_role})
              </span>
            </div>
          )}

          {request.image_url && (
            <div className={styles.imagePreview}>
              <span className={styles.detailLabel}>Attached Image:</span>
              <img
                src={`http://localhost:5000${request.image_url}`}
                alt="Issue"
                className={styles.requestImage}
                onError={(e) => (e.target.style.display = "none")}
              />
            </div>
          )}
        </div>

        {/* ── Right: Messages & actions ── */}
        <div className={styles.detailCard}>
          {/* Conversation heading with live indicator */}
          <h3
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 12,
            }}
          >
            Messages
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
              placeholder="Type your message here (e.g., additional details, updates)..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className={styles.messageInput}
              disabled={sending}
            />
            <button
              type="submit"
              className={styles.secondaryBtn}
              disabled={sending}
            >
              {sending ? "Sending..." : "Send Message"}
            </button>
          </form>

          {/* Resolution actions */}
          {isResolved && (
            <div className={styles.actionButtons}>
              <button
                onClick={handleConfirmResolution}
                className={styles.primaryBtn}
              >
                ✓ Confirm Resolution (Close Ticket)
              </button>
              <button
                onClick={handleReportIncomplete}
                className={styles.dangerBtn}
              >
                ✗ Report Issue Still Present
              </button>
            </div>
          )}

          {isClosed && (
            <div className={styles.closedNotice}>
              <p>
                This request has been closed. Thank you for your confirmation.
              </p>
            </div>
          )}
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
