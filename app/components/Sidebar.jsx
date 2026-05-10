// src/components/Sidebar.js
import Link from "next/link";
import {
  Home,
  AlertCircle,
  FileText,
  Bell,
  Megaphone,
  HelpCircle,
  LogOut,
} from "lucide-react";
import styles from "../styles/Components.module.css";

export default function Sidebar({ role }) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <div className={styles.logo}>UNESWA Logo</div>
      </div>

      <nav className={styles.navMenu}>
        <Link
          href={`/${role}`}
          className={`${styles.navItem} ${styles.active}`}
        >
          <Home size={20} /> Dashboard
        </Link>
        {role === "student" && (
          <>
            <Link href="/student/report" className={styles.navItem}>
              <AlertCircle size={20} /> Report Issue
            </Link>
            <Link href="/student/requests" className={styles.navItem}>
              <FileText size={20} /> My Requests
            </Link>
          </>
        )}
        <Link href={`/${role}/notifications`} className={styles.navItem}>
          <Bell size={20} /> Notifications
        </Link>
        <Link href={`/${role}/announcements`} className={styles.navItem}>
          <Megaphone size={20} /> Announcements
        </Link>
        <Link href={`/${role}/help`} className={styles.navItem}>
          <HelpCircle size={20} /> Help & Support
        </Link>
      </nav>

      <div className={styles.logoutWrapper}>
        <Link href="/" className={styles.navItem}>
          <LogOut size={20} /> Logout
        </Link>
      </div>
    </aside>
  );
}
