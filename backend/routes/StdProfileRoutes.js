// backend/routes/StdProfileRoutes.js
const express = require("express");
const router = express.Router();

const { auth, studentOnly } = require("../middlewere/authMiddleware");
const upload = require("../middlewere/upload");
const Student = require("../models/Student");

console.log("📌 StdProfileRoutes.js LOADED SUCCESSFULLY");

// -------------------------------------------
// GET PROFILE
// -------------------------------------------
router.get("/", auth, studentOnly, async (req, res) => {
  try {
    const student = await Student.findById(req.user.id).select("-password");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    return res.json({
      success: true,
      message: "Student profile fetched",
      user: student,
    });
  } catch (err) {
    console.error("GET profile error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// -------------------------------------------
// UPDATE NAME + GRADE
// -------------------------------------------
router.put("/update", auth, studentOnly, async (req, res) => {
  try {
    const { name, grade } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (grade !== undefined) updateData.grade = grade;

    const updated = await Student.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true }
    ).select("-password");

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    return res.json({
      success: true,
      message: "Profile updated",
      user: updated,
    });
  } catch (err) {
    console.error("UPDATE profile error:", err);
    return res.status(500).json({
      success: false,
      message: "Update failed",
    });
  }
});

// -------------------------------------------
// UPDATE PROFILE IMAGE
// -------------------------------------------
router.put(
  "/update-image",
  auth,
  studentOnly,
  upload.single("profileImage"),
  async (req, res) => {
    try {
      const imgPath = req.file ? `/uploads/${req.file.filename}` : "";

      const updated = await Student.findByIdAndUpdate(
        req.user.id,
        { profileImage: imgPath },
        { new: true }
      ).select("-password");

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: "Student not found",
        });
      }

      return res.json({
        success: true,
        message: "Image updated",
        user: updated,
        profileImage: updated.profileImage,
      });
    } catch (err) {
      console.error("UPDATE image error:", err);
      return res.status(500).json({
        success: false,
        message: "Image update failed",
      });
    }
  }
);

// -------------------------------------------
// REMOVE IMAGE
// -------------------------------------------
router.delete("/remove-image", auth, studentOnly, async (req, res) => {
  try {
    const updated = await Student.findByIdAndUpdate(
      req.user.id,
      { profileImage: "" },
      { new: true }
    ).select("-password");

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    return res.json({
      success: true,
      message: "Profile image removed",
      user: updated,
    });
  } catch (err) {
    console.error("REMOVE image error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to remove image",
    });
  }
});

// -------------------------------------------
// CHANGE PASSWORD
// -------------------------------------------
router.put("/change-password", auth, studentOnly, async (req, res) => {
  const bcrypt = require("bcryptjs");

  try {
    const { currentPassword, newPassword } = req.body;

    const student = await Student.findById(req.user.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const matched = await bcrypt.compare(currentPassword, student.password);

    if (!matched) {
      return res.status(400).json({
        success: false,
        message: "Incorrect current password",
      });
    }

    student.password = await bcrypt.hash(newPassword, 10);
    await student.save();

    return res.json({
      success: true,
      message: "Password updated",
    });
  } catch (err) {
    console.error("CHANGE password error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to change password",
    });
  }
});

// -------------------------------------------
// DELETE ACCOUNT
// -------------------------------------------
router.delete("/delete-account", auth, studentOnly, async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.user.id);

    return res.json({
      success: true,
      message: "Account deleted",
    });
  } catch (err) {
    console.error("DELETE account error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to delete account",
    });
  }
});

module.exports = router;
