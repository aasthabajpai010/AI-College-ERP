// ============================================================
// AUTH CONTROLLER
// ============================================================
// Handles request/response logic for authentication routes.
// Business logic (DB, JWT) will be added later.

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = async (req, res) => {
  try {
    res.status(201).json({
      success: true,
      message: "Register API Working",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * @desc    Login an existing user
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "Login API Working",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
};
