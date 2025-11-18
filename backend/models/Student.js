const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },

    role: { type: String, default: "student" },

    profileImage: { type: String, default: "" },

    // ⭐ ADD GRADE FIELD
    grade: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", StudentSchema);