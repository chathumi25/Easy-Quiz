// backend/routes/AdmSubjectRoutes.js
const express = require("express");
const router = express.Router();

const {
  getSubjectsByGrade,
  addSubject,
  removeSubject,
  addUnit,
  removeUnit,
} = require("../controllers/admSubjectController");

// GET subjects by gradeId
router.get("/", getSubjectsByGrade);

// ADD subject
router.post("/add", addSubject);

// REMOVE subject
router.post("/remove", removeSubject);

// ADD unit
router.post("/add-unit", addUnit);

// REMOVE unit
router.post("/remove-unit", removeUnit);

module.exports = router;
