// src/app/student/requests/page.js
"use client";
import DashboardLayout from "../../components/DashboardLayout";
import styles from "../../styles/Dashboard.module.css";

export default function MyRequests() {
  const myRequests = [
    {
      id: "REQ-001",
      issue: "Broken Tap",
      date: "May 08, 2026",
      status: "In Progress",
      desc: "Tap in bathroom leaking continuously.",
    },
    {
      id: "REQ-002",
      issue: "Lightbulb blown",
      date: "May 01, 2026",
      status: "Resolved",
      desc: "Main bedroom light is dead.",
    },
    {
      id: "REQ-003",
      issue: "Window latch broken",
      date: "May 09, 2026",
      status: "Pending",
      desc: "Cannot lock the window on the ground floor.",
    },
  ];

  const getStatusClass = (status) => {
    if (status === "Pending") return styles.statusPending;
    if (status === "In Progress") return styles.statusInProgress;
    return styles.statusResolved;
  };

  return (
    <DashboardLayout role="student" userName="Siphesihle">
      <h1 className={styles.pageTitle}>My Maintenance Requests</h1>

      <div className={styles.card}>
        <div className={styles.listContainer}>
          {myRequests.map((req) => (
            <div
              key={req.id}
              className={styles.listItem}
              style={{ flexDirection: "column", alignItems: "flex-start" }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  width: "100%",
                  marginBottom: "10px",
                }}
              >
                <h4 style={{ margin: 0, color: "#1e60a4" }}>
                  {req.issue}{" "}
                  <span style={{ fontSize: "12px", color: "#999" }}>
                    ({req.id})
                  </span>
                </h4>
                <span className={getStatusClass(req.status)}>{req.status}</span>
              </div>
              <p
                style={{
                  margin: "0 0 10px 0",
                  color: "#555",
                  fontSize: "14px",
                }}
              >
                {req.desc}
              </p>
              <small style={{ color: "#999" }}>Reported on: {req.date}</small>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
