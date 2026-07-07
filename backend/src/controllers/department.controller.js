// ============================================================
// DEPARTMENT CONTROLLER
// ============================================================
// Handles CRUD logic for departments (e.g. "Computer Science", "CSE").
// Routes send requests here; this file talks to the DB and returns responses.

// Import the Mongoose model so we can query the "departments" collection.
const Department = require("../models/department.model");

/**
 * @desc    Create a new department
 * @route   POST /api/departments
 * @access  Private (typically admin)
 */
const createDepartment = async (req, res) => {
  // try/catch wraps the whole function so unexpected errors (DB down, etc.)
  // return a clean 500 instead of crashing the server.
  try {
    // req.body is the JSON the client sent (parsed by express.json() in server.js).
    // Destructuring pulls name and code out into their own variables.
    const { name, code } = req.body;

    // ----------------------------------------------------------------
    // WHY check for duplicates BEFORE creating?
    // ----------------------------------------------------------------
    // name and code are both unique in the schema. If "CSE" already exists,
    // creating another would fail or leave bad data. Checking first lets us
    // return a clear 400 message instead of a vague database error.
    // $or means: find a document where name matches OR code matches.
    const existingDepartment = await Department.findOne({
      $or: [{ name }, { code }],
    });

    // If we found a match, stop here — do not create a second department.
    if (existingDepartment) {
      // return ends the function; res.status(400) means "bad request".
      return res.status(400).json({
        success: false,
        message: "Department already exists",
      });
    }

    // Department.create() builds a new document and saves it to MongoDB.
    // The model's uppercase: true on code will normalize "cse" → "CSE".
    const department = await Department.create({ name, code });

    // 201 Created — standard HTTP status when a new resource was made.
    return res.status(201).json({
      success: true,
      department,
    });
  } catch (error) {
    // Any error we did not handle above lands here (network, validation, etc.).
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * @desc    Get all departments
 * @route   GET /api/departments
 * @access  Private
 */
const getAllDepartments = async (req, res) => {
  try {
    // Department.find() with no filter returns every document in the collection.
    // await waits for MongoDB to respond before we continue.
    const departments = await Department.find();

    // 200 OK — standard status for a successful read/list request.
    return res.status(200).json({
      success: true,
      departments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * @desc    Update a department by ID
 * @route   PUT /api/departments/:id
 * @access  Private (typically admin)
 */
const updateDepartment = async (req, res) => {
  try {
    // ----------------------------------------------------------------
    // WHAT IS req.params.id?
    // ----------------------------------------------------------------
    // In Express, :id in the route path is a "route parameter".
    // Example: client sends PUT /api/departments/64abc123
    //   - "/api/departments" is the mount prefix (from server.js)
    //   - "64abc123" is the :id segment
    // Express puts that value in req.params.id → "64abc123"
    // findById uses it to load the one department document to update.
    const department = await Department.findById(req.params.id);

    // If no document has that _id, department is null — return 404 Not Found.
    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    // Pull possible updates from the request body.
    const { name, code } = req.body;

    // Only change fields that were actually sent (undefined = not in body).
    if (name !== undefined) department.name = name;
    if (code !== undefined) department.code = code;

    // ----------------------------------------------------------------
    // WHY findById + save() instead of findByIdAndUpdate()?
    // ----------------------------------------------------------------
    // findByIdAndUpdate(id, { name, code }) updates in one DB call — faster
    // and fine for simple updates.
    // findById + modify + save() loads the document, changes it in memory,
    // then saves — runs schema validators and middleware (pre/post save hooks)
    // on the full document. We use this approach here for clarity and so
    // any future hooks on the Department model still run. Both are acceptable;
    // pick one style and stay consistent across your controllers.
    await department.save();

    return res.status(200).json({
      success: true,
      department,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * @desc    Delete a department by ID
 * @route   DELETE /api/departments/:id
 * @access  Private (typically admin)
 */
const deleteDepartment = async (req, res) => {
  try {
    // Same req.params.id idea: DELETE /api/departments/64abc123 → id "64abc123".
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    // deleteOne() removes this document from the collection permanently.
    await department.deleteOne();

    // 200 OK with a message — client knows delete succeeded.
    return res.status(200).json({
      success: true,
      message: "Department deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Export all handlers so student.routes.js (or department.routes.js) can import them.
module.exports = {
  createDepartment,
  getAllDepartments,
  updateDepartment,
  deleteDepartment,
};
