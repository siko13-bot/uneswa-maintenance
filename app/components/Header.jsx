// src/app/components/Header.js
"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Bell } from "lucide-react";
import styles from "../styles/Components.module.css";

export default function Header({ role }) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [profile, setProfile] = useState(null);

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const searchRef = useRef(null);
  const notifRef = useRef(null);

  // Fetch profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) setProfile(await res.json());
      } catch (err) {
        console.error("Profile fetch error", err);
      }
    };
    fetchProfile();
  }, []);

  // Fetch announcements as notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/announcements", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setNotifications(data);

          // Track unread using localStorage — persist per user
          const storageKey = `notif_read_${profile?.id || "user"}`;
          const lastRead = parseInt(localStorage.getItem(storageKey) || "0");
          const unread = data.filter(
            (n) => new Date(n.created_at).getTime() > lastRead,
          ).length;
          setUnreadCount(unread);
        }
      } catch (err) {
        console.error("Notifications fetch error", err);
      }
    };

    fetchNotifications();
    // Poll every 60 seconds for new announcements
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [profile?.id]);

  const handleBellClick = () => {
    setShowNotifications((prev) => !prev);
    setShowResults(false);

    // Mark all as read
    if (!showNotifications) {
      const storageKey = `notif_read_${profile?.id || "user"}`;
      localStorage.setItem(storageKey, Date.now().toString());
      setUnreadCount(0);
    }
  };

  // Debounced search
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    const delay = setTimeout(async () => {
      try {
        const token = sessionStorage.getItem("token");
        const res = await fetch(
          `http://localhost:5000/api/requests/search?q=${encodeURIComponent(searchTerm)}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.slice(0, 5));
          setShowResults(true);
        }
      } catch (err) {
        console.error("Search error", err);
      }
    }, 300);
    return () => clearTimeout(delay);
  }, [searchTerm]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target))
        setShowResults(false);
      if (notifRef.current && !notifRef.current.contains(e.target))
        setShowNotifications(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleResultClick = (id) => {
    setShowResults(false);
    setSearchTerm("");
    router.push(
      role === "student" ? `/student/requests/${id}` : `/admin/requests/${id}`,
    );
  };

  const formatNotifDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const initials =
    profile?.name
      ?.split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase() || "U";

  return (
    <header className={styles.header}>
      <div className={styles.headerTitle}>
        <h3>Residence Maintenance System</h3>
      </div>

      <div className={styles.headerRight}>
        {/* Search */}
        <div className={styles.searchContainer} ref={searchRef}>
          <div className={styles.searchBar}>
            <Search size={18} color="#777" />
            <input
              type="text"
              placeholder="Search by room, category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => searchTerm.trim() && setShowResults(true)}
            />
          </div>
          {showResults && (
            <div className={styles.searchResults}>
              {searchResults.length === 0 ? (
                <div className={styles.noResult}>No matching requests</div>
              ) : (
                searchResults.map((req) => (
                  <div
                    key={req.id}
                    className={styles.resultItem}
                    onClick={() => handleResultClick(req.id)}
                  >
                    <div className={styles.resultTitle}>
                      {req.category} – {req.room}
                    </div>
                    <div className={styles.resultDesc}>
                      {req.description.substring(0, 60)}...
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Notification Bell */}
        <div className={styles.notifWrapper} ref={notifRef}>
          <button
            className={styles.bellBtn}
            onClick={handleBellClick}
            aria-label="Notifications"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className={styles.badge}>
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className={styles.notifDropdown}>
              <div className={styles.notifHeader}>
                <span>Announcements</span>
                <span className={styles.notifCount}>
                  {notifications.length}
                </span>
              </div>
              <div className={styles.notifList}>
                {notifications.length === 0 ? (
                  <div className={styles.notifEmpty}>No announcements</div>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className={styles.notifItem}>
                      <div className={styles.notifTitle}>{n.title}</div>
                      <div className={styles.notifContent}>{n.content}</div>
                      <div className={styles.notifMeta}>
                        {formatNotifDate(n.created_at)}
                        {n.author_name && ` · ${n.author_name}`}
                      </div>
                    </div>
                  ))
                )}
              </div>
              {role === "student" && (
                <div
                  className={styles.notifFooter}
                  onClick={() => {
                    setShowNotifications(false);
                    router.push("/student/announcements");
                  }}
                >
                  View all announcements →
                </div>
              )}
            </div>
          )}
        </div>

        {/* Avatar */}
        <div className={styles.userProfile}>
          <div className={styles.avatar}>{initials}</div>
          <span>{profile?.name || "User"}</span>
        </div>
      </div>
    </header>
  );
}
