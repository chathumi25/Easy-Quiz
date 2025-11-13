import React, { useState, useEffect, useRef } from "react";
import { FaPlus, FaTrash, FaQuestionCircle, FaSave } from "react-icons/fa";
import AdminNavbar from "../../components/layouts/AdminNavbar";
import "../../index.css";
import "../../admin.css";

const STORAGE_KEY = "easyquiz_admin_quizzes_v3";

const DEFAULT_GRADES = [
  "Grade 6",
  "Grade 7",
  "Grade 8",
  "Grade 9",
  "Grade 10",
  "Grade 11",
];

const DEFAULT_SUBJECTS = {
  "Grade 6": ["Math", "Science", "English"],
  "Grade 7": ["Math", "Biology", "History"],
  "Grade 8": ["Math", "Chemistry", "Geography"],
  "Grade 9": ["Physics", "IT", "Civic"],
  "Grade 10": ["Math", "Science", "English"],
  "Grade 11": ["Maths", "Biology", "Physics"],
};

const DEFAULT_UNITS = {
  Math: ["All Units", "Algebra", "Geometry", "Trigonometry"],
  Science: ["All Units", "Forces", "Plants", "Electricity"],
  English: ["All Units", "Grammar", "Comprehension"],
  Physics: ["All Units", "Motion", "Light", "Energy"],
  Biology: ["All Units", "Cells", "Ecology", "Genetics"],
  Chemistry: ["All Units", "Atoms", "Reactions", "Periodic Table"],
  History: ["All Units", "Ancient", "Medieval", "Modern"],
  IT: ["All Units", "Basics", "Programming", "Networking"],
  Geography: ["All Units", "Maps", "Climate", "Regions"],
  Civic: ["All Units", "Rights", "Duties", "Society"],
  Maths: ["All Units", "Algebra", "Statistics", "Geometry"],
};

const AdmQuiz = () => {
  const navbarRef = useRef(null);
  const [navbarHeight, setNavbarHeight] = useState(85);
  const [quizzes, setQuizzes] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("");
  const [quizLimit, setQuizLimit] = useState(1); // minimum 1
  const [newQuiz, setNewQuiz] = useState({ title: "", description: "" });
  const [newQuestion, setNewQuestion] = useState({
    text: "",
    a: "",
    b: "",
    c: "",
    d: "",
    correct: "",
  });
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  // ✅ Load from storage
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) setQuizzes(JSON.parse(raw));
  }, []);

  // ✅ Save to storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(quizzes));
  }, [quizzes]);

  // ✅ Navbar height tracking
  useEffect(() => {
    const updateHeight = () => {
      if (navbarRef.current) setNavbarHeight(navbarRef.current.offsetHeight);
    };
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  // ✅ Add Quiz
  const addQuiz = () => {
    if (!selectedGrade || !selectedSubject)
      return alert("Please select Grade and Subject first!");
    if (!quizLimit || quizLimit < 1)
      return alert("Set the number of questions allowed (min 1)!");
    if (!newQuiz.title.trim()) return alert("Enter quiz title!");

    const unitValue = selectedUnit || "All Units";

    const exists = quizzes.find(
      (q) =>
        q.grade === selectedGrade &&
        q.subject === selectedSubject &&
        q.unit === unitValue
    );

    if (exists) return alert("Quiz for this Grade–Subject–Unit already exists!");

    const newQz = {
      id: Date.now(),
      grade: selectedGrade,
      subject: selectedSubject,
      unit: unitValue,
      title: newQuiz.title,
      description: newQuiz.description,
      questions: [],
      limit: quizLimit,
    };
    setQuizzes([...quizzes, newQz]);
    setNewQuiz({ title: "", description: "" });
    setSelectedQuiz(newQz); // immediately select new quiz for adding questions
  };

  // ✅ Remove Quiz
  const removeQuiz = (id) => {
    if (!window.confirm("Delete this quiz?")) return;
    setQuizzes(quizzes.filter((q) => q.id !== id));
    if (selectedQuiz?.id === id) setSelectedQuiz(null);
  };

  // ✅ Add Question
  const addQuestion = () => {
    if (!selectedQuiz) return alert("Select a quiz first!");
    const quiz = quizzes.find((q) => q.id === selectedQuiz.id);

    if (
      !newQuestion.text.trim() ||
      !newQuestion.a.trim() ||
      !newQuestion.b.trim() ||
      !newQuestion.c.trim() ||
      !newQuestion.d.trim() ||
      !newQuestion.correct
    )
      return alert("Fill all fields and select correct answer!");

    if (quiz.questions.length >= quiz.limit)
      return alert(`You can only add ${quiz.limit} questions for this quiz!`);

    const updatedQuizzes = quizzes.map((q) =>
      q.id === selectedQuiz.id
        ? { ...q, questions: [...q.questions, { id: Date.now(), ...newQuestion }] }
        : q
    );

    setQuizzes(updatedQuizzes);
    setNewQuestion({ text: "", a: "", b: "", c: "", d: "", correct: "" });
    alert("✅ Question added successfully!");
  };

  const removeQuestion = (quizId, qId) => {
    const updated = quizzes.map((q) =>
      q.id === quizId
        ? { ...q, questions: q.questions.filter((que) => que.id !== qId) }
        : q
    );
    setQuizzes(updated);
  };

  const totalQuizzes = quizzes.length;
  const totalQuestions = quizzes.reduce((sum, q) => sum + q.questions.length, 0);

  return (
    <div className="min-h-screen flex flex-col app-background">
      <header ref={navbarRef} className="w-full fixed top-0 left-0 z-50">
        <AdminNavbar />
      </header>

      <main
        className="flex-1 p-8 overflow-y-auto"
        style={{ paddingTop: `${navbarHeight + 130}px` }}
      >
        {/* Summary */}
        <h1 className="text-3xl font-bold text-indigo-700 mb-6">
          Manage Quizzes & Questions
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="admin-card p-5 text-center">
            <h4 className="text-sm text-indigo-600 font-semibold">Quizzes</h4>
            <p className="text-3xl font-bold text-indigo-800">{totalQuizzes}</p>
          </div>
          <div className="admin-card p-5 text-center">
            <h4 className="text-sm text-indigo-600 font-semibold">Questions</h4>
            <p className="text-3xl font-bold text-indigo-800">
              {totalQuestions}
            </p>
          </div>
          <div className="admin-card p-5 text-center">
            <h4 className="text-sm text-indigo-600 font-semibold">
              Question Limit
            </h4>
            <p className="text-3xl font-bold text-indigo-800">{quizLimit}</p>
          </div>
        </div>

        {/* Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-6">
          <select
            value={selectedGrade}
            onChange={(e) => {
              setSelectedGrade(e.target.value);
              setSelectedSubject("");
              setSelectedUnit("");
            }}
            className="p-2 border border-indigo-200 rounded-md bg-white"
          >
            <option value="">Select Grade</option>
            {DEFAULT_GRADES.map((g) => (
              <option key={g}>{g}</option>
            ))}
          </select>

          <select
            value={selectedSubject}
            onChange={(e) => {
              setSelectedSubject(e.target.value);
              setSelectedUnit("");
            }}
            className="p-2 border border-indigo-200 rounded-md bg-white"
          >
            <option value="">Select Subject</option>
            {DEFAULT_SUBJECTS[selectedGrade]?.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>

          <select
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value)}
            className="p-2 border border-indigo-200 rounded-md bg-white"
          >
            <option value="">Select Unit</option>
            {DEFAULT_UNITS[selectedSubject]?.map((u) => (
              <option key={u}>{u}</option>
            ))}
          </select>

          <input
            type="number"
            min={1}
            value={quizLimit}
            onChange={(e) => setQuizLimit(Math.max(1, Number(e.target.value)))}
            placeholder="No. of questions allowed"
            className="p-2 border border-indigo-200 rounded-md"
          />

          <input
            value={newQuiz.title}
            onChange={(e) => setNewQuiz({ ...newQuiz, title: e.target.value })}
            placeholder="Quiz Title"
            className="p-2 border border-indigo-200 rounded-md"
          />
        </div>

        {/* Add Quiz */}
        <div className="flex gap-3 mb-8">
          <input
            value={newQuiz.description}
            onChange={(e) =>
              setNewQuiz({ ...newQuiz, description: e.target.value })
            }
            placeholder="Quiz Description"
            className="p-2 border border-indigo-200 rounded-md flex-1"
          />
          <button
            onClick={addQuiz}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-md"
          >
            <FaPlus className="inline mr-1" /> Add Quiz
          </button>
        </div>

        {/* Quizzes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {quizzes.length === 0 ? (
            <p className="text-gray-500">No quizzes yet.</p>
          ) : (
            quizzes.map((quiz) => (
              <div key={quiz.id} className="admin-card p-5 rounded-xl">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-indigo-800">
                      {quiz.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {quiz.grade} → {quiz.subject} → {quiz.unit}
                    </p>
                    <p className="text-gray-700 text-sm">{quiz.description}</p>
                  </div>
                  <button
                    onClick={() => removeQuiz(quiz.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <FaTrash />
                  </button>
                </div>

                {/* Add Question Form */}
                {selectedQuiz?.id === quiz.id ? (
                  <div className="p-4 border rounded-lg bg-white/80 mb-3">
                    <h4 className="font-semibold text-indigo-700 mb-2">
                      Add Question
                    </h4>
                    <input
                      value={newQuestion.text}
                      onChange={(e) =>
                        setNewQuestion({
                          ...newQuestion,
                          text: e.target.value,
                        })
                      }
                      placeholder="Question text"
                      className="p-2 border border-indigo-200 rounded-md mb-2 w-full"
                    />
                    {["a", "b", "c", "d"].map((opt) => (
                      <input
                        key={opt}
                        value={newQuestion[opt]}
                        onChange={(e) =>
                          setNewQuestion({
                            ...newQuestion,
                            [opt]: e.target.value,
                          })
                        }
                        placeholder={`Option ${opt.toUpperCase()}`}
                        className="p-2 border border-indigo-200 rounded-md mb-2 w-full"
                      />
                    ))}
                    <select
                      value={newQuestion.correct}
                      onChange={(e) =>
                        setNewQuestion({
                          ...newQuestion,
                          correct: e.target.value,
                        })
                      }
                      className="p-2 border border-indigo-200 rounded-md mb-2 w-full"
                    >
                      <option value="">Select Correct Answer</option>
                      <option value="a">A</option>
                      <option value="b">B</option>
                      <option value="c">C</option>
                      <option value="d">D</option>
                    </select>
                    <button
                      onClick={addQuestion}
                      disabled={quiz.questions.length >= quiz.limit}
                      className={`w-full rounded-md py-2 mt-2 ${
                        quiz.questions.length >= quiz.limit
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-green-600 text-white"
                      }`}
                    >
                      <FaSave className="inline mr-1" /> Save Question
                    </button>
                    {quiz.questions.length >= quiz.limit && (
                      <p className="text-red-600 mt-2 text-sm">
                        Maximum number of questions reached!
                      </p>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => setSelectedQuiz(quiz)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md"
                  >
                    <FaQuestionCircle className="inline mr-1" /> Add Question
                  </button>
                )}

                {/* Show Questions */}
                {quiz.questions.length > 0 && (
                  <div className="mt-4 bg-indigo-50 p-3 rounded-md">
                    <h4 className="font-semibold text-indigo-700 mb-2">
                      Questions ({quiz.questions.length}/{quiz.limit})
                    </h4>
                    {quiz.questions.map((q, i) => (
                      <div
                        key={q.id}
                        className="p-2 bg-white border rounded-md mb-2 flex justify-between items-start"
                      >
                        <div>
                          <p className="font-semibold text-indigo-800">
                            Q{i + 1}. {q.text}
                          </p>
                          <ul className="text-sm text-gray-700">
                            <li>A. {q.a}</li>
                            <li>B. {q.b}</li>
                            <li>C. {q.c}</li>
                            <li>D. {q.d}</li>
                            <li className="text-green-600 font-semibold">
                              ✅ Correct: {q.correct.toUpperCase()}
                            </li>
                          </ul>
                        </div>
                        <button
                          onClick={() => removeQuestion(quiz.id, q.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default AdmQuiz;
