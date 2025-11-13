import React, { useState, useEffect, useRef } from "react";
import StudentNavbar from "../../components/layouts/StudentNavbar";
import "../../index.css";
import "../../student.css";
import {
  FaQuestionCircle,
  FaPlay,
  FaCheckCircle,
  FaClock,
  FaChartLine,
  FaTrophy,
  FaRedoAlt,
  FaEye,
  FaTimes,
} from "react-icons/fa";

const ADMIN_QUIZ_KEY = "easyquiz_admin_quizzes_v3";
const ATTEMPT_KEY = "easyquiz_student_quiz_attempts_v1";

function StdQuiz() {
  const navbarRef = useRef(null);
  const [navbarHeight, setNavbarHeight] = useState(85);
  const [quizzes, setQuizzes] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [filteredQuizzes, setFilteredQuizzes] = useState([]);
  const [isAttempting, setIsAttempting] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [scoreDetails, setScoreDetails] = useState(null);
  const [reviewMode, setReviewMode] = useState(false);
  const [reviewQuestions, setReviewQuestions] = useState([]);

  // ✅ Load quizzes from admin
  useEffect(() => {
    const raw = localStorage.getItem(ADMIN_QUIZ_KEY);
    if (raw) {
      try {
        setQuizzes(JSON.parse(raw));
      } catch {
        console.warn("Invalid quiz data");
      }
    }
  }, []);

  // ✅ Load student attempts
  useEffect(() => {
    const raw = localStorage.getItem(ATTEMPT_KEY);
    if (raw) {
      try {
        setAttempts(JSON.parse(raw));
      } catch {
        console.warn("Invalid attempt data");
      }
    }
  }, []);

  // ✅ Save attempts
  useEffect(() => {
    localStorage.setItem(ATTEMPT_KEY, JSON.stringify(attempts));
  }, [attempts]);

  // ✅ Dynamic navbar height
  useEffect(() => {
    const updateHeight = () => {
      if (navbarRef.current) setNavbarHeight(navbarRef.current.offsetHeight);
    };
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  // ✅ Filter quizzes by grade & subject
  useEffect(() => {
    if (selectedGrade && selectedSubject) {
      const filtered = quizzes.filter(
        (q) => q.grade === selectedGrade && q.subject === selectedSubject
      );
      setFilteredQuizzes(filtered);
    } else {
      setFilteredQuizzes([]);
    }
  }, [selectedGrade, selectedSubject, quizzes]);

  // ✅ Extract available grades & subjects
  const uniqueGrades = [...new Set(quizzes.map((q) => q.grade))];
  const subjectsForGrade = quizzes
    .filter((q) => q.grade === selectedGrade)
    .map((q) => q.subject)
    .filter((v, i, a) => a.indexOf(v) === i);

  // ✅ Start quiz
  const startQuiz = (quiz) => {
    setSelectedQuiz(quiz);
    setIsAttempting(true);
    setCurrentIndex(0);
    setAnswers({});
    setShowResult(false);
    setReviewMode(false);
  };

  // ✅ Handle answer
  const handleAnswer = (qid, choice) => {
    setAnswers((prev) => ({ ...prev, [qid]: choice }));
  };

  // ✅ Next or finish
  const nextQuestion = () => {
    if (currentIndex < selectedQuiz.questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      finishQuiz();
    }
  };

  // ✅ Finish quiz
  const finishQuiz = () => {
    const total = selectedQuiz.questions.length;
    let correct = 0;
    const reviewed = selectedQuiz.questions.map((q) => {
      const selected = answers[q.id];
      const isCorrect = selected === q.correct;
      if (isCorrect) correct++;
      return { ...q, selected, isCorrect };
    });

    const score = Math.round((correct / total) * 100);

    const attempt = {
      id: Date.now(),
      quizId: selectedQuiz.id,
      title: selectedQuiz.title,
      grade: selectedQuiz.grade,
      subject: selectedQuiz.subject,
      unit: selectedQuiz.unit,
      score,
      total,
      correct,
      date: new Date().toLocaleString(),
    };

    setAttempts((prev) => [attempt, ...prev.slice(0, 3)]);
    setScoreDetails(attempt);
    setReviewQuestions(reviewed);
    setShowResult(true);
    setIsAttempting(false);
    setSelectedQuiz(null);
  };

  // ✅ Retry
  const retryQuiz = (quiz) => startQuiz(quiz);

  // ✅ Stats
  const totalQuizzes = quizzes.length;
  const totalAttempts = attempts.length;
  const avgScore =
    totalAttempts > 0
      ? Math.round(
          attempts.reduce((sum, a) => sum + a.score, 0) / totalAttempts
        )
      : 0;
  const recentAttempts = attempts.slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col app-background">
      {/* Navbar */}
      <header ref={navbarRef} className="w-full fixed top-0 left-0 z-50">
        <StudentNavbar />
      </header>

      {/* Main */}
      <main
        className="flex-1 p-8 overflow-y-auto transition-all duration-500"
        style={{ paddingTop: `${navbarHeight + 80}px` }}
      >
        <h1 className="text-3xl font-bold text-indigo-700 mb-6">My Quizzes</h1>

        {/* Dashboard Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="student-card p-5 text-center">
            <h4 className="text-sm text-indigo-600 font-semibold">Available</h4>
            <p className="text-3xl font-bold text-indigo-800">{totalQuizzes}</p>
          </div>
          <div className="student-card p-5 text-center">
            <h4 className="text-sm text-indigo-600 font-semibold">Attempts</h4>
            <p className="text-3xl font-bold text-indigo-800">{totalAttempts}</p>
          </div>
          <div className="student-card p-5 text-center">
            <h4 className="text-sm text-indigo-600 font-semibold">Avg Score</h4>
            <p className="text-3xl font-bold text-indigo-800">{avgScore}%</p>
          </div>
        </div>

        {/* Recent Attempts */}
        {recentAttempts.length > 0 && (
          <div className="mb-10">
            <h2 className="text-2xl font-semibold text-indigo-700 mb-4 flex items-center gap-2">
              <FaClock /> Recent Attempts
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {recentAttempts.map((a) => (
                <div
                  key={a.id}
                  className="p-5 bg-white/90 border border-indigo-100 rounded-xl shadow-md hover:shadow-lg transition"
                >
                  <h4 className="font-bold text-indigo-700">{a.title}</h4>
                  <p className="text-gray-700 text-sm">
                    {a.subject} — {a.grade}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Score:{" "}
                    <span
                      className={`font-bold ${
                        a.score >= 70
                          ? "text-green-600"
                          : a.score >= 40
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}
                    >
                      {a.score}%
                    </span>
                  </p>
                  <p className="text-xs text-gray-500 mt-2">{a.date}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Grade & Subject Selectors */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex items-center gap-3">
            <label className="font-semibold text-indigo-700">Select Grade:</label>
            <select
              value={selectedGrade}
              onChange={(e) => {
                setSelectedGrade(e.target.value);
                setSelectedSubject("");
              }}
              className="p-2 border border-indigo-200 rounded-md bg-white"
            >
              <option value="">-- Select Grade --</option>
              {uniqueGrades.map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
          </div>

          {selectedGrade && (
            <div className="flex items-center gap-3">
              <label className="font-semibold text-indigo-700">
                Select Subject:
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="p-2 border border-indigo-200 rounded-md bg-white"
              >
                <option value="">-- Select Subject --</option>
                {subjectsForGrade.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Filtered Quizzes */}
        {!isAttempting && !showResult && !reviewMode && selectedGrade && selectedSubject && (
          <>
            <h2 className="text-2xl font-semibold text-indigo-700 mb-4 flex items-center gap-2">
              <FaQuestionCircle /> Available Quizzes
            </h2>

            {filteredQuizzes.length === 0 ? (
              <p className="text-gray-500">
                No quizzes found for this Grade and Subject.
              </p>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredQuizzes.map((quiz) => (
                  <div
                    key={quiz.id}
                    className="p-5 bg-white/80 border border-indigo-100 rounded-xl shadow-md hover:shadow-lg transition"
                  >
                    <h3 className="text-xl font-bold text-indigo-800 mb-1">
                      {quiz.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-2">
                      {quiz.grade} → {quiz.subject} → {quiz.unit}
                    </p>
                    <p className="text-gray-700 text-sm mb-4">
                      {quiz.description}
                    </p>
                    <button
                      onClick={() => startQuiz(quiz)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                      <FaPlay className="inline mr-1" /> Start Quiz
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Attempt Mode */}
        {isAttempting && selectedQuiz && (
          <div className="bg-white/90 p-8 rounded-2xl border border-indigo-100 shadow-xl">
            <h2 className="text-2xl font-bold text-indigo-800 mb-4">
              {selectedQuiz.title}
            </h2>
            <p className="text-gray-600 mb-6">
              {selectedQuiz.grade} → {selectedQuiz.subject} → {selectedQuiz.unit}
            </p>

            {selectedQuiz.questions.length === 0 ? (
              <p className="text-gray-500">No questions available.</p>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-indigo-700 mb-3">
                  Question {currentIndex + 1} of {selectedQuiz.questions.length}
                </h3>
                <p className="text-gray-800 text-base mb-3">
                  {selectedQuiz.questions[currentIndex].text}
                </p>

                {["a", "b", "c", "d"].map((opt) => (
                  <div
                    key={opt}
                    className={`p-3 mb-2 rounded-md cursor-pointer border transition ${
                      answers[selectedQuiz.questions[currentIndex].id] === opt
                        ? "bg-indigo-100 border-indigo-400"
                        : "bg-white border-gray-200 hover:bg-indigo-50"
                    }`}
                    onClick={() =>
                      handleAnswer(selectedQuiz.questions[currentIndex].id, opt)
                    }
                  >
                    <span className="font-semibold text-indigo-700 mr-2">
                      {opt.toUpperCase()}.
                    </span>
                    {selectedQuiz.questions[currentIndex][opt]}
                  </div>
                ))}

                <div className="flex justify-end mt-4">
                  <button
                    onClick={nextQuestion}
                    className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:scale-105 transition"
                  >
                    {currentIndex < selectedQuiz.questions.length - 1
                      ? "Next"
                      : "Finish Quiz"}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Show Result */}
        {showResult && scoreDetails && !reviewMode && (
          <div className="bg-white/90 p-8 rounded-2xl border border-indigo-100 shadow-xl text-center mt-10">
            <h2 className="text-2xl font-bold text-indigo-700 mb-3">
              Quiz Completed!
            </h2>
            <p className="text-gray-700 mb-4">{scoreDetails.title}</p>
            <p className="text-3xl font-extrabold text-indigo-800 mb-4">
              {scoreDetails.score}%
            </p>
            <p className="text-gray-600 mb-6">
              You got{" "}
              <strong className="text-indigo-700">
                {scoreDetails.correct}
              </strong>{" "}
              out of {scoreDetails.total} correct.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => retryQuiz(scoreDetails)}
                className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:scale-105 transition flex items-center gap-2"
              >
                <FaRedoAlt /> Retry Quiz
              </button>
              <button
                onClick={() => setReviewMode(true)}
                className="px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition flex items-center gap-2"
              >
                <FaEye /> Review Answers
              </button>
              <button
                onClick={() => setShowResult(false)}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Review Answers */}
        {reviewMode && (
          <div className="bg-white/95 p-8 rounded-2xl border border-indigo-100 shadow-xl mt-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-indigo-700">
                Review Answers — {scoreDetails?.title}
              </h2>
              <button
                onClick={() => setReviewMode(false)}
                className="p-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition"
              >
                <FaTimes />
              </button>
            </div>

            {reviewQuestions.map((q, idx) => (
              <div
                key={q.id}
                className="mb-6 p-5 border border-indigo-100 rounded-xl bg-white shadow-sm"
              >
                <h3 className="text-lg font-semibold text-indigo-800 mb-2">
                  Q{idx + 1}. {q.text}
                </h3>
                <ul className="space-y-2">
                  {["a", "b", "c", "d"].map((opt) => {
                    const isCorrect = q.correct === opt;
                    const isSelected = q.selected === opt;
                    return (
                      <li
                        key={opt}
                        className={`p-2 rounded-md border ${
                          isCorrect
                            ? "bg-green-50 border-green-300"
                            : isSelected
                            ? "bg-red-50 border-red-300"
                            : "bg-white border-gray-200"
                        }`}
                      >
                        <strong>{opt.toUpperCase()}.</strong>{" "}
                        {q[opt]}
                        {isCorrect && (
                          <FaCheckCircle className="inline ml-2 text-green-600" />
                        )}
                        {isSelected && !isCorrect && (
                          <span className="ml-2 text-red-500 font-semibold">
                            (Your Answer)
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default StdQuiz;
