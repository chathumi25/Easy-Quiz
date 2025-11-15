// backend/routes/AdmDashboardRoutes.js
const express = require("express");
const router = express.Router();
const auth = require("../middlewere/auth");
const { adminOnly } = require("../middlewere/authMiddleware");

// Simple test route for Admin Dashboard
router.get("/", auth, adminOnly, (req, res) => {
  res.json({
    success: true,
    message: "Admin Dashboard API Working!",
  });
});

module.exports = router;
