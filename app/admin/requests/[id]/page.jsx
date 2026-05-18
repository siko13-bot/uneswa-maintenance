// src/app/admin/requests/[id]/page.js
"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "../../../components/DashboardLayout";
import styles from "../../../styles/Dashboard.module.css";
import toast from "react-hot-toast";
import Spinner, { FullPageLoader } from "../../../components/Spinner";

export default function RequestDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [request, setRequest] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        const [reqRes, staffRes] = await Promise.all([
          fetch(`http://localhost:5000/api/requests/${id}`),
          fetch("http://localhost:5000/api/staff"),
        ]);
        if (reqRes.ok && staffRes.ok) {
          const reqData = await reqRes.json();
          const staffData = await staffRes.json();
          setRequest(reqData);
          setStaffList(staffData);
        } else {
          toast.error("Failed to load request details");
          router.push("/admin");
        }
      } catch (error) {
        console.error(error);
        toast.error("Server error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, router]);

  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
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
        const updated = await res.json();
        setRequest(updated);
        toast.success("Status updated");
      } else {
        toast.error("Update failed");
      }
    } catch (error) {
      console.error(error);
      toast.error("Server error");
    } finally {
      setUpdating(false);
    }
  };

  const handleAssignStaff = async (staffId) => {
    if (!staffId) return;
    setUpdating(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/requests/${id}/assign`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ staff_id: staffId }),
        },
      );
      if (res.ok) {
        const updated = await res.json();
        setRequest(updated);
        toast.success("Staff assigned");
      } else {
        toast.error("Assignment failed");
      }
    } catch (error) {
      console.error(error);
      toast.error("Server error");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusClass = (status) => {
    if (status === "Pending") return styles.statusPending;
    if (status === "In Progress") return styles.statusInProgress;
    return styles.statusResolved;
  };

  if (loading) {
    return (
      <DashboardLayout role="admin" userName="Mnguni">
        <FullPageLoader />
      </DashboardLayout>
    );
  }

  if (!request) {
    return (
      <DashboardLayout role="admin" userName="Mnguni">
        <div className={styles.card}>Request not found.</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin" userName="Mnguni">
      <div className={styles.pageHeader}>
        <button onClick={() => router.back()} className={styles.secondaryBtn}>
          ← Back to Dashboard
        </button>
        <h1 className={styles.pageTitle}>Request #{request.id}</h1>
      </div>

      <div className={styles.detailGrid}>
        {/* Left Column: Request Info */}
        <div className={styles.detailCard}>
          <h3>Request Information</h3>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Student:</span>
            <span>{request.student_name}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Room:</span>
            <span>{request.room}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Category:</span>
            <span>{request.category}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Urgency:</span>
            <span
              className={request.urgency === "High" ? styles.urgentText : ""}
            >
              {request.urgency}
            </span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Description:</span>
            <p>{request.description}</p>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Reported:</span>
            <span>{new Date(request.created_at).toLocaleString()}</span>
          </div>

          {/* Image Preview */}
          {request.image_url && (
            <div className={styles.imagePreview}>
              <span className={styles.detailLabel}>Attached Image:</span>
              <img
                src={`http://localhost:5000${request.image_url}`}
                alt="Maintenance issue"
                className={styles.requestImage}
              />
            </div>
          )}
        </div>

        {/* Right Column: Actions */}
        <div className={styles.detailCard}>
          <h3>Actions</h3>

          <div className={styles.formGroup}>
            <label>Status</label>
            <select
              value={request.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className={`${styles.statusDropdown} ${getStatusClass(request.status)}`}
              disabled={updating}
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Assign to Staff</label>
            <select
              value={request.staff_id || ""}
              onChange={(e) => handleAssignStaff(e.target.value)}
              className={styles.assignSelect}
              disabled={updating}
            >
              <option value="">Unassigned</option>
              {staffList.map((staff) => (
                <option key={staff.id} value={staff.id}>
                  {staff.name} ({staff.role})
                </option>
              ))}
            </select>
          </div>

          {request.staff_name && (
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Currently assigned to:</span>
              <span>
                {request.staff_name} ({request.staff_role})
              </span>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
