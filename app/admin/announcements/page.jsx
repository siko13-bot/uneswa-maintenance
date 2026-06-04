// src/app/admin/announcements/page.js
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "../../components/DashboardLayout";
import styles from "../../styles/Dashboard.module.css";
import { Megaphone, Trash2, Edit2 } from "lucide-react";
import toast from "react-hot-toast";
import Spinner from "../../components/Spinner";

export default function AdminAnnouncements() {
  const router = useRouter();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch announcements from database
  const fetchAnnouncements = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/announcements", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(data);
      } else if (res.status === 401) {
        router.push("/login");
      }
    } catch (error) {
      console.error("Failed to fetch announcements:", error);
      toast.error("Failed to load announcements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    if (!newTitle || !newContent) return;
    setIsSubmitting(true);
    const toastId = toast.loading("Posting announcement...");

    try {
      const token = sessionStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/announcements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: newTitle, content: newContent }),
      });

      if (res.ok) {
        toast.success("Announcement posted!", { id: toastId });
        setNewTitle("");
        setNewContent("");
        fetchAnnouncements(); // Refresh the list
      } else {
        toast.error("Failed to post announcement", { id: toastId });
      }
    } catch (error) {
      console.error("Error posting announcement:", error);
      toast.error("Server error", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteAnnouncement = async (id) => {
    const toastId = toast.loading("Deleting announcement...");
    try {
      const token = sessionStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/announcements/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        toast.success("Announcement deleted", { id: toastId });
        fetchAnnouncements();
      } else {
        toast.error("Failed to delete", { id: toastId });
      }
    } catch (error) {
      console.error("Error deleting announcement:", error);
      toast.error("Server error", { id: toastId });
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="admin" userName="Mnguni">
        <div
          style={{ display: "flex", justifyContent: "center", padding: "50px" }}
        >
          <Spinner size="large" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin" userName="Mnguni">
      <h1 className={styles.pageTitle}>Announcements Management</h1>

      <div className={styles.dashboardGrid}>
        {/* Left Side: Post Form */}
        <div className={styles.leftColumn}>
          <div className={styles.card}>
            <h3>Post New Announcement</h3>
            <form onSubmit={handlePostAnnouncement} className={styles.form}>
              <div className={styles.formGroup}>
                <label>Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., Power Outage Warning"
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Message</label>
                <textarea
                  rows="4"
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Type the announcement details here..."
                  required
                />
              </div>
              <button
                type="submit"
                className={styles.primaryBtn}
                disabled={isSubmitting}
              >
                <Megaphone size={18} />
                {isSubmitting ? "Posting..." : "Post Announcement"}
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Previous Announcements */}
        <div className={styles.rightColumn}>
          <div className={styles.card}>
            <h3>Active Announcements ({announcements.length})</h3>
            <div className={styles.listContainer}>
              {announcements.length === 0 ? (
                <p>No active announcements.</p>
              ) : (
                announcements.map((ann) => (
                  <div key={ann.id} className={styles.announcementItem}>
                    <div className={styles.annContent}>
                      <h4>{ann.title}</h4>
                      <p>{ann.content}</p>
                      <small>
                        Posted by {ann.author_name} on{" "}
                        {new Date(ann.created_at).toLocaleDateString()}
                      </small>
                    </div>
                    <button
                      onClick={() => deleteAnnouncement(ann.id)}
                      className={styles.iconBtnDel}
                      title="Delete announcement"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
