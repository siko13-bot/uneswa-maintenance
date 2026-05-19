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

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/login");
      return;
    }
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);

    const fetchMyRequests = async () => {
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
    return "";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handleRequestClick = (id) => {
    router.push(`/student/requests/${id}`);
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
      <h1 className={styles.pageTitle}>My Maintenance Requests</h1>

      <div className={styles.card}>
        <div className={styles.listContainer}>
          {myRequests.length === 0 ? (
            <p>You have no maintenance requests.</p>
          ) : (
            myRequests.map((req) => (
              <div
                key={req.id}
                className={styles.requestCard}
                onClick={() => handleRequestClick(req.id)}
                style={{ cursor: "pointer" }}
              >
                <div className={styles.requestHeader}>
                  <h4 className={styles.requestTitle}>
                    {req.category} in {req.room}
                  </h4>
                  <span className={getStatusClass(req.status)}>
                    {req.status}
                  </span>
                </div>
                <p className={styles.requestDescription}>
                  {req.description.length > 100
                    ? req.description.substring(0, 100) + "..."
                    : req.description}
                </p>
                <div className={styles.requestMeta}>
                  <small>Reported: {formatDate(req.created_at)}</small>
                  <small
                    className={req.urgency === "High" ? styles.urgent : ""}
                  >
                    Urgency: {req.urgency}
                  </small>
                  {req.updated_at !== req.created_at && (
                    <small className={styles.statusUpdated}>
                      Status updated: {formatDate(req.updated_at)}
                    </small>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
