const mongoose = require("mongoose");

const UnitSchema = new mongoose.Schema({
  name: { type: String, required: true },
  content: { type: String, required: true },
});

const AdmSubjectSchema = new mongoose.Schema(
  {
    grade: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdmGrade", // your grade model name
      required: true,
    },
    name: { type: String, required: true },
    units: [UnitSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("AdmSubject", AdmSubjectSchema);
