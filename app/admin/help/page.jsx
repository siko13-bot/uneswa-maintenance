// src/app/admin/help/page.js
import DashboardLayout from "../../components/DashboardLayout";
import styles from "../../styles/Dashboard.module.css";
import { HelpCircle, Mail, Phone } from "lucide-react";

export default function AdminHelp() {
  return (
    <DashboardLayout role="admin" userName="Mnguni">
      <h1 className={styles.pageTitle}>Help & System Support</h1>

      <div className={styles.dashboardGrid}>
        <div className={styles.card} style={{ flex: 1 }}>
          <h3>
            <HelpCircle size={20} style={{ marginRight: "10px" }} /> System
            Administrator Guide
          </h3>
          <ul className={styles.helpList}>
            <li>
              <strong>Changing Statuses:</strong> Go to the Dashboard and click
              on a request to change its status to 'In Progress' or 'Resolved'.
            </li>
            <li>
              <strong>Posting Announcements:</strong> Use the Announcements tab
              to broadcast messages to all students on the platform.
            </li>
            <li>
              <strong>Analytics:</strong> The charts update automatically as
              requests are resolved.
            </li>
          </ul>
        </div>

        <div className={styles.card} style={{ flex: 1 }}>
          <h3>Contact IT Support</h3>
          <p style={{ marginBottom: "15px" }}>
            If the system is experiencing bugs, please contact the UNESWA IT
            desk.
          </p>

          <div className={styles.contactItem}>
            <Mail size={18} color="#1e60a4" /> <span>it-support@uneswa.sz</span>
          </div>
          <div className={styles.contactItem}>
            <Phone size={18} color="#1e60a4" /> <span>+268 2517 0000</span>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
