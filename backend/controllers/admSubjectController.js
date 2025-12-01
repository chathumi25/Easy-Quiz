// backend/controllers/admSubjectController.js
const AdmSubject = require("../models/AdmSubject");

// GET subjects by gradeId
exports.getSubjectsByGrade = async (req, res) => {
  try {
    const { gradeId } = req.query;

    if (!gradeId) {
      return res.status(400).json({
        success: false,
        message: "gradeId is required",
      });
    }

    const subjects = await AdmSubject.find({ grade: gradeId });

    return res.json({
      success: true,
      subjects,
    });
  } catch (err) {
    console.error("GET SUBJECTS ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch subjects",
    });
  }
};

// ADD subject
exports.addSubject = async (req, res) => {
  try {
    const { gradeId, name } = req.body;

    if (!gradeId || !name) {
      return res.status(400).json({
        success: false,
        message: "gradeId and name required",
      });
    }

    const exists = await AdmSubject.findOne({ grade: gradeId, name });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Subject already exists",
      });
    }

    const subject = new AdmSubject({
      grade: gradeId,
      name,
      units: [],
    });

    await subject.save();

    return res.json({
      success: true,
      subject,
    });
  } catch (err) {
    console.error("ADD SUBJECT ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to add subject",
    });
  }
};

// REMOVE subject
exports.removeSubject = async (req, res) => {
  try {
    const { subjectId } = req.body;

    if (!subjectId) {
      return res.status(400).json({
        success: false,
        message: "subjectId is required",
      });
    }

    await AdmSubject.findByIdAndDelete(subjectId);

    return res.json({
      success: true,
      message: "Subject deleted",
    });
  } catch (err) {
    console.error("REMOVE SUBJECT ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to delete subject",
    });
  }
};

// ADD unit
exports.addUnit = async (req, res) => {
  try {
    const { subjectId, name, content } = req.body;

    const subject = await AdmSubject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found",
      });
    }

    subject.units.push({ name, content });
    await subject.save();

    return res.json({
      success: true,
      subject,
    });
  } catch (err) {
    console.error("ADD UNIT ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to add unit",
    });
  }
};

// REMOVE unit
exports.removeUnit = async (req, res) => {
  try {
    const { subjectId, unitId } = req.body;

    const subject = await AdmSubject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found",
      });
    }

    subject.units = subject.units.filter(
      (u) => String(u._id) !== String(unitId)
    );

    await subject.save();

    return res.json({
      success: true,
      subject,
    });
  } catch (err) {
    console.error("REMOVE UNIT ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to remove unit",
    });
  }
};
