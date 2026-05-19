// src/app/admin/audit/page.js
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "../../components/DashboardLayout";
import styles from "../../styles/Audit.module.css";
import { Save, Printer, Download } from "lucide-react";
import toast from "react-hot-toast";

export default function HostelAudit() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    // Header
    hotelName: "",
    date: new Date().toISOString().split("T")[0],
    signature: "",

    // Section 1: Comments Table (Showers, Toilets, Bathrooms, Storage, Internal Lights)
    comments: {
      showers: { functional: "", faulty: "", remarks: "" },
      toilets: { functional: "", faulty: "", remarks: "" },
      bathrooms: { functional: "", faulty: "", remarks: "" },
      storage: { functional: "", faulty: "", remarks: "" },
      internalLights: { functional: "", faulty: "", remarks: "" },
    },

    // Section 2: Room Conditions
    roomConditions: {
      condition: "",
      notes: "",
    },

    // Section 3: Wall Paint
    wallPaint: {
      condition: "",
      comments: "",
    },

    // Section 4: Overgrown Vegetation
    vegetation: {
      pe: false,
      shrinker: false,
      hookIn: false,
      screwIn: false,
      overgrown: false,
      remarks: "",
    },

    // Section 5: Other Grown Vegetation
    otherVegetation: {
      condition: "",
      remarks: "",
    },

    // Notes
    notes: "",
  });

  const handleCommentChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      comments: {
        ...prev.comments,
        [section]: { ...prev.comments[section], [field]: value },
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const toastId = toast.loading("Saving audit report...");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/audits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          auditorId: JSON.parse(localStorage.getItem("user")).id,
          hostelName: formData.hotelName,
          auditPeriod: formData.date,
          auditData: formData,
        }),
      });

      if (response.ok) {
        toast.success("Audit report saved successfully!", { id: toastId });
        // Optionally print or reset
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

  const handlePrint = () => {
    window.print();
  };

  return (
    <DashboardLayout role="admin" userName="Mnguni">
      <div className={styles.auditContainer}>
        {/* Header Actions */}
        <div className={styles.headerActions}>
          <h1 className={styles.pageTitle}>Hostel Audit Form</h1>
          <div className={styles.actionButtons}>
            <button onClick={handlePrint} className={styles.secondaryBtn}>
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
          {/* Header Section */}
          <div className={styles.headerSection}>
            <div className={styles.headerRow}>
              <div className={styles.headerField}>
                <label>Name of Hostel</label>
                <input
                  type="text"
                  value={formData.hotelName}
                  onChange={(e) =>
                    setFormData({ ...formData, hotelName: e.target.value })
                  }
                  placeholder="Enter hostel name"
                  required
                />
              </div>
              <div className={styles.headerField}>
                <label>Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 1: COMMENTS TABLE */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>COMMENTS</h2>
            <table className={styles.commentsTable}>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Functional</th>
                  <th>Faulty</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={styles.itemLabel}>SHOWERS</td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      value={formData.comments.showers.functional}
                      onChange={(e) =>
                        handleCommentChange(
                          "showers",
                          "functional",
                          e.target.value,
                        )
                      }
                      className={styles.numberInput}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      value={formData.comments.showers.faulty}
                      onChange={(e) =>
                        handleCommentChange("showers", "faulty", e.target.value)
                      }
                      className={styles.numberInput}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={formData.comments.showers.remarks}
                      onChange={(e) =>
                        handleCommentChange(
                          "showers",
                          "remarks",
                          e.target.value,
                        )
                      }
                      className={styles.textInput}
                      placeholder="Remarks"
                    />
                  </td>
                </tr>
                <tr>
                  <td className={styles.itemLabel}>TOILETS</td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      value={formData.comments.toilets.functional}
                      onChange={(e) =>
                        handleCommentChange(
                          "toilets",
                          "functional",
                          e.target.value,
                        )
                      }
                      className={styles.numberInput}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      value={formData.comments.toilets.faulty}
                      onChange={(e) =>
                        handleCommentChange("toilets", "faulty", e.target.value)
                      }
                      className={styles.numberInput}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={formData.comments.toilets.remarks}
                      onChange={(e) =>
                        handleCommentChange(
                          "toilets",
                          "remarks",
                          e.target.value,
                        )
                      }
                      className={styles.textInput}
                      placeholder="Remarks"
                    />
                  </td>
                </tr>
                <tr>
                  <td className={styles.itemLabel}>BATHROOMS</td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      value={formData.comments.bathrooms.functional}
                      onChange={(e) =>
                        handleCommentChange(
                          "bathrooms",
                          "functional",
                          e.target.value,
                        )
                      }
                      className={styles.numberInput}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      value={formData.comments.bathrooms.faulty}
                      onChange={(e) =>
                        handleCommentChange(
                          "bathrooms",
                          "faulty",
                          e.target.value,
                        )
                      }
                      className={styles.numberInput}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={formData.comments.bathrooms.remarks}
                      onChange={(e) =>
                        handleCommentChange(
                          "bathrooms",
                          "remarks",
                          e.target.value,
                        )
                      }
                      className={styles.textInput}
                      placeholder="Remarks"
                    />
                  </td>
                </tr>
                <tr>
                  <td className={styles.itemLabel}>STORAGE/CLOTHES</td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      value={formData.comments.storage.functional}
                      onChange={(e) =>
                        handleCommentChange(
                          "storage",
                          "functional",
                          e.target.value,
                        )
                      }
                      className={styles.numberInput}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      value={formData.comments.storage.faulty}
                      onChange={(e) =>
                        handleCommentChange("storage", "faulty", e.target.value)
                      }
                      className={styles.numberInput}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={formData.comments.storage.remarks}
                      onChange={(e) =>
                        handleCommentChange(
                          "storage",
                          "remarks",
                          e.target.value,
                        )
                      }
                      className={styles.textInput}
                      placeholder="Remarks"
                    />
                  </td>
                </tr>
                <tr>
                  <td className={styles.itemLabel}>INTERNAL LIGHTS</td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      value={formData.comments.internalLights.functional}
                      onChange={(e) =>
                        handleCommentChange(
                          "internalLights",
                          "functional",
                          e.target.value,
                        )
                      }
                      className={styles.numberInput}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      value={formData.comments.internalLights.faulty}
                      onChange={(e) =>
                        handleCommentChange(
                          "internalLights",
                          "faulty",
                          e.target.value,
                        )
                      }
                      className={styles.numberInput}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={formData.comments.internalLights.remarks}
                      onChange={(e) =>
                        handleCommentChange(
                          "internalLights",
                          "remarks",
                          e.target.value,
                        )
                      }
                      className={styles.textInput}
                      placeholder="Remarks"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 2: ROOM CONDITIONS */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>ROOM CONDITIONS</h2>
            <div className={styles.simpleRow}>
              <div className={styles.fieldGroup}>
                <label>Condition</label>
                <input
                  type="text"
                  value={formData.roomConditions.condition}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      roomConditions: {
                        ...formData.roomConditions,
                        condition: e.target.value,
                      },
                    })
                  }
                  placeholder="e.g., Good, Fair, Poor"
                  className={styles.textInput}
                />
              </div>
              <div className={styles.fieldGroup}>
                <label>Notes</label>
                <input
                  type="text"
                  value={formData.roomConditions.notes}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      roomConditions: {
                        ...formData.roomConditions,
                        notes: e.target.value,
                      },
                    })
                  }
                  placeholder="Additional notes"
                  className={styles.textInput}
                />
              </div>
            </div>
          </div>

          {/* Section 3: WALL PAINT */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>WALL PAINT</h2>
            <div className={styles.simpleRow}>
              <div className={styles.fieldGroup}>
                <label>Condition</label>
                <input
                  type="text"
                  value={formData.wallPaint.condition}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      wallPaint: {
                        ...formData.wallPaint,
                        condition: e.target.value,
                      },
                    })
                  }
                  placeholder="e.g., Good, Peeling, Stained"
                  className={styles.textInput}
                />
              </div>
              <div className={styles.fieldGroup}>
                <label>Comments</label>
                <input
                  type="text"
                  value={formData.wallPaint.comments}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      wallPaint: {
                        ...formData.wallPaint,
                        comments: e.target.value,
                      },
                    })
                  }
                  placeholder="Additional comments"
                  className={styles.textInput}
                />
              </div>
            </div>
          </div>

          {/* Section 4: OVER GROWN VEGETATION */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>OVER GROWN VEGETATION</h2>
            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.vegetation.pe}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      vegetation: {
                        ...formData.vegetation,
                        pe: e.target.checked,
                      },
                    })
                  }
                />
                PE
              </label>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.vegetation.shrinker}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      vegetation: {
                        ...formData.vegetation,
                        shrinker: e.target.checked,
                      },
                    })
                  }
                />
                SHRINKER
              </label>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.vegetation.hookIn}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      vegetation: {
                        ...formData.vegetation,
                        hookIn: e.target.checked,
                      },
                    })
                  }
                />
                HOOK-IN
              </label>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.vegetation.screwIn}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      vegetation: {
                        ...formData.vegetation,
                        screwIn: e.target.checked,
                      },
                    })
                  }
                />
                SCREW-IN
              </label>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.vegetation.overgrown}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      vegetation: {
                        ...formData.vegetation,
                        overgrown: e.target.checked,
                      },
                    })
                  }
                />
                OVERGROWN
              </label>
            </div>
            <div className={styles.fieldGroup}>
              <label>Remarks</label>
              <input
                type="text"
                value={formData.vegetation.remarks}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    vegetation: {
                      ...formData.vegetation,
                      remarks: e.target.value,
                    },
                  })
                }
                placeholder="Additional remarks"
                className={styles.textInput}
              />
            </div>
          </div>

          {/* Section 5: OTHER GROWN VEGETATION */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>OTHER GROWN VEGETATION</h2>
            <div className={styles.simpleRow}>
              <div className={styles.fieldGroup}>
                <label>Condition</label>
                <input
                  type="text"
                  value={formData.otherVegetation.condition}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      otherVegetation: {
                        ...formData.otherVegetation,
                        condition: e.target.value,
                      },
                    })
                  }
                  placeholder="Condition"
                  className={styles.textInput}
                />
              </div>
              <div className={styles.fieldGroup}>
                <label>Remarks</label>
                <input
                  type="text"
                  value={formData.otherVegetation.remarks}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      otherVegetation: {
                        ...formData.otherVegetation,
                        remarks: e.target.value,
                      },
                    })
                  }
                  placeholder="Remarks"
                  className={styles.textInput}
                />
              </div>
            </div>
          </div>

          {/* Section 6: NOTES */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>NOTES</h2>
            <textarea
              rows={4}
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Enter any additional notes here..."
              className={styles.notesTextarea}
            />
          </div>

          {/* Signature Section */}
          <div className={styles.signatureSection}>
            <div className={styles.signatureField}>
              <label>Signature</label>
              <input
                type="text"
                value={formData.signature}
                onChange={(e) =>
                  setFormData({ ...formData, signature: e.target.value })
                }
                placeholder="Warden signature"
                className={styles.textInput}
              />
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
