// src/components/Header.js
import { Search, Bell } from "lucide-react";
import styles from "../styles/Components.module.css";

export default function Header({ userName }) {
  return (
    <header className={styles.header}>
      <div className={styles.headerTitle}>
        {/* We can pass down system names or page titles here if needed */}
        <h3>Residence Maintenance Management System</h3>
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
          <div className={styles.avatar}></div>
          <span>{userName}</span>
        </div>
      </div>
    </header>
  );
}
