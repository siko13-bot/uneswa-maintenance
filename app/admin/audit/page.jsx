// src/app/admin/audit/page.js
"use client";
import { useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import styles from "../../styles/Dashboard.module.css";
import { Save, Plus, Trash2, Info } from "lucide-react";
import toast from "react-hot-toast";

export default function HostelAudit() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    auditorId: 2, // Hardcoded for 'Mnguni' (Admin/Warden) for now
    hostelName: "",
    auditPeriod: "",
    ablution: {
      showers: { total: "", functional: "", faulty: "" },
      toilets: { total: "", functional: "", faulty: "" },
      sinks: { total: "", functional: "", faulty: "" },
      comments: "",
    },
    roomConditions: [], // Array to hold dynamically added issues like "Broken Windows: Room 12"
    general: {
      geyser: "Functional",
      corridorLights: "Good",
      washLines: "Good",
      dustBin: "Functional",
    },
    recommendations: "",
  });

  const handleAblutionChange = (facility, field, value) => {
    setFormData((prev) => ({
      ...prev,
      ablution: {
        ...prev.ablution,
        [facility]: { ...prev.ablution[facility], [field]: value },
      },
    }));
  };

  const addRoomCondition = () => {
    setFormData((prev) => ({
      ...prev,
      roomConditions: [...prev.roomConditions, { issue: "", rooms: "" }],
    }));
  };

  const removeRoomCondition = (index) => {
    setFormData((prev) => ({
      ...prev,
      roomConditions: prev.roomConditions.filter((_, i) => i !== index),
    }));
  };

  const handleRoomConditionChange = (index, field, value) => {
    const newConditions = [...formData.roomConditions];
    newConditions[index][field] = value;
    setFormData({ ...formData, roomConditions: newConditions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Show a loading toast while waiting for the server
    const toastId = toast.loading("Saving Audit & Generating Tickets...");

    try {
      const res = await fetch("http://localhost:5000/api/audits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success("Audit saved! Tickets auto-generated.", { id: toastId });
        // Reset form to default state after success
        setFormData({
          auditorId: 2,
          hostelName: "",
          auditPeriod: "",
          ablution: {
            showers: { total: "", functional: "", faulty: "" },
            toilets: { total: "", functional: "", faulty: "" },
            sinks: { total: "", functional: "", faulty: "" },
            comments: "",
          },
          roomConditions: [],
          general: {
            geyser: "Functional",
            corridorLights: "Good",
            washLines: "Good",
            dustBin: "Functional",
          },
          recommendations: "",
        });
      } else {
        alert("Failed to submit audit.");
      }
    } catch (error) {
      console.error("Error submitting audit:", error);
      alert("Could not connect to the server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout role="admin" userName="Mnguni">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "32px",
        }}
      >
        <div>
          <h1 className={styles.pageTitle} style={{ marginBottom: "8px" }}>
            Hostel Audit Data Form
          </h1>
          <p style={{ color: "var(--text-muted)" }}>
            Digital warden audit. Faults will automatically generate maintenance
            tickets.
          </p>
        </div>
      </div>

      <div className={styles.card}>
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* SECTION 1: HEADER */}
          <div className={styles.auditSection}>
            <h3 className={styles.sectionHeader}>1. Hostel Information</h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "24px",
              }}
            >
              <div className={styles.formGroup}>
                <label>Name of Hostel</label>
                <select
                  required
                  value={formData.hostelName}
                  onChange={(e) =>
                    setFormData({ ...formData, hostelName: e.target.value })
                  }
                >
                  <option value="">Select Hostel...</option>
                  <option value="Lomaqa">Lomaqa</option>
                  <option value="Kwaluseni">Kwaluseni</option>
                  <option value="Luyengo">Luyengo</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Period of Audit</label>
                <input
                  required
                  type="text"
                  placeholder="e.g., May 2026 Week 2"
                  value={formData.auditPeriod}
                  onChange={(e) =>
                    setFormData({ ...formData, auditPeriod: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: ABLUTION FACILITIES */}
          <div className={styles.auditSection}>
            <h3 className={styles.sectionHeader}>2. Ablution Facilities</h3>
            <table className={styles.table} style={{ marginBottom: "16px" }}>
              <thead>
                <tr>
                  <th>Facility</th>
                  <th>Total No.</th>
                  <th>Functional</th>
                  <th>Faulty</th>
                </tr>
              </thead>
              <tbody>
                {["showers", "toilets", "sinks"].map((item) => (
                  <tr key={item}>
                    <td
                      style={{ textTransform: "capitalize", fontWeight: "500" }}
                    >
                      {item}
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        className={styles.numInput}
                        value={formData.ablution[item].total}
                        onChange={(e) =>
                          handleAblutionChange(item, "total", e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        className={styles.numInput}
                        value={formData.ablution[item].functional}
                        onChange={(e) =>
                          handleAblutionChange(
                            item,
                            "functional",
                            e.target.value,
                          )
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        className={styles.numInput}
                        style={
                          formData.ablution[item].faulty > 0
                            ? {
                                borderColor: "var(--status-error-text)",
                                backgroundColor: "var(--status-error-bg)",
                                color: "var(--status-error-text)",
                                fontWeight: "bold",
                              }
                            : {}
                        }
                        value={formData.ablution[item].faulty}
                        onChange={(e) =>
                          handleAblutionChange(item, "faulty", e.target.value)
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className={styles.formGroup}>
              <label>Ablution Comments</label>
              <input
                type="text"
                placeholder="e.g., Our bathroom floors are slippery"
                value={formData.ablution.comments}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    ablution: { ...prev.ablution, comments: e.target.value },
                  }))
                }
              />
            </div>
          </div>

          {/* SECTION 3: ROOM CONDITIONS */}
          <div className={styles.auditSection}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "2px solid var(--border-subtle)",
                paddingBottom: "16px",
                marginBottom: "16px",
              }}
            >
              <h3 style={{ color: "var(--text-main)", fontSize: "1.125rem" }}>
                3. Room Conditions (Faults)
              </h3>
              <button
                type="button"
                onClick={addRoomCondition}
                className={styles.secondaryBtn}
              >
                <Plus size={18} /> Add Room Fault
              </button>
            </div>

            {formData.roomConditions.length === 0 ? (
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  background: "var(--bg-surface)",
                  padding: "16px",
                  borderRadius: "8px",
                  alignItems: "center",
                }}
              >
                <Info size={20} color="var(--text-muted)" />
                <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
                  No room faults recorded. Click 'Add Room Fault' to log
                  specific room issues.
                </p>
              </div>
            ) : (
              formData.roomConditions.map((cond, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    gap: "16px",
                    marginBottom: "16px",
                    alignItems: "center",
                    background: "var(--bg-surface)",
                    padding: "16px",
                    borderRadius: "8px",
                  }}
                >
                  <div className={styles.formGroup} style={{ flex: 1 }}>
                    <label>Issue Type</label>
                    <select
                      required
                      value={cond.issue}
                      onChange={(e) =>
                        handleRoomConditionChange(
                          index,
                          "issue",
                          e.target.value,
                        )
                      }
                    >
                      <option value="">Select Issue...</option>
                      <option value="Broken Windows">Broken Windows</option>
                      <option value="Worn-out Curtains">
                        Worn-out Curtains
                      </option>
                      <option value="Faulty Window Locks">
                        Faulty Window Locks
                      </option>
                      <option value="Mouldy Walls">Mouldy Walls</option>
                      <option value="Faulty Lockers">Faulty Lockers</option>
                      <option value="Broken Beds">Broken Beds</option>
                      <option value="Faulty Door Locks">
                        Faulty Door Locks
                      </option>
                    </select>
                  </div>
                  <div className={styles.formGroup} style={{ flex: 2 }}>
                    <label>Affected Room(s)</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g., Room 12, 14"
                      value={cond.rooms}
                      onChange={(e) =>
                        handleRoomConditionChange(
                          index,
                          "rooms",
                          e.target.value,
                        )
                      }
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeRoomCondition(index)}
                    className={styles.iconBtnDel}
                    style={{ marginTop: "24px" }}
                  >
                    <Trash2 size={24} color="var(--status-error-text)" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* SECTION 4: GENERAL */}
          <div className={styles.auditSection}>
            <h3 className={styles.sectionHeader}>
              4. General Hostel Infrastructure
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "24px",
              }}
            >
              <div className={styles.formGroup}>
                <label>Geyser Condition</label>
                <select
                  value={formData.general.geyser}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      general: { ...formData.general, geyser: e.target.value },
                    })
                  }
                >
                  <option value="Functional">Functional</option>
                  <option value="Non-functional">Non-functional</option>
                  <option value="N/A">N/A</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Corridor Lights</label>
                <select
                  value={formData.general.corridorLights}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      general: {
                        ...formData.general,
                        corridorLights: e.target.value,
                      },
                    })
                  }
                >
                  <option value="Good">Good</option>
                  <option value="Faulty">Faulty</option>
                  <option value="Requesting Replacement">
                    Requesting Replacement
                  </option>
                </select>
              </div>
            </div>

            <div className={styles.formGroup} style={{ marginTop: "24px" }}>
              <label>Final Recommendations / Requests</label>
              <textarea
                rows="3"
                placeholder="e.g., We request hot water"
                value={formData.recommendations}
                onChange={(e) =>
                  setFormData({ ...formData, recommendations: e.target.value })
                }
              ></textarea>
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <div
            style={{
              borderTop: "1px solid var(--border-subtle)",
              paddingTop: "24px",
              marginTop: "16px",
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <button
              type="submit"
              className={styles.primaryBtn}
              disabled={isSubmitting}
            >
              <Save size={20} />{" "}
              {isSubmitting ? "Saving Audit..." : "Save Audit Report"}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
