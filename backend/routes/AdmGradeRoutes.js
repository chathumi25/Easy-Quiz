// backend/routes/AdmGradeRoutes.js

const express = require("express");
const router = express.Router();

const auth = require("../middlewere/auth");
const { adminOnly } = require("../middlewere/authMiddleware");

// TEMP route so Express doesn't crash
router.get("/", auth, adminOnly, (req, res) => {
  res.json({
    success: true,
    message: "Admin Grades API Working!",
  });
});

module.exports = router;
