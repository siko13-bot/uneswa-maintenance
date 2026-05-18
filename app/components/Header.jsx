// src/components/Header.js
"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Search, Bell, LogOut } from "lucide-react";
import styles from "../styles/Components.module.css";

export default function Header({ userName, userId, role }) {
  const router = useRouter();
  const pathname = usePathname();
  const [updateCount, setUpdateCount] = useState(0);
  const [lastViewed, setLastViewed] = useState(null);
  const isFetching = useRef(false);

  // Check if we're on the My Requests page
  const isOnMyRequestsPage = pathname === "/student/requests";

  // Get last viewed timestamp from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(`last_viewed_requests_${userId}`);
    if (stored) {
      setLastViewed(stored);
    } else {
      const defaultDate = new Date(
        Date.now() - 7 * 24 * 60 * 60 * 1000,
      ).toISOString();
      setLastViewed(defaultDate);
    }
  }, [userId]);

  // Fetch update count
  const fetchUpdateCount = async () => {
    if (!userId || !lastViewed || isFetching.current) return;

    // Don't fetch if we're on the My Requests page
    if (isOnMyRequestsPage) return;

    isFetching.current = true;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/requests/student/${userId}/updates`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Last-Viewed": lastViewed,
          },
        },
      );
      if (res.ok) {
        const data = await res.json();
        setUpdateCount(data.count);
      }
    } catch (error) {
      console.error("Failed to fetch update count:", error);
    } finally {
      isFetching.current = false;
    }
  };

  // Fetch count on mount and every 30 seconds (but not on My Requests page)
  useEffect(() => {
    if (userId && lastViewed && !isOnMyRequestsPage) {
      fetchUpdateCount();
      const interval = setInterval(fetchUpdateCount, 30000);
      return () => clearInterval(interval);
    }
  }, [userId, lastViewed, isOnMyRequestsPage]);

  // Clear badge when visiting My Requests page
  useEffect(() => {
    if (isOnMyRequestsPage && updateCount > 0) {
      // Update last viewed timestamp
      const now = new Date().toISOString();
      localStorage.setItem(`last_viewed_requests_${userId}`, now);
      setLastViewed(now);
      setUpdateCount(0);
    }
  }, [isOnMyRequestsPage, userId, updateCount]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const handleBellClick = () => {
    if (role === "student") {
      router.push("/student/requests");
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerTitle}>
        <h3>Residence Maintenance System</h3>
      </div>

      <div className={styles.headerRight}>
        <div className={styles.searchBar}>
          <Search size={18} color="#777" />
          <input type="text" placeholder="Search..." />
        </div>

        {/* Status Update Bell - Only for students */}
        {role === "student" && (
          <div
            className={styles.notification}
            onClick={handleBellClick}
            style={{ cursor: "pointer" }}
          >
            <Bell size={20} />
            {updateCount > 0 && !isOnMyRequestsPage && (
              <span className={styles.badge}>
                {updateCount > 9 ? "9+" : updateCount}
              </span>
            )}
          </div>
        )}

        <div className={styles.userProfile}>
          <div className={styles.avatar}>{userName?.charAt(0) || "U"}</div>
          <span>{userName}</span>
        </div>

        <button
          onClick={handleLogout}
          className={styles.logoutBtn}
          title="Logout"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
}
