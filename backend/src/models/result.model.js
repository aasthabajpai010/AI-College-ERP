// ============================================================
// RESULT MODEL
// ============================================================
// Stores exam/marks records per student, subject, and semester.

const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: [true, "Student reference is required"],
    },

    subject: {
      type: String,
      required: [true, "Subject is required"],
    },

    semester: {
      type: Number,
      required: [true, "Semester is required"],
      min: [1, "Semester must be at least 1"],
      max: [8, "Semester cannot exceed 8"],
    },

    marksObtained: {
      type: Number,
      required: [true, "Marks obtained is required"],
      min: [0, "Marks cannot be negative"],
    },

    maxMarks: {
      type: Number,
      required: [true, "Maximum marks is required"],
      default: 100,
    },

    // grade is set in the controller from marksObtained/maxMarks — not accepted from the client.
    // That keeps grading consistent (same rules for everyone) and stops manual/wrong grade entry.
    grade: {
      type: String,
    },

    enteredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "enteredBy (faculty/admin user) is required"],
    },
  },
  {
    timestamps: true,
  }
);

// One marks record per student + subject + semester — blocks duplicate entry for the same exam.
resultSchema.index({ student: 1, subject: 1, semester: 1 }, { unique: true });

const Result = mongoose.model("Result", resultSchema);

module.exports = Result;
