// src/app/admin/page.js
"use client";
import SkeletonAdminDashboard from "../components/SkeletonAdminDashboard";
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
import {
  Download,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

const PIE_COLORS = ["#1e60a4", "#f39c12", "#e74c3c", "#2ecc71", "#9b59b6"];
const STAT_ICONS = [TrendingUp, Clock, CheckCircle, AlertTriangle];

export default function AdminDashboard() {
  const [requests, setRequests] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [requestsRes, staffRes] = await Promise.all([
          fetch("http://localhost:5000/api/requests"),
          fetch("http://localhost:5000/api/staff"),
        ]);
        if (requestsRes.ok && staffRes.ok) {
          setRequests(await requestsRes.json());
          setStaffList(await staffRes.json());
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

  // Stats
  const totalRequests = requests.length;
  const pendingIssues = requests.filter((r) => r.status === "Pending").length;
  const completedRequests = requests.filter(
    (r) => r.status === "Resolved",
  ).length;
  const urgentIssues = requests.filter((r) => r.urgency === "High").length;

  const stats = [
    {
      label: "Total Requests",
      value: totalRequests,
      color: "#4a90e2",
      bg: styles.bgBlue,
      icon: TrendingUp,
      filter: "All",
    },
    {
      label: "Pending Issues",
      value: pendingIssues,
      color: "#f5a623",
      bg: styles.bgYellow,
      icon: Clock,
      filter: "Pending",
    },
    {
      label: "Completed",
      value: completedRequests,
      color: "#7ed321",
      bg: styles.bgGreen,
      icon: CheckCircle,
      filter: "Resolved",
    },
    {
      label: "Urgent Issues",
      value: urgentIssues,
      color: "#d0021b",
      bg: styles.bgRed,
      icon: AlertTriangle,
      filter: "High",
    },
  ];

  // Chart data
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

  const barData = [
    { name: "Pending", Total: pendingIssues },
    {
      name: "In Progress",
      Total: requests.filter((r) => r.status === "In Progress").length,
    },
    { name: "Resolved", Total: completedRequests },
    {
      name: "Closed",
      Total: requests.filter((r) => r.status === "Closed").length,
    },
  ];

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const getStatusClass = (status) => {
    if (status === "Pending") return styles.statusPending;
    if (status === "In Progress") return styles.statusInProgress;
    if (status === "Resolved") return styles.statusResolved;
    if (status === "Closed") return styles.statusClosed;
    return "";
  };

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
          requests.map((r) => (r.id === id ? { ...r, status: newStatus } : r)),
        );
        toast.success("Status updated");
      } else {
        toast.error("Status update failed");
      }
    } catch {
      toast.error("Server error");
    }
  };

  // Filtered table rows
  const filteredRequests =
    statusFilter === "All"
      ? requests
      : statusFilter === "High"
        ? requests.filter((r) => r.urgency === "High")
        : requests.filter((r) => r.status === statusFilter);

  if (loading) {
    return (
      <DashboardLayout role="admin" userName="Mnguni">
        <SkeletonAdminDashboard />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin" userName="Mnguni">
      {/* Page header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <div>
          <h1 className={styles.pageTitle} style={{ marginBottom: 4 }}>
            Admin Dashboard
          </h1>
          <p style={{ margin: 0, fontSize: 13, color: "#888" }}>
            {new Date().toLocaleDateString("en-GB", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <button
          onClick={() => setIsReportModalOpen(true)}
          className={styles.secondaryBtn}
        >
          <Download size={16} /> Export Report
        </button>
      </div>

      {/* Stat cards — clickable to filter table */}
      <div className={styles.adminStatsRow}>
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className={`${styles.adminStatCard} ${s.bg}`}
              onClick={() => setStatusFilter(s.filter)}
              style={{
                cursor: "pointer",
                outline:
                  statusFilter === s.filter
                    ? "3px solid rgba(255,255,255,0.7)"
                    : "none",
                outlineOffset: "-3px",
                transition: "transform 0.15s ease, outline 0.15s ease",
                position: "relative",
                overflow: "hidden",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "translateY(-3px)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "translateY(0)")
              }
            >
              <Icon
                size={40}
                style={{
                  position: "absolute",
                  right: 12,
                  top: 12,
                  opacity: 0.2,
                }}
              />
              <p style={{ fontSize: 13, marginBottom: 8 }}>{s.label}</p>
              <h2 style={{ fontSize: 40, fontWeight: 700, margin: 0 }}>
                {s.value}
              </h2>
            </div>
          );
        })}
      </div>

      {/* Filter tabs */}
      <div
        style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}
      >
        {["All", "Pending", "In Progress", "Resolved", "Closed", "High"].map(
          (f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              style={{
                padding: "6px 16px",
                borderRadius: "999px",
                border: "1px solid",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.15s ease",
                borderColor: statusFilter === f ? "#1e60a4" : "#e0e0e0",
                background: statusFilter === f ? "#1e60a4" : "white",
                color: statusFilter === f ? "white" : "#555",
              }}
            >
              {f}
              {f !== "All" && (
                <span
                  style={{
                    marginLeft: 6,
                    background:
                      statusFilter === f ? "rgba(255,255,255,0.25)" : "#f0f0f0",
                    color: statusFilter === f ? "white" : "#888",
                    borderRadius: "999px",
                    padding: "1px 7px",
                    fontSize: 11,
                  }}
                >
                  {f === "High"
                    ? requests.filter((r) => r.urgency === "High").length
                    : requests.filter((r) => r.status === f).length}
                </span>
              )}
            </button>
          ),
        )}
        <span
          style={{
            marginLeft: "auto",
            fontSize: 13,
            color: "#888",
            alignSelf: "center",
          }}
        >
          {filteredRequests.length} request
          {filteredRequests.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className={styles.dashboardGrid}>
        {/* Left: table */}
        <div className={styles.leftColumn}>
          <div className={styles.tableSection}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <h3 style={{ margin: 0 }}>Request Management</h3>
            </div>

            {filteredRequests.length === 0 ? (
              <div
                style={{
                  padding: "40px 0",
                  textAlign: "center",
                  color: "#888",
                }}
              >
                No {statusFilter === "All" ? "" : statusFilter.toLowerCase()}{" "}
                requests found.
              </div>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>ID</th>
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
                  {filteredRequests.slice(0, 10).map((req) => (
                    <tr
                      key={req.id}
                      style={{ transition: "background 0.15s" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#f8fafc")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "")
                      }
                    >
                      <td>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: "#1e60a4",
                            background: "#e8f0fb",
                            padding: "2px 8px",
                            borderRadius: 999,
                          }}
                        >
                          #{req.id}
                        </span>
                      </td>
                      <td style={{ fontWeight: 500 }}>{req.student_name}</td>
                      <td style={{ color: "#666" }}>{req.room}</td>
                      <td>{req.category}</td>
                      <td>
                        <span className={getStatusClass(req.status)}>
                          {req.status}
                        </span>
                      </td>
                      <td
                        style={{
                          color: req.staff_name ? "#333" : "#bbb",
                          fontStyle: req.staff_name ? "normal" : "italic",
                        }}
                      >
                        {req.staff_name ? `${req.staff_name}` : "Unassigned"}
                      </td>
                      <td style={{ color: "#888", fontSize: 13 }}>
                        {formatDate(req.created_at)}
                      </td>
                      <td>
                        <Link
                          href={`/admin/requests/${req.id}`}
                          className={styles.viewButton}
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right: charts */}
        <div className={styles.rightColumn}>
          <div className={styles.chartCard}>
            <h3>Most common issues</h3>
            <div className={styles.chartWrapper}>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius={55}
                    outerRadius={78}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell
                        key={index}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [`${value} requests`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className={styles.chartLegend}>
                {pieData.map((entry, index) => (
                  <span
                    key={entry.name}
                    style={{
                      color: PIE_COLORS[index % PIE_COLORS.length],
                      fontSize: 13,
                    }}
                  >
                    ● {entry.name} ({entry.value})
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.chartCard}>
            <h3>Status overview</h3>
            <div className={styles.chartWrapper}>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={barData} barSize={32}>
                  <XAxis
                    dataKey="name"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: "#f4f7f6" }}
                    formatter={(value) => [`${value} requests`, "Total"]}
                  />
                  <Bar dataKey="Total" fill="#1e60a4" radius={[6, 6, 0, 0]} />
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
