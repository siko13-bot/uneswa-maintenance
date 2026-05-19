// src/app/student/requests/[id]/page.js
"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "../../../components/DashboardLayout";
import styles from "../../../styles/Dashboard.module.css";
import Spinner from "../../../components/Spinner";
import toast from "react-hot-toast";

export default function StudentRequestDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchRequest = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:5000/api/requests/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setRequest(data);
        } else if (res.status === 401) {
          router.push("/login");
        } else {
          toast.error("Request not found");
          router.push("/student/requests");
        }
      } catch (error) {
        console.error(error);
        toast.error("Server error");
      } finally {
        setLoading(false);
      }
    };
    fetchRequest();
  }, [id, router]);

  const handleConfirmResolution = async () => {
    if (
      !confirm(
        "Has the issue been fully resolved? This action cannot be undone.",
      )
    )
      return;

    setConfirming(true);
    const toastId = toast.loading("Confirming resolution...");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/requests/${id}/confirm`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ confirmed: true }),
        },
      );
      if (res.ok) {
        const updated = await res.json();
        setRequest(updated);
        toast.success("Thank you for confirming! Request closed.", {
          id: toastId,
        });
      } else {
        toast.error("Failed to confirm", { id: toastId });
      }
    } catch (error) {
      console.error(error);
      toast.error("Server error", { id: toastId });
    } finally {
      setConfirming(false);
    }
  };

  const getStatusClass = (status) => {
    if (status === "Pending") return styles.statusPending;
    if (status === "In Progress") return styles.statusInProgress;
    if (status === "Resolved") return styles.statusResolved;
    return "";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <DashboardLayout role="student" userName="Student">
        <div
          style={{ display: "flex", justifyContent: "center", padding: "50px" }}
        >
          <Spinner size="large" />
        </div>
      </DashboardLayout>
    );
  }

  if (!request) return null;

  return (
    <DashboardLayout
      role="student"
      userName={request.student_name || "Student"}
    >
      <div className={styles.pageHeader}>
        <button onClick={() => router.back()} className={styles.secondaryBtn}>
          ← Back
        </button>
        <h1 className={styles.pageTitle}>Request #{request.id}</h1>
      </div>

      <div className={styles.detailGrid}>
        {/* Left Column: Request Info */}
        <div className={styles.detailCard}>
          <h3>Request Information</h3>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Category:</span>
            <span>{request.category}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Room:</span>
            <span>{request.room}</span>
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
            <span>{formatDate(request.created_at)}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Last updated:</span>
            <span>{formatDate(request.updated_at)}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Status:</span>
            <span className={getStatusClass(request.status)}>
              {request.status}
            </span>
          </div>
          {request.staff_name && (
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Assigned to:</span>
              <span>
                {request.staff_name} ({request.staff_role})
              </span>
            </div>
          )}

          {/* Image Preview */}
          {request.image_url && (
            <div className={styles.imagePreview}>
              <span className={styles.detailLabel}>Attached Image:</span>
              <img
                src={`http://localhost:5000${request.image_url}`}
                alt="Maintenance issue"
                className={styles.requestImage}
                onError={(e) => (e.target.style.display = "none")}
              />
            </div>
          )}
        </div>

        {/* Right Column: Actions (only if Resolved) */}
        {request.status === "Resolved" && (
          <div className={styles.detailCard}>
            <h3>Confirm Resolution</h3>
            <p>Has the issue been fixed to your satisfaction?</p>
            <button
              onClick={handleConfirmResolution}
              className={styles.primaryBtn}
              disabled={confirming}
              style={{ marginTop: "16px", width: "100%" }}
            >
              {confirming ? "Confirming..." : "Yes, Confirm Resolution"}
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
