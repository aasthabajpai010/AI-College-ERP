// ============================================================
// AUTH ROUTES
// ============================================================
// This file defines URL paths for authentication.
// It only maps routes to controller functions — no business logic here.
// This follows MVC: Routes → Controllers → Models/Services

const express = require("express");

// Import controller functions that handle register and login logic
const { registerUser, loginUser } = require("../controllers/auth.controller");

// Create a dedicated router for auth-related endpoints
// A router groups related routes in one place (cleaner than adding all routes in server.js)
const router = express.Router();

// POST /register — create a new user account
// When mounted at /api/auth, full URL becomes: POST /api/auth/register
router.post("/register", registerUser);

// POST /login — authenticate an existing user and return a token
// When mounted at /api/auth, full URL becomes: POST /api/auth/login
router.post("/login", loginUser);

// Export router so it can be mounted in the main app (e.g. app.use("/api/auth", authRoutes))
module.exports = router;
