// backend/models/AdminQuiz.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const QuestionSchema = new Schema(
  {
    text: { type: String, required: true },
    a: { type: String, required: true },
    b: { type: String, required: true },
    c: { type: String, required: true },
    d: { type: String, required: true },
    correct: { type: String, required: true }, // 'a' | 'b' | 'c' | 'd'
  },
  { timestamps: true }
);

const AdminQuizSchema = new Schema(
  {
    // For compatibility with your existing Grade / Subject models we store names
    grade: { type: String, required: true }, // e.g. "Grade 6"
    gradeId: { type: mongoose.Types.ObjectId, ref: "Grade", default: null }, // optional ref
    subject: { type: String, required: true }, // e.g. "Math"
    subjectId: { type: mongoose.Types.ObjectId, ref: "AdmSubject", default: null }, // optional ref
    unit: { type: String, default: "All Units" }, // e.g. "Algebra" or "All Units"

    title: { type: String, required: true },
    description: { type: String, default: "" },

    limit: { type: Number, default: 1 }, // question limit

    questions: { type: [QuestionSchema], default: [] },

    // metadata
    createdBy: { type: mongoose.Types.ObjectId, ref: "Admin", default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AdminQuiz", AdminQuizSchema);
