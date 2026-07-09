// ============================================================
// DASHBOARD ROUTES
// ============================================================
// Maps dashboard summary URLs to controller functions.
// These are READ-ONLY reporting endpoints — no create/update/delete
// here, so there's no POST/PUT/DELETE in this file at all.

const express = require("express");
const {
  getAdminDashboard,
  getStudentDashboard,
} = require("../controllers/dashboard.controller");
const { protect, authorizeRoles } = require("../middlewares/auth.middleware");

const router = express.Router();

// GET /admin — full college-wide summary (student counts, department
// breakdown, average attendance, grade distribution).
// Only Admin and Faculty should see college-wide numbers — a Student
// has no business seeing everyone else's aggregated data.
router.get("/admin", protect, authorizeRoles("admin", "faculty"), getAdminDashboard);

// GET /student/:studentId — one student's own summary (their attendance %,
// their CGPA). Admin and Faculty can also view this (e.g. Faculty checking
// on a specific student), and a Student can view their own via this same route.
router.get(
  "/student/:studentId",
  protect,
  authorizeRoles("admin", "faculty", "student"),
  getStudentDashboard
);

module.exports = router;