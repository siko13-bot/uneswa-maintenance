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
  ClipboardList,
} from "lucide-react";
import Image from "next/image";
import logo from "../../public/uneswa_logo_05.png";
import styles from "../styles/Components.module.css";

export default function Sidebar({ role }) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <Image src={logo} alt="UNESWA Logo" width={200} height={80} />
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

        {/* Hostel Audits - ONLY for admin/warden */}
        {role === "admin" && (
          <Link href="/admin/audit" className={styles.navItem}>
            <ClipboardList size={20} /> Hostel Audits
          </Link>
        )}

        <Link href={`/${role}/announcements`} className={styles.navItem}>
          <Megaphone size={20} /> Announcements
        </Link>
        <Link href={`/${role}/help`} className={styles.navItem}>
          <HelpCircle size={20} /> Help & Support
        </Link>
      </nav>

      <button
        onClick={() => {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
        }}
        className={`${styles.navItem} ${styles.btnClass}`}
      >
        <LogOut size={20} /> Logout
      </button>
    </aside>
  );
}
