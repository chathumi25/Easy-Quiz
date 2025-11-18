// backend/controllers/gradeController.js
const Grade = require("../models/Grade");
const Student = require("../models/Student");
const bcrypt = require("bcryptjs");

// ----------------------------
// GET GRADES + student counts
// ----------------------------
exports.getGrades = async (req, res) => {
  try {
    const grades = await Grade.find().lean();
    const students = await Student.find().lean();

    // attach student counts + list
    const synced = grades.map((g) => {
      const st = students.filter(
        (s) => String(s.grade).trim() === String(g.name).trim()
      );

      return {
        ...g,
        students: st.map((s) => ({
          studentId: s._id,
          name: s.name,
          email: s.email,
          registeredAt: s.createdAt,
        })),
      };
    });

    return res.json({
      success: true,
      grades: synced,
    });
  } catch (err) {
    console.error("GET GRADES ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to load grades",
    });
  }
};

// ----------------------------
// ADD GRADE
// ----------------------------
exports.addGrade = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Grade name is required",
      });
    }

    const exists = await Grade.findOne({ name });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Grade already exists",
      });
    }

    const created = await Grade.create({ name });

    return res.json({
      success: true,
      message: "Grade added",
      grade: created,
    });
  } catch (err) {
    console.error("ADD GRADE ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to add grade",
    });
  }
};

// ----------------------------
// REMOVE GRADE
// ----------------------------
exports.removeGrade = async (req, res) => {
  try {
    const { name } = req.body;

    const removed = await Grade.findOneAndDelete({ name });
    if (!removed) {
      return res.status(404).json({
        success: false,
        message: "Grade not found",
      });
    }

    return res.json({
      success: true,
      message: "Grade removed",
    });
  } catch (err) {
    console.error("REMOVE GRADE ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to remove grade",
    });
  }
};

// ----------------------------
// ADMIN — ADD STUDENT
// Adds into Student collection + Grade.students[]
// ----------------------------
exports.addStudent = async (req, res) => {
  try {
    const { gradeName, name, email } = req.body;

    if (!gradeName || !name || !email) {
      return res.status(400).json({
        success: false,
        message: "Missing fields",
      });
    }

    const grade = await Grade.findOne({ name: gradeName });
    if (!grade) {
      return res.status(404).json({
        success: false,
        message: "Grade not found",
      });
    }

    // ❗ Check duplicate student email
    const existsStudent = await Student.findOne({ email });
    if (existsStudent) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    // generate password
    const plainPassword = Math.random().toString(36).slice(-8);
    const hashed = await bcrypt.hash(plainPassword, 10);

    // 1️⃣ CREATE Student in Student collection
    const student = await Student.create({
      name,
      email,
      grade: gradeName,
      password: hashed,
      role: "student",
    });

    // 2️⃣ PUSH inside Grade collection
    grade.students.push({
      studentId: student._id.toString(),
      name,
      email,
      registeredAt: new Date(),
    });

    await grade.save();

    return res.json({
      success: true,
      message: "Student created successfully",
      student,
      grade,
      login: {
        email,
        password: plainPassword,
      },
    });
  } catch (err) {
    console.error("ADD STUDENT ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to add student",
    });
  }
};

// ----------------------------
// ADMIN — REMOVE STUDENT
// Remove from Student collection + Grade.students[]
// ----------------------------
exports.removeStudent = async (req, res) => {
  try {
    const { gradeName, studentId } = req.body;

    const grade = await Grade.findOne({ name: gradeName });
    if (!grade) {
      return res.status(404).json({
        success: false,
        message: "Grade not found",
      });
    }

    // 1️⃣ Remove from Grade collection
    grade.students = grade.students.filter(
      (s) => s.studentId.toString() !== studentId
    );
    await grade.save();

    // 2️⃣ Remove from Student collection
    await Student.findByIdAndDelete(studentId);

    return res.json({
      success: true,
      message: "Student removed",
      grade,
    });
  } catch (err) {
    console.error("REMOVE STUDENT ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to remove student",
    });
  }
};
