// ============================================================
// NOTICE MODEL
// ============================================================
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
    // NEW: AI-generated short summary of the content, filled in
    // asynchronously after creation via the OpenRouter API call.
    // Starts as null — if the AI call fails, it just stays null
    // instead of blocking notice creation.
    summary: {
      type: String,
      default: null,
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notice", noticeSchema);