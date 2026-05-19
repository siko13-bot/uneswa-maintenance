"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Search, LogOut } from "lucide-react";
import styles from "../styles/Components.module.css";

export default function Header({ userName, userId, role }) {
  const router = useRouter();
  const pathname = usePathname();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  // Debounced search
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `http://localhost:5000/api/requests/search?q=${encodeURIComponent(searchTerm)}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.slice(0, 5)); // show top 5
          setShowResults(true);
        }
      } catch (err) {
        console.error("Search error", err);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleResultClick = (id) => {
    setShowResults(false);
    setSearchTerm("");
    if (role === "student") {
      router.push(`/student/requests/${id}`);
    } else {
      router.push(`/admin/requests/${id}`);
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerTitle}>
        <h3>Residence Maintenance System</h3>
      </div>

      <div className={styles.headerRight}>
        {/* Search Bar with Results Dropdown */}
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

        <div className={styles.userProfile}>
          <div className={styles.avatar}>{userName?.charAt(0) || "U"}</div>
          <span>{userName}</span>
        </div>
      </div>
    </header>
  );
}
