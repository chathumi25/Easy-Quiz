// StdQuiz.jsx
import React, { useState, useEffect, useRef } from "react";
import StudentNavbar from "../../components/layouts/StudentNavbar";
import "../../index.css";
import "../../student.css";
import {
  FaQuestionCircle,
  FaPlay,
  FaCheckCircle,
  FaClock,
  FaRedoAlt,
  FaEye,
  FaTimes,
  FaExpand,
  FaCompress,
} from "react-icons/fa";

const ADMIN_QUIZ_KEY = "easyquiz_admin_quizzes_v3";
const ATTEMPT_KEY = "easyquiz_student_quiz_attempts_v1";
const INPROG_KEY = "easyquiz_student_inprogress_v1"; // saves current in-progress attempt (resume)

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
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isFullScreenMode, setIsFullScreenMode] = useState(false);

  // Utility: shuffle in-place (Fisher-Yates)
  const shuffleArray = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  // Load quizzes (admin)
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

  // Load attempts
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

  // Persist attempts
  useEffect(() => {
    localStorage.setItem(ATTEMPT_KEY, JSON.stringify(attempts));
  }, [attempts]);

  // Dynamic navbar height
  useEffect(() => {
    const updateHeight = () => {
      if (navbarRef.current) setNavbarHeight(navbarRef.current.offsetHeight);
    };
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  // Filter quizzes by grade & subject
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

  // Extract available grades & subjects
  const uniqueGrades = [...new Set(quizzes.map((q) => q.grade))];
  const subjectsForGrade = quizzes
    .filter((q) => q.grade === selectedGrade)
    .map((q) => q.subject)
    .filter((v, i, a) => a.indexOf(v) === i);

  // ----- Resume in-progress attempt if any -----
  useEffect(() => {
    const raw = localStorage.getItem(INPROG_KEY);
    if (raw) {
      try {
        const inprog = JSON.parse(raw);
        // If there is a valid in-progress item and quiz still exists or included in saved object:
        if (inprog && inprog.quiz && inprog.startedAt) {
          // restore
          setSelectedQuiz(inprog.quiz);
          setIsAttempting(true);
          setCurrentIndex(inprog.currentIndex ?? 0);
          setAnswers(inprog.answers ?? {});
          setRemainingSeconds(inprog.remainingSeconds ?? inprog.quiz.durationSeconds ?? 0);
          setShowResult(false);
          setReviewMode(false);
          // small delay to avoid overlap with navbar height setting
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      } catch {
        // ignore
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save in-progress attempt to localStorage whenever relevant changes
  useEffect(() => {
    if (!isAttempting || !selectedQuiz) {
      localStorage.removeItem(INPROG_KEY);
      return;
    }
    const payload = {
      quiz: selectedQuiz,
      currentIndex,
      answers,
      remainingSeconds,
      startedAt: Date.now(),
    };
    localStorage.setItem(INPROG_KEY, JSON.stringify(payload));
  }, [isAttempting, selectedQuiz, currentIndex, answers, remainingSeconds]);

  // Prevent leaving while attempting (warning)
  useEffect(() => {
    const handleBefore = (e) => {
      if (isAttempting) {
        e.preventDefault();
        e.returnValue = "You have an in-progress quiz. Are you sure you want to leave?";
        return e.returnValue;
      }
    };
    window.addEventListener("beforeunload", handleBefore);
    return () => window.removeEventListener("beforeunload", handleBefore);
  }, [isAttempting]);

  // Timer effect for countdown only when attempting
  useEffect(() => {
    if (!isAttempting || remainingSeconds <= 0) return;
    const interval = setInterval(() => {
      setRemainingSeconds((s) => {
        if (s <= 1) {
          clearInterval(interval);
          // Auto finish when time is up
          finishQuiz(true); // auto flag
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAttempting, remainingSeconds]);

  // Format seconds to mm:ss
  const formatTime = (sec = 0) => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // Prepare quiz for attempt: randomize questions & answers, and set timer
  const prepareQuizForAttempt = (quiz) => {
    // deep clone to avoid mutating original admin data
    const qcopy = JSON.parse(JSON.stringify(quiz));

    // randomize question order
    qcopy.questions = shuffleArray(qcopy.questions || []).map((q) => {
      // for each question, build options array and shuffle, but we keep label mapping
      // We'll convert to option object { key: 'a'|'b'..., text, originalKey } to allow shuffled ordering
      const opts = ["a", "b", "c", "d"].filter((k) => q[k] !== undefined);
      const optObjs = shuffleArray(
        opts.map((k) => ({ key: k, text: q[k] }))
      );
      // store the shuffled options as field 'shuffledOptions' and keep 'correct' as original key
      return {
        ...q,
        shuffledOptions: optObjs, // array of {key, text}
      };
    });

    // default duration: try quiz.durationMinutes else 10 min
    const durationSeconds =
      (typeof qcopy.durationMinutes === "number" ? qcopy.durationMinutes : 10) * 60;

    // attach durationSeconds for resume
    qcopy.durationSeconds = durationSeconds;

    return qcopy;
  };

  // Start quiz (shuffles, sets timer)
  const startQuiz = (quiz) => {
    const prepared = prepareQuizForAttempt(quiz);
    setSelectedQuiz(prepared);
    setIsAttempting(true);
    setCurrentIndex(0);
    setAnswers({});
    setShowResult(false);
    setReviewMode(false);
    setRemainingSeconds(prepared.durationSeconds ?? 600);
    // save inprogress will be triggered by effect
    // scroll into view on mobile
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Retry quiz: we start a fresh attempt of the same quiz (reshuffle)
  const retryQuiz = (attemptOrQuiz) => {
    // attemptOrQuiz may be attempt object (from attempts list) or quiz object
    // find original quiz by quizId if available
    let original = null;
    if (attemptOrQuiz && attemptOrQuiz.quizId) {
      original = quizzes.find((q) => q.id === attemptOrQuiz.quizId);
    } else if (attemptOrQuiz && attemptOrQuiz.id && attemptOrQuiz.questions) {
      // already a quiz object
      original = attemptOrQuiz;
    }
    // fallback: use selectedQuiz
    if (!original) original = selectedQuiz;
    if (original) startQuiz(original);
  };

  // Handle selecting an answer (stores using original question id and option key)
  const handleAnswer = (qid, choiceKey) => {
    setAnswers((prev) => ({ ...prev, [qid]: choiceKey }));
    // autosave to localStorage via effect
  };

  // Next or finish
  const nextQuestion = () => {
    if (!selectedQuiz) return;
    if (currentIndex < selectedQuiz.questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      finishQuiz();
    }
  };

  // Finish quiz: calculates score, stores attempt, clears in-progress
  // autoFlag - true if auto-submitted by timer
  const finishQuiz = (autoFlag = false) => {
    if (!selectedQuiz) return;
    const total = selectedQuiz.questions.length;
    let correct = 0;
    const reviewed = selectedQuiz.questions.map((q) => {
      // selected answers stored in answers keyed by q.id; correct stored as original key in q.correct
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
      timeTakenSeconds:
        (selectedQuiz.durationSeconds ?? 0) - (remainingSeconds ?? 0),
      autoSubmitted: !!autoFlag,
    };

    setAttempts((prev) => [attempt, ...prev.slice(0, 3)]);
    setScoreDetails(attempt);
    setReviewQuestions(reviewed);
    setShowResult(true);
    setIsAttempting(false);
    setSelectedQuiz(null);
    setRemainingSeconds(0);
    // clear in-progress
    localStorage.removeItem(INPROG_KEY);
    // scroll to result
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Stats calculations
  const totalQuizzes = quizzes.length;
  const totalAttempts = attempts.length;
  const avgScore =
    totalAttempts > 0
      ? Math.round(attempts.reduce((sum, a) => sum + a.score, 0) / totalAttempts)
      : 0;
  const recentAttempts = attempts.slice(0, 4);

  // Full-screen mode (CSS-based)
  const toggleFullScreenMode = () => {
    setIsFullScreenMode((s) => !s);
    // attempt true fullscreen if available (optional)
    try {
      if (!isFullScreenMode && document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    } catch {
      // ignore
    }
  };

  // Render answer options - uses shuffledOptions if present (for randomized order)
  const renderOptions = (q) => {
    const opts = q.shuffledOptions || ["a", "b", "c", "d"].map((k) => ({ key: k, text: q[k] }));
    return opts.map((optObj) => {
      const optKey = optObj.key;
      const optText = optObj.text;
      const selectedChoice = answers[q.id];
      const isSelected = selectedChoice === optKey;
      return (
        <div
          key={optKey}
          className={`p-3 mb-2 rounded-md cursor-pointer border transition flex items-start gap-3 ${
            isSelected ? "bg-indigo-100 border-indigo-400" : "bg-white border-gray-200 hover:bg-indigo-50"
          }`}
          onClick={() => handleAnswer(q.id, optKey)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") handleAnswer(q.id, optKey);
          }}
        >
          <div className="min-w-[36px] flex items-center justify-center font-semibold text-indigo-700">
            {optKey.toUpperCase()}.
          </div>
          <div className="text-gray-800 break-words">{optText}</div>
        </div>
      );
    });
  };

  return (
    <div className={`min-h-screen flex flex-col app-background ${isFullScreenMode ? "h-screen overflow-hidden" : ""}`}>
      {/* Navbar */}
      <header ref={navbarRef} className="w-full fixed top-0 left-0 z-50">
        <StudentNavbar />
      </header>

      {/* Main */}
      <main
        className={`flex-1 p-4 md:p-8 overflow-y-auto transition-all duration-300 ${isFullScreenMode ? "pt-4" : ""}`}
        style={{ paddingTop: `${navbarHeight + 80}px` }}
      >
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-indigo-700 mb-6">My Quizzes</h1>

          {/* Dashboard Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="student-card p-4 text-center">
              <h4 className="text-sm text-indigo-600 font-semibold">Available</h4>
              <p className="text-2xl md:text-3xl font-bold text-indigo-800">{totalQuizzes}</p>
            </div>
            <div className="student-card p-4 text-center">
              <h4 className="text-sm text-indigo-600 font-semibold">Attempts</h4>
              <p className="text-2xl md:text-3xl font-bold text-indigo-800">{totalAttempts}</p>
            </div>
            <div className="student-card p-4 text-center">
              <h4 className="text-sm text-indigo-600 font-semibold">Avg Score</h4>
              <p className="text-2xl md:text-3xl font-bold text-indigo-800">{avgScore}%</p>
            </div>
          </div>

          {/* Recent Attempts */}
          {recentAttempts.length > 0 && (
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-indigo-700 mb-3 flex items-center gap-2">
                <FaClock /> Recent Attempts
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {recentAttempts.map((a) => (
                  <div key={a.id} className="p-4 bg-white/95 border border-indigo-100 rounded-xl shadow-sm">
                    <h4 className="font-bold text-indigo-700">{a.title}</h4>
                    <p className="text-gray-700 text-sm">
                      {a.subject} — {a.grade}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Score:{" "}
                      <span
                        className={`font-bold ${
                          a.score >= 70 ? "text-green-600" : a.score >= 40 ? "text-yellow-600" : "text-red-600"
                        }`}
                      >
                        {a.score}%
                      </span>
                    </p>
                    <p className="text-xs text-gray-500 mt-2">{a.date}</p>
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => retryQuiz(a)}
                        className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-md text-sm"
                      >
                        <FaRedoAlt className="inline mr-2" />
                        Retry
                      </button>
                      <button
                        onClick={() => {
                          // attempt to review if we have local quiz object (not always available)
                          // here we only open review from stored reviewQuestions if possible
                          // (not stored in attempt), so try to find matching local attempt saved - skipping for now
                        }}
                        className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md text-sm"
                      >
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Grade & Subject Selectors */}
          <div className="flex flex-col md:flex-row gap-4 mb-6 items-start">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <label className="font-semibold text-indigo-700 min-w-[100px]">Select Grade:</label>
              <select
                value={selectedGrade}
                onChange={(e) => {
                  setSelectedGrade(e.target.value);
                  setSelectedSubject("");
                }}
                className="p-2 border border-indigo-200 rounded-md bg-white w-full md:w-auto"
              >
                <option value="">-- Select Grade --</option>
                {uniqueGrades.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            {selectedGrade && (
              <div className="flex items-center gap-3 w-full md:w-auto">
                <label className="font-semibold text-indigo-700 min-w-[110px]">Select Subject:</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="p-2 border border-indigo-200 rounded-md bg-white w-full md:w-auto"
                >
                  <option value="">-- Select Subject --</option>
                  {subjectsForGrade.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
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
                <p className="text-gray-500">No quizzes found for this Grade and Subject.</p>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredQuizzes.map((quiz) => (
                    <div
                      key={quiz.id}
                      className="p-4 md:p-6 bg-white/90 border border-indigo-100 rounded-xl shadow-md hover:shadow-lg transition"
                    >
                      <h3 className="text-xl font-bold text-indigo-800 mb-1">{quiz.title}</h3>
                      <p className="text-gray-600 text-sm mb-2">
                        {quiz.grade} → {quiz.subject} → {quiz.unit}
                      </p>
                      <p className="text-gray-700 text-sm mb-4">{quiz.description}</p>
                      <div className="flex gap-3 items-center">
                        <button
                          onClick={() => startQuiz(quiz)}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center gap-2"
                        >
                          <FaPlay /> Start Quiz
                        </button>
                        <div className="text-sm text-gray-500">Duration: {quiz.durationMinutes ?? 10} min</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Attempt Mode */}
          {isAttempting && selectedQuiz && (
            <div
              className={`bg-white/95 p-4 md:p-8 rounded-2xl border border-indigo-100 shadow-xl mt-6 ${
                isFullScreenMode ? "fixed inset-0 z-50 overflow-y-auto" : ""
              }`}
            >
              <div className="flex justify-between items-start gap-3 mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-indigo-800 mb-1">{selectedQuiz.title}</h2>
                  <p className="text-gray-600 mb-1">
                    {selectedQuiz.grade} → {selectedQuiz.subject} → {selectedQuiz.unit}
                  </p>
                  <p className="text-sm text-gray-500">
                    Question {currentIndex + 1} of {selectedQuiz.questions.length}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Time Left</div>
                    <div className="text-lg font-bold text-indigo-700 flex items-center gap-2">
                      <FaClock />
                      <span>{formatTime(remainingSeconds)}</span>
                    </div>
                  </div>

                  <button
                    onClick={toggleFullScreenMode}
                    className="p-2 bg-indigo-50 text-indigo-700 rounded-md"
                    title="Toggle fullscreen"
                  >
                    {isFullScreenMode ? <FaCompress /> : <FaExpand />}
                  </button>
                </div>
              </div>

              {/* question container */}
              {selectedQuiz.questions.length === 0 ? (
                <p className="text-gray-500">No questions available.</p>
              ) : (
                <>
                  <div className="mb-4">
                    {/* Question text */}
                    <p className="text-gray-800 text-base md:text-lg mb-3 break-words">
                      {selectedQuiz.questions[currentIndex].text}
                    </p>

                    {/* question image (if present) */}
                    {selectedQuiz.questions[currentIndex].image && (
                      <div className="mb-3">
                        <img
                          src={selectedQuiz.questions[currentIndex].image}
                          alt="question"
                          className="max-w-full h-auto rounded-md border"
                        />
                      </div>
                    )}

                    {/* options */}
                    <div>{renderOptions(selectedQuiz.questions[currentIndex])}</div>
                  </div>

                  <div className="flex flex-col md:flex-row justify-between items-center gap-3 mt-4">
                    <div className="text-sm text-gray-600">
                      Selected:{" "}
                      <strong className="text-indigo-700">
                        {answers[selectedQuiz.questions[currentIndex].id]
                          ? answers[selectedQuiz.questions[currentIndex].id].toUpperCase()
                          : "—"}
                      </strong>
                    </div>

                    <div className="flex gap-3 w-full md:w-auto">
                      <button
                        onClick={() => {
                          // go prev
                          if (currentIndex > 0) setCurrentIndex((p) => p - 1);
                        }}
                        disabled={currentIndex === 0}
                        className="flex-1 md:flex-none px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-60"
                      >
                        Previous
                      </button>

                      <button
                        onClick={nextQuestion}
                        className="flex-1 md:flex-none px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-md hover:scale-105 transition"
                      >
                        {currentIndex < selectedQuiz.questions.length - 1 ? "Next" : "Finish Quiz"}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Show Result */}
          {showResult && scoreDetails && !reviewMode && (
            <div className="bg-white/95 p-6 md:p-8 rounded-2xl border border-indigo-100 shadow-xl text-center mt-6">
              <h2 className="text-2xl font-bold text-indigo-700 mb-3">Quiz Completed!</h2>
              <p className="text-gray-700 mb-2">{scoreDetails.title}</p>
              <p className="text-3xl font-extrabold text-indigo-800 mb-3">{scoreDetails.score}%</p>
              <p className="text-gray-600 mb-4">
                You got <strong className="text-indigo-700">{scoreDetails.correct}</strong> out of {scoreDetails.total} correct.
              </p>

              <div className="flex flex-col md:flex-row justify-center gap-3">
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
            <div className="bg-white/95 p-4 md:p-8 rounded-2xl border border-indigo-100 shadow-xl mt-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-indigo-700">Review Answers — {scoreDetails?.title}</h2>
                <button onClick={() => setReviewMode(false)} className="p-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition">
                  <FaTimes />
                </button>
              </div>

              {reviewQuestions.map((q, idx) => (
                <div key={q.id} className="mb-4 p-4 border border-indigo-100 rounded-xl bg-white shadow-sm">
                  <h3 className="text-lg font-semibold text-indigo-800 mb-2">
                    Q{idx + 1}. {q.text}
                  </h3>

                  {q.image && (
                    <div className="mb-2">
                      <img src={q.image} alt={`q${idx + 1}`} className="max-w-full h-auto rounded" />
                    </div>
                  )}

                  <ul className="space-y-2">
                    {(q.shuffledOptions || ["a", "b", "c", "d"].map((k) => ({ key: k, text: q[k] }))).map((opt) => {
                      const optKey = opt.key;
                      const isCorrect = q.correct === optKey;
                      const isSelected = q.selected === optKey;
                      return (
                        <li
                          key={optKey}
                          className={`p-2 rounded-md border ${
                            isCorrect ? "bg-green-50 border-green-300" : isSelected ? "bg-red-50 border-red-300" : "bg-white border-gray-200"
                          }`}
                        >
                          <strong>{optKey.toUpperCase()}.</strong> {opt.text}
                          {isCorrect && <FaCheckCircle className="inline ml-2 text-green-600" />}
                          {isSelected && !isCorrect && <span className="ml-2 text-red-500 font-semibold">(Your Answer)</span>}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default StdQuiz;
