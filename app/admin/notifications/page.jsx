// src/app/admin/notifications/page.js
"use client";
import { useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import styles from "../../styles/Dashboard.module.css";
import { Bell, CheckCircle } from "lucide-react";

export default function AdminNotifications() {
  // Front-end mock state
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "New Urgent Request",
      message: "Water pipe burst in Hall Block C.",
      date: "Just now",
      read: false,
    },
    {
      id: 2,
      title: "Request Updated",
      message: "Musa marked Electrical Fault as fixed.",
      date: "2 hours ago",
      read: false,
    },
    {
      id: 3,
      title: "System Alert",
      message: "Scheduled maintenance for the server at midnight.",
      date: "1 day ago",
      read: true,
    },
  ]);

  const markAsRead = (id) => {
    setNotifications(
      notifications.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif,
      ),
    );
  };

  return (
    <DashboardLayout role="admin" userName="Mnguni">
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Notifications</h1>
      </div>

      <div className={styles.listContainer}>
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className={`${styles.listItem} ${!notif.read ? styles.unread : ""}`}
          >
            <div className={styles.itemIcon}>
              <Bell size={24} color={notif.read ? "#999" : "#1e60a4"} />
            </div>
            <div className={styles.itemContent}>
              <h4>{notif.title}</h4>
              <p>{notif.message}</p>
              <small>{notif.date}</small>
            </div>
            {!notif.read && (
              <button
                onClick={() => markAsRead(notif.id)}
                className={styles.iconBtn}
                title="Mark as read"
              >
                <CheckCircle size={20} color="#28a745" />
              </button>
            )}
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
