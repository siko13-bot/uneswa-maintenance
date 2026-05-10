// src/app/admin/announcements/page.js
"use client";
import { useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import styles from "../../styles/Dashboard.module.css";
import { Megaphone, Trash2 } from "lucide-react";

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState([
    {
      id: 1,
      title: "Water Shortage Notice",
      content:
        "There will be a water cut in F Block tomorrow from 8 AM to 12 PM.",
      date: "May 10, 2026",
    },
  ]);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");

  const handlePostAnnouncement = (e) => {
    e.preventDefault();
    if (!newTitle || !newContent) return;

    const newAnnouncement = {
      id: Date.now(),
      title: newTitle,
      content: newContent,
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    };

    setAnnouncements([newAnnouncement, ...announcements]); // Add to top
    setNewTitle(""); // Clear form
    setNewContent("");
  };

  const deleteAnnouncement = (id) => {
    setAnnouncements(announcements.filter((a) => a.id !== id));
  };

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
                ></textarea>
              </div>
              <button type="submit" className={styles.primaryBtn}>
                <Megaphone size={18} /> Post Announcement
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Previous Announcements */}
        <div className={styles.rightColumn}>
          <div className={styles.card}>
            <h3>Active Announcements</h3>
            <div className={styles.listContainer}>
              {announcements.length === 0 ? (
                <p>No active announcements.</p>
              ) : (
                announcements.map((ann) => (
                  <div key={ann.id} className={styles.announcementItem}>
                    <div className={styles.annContent}>
                      <h4>{ann.title}</h4>
                      <p>{ann.content}</p>
                      <small>{ann.date}</small>
                    </div>
                    <button
                      onClick={() => deleteAnnouncement(ann.id)}
                      className={styles.iconBtnDel}
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
