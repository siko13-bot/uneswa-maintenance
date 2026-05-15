const express = require("express");
const cors = require("cors");
const pool = require("./db");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors()); // Allows Next.js to communicate with Node
app.use(express.json()); // Parses incoming JSON requests

// ==========================================
// MULTER CONFIGURATION (IMAGE UPLOAD)
// ==========================================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Save files to the uploads folder
  },
  filename: function (req, file, cb) {
    // Give the file a unique name using the current timestamp
    cb(
      null,
      Date.now() +
        "-" +
        Math.round(Math.random() * 1e9) +
        path.extname(file.originalname),
    );
  },
});
const upload = multer({ storage: storage });
// ==========================================
// ROUTES
// ==========================================

// Test Route
app.get("/", (req, res) => {
  res.send("UNESWA Maintenance API is running...");
});

// Remove `upload.single('image')` from the middle of the route declaration.
// Instead, we will handle it safely inside the route:

app.post("/api/requests", (req, res) => {
  // Wrap the upload process safely
  upload.single("image")(req, res, async function (err) {
    if (err) {
      console.error("MULTER UPLOAD ERROR:", err.message);
      return res
        .status(500)
        .json({ error: "File upload failed: " + err.message });
    }

    try {
      const { student_id, category, room, description, urgency } = req.body;

      // If a file was uploaded, save its path, otherwise set it to null
      const image_url = req.file ? `/uploads/${req.file.filename}` : null;

      const newRequest = await pool.query(
        "INSERT INTO requests (student_id, category, room, description, urgency, image_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
        [student_id, category, room, description, urgency, image_url],
      );

      res.json(newRequest.rows[0]);
    } catch (dbErr) {
      console.error("DATABASE ERROR:", dbErr.message);
      res.status(500).json({ error: "Database save failed" });
    }
  });
});
// 2. GET all requests (Used by Admin Dashboard)
app.get("/api/requests", async (req, res) => {
  try {
    // We join with the users table to get the student's name
    const allRequests = await pool.query(`
            SELECT r.*, u.name as student_name 
            FROM requests r 
            JOIN users u ON r.student_id = u.id 
            ORDER BY r.created_at DESC
        `);
    res.json(allRequests.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
// 3. UPDATE request status (Used by Admin)
app.put("/api/requests/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // Expects "Pending", "In Progress", or "Resolved"

    const updateRequest = await pool.query(
      "UPDATE requests SET status = $1 WHERE id = $2 RETURNING *",
      [status, id],
    );

    res.json(updateRequest.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 4. GET requests for a specific student (Used by Student Dashboard)
app.get("/api/requests/student/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;
    const studentRequests = await pool.query(
      "SELECT * FROM requests WHERE student_id = $1 ORDER BY created_at DESC",
      [studentId],
    );
    res.json(studentRequests.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
// ==========================================
// AUDIT ROUTES
// ==========================================

// 5. POST new hostel audit & Auto-generate tickets
app.post("/api/audits", async (req, res) => {
  // We use a database transaction. If one part fails, everything rolls back.
  const client = await pool.connect();

  try {
    await client.query("BEGIN"); // Start transaction

    const {
      auditorId,
      hostelName,
      auditPeriod,
      ablution,
      roomConditions,
      general,
      recommendations,
    } = req.body;

    // 1. Insert Main Audit Record
    const auditRes = await client.query(
      `INSERT INTO hostel_audits (auditor_id, hostel_name, audit_period, recommendations) 
             VALUES ($1, $2, $3, $4) RETURNING id`,
      [auditorId, hostelName, auditPeriod, recommendations],
    );
    const auditId = auditRes.rows[0].id;

    // 2. Insert Detailed Audit Data (JSONB)
    // Save Ablution Data
    await client.query(
      `INSERT INTO audit_data (audit_id, section_name, form_data) VALUES ($1, $2, $3)`,
      [auditId, "ablution", JSON.stringify(ablution)],
    );
    // Save Room Conditions Data
    await client.query(
      `INSERT INTO audit_data (audit_id, section_name, form_data) VALUES ($1, $2, $3)`,
      [auditId, "roomConditions", JSON.stringify(roomConditions)],
    );
    // Save General Infrastructure Data
    await client.query(
      `INSERT INTO audit_data (audit_id, section_name, form_data) VALUES ($1, $2, $3)`,
      [auditId, "general", JSON.stringify(general)],
    );

    // ====================================================================
    // 3. SMART TICKET AUTO-GENERATION LOGIC
    // ====================================================================

    // Check Ablution Facilities for faults
    const facilities = ["showers", "toilets", "sinks"];
    for (let facility of facilities) {
      const faultyCount = parseInt(ablution[facility].faulty) || 0;
      if (faultyCount > 0) {
        const desc = `AUTO-TICKET (Audit ${auditPeriod}): ${faultyCount} faulty ${facility} reported. Warden Comments: ${ablution.comments || "None"}`;
        await client.query(
          `INSERT INTO requests (student_id, category, room, description, urgency, status) 
                     VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            auditorId,
            "Plumbing",
            `${hostelName} - Shared Ablution`,
            desc,
            "High",
            "Pending",
          ],
        );
      }
    }

    // Check Room Conditions for faults
    if (roomConditions && roomConditions.length > 0) {
      for (let condition of roomConditions) {
        if (condition.issue && condition.rooms) {
          const desc = `AUTO-TICKET (Audit ${auditPeriod}): ${condition.issue} reported.`;
          await client.query(
            `INSERT INTO requests (student_id, category, room, description, urgency, status) 
                         VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              auditorId,
              "Structural",
              `${hostelName} Room(s): ${condition.rooms}`,
              desc,
              "Medium",
              "Pending",
            ],
          );
        }
      }
    }

    // Check General Infrastructure (e.g., Geyser or Lights)
    if (general.geyser === "Non-functional") {
      await client.query(
        `INSERT INTO requests (student_id, category, room, description, urgency, status) 
                 VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          auditorId,
          "Electrical",
          `${hostelName} - Main Geyser`,
          `AUTO-TICKET: Geyser reported non-functional during audit.`,
          "High",
          "Pending",
        ],
      );
    }

    await client.query("COMMIT"); // Save everything
    res
      .status(201)
      .json({ message: "Audit saved and tickets generated successfully!" });
  } catch (err) {
    await client.query("ROLLBACK"); // If anything fails, undo all database changes
    console.error("Transaction Error: ", err.message);
    res
      .status(500)
      .json({ error: "Failed to save audit and generate tickets" });
  } finally {
    client.release(); // Release connection back to the pool
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
