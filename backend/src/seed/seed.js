// ============================================================
// DATABASE SEED SCRIPT
// ============================================================
// Fills the database with realistic demo data (users, departments,
// students, attendance, results) so the app is ready to demo live
// instead of showing an empty database.
//
// HOW TO USE:
// 1. Place this file at: backend/src/seed.js
// 2. Run it with:  node src/seed.js
// 3. It connects using the same MONGO_URI from your .env file.
//
// WARNING: This script DELETES existing data in the User, Department,
// Student, Attendance, and Result collections before inserting fresh
// demo data. Do not run this against real production data.
// ============================================================

require("dotenv").config();
const mongoose = require("mongoose");

const User = require("./models/user.model");
const Department = require("./models/department.model");
const Student = require("./models/student.model");
const Attendance = require("./models/attendance.model");
const Result = require("./models/result.model");

const seedDatabase = async () => {
  try {
    // ------------------------------------------------------------
    // STEP 1: Connect to MongoDB using the same URI as the main app
    // ------------------------------------------------------------
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected for seeding...");

    // ------------------------------------------------------------
    // STEP 2: Clear existing data so re-running this script is safe
    // and doesn't create duplicates or violate unique indexes
    // ------------------------------------------------------------
    await User.deleteMany({});
    await Department.deleteMany({});
    await Student.deleteMany({});
    await Attendance.deleteMany({});
    await Result.deleteMany({});
    console.log("Old data cleared.");

    // ------------------------------------------------------------
    // STEP 3: Create Users (Admin, Faculty, and several Students)
    // Passwords are plain here but will be hashed automatically by
    // the pre-save hook defined in user.model.js
    // ------------------------------------------------------------
    const admin = await User.create({
      name: "Admin User",
      email: "admin@test.com",
      password: "123456",
      role: "admin",
    });

    const faculty = await User.create({
      name: "Faculty User",
      email: "faculty@test.com",
      password: "123456",
      role: "faculty",
    });

    const studentUsers = await User.insertMany([
      { name: "Aarav Sharma", email: "aarav@test.com", password: "123456", role: "student" },
      { name: "Priya Verma", email: "priya@test.com", password: "123456", role: "student" },
      { name: "Rohan Gupta", email: "rohan@test.com", password: "123456", role: "student" },
      { name: "Sneha Iyer", email: "sneha@test.com", password: "123456", role: "student" },
      { name: "Karan Mehta", email: "karan@test.com", password: "123456", role: "student" },
    ]);
    // NOTE: insertMany() skips Mongoose middleware hooks (like password hashing)
    // in some Mongoose versions/configurations. If you notice login failing
    // for these demo students, switch this to a loop of User.create() calls
    // instead, which reliably triggers the pre-save hook.

    console.log("Users created: 1 admin, 1 faculty, 5 students");

    // ------------------------------------------------------------
    // STEP 4: Create Departments
    // ------------------------------------------------------------
    const departments = await Department.insertMany([
      { name: "Computer Science", code: "CSE" },
      { name: "Electronics & Communication", code: "ECE" },
      { name: "Mechanical Engineering", code: "MECH" },
    ]);
    console.log("Departments created:", departments.map((d) => d.code).join(", "));

    // ------------------------------------------------------------
    // STEP 5: Create Student profiles, linking each User to a Department
    // ------------------------------------------------------------
    const studentProfiles = await Student.insertMany([
      {
        user: studentUsers[0]._id,
        department: departments[0]._id, // CSE
        rollNumber: "CSE2024001",
        semester: 3,
        section: "A",
        phone: "9000000001",
        address: "Delhi",
      },
      {
        user: studentUsers[1]._id,
        department: departments[0]._id, // CSE
        rollNumber: "CSE2024002",
        semester: 3,
        section: "A",
        phone: "9000000002",
        address: "Mumbai",
      },
      {
        user: studentUsers[2]._id,
        department: departments[1]._id, // ECE
        rollNumber: "ECE2024001",
        semester: 3,
        section: "B",
        phone: "9000000003",
        address: "Bangalore",
      },
      {
        user: studentUsers[3]._id,
        department: departments[1]._id, // ECE
        rollNumber: "ECE2024002",
        semester: 3,
        section: "B",
        phone: "9000000004",
        address: "Pune",
      },
      {
        user: studentUsers[4]._id,
        department: departments[2]._id, // MECH
        rollNumber: "MECH2024001",
        semester: 3,
        section: "A",
        phone: "9000000005",
        address: "Chennai",
      },
    ]);
    console.log("Student profiles created:", studentProfiles.length);

    // ------------------------------------------------------------
    // STEP 6: Create Attendance records across a date range
    // Each student gets a mix of present/absent days so the
    // percentage and defaulter-list aggregations return varied,
    // demo-friendly results (not just 100% for everyone).
    // ------------------------------------------------------------
    const dates = [
      "2026-06-01", "2026-06-02", "2026-06-03", "2026-06-04", "2026-06-05",
      "2026-06-08", "2026-06-09", "2026-06-10", "2026-06-11", "2026-06-12",
    ];

    // Attendance pattern per student index (true = present, false = absent)
    // Student 0 & 1: mostly present (good attendance)
    // Student 2: exactly borderline (~70%, should show as a defaulter, below 75%)
    // Student 3: mostly absent (clear defaulter)
    // Student 4: perfect attendance
    const attendancePatterns = [
      [true, true, true, true, false, true, true, true, true, true],   // 90%
      [true, true, false, true, true, true, true, false, true, true],  // 80%
      [true, false, true, false, true, true, false, true, false, true],// 60% - defaulter
      [false, false, true, false, false, true, false, false, true, false], // 30% - defaulter
      [true, true, true, true, true, true, true, true, true, true],    // 100%
    ];

    const attendanceRecords = [];
    studentProfiles.forEach((student, studentIndex) => {
      dates.forEach((date, dateIndex) => {
        attendanceRecords.push({
          student: student._id,
          date: new Date(date),
          status: attendancePatterns[studentIndex][dateIndex] ? "present" : "absent",
          markedBy: faculty._id,
        });
      });
    });

    await Attendance.insertMany(attendanceRecords);
    console.log("Attendance records created:", attendanceRecords.length);

    // ------------------------------------------------------------
    // STEP 7: Create Results (marks) for each student across a few subjects
    // Grade is calculated the same way the controller does, so seeded
    // data looks consistent with what the API would produce.
    // ------------------------------------------------------------
    const calculateGrade = (percentage) => {
      if (percentage >= 90) return "A+";
      if (percentage >= 80) return "A";
      if (percentage >= 70) return "B";
      if (percentage >= 60) return "C";
      if (percentage >= 50) return "D";
      return "F";
    };

    const subjects = ["Data Structures", "Operating Systems", "Database Management"];

    // Marks pattern per student index, one entry per subject above
    const marksPatterns = [
      [88, 92, 79],  // strong student
      [75, 68, 82],
      [60, 55, 70],
      [40, 35, 50],  // weak student
      [95, 90, 98],  // topper
    ];

    const resultRecords = [];
    studentProfiles.forEach((student, studentIndex) => {
      subjects.forEach((subject, subjectIndex) => {
        const marksObtained = marksPatterns[studentIndex][subjectIndex];
        const maxMarks = 100;
        const percentage = (marksObtained / maxMarks) * 100;

        resultRecords.push({
          student: student._id,
          subject,
          semester: 3,
          marksObtained,
          maxMarks,
          grade: calculateGrade(percentage),
          enteredBy: faculty._id,
        });
      });
    });

    await Result.insertMany(resultRecords);
    console.log("Result records created:", resultRecords.length);

    // ------------------------------------------------------------
    // STEP 8: Print a summary + login credentials for the demo
    // ------------------------------------------------------------
    console.log("\n================ SEED COMPLETE ================");
    console.log("Login credentials for demo:");
    console.log("  Admin:    admin@test.com   / 123456");
    console.log("  Faculty:  faculty@test.com / 123456");
    console.log("  Student:  aarav@test.com   / 123456  (or priya/rohan/sneha/karan @test.com)");
    console.log("=================================================\n");

    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seedDatabase();