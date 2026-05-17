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
// Assign staff to a request
app.put("/api/requests/:id/assign", async (req, res) => {
  try {
    const { id } = req.params;
    const { staff_id } = req.body;

    const result = await pool.query(
      "UPDATE requests SET staff_id = $1 WHERE id = $2 RETURNING *",
      [staff_id, id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Request not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
// GET all requests (with staff name)
app.get("/api/requests", async (req, res) => {
  try {
    const allRequests = await pool.query(`
            SELECT r.*, u.name as student_name, s.name as staff_name, s.role as staff_role
            FROM requests r 
            JOIN users u ON r.student_id = u.id 
            LEFT JOIN staff s ON r.staff_id = s.id
            ORDER BY r.created_at DESC
        `);
    res.json(allRequests.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
// GET all active staff
app.get("/api/staff", async (req, res) => {
  try {
    const staff = await pool.query(
      "SELECT id, name, role FROM staff WHERE is_active = true ORDER BY name",
    );
    res.json(staff.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
// GET single request by ID (with staff info)
app.get("/api/requests/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT r.*, u.name as student_name, s.name as staff_name, s.role as staff_role
       FROM requests r
       JOIN users u ON r.student_id = u.id
       LEFT JOIN staff s ON r.staff_id = s.id
       WHERE r.id = $1`,
      [id],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Request not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// ==========================================
// REPORTING ROUTES
// ==========================================

// Helper function to get filtered requests
const getFilteredRequests = async (filters) => {
  let query = `
    SELECT r.*, u.name as student_name, s.name as staff_name, s.role as staff_role
    FROM requests r
    JOIN users u ON r.student_id = u.id
    LEFT JOIN staff s ON r.staff_id = s.id
    WHERE 1=1
  `;
  const values = [];
  let paramCount = 1;

  if (filters.status && filters.status !== "all") {
    query += ` AND r.status = $${paramCount}`;
    values.push(filters.status);
    paramCount++;
  }
  if (filters.category && filters.category !== "all") {
    query += ` AND r.category = $${paramCount}`;
    values.push(filters.category);
    paramCount++;
  }
  if (filters.startDate) {
    query += ` AND r.created_at >= $${paramCount}`;
    values.push(filters.startDate);
    paramCount++;
  }
  if (filters.endDate) {
    query += ` AND r.created_at <= $${paramCount}`;
    values.push(filters.endDate + " 23:59:59");
    paramCount++;
  }

  query += ` ORDER BY r.created_at DESC`;
  const result = await pool.query(query, values);
  return result.rows;
};

// Export to Excel
app.post("/api/reports/excel", async (req, res) => {
  const ExcelJS = require("exceljs");
  const filters = req.body;

  try {
    const data = await getFilteredRequests(filters);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Maintenance Requests");

    // Define columns
    worksheet.columns = [
      { header: "ID", key: "id", width: 10 },
      { header: "Student", key: "student_name", width: 20 },
      { header: "Room", key: "room", width: 15 },
      { header: "Category", key: "category", width: 15 },
      { header: "Description", key: "description", width: 40 },
      { header: "Urgency", key: "urgency", width: 12 },
      { header: "Status", key: "status", width: 15 },
      { header: "Assigned To", key: "staff_name", width: 20 },
      { header: "Date Reported", key: "created_at", width: 20 },
    ];

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF1e60a4" },
    };
    worksheet.getRow(1).font = { color: { argb: "FFFFFFFF" }, bold: true };

    // Add data rows
    data.forEach((row) => {
      worksheet.addRow({
        id: row.id,
        student_name: row.student_name,
        room: row.room,
        category: row.category,
        description: row.description,
        urgency: row.urgency,
        status: row.status,
        staff_name: row.staff_name || "Unassigned",
        created_at: new Date(row.created_at).toLocaleString(),
      });
    });

    // Set response headers
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=maintenance-report.xlsx",
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("Excel export error:", err);
    res.status(500).json({ error: "Failed to generate Excel report" });
  }
});

// Export to PDF
app.post("/api/reports/pdf", async (req, res) => {
  const PDFDocument = require("pdfkit");
  const filters = req.body;

  try {
    const data = await getFilteredRequests(filters);

    // Create PDF document
    const doc = new PDFDocument({
      margin: 50,
      size: "A4",
      layout: "landscape",
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=maintenance-report.pdf",
    );

    doc.pipe(res);

    // Header
    doc
      .fontSize(20)
      .font("Helvetica-Bold")
      .text("UNESWA Maintenance Report", { align: "center" });
    doc.moveDown();
    doc
      .fontSize(10)
      .font("Helvetica")
      .text(`Generated: ${new Date().toLocaleString()}`, { align: "center" });
    doc.moveDown(2);

    // Table headers
    const headers = [
      "ID",
      "Student",
      "Room",
      "Category",
      "Urgency",
      "Status",
      "Staff",
      "Date",
    ];
    const columnWidths = [40, 100, 70, 80, 70, 80, 100, 100];
    let startX = 50;
    let startY = doc.y;

    // Draw header row
    let currentX = startX;
    headers.forEach((header, i) => {
      doc.font("Helvetica-Bold").fontSize(9);
      doc.text(header, currentX, startY, {
        width: columnWidths[i],
        align: "left",
      });
      currentX += columnWidths[i];
    });

    // Draw line under header
    doc
      .moveTo(startX, startY + 15)
      .lineTo(startX + columnWidths.reduce((a, b) => a + b, 0), startY + 15)
      .stroke();

    let currentY = startY + 20;

    // Draw data rows
    data.forEach((row, rowIndex) => {
      if (currentY > 500) {
        doc.addPage();
        currentY = 50;
      }

      currentX = startX;
      const rowData = [
        row.id,
        row.student_name,
        row.room,
        row.category,
        row.urgency,
        row.status,
        row.staff_name || "Unassigned",
        new Date(row.created_at).toLocaleDateString(),
      ];

      rowData.forEach((value, i) => {
        doc.font("Helvetica").fontSize(8);
        doc.text(String(value), currentX, currentY, {
          width: columnWidths[i],
          align: "left",
        });
        currentX += columnWidths[i];
      });

      currentY += 18;
    });

    doc.end();
  } catch (err) {
    console.error("PDF export error:", err);
    res.status(500).json({ error: "Failed to generate PDF report" });
  }
});

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Secret key for JWT (store in .env in production)
const JWT_SECRET =
  process.env.JWT_SECRET || "your-super-secret-jwt-key-change-this";

// Login endpoint
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    let user = null;
    let userRole = role;
    let userId = null;
    let userName = null;

    // Check which table to query based on role
    if (role === "student" || role === "admin") {
      const result = await pool.query(
        "SELECT id, name, email, password, role FROM users WHERE email = $1 AND role = $2",
        [email, role],
      );
      if (result.rows.length > 0) {
        user = result.rows[0];
        userId = user.id;
        userName = user.name;
      }
    } else if (role === "warden") {
      const result = await pool.query(
        "SELECT id, name, email, password, hostel FROM wardens WHERE email = $1",
        [email],
      );
      if (result.rows.length > 0) {
        user = result.rows[0];
        userId = user.id;
        userName = user.name;
        userRole = "warden";
      }
    }

    if (!user) {
      return res.status(401).json({ error: "Invalid email or role" });
    }

    // Compare password (for demo, using simple comparison - in production use bcrypt.compare)
    // For production: const isValid = await bcrypt.compare(password, user.password);
    const isValid = password === "password123"; // TEMPORARY for testing

    if (!isValid) {
      return res.status(401).json({ error: "Invalid password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: userId,
        email: user.email,
        name: userName,
        role: userRole,
        hostel: user.hostel || null,
      },
      JWT_SECRET,
      { expiresIn: "24h" },
    );

    res.json({
      success: true,
      token,
      user: {
        id: userId,
        name: userName,
        email: user.email,
        role: userRole,
        hostel: user.hostel || null,
      },
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ error: "Login failed" });
  }
});

// Verify token endpoint (for checking if user is still logged in)
app.get("/api/auth/verify", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ valid: true, user: decoded });
  } catch (err) {
    res.status(401).json({ valid: false, error: "Invalid token" });
  }
});

// Middleware to protect routes
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};

// Example protected route
app.get("/api/protected", authenticateToken, (req, res) => {
  res.json({
    message: `Welcome ${req.user.name}! You have access.`,
    user: req.user,
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
