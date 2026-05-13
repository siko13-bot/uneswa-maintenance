// src/app/student/requests/page.js
"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import styles from "../../styles/Dashboard.module.css";

export default function MyRequests() {
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyRequests = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/requests/student/1");
        if (res.ok) {
          const data = await res.json();
          setMyRequests(data);
        }
      } catch (error) {
        console.error("Failed to fetch requests", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyRequests();
  }, []);

  const getStatusClass = (status) => {
    if (status === "Pending") return styles.statusPending;
    if (status === "In Progress") return styles.statusInProgress;
    return styles.statusResolved;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <DashboardLayout role="student" userName="Siphesihle">
      <h1 className={styles.pageTitle}>My Maintenance Requests</h1>

      <div className={styles.card}>
        <div className={styles.listContainer}>
          {loading ? (
            <p>Loading your requests...</p>
          ) : myRequests.length === 0 ? (
            <p>You have no maintenance requests.</p>
          ) : (
            myRequests.map((req) => (
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
                    {req.category} in {req.room}
                  </h4>
                  <span className={getStatusClass(req.status)}>
                    {req.status}
                  </span>
                </div>
                <p
                  style={{
                    margin: "0 0 10px 0",
                    color: "#555",
                    fontSize: "14px",
                  }}
                >
                  {req.description}
                </p>
                <div style={{ display: "flex", gap: "15px" }}>
                  <small style={{ color: "#999" }}>
                    Reported: {formatDate(req.created_at)}
                  </small>
                  <small
                    style={{
                      color: req.urgency === "High" ? "#e74c3c" : "#999",
                    }}
                  >
                    Urgency: {req.urgency}
                  </small>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
