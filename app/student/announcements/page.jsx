// src/app/student/announcements/page.js
import DashboardLayout from "../../components/DashboardLayout";
import styles from "../../styles/Dashboard.module.css";
import { Megaphone } from "lucide-react";

export default function StudentAnnouncements() {
  // Read-only mock data for students
  const announcements = [
    {
      id: 1,
      title: "Water Shortage Notice",
      content:
        "There will be a water cut in F Block tomorrow from 8 AM to 12 PM due to municipal repairs.",
      date: "May 10, 2026",
    },
    {
      id: 2,
      title: "Fumigation Schedule",
      content:
        "All rooms in Block C will be fumigated this weekend. Please secure your food items.",
      date: "May 05, 2026",
    },
  ];

  return (
    <DashboardLayout role="student" userName="Siphesihle">
      <h1 className={styles.pageTitle}>Residence Announcements</h1>
      <div className={styles.listContainer}>
        {announcements.map((ann) => (
          <div key={ann.id} className={styles.card}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "10px",
              }}
            >
              <Megaphone size={20} color="#f39c12" />
              <h3 style={{ margin: 0 }}>{ann.title}</h3>
            </div>
            <p style={{ color: "#555", marginBottom: "10px" }}>{ann.content}</p>
            <small style={{ color: "#999" }}>Posted: {ann.date}</small>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
