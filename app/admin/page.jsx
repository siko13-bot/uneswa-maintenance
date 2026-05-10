// src/app/admin/page.js
"use client"; // Required because Recharts uses browser features
import DashboardLayout from "../components/DashboardLayout.jsx";
import styles from "../styles/Dashboard.module.css";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Dummy Data for Charts
const pieData = [
  { name: "Plumbing", value: 45 },
  { name: "Electrical", value: 30 },
  { name: "Structural", value: 25 },
];
const PIE_COLORS = ["#1e60a4", "#f39c12", "#e74c3c"];

const barData = [
  { name: "Pending", A: 50, B: 20, C: 10 },
  { name: "In Progress", A: 30, B: 40, C: 20 },
  { name: "Completed", A: 10, B: 20, C: 50 },
];

export default function AdminDashboard() {
  return (
    <DashboardLayout role="admin" userName="Mnguni">
      <h1 className={styles.pageTitle}>Admin Dashboard</h1>

      {/* Top Stat Cards */}
      <div className={styles.adminStatsRow}>
        <div className={`${styles.adminStatCard} ${styles.bgBlue}`}>
          <p>Total Requests</p>
          <h2>35</h2>
        </div>
        <div className={`${styles.adminStatCard} ${styles.bgYellow}`}>
          <p>Pending Issues</p>
          <h2>12</h2>
        </div>
        <div className={`${styles.adminStatCard} ${styles.bgGreen}`}>
          <p>Completed Requests</p>
          <h2>19</h2>
        </div>
        <div className={`${styles.adminStatCard} ${styles.bgRed}`}>
          <p>Urgent Issues</p>
          <h2>4</h2>
        </div>
      </div>

      <div className={styles.dashboardGrid}>
        {/* Left Column: Tables */}
        <div className={styles.leftColumn}>
          <div className={styles.tableSection}>
            <div className={styles.sectionHeader}>
              <h3>Request Management</h3>
            </div>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Room</th>
                  <th>Issue</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Musa</td>
                  <td>Hall Block C12</td>
                  <td>Electrical Fault</td>
                  <td>
                    <span className={styles.statusPending}>Pending</span>
                  </td>
                  <td>25/05/2024</td>
                </tr>
                <tr>
                  <td>Nomsa</td>
                  <td>Room 110</td>
                  <td>Leaking Sink</td>
                  <td>
                    <span className={styles.statusInProgress}>In Progress</span>
                  </td>
                  <td>25/05/2024</td>
                </tr>
                <tr>
                  <td>Bongani</td>
                  <td>Hall Block F3</td>
                  <td>Window Repair</td>
                  <td>
                    <span className={styles.statusResolved}>Resolved</span>
                  </td>
                  <td>24/05/2024</td>
                </tr>
              </tbody>
            </table>
            <div className={styles.viewAll}>View All Requests &gt;</div>
          </div>
        </div>

        {/* Right Column: Analytics */}
        <div className={styles.rightColumn}>
          <div className={styles.chartCard}>
            <h3>Analytics - Most Common Issues</h3>
            <div className={styles.chartWrapper}>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className={styles.chartLegend}>
                <span style={{ color: "#1e60a4" }}>● Plumbing</span>
                <span style={{ color: "#f39c12" }}>● Electrical</span>
                <span style={{ color: "#e74c3c" }}>● Structural</span>
              </div>
            </div>
          </div>

          <div className={styles.chartCard}>
            <h3>Status Overview</h3>
            <div className={styles.chartWrapper}>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={barData}>
                  <XAxis dataKey="name" fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="A" fill="#1e60a4" />
                  <Bar dataKey="B" fill="#f39c12" />
                  <Bar dataKey="C" fill="#2ecc71" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
