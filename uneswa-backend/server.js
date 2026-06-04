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

// Serve uploaded images statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// ==========================================
// AUTHENTICATION ROUTES (Simplified - Student & Admin only)
// ==========================================
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET =
  process.env.JWT_SECRET || "your-super-secret-jwt-key-change-this";

// Login endpoint
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Query from users table only
    const result = await pool.query(
      "SELECT id, name, email, password, role FROM users WHERE email = $1 AND role = $2",
      [email, role],
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or role" });
    }

    const user = result.rows[0];

    // TEMPORARY: For testing with plain text password 'password123'
    // In production, use bcrypt.compare
    const isValid = password === "password123";

    if (!isValid) {
      return res.status(401).json({ error: "Invalid password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "24h" },
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ error: "Login failed" });
  }
});

// ==========================================
// REGISTRATION ROUTE (Student only)
// ==========================================

app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: "All fields are required" });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters" });
    }

    // Check if email already exists
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email],
    );
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new student (role = 'student')
    const result = await pool.query(
      `INSERT INTO users (name, email, password, role) 
       VALUES ($1, $2, $3, $4) RETURNING id, name, email, role`,
      [name, email, hashedPassword, "student"],
    );

    res.status(201).json({
      success: true,
      message: "Registration successful! Please login.",
      user: result.rows[0],
    });
  } catch (err) {
    console.error("Registration error:", err.message);
    res.status(500).json({ error: "Server error during registration" });
  }
});
// Verify token endpoint
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

app.get("/api/user/profile", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      "SELECT id, name, email, role FROM users WHERE id = $1",
      [userId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

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

// 3. UPDATE request status (Used by Admin)
app.put("/api/requests/:id/status", authenticateToken, async (req, res) => {
  // Check if user is admin
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }

  try {
    const { id } = req.params;
    const { status } = req.body;

    const updateRequest = await pool.query(
      "UPDATE requests SET status = $1 WHERE id = $2 RETURNING *",
      [status, id],
    );

    if (updateRequest.rows.length === 0) {
      return res.status(404).json({ error: "Request not found" });
    }

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

// GET count of requests updated since student last viewed
app.get(
  "/api/requests/student/:studentId/updates",
  authenticateToken,
  async (req, res) => {
    try {
      const { studentId } = req.params;

      // Ensure the requesting user is the same student
      if (req.user.id !== parseInt(studentId) && req.user.role !== "admin") {
        return res.status(403).json({ error: "Access denied" });
      }

      // Get last viewed timestamp from request headers or use default (7 days ago)
      const lastViewed =
        req.headers["x-last-viewed"] ||
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      const result = await pool.query(
        `SELECT COUNT(*) FROM requests 
       WHERE student_id = $1 
       AND updated_at > $2
       AND status != 'Resolved'`, // Only count non-resolved requests
        [studentId, lastViewed],
      );

      res.json({ count: parseInt(result.rows[0].count) });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  },
);

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

    // Update the request
    await pool.query("UPDATE requests SET staff_id = $1 WHERE id = $2", [
      staff_id,
      id,
    ]);

    // Fetch the updated request with staff info
    const result = await pool.query(
      `
      SELECT r.*, u.name as student_name, s.name as staff_name, s.role as staff_role
      FROM requests r
      JOIN users u ON r.student_id = u.id
      LEFT JOIN staff s ON r.staff_id = s.id
      WHERE r.id = $1
    `,
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
// ANNOUNCEMENTS ROUTES
// ==========================================

// GET all active announcements (for students and admins)
app.get("/api/announcements", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, u.name as author_name 
       FROM announcements a
       LEFT JOIN users u ON a.author_id = u.id
       WHERE a.is_active = true
       ORDER BY a.created_at DESC`,
    );
    res.json(result.rows);
  } catch (err) {
    console.error("GET /api/announcements error:", err.message);
    res.status(500).json({ error: "Failed to fetch announcements" });
  }
});

// GET single announcement by ID
app.get("/api/announcements/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT a.*, u.name as author_name 
       FROM announcements a
       LEFT JOIN users u ON a.author_id = u.id
       WHERE a.id = $1 AND a.is_active = true`,
      [id],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Announcement not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("GET /api/announcements/:id error:", err.message);
    res.status(500).json({ error: "Failed to fetch announcement" });
  }
});

// POST create new announcement (Admin only)
app.post("/api/announcements", authenticateToken, async (req, res) => {
  // Check if user is admin
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }

  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required" });
    }

    const result = await pool.query(
      `INSERT INTO announcements (title, content, author_id) 
       VALUES ($1, $2, $3) RETURNING *`,
      [title, content, req.user.id],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("POST /api/announcements error:", err.message);
    res.status(500).json({ error: "Failed to create announcement" });
  }
});

// PUT update announcement (Admin only)
app.put("/api/announcements/:id", authenticateToken, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }

  try {
    const { id } = req.params;
    const { title, content, is_active } = req.body;

    const result = await pool.query(
      `UPDATE announcements 
       SET title = COALESCE($1, title),
           content = COALESCE($2, content),
           is_active = COALESCE($3, is_active),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4 RETURNING *`,
      [title, content, is_active, id],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Announcement not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("PUT /api/announcements/:id error:", err.message);
    res.status(500).json({ error: "Failed to update announcement" });
  }
});

// DELETE announcement (Admin only - soft delete)
app.delete("/api/announcements/:id", authenticateToken, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }

  try {
    const { id } = req.params;
    const result = await pool.query(
      `UPDATE announcements SET is_active = false, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1 AND is_active = true RETURNING *`,
      [id],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Announcement not found" });
    }
    res.json({ message: "Announcement deleted successfully" });
  } catch (err) {
    console.error("DELETE /api/announcements/:id error:", err.message);
    res.status(500).json({ error: "Failed to delete announcement" });
  }
});
// Student confirms resolution (sets status to "Closed" or adds a flag)
app.put("/api/requests/:id/confirm", authenticateToken, async (req, res) => {
  // Only the student who owns the request can confirm
  const { id } = req.params;
  const studentId = req.user.id;

  try {
    // First, verify ownership and current status
    const check = await pool.query(
      "SELECT student_id, status FROM requests WHERE id = $1",
      [id],
    );
    if (check.rows.length === 0)
      return res.status(404).json({ error: "Request not found" });
    if (check.rows[0].student_id !== studentId) {
      return res.status(403).json({ error: "Not your request" });
    }
    if (check.rows[0].status !== "Resolved") {
      return res.status(400).json({ error: "Request is not resolved yet" });
    }

    const result = await pool.query(
      "UPDATE requests SET status = 'Closed', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *",
      [id],
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to confirm resolution" });
  }
});
// ==========================================
// AUDIT ROUTE (With Smart Ticket Generation & Safe JSON)
// ==========================================

app.post("/api/audits", async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { auditorId, hostelName, auditPeriod, auditData } = req.body;

    // Safety fallback for auditor
    const safeAuditorId = auditorId || 1;

    // 1. Insert Main Audit Record
    const auditRes = await client.query(
      `INSERT INTO hostel_audits (auditor_id, hostel_name, audit_period, recommendations) 
             VALUES ($1, $2, $3, $4) RETURNING id`,
      [
        safeAuditorId,
        hostelName || "Unknown",
        auditPeriod || "N/A",
        auditData?.recommendations || "",
      ],
    );
    const auditId = auditRes.rows[0].id;

    // 2. Safely Insert Detailed Audit Data into JSONB rows
    // Using `|| {}` guarantees we NEVER send `undefined` or `null` to the database

    const ablutionPayload = JSON.stringify({
      facilities: auditData?.ablution || {},
      comments: auditData?.ablutionComments || "",
    });
    await client.query(
      `INSERT INTO audit_data (audit_id, section_name, form_data) VALUES ($1, $2, $3)`,
      [auditId, "ablution", ablutionPayload],
    );

    const roomPayload = JSON.stringify(auditData?.roomConditions || {});
    await client.query(
      `INSERT INTO audit_data (audit_id, section_name, form_data) VALUES ($1, $2, $3)`,
      [auditId, "roomConditions", roomPayload],
    );

    const bulbsPayload = JSON.stringify(auditData?.bulbs || {});
    await client.query(
      `INSERT INTO audit_data (audit_id, section_name, form_data) VALUES ($1, $2, $3)`,
      [auditId, "bulbs", bulbsPayload],
    );

    const generalData = {
      wardenName: auditData?.wardenName || "",
      hostelDoors: auditData?.hostelDoors || {},
      userCondition: auditData?.userCondition || "",
      dustBin: auditData?.dustBin || "",
      washLines: auditData?.washLines || "",
      corridorLights: auditData?.corridorLights || "",
      waterSystem: auditData?.waterSystem || "",
      wallPaint: auditData?.wallPaint || "",
      hostelHygiene: auditData?.hostelHygiene || "",
      overGrownVegetation: auditData?.overGrownVegetation || "",
      wardenCondition: auditData?.wardenCondition || "",
      signature: auditData?.signature || "",
      date: auditData?.date || "",
    };

    await client.query(
      `INSERT INTO audit_data (audit_id, section_name, form_data) VALUES ($1, $2, $3)`,
      [auditId, "general", JSON.stringify(generalData)],
    );

    // ====================================================================
    // 3. SMART TICKET AUTO-GENERATION LOGIC
    // ====================================================================

    // A. Check Ablution Facilities
    if (auditData?.ablution) {
      for (const [facility, details] of Object.entries(auditData.ablution)) {
        const faultyCount = parseInt(details.faulty) || 0;
        if (faultyCount > 0) {
          const desc = `AUTO-TICKET (Audit): ${faultyCount} faulty ${facility} reported.`;
          await client.query(
            `INSERT INTO requests (student_id, category, room, description, urgency, status) 
                         VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              safeAuditorId,
              "Plumbing",
              `${hostelName} - Shared Ablution`,
              desc,
              "High",
              "Pending",
            ],
          );
        }
      }
    }

    // B. Check Room Conditions
    if (auditData?.roomConditions) {
      for (const [issueKey, details] of Object.entries(
        auditData.roomConditions,
      )) {
        if (details.roomNumbers && details.roomNumbers.trim() !== "") {
          const issueName = issueKey
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (str) => str.toUpperCase());
          const desc = `AUTO-TICKET (Audit): ${issueName} reported.`;
          await client.query(
            `INSERT INTO requests (student_id, category, room, description, urgency, status) 
                         VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              safeAuditorId,
              "Structural",
              `${hostelName} Room(s): ${details.roomNumbers}`,
              desc,
              "Medium",
              "Pending",
            ],
          );
        }
      }
    }

    // C. Check Specific General Infrastructure
    if (
      auditData?.corridorLights &&
      auditData.corridorLights.toLowerCase().includes("faulty")
    ) {
      await client.query(
        `INSERT INTO requests (student_id, category, room, description, urgency, status) 
                 VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          safeAuditorId,
          "Electrical",
          `${hostelName} - Corridors`,
          `AUTO-TICKET: Corridor lights reported as faulty.`,
          "Medium",
          "Pending",
        ],
      );
    }

    await client.query("COMMIT");
    res.status(201).json({ message: "Audit saved successfully!" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Audit Transaction Error: ", err.message); // Will print exact issue now
    res
      .status(500)
      .json({ error: "Failed to save audit and generate tickets" });
  } finally {
    client.release();
  }
});

// ==========================================
// REQUEST MESSAGES & REOPEN
// ==========================================

// POST /api/requests/:id/messages – Add a message (student or admin)
app.post("/api/requests/:id/messages", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { message } = req.body;
  const userId = req.user.id;
  const userRole = req.user.role;

  if (!message || message.trim() === "") {
    return res.status(400).json({ error: "Message cannot be empty" });
  }

  try {
    // Verify the request exists and user has access (student only their own)
    const reqCheck = await pool.query(
      "SELECT student_id FROM requests WHERE id = $1",
      [id],
    );
    if (reqCheck.rows.length === 0) {
      return res.status(404).json({ error: "Request not found" });
    }
    if (userRole === "student" && reqCheck.rows[0].student_id !== userId) {
      return res.status(403).json({ error: "Not your request" });
    }

    const result = await pool.query(
      `INSERT INTO request_messages (request_id, user_id, message, is_from_student)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [id, userId, message, userRole === "student"],
    );

    // Also update the request's updated_at timestamp (optional)
    await pool.query(
      "UPDATE requests SET updated_at = CURRENT_TIMESTAMP WHERE id = $1",
      [id],
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to add message" });
  }
});

// GET /api/requests/:id/messages – Fetch all messages for a request
app.get("/api/requests/:id/messages", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;

  try {
    const reqCheck = await pool.query(
      "SELECT student_id FROM requests WHERE id = $1",
      [id],
    );
    if (reqCheck.rows.length === 0) {
      return res.status(404).json({ error: "Request not found" });
    }
    if (userRole === "student" && reqCheck.rows[0].student_id !== userId) {
      return res.status(403).json({ error: "Not your request" });
    }

    const messages = await pool.query(
      `SELECT m.*, u.name as user_name
       FROM request_messages m
       JOIN users u ON m.user_id = u.id
       WHERE m.request_id = $1
       ORDER BY m.created_at ASC`,
      [id],
    );
    res.json(messages.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// PUT /api/requests/:id/confirm – Student confirms resolution (closes ticket)
app.put("/api/requests/:id/confirm", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const studentId = req.user.id;

  try {
    // Check ownership and current status
    const check = await pool.query(
      "SELECT student_id, status FROM requests WHERE id = $1",
      [id],
    );
    if (check.rows.length === 0) {
      return res.status(404).json({ error: "Request not found" });
    }
    if (check.rows[0].student_id !== studentId) {
      return res.status(403).json({ error: "Not your request" });
    }
    if (check.rows[0].status !== "Resolved") {
      return res.status(400).json({ error: "Request is not resolved yet" });
    }

    const result = await pool.query(
      "UPDATE requests SET status = 'Closed', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *",
      [id],
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to confirm resolution" });
  }
});

// PUT /api/requests/:id/reopen – Admin reopens a closed request
app.put("/api/requests/:id/reopen", authenticateToken, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  const { id } = req.params;
  try {
    const result = await pool.query(
      "UPDATE requests SET status = 'In Progress', updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND status = 'Closed' RETURNING *",
      [id],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Request not found or not closed" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to reopen request" });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
