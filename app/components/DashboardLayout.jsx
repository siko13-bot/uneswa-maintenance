// src/components/DashboardLayout.js
import Sidebar from "./Sidebar";
import Header from "./Header";
import styles from "../styles/Dashboard.module.css";

export default function DashboardLayout({ children, role, userName }) {
  return (
    <div className={styles.dashboardContainer}>
      <Sidebar role={role} />
      <div className={styles.mainContent}>
        <Header userName={userName} />
        <main className={styles.pageContent}>{children}</main>
      </div>
    </div>
  );
}
