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
import toast from "react-hot-toast";
import Link from "next/link";
import ReportModal from "../components/ReportModal";
import { Download } from "lucide-react";
const PIE_COLORS = ["#1e60a4", "#f39c12", "#e74c3c", "#2ecc71", "#9b59b6"];

export default function AdminDashboard() {
  const [requests, setRequests] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Fetch requests and staff list
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [requestsRes, staffRes] = await Promise.all([
          fetch("http://localhost:5000/api/requests"),
          fetch("http://localhost:5000/api/staff"),
        ]);
        if (requestsRes.ok && staffRes.ok) {
          const requestsData = await requestsRes.json();
          const staffData = await staffRes.json();
          setRequests(requestsData);
          setStaffList(staffData);
        } else {
          toast.error("Failed to load data");
        }
      } catch (error) {
        console.error("Failed to fetch data", error);
        toast.error("Server error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
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
        setRequests(
          requests.map((req) =>
            req.id === id ? { ...req, status: newStatus } : req,
          ),
        );
        toast.success("Status updated");
      } else {
        toast.error("Status update failed");
      }
    } catch (error) {
      console.error("Error updating status", error);
      toast.error("Server error");
    }
  };

  // Function to assign staff to a request
  const handleAssignStaff = async (requestId, staffId) => {
    if (!staffId) return;
    try {
      const res = await fetch(
        `http://localhost:5000/api/requests/${requestId}/assign`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ staff_id: staffId }),
        },
      );

      if (res.ok) {
        const updated = await res.json();
        setRequests(
          requests.map((req) =>
            req.id === requestId
              ? {
                  ...req,
                  staff_id: updated.staff_id,
                  staff_name: updated.staff_name,
                  staff_role: updated.staff_role,
                }
              : req,
          ),
        );
        toast.success("Staff assigned successfully!");
      } else {
        toast.error("Assignment failed");
      }
    } catch (error) {
      console.error("Error assigning staff", error);
      toast.error("Server error");
    }
  };

  return (
    <DashboardLayout role="admin" userName="Mnguni">
      <h1 className={styles.pageTitle}>Admin Dashboard</h1>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h1 className={styles.pageTitle}>Admin Dashboard</h1>
        <button
          onClick={() => setIsReportModalOpen(true)}
          className={styles.secondaryBtn}
        >
          <Download size={18} /> Export Report
        </button>
      </div>
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
                    <th>Assigned To</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.slice(0, 10).map((req) => (
                    <tr key={req.id}>
                      <td>{req.student_name}</td>
                      <td>{req.room}</td>
                      <td>{req.category}</td>
                      <td>
                        <span className={getStatusClass(req.status)}>
                          {req.status}
                        </span>
                      </td>
                      <td>
                        {req.staff_name
                          ? `${req.staff_name} (${req.staff_role})`
                          : "Unassigned"}
                      </td>
                      <td>{formatDate(req.created_at)}</td>
                      <td>
                        <Link
                          href={`/admin/requests/${req.id}`}
                          className={styles.viewButton}
                        >
                          View Details
                        </Link>
                      </td>
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
            {requests.length > 10 && (
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
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
    </DashboardLayout>
  );
}
