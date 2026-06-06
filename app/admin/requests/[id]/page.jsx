// src/app/admin/requests/[id]/page.js
"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "../../../components/DashboardLayout";
import styles from "../../../styles/Dashboard.module.css";
import toast from "react-hot-toast";
import Spinner, { FullPageLoader } from "../../../components/Spinner";

export default function AdminRequestDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [request, setRequest] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newMessage, setNewMessage] = useState("");

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
          const reqData = await reqRes.json();
          const staffData = await staffRes.json();
          const msgData = await msgRes.json();
          setRequest(reqData);
          setStaffList(staffData);
          setMessages(msgData);
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
        const updated = await res.json();
        setRequest(updated);
        toast.success("Status updated");
      } else {
        const error = await res.json();
        toast.error(error.error || "Update failed");
      }
    } catch (error) {
      console.error(error);
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
        const updated = await res.json();
        setRequest(updated);
        toast.success("Staff assigned");
      } else {
        const error = await res.json();
        toast.error(error.error || "Assignment failed");
      }
    } catch (error) {
      console.error(error);
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
        setMessages([...messages, savedMsg]);
        setNewMessage("");
        toast.success("Message sent", { id: toastId });
      } else {
        toast.error("Failed to send", { id: toastId });
      }
    } catch (error) {
      console.error(error);
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
        const updated = await res.json();
        setRequest(updated);
        toast.success("Request reopened", { id: toastId });
      } else {
        toast.error("Failed to reopen", { id: toastId });
      }
    } catch (error) {
      console.error(error);
      toast.error("Server error", { id: toastId });
    } finally {
      setUpdating(false);
    }
  };

  const getStatusClass = (status) => {
    if (status === "Pending") return styles.statusPending;
    if (status === "In Progress") return styles.statusInProgress;
    if (status === "Resolved") return styles.statusResolved;
    if (status === "Closed") return styles.statusClosed;
    return "";
  };
  const formatDate = (dateString) => new Date(dateString).toLocaleString();

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

  return (
    <DashboardLayout role="admin" userName="Mnguni">
      <div className={styles.pageHeader}>
        <button onClick={() => router.back()} className={styles.secondaryBtn}>
          ← Back
        </button>
        <h1 className={styles.pageTitle}>Request #{request.id}</h1>
      </div>

      <div className={styles.detailGrid}>
        {/* Left – Info */}
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

        {/* Right – Actions & Messages */}
        <div className={styles.detailCard}>
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
            <button onClick={handleReopen} className={styles.reopenBtn}>
              🔄 Reopen Request
            </button>
          )}

          <hr style={{ margin: "24px 0" }} />

          <h3>Conversation</h3>
          {/* Messages – WhatsApp style */}
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
                className={`${styles.messageItem} ${msg.is_from_student ? styles.studentMessage : styles.adminMessage}`}
              >
                <div className={styles.messageBubble}>
                  <div className={styles.messageHeader}>
                    <strong>{msg.user_name}</strong>
                    <span style={{ fontSize: "10px", color: "#888" }}>
                      {formatDate(msg.created_at)}
                    </span>
                  </div>
                  <p className={styles.messageText}>{msg.message}</p>
                  {/* Optional: add read/delivered icons, but keep simple */}
                </div>
              </div>
            ))}
          </div>
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
              Send Message
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
