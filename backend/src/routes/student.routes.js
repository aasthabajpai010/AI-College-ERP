// ============================================================
// STUDENT ROUTES
// ============================================================
// This file defines URL paths for student profile management.
// It maps HTTP methods + paths to controller functions.
// No business logic lives here — only routing and access control.
//
// This follows MVC: Routes → Controllers → Models
//
// ----------------------------------------------------------------
// HOW EXPRESS MIDDLEWARE CHAINING WORKS (read this first)
// ----------------------------------------------------------------
// When you write:
//   router.get("/", protect, authorizeRoles("admin"), getAllStudents)
//
// Express runs each function LEFT TO RIGHT, like a pipeline:
//
//   Request comes in
//        ↓
//   protect runs        → checks JWT, sets req.user, calls next()
//        ↓
//   authorizeRoles runs → reads req.user.role, calls next() or sends 403
//        ↓
//   getAllStudents runs → queries DB and sends the JSON response
//
// Each middleware receives (req, res, next).
// - Call next()     → "I'm done, pass control to the next function."
// - Send res.status → "Stop here, send this response to the client."
//
// ----------------------------------------------------------------
// WHAT DOES protect DO?
// ----------------------------------------------------------------
// protect reads the Authorization header (format: "Bearer <token>").
// It verifies the JWT using JWT_SECRET. If valid, it decodes the payload
// and attaches it to req.user (so req.user.id and req.user.role exist).
// If the token is missing or invalid, it returns 401 and the chain stops.
//
// ----------------------------------------------------------------
// WHAT DOES authorizeRoles DO?
// ----------------------------------------------------------------
// authorizeRoles("admin", "faculty") RETURNS a middleware function.
// That returned function checks whether req.user.role is one of the
// roles you listed. If yes → next(). If no → 403 Forbidden.
//
// ----------------------------------------------------------------
// WHY MUST protect RUN BEFORE authorizeRoles?
// ----------------------------------------------------------------
// authorizeRoles reads req.user.role. req.user is ONLY set by protect.
// If you reversed the order:
//   router.get("/", authorizeRoles("admin"), protect, handler)  // WRONG
// authorizeRoles would run first, req.user would be undefined,
// and every request would fail with "insufficient permissions" — even
// for valid admins with a good token.
//
// Rule: authenticate first (protect), authorize second (authorizeRoles),
//       then run the controller (createStudent, getAllStudents, etc.).
//
// ----------------------------------------------------------------
// REST API — WHAT EACH HTTP METHOD MEANS
// ----------------------------------------------------------------
// GET    → Read/fetch data. Safe, should not change anything on the server.
// POST   → Create a new resource (e.g. a new student profile).
// PUT    → Update/replace an existing resource (full or partial update).
// DELETE → Remove a resource permanently from the database.
//
// When this router is mounted at "/api/students" in server.js, paths like
// router.post("/") become POST /api/students in the full URL.

const express = require("express");

const {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
} = require("../controllers/student.controller");

const { protect, authorizeRoles } = require("../middlewares/auth.middleware");

// router is a mini-app that handles only student-related URLs.
// We export it and mount it in server.js: app.use("/api/students", studentRoutes)
const router = express.Router();

// ============================================================
// POST /  — Create a new student profile
// Full URL when mounted: POST /api/students
// ============================================================
//
// ROLE: admin only
// WHY only admin?
// - Creating a student profile links a User account to roll number,
//   department, semester, etc. That is a sensitive administrative action.
// - Students should not create their own academic records (risk of fake
//   roll numbers or wrong department). Faculty manage classes, not accounts.
// - Only admins register new students in a real college ERP.
//
// Middleware order: protect → authorizeRoles("admin") → createStudent
// 1. protect: prove the caller is logged in (valid JWT → req.user)
// 2. authorizeRoles("admin"): prove req.user.role is exactly "admin"
// 3. createStudent: run the controller if both passed
router.post("/", protect, authorizeRoles("admin"), createStudent);

// ============================================================
// GET /  — List all students
// Full URL when mounted: GET /api/students
// ============================================================
//
// ROLE: admin and faculty
// WHY admin + faculty, but NOT student?
// - Admins need the full list for reports, exports, and management.
// - Faculty need to see students in their courses/departments for attendance
//   and grading.
// - Students should NOT see every other student's data (privacy). A student
//   viewing one profile is handled by GET /:id below, not the full list.
//
// Middleware order: protect → authorizeRoles("admin", "faculty") → getAllStudents
router.get("/", protect, authorizeRoles("admin", "faculty"), getAllStudents);

// ============================================================
// GET /:id  — Get one student by MongoDB _id
// Full URL when mounted: GET /api/students/:id
// ============================================================
//
// ROLE: admin, faculty, and student
// WHY are students allowed here but not on GET /?
// - A student may view their own profile (or a profile they are allowed to see).
// - Faculty need one student's details for advising, marks, attendance.
// - Admin needs full access. Listing everyone (GET /) is broader than
//   viewing a single record; students get read access to individual profiles
//   without exposing the entire student database.
//
// Note: In production you might add extra checks in the controller so a
// student can only fetch their own :id — that is beyond this routes file.
//
// Middleware order: protect → authorizeRoles("admin", "faculty", "student") → getStudentById
router.get(
  "/:id",
  protect,
  authorizeRoles("admin", "faculty", "student"),
  getStudentById
);

// ============================================================
// PUT /:id  — Update an existing student profile
// Full URL when mounted: PUT /api/students/:id
// ============================================================
//
// ROLE: admin only
// WHY only admin?
// - Updates can change department, semester, section — official academic
//   records that should not be self-edited by students (e.g. bumping semester
//   or switching department without approval).
// - Faculty typically don't change core enrollment data; admins do during
//   registration or correction windows.
//
// Middleware order: protect → authorizeRoles("admin") → updateStudent
router.put("/:id", protect, authorizeRoles("admin"), updateStudent);

// ============================================================
// DELETE /:id  — Remove a student profile
// Full URL when mounted: DELETE /api/students/:id
// ============================================================
//
// ROLE: admin only
// WHY only admin?
// - Deleting a profile is destructive and permanent (or hard to undo).
// - Only administrators should remove records (dropout, data cleanup, errors).
// - Students must never delete profiles; faculty should not delete enrollment
//   records without admin oversight.
//
// Middleware order: protect → authorizeRoles("admin") → deleteStudent
router.delete("/:id", protect, authorizeRoles("admin"), deleteStudent);

// Export the router so server.js can mount it:
//   const studentRoutes = require("./src/routes/student.routes");
//   app.use("/api/students", studentRoutes);
module.exports = router;
