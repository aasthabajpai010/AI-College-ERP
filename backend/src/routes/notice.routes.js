// ============================================================
// NOTICE ROUTES
// ============================================================

const express = require("express");
const { createNotice, getAllNotices } = require("../controllers/notice.controller");
const { protect, authorizeRoles } = require("../middlewares/auth.middleware");

const router = express.Router();

// POST / — only Admin/Faculty can post official notices
router.post("/", protect, authorizeRoles("admin", "faculty"), createNotice);

// GET / — everyone can view notices
router.get("/", protect, authorizeRoles("admin", "faculty", "student"), getAllNotices);

module.exports = router;