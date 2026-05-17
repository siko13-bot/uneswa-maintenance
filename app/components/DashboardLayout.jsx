// src/components/DashboardLayout.js
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import Header from "./Header";
import styles from "../styles/Dashboard.module.css";

export default function DashboardLayout({ children, role }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);

      // Verify token with backend
      fetch("http://localhost:5000/api/auth/verify", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (!res.ok) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            router.push("/login");
          }
        })
        .catch(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          router.push("/login");
        });
    } catch (e) {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return <div style={{ padding: "20px" }}>Loading dashboard...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className={styles.dashboardContainer}>
      <Sidebar role={role || user.role} />
      <div className={styles.mainContent}>
        <Header userName={user.name} />
        <main className={styles.pageContent}>{children}</main>
      </div>
    </div>
  );
}
