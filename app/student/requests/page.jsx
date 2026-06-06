// src/app/student/requests/page.js
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "../../components/DashboardLayout";
import styles from "../../styles/Dashboard.module.css";
import Spinner from "../../components/Spinner";

export default function MyRequests() {
  const router = useRouter();
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    const userData = sessionStorage.getItem("user");
    if (!userData) {
      router.push("/login");
      return;
    }
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);

    const fetchMyRequests = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const res = await fetch(
          `http://localhost:5000/api/requests/student/${parsedUser.id}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (res.ok) {
          const data = await res.json();
          setMyRequests(data);
        } else if (res.status === 401) {
          router.push("/login");
        }
      } catch (error) {
        console.error("Failed to fetch requests", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyRequests();
  }, [router]);

  const getStatusClass = (status) => {
    if (status === "Pending") return styles.statusPending;
    if (status === "In Progress") return styles.statusInProgress;
    if (status === "Resolved") return styles.statusResolved;
    if (status === "Closed") return styles.statusClosed;
    return "";
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const STATUS_FILTERS = [
    "All",
    "Pending",
    "In Progress",
    "Resolved",
    "Closed",
  ];

  const filtered =
    filter === "All"
      ? myRequests
      : myRequests.filter((r) => r.status === filter);

  if (loading) {
    return (
      <DashboardLayout role="student" userName={user?.name || "Student"}>
        <div
          style={{ display: "flex", justifyContent: "center", padding: "50px" }}
        >
          <Spinner size="large" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="student" userName={user?.name || "Student"}>
      {/* Page header */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>My Maintenance Requests</h1>
        <span
          style={{
            marginLeft: "auto",
            fontSize: "13px",
            color: "#888",
            alignSelf: "center",
          }}
        >
          {filtered.length} request{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Quick stats row */}
      <div className={styles.adminStatsRow} style={{ marginBottom: "24px" }}>
        {[
          { label: "Total", value: myRequests.length, color: "#4a90e2" },
          {
            label: "Pending",
            value: myRequests.filter((r) => r.status === "Pending").length,
            color: "#f5a623",
          },
          {
            label: "In Progress",
            value: myRequests.filter((r) => r.status === "In Progress").length,
            color: "#28a745",
          },
          {
            label: "Resolved",
            value: myRequests.filter((r) => r.status === "Resolved").length,
            color: "#6c757d",
          },
        ].map((s) => (
          <div
            key={s.label}
            className={styles.adminStatCard}
            style={{
              background: s.color,
              cursor: "pointer",
              transition: "opacity 0.2s",
            }}
            onClick={() => setFilter(s.label === "Total" ? "All" : s.label)}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            <p>{s.label}</p>
            <h2>{s.value}</h2>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "20px",
          flexWrap: "wrap",
        }}
      >
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            style={{
              padding: "6px 16px",
              borderRadius: "999px",
              border: "1px solid",
              fontSize: "13px",
              fontWeight: "500",
              cursor: "pointer",
              transition: "all 0.15s ease",
              borderColor: filter === s ? "#1e60a4" : "#e0e0e0",
              background: filter === s ? "#1e60a4" : "white",
              color: filter === s ? "white" : "#555",
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Request cards */}
      <div className={styles.listContainer} style={{ marginTop: 0 }}>
        {filtered.length === 0 ? (
          <div
            className={styles.card}
            style={{ textAlign: "center", padding: "48px 20px", color: "#888" }}
          >
            <p style={{ fontSize: "16px", marginBottom: "6px" }}>
              {filter === "All"
                ? "You haven't submitted any maintenance requests yet."
                : `No ${filter.toLowerCase()} requests.`}
            </p>
            {filter === "All" && (
              <button
                className={styles.primaryBtn}
                style={{
                  marginTop: "16px",
                  width: "auto",
                  padding: "10px 24px",
                }}
                onClick={() => router.push("/student/report")}
              >
                Report an issue
              </button>
            )}
          </div>
        ) : (
          filtered.map((req) => (
            <div
              key={req.id}
              className={styles.requestCard}
              onClick={() => router.push(`/student/requests/${req.id}`)}
              style={{ cursor: "pointer" }}
            >
              {/* Card top row: ID pill + title + status badge */}
              <div className={styles.requestHeader}>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: "700",
                      color: "#1e60a4",
                      background: "#e8f0fb",
                      padding: "3px 10px",
                      borderRadius: "999px",
                      letterSpacing: "0.3px",
                      flexShrink: 0,
                    }}
                  >
                    #{req.id}
                  </span>
                  <h4 className={styles.requestTitle}>
                    {req.category} — {req.room}
                  </h4>
                </div>
                <span className={getStatusClass(req.status)}>{req.status}</span>
              </div>

              {/* Description */}
              <p className={styles.requestDescription}>
                {req.description.length > 120
                  ? req.description.substring(0, 120) + "..."
                  : req.description}
              </p>

              {/* Meta row */}
              <div className={styles.requestMeta}>
                <small>📅 Reported: {formatDate(req.created_at)}</small>
                <small className={req.urgency === "High" ? styles.urgent : ""}>
                  {req.urgency === "High"
                    ? "🔴"
                    : req.urgency === "Medium"
                      ? "🟡"
                      : "🟢"}{" "}
                  {req.urgency} urgency
                </small>
                {req.updated_at !== req.created_at && (
                  <small className={styles.statusUpdated}>
                    ↻ Updated: {formatDate(req.updated_at)}
                  </small>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </DashboardLayout>
  );
}
