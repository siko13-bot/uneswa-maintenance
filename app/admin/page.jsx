// src/app/admin/page.js
"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import styles from "../styles/Dashboard.module.css";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const PIE_COLORS = ["#1e60a4", "#f39c12", "#e74c3c", "#2ecc71", "#9b59b6"];

export default function AdminDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. FETCH DATA FROM YOUR NODE.JS BACKEND
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/requests");
        if (res.ok) {
          const data = await res.json();
          setRequests(data);
        }
      } catch (error) {
        console.error("Failed to fetch requests", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  // 2. CALCULATE DYNAMIC STATS
  const totalRequests = requests.length;
  const pendingIssues = requests.filter(
    (req) => req.status === "Pending",
  ).length;
  const completedRequests = requests.filter(
    (req) => req.status === "Resolved",
  ).length;
  const urgentIssues = requests.filter((req) => req.urgency === "High").length;

  // 3. GENERATE DYNAMIC DATA FOR PIE CHART (Count by Category)
  const categoryCounts = requests.reduce((acc, req) => {
    acc[req.category] = (acc[req.category] || 0) + 1;
    return acc;
  }, {});

  const pieData =
    Object.keys(categoryCounts).length > 0
      ? Object.keys(categoryCounts).map((key) => ({
          name: key,
          value: categoryCounts[key],
        }))
      : [{ name: "No Data", value: 1 }];

  // 4. GENERATE DYNAMIC DATA FOR BAR CHART (Count by Status)
  const barData = [
    { name: "Pending", Total: pendingIssues },
    {
      name: "In Progress",
      Total: requests.filter((req) => req.status === "In Progress").length,
    },
    { name: "Resolved", Total: completedRequests },
  ];

  // Helper to format PostgreSQL timestamp to DD/MM/YYYY
  const formatDate = (dateString) => {
    const options = { day: "2-digit", month: "2-digit", year: "numeric" };
    return new Date(dateString).toLocaleDateString("en-GB", options);
  };

  // Helper to color-code status badges
  const getStatusClass = (status) => {
    if (status === "Pending") return styles.statusPending;
    if (status === "In Progress") return styles.statusInProgress;
    return styles.statusResolved;
  };
  // Function to change status in the DB
  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/requests/${id}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        },
      );

      if (res.ok) {
        // Update the React state so the UI (and charts!) change instantly
        setRequests(
          requests.map((req) =>
            req.id === id ? { ...req, status: newStatus } : req,
          ),
        );
      }
    } catch (error) {
      console.error("Error updating status", error);
    }
  };
  return (
    <DashboardLayout role="admin" userName="Mnguni">
      <h1 className={styles.pageTitle}>Admin Dashboard</h1>

      {/* Top Stat Cards */}
      <div className={styles.adminStatsRow}>
        <div className={`${styles.adminStatCard} ${styles.bgBlue}`}>
          <p>Total Requests</p>
          <h2>{totalRequests}</h2>
        </div>
        <div className={`${styles.adminStatCard} ${styles.bgYellow}`}>
          <p>Pending Issues</p>
          <h2>{pendingIssues}</h2>
        </div>
        <div className={`${styles.adminStatCard} ${styles.bgGreen}`}>
          <p>Completed Requests</p>
          <h2>{completedRequests}</h2>
        </div>
        <div className={`${styles.adminStatCard} ${styles.bgRed}`}>
          <p>Urgent Issues</p>
          <h2>{urgentIssues}</h2>
        </div>
      </div>

      <div className={styles.dashboardGrid}>
        {/* Left Column: Tables */}
        <div className={styles.leftColumn}>
          <div className={styles.tableSection}>
            <div className={styles.sectionHeader}>
              <h3>Request Management</h3>
            </div>

            {loading ? (
              <p style={{ padding: "20px", color: "#777" }}>
                Loading live database data...
              </p>
            ) : (
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
                  {/* Map through the latest 5 requests */}
                  {requests.slice(0, 5).map((req) => (
                    <tr key={req.id}>
                      {/* Notice we use student_name because of our SQL JOIN query! */}
                      <td>{req.student_name}</td>
                      <td>{req.room}</td>
                      <td>{req.category}</td>
                      <td>
                        <select
                          value={req.status}
                          onChange={(e) =>
                            handleStatusChange(req.id, e.target.value)
                          }
                          className={`${styles.statusDropdown} ${getStatusClass(req.status)}`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                        </select>
                      </td>
                      <td>{formatDate(req.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {requests.length === 0 && !loading && (
              <div style={{ padding: "20px" }}>
                No requests found in the database.
              </div>
            )}
            {requests.length > 5 && (
              <div className={styles.viewAll}>View All Requests &gt;</div>
            )}
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
                {/* Dynamically render legend colors based on active categories */}
                {pieData.map((entry, index) => (
                  <span
                    key={entry.name}
                    style={{ color: PIE_COLORS[index % PIE_COLORS.length] }}
                  >
                    ● {entry.name} ({entry.value})
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.chartCard}>
            <h3>Status Overview</h3>
            <div className={styles.chartWrapper}>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={barData}>
                  <XAxis dataKey="name" fontSize={12} />
                  <Tooltip cursor={{ fill: "#f4f7f6" }} />
                  <Bar dataKey="Total" fill="#1e60a4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
