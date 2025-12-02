// backend/routes/AdmQuizRoutes.js
const express = require("express");
const router = express.Router();
const admQuizController = require("../controllers/admQuizController");
const { auth, adminOnly } = require("../middlewere/authMiddleware");

// All routes protected for admins
router.use(auth);
router.use(adminOnly);

// GET all (with optional filters)
router.get("/", admQuizController.getQuizzes);

// GET single quiz
router.get("/:id", admQuizController.getQuizById);

// CREATE quiz
router.post("/", admQuizController.createQuiz);

// UPDATE quiz meta
router.put("/:id", admQuizController.updateQuiz);

// DELETE quiz
router.delete("/:id", admQuizController.deleteQuiz);

// ADD question to quiz
router.post("/:id/questions", admQuizController.addQuestion);

// UPDATE question
router.put("/:id/questions/:qId", admQuizController.updateQuestion);

// DELETE question
router.delete("/:id/questions/:qId", admQuizController.deleteQuestion);

module.exports = router;
