// src/app/student/page.js
import DashboardLayout from "../components/DashboardLayout.jsx";
import { Wrench } from "lucide-react";
import styles from "../styles/Dashboard.module.css";

export default function StudentDashboard() {
  return (
    <DashboardLayout role="student" userName="Siphesihle">
      <div className={styles.welcomeSection}>
        <h1>Welcome, Siphesihle</h1>
      </div>

      <button className={styles.reportButton}>
        <Wrench size={24} /> Report Maintenance Issue
      </button>

      <div className={styles.statsContainer}>
        <div className={styles.statCard}>
          <h2>2</h2>
          <p>Pending Requests</p>
          <small>Current unresolved issues</small>
        </div>
        <div className={styles.statCard}>
          <h2 style={{ color: "#28a745" }}>1</h2>
          <p>In Progress</p>
          <small>Issues being addressed</small>
        </div>
        <div className={styles.statCard}>
          <h2 style={{ color: "#1e60a4" }}>5</h2>
          <p>Resolved Requests</p>
          <small>Issues successfully completed</small>
        </div>
      </div>

      <div className={styles.tableSection}>
        <h3>Recent Requests</h3>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Issue</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Broken Tap</td>
              <td>25/05/2024</td>
              <td>
                <span className={styles.statusInProgress}>In Progress</span>
              </td>
            </tr>
          </tbody>
        </table>
        <div className={styles.viewAll}>View All Requests &gt;</div>
      </div>

      <div className={styles.infoCardsRow}>
        <div className={styles.infoCard}>
          <h4>Guidelines</h4>
          <p>
            Review maintenance request guidelines on reporting faults accurately
            and urgently.
          </p>
        </div>
        <div className={styles.infoCard}>
          <h4>Need Help?</h4>
          <p>For assistance, Contact the Maintenance Department.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
