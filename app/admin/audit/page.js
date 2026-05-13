// src/app/admin/audit/page.js
"use client";
import { useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import styles from "../../styles/Dashboard.module.css";
import { ClipboardList, Plus, Trash2 } from "lucide-react";

export default function AuditForm() {
  // 1. STATE MANAGEMENT FOR THE ENTIRE FORM
  const [formData, setFormData] = useState({
    hostelName: "",
    period: "",
    wardenName: "Lomaqa", // Pre-filled from login eventually
    ablution: {
      showers: { total: "", faulty: "" },
      toilets: { total: "", faulty: "" },
      sinks: { total: "", faulty: "" },
      showerCurtains: { total: "", faulty: "" },
    },
    ablutionComments: "",
    hostelDoors: "",
    roomConditions: [], // Will hold dynamic rows like: { issue: 'Broken Windows', rooms: '12, 14' }
    general: {
      geyser: "Functional",
      dustBin: "Available",
      washLines: "Good",
      corridorLights: "Good",
      waterSystem: "Functional",
      vegetation: "Normal",
      wallPaint: "Good",
      hygiene: "Good",
    },
    recommendations: "",
  });

  // State for adding a new dynamic room issue
  const [newRoomIssue, setNewRoomIssue] = useState({
    issue: "Broken Windows",
    rooms: "",
  });

  // 2. HANDLERS
  const handleAblutionChange = (item, field, value) => {
    setFormData({
      ...formData,
      ablution: {
        ...formData.ablution,
        [item]: { ...formData.ablution[item], [field]: value },
      },
    });
  };

  const handleGeneralChange = (field, value) => {
    setFormData({
      ...formData,
      general: { ...formData.general, [field]: value },
    });
  };

  const addRoomIssue = () => {
    if (!newRoomIssue.rooms) return;
    setFormData({
      ...formData,
      roomConditions: [...formData.roomConditions, newRoomIssue],
    });
    setNewRoomIssue({ issue: "Broken Windows", rooms: "" }); // Reset
  };

  const removeRoomIssue = (index) => {
    const updated = formData.roomConditions.filter((_, i) => i !== index);
    setFormData({ ...formData, roomConditions: updated });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("FINAL AUDIT DATA TO SEND TO BACKEND:", formData);
    alert("Form submitted! Check browser console to see the data payload.");
    // In the next step, we will use fetch() here to send this to Node.js!
  };

  // 3. UI
  return (
    <DashboardLayout role="admin" userName="Mnguni">
      <div
        className={styles.pageHeader}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h1 className={styles.pageTitle} style={{ margin: 0 }}>
          <ClipboardList
            size={28}
            style={{ marginRight: "10px", verticalAlign: "middle" }}
          />{" "}
          Hostel Audit Data Form
        </h1>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          paddingBottom: "40px",
        }}
      >
        {/* SECTION 1: HEADER DETAILS */}
        <div className={styles.card}>
          <h3
            style={{
              borderBottom: "1px solid #eee",
              paddingBottom: "10px",
              marginBottom: "15px",
            }}
          >
            Audit Details
          </h3>
          <div style={{ display: "flex", gap: "15px" }}>
            <div className={styles.formGroup} style={{ flex: 1 }}>
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
                <option value="Mbabane">Mbabane</option>
              </select>
            </div>
            <div className={styles.formGroup} style={{ flex: 1 }}>
              <label>Period of Audit</label>
              <input
                type="text"
                placeholder="e.g., May 2026"
                required
                value={formData.period}
                onChange={(e) =>
                  setFormData({ ...formData, period: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: ABLUTION FACILITIES */}
        <div className={styles.card}>
          <h3
            style={{
              borderBottom: "1px solid #eee",
              paddingBottom: "10px",
              marginBottom: "15px",
            }}
          >
            Ablution Facilities
          </h3>
          <table className={styles.table} style={{ marginBottom: "15px" }}>
            <thead>
              <tr>
                <th>Facility</th>
                <th>Total No.</th>
                <th>Faulty No.</th>
              </tr>
            </thead>
            <tbody>
              {["showers", "toilets", "sinks", "showerCurtains"].map((item) => (
                <tr key={item}>
                  <td style={{ textTransform: "capitalize" }}>
                    {item.replace(/([A-Z])/g, " $1").trim()}
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      placeholder="Total"
                      style={{ width: "80px", padding: "5px" }}
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
                      placeholder="Faulty"
                      style={{
                        width: "80px",
                        padding: "5px",
                        borderColor:
                          formData.ablution[item].faulty > 0 ? "red" : "#ddd",
                      }}
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
            <textarea
              rows="2"
              placeholder="e.g., Our bathroom floors are slippery"
              value={formData.ablutionComments}
              onChange={(e) =>
                setFormData({ ...formData, ablutionComments: e.target.value })
              }
            ></textarea>
          </div>
        </div>

        {/* SECTION 3: ROOM CONDITIONS (Dynamic List) */}
        <div className={styles.card}>
          <h3
            style={{
              borderBottom: "1px solid #eee",
              paddingBottom: "10px",
              marginBottom: "15px",
            }}
          >
            Room Conditions
          </h3>

          {/* List of added issues */}
          {formData.roomConditions.length > 0 && (
            <div
              style={{
                marginBottom: "15px",
                background: "#f9f9f9",
                padding: "15px",
                borderRadius: "8px",
              }}
            >
              {formData.roomConditions.map((item, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "10px",
                    paddingBottom: "10px",
                    borderBottom: "1px solid #eee",
                  }}
                >
                  <span>
                    <strong>{item.issue}:</strong> Room(s) {item.rooms}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeRoomIssue(index)}
                    style={{
                      color: "red",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add new issue form */}
          <div style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
            <div className={styles.formGroup} style={{ flex: 1 }}>
              <label>Issue Type</label>
              <select
                value={newRoomIssue.issue}
                onChange={(e) =>
                  setNewRoomIssue({ ...newRoomIssue, issue: e.target.value })
                }
              >
                <option value="Broken Windows">Broken Windows</option>
                <option value="Worn-out Curtains">Worn-out Curtains</option>
                <option value="Mouldy Walls">Mouldy Walls</option>
                <option value="Faulty Window Locks">Faulty Window Locks</option>
                <option value="Faulty Lockers">Faulty Lockers</option>
                <option value="Broken Beds">Broken Beds</option>
                <option value="Faulty Door Locks">Faulty Door Locks</option>
              </select>
            </div>
            <div className={styles.formGroup} style={{ flex: 1 }}>
              <label>Room Number(s)</label>
              <input
                type="text"
                placeholder="e.g., 12, 14, 15"
                value={newRoomIssue.rooms}
                onChange={(e) =>
                  setNewRoomIssue({ ...newRoomIssue, rooms: e.target.value })
                }
              />
            </div>
            <button
              type="button"
              onClick={addRoomIssue}
              className={styles.primaryBtn}
              style={{ padding: "10px 15px", height: "42px" }}
            >
              <Plus size={18} /> Add
            </button>
          </div>
        </div>

        {/* SECTION 4: GENERAL COMMENTS & RECOMMENDATIONS */}
        <div className={styles.card}>
          <h3
            style={{
              borderBottom: "1px solid #eee",
              paddingBottom: "10px",
              marginBottom: "15px",
            }}
          >
            General Environment & Recommendations
          </h3>
          <div className={styles.formGroup} style={{ marginBottom: "15px" }}>
            <label>Recommendations / Requests</label>
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

        <button
          type="submit"
          className={styles.primaryBtn}
          style={{ fontSize: "18px", padding: "15px" }}
        >
          Submit Warden Audit
        </button>
      </form>
    </DashboardLayout>
  );
}
