// ============================================================
// CENTRALIZED ERROR HANDLING MIDDLEWARE
// ============================================================
// Express recognizes this as an "error-handling middleware" because
// it takes FOUR parameters (err, req, res, next) instead of three.
// When any route calls next(error), Express skips all normal middleware
// and jumps straight here.

const errorHandler = (err, req, res, next) => {
  // Log the full error on the server console — helpful for debugging
  console.error(err.stack);

  // Some errors have a specific status code already set (e.g. from Mongoose validation),
  // otherwise default to 500 (generic server error)
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal server error",
  });
};

module.exports = errorHandler;