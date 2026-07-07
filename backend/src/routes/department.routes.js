// ============================================================
// DEPARTMENT ROUTES
// ============================================================
// This file defines URL paths for department management.
// It maps HTTP methods + paths to controller functions.
// No business logic lives here — only routing and access control.
//
// This follows MVC: Routes → Controllers → Models
//
// ----------------------------------------------------------------
// HOW EXPRESS MIDDLEWARE CHAINING WORKS (read this first)
// ----------------------------------------------------------------
// When you write:
//   router.get("/", protect, authorizeRoles("admin", "faculty", "student"), getAllDepartments)
//
// Express runs each function LEFT TO RIGHT, like a pipeline:
//
//   Request comes in
//        ↓
//   protect runs           → checks JWT, sets req.user, calls next()
//        ↓
//   authorizeRoles runs    → reads req.user.role, calls next() or sends 403
//        ↓
//   getAllDepartments runs → queries DB and sends the JSON response
//
// Each middleware receives (req, res, next).
// - Call next()     → "I'm done, pass control to the next function."
// - Send res.status → "Stop here, send this response to the client."
//
// ----------------------------------------------------------------
// WHAT DOES protect DO? (runs on EVERY route in this file)
// ----------------------------------------------------------------
// protect reads the Authorization header from the incoming request.
// Expected format: "Bearer <your-jwt-token>"
//
// It verifies the JWT using JWT_SECRET (from your .env file).
// If the token is valid:
//   - It decodes the payload (usually contains user id, role, etc.)
//   - It attaches that data to req.user
//   - So later code can use req.user.id and req.user.role
//   - It calls next() so the next middleware/controller can run
//
// If the token is missing, expired, or tampered with:
//   - protect sends 401 Unauthorized
//   - The chain STOPS — authorizeRoles and the controller never run
//
// ----------------------------------------------------------------
// WHAT DOES authorizeRoles(...) DO?
// ----------------------------------------------------------------
// authorizeRoles("admin", "faculty", "student") is a FACTORY function.
// It does NOT run immediately when you define the route.
// Instead, it RETURNS a new middleware function that Express will call later.
//
// When that returned middleware runs:
//   1. It looks at req.user.role (set by protect in the previous step)
//   2. It checks if req.user.role is IN the list you passed:
//        authorizeRoles("admin", "faculty", "student")
//        → allowed roles: "admin" OR "faculty" OR "student"
//   3. If the user's role matches ANY role in the list → next() (allow)
//   4. If the user's role is NOT in the list → 403 Forbidden (deny)
//
// You can pass one role or many:
//   authorizeRoles("admin")                    → only admins pass
//   authorizeRoles("admin", "faculty")         → admins OR faculty pass
//   authorizeRoles("admin", "faculty", "student") → all three pass
//
// ----------------------------------------------------------------
// WHY MUST protect RUN BEFORE authorizeRoles?
// ----------------------------------------------------------------
// authorizeRoles reads req.user.role. req.user is ONLY set by protect.
// If you reversed the order:
//   router.get("/", authorizeRoles("admin"), protect, handler)  // WRONG
// authorizeRoles would run first, req.user would be undefined,
// and every request would fail — even for valid admins.
//
// Rule: authenticate first (protect), authorize second (authorizeRoles),
//       then run the controller (createDepartment, getAllDepartments, etc.).
//
// ----------------------------------------------------------------
// WHAT IS req.params.id IN PUT /:id AND DELETE /:id?
// ----------------------------------------------------------------
// The colon in "/:id" tells Express: "capture this part of the URL
// as a named parameter called id."
//
// Example: if this router is mounted at "/api/departments" in server.js,
// then PUT /api/departments/507f1f77bcf86cd799439011
// maps to router.put("/:id", ...) and Express sets:
//   req.params.id = "507f1f77bcf86cd799439011"
//
// The controller (updateDepartment / deleteDepartment) reads req.params.id
// to know WHICH department document to update or delete in MongoDB.
//
// ----------------------------------------------------------------
// REST API — WHAT EACH HTTP METHOD MEANS HERE
// ----------------------------------------------------------------
// GET    → Read/fetch department list (safe, does not change data)
// POST   → Create a new department record
// PUT    → Update an existing department (identified by :id)
// DELETE → Remove a department (identified by :id)
//
// When this router is mounted at "/api/departments" in server.js, paths like
// router.post("/") become POST /api/departments in the full URL.

const express = require("express");

// Import controller functions that contain the actual business logic
// (talking to the database, validating input, sending JSON responses).
const {
  createDepartment,
  getAllDepartments,
  updateDepartment,
  deleteDepartment,
} = require("../controllers/department.controller");

// Import authentication and authorization middleware.
// protect      → verifies JWT and sets req.user
// authorizeRoles → checks whether req.user.role is allowed for this route
const { protect, authorizeRoles } = require("../middlewares/auth.middleware");

// router is a mini-app that handles only department-related URLs.
// We export it and mount it in server.js:
//   app.use("/api/departments", departmentRoutes)
const router = express.Router();

// ============================================================
// POST /  — Create a new department
// Full URL when mounted: POST /api/departments
// ============================================================
//
// ROLE: admin only
//
// WHY admin only for POST (create)?
// - Creating a department adds official organizational data (e.g. "Computer
//   Science", "Mechanical Engineering") to the system.
// - Only administrators should define which departments exist in the college.
// - If students or faculty could create departments, anyone could add fake or
//   duplicate entries and break registration forms, reports, and student records.
//
// WHAT protect DOES ON THIS ROUTE:
// - Ensures the caller sent a valid JWT in the Authorization header.
// - Sets req.user so we know WHO is trying to create a department.
// - Without a valid token → 401, createDepartment never runs.
//
// WHAT authorizeRoles("admin") DOES ON THIS ROUTE:
// - After protect succeeds, checks req.user.role === "admin".
// - Faculty and students get 403 Forbidden even with a valid login token.
// - Only admins reach createDepartment.
//
// Middleware order: protect → authorizeRoles("admin") → createDepartment
router.post("/", protect, authorizeRoles("admin"), createDepartment);

// ============================================================
// GET /  — List all departments
// Full URL when mounted: GET /api/departments
// ============================================================
//
// ROLE: admin, faculty, AND student (all three)
//
// WHY are all three roles allowed on GET but not on POST/PUT/DELETE?
// - Everyone needs to SEE the list of departments — it is reference data, not
//   secret. Examples:
//     • Student registration: pick your department from a dropdown
//     • Faculty dashboards: filter students or courses by department
//     • Admin screens: manage departments alongside other modules
// - Reading the list does not change anything in the database (GET is safe).
// - Creating or changing departments (POST/PUT/DELETE) is restricted to admin
//   because those actions alter official records and affect the whole system.
//
// WHAT protect DOES ON THIS ROUTE:
// - Still requires login — anonymous users cannot fetch departments.
// - Verifies JWT and sets req.user (id, role, etc.) for the logged-in user.
// - Invalid/missing token → 401 before getAllDepartments runs.
//
// WHAT authorizeRoles("admin", "faculty", "student") DOES ON THIS ROUTE:
// - Builds an allowed list: ["admin", "faculty", "student"].
// - If req.user.role is ANY of those three → next(), controller runs.
// - Any other role (if you add more roles later) → 403 Forbidden.
//
// Middleware order: protect → authorizeRoles("admin", "faculty", "student") → getAllDepartments
router.get(
  "/",
  protect,
  authorizeRoles("admin", "faculty", "student"),
  getAllDepartments
);

// ============================================================
// PUT /:id  — Update an existing department
// Full URL when mounted: PUT /api/departments/:id
// Example: PUT /api/departments/507f1f77bcf86cd799439011
// ============================================================
//
// ROLE: admin only
//
// WHAT IS req.params.id?
// - ":id" in the path is a route parameter (placeholder for the department's
//   MongoDB _id in the URL).
// - Request: PUT /api/departments/abc123 → req.params.id = "abc123"
// - updateDepartment uses req.params.id to find and update that one document.
//
// WHY admin only for PUT (update)?
// - Renaming or editing a department (e.g. fixing spelling, merging codes)
//   affects every student and course linked to that department.
// - Students and faculty should use departments as read-only reference data;
//   only admins maintain master records.
//
// WHAT protect DOES ON THIS ROUTE:
// - Same as every other route: verify JWT, populate req.user, or return 401.
//
// WHAT authorizeRoles("admin") DOES ON THIS ROUTE:
// - Only users with role "admin" may update; others get 403 even if logged in.
//
// Middleware order: protect → authorizeRoles("admin") → updateDepartment
router.put("/:id", protect, authorizeRoles("admin"), updateDepartment);

// ============================================================
// DELETE /:id  — Remove a department
// Full URL when mounted: DELETE /api/departments/:id
// Example: DELETE /api/departments/507f1f77bcf86cd799439011
// ============================================================
//
// ROLE: admin only
//
// WHAT IS req.params.id?
// - Same as PUT: the :id segment in the URL identifies which department to delete.
// - deleteDepartment reads req.params.id and removes that record from the DB.
//
// WHY admin only for DELETE?
// - Deleting a department is destructive — students/courses may reference it.
// - Only administrators should remove official department records after review.
// - Students and faculty must never delete organizational master data.
//
// WHAT protect DOES ON THIS ROUTE:
// - Confirms the request comes from a logged-in user with a valid JWT.
// - Sets req.user before any role or delete logic runs.
//
// WHAT authorizeRoles("admin") DOES ON THIS ROUTE:
// - Ensures only admins can delete; faculty/students receive 403 Forbidden.
//
// Middleware order: protect → authorizeRoles("admin") → deleteDepartment
router.delete("/:id", protect, authorizeRoles("admin"), deleteDepartment);

// Export the router so server.js can mount it:
//   const departmentRoutes = require("./src/routes/department.routes");
//   app.use("/api/departments", departmentRoutes);
module.exports = router;
