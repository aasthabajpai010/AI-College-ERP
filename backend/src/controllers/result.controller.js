// ============================================================
// RESULT CONTROLLER
// ============================================================
// Handles marks entry, fetching results, and CGPA calculation.

const Result = require("../models/result.model");

// ------------------------------------------------------------
// Helper function: convert percentage into a letter grade
// Not exported — only used internally in this file.
// ------------------------------------------------------------
const calculateGrade = (percentage) => {
  if (percentage >= 90) return "A+";
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B";
  if (percentage >= 60) return "C";
  if (percentage >= 50) return "D";
  return "F";
};

/**
 * @desc    Add marks for a student in a subject/semester
 * @route   POST /api/results
 * @access  Admin, Faculty
 */
const addResult = async (req, res) => {
  try {
    const { student, subject, semester, marksObtained, maxMarks } = req.body;

    // Prevent duplicate entry for same student+subject+semester
    const existing = await Result.findOne({ student, subject, semester });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Result already exists for this subject and semester",
      });
    }

    // Calculate percentage and derive grade from it
    const finalMaxMarks = maxMarks || 100;
    const percentage = (marksObtained / finalMaxMarks) * 100;
    const grade = calculateGrade(percentage);

    const result = await Result.create({
      student,
      subject,
      semester,
      marksObtained,
      maxMarks: finalMaxMarks,
      grade,
      enteredBy: req.user.id, // comes from the JWT payload via protect middleware
    });

    res.status(201).json({
      success: true,
      result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * @desc    Get all results for a specific student
 * @route   GET /api/results/:studentId
 * @access  Admin, Faculty, Student (own only - enforced at route/frontend level)
 */
const getStudentResults = async (req, res) => {
  try {
    const results = await Result.find({ student: req.params.studentId }).sort({
      semester: 1, // ascending order, semester 1 first
    });

    res.status(200).json({
      success: true,
      results,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * @desc    Calculate CGPA for a student using an aggregation pipeline
 * @route   GET /api/results/:studentId/cgpa
 * @access  Admin, Faculty, Student (own only)
 */
const getCGPA = async (req, res) => {
  try {
    const mongoose = require("mongoose");
    const studentId = new mongoose.Types.ObjectId(req.params.studentId);

    const aggregationResult = await Result.aggregate([
      // Stage 1: only pick results belonging to this student
      { $match: { student: studentId } },

      // Stage 2: compute percentage per document, then average all percentages
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

    if (aggregationResult.length === 0) {
      return res.status(200).json({
        success: true,
        averagePercentage: 0,
        cgpa: 0,
        totalSubjects: 0,
      });
    }

    const { averagePercentage, totalSubjects } = aggregationResult[0];

    // Standard Indian grading approximation: CGPA = percentage / 9.5
    const cgpa = averagePercentage / 9.5;

    res.status(200).json({
      success: true,
      averagePercentage: Math.round(averagePercentage * 100) / 100, // rounded to 2 decimals
      cgpa: Math.round(cgpa * 100) / 100,
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
  addResult,
  getStudentResults,
  getCGPA,
};