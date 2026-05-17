// src/components/Header.js
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Bell, LogOut } from "lucide-react";
import styles from "../styles/Components.module.css";

export default function Header({ userName }) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
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

        <div className={styles.notification}>
          <Bell size={20} />
          <span className={styles.badge}>1</span>
        </div>

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
