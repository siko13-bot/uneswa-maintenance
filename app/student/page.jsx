// src/app/student/page.js
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "../components/DashboardLayout";
import styles from "../styles/Dashboard.module.css";
import { Wrench } from "lucide-react";
import Spinner from "../components/Spinner";

export default function StudentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pending: 0,
    inProgress: 0,
    resolved: 0,
  });

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/login");
      return;
    }
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);

    const fetchRequests = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `http://localhost:5000/api/requests/student/${parsedUser.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (res.ok) {
          const data = await res.json();
          setRequests(data);
          const pending = data.filter((r) => r.status === "Pending").length;
          const inProgress = data.filter(
            (r) => r.status === "In Progress",
          ).length;
          const resolved = data.filter((r) => r.status === "Resolved").length;
          setStats({ pending, inProgress, resolved });
        } else if (res.status === 401) {
          router.push("/login");
        }
      } catch (error) {
        console.error("Failed to fetch requests", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, [router]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getStatusClass = (status) => {
    if (status === "Pending") return styles.statusPending;
    if (status === "In Progress") return styles.statusInProgress;
    return styles.statusResolved;
  };

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
      <div className={styles.welcomeSection}>
        <h1>Welcome, {user?.name || "Student"}</h1>
      </div>

      <button
        onClick={() => router.push("/student/report")}
        className={styles.reportButton}
      >
        <Wrench size={24} /> Report Maintenance Issue
      </button>

      <div className={styles.statsContainer}>
        <div className={styles.statCard}>
          <h2>{stats.pending}</h2>
          <p>Pending Requests</p>
          <small>Current unresolved issues</small>
        </div>
        <div className={styles.statCard}>
          <h2 style={{ color: "#f39c12" }}>{stats.inProgress}</h2>
          <p>In Progress</p>
          <small>Issues being addressed</small>
        </div>
        <div className={styles.statCard}>
          <h2 style={{ color: "#28a745" }}>{stats.resolved}</h2>
          <p>Resolved Requests</p>
          <small>Issues successfully completed</small>
        </div>
      </div>

      <div className={styles.tableSection}>
        <h3>Recent Requests</h3>
        {requests.length === 0 ? (
          <p style={{ padding: "20px", textAlign: "center", color: "#666" }}>
            You haven't submitted any maintenance requests yet.
          </p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Issue</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {requests.slice(0, 5).map((req) => (
                <tr key={req.id}>
                  <td>
                    {req.category} - {req.description.substring(0, 50)}...
                  </td>
                  <td>{formatDate(req.created_at)}</td>
                  <td>
                    <span className={getStatusClass(req.status)}>
                      {req.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {requests.length > 5 && (
          <div className={styles.viewAll}>
            <a href="/student/requests">View All Requests &gt;</a>
          </div>
        )}
      </div>

      <div className={styles.infoCardsRow}>
        <div className={styles.infoCard}>
          <h4>Guidelines</h4>
          <p>
            Review maintenance request guidelines on reporting faults accurately
            and urgently.
          </p>
        </div>
        <div className={styles.infoCard}>
          <h4>Need Help?</h4>
          <p>For assistance, Contact the Maintenance Department.</p>
          <small>Email: maintenance@uneswa.sz | Phone: +268 2517 0000</small>
        </div>
      </div>
    </DashboardLayout>
  );
}
