const express = require("express");
const cors = require("cors");
const pool = require("./db");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors()); // Allows Next.js to communicate with Node
app.use(express.json()); // Parses incoming JSON requests

// ==========================================
// ROUTES
// ==========================================

// Test Route
app.get("/", (req, res) => {
  res.send("UNESWA Maintenance API is running...");
});

// 1. CREATE a new maintenance request (Used by Student Form)
app.post("/api/requests", async (req, res) => {
  try {
    const { student_id, category, room, description, urgency } = req.body;

    const newRequest = await pool.query(
      "INSERT INTO requests (student_id, category, room, description, urgency) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [student_id, category, room, description, urgency],
    );

    res.json(newRequest.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
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

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
