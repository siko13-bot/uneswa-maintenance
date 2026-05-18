// src/app/student/help/page.js
import DashboardLayout from "../../components/DashboardLayout";
import styles from "../../styles/Dashboard.module.css";
import { HelpCircle, Phone, Mail } from "lucide-react";

export default function StudentHelp() {
  return (
    <DashboardLayout role="student" userName="Siphesihle">
      <h1 className={styles.pageTitle}>Help & Support</h1>

      <div className={styles.dashboardGrid}>
        <div className={styles.card}>
          <h3>
            <HelpCircle size={20} style={{ marginRight: "10px" }} /> How to
            Report an Issue
          </h3>
          <ul className={styles.helpList}>
            <li>
              Navigate to the <strong>Report Issue</strong> tab on the left
              menu.
            </li>
            <li>
              Select the correct category (Plumbing, Electrical, etc.) to ensure
              it goes to the right maintenance team.
            </li>
            <li>Provide your exact room number and a clear description.</li>
            <li>
              Attach a photo if possible to help the maintenance team understand
              the issue.
            </li>
            <li>
              Monitor the <strong>My Requests</strong> tab to see if your issue
              is Pending, In Progress, or Resolved.
            </li>
          </ul>
        </div>

        <div className={styles.card}>
          <h3>Contact Information</h3>
          <p style={{ marginBottom: "15px" }}>
            For emergencies, please call immediately:
          </p>

          <div className={styles.contactItem}>
            <Phone size={18} color="#e74c3c" />{" "}
            <span>Campus Security: +268 2517 0001</span>
          </div>
          <div className={styles.contactItem}>
            <Phone size={18} color="#e74c3c" />{" "}
            <span>Emergency Maintenance: +268 2517 0002</span>
          </div>
          <div className={styles.contactItem}>
            <Mail size={18} color="#1e60a4" />{" "}
            <span>Maintenance Office: maintenance@uneswa.sz</span>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
