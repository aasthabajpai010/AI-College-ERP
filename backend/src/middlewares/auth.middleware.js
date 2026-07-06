// ============================================================
// AUTH MIDDLEWARE
// ============================================================
// Protects routes by verifying JWTs and enforcing role-based access.
// Used between the incoming request and the route handler (controller).

const jwt = require("jsonwebtoken");

/**
 * protect — verifies the JWT and attaches the decoded user to req.user.
 *
 * Must run BEFORE authorizeRoles() on any route that checks roles.
 * protect() is what creates req.user in the first place; authorizeRoles()
 * only reads req.user.role. If you reversed the order, authorizeRoles()
 * would see req.user as undefined and always deny access.
 *
 * @example
 * router.post("/mark", protect, authorizeRoles("faculty", "admin"), markAttendance);
 * // 1. protect()      — "Is this person logged in?" → sets req.user
 * // 2. authorizeRoles — "Does their role allow this action?"
 * // 3. markAttendance — actual business logic runs only if both pass
 */
const protect = (req, res, next) => {
  // Read the Authorization header sent by the client (e.g. from localStorage).
  const authHeader = req.headers.authorization;

  // Expected format: "Bearer <token>"
  // "Bearer" is a standard prefix meaning "here is a bearer token".
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    // 401 Unauthorized — the client did not prove who they are (no valid token).
    return res.status(401).json({
      success: false,
      message: "Not authorized, no token",
    });
  }

  // Strip "Bearer " (7 characters) to get the raw JWT string.
  const token = authHeader.slice(7);

  try {
    // jwt.verify() checks the signature and expiry using the same secret
    // that generateToken() used when signing. Returns the decoded payload
    // (id, role, iat, exp) if valid; throws if tampered or expired.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach payload so controllers can use req.user.id and req.user.role
    // without decoding the token again.
    req.user = decoded;

    next();
  } catch (error) {
    // 401 Unauthorized — token was present but invalid or expired.
    // Different from 403: we still don't know (or can't trust) who they are.
    return res.status(401).json({
      success: false,
      message: "Not authorized, token invalid or expired",
    });
  }
};

/**
 * authorizeRoles — returns middleware that allows only specific roles.
 *
 * This is how role-based access control (RBAC) works in Express:
 * - protect() answers: "Are you authenticated?"
 * - authorizeRoles(...) answers: "Is your role allowed on this route?"
 *
 * Same login, different permissions per role — e.g. only faculty and admin
 * can mark attendance; students might only read their own records.
 *
 * @param  {...string} roles - Allowed roles, e.g. "faculty", "admin"
 * @returns {Function} Express middleware (req, res, next) => void
 *
 * @example
 * // Only faculty and admin can POST /mark; students get 403.
 * router.post("/mark", protect, authorizeRoles("faculty", "admin"), markAttendance);
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    // req.user was set by protect() — includes role from the JWT payload.
    if (!req.user || !roles.includes(req.user.role)) {
      // 403 Forbidden — we know who they are (authenticated), but their role
      // is not allowed for this action. 401 would mean "not logged in";
      // 403 means "logged in, but you don't have permission here."
      return res.status(403).json({
        success: false,
        message: "Access denied, insufficient permissions",
      });
    }

    next();
  };
};

module.exports = { protect, authorizeRoles };
