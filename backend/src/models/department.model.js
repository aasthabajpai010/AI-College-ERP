// ============================================================
// DEPARTMENT MODEL
// ============================================================
// Defines how department data is stored in MongoDB.
// Mongoose turns this schema into a "Department" collection in the database.
//
// ----------------------------------------------------------------
// WHY is Department its own collection instead of a plain string
// on the Student model (e.g. student.department = "Computer Science")?
// ----------------------------------------------------------------
// 1. REUSE & REFERENCE — Many students, faculty, courses, and timetables
//    belong to the same department. Storing a Department document once and
//    referencing it by _id avoids repeating "Computer Science" / "CSE" on
//    every related record.
// 2. SINGLE SOURCE OF TRUTH — If a department is renamed (e.g. "IT" →
//    "Information Technology"), you update ONE document here. Every
//    Student/Faculty that references this department automatically reflects
//    the change. With a plain string on each student, you would have to
//    find and update thousands of records manually.
// 3. EXTRA METADATA — Departments can grow: head of department, building,
//    established year, etc. A dedicated collection keeps that data organized
//    instead of scattering strings across the app.

const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Department name is required"],
      unique: true, // e.g. "Computer Science" — no duplicate department names
    },

    code: {
      type: String,
      required: [true, "Department code is required"],
      unique: true, // e.g. "CSE" — short code used in IDs, reports, and filters
      uppercase: true, // Always store as "CSE" even if client sends "cse"
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

const Department = mongoose.model("Department", departmentSchema);

module.exports = Department;
