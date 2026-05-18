// src/app/student/announcements/page.js
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "../../components/DashboardLayout";
import styles from "../../styles/Dashboard.module.css";
import { Megaphone } from "lucide-react";
import Spinner from "../../components/Spinner";

export default function StudentAnnouncements() {
  const router = useRouter();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/login");
      return;
    }
    setUser(JSON.parse(userData));

    const fetchAnnouncements = async () => {
      try {
        const token = localStorage.getItem("token");
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
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, [router]);

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
      <h1 className={styles.pageTitle}>Residence Announcements</h1>

      {announcements.length === 0 ? (
        <div className={styles.card}>
          <p style={{ textAlign: "center", color: "#666" }}>
            No announcements at this time.
          </p>
        </div>
      ) : (
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
              <p
                style={{
                  color: "#555",
                  marginBottom: "10px",
                  lineHeight: "1.5",
                }}
              >
                {ann.content}
              </p>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <small style={{ color: "#999" }}>
                  Posted:{" "}
                  {new Date(ann.created_at).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </small>
                {ann.author_name && (
                  <small style={{ color: "#999" }}>By: {ann.author_name}</small>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
