// src/app/student/report/page.js
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "../../components/DashboardLayout";
import styles from "../../styles/Dashboard.module.css";
import { Wrench, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import Spinner, { ButtonSpinner } from "../../components/Spinner";

export default function ReportIssue() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    category: "",
    room: "",
    description: "",
    urgency: "Medium",
    image: null,
  });

  useEffect(() => {
    const userData = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!userData || !token) {
      router.push("/login");
      return;
    }

    setUser(JSON.parse(userData));
    setLoading(false);
  }, [router]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, image: e.target.files[0] });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const toastId = toast.loading("Submitting request...");

    const submitData = new FormData();
    submitData.append("student_id", user.id);
    submitData.append("category", formData.category);
    submitData.append("room", formData.room);
    submitData.append("description", formData.description);
    submitData.append("urgency", formData.urgency);

    if (formData.image) {
      submitData.append("image", formData.image);
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/requests", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: submitData,
      });

      if (response.ok) {
        toast.success("Issue reported successfully!", { id: toastId });
        setIsSubmitted(true);
      } else {
        toast.error("Failed to submit the request.", { id: toastId });
      }
    } catch (error) {
      console.error("Error submitting request:", error);
      toast.error("Could not connect to the server.", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      category: "",
      room: "",
      description: "",
      urgency: "Medium",
      image: null,
    });
    setIsSubmitted(false);
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

  if (isSubmitted) {
    return (
      <DashboardLayout role="student" userName={user?.name}>
        <div
          className={styles.card}
          style={{ maxWidth: "600px", margin: "0 auto" }}
        >
          <div className={styles.successMessage}>
            <CheckCircle
              size={50}
              color="#28a745"
              style={{ marginBottom: "15px" }}
            />
            <h2>Issue Reported Successfully!</h2>
            <p>
              Your maintenance request has been forwarded to the administration.
            </p>
            <button
              onClick={resetForm}
              className={styles.primaryBtn}
              style={{ marginTop: "20px" }}
            >
              Report Another Issue
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="student" userName={user?.name}>
      <h1 className={styles.pageTitle}>Report Maintenance Issue</h1>

      <div
        className={styles.card}
        style={{ maxWidth: "600px", margin: "0 auto" }}
      >
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label>Issue Category</label>
            <select
              required
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
            >
              <option value="">Select a category...</option>
              <option value="Plumbing">Plumbing</option>
              <option value="Electrical">Electrical</option>
              <option value="Structural">Structural</option>
              <option value="Appliance">Appliance</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Room / Hall Block</label>
            <input
              type="text"
              placeholder="e.g., Hall Block C, Room 112"
              required
              value={formData.room}
              onChange={(e) =>
                setFormData({ ...formData, room: e.target.value })
              }
            />
          </div>

          <div className={styles.formGroup}>
            <label>Urgency Level</label>
            <select
              value={formData.urgency}
              onChange={(e) =>
                setFormData({ ...formData, urgency: e.target.value })
              }
            >
              <option value="Low">Low (Can wait a few days)</option>
              <option value="Medium">Medium (Needs attention soon)</option>
              <option value="High">
                High (Immediate danger or major disruption)
              </option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Description of the Issue</label>
            <textarea
              rows="5"
              placeholder="Please describe the problem in detail..."
              required
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          <div className={styles.formGroup}>
            <label>Attach Image (Optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{
                padding: "8px",
                border: "1px dashed #ccc",
                background: "#f9f9f9",
              }}
            />
          </div>

          <button
            type="submit"
            className={styles.primaryBtn}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <ButtonSpinner /> Submitting...
              </>
            ) : (
              <>
                <Wrench size={18} /> Submit Request
              </>
            )}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
