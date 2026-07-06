// ============================================================
// JWT TOKEN GENERATOR
// ============================================================
// Creates a signed JSON Web Token (JWT) after a user logs in.
// The frontend sends this token on later requests to prove identity.

const jwt = require("jsonwebtoken");

/**
 * generateToken — creates a signed JWT for an authenticated user.
 *
 * @param {string} userId - MongoDB _id of the user
 * @param {string} role   - User role: "admin", "faculty", or "student"
 * @returns {string} Signed JWT string
 */
const generateToken = (userId, role) => {
  // ----------------------------------------------------------------
  // WHY put id and role inside the JWT payload?
  // ----------------------------------------------------------------
  // The payload is data embedded inside the token.
  // - id:   tells protected routes WHO is making the request
  // - role: tells protected routes WHAT they are allowed to do
  //
  // The server can decode the token and read id + role without
  // querying MongoDB on every single request (faster API).
  // Trade-off: if role changes in DB, the old token still has the
  // old role until it expires — we accept that for performance.
  const payload = {
    id: userId,
    role: role,
  };

  // ----------------------------------------------------------------
  // WHY use process.env.JWT_SECRET instead of hardcoding?
  // ----------------------------------------------------------------
  // JWT_SECRET is the private key used to SIGN the token.
  // Anyone with this secret can forge valid tokens.
  // Keeping it in .env:
  // - keeps it out of source code and Git history
  // - lets dev/staging/production use different secrets
  //
  // Example .env:
  // JWT_SECRET=your_super_long_random_secret_here
  // JWT_EXPIRY=7d
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    // ----------------------------------------------------------------
    // WHY set an expiry (expiresIn)?
    // ----------------------------------------------------------------
    // A token without expiry would work forever if stolen.
    // expiresIn limits how long a stolen token remains valid.
    // Common values: "1h", "7d", "30d"
    // After expiry, the user must log in again to get a fresh token.
    expiresIn: process.env.JWT_EXPIRY,
  });

  return token;
};

module.exports = generateToken;