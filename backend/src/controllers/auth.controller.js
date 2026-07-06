// ============================================================
// AUTH CONTROLLER
// ============================================================
// Handles register and login logic.
// Routes send requests here; this file talks to the DB and returns responses.

const User = require("../models/user.model");
const generateToken = require("../utils/generateToken");

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // ----------------------------------------------------------------
    // WHY validate missing fields BEFORE touching the database?
    // ----------------------------------------------------------------
    // - Saves a wasted DB query when the request is obviously invalid.
    // - Faster response for the client (no network round-trip to MongoDB).
    // - Keeps error messages clear and under our control.
    // - Good practice: reject bad input at the "front door" of your API.
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Password is plain text here — the User model's pre("save") hook
    // automatically hashes it before it is stored in MongoDB.
    const user = await User.create({ name, email, password, role });

    const token = generateToken(user._id, user.role);

    // ----------------------------------------------------------------
    // WHY return a token immediately after register?
    // ----------------------------------------------------------------
    // The user just signed up — they should be logged in right away.
    // Without this, they would register, then call login separately.
    // Returning a token here gives a smooth "sign up and go" experience.
    //
    // WHY never send the password back in any response?
    // ----------------------------------------------------------------
    // - Even hashed passwords should not leave the server unnecessarily.
    // - Responses can be logged, cached, or intercepted — expose nothing sensitive.
    // - The client only needs id, name, email, role + token to work with the app.
    return res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({
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
    const { email, password } = req.body;

    // Same idea as register: validate input before querying the database.
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    const user = await User.findOne({ email });

    // Use the same "Invalid credentials" message whether email or password
    // is wrong — so attackers cannot tell which one failed (security best practice).
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = generateToken(user._id, user.role);

    // Login also returns token + safe user info (no password field).
    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
};