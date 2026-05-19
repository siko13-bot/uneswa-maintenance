// src/components/Sidebar.js
"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Home,
  AlertCircle,
  FileText,
  Megaphone,
  HelpCircle,
  LogOut,
  ClipboardList,
} from "lucide-react";
import logo from "../../public/uneswa_logo_05.png";
import styles from "../styles/Components.module.css";

export default function Sidebar({ role }) {
  const pathname = usePathname();

  // Helper to check if a link is active
  const isActive = (href) => {
    if (href === "/admin" && pathname === "/admin") return true;
    if (href === "/student" && pathname === "/student") return true;
    if (href !== "/admin" && href !== "/student" && pathname.startsWith(href))
      return true;
    return false;
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <Image src={logo} alt="UNESWA Logo" width={180} height={70} priority />
      </div>

      <nav className={styles.navMenu}>
        {/* Dashboard */}
        <Link
          href={`/${role}`}
          className={`${styles.navItem} ${isActive(`/${role}`) ? styles.active : ""}`}
        >
          <Home size={20} /> Dashboard
        </Link>

        {/* Student links */}
        {role === "student" && (
          <>
            <Link
              href="/student/report"
              className={`${styles.navItem} ${isActive("/student/report") ? styles.active : ""}`}
            >
              <AlertCircle size={20} /> Report Issue
            </Link>
            <Link
              href="/student/requests"
              className={`${styles.navItem} ${isActive("/student/requests") ? styles.active : ""}`}
            >
              <FileText size={20} /> My Requests
            </Link>
          </>
        )}

        {/* Admin only: Hostel Audits */}
        {role === "admin" && (
          <Link
            href="/admin/audit"
            className={`${styles.navItem} ${isActive("/admin/audit") ? styles.active : ""}`}
          >
            <ClipboardList size={20} /> Hostel Audits
          </Link>
        )}

        {/* Common links */}
        <Link
          href={`/${role}/announcements`}
          className={`${styles.navItem} ${isActive(`/${role}/announcements`) ? styles.active : ""}`}
        >
          <Megaphone size={20} /> Announcements
        </Link>
        <Link
          href={`/${role}/help`}
          className={`${styles.navItem} ${isActive(`/${role}/help`) ? styles.active : ""}`}
        >
          <HelpCircle size={20} /> Help & Support
        </Link>
      </nav>

      {/* Logout button – never active */}
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
