// ============================================================
// STUDENT CONTROLLER
// ============================================================
// Handles CRUD logic for student profiles.
// Routes send requests here; this file talks to the DB and returns responses.

const Student = require("../models/student.model");

/**
 * @desc    Create a new student profile
 * @route   POST /api/students
 * @access  Private (typically admin)
 */
const createStudent = async (req, res) => {
  try {
    const { user, department, rollNumber, semester, section, phone, address } =
      req.body;

    const existingStudent = await Student.findOne({ rollNumber });

    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: "Student with this roll number already exists",
      });
    }

    const student = await Student.create({
      user,
      department,
      rollNumber,
      semester,
      section,
      phone,
      address,
    });

    return res.status(201).json({
      success: true,
      student,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * @desc    Get all students
 * @route   GET /api/students
 * @access  Private
 */
const getAllStudents = async (req, res) => {
  try {
    // ----------------------------------------------------------------
    // WHY use populate() here?
    // ----------------------------------------------------------------
    // Student stores only ObjectIds for user and department — not full
    // name/email or department name/code. populate() fetches those linked
    // documents and swaps the IDs for the actual data in the response.
    // In SQL you would write a JOIN; populate() is Mongoose's way to do
    // that join without a separate query per field in application code.
    const students = await Student.find()
      .populate("user", "name email role")
      .populate("department", "name code");

    return res.status(200).json({
      success: true,
      students,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * @desc    Get a single student by ID
 * @route   GET /api/students/:id
 * @access  Private
 */

const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate("user", "name email role")
      .populate("department", "name code");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    return res.status(200).json({
      success: true,
      student,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * @desc    Update a student profile
 * @route   PUT /api/students/:id
 * @access  Private (typically admin)
 */
const updateStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // ----------------------------------------------------------------
    // WHY restrict which fields can be updated?
    // ----------------------------------------------------------------
    // user and rollNumber are identity/linking fields — changing them
    // through a generic update could break login links, duplicate roll
    // numbers, or reassign a profile to the wrong account. Academic/contact
    // details (department, semester, section, phone, address) are safe to
    // change; identity fields should use dedicated, controlled flows.
    const { department, semester, section, phone, address } = req.body;

    if (department !== undefined) student.department = department;
    if (semester !== undefined) student.semester = semester;
    if (section !== undefined) student.section = section;
    if (phone !== undefined) student.phone = phone;
    if (address !== undefined) student.address = address;

    await student.save();

    return res.status(200).json({
      success: true,
      student,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * @desc    Delete a student profile
 * @route   DELETE /api/students/:id
 * @access  Private (typically admin)
 */
const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    await student.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Student deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * @desc    Get the logged-in user's own Student profile
 * @route   GET /api/students/me
 * @access  Student (their own profile only)
 */
const getMyStudentProfile = async (req, res) => {
  try {
    // req.user.id comes from the JWT payload (set by the protect
    // middleware) — this is the logged-in User's own ID, not a
    // Student ID. We look up the Student document that references
    // this exact User, rather than trusting any ID from the URL —
    // this is what makes it an "ownership" lookup instead of a
    // role-only check: a student can ONLY ever get their own profile
    // this way, never anyone else's.
    const student = await Student.findOne({ user: req.user.id })
      .populate("user", "name email role")
      .populate("department", "name code");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found for this user",
      });
    }

    return res.status(200).json({
      success: true,
      student,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  getMyStudentProfile,
};