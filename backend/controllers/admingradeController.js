// backend/controllers/gradeController.js
const Student = require("../models/Student");

// GET ALL GRADES WITH STUDENT COUNT
exports.getAllGrades = async (req, res) => {
  try {
    const grades = await Student.aggregate([
      {
        $group: {
          _id: "$grade",
          studentCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    return res.json({
      success: true,
      grades,
    });

  } catch (err) {
    console.error("Get grades error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to load grades",
    });
  }
};

// GET STUDENTS BY GRADE
exports.getStudentsByGrade = async (req, res) => {
  try {
    const { grade } = req.params;

    const students = await Student.find({ grade }).select("-password");

    return res.json({
      success: true,
      grade,
      students,
    });

  } catch (err) {
    console.error("Get students error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch students",
    });
  }
};
