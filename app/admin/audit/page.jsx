"use client";
import { useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import styles from "../../styles/Audit.module.css";
import { Save, Printer } from "lucide-react";
import toast from "react-hot-toast";

export default function HostelAudit() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    // Header
    hostelName: "",
    periodOfAudit: "",
    wardenName: "",

    // Ablution Facilities
    ablution: {
      showers: { functional: "", faulty: "", total: "" },
      toilets: { functional: "", faulty: "", total: "" },
      sinks: { functional: "", faulty: "", total: "" },
      showerCurtains: { functional: "", faulty: "", total: "" },
      internalLights: { functional: "", faulty: "", total: "" },
    },
    ablutionComments: "",

    // Hostel Doors
    hostelDoors: {
      comments: "",
    },

    // Room Conditions — each has room numbers + condition text
    roomConditions: {
      brokenWindows: { roomNumbers: "", condition: "" },
      wornOutCurtains: { roomNumbers: "", condition: "" },
      mouldyWallsRoom: { roomNumbers: "", condition: "" },
      faultyWindowLocks: { roomNumbers: "", condition: "" },
      faultyBookShelf: { roomNumbers: "", condition: "" },
      faultyLockers: { roomNumbers: "", condition: "" },
      brokenBeds: { roomNumbers: "", condition: "" },
      faultyDoorLocks: { roomNumbers: "", condition: "" },
    },

    // User Condition
    userCondition: "",

    // Dust Bin
    dustBin: "",

    // Wash Lines
    washLines: "",

    // Corridor Lights
    corridorLights: "",

    // Water System
    waterSystem: "",

    // Bulbs
    bulbs: {
      pe: { qty: "", comment: "" },
      screwIn: { qty: "", comment: "" },
      hookIn: { qty: "", comment: "" },
    },

    // Wall Paint
    wallPaint: "",

    // Hostel Hygiene
    hostelHygiene: "",

    // Over-Grown Vegetation
    overGrownVegetation: "",

    // Recommendations / Comments
    recommendations: "",

    // Warden Condition
    wardenCondition: "",

    // Signature
    signature: "",
    date: new Date().toISOString().split("T")[0],
  });

  const set = (path, value) => {
    setFormData((prev) => {
      const keys = path.split(".");
      const next = { ...prev };
      let cur = next;
      for (let i = 0; i < keys.length - 1; i++) {
        cur[keys[i]] = { ...cur[keys[i]] };
        cur = cur[keys[i]];
      }
      cur[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const toastId = toast.loading("Saving audit report...");
    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/audits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          auditorId: JSON.parse(sessionStorage.getItem("user")).id,
          hostelName: formData.hostelName,
          auditPeriod: formData.periodOfAudit,
          auditData: formData,
        }),
      });
      if (response.ok) {
        toast.success("Audit report saved successfully!", { id: toastId });
      } else {
        toast.error("Failed to save audit report", { id: toastId });
      }
    } catch (error) {
      console.error("Error saving audit:", error);
      toast.error("Server error", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const ablutionRows = [
    { key: "showers", label: "SHOWERS" },
    { key: "toilets", label: "TOILETS" },
    { key: "sinks", label: "SINKS" },
    { key: "showerCurtains", label: "SHOWER CURTAINS" },
    { key: "internalLights", label: "INTERNAL LIGHTS" },
  ];

  const roomConditionRows = [
    { key: "brokenWindows", label: "Broken Windows" },
    { key: "wornOutCurtains", label: "Worn-out Curtains" },
    { key: "mouldy WallsRoom", label: "Mouldy Walls" },
    { key: "faultyWindowLocks", label: "Faulty Window Locks" },
    { key: "faultyBookShelf", label: "Faulty Book-Shelf" },
    { key: "faultyLockers", label: "Faulty Lockers" },
    { key: "brokenBeds", label: "Broken Beds" },
    { key: "faultyDoorLocks", label: "Faulty Door Locks" },
  ];

  // Map label -> camelCase key for roomConditions
  const roomKeyMap = {
    "Broken Windows": "brokenWindows",
    "Worn-out Curtains": "wornOutCurtains",
    "Mouldy Walls": "mouldy WallsRoom",
    "Faulty Window Locks": "faultyWindowLocks",
    "Faulty Book-Shelf": "faultyBookShelf",
    "Faulty Lockers": "faultyLockers",
    "Broken Beds": "brokenBeds",
    "Faulty Door Locks": "faultyDoorLocks",
  };

  return (
    <DashboardLayout role="admin" userName="Mnguni">
      <div className={styles.auditContainer}>
        {/* Header Actions */}
        <div className={styles.headerActions}>
          <h1 className={styles.pageTitle}>Hostel Audit Form</h1>
          <div className={styles.actionButtons}>
            <button
              onClick={() => window.print()}
              className={styles.secondaryBtn}
            >
              <Printer size={18} /> Print
            </button>
            <button
              onClick={handleSubmit}
              className={styles.primaryBtn}
              disabled={isSubmitting}
            >
              <Save size={18} /> {isSubmitting ? "Saving..." : "Save Audit"}
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className={styles.auditForm}>
          {/* ── FORM HEADER ── */}
          <div className={styles.formBrand}>
            <div className={styles.brandLogo}>
              <div className={styles.logoPlaceholder}>UNESWA</div>
            </div>
            <div className={styles.brandTitle}>
              <h2>UNIVERSITY OF ESWATINI</h2>
              <h3>HOSTEL AUDIT DATA FORM</h3>
              <p className={styles.officeLabel}>WARDENS OFFICE: KWALUSENI</p>
            </div>
          </div>

          <div className={styles.headerSection}>
            <div className={styles.headerRow}>
              <div className={styles.headerField}>
                <label>NAME OF HOSTEL</label>
                <input
                  type="text"
                  value={formData.hostelName}
                  onChange={(e) => set("hostelName", e.target.value)}
                  placeholder="Enter hostel name"
                  required
                />
              </div>
              <div className={styles.headerField}>
                <label>PERIOD OF AUDIT</label>
                <input
                  type="text"
                  value={formData.periodOfAudit}
                  onChange={(e) => set("periodOfAudit", e.target.value)}
                  placeholder="e.g. Jan 2025"
                />
              </div>
              <div className={styles.headerField}>
                <label>WARDEN NAME</label>
                <input
                  type="text"
                  value={formData.wardenName}
                  onChange={(e) => set("wardenName", e.target.value)}
                  placeholder="Warden's name"
                />
              </div>
            </div>
          </div>

          {/* ── ABLUTION FACILITIES ── */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>ABLUTION FACILITIES</h2>
            <p className={styles.sectionNote}>
              Identify faulty doors either room, toilet or main entrance doors
            </p>
            <table className={styles.commentsTable}>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Functional</th>
                  <th>Faulty</th>
                  <th>Total No.</th>
                  <th>Comments</th>
                </tr>
              </thead>
              <tbody>
                {ablutionRows.map(({ key, label }) => (
                  <tr key={key}>
                    <td className={styles.itemLabel}>{label}</td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        value={formData.ablution[key].functional}
                        onChange={(e) =>
                          set(`ablution.${key}.functional`, e.target.value)
                        }
                        className={styles.numberInput}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        value={formData.ablution[key].faulty}
                        onChange={(e) =>
                          set(`ablution.${key}.faulty`, e.target.value)
                        }
                        className={styles.numberInput}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        value={formData.ablution[key].total}
                        onChange={(e) =>
                          set(`ablution.${key}.total`, e.target.value)
                        }
                        className={styles.numberInput}
                      />
                    </td>
                    {key === "showers" ? (
                      <td rowSpan={5} className={styles.tallCommentCell}>
                        <textarea
                          rows={6}
                          value={formData.ablutionComments}
                          onChange={(e) =>
                            set("ablutionComments", e.target.value)
                          }
                          className={styles.cellTextarea}
                          placeholder="Comments on ablution facilities..."
                        />
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── HOSTEL DOORS ── */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>HOSTEL DOORS</h2>
            <div className={styles.fieldGroup}>
              <label>Comments</label>
              <textarea
                rows={3}
                value={formData.hostelDoors.comments}
                onChange={(e) => set("hostelDoors.comments", e.target.value)}
                className={styles.notesTextarea}
                placeholder="e.g. Toilet doors and main entrance door..."
              />
            </div>
          </div>

          {/* ── ROOM CONDITIONS ── */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>ROOM CONDITIONS</h2>
            <table className={styles.commentsTable}>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Room Numbers</th>
                  <th>Condition / Remarks</th>
                </tr>
              </thead>
              <tbody>
                {roomConditionRows.map(({ label }) => {
                  const key = roomKeyMap[label];
                  return (
                    <tr key={key}>
                      <td className={styles.itemLabel}>{label}</td>
                      <td>
                        <input
                          type="text"
                          value={
                            formData.roomConditions[key]?.roomNumbers ?? ""
                          }
                          onChange={(e) =>
                            set(
                              `roomConditions.${key}.roomNumbers`,
                              e.target.value,
                            )
                          }
                          className={styles.textInput}
                          placeholder="Room numbers"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={formData.roomConditions[key]?.condition ?? ""}
                          onChange={(e) =>
                            set(
                              `roomConditions.${key}.condition`,
                              e.target.value,
                            )
                          }
                          className={styles.textInput}
                          placeholder="Condition / remarks"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ── GENERAL CONDITIONS ── */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>GENERAL CONDITIONS</h2>
            <table className={styles.commentsTable}>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Condition / Remarks</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { key: "userCondition", label: "User Condition" },
                  { key: "dustBin", label: "Dust Bin" },
                  { key: "washLines", label: "Wash-Lines" },
                  { key: "corridorLights", label: "Corridor Lights" },
                  { key: "waterSystem", label: "Water System" },
                ].map(({ key, label }) => (
                  <tr key={key}>
                    <td className={styles.itemLabel}>{label}</td>
                    <td>
                      <input
                        type="text"
                        value={formData[key]}
                        onChange={(e) => set(key, e.target.value)}
                        className={styles.textInput}
                        placeholder="Good / Fair / Poor / N/A"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── BULBS ── */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>BULBS</h2>
            <p className={styles.sectionNote}>
              NB: Indicate number of absent bulbs
            </p>
            <table className={styles.commentsTable}>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>QTY</th>
                  <th>Comment</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { key: "pe", label: "PE" },
                  { key: "screwIn", label: "SCREW-IN" },
                  { key: "hookIn", label: "HOOK-IN" },
                ].map(({ key, label }) => (
                  <tr key={key}>
                    <td className={styles.itemLabel}>{label}</td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        value={formData.bulbs[key].qty}
                        onChange={(e) =>
                          set(`bulbs.${key}.qty`, e.target.value)
                        }
                        className={styles.numberInput}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={formData.bulbs[key].comment}
                        onChange={(e) =>
                          set(`bulbs.${key}.comment`, e.target.value)
                        }
                        className={styles.textInput}
                        placeholder="Comment"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── WALL PAINT / HOSTEL HYGIENE / OVER-GROWN VEGETATION ── */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>PROPERTY CONDITIONS</h2>
            <table className={styles.commentsTable}>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Condition / Comment</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { key: "wallPaint", label: "Wall Paint" },
                  { key: "hostelHygiene", label: "Hostel Hygiene" },
                  {
                    key: "overGrownVegetation",
                    label: "Over-Grown Vegetation",
                  },
                  { key: "wardenCondition", label: "Warden Condition" },
                ].map(({ key, label }) => (
                  <tr key={key}>
                    <td className={styles.itemLabel}>{label}</td>
                    <td>
                      <input
                        type="text"
                        value={formData[key]}
                        onChange={(e) => set(key, e.target.value)}
                        className={styles.textInput}
                        placeholder="Condition or comment"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── RECOMMENDATIONS ── */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>RECOMMENDATIONS / COMMENTS</h2>
            <textarea
              rows={4}
              value={formData.recommendations}
              onChange={(e) => set("recommendations", e.target.value)}
              placeholder="Enter recommendations or general comments..."
              className={styles.notesTextarea}
            />
          </div>

          {/* ── SIGNATURE ── */}
          <div className={styles.signatureSection}>
            <div className={styles.signatureRow}>
              <div className={styles.signatureField}>
                <label>Warden Signature</label>
                <input
                  type="text"
                  value={formData.signature}
                  onChange={(e) => set("signature", e.target.value)}
                  placeholder="Signature"
                  className={styles.textInput}
                />
              </div>
              <div className={styles.signatureField}>
                <label>Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => set("date", e.target.value)}
                  className={styles.textInput}
                />
              </div>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
