// ============================================================
// ATTENDANCE CONTROLLER
// ============================================================
// Handles attendance marking, history, percentage, and defaulter reports.
// Routes send requests here; this file talks to the DB and returns responses.

const mongoose = require("mongoose");
const Attendance = require("../models/attendance.model");
const Student = require("../models/student.model");

/**
 * @desc    Mark attendance for a student on a given date
 * @route   POST /api/attendance
 * @access  Private (faculty/admin)
 */
const markAttendance = async (req, res) => {
  try {
    const { student, date, status } = req.body;

    const existingAttendance = await Attendance.findOne({ student, date });

    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        message: "Attendance already marked for this date",
      });
    }

    const attendance = await Attendance.create({
      student,
      date,
      status,
      markedBy: req.user.id,
    });

    return res.status(201).json({
      success: true,
      attendance,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * @desc    Get all attendance records for a student
 * @route   GET /api/attendance/student/:studentId
 * @access  Private
 */
const getStudentAttendance = async (req, res) => {
  try {
    const { studentId } = req.params;

    const attendanceRecords = await Attendance.find({ student: studentId })
      .sort({ date: -1 })
      .populate("student", "rollNumber semester section")
      .populate("markedBy", "name email role");

    return res.status(200).json({
      success: true,
      attendance: attendanceRecords,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * @desc    Get attendance percentage for a student
 * @route   GET /api/attendance/percentage/:studentId
 * @access  Private
 */
const getAttendancePercentage = async (req, res) => {
  try {
    const { studentId } = req.params;

    const result = await Attendance.aggregate([
      // $match — keep only attendance rows for this student
      {
        $match: {
          student: new mongoose.Types.ObjectId(studentId),
        },
      },
      // $group — count total records and how many are "present"
      {
        $group: {
          _id: null,
          totalClasses: { $sum: 1 },
          present: {
            $sum: {
              $cond: [{ $eq: ["$status", "present"] }, 1, 0],
            },
          },
        },
      },
      // $project — compute percentage = (present / total) * 100
      {
        $project: {
          _id: 0,
          totalClasses: 1,
          present: 1,
          percentage: {
            $cond: [
              { $eq: ["$totalClasses", 0] },
              0,
              {
                $round: [
                  {
                    $multiply: [
                      { $divide: ["$present", "$totalClasses"] },
                      100,
                    ],
                  },
                  2,
                ],
              },
            ],
          },
        },
      },
    ]);

    const stats = result[0] || { totalClasses: 0, present: 0, percentage: 0 };

    return res.status(200).json({
      success: true,
      totalClasses: stats.totalClasses,
      present: stats.present,
      percentage: stats.percentage,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * @desc    Get list of students with attendance below 75%
 * @route   GET /api/attendance/defaulters
 * @access  Private (faculty/admin)
 */
const getDefaulterList = async (req, res) => {
  try {
    const defaulters = await Attendance.aggregate([
      // $group — group all rows by student; count total classes and present days
      {
        $group: {
          _id: "$student",
          totalClasses: { $sum: 1 },
          present: {
            $sum: {
              $cond: [{ $eq: ["$status", "present"] }, 1, 0],
            },
          },
        },
      },
      // $addFields — calculate each student's attendance percentage
      {
        $addFields: {
          percentage: {
            $multiply: [{ $divide: ["$present", "$totalClasses"] }, 100],
          },
        },
      },
      // $match — keep only students whose percentage is below 75
      {
        $match: {
          percentage: { $lt: 75 },
        },
      },
      // $lookup — join the students collection to get rollNumber and user reference
      {
        $lookup: {
          from: "students",
          localField: "_id",
          foreignField: "_id",
          as: "studentDoc",
        },
      },
      // $unwind — flatten the studentDoc array into a single object
      { $unwind: "$studentDoc" },
      // $lookup — join the users collection via student.user to get the student's name
      {
        $lookup: {
          from: "users",
          localField: "studentDoc.user",
          foreignField: "_id",
          as: "userDoc",
        },
      },
      // $unwind — flatten the userDoc array (preserve if user missing)
      { $unwind: { path: "$userDoc", preserveNullAndEmptyArrays: true } },
      // $project — return only the fields needed in the defaulter list
      {
        $project: {
          _id: 0,
          studentId: "$_id",
          rollNumber: "$studentDoc.rollNumber",
          percentage: { $round: ["$percentage", 2] },
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      defaulters,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  markAttendance,
  getStudentAttendance,
  getAttendancePercentage,
  getDefaulterList,
};
