// ============================================================
// ATTENDANCE MODEL
// ============================================================
// Defines how daily attendance records are stored in MongoDB.
// Mongoose turns this schema into an "Attendance" collection in the database.
//
// ----------------------------------------------------------------
// WHY ONE DOCUMENT PER STUDENT PER DAY?
// (instead of one document per class per day with an array of students)
// ----------------------------------------------------------------
// Alternative design (NOT used here):
//   One document per class/session per day, with a field like:
//   students: [{ studentId, status }, { studentId, status }, ...]
//
// We chose ONE document PER STUDENT PER DAY because:
//
// 1. SIMPLER QUERIES FOR A SINGLE STUDENT
//    - "Give me all attendance for student X" is a straight find:
//        Attendance.find({ student: studentId })
//    - With a nested array design, you would need $elemMatch or
//      aggregation pipelines to pull one student's rows out of many
//      class documents — harder for beginners and slower to maintain.
//
// 2. EASIER AGGREGATION & REPORTS
//    - Counting present days, absence percentage, monthly summaries
//      per student maps naturally to grouping on { student, status }.
//    - MongoDB aggregation ($group, $match on student + date range)
//      works cleanly when each row is one student-day record.
//
// 3. CLEAR UNIQUE RULE
//    - "At most one attendance record per student per calendar day"
//      is enforced with a compound index on (student, date).
//    - With an array inside a class document, preventing duplicate
//      entries for the same student on the same day is messier.
//
// TRADE-OFF (be aware):
// - More documents overall — 500 students × 180 school days = many rows.
// - That is normal and fine for MongoDB; indexes keep lookups fast.
// - For "mark whole class at once", the controller may insert many
//   documents in one request (bulk insert), which is still straightforward.
//
// ----------------------------------------------------------------
// WHY THE COMPOUND UNIQUE INDEX ON (student, date)?
// ----------------------------------------------------------------
// Without this index, nothing stops two faculty members (or double-clicks)
// from saving attendance twice for the same student on the same date.
//
// The compound index means: the PAIR (student, date) must be unique.
// - Student A + 2026-07-07 → allowed (first insert)
// - Student A + 2026-07-07 → REJECTED (duplicate)
// - Student A + 2026-07-08 → allowed (different date)
// - Student B + 2026-07-07 → allowed (different student)
//
// If you try to insert a duplicate, MongoDB throws a duplicate key error:
//   MongoServerError: E11000 duplicate key error collection: ... index: student_1_date_1
//
// In the controller we catch that error and return a friendly message like
// "Attendance already marked for this student on this date" instead of
// crashing the server or silently creating bad data.
//
// ----------------------------------------------------------------
// WHY track markedBy?
// ----------------------------------------------------------------
// markedBy stores which User (faculty or admin) created this record.
// This is an AUDIT TRAIL:
// - If attendance is disputed ("I was present!"), admins can see who marked it.
// - Accountability: faculty actions are traceable, not anonymous.
// - Future updates: you might log who last changed a record (updatedAt +
//   markedBy together help with compliance and debugging).
//
// We reference User (not Faculty as a separate model) because login identity
// and role already live on User — same pattern as Student.user.

const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    // ----------------------------------------------------------------
    // student — which student this attendance row belongs to
    // ----------------------------------------------------------------
    // ObjectId points to a document in the "students" collection (Student model).
    // ref: "Student" tells Mongoose the model name for populate("student").
    // required: every attendance record must be tied to exactly one student.
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: [true, "Student reference is required"],
    },

    // ----------------------------------------------------------------
    // date — which calendar day this attendance is for
    // ----------------------------------------------------------------
    // Stored as a JavaScript Date (MongoDB ISODate).
    // Typically normalized to start-of-day in the controller so
    // "2026-07-07" always matches the same day regardless of time zone quirks.
    // required: we must know WHICH day was marked present/absent.
    date: {
      type: Date,
      required: [true, "Attendance date is required"],
    },

    // ----------------------------------------------------------------
    // status — present or absent for that student on that date
    // ----------------------------------------------------------------
    // enum restricts values to only "present" or "absent".
    // If someone sends status: "late" or "excused", Mongoose validation fails
    // before save — keeps data consistent for reports and dashboards.
    status: {
      type: String,
      enum: {
        values: ["present", "absent"],
        message: "Status must be either 'present' or 'absent'",
      },
      required: [true, "Attendance status is required"],
    },

    // ----------------------------------------------------------------
    // markedBy — which faculty/admin user marked this record
    // ----------------------------------------------------------------
    // ObjectId → User collection. The person logged in when marking attendance
    // (req.user.id from JWT after protect middleware) is saved here.
    // required: every record must record WHO marked it (audit trail).
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "markedBy (faculty/admin user) is required"],
    },
  },
  {
    // timestamps: true adds createdAt and updatedAt automatically.
    // createdAt ≈ when the record was first saved; updatedAt changes on edits.
    timestamps: true,
  }
);

// Compound unique index: (student + date) together must be unique.
// MongoDB creates an index named something like "student_1_date_1".
// Duplicate insert/update → E11000 duplicate key error (handled in controller).
attendanceSchema.index({ student: 1, date: 1 }, { unique: true });

// Register model as "Attendance" → MongoDB collection "attendances" (pluralized).
const Attendance = mongoose.model("Attendance", attendanceSchema);

module.exports = Attendance;
