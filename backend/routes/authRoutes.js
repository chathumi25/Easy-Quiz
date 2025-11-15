// backend/routes/authRoutes.js
const express = require("express");
const router = express.Router();
const upload = require("../middlewere/upload");
const auth = require("../middlewere/auth");

const { registerUser, loginUser } = require("../controllers/authController");

// Student Register (form-data)
router.post("/register", upload.single("profileImage"), registerUser);

// Admin Register (form-data)
router.post("/admin-register", upload.single("profileImage"), registerUser);

// Login
router.post("/login", loginUser);

// Get logged user
router.get("/me", auth, async (req, res) => {
  try {
    const Admin = require("../models/Admin");
    const Student = require("../models/Student");

    let user = await Admin.findById(req.user.id);
    if (!user) user = await Student.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error("Error in /auth/me:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
