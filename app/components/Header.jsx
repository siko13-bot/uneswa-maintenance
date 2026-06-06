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

  // Fetch notifications — different source per role
  const fetchNotifications = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const user = JSON.parse(sessionStorage.getItem("user") || "{}");
      let data = [];

      if (role === "student") {
        // Student: fetch their own requests and surface status changes
        const res = await fetch(
          `http://localhost:5000/api/requests/student/${user.id}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (res.ok) {
          const requests = await res.json();
          // Turn each request into a notification entry
          data = requests.map((req) => ({
            id: req.id,
            title: `Request #${req.id} — ${req.status}`,
            content: `${req.category} in ${req.room}`,
            status: req.status,
            updated_at: req.updated_at,
            requestId: req.id,
            type: "request",
          }));
        }
      } else {
        // Admin: fetch all requests, surface brand-new (Pending) ones
        const res = await fetch("http://localhost:5000/api/requests", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const requests = await res.json();
          data = requests
            .filter((req) => req.status === "Pending")
            .map((req) => ({
              id: req.id,
              title: `New request from ${req.student_name}`,
              content: `${req.category} in ${req.room}`,
              status: req.status,
              updated_at: req.created_at,
              requestId: req.id,
              type: "new_request",
            }));
        }
      }

      setNotifications(data);

      // Unread = anything updated/created since last bell click
      const storageKey = `notif_read_${user.id || "user"}_${role}`;
      const lastRead = parseInt(localStorage.getItem(storageKey) || "0");
      const unread = data.filter(
        (n) => new Date(n.updated_at).getTime() > lastRead,
      ).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error("Notifications fetch error", err);
    }
  };

  useEffect(() => {
    if (!profile) return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [profile, role]);

  const handleBellClick = () => {
    const opening = !showNotifications;
    setShowNotifications(opening);
    setShowResults(false);

    if (opening) {
      const user = JSON.parse(sessionStorage.getItem("user") || "{}");
      const storageKey = `notif_read_${user.id || "user"}_${role}`;
      localStorage.setItem(storageKey, Date.now().toString());
      setUnreadCount(0);
    }
  };

  const handleNotifClick = (notif) => {
    setShowNotifications(false);
    if (role === "student") {
      router.push(`/student/requests/${notif.requestId}`);
    } else {
      router.push(`/admin/requests/${notif.requestId}`);
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

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const getStatusDot = (status) => {
    if (status === "Pending") return styles.dotPending;
    if (status === "In Progress") return styles.dotInProgress;
    if (status === "Resolved") return styles.dotResolved;
    if (status === "Closed") return styles.dotClosed;
    return "";
  };

  const initials =
    profile?.name
      ?.split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase() || "U";

  const dropdownTitle =
    role === "admin" ? "New student requests" : "My request updates";

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
                <span>{dropdownTitle}</span>
                <span className={styles.notifCount}>
                  {notifications.length}
                </span>
              </div>

              <div className={styles.notifList}>
                {notifications.length === 0 ? (
                  <div className={styles.notifEmpty}>
                    {role === "admin"
                      ? "No pending requests"
                      : "No request updates"}
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={styles.notifItem}
                      onClick={() => handleNotifClick(n)}
                    >
                      <div className={styles.notifItemTop}>
                        <span
                          className={`${styles.statusDot} ${getStatusDot(n.status)}`}
                        />
                        <span className={styles.notifTitle}>{n.title}</span>
                      </div>
                      <div className={styles.notifContent}>{n.content}</div>
                      <div className={styles.notifMeta}>
                        {formatDate(n.updated_at)}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div
                className={styles.notifFooter}
                onClick={() => {
                  setShowNotifications(false);
                  router.push(
                    role === "student"
                      ? "/student/requests"
                      : "/admin/requests",
                  );
                }}
              >
                {role === "admin"
                  ? "View all requests →"
                  : "View all my requests →"}
              </div>
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
