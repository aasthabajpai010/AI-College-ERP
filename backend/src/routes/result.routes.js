// ============================================================
// RESULT ROUTES
// ============================================================
// Maps result-related URLs to controller functions.
// RBAC: Admin/Faculty can add marks. Admin/Faculty/Student can view
// (frontend or business logic should restrict Student to their own data).

const express = require("express");
const {
  addResult,
  getStudentResults,
  getCGPA,
} = require("../controllers/result.controller");
const { protect, authorizeRoles } = require("../middlewares/auth.middleware");

const router = express.Router();

// POST / — add marks for a student (only Admin/Faculty can enter marks)
router.post("/", protect, authorizeRoles("admin", "faculty"), addResult);

// GET /:studentId/cgpa — calculate CGPA (placed BEFORE /:studentId route
// so Express doesn't treat "cgpa" as a studentId value)
router.get(
  "/:studentId/cgpa",
  protect,
  authorizeRoles("admin", "faculty", "student"),
  getCGPA
);

// GET /:studentId — get all results for a student
router.get(
  "/:studentId",
  protect,
  authorizeRoles("admin", "faculty", "student"),
  getStudentResults
);

module.exports = router;