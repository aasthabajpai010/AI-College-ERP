// ============================================================
// DASHBOARD CONTROLLER
// ============================================================
// This file does NOT create/update/delete anything — it only reads
// and summarizes data that already exists in Student, Attendance,
// Result, and Department collections. Think of it as a "reporting"
// layer on top of the other modules.
//
// WHY combine multiple pieces of data into ONE response instead of
// making the frontend call 4 separate endpoints?
// A dashboard page typically needs ALL its numbers at once to render
// (total students, attendance %, grade chart, etc). If the frontend
// had to make 4 separate API calls, that's 4 separate network
// round-trips, each with its own delay, before the page is fully
// ready. Bundling them into one response means one request, one
// loading spinner, and the whole dashboard renders together.

const Student = require("../models/student.model");
const Attendance = require("../models/attendance.model");
const Result = require("../models/result.model");
const Department = require("../models/department.model");
const mongoose = require("mongoose");

/**
 * @desc    Get aggregated summary data for Admin/Faculty dashboard
 * @route   GET /api/dashboard/admin
 * @access  Admin, Faculty
 */
const getAdminDashboard = async (req, res) => {
  try {
    // ------------------------------------------------------------
    // 1. Total number of students in the whole system
    // ------------------------------------------------------------
    const totalStudents = await Student.countDocuments();

    // ------------------------------------------------------------
    // 2. Total number of departments
    // ------------------------------------------------------------
    const totalDepartments = await Department.countDocuments();

    // ------------------------------------------------------------
    // 3. How many students belong to each department
    // ------------------------------------------------------------
    const departmentWiseCount = await Student.aggregate([
      // Stage 1: group all students by their department field, counting each group
      {
        $group: {
          _id: "$department",
          count: { $sum: 1 },
        },
      },
      // Stage 2: join with the departments collection to get the actual department name
      // (like a SQL JOIN — without this, we'd only have the department's ObjectId, not its name)
      {
        $lookup: {
          from: "departments", // MongoDB collection name (lowercase, plural, by convention)
          localField: "_id", // the department ObjectId we grouped by
          foreignField: "_id", // matches against the Department collection's _id
          as: "departmentInfo",
        },
      },
      // Stage 3: $lookup returns an array (even for a single match) — unwrap it to a plain object
      { $unwind: "$departmentInfo" },
      // Stage 4: reshape the output to only the fields the frontend actually needs
      {
        $project: {
          _id: 0,
          departmentName: "$departmentInfo.name",
          count: 1,
        },
      },
    ]);

    // ------------------------------------------------------------
    // 4. Average attendance percentage ACROSS ALL students combined
    // ------------------------------------------------------------
    const attendanceAgg = await Attendance.aggregate([
      // Stage 1: group by student first, so each student gets their own present/total count
      {
        $group: {
          _id: "$student",
          total: { $sum: 1 },
          present: {
            $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] },
          },
        },
      },
      // Stage 2: compute each student's individual percentage
      {
        $project: {
          percentage: { $multiply: [{ $divide: ["$present", "$total"] }, 100] },
        },
      },
      // Stage 3: now average ALL students' percentages into one overall number
      {
        $group: {
          _id: null,
          overallAverage: { $avg: "$percentage" },
        },
      },
    ]);

    const averageAttendancePercentage =
      attendanceAgg.length > 0 ? Math.round(attendanceAgg[0].overallAverage * 100) / 100 : 0;

    // ------------------------------------------------------------
    // 5. How many results fall into each grade (A+, A, B, C, D, F)
    // ------------------------------------------------------------
    const gradeDistribution = await Result.aggregate([
      // Group all result documents by their grade field, counting how many in each group
      {
        $group: {
          _id: "$grade",
          count: { $sum: 1 },
        },
      },
      // Rename _id to "grade" in the output so the frontend gets a cleaner field name
      {
        $project: {
          _id: 0,
          grade: "$_id",
          count: 1,
        },
      },
    ]);

    // ------------------------------------------------------------
    // Send everything back in one combined response
    // ------------------------------------------------------------
    res.status(200).json({
      success: true,
      totalStudents,
      totalDepartments,
      departmentWiseCount,
      averageAttendancePercentage,
      gradeDistribution,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * @desc    Get a single student's own dashboard summary
 * @route   GET /api/dashboard/student/:studentId
 * @access  Admin, Faculty, Student (own data)
 */
const getStudentDashboard = async (req, res) => {
  try {
    const studentId = new mongoose.Types.ObjectId(req.params.studentId);

    // ------------------------------------------------------------
    // 1. This student's attendance percentage
    // (same pattern as attendance.controller.js's getAttendancePercentage)
    // ------------------------------------------------------------
    const attendanceAgg = await Attendance.aggregate([
      { $match: { student: studentId } },
      {
        $group: {
          _id: "$student",
          total: { $sum: 1 },
          present: {
            $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] },
          },
        },
      },
    ]);

    const attendancePercentage =
      attendanceAgg.length > 0
        ? Math.round((attendanceAgg[0].present / attendanceAgg[0].total) * 100 * 100) / 100
        : 0;

    // ------------------------------------------------------------
    // 2. This student's CGPA
    // (same pattern as result.controller.js's getCGPA)
    // ------------------------------------------------------------
    const resultAgg = await Result.aggregate([
      { $match: { student: studentId } },
      {
        $group: {
          _id: "$student",
          averagePercentage: {
            $avg: { $multiply: [{ $divide: ["$marksObtained", "$maxMarks"] }, 100] },
          },
          totalSubjects: { $sum: 1 },
        },
      },
    ]);

    const averagePercentage = resultAgg.length > 0 ? resultAgg[0].averagePercentage : 0;
    const cgpa = Math.round((averagePercentage / 9.5) * 100) / 100;
    const totalSubjects = resultAgg.length > 0 ? resultAgg[0].totalSubjects : 0;

    // ------------------------------------------------------------
    // Send everything back in one combined response
    // ------------------------------------------------------------
    res.status(200).json({
      success: true,
      attendancePercentage,
      cgpa,
      totalSubjects,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  getAdminDashboard,
  getStudentDashboard,
};