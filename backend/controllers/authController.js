// backend/controllers/authController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Admin = require("../models/Admin");
const Student = require("../models/Student");

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// REGISTER USER
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, adminKey, grade } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    let role = "student";

    if (adminKey) {
      if (adminKey !== process.env.ADMIN_KEY) {
        return res
          .status(401)
          .json({ success: false, message: "Invalid admin key" });
      }
      role = "admin";
    }

    const model = role === "admin" ? Admin : Student;

    const exists = await model.findOne({ email });
    if (exists) {
      return res
        .status(400)
        .json({ success: false, message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const profileImage = req.file ? `/uploads/${req.file.filename}` : "";

    const newUser = {
      name,
      email,
      password: hashedPassword,
      role,
      profileImage,
    };

    if (role === "student") {
      newUser.grade = grade || "";
    }

    await model.create(newUser);

    return res.status(201).json({
      success: true,
      message: `${role} registered successfully`,
    });
  } catch (error) {
    console.error("Register Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error" });
  }
};

// LOGIN USER
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    let user = await Admin.findOne({ email });
    let role = "admin";

    if (!user) {
      user = await Student.findOne({ email });
      role = "student";
    }

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    const matched = await bcrypt.compare(password, user.password);
    if (!matched) {
      return res.status(400).json({
        success: false,
        message: "Incorrect password",
      });
    }

    const token = generateToken(user);

    return res.json({
      success: true,
      message: `${role} login successful`,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        grade: user.grade || "",
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error" });
  }
};
