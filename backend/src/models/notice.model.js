// ============================================================
// NOTICE MODEL
// ============================================================
// Stores announcements/notices posted by Admin or Faculty.
// When a new notice is created, the controller will also emit a
// Socket.IO event so connected clients see it instantly.

const mongoose = require("mongoose");

const noticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Optional: restrict a notice to one department, or leave null for "everyone"
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notice", noticeSchema);