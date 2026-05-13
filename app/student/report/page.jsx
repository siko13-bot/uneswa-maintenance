// src/app/student/report/page.js
"use client";
import { useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import styles from "../../styles/Dashboard.module.css";
import { Wrench, CheckCircle } from "lucide-react";

export default function ReportIssue() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    category: "",
    room: "",
    description: "",
    urgency: "Medium",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // We use fetch to send a POST request to our new Node.js server
      const response = await fetch("http://localhost:5000/api/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          student_id: 1, // We hardcode '1' for now (Siphesihle's ID in your database)
          category: formData.category,
          room: formData.room,
          description: formData.description,
          urgency: formData.urgency,
        }),
      });

      if (response.ok) {
        // If the server says "200 OK", we show the success screen!
        setIsSubmitted(true);
      } else {
        alert("Failed to submit the request. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting request:", error);
      alert(
        "Could not connect to the server. Make sure the backend is running!",
      );
    }
  };

  // (Keep the rest of your component the same)

  const resetForm = () => {
    setFormData({ category: "", room: "", description: "", urgency: "Medium" });
    setIsSubmitted(false);
  };

  return (
    <DashboardLayout role="student" userName="Siphesihle">
      <h1 className={styles.pageTitle}>Report Maintenance Issue</h1>

      <div
        className={styles.card}
        style={{ maxWidth: "600px", margin: "0 auto" }}
      >
        {isSubmitted ? (
          <div className={styles.successMessage}>
            <CheckCircle
              size={50}
              color="#28a745"
              style={{ marginBottom: "15px" }}
            />
            <h2>Issue Reported Successfully!</h2>
            <p>
              Your maintenance request has been forwarded to the administration.
              You can track its status in "My Requests".
            </p>
            <button
              onClick={resetForm}
              className={styles.primaryBtn}
              style={{ marginTop: "20px" }}
            >
              Report Another Issue
            </button>
          </div>
        ) : (
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
                <option value="Plumbing">
                  Plumbing (e.g., Leaking tap, blocked toilet)
                </option>
                <option value="Electrical">
                  Electrical (e.g., Faulty lights, broken socket)
                </option>
                <option value="Structural">
                  Structural (e.g., Broken window, damaged door)
                </option>
                <option value="Appliance">
                  Appliance (e.g., Stove, fridge not working)
                </option>
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
              ></textarea>
            </div>

            <button type="submit" className={styles.primaryBtn}>
              <Wrench size={18} /> Submit Request
            </button>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}
