// src/components/ReportModal.jsx
"use client";
import { useState } from "react";
import styles from "../styles/Dashboard.module.css";
import { FileText, FileSpreadsheet, X } from "lucide-react";
import { saveAs } from "file-saver";

export default function ReportModal({ isOpen, onClose }) {
  const [filters, setFilters] = useState({
    status: "all",
    category: "all",
    startDate: "",
    endDate: "",
  });
  const [loading, setLoading] = useState(false);

  const handleExport = async (format) => {
    setLoading(true);
    try {
      const endpoint =
        format === "excel"
          ? "http://localhost:5000/api/reports/excel"
          : "http://localhost:5000/api/reports/pdf";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(filters),
      });

      if (response.ok) {
        const blob = await response.blob();
        const filename = `maintenance-report-${new Date().toISOString().slice(0, 19)}.${format === "excel" ? "xlsx" : "pdf"}`;
        saveAs(blob, filename);
        onClose();
      } else {
        alert("Failed to generate report");
      }
    } catch (error) {
      console.error("Export error:", error);
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3>Export Report</h3>
          <button onClick={onClose} className={styles.modalClose}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.formGroup}>
            <label>Status</label>
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
            >
              <option value="all">All</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Category</label>
            <select
              value={filters.category}
              onChange={(e) =>
                setFilters({ ...filters, category: e.target.value })
              }
            >
              <option value="all">All</option>
              <option value="Plumbing">Plumbing</option>
              <option value="Electrical">Electrical</option>
              <option value="Structural">Structural</option>
              <option value="Appliance">Appliance</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) =>
                  setFilters({ ...filters, startDate: e.target.value })
                }
              />
            </div>
            <div className={styles.formGroup}>
              <label>End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) =>
                  setFilters({ ...filters, endDate: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button
            onClick={() => handleExport("excel")}
            className={styles.secondaryBtn}
            disabled={loading}
          >
            <FileSpreadsheet size={18} />
            Export to Excel
          </button>
          <button
            onClick={() => handleExport("pdf")}
            className={styles.primaryBtn}
            disabled={loading}
          >
            <FileText size={18} />
            Export to PDF
          </button>
        </div>
      </div>
    </div>
  );
}
