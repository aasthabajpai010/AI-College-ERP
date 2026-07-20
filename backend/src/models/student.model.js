// ============================================================
// STUDENT MODEL
// ============================================================
// Defines how student profile data is stored in MongoDB.
// Mongoose turns this schema into a "Student" collection in the database.
//
// A Student is the academic profile linked to a User login account.
// Login credentials (email, password, role) live on User; roll number,
// semester, department, etc. live here.

const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    // ----------------------------------------------------------------
    // WHY reference User instead of copying name/email here?
    // ----------------------------------------------------------------
    // User is the single source of truth for identity and login data.
    // If a student updates their email or name on their account, we only
    // change the User document — not a duplicate copy on Student.
    // Storing ObjectId + ref lets us join the two when needed (populate).
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
      unique: true, // One login account → one student profile
    },

    // ----------------------------------------------------------------
    // WHY reference Department instead of a plain string like "CSE"?
    // ----------------------------------------------------------------
    // A string would duplicate department name/code on every student.
    // Referencing Department keeps data consistent: rename a department
    // once and every student pointing to it stays correct.
    // When you need full details (name, code), use populate() on queries.
    // populate() replaces the stored ObjectId with the actual linked document.
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: [true, "Department is required"],
    },

    rollNumber: {
      type: String,
      required: [true, "Roll number is required"],
      unique: true, // e.g. "CSE2024001" — must be unique across the college
    },

    semester: {
      type: Number,
      required: [true, "Semester is required"],
      min: [1, "Semester must be at least 1"],
      max: [8, "Semester cannot exceed 8"],
    },

    section: {
      type: String,
      required: [true, "Section is required"], // e.g. "A", "B"
    },

    phone: {
      type: String,
    },

    address: {
      type: String,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);
// ============================================================
// EXPLICIT INDEXES FOR QUERY PERFORMANCE
// ============================================================
// rollNumber and user already get an index automatically from
// `unique: true` in the schema above — Mongoose creates an index
// behind the scenes whenever unique is set. The indexes below are
// ADDITIONAL ones for fields that are frequently queried but were
// not already unique/indexed.

// Single-field index on department — speeds up queries like
// "find all students in department X" (e.g. Admin filtering the
// Students page, or generating department-wise reports).
studentSchema.index({ department: 1 });

// Compound index on (department, semester) — speeds up queries that
// filter by BOTH fields together, e.g. "all CSE students in semester 3".
// A compound index is more effective here than two separate single-field
// indexes when queries commonly filter on both fields at once.
studentSchema.index({ department: 1, semester: 1 });
const Student = mongoose.model("Student", studentSchema);

module.exports = Student;
