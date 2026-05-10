// src/app/student/notifications/page.js
import DashboardLayout from "../../components/DashboardLayout";
import styles from "../../styles/Dashboard.module.css";
import { Bell } from "lucide-react";

export default function StudentNotifications() {
  const notifications = [
    {
      id: 1,
      title: "Status Updated",
      message: "Your request 'Broken Tap' is now In Progress.",
      date: "2 hours ago",
      read: false,
    },
    {
      id: 2,
      title: "Request Resolved",
      message: "Your request 'Lightbulb blown' was marked as Resolved.",
      date: "1 week ago",
      read: true,
    },
  ];

  return (
    <DashboardLayout role="student" userName="Siphesihle">
      <h1 className={styles.pageTitle}>Notifications</h1>
      <div className={styles.listContainer}>
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className={`${styles.listItem} ${!notif.read ? styles.unread : ""}`}
          >
            <Bell size={24} color={notif.read ? "#999" : "#1e60a4"} />
            <div className={styles.itemContent}>
              <h4>{notif.title}</h4>
              <p>{notif.message}</p>
              <small>{notif.date}</small>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
