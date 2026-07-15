// ============================================================
// NOTICE CONTROLLER
// ============================================================
// Handles creating and fetching notices.
//
// createNotice does THREE things, in this order:
// 1. Saves the notice normally to MongoDB (source of truth)
// 2. Emits a Socket.IO event so connected clients see it instantly
// 3. Calls the OpenRouter API to generate a short AI summary, and
//    updates the notice with that summary once it's ready
//
// Steps 2 and 3 are both wrapped in their own try/catch blocks,
// SEPARATE from step 1's try/catch. This is deliberate: if Socket.IO
// or the AI API fails, the notice itself is already safely saved —
// we don't want a third-party API hiccup to make the whole request
// fail when the core action (saving the notice) already succeeded.

const Notice = require("../models/notice.model");
const { getIO } = require("../socket/socket");
const summarizeNotice = require("../utils/summarizeNotice");

/**
 * @desc    Create a new notice, broadcast it live, and generate an AI summary
 * @route   POST /api/notices
 * @access  Admin, Faculty
 */
const createNotice = async (req, res) => {
  try {
    const { title, content, department } = req.body;

    // ------------------------------------------------------------
    // STEP 1: Save the notice normally.
    // This happens FIRST and independently of the AI/Socket.IO steps
    // below, so even if those fail, the notice itself is safe.
    // ------------------------------------------------------------
    const notice = await Notice.create({
      title,
      content,
      postedBy: req.user.id,
      department: department || null,
    });
// Populate before emitting, so real-time clients get full postedBy info
await notice.populate("postedBy", "name role");
    // ------------------------------------------------------------
    // STEP 2: Emit a real-time Socket.IO event immediately.
    // We do this BEFORE waiting for the AI summary, so students get
    // the notice pushed to them right away — they don't need to wait
    // for the (potentially slow) AI call just to see the notice exists.
    // ------------------------------------------------------------
    try {
      const io = getIO();
      io.emit("newNotice", notice);
    } catch (socketError) {
      console.error("Socket emit failed:", socketError.message);
      // Not returning an error response — the notice already saved fine.
    }

    // ------------------------------------------------------------
    // STEP 3: Call OpenRouter to generate a short AI summary.
    // WHY AFTER sending the response below, conceptually?
    // In this simple version, we still await it here so the summary
    // is included in the API response the caller sees — but the
    // summarizeNotice() function itself already handles failure
    // gracefully (returns null instead of throwing), so a failed AI
    // call still lets this whole request complete successfully.
    // ------------------------------------------------------------
    const summary = await summarizeNotice(content);

    if (summary) {
      // Only write to the database again if we actually got a summary —
      // no point doing an extra DB write when there's nothing new to save.
      notice.summary = summary;
      await notice.save();
    }

    res.status(201).json({
      success: true,
      notice,
    });
  } catch (error) {
    // This outer catch only fires for failures in STEP 1 (the actual
    // notice creation) — a genuine problem, unlike Socket.IO/AI failures
    // above which are handled locally and don't reach here.
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * @desc    Get all notices, most recent first
 * @route   GET /api/notices
 * @access  Admin, Faculty, Student
 */
const getAllNotices = async (req, res) => {
  try {
    const notices = await Notice.find()
      .populate("postedBy", "name role")
      .sort({ createdAt: -1 }); // newest first

    res.status(200).json({
      success: true,
      notices,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  createNotice,
  getAllNotices,
};