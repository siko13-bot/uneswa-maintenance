<div align="center">

# Hostel Maintenance Management System

### Full-Stack Residence Maintenance Management System for University Hostels

A web-based platform that streamlines hostel maintenance reporting, digital inspections, staff assignment, announcements, and maintenance tracking for students and administrators.

![Next.js](https://img.shields.io/badge/Next.js-App_Router-black?style=for-the-badge&logo=next.js)
![Node.js](https://img.shields.io/badge/Node.js-Express-green?style=for-the-badge&logo=node.js)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue?style=for-the-badge&logo=postgresql)
![JWT](https://img.shields.io/badge/JWT-Authentication-orange?style=for-the-badge)
![License](https://img.shields.io/badge/License-Educational-purple?style=for-the-badge)

</div>

---

# Hostel Maintenance Management System

A full-stack web application for managing hostel maintenance requests, audits, staff assignments, and announcements.

Built for university hostels, the system streamlines reporting of issues by students and provides a digital version of the warden's paper audit form with automatic ticket generation.

---

# 📸 Application Screenshots

## Login & Registration

<p align="center">
  <img src="screenshots/registration.png" width="48%" alt="Registration Page" />
  <img src="screenshots/login.png" width="48%" alt="Login Page" />
</p>

## Student Ticket Request

![Student Dashboard](screenshots/student-ticket.png)

---

## Student Dashboard

![Student Dashboard](screenshots/student-dashboard.png)

---

## Admin Request Management

![Admin Dashboard](screenshots/admin-dashboard.png)

---

# 📑 Table of Contents

- Features
- Tech Stack
- Prerequisites
- Getting Started
- Backend Setup
- Frontend Setup
- Environment Variables
- Database Setup
- Running the Application
- API Endpoints
- Project Structure
- Key Decisions
- Future Enhancements
- License

---

# ✨ Features

- **Role-based Authentication (JWT)** – Student and Admin roles. Admins can manage requests, staff, audits, and announcements.

- **Maintenance Request Lifecycle** – Students submit requests with optional images while admins update request status and assign maintenance staff.

- **Staff Management** – Add, edit, remove, and assign maintenance personnel.

- **Hostel Audit Module** – A digital replica of the hostel inspection form that automatically generates maintenance requests whenever faults are discovered.

- **Announcements** – Administrators can broadcast announcements to all students.

- **Image Uploads** – Students can attach photos when reporting maintenance issues.

- **Status Update Badge** – Notification bell displays the number of maintenance requests updated since the student last viewed them.

- **Reporting** – Export filtered maintenance records to **Excel** and **PDF**.

- **Toast Notifications** – User-friendly notifications using `react-hot-toast`.

---

# 🛠 Tech Stack

| Layer          | Technology                        |
| -------------- | --------------------------------- |
| Frontend       | Next.js (App Router), CSS Modules |
| Backend        | Node.js, Express.js               |
| Database       | PostgreSQL                        |
| Authentication | JWT (jsonwebtoken), bcryptjs      |
| File Upload    | Multer                            |
| Reporting      | ExcelJS, PDFKit, File Saver       |
| Charts         | Recharts                          |

---

# 📋 Prerequisites

Before running this project, ensure the following software is installed on your computer.

- Node.js (v16 or later)
- npm or Yarn
- PostgreSQL (v12 or later)
- Git

---

# 🚀 Getting Started

## 1. Clone the Repository

```bash
git clone https://github.com/your-username/hostel-maintenance.git

cd hostel-maintenance
```

> Replace **your-username** with your GitHub username.

---

## 2. Project Structure

Your project consists of two main applications:

- **Frontend** → Next.js
- **Backend** → Express.js

The backend communicates with PostgreSQL while the frontend communicates with the backend through REST APIs.

# ⚙️ Backend Setup (Express API)

Navigate to the backend folder and install the required dependencies.

```bash
cd uneswa-backend

npm install
```

---

## Create a `.env` File

Inside the **uneswa-backend** folder, create a file named:

```text
.env
```

Add the following environment variables:

```ini
PORT=5000

DATABASE_URL=postgresql://username:password@localhost:5432/hostel_maintenance

JWT_SECRET=your_jwt_secret_key
```

> Replace the database username, password, and database name with your own PostgreSQL credentials.

---

## Database Setup

Create a PostgreSQL database named:

```text
hostel_maintenance
```

Import the database schema:

```bash
psql -U your_username -d hostel_maintenance -f schema.sql
```

If you do not have a `schema.sql` file, use the SQL statements provided in the **Database Schema** section below.

---

## Start the Backend Server

```bash
npm start
```

The backend API will be available at

```text
http://localhost:5000
```

---

# Frontend Setup (Next.js)

Open a **new terminal**.

Navigate to the frontend project.

```bash
cd src

npm install
```

---

## Create `.env.local`

Create a file named

```text
.env.local
```

Add the following:

```ini
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## Start the Frontend

```bash
npm run dev
```

The application will now be running at

```text
http://localhost:3000
```

---

# 🔑 Environment Variables

## Backend (`uneswa-backend/.env`)

| Variable     | Description                        | Example                                                      |
| ------------ | ---------------------------------- | ------------------------------------------------------------ |
| PORT         | Express server port                | 5000                                                         |
| DATABASE_URL | PostgreSQL connection string       | postgresql://user:password@localhost:5432/hostel_maintenance |
| JWT_SECRET   | Secret key used to sign JWT tokens | your_secret_key                                              |

---

## Frontend (`src/.env.local`)

| Variable            | Description                 | Example                   |
| ------------------- | --------------------------- | ------------------------- |
| NEXT_PUBLIC_API_URL | Base URL of the backend API | http://localhost:5000/api |

---

# 🗄 Database Schema

Run the following SQL to create the required tables.

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    role VARCHAR NOT NULL CHECK (role IN ('student','admin')),
    email VARCHAR UNIQUE NOT NULL,
    password VARCHAR NOT NULL
);

CREATE TABLE staff (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    role VARCHAR NOT NULL,
    contact VARCHAR NOT NULL,
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE requests (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES users(id),
    category VARCHAR NOT NULL,
    room VARCHAR NOT NULL,
    description TEXT NOT NULL,
    urgency VARCHAR NOT NULL CHECK (urgency IN ('low','medium','high')),
    status VARCHAR DEFAULT 'pending'
        CHECK (status IN ('pending','in_progress','resolved')),
    image_url VARCHAR,
    staff_id INTEGER REFERENCES staff(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_requests_updated_at
BEFORE UPDATE ON requests
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE announcements (
    id SERIAL PRIMARY KEY,
    title VARCHAR NOT NULL,
    content TEXT NOT NULL,
    author_id INTEGER NOT NULL REFERENCES users(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE hostel_audits (
    id SERIAL PRIMARY KEY,
    auditor_id INTEGER NOT NULL REFERENCES users(id),
    hostel_name VARCHAR NOT NULL,
    audit_period VARCHAR NOT NULL,
    recommendations TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE audit_data (
    id SERIAL PRIMARY KEY,
    audit_id INTEGER NOT NULL REFERENCES hostel_audits(id) ON DELETE CASCADE,
    section_name VARCHAR NOT NULL,
    form_data JSONB NOT NULL
);
```

---

# Running the Application

1. Start PostgreSQL.

2. Start the backend server.

```bash
cd uneswa-backend

npm start
```

3. Open another terminal and start the frontend.

```bash
cd src

npm run dev
```

4. Open your browser.

```text
http://localhost:3000
```

5. Login using one of the demo accounts.

### Student

```text
Student ID:
20220001

Password:
password123
```

### Admin / Warden

```text
Email:
mnguni@admin.uneswa.sz

Password:
password123
```

---

# 🌐 API Endpoints

| Method | Endpoint                    | Description                  | Access    |
| ------ | --------------------------- | ---------------------------- | --------- |
| POST   | `/api/login`                | Login and receive JWT        | Public    |
| POST   | `/api/requests`             | Submit maintenance request   | Student   |
| GET    | `/api/requests`             | Get all maintenance requests | Admin     |
| GET    | `/api/requests/student/:id` | Student maintenance history  | Student   |
| PUT    | `/api/requests/:id/status`  | Update request status        | Admin     |
| PUT    | `/api/requests/:id/assign`  | Assign maintenance staff     | Admin     |
| GET    | `/api/staff`                | Retrieve staff members       | Admin     |
| POST   | `/api/audits`               | Submit hostel audit          | Admin     |
| GET    | `/api/announcements`        | View announcements           | All Users |
| POST   | `/api/announcements`        | Create announcement          | Admin     |
| DELETE | `/api/announcements/:id`    | Delete announcement          | Admin     |
| POST   | `/api/reports/excel`        | Export Excel report          | Admin     |
| POST   | `/api/reports/pdf`          | Export PDF report            | Admin     |

All protected routes require:

```http
Authorization: Bearer <JWT_TOKEN>
```

---

# 📂 Project Structure

```text
hostel-maintenance/
│
├── README.md
│
├── uneswa-backend/                  # Express.js Backend
│   ├── server.js                    # Application entry point
│   ├── db.js                        # PostgreSQL connection
│   ├── middleware/                  # Authentication middleware
│   ├── routes/                      # API routes
│   ├── uploads/                     # Uploaded maintenance images
│   ├── package.json
│   └── .env
│
├── src/                             # Next.js Frontend
│   ├── app/
│   │   ├── login/
│   │   ├── register/
│   │   ├── admin/
│   │   │   ├── page.js
│   │   │   ├── requests/
│   │   │   ├── audits/
│   │   │   ├── staff/
│   │   │   └── announcements/
│   │   │
│   │   └── student/
│   │       ├── page.js
│   │       ├── report/
│   │       ├── requests/
│   │       └── announcements/
│   │
│   ├── components/
│   ├── styles/
│   ├── package.json
│   └── .env.local
│
├── screenshots/
│   ├── login.png
│   ├── student-dashboard.png
│   └── admin-dashboard.png
│
└── schema.sql
```

---

# System Workflow

The application follows the workflow below.

```text
Student
    │
    ▼
Submit Maintenance Request
    │
    ▼
Express REST API
    │
    ▼
PostgreSQL Database
    │
    ▼
Admin Dashboard
    │
    ▼
Assign Staff
    │
    ▼
Maintenance Staff
    │
    ▼
Status Updated
    │
    ▼
Student Receives Update
```

---

# 🎯 Key Design Decisions

### Two User Roles

The system provides two user roles:

- Student
- Admin (Warden)

The administrator is responsible for managing maintenance requests, hostel audits, staff assignments, and announcements.

---

### Hostel Audit Automation

One of the core features of the system is the Hostel Audit Module.

Whenever faults are identified during an inspection, the application automatically creates maintenance requests without requiring manual reporting.

This minimizes paperwork and ensures maintenance issues are tracked immediately.

---

### Maintenance Tracking

Students can monitor every maintenance request from submission until completion.

Each request includes:

- Request number
- Category
- Description
- Priority
- Assigned staff member
- Current status
- Date submitted
- Uploaded image (optional)

---

### Notifications

Instead of implementing a dedicated notification system, the application provides a notification badge in the navigation bar.

Students can instantly see whenever one or more of their requests have changed status.

---

### Reporting

Administrators can generate reports and export filtered maintenance records as:

- Microsoft Excel
- PDF

These reports assist with hostel maintenance planning and record keeping.

---

# 🚀 Future Enhancements

The following improvements are planned for future versions.

- Password reset via email
- Email notifications
- SMS notifications
- Real-time updates using WebSockets
- Mobile application
- Maintenance staff portal
- Maintenance history analytics
- Hostel occupancy management
- Docker deployment
- Automated testing
- CI/CD pipeline
- Role expansion (Maintenance Supervisor, Hostel Manager)

---

# 🧪 Testing

The application has been tested for the following functionality.

✅ User Registration

✅ User Login

✅ JWT Authentication

✅ Student Dashboard

✅ Admin Dashboard

✅ Hostel Audit Submission

✅ Automatic Ticket Generation

✅ Maintenance Request Submission

✅ Staff Assignment

✅ Image Upload

✅ Status Updates

✅ Announcement Management

✅ Excel Report Generation

✅ PDF Report Generation

---

# Technologies Used

Frontend

- Next.js
- React
- CSS Modules

Backend

- Node.js
- Express.js

Database

- PostgreSQL

Authentication

- JWT
- bcryptjs

Additional Libraries

- Multer
- ExcelJS
- PDFKit
- Recharts
- React Hot Toast

---

# Authors

**Sikolethu Mkhabela**
**Seluleko Nkambule**

Final Year Computer Science Students

University of Eswatini

---

# 📄 License

This project was developed for educational purposes as part of a Final Year Computer Science Project at the University of Eswatini.

You are welcome to explore the source code for learning purposes.

---

# 🤝 Acknowledgements

Special thanks to:

- University of Eswatini
- Project Supervisor
- Faculty of Warden
- Everyone who contributed feedback during development

---

# ⭐ Support

If you found this project useful or interesting, consider giving the repository a **Star ⭐** on GitHub.

---

<div align="center">

### Thank you for visiting this repository!

Made with ❤️ using **Next.js**, **Express.js**, and **PostgreSQL**

</div>
