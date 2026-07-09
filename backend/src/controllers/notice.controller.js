// ============================================================
// NOTICE CONTROLLER
// ============================================================
// Handles creating and fetching notices. The interesting part is
// createNotice — after saving to MongoDB through the normal flow,
// it ALSO emits a Socket.IO event, so any connected client gets
// the new notice pushed to them immediately, without refreshing
// or re-calling the API.

const Notice = require("../models/notice.model");
const { getIO } = require("../socket/socket");

/**
 * @desc    Create a new notice and broadcast it in real-time
 * @route   POST /api/notices
 * @access  Admin, Faculty
 */
const createNotice = async (req, res) => {
  try {
    const { title, content, department } = req.body;

    // Step 1: Save the notice normally, exactly like any other create operation.
    // This is the "source of truth" — even if a client is offline right now,
    // they'll see this notice next time they call GET /api/notices.
    const notice = await Notice.create({
      title,
      content,
      postedBy: req.user.id,
      department: department || null,
    });

    // Step 2: Emit a real-time event to connected clients.
    // Wrapped in try/catch separately — if Socket.IO somehow fails,
    // we don't want that to break the notice creation itself, since
    // the notice is already safely saved in the database at this point.
    try {
      const io = getIO();
      io.emit("newNotice", notice); // broadcasts to EVERY connected client
      // Alternative if we wanted to target one department's room only:
      // io.to(department).emit("newNotice", notice);
    } catch (socketError) {
      console.error("Socket emit failed:", socketError.message);
      // Deliberately not returning an error response here —
      // the notice still saved successfully via the normal REST flow.
    }

    res.status(201).json({
      success: true,
      notice,
    });
  } catch (error) {
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