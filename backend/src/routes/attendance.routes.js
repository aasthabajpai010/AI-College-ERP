// ============================================================
// ATTENDANCE ROUTES
// ============================================================
// Maps HTTP paths to attendance controllers with auth and role checks.
//
// ----------------------------------------------------------------
// ROUTE ORDER MATTERS
// ----------------------------------------------------------------
// Express matches routes top-down. GET /defaulters MUST be defined
// BEFORE GET /:studentId — otherwise "defaulters" is captured as
// studentId and getStudentAttendance runs with studentId = "defaulters".
//
// When mounted at /api/attendance in server.js:
//   POST   /api/attendance
//   GET    /api/attendance/defaulters
//   GET    /api/attendance/:studentId
//   GET    /api/attendance/:studentId/percentage

const express = require("express");

const {
  markAttendance,
  getStudentAttendance,
  getAttendancePercentage,
  getDefaulterList,
} = require("../controllers/attendance.controller");

const { protect, authorizeRoles } = require("../middlewares/auth.middleware");

const router = express.Router();

// POST / — Mark attendance for one student on one date.
// RBAC: admin + faculty only — students must not mark or forge attendance records.
router.post("/", protect, authorizeRoles("admin", "faculty"), markAttendance);

// GET /defaulters — List students below 75% attendance (must be before /:studentId).
// RBAC: admin + faculty only — defaulter reports are for staff, not students.
router.get(
  "/defaulters",
  protect,
  authorizeRoles("admin", "faculty"),
  getDefaulterList
);

// GET /:studentId — Full attendance history for one student.
// RBAC: admin, faculty, and student — students need to view their own records;
// faculty/admin need access for advising and verification.
router.get(
  "/:studentId",
  protect,
  authorizeRoles("admin", "faculty", "student"),
  getStudentAttendance
);

// GET /:studentId/percentage — Attendance percentage for one student.
// RBAC: admin, faculty, and student — same read access as history; percentage
// is a summary students expect on their dashboard.
router.get(
  "/:studentId/percentage",
  protect,
  authorizeRoles("admin", "faculty", "student"),
  getAttendancePercentage
);

module.exports = router;
