// frontend/src/pages/AdminDashboard/AdmQuiz.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  FaPlus,
  FaTrash,
  FaQuestionCircle,
  FaSave,
  FaTimes,
} from "react-icons/fa";

import AdminNavbar from "../../components/layouts/AdminNavbar";
import Alert from "../../components/layouts/Alert";
import ConfirmModal from "../../components/layouts/ConfirmModal";

import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";

import "../../index.css";
import "../../admin.css";

const AdmQuiz = () => {
  const navbarRef = useRef(null);
  const [navbarHeight, setNavbarHeight] = useState(85);

  // MAIN DATA
  const [grades, setGrades] = useState([]); // { _id, name, ... }
  const [subjects, setSubjects] = useState([]); // subjects for selected grade

  // SELECTED (store both name & id)
  const [selectedGrade, setSelectedGrade] = useState(""); // grade name
  const [selectedGradeId, setSelectedGradeId] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(""); // subject name
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState("");

  const [quizLimit, setQuizLimit] = useState(1);

  // quizzes loaded from backend
  const [quizzes, setQuizzes] = useState([]);

  // form state
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

  // EDIT MODAL
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingQuizId, setEditingQuizId] = useState(null);
  const [editedQuestions, setEditedQuestions] = useState([]);

  // alerts
  const [quizAlert, setQuizAlert] = useState({ type: "", message: "" });
  const [questionAlert, setQuestionAlert] = useState({ type: "", message: "" });
  const [modalAlert, setModalAlert] = useState({ type: "", message: "" });

  // confirm
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  // NAVBAR height fix
  useEffect(() => {
    const update = () => {
      if (navbarRef.current) setNavbarHeight(navbarRef.current.offsetHeight);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  /* ================
     Helper alerts
     ================ */
  const clearAfter = (setter) => {
    setTimeout(() => setter({ type: "", message: "" }), 2500);
  };
  const showQuizAlert = (type, message) => {
    setQuizAlert({ type, message });
    clearAfter(setQuizAlert);
  };
  const showQuestionAlert = (type, message) => {
    setQuestionAlert({ type, message });
    clearAfter(setQuestionAlert);
  };
  const showModalAlert = (type, message) => {
    setModalAlert({ type, message });
    clearAfter(setModalAlert);
  };

  /* =========================
     Load Grades & initial data
     ========================= */
  const fetchGrades = async () => {
    try {
      const res = await axiosInstance.get(API_PATHS.ADMIN.GRADES);
      if (res.data && res.data.grades) {
        setGrades(res.data.grades || []);
      } else {
        setGrades([]);
      }
    } catch (err) {
      console.error("FETCH GRADES ERROR:", err);
      setGrades([]);
    }
  };

  // fetch subjects for a gradeId
  const fetchSubjectsForGrade = async (gradeId) => {
    if (!gradeId) {
      setSubjects([]);
      return;
    }
    try {
      const res = await axiosInstance.get(API_PATHS.ADMIN.GET_SUBJECTS, {
        params: { gradeId },
      });
      if (res.data && res.data.subjects) {
        setSubjects(res.data.subjects || []);
      } else {
        setSubjects([]);
      }
    } catch (err) {
      console.error("FETCH SUBJECTS ERROR:", err);
      setSubjects([]);
    }
  };

  /* =========================
     Fetch quizzes from backend
     ========================= */
  const fetchQuizzes = async () => {
    try {
      const params = {};
      if (selectedGrade) params.grade = selectedGrade;
      if (selectedSubject) params.subject = selectedSubject;
      if (selectedUnit && selectedUnit !== "All Units") params.unit = selectedUnit;

      const res = await axiosInstance.get(API_PATHS.ADMIN.QUIZ.BASE, { params });
      const normalized = (res.data.quizzes || []).map((q) => ({
        ...q,
        id: q._id,
        questions: (q.questions || []).map((qq) => ({ ...qq, id: qq._id })),
      }));
      setQuizzes(normalized);
    } catch (err) {
      console.error("FETCH QUIZZES ERROR:", err);
      setQuizzes([]);
    }
  };

  // initial load
  useEffect(() => {
    fetchGrades();
    fetchQuizzes();
  }, []);

  // refetch quizzes when filters change
  useEffect(() => {
    fetchQuizzes();
  }, [selectedGrade, selectedSubject, selectedUnit]);

  /* =========================
     Handlers for selects
     ========================= */
  const onGradeChange = (gradeId) => {
    // gradeId is the selected grade _id (or "")
    if (!gradeId) {
      setSelectedGrade("");
      setSelectedGradeId(null);
      setSelectedSubject("");
      setSelectedSubjectId(null);
      setSelectedUnit("");
      setSubjects([]);
      return;
    }

    const g = grades.find((x) => String(x._id) === String(gradeId));
    if (!g) {
      setSelectedGrade("");
      setSelectedGradeId(null);
      setSubjects([]);
      return;
    }

    setSelectedGrade(g.name);
    setSelectedGradeId(g._id);
    // reset downstream
    setSelectedSubject("");
    setSelectedSubjectId(null);
    setSelectedUnit("");
    // fetch subjects
    fetchSubjectsForGrade(g._id);
  };

  const onSubjectChange = (subjectId) => {
    if (!subjectId) {
      setSelectedSubject("");
      setSelectedSubjectId(null);
      setSelectedUnit("");
      return;
    }

    const s = subjects.find((x) => String(x._id) === String(subjectId));
    if (!s) {
      setSelectedSubject("");
      setSelectedSubjectId(null);
      setSelectedUnit("");
      return;
    }

    setSelectedSubject(s.name);
    setSelectedSubjectId(s._id);

    // set unit to All Units by default
    setSelectedUnit("All Units");
  };

  const getUnitsForSelectedSubject = () => {
    if (!selectedSubjectId) return ["All Units"];
    const s = subjects.find((x) => String(x._id) === String(selectedSubjectId));
    if (!s) return ["All Units"];
    const units = (s.units || []).map((u) => (typeof u === "string" ? u : u.name));
    // ensure unique + prefix All Units
    return ["All Units", ...Array.from(new Set(units))];
  };

  /* =========================
     CREATE QUIZ
     ========================= */
  const addQuiz = async () => {
    if (!selectedGrade || !selectedSubject)
      return showQuizAlert("error", "Please select Grade & Subject.");

    if (!newQuiz.title.trim()) return showQuizAlert("error", "Enter quiz title.");
    if (!quizLimit || quizLimit < 1)
      return showQuizAlert("error", "Question limit must be at least 1.");

    const unitValue = selectedUnit || "All Units";

    // (optional) quick UI duplicate check
    const exists = quizzes.find(
      (q) =>
        q.grade === selectedGrade &&
        q.subject === selectedSubject &&
        q.unit === unitValue
    );
    if (exists) return showQuizAlert("error", "Quiz already exists!");

    try {
      const payload = {
        grade: selectedGrade,
        gradeId: selectedGradeId || null,
        subject: selectedSubject,
        subjectId: selectedSubjectId || null,
        unit: unitValue,
        title: newQuiz.title,
        description: newQuiz.description,
        limit: Number(quizLimit),
      };

      const res = await axiosInstance.post(API_PATHS.ADMIN.QUIZ.CREATE, payload);
      if (!res.data || !res.data.quiz) {
        return showQuizAlert("error", "Failed to create quiz");
      }

      const created = {
        ...res.data.quiz,
        id: res.data.quiz._id,
        questions: (res.data.quiz.questions || []).map((qq) => ({ ...qq, id: qq._id })),
      };

      setQuizzes((prev) => [created, ...prev]);
      setNewQuiz({ title: "", description: "" });
      setSelectedQuiz(created);
      setEditedQuestions((created.questions || []).map((q) => ({ ...q })));
      showQuizAlert("success", res.data.message || "Quiz added successfully!");
    } catch (err) {
      console.error("CREATE QUIZ ERROR:", err);
      const msg = err?.response?.data?.message || "Failed to create quiz.";
      showQuizAlert("error", msg);
    }
  };

  /* =========================
     ADD QUESTION
     ========================= */
  const addQuestion = async () => {
    if (!selectedQuiz) return showQuestionAlert("error", "Select a quiz first!");

    if (
      !newQuestion.text.trim() ||
      !newQuestion.a.trim() ||
      !newQuestion.b.trim() ||
      !newQuestion.c.trim() ||
      !newQuestion.d.trim() ||
      !newQuestion.correct
    ) {
      return showQuestionAlert("error", "Fill all fields.");
    }

    try {
      const res = await axiosInstance.post(
        API_PATHS.ADMIN.QUIZ.ADD_QUESTION(selectedQuiz.id),
        {
          text: newQuestion.text,
          a: newQuestion.a,
          b: newQuestion.b,
          c: newQuestion.c,
          d: newQuestion.d,
          correct: newQuestion.correct,
        }
      );

      if (!res.data || !res.data.quiz) return showQuestionAlert("error", "Failed to add question.");

      const updatedQuiz = {
        ...res.data.quiz,
        id: res.data.quiz._id,
        questions: res.data.quiz.questions.map((qq) => ({ ...qq, id: qq._id })),
      };

      setQuizzes((prev) => prev.map((q) => (q.id === selectedQuiz.id ? updatedQuiz : q)));
      setSelectedQuiz(updatedQuiz);
      if (isEditModalOpen && editingQuizId === selectedQuiz.id) {
        setEditedQuestions(updatedQuiz.questions.map((q) => ({ ...q })));
      }

      setNewQuestion({ text: "", a: "", b: "", c: "", d: "", correct: "" });
      showQuestionAlert("success", "Question added successfully!");
    } catch (err) {
      console.error("ADD QUESTION ERROR:", err);
      const msg = err?.response?.data?.message || "Failed to add question.";
      showQuestionAlert("error", msg);
    }
  };

  /* =========================
     DELETE QUIZ
     ========================= */
  const deleteQuiz = async (quizId) => {
    try {
      const res = await axiosInstance.delete(API_PATHS.ADMIN.QUIZ.DELETE(quizId));
      setQuizzes((prev) => prev.filter((q) => q.id !== quizId));
      if (selectedQuiz?.id === quizId) setSelectedQuiz(null);
      showQuizAlert("success", res.data?.message || "Quiz deleted!");
    } catch (err) {
      console.error("DELETE QUIZ ERROR:", err);
      const msg = err?.response?.data?.message || "Failed to delete quiz.";
      showQuizAlert("error", msg);
    }
  };

  /* =========================
     DELETE QUESTION
     ========================= */
  const deleteQuestion = async (quizId, qId) => {
    try {
      const res = await axiosInstance.delete(
        API_PATHS.ADMIN.QUIZ.DELETE_QUESTION(quizId, qId)
      );
      if (!res.data || !res.data.quiz) return showQuizAlert("error", "Failed to delete question.");

      const updatedQuiz = {
        ...res.data.quiz,
        id: res.data.quiz._id,
        questions: res.data.quiz.questions.map((qq) => ({ ...qq, id: qq._id })),
      };

      setQuizzes((prev) => prev.map((q) => (q.id === quizId ? updatedQuiz : q)));
      if (selectedQuiz?.id === quizId) setSelectedQuiz(updatedQuiz);
      if (isEditModalOpen && editingQuizId === quizId) {
        setEditedQuestions(updatedQuiz.questions.map((qq) => ({ ...qq })));
      }

      showQuizAlert("success", "Question deleted.");
    } catch (err) {
      console.error("DELETE QUESTION ERROR:", err);
      const msg = err?.response?.data?.message || "Failed to delete question.";
      showQuizAlert("error", msg);
    }
  };

  /* =========================
     UPDATE QUESTION
     ========================= */
  const saveEditedQuestion = async (index) => {
    const q = editedQuestions[index];
    if (!q.text || !q.a || !q.b || !q.c || !q.d || !q.correct)
      return showModalAlert("error", "Fill all fields.");

    const quizId = editingQuizId;
    try {
      // new temporary -> create
      if (String(q.id).startsWith("temp-")) {
        const res = await axiosInstance.post(API_PATHS.ADMIN.QUIZ.ADD_QUESTION(quizId), {
          text: q.text,
          a: q.a,
          b: q.b,
          c: q.c,
          d: q.d,
          correct: q.correct,
        });
        if (!res.data || !res.data.quiz) return showModalAlert("error", "Failed to add question.");

        const updatedQuiz = {
          ...res.data.quiz,
          id: res.data.quiz._id,
          questions: res.data.quiz.questions.map((qq) => ({ ...qq, id: qq._id })),
        };

        setQuizzes((prev) => prev.map((qq) => (qq.id === quizId ? updatedQuiz : qq)));
        setSelectedQuiz(updatedQuiz);
        setEditedQuestions(updatedQuiz.questions.map((qq) => ({ ...qq })));
        showModalAlert("success", "Question added.");
        return;
      }

      // existing -> update
      const res = await axiosInstance.put(
        API_PATHS.ADMIN.QUIZ.UPDATE_QUESTION(quizId, q.id),
        {
          text: q.text,
          a: q.a,
          b: q.b,
          c: q.c,
          d: q.d,
          correct: q.correct,
        }
      );

      if (!res.data || !res.data.quiz) return showModalAlert("error", "Failed to update question.");

      const updatedQuiz = {
        ...res.data.quiz,
        id: res.data.quiz._id,
        questions: res.data.quiz.questions.map((qq) => ({ ...qq, id: qq._id })),
      };

      setQuizzes((prev) => prev.map((qq) => (qq.id === quizId ? updatedQuiz : qq)));
      if (selectedQuiz?.id === quizId) setSelectedQuiz(updatedQuiz);
      setEditedQuestions(updatedQuiz.questions.map((qq) => ({ ...qq })));
      showModalAlert("success", "Question saved.");
    } catch (err) {
      console.error("UPDATE QUESTION ERROR:", err);
      const msg = err?.response?.data?.message || "Failed to update question.";
      showModalAlert("error", msg);
    }
  };

  /* =========================
     SAVE ALL EDITED QUESTIONS
     ========================= */
  const saveAllEditedQuestions = async () => {
    const quizId = editingQuizId;
    for (const q of editedQuestions) {
      if (!q.text || !q.a || !q.b || !q.c || !q.d || !q.correct)
        return showModalAlert("error", "All fields required.");
    }

    try {
      for (const q of editedQuestions) {
        const payload = {
          text: q.text,
          a: q.a,
          b: q.b,
          c: q.c,
          d: q.d,
          correct: q.correct,
        };

        if (String(q.id).startsWith("temp-")) {
          await axiosInstance.post(API_PATHS.ADMIN.QUIZ.ADD_QUESTION(quizId), payload);
        } else {
          await axiosInstance.put(API_PATHS.ADMIN.QUIZ.UPDATE_QUESTION(quizId, q.id), payload);
        }
      }

      // fetch fresh quiz
      const res = await axiosInstance.get(API_PATHS.ADMIN.QUIZ.GET_ONE(quizId));
      if (!res.data || !res.data.quiz) return showModalAlert("error", "Failed to fetch updated quiz.");

      const updatedQuiz = {
        ...res.data.quiz,
        id: res.data.quiz._id,
        questions: res.data.quiz.questions.map((qq) => ({ ...qq, id: qq._id })),
      };

      setQuizzes((prev) => prev.map((q) => (q.id === quizId ? updatedQuiz : q)));
      setSelectedQuiz(updatedQuiz);
      setEditedQuestions(updatedQuiz.questions.map((qq) => ({ ...qq })));

      showModalAlert("success", "All questions saved!");
      setTimeout(() => setIsEditModalOpen(false), 600);
    } catch (err) {
      console.error("SAVE ALL QUESTIONS ERROR:", err);
      const msg = err?.response?.data?.message || "Failed to save questions.";
      showModalAlert("error", msg);
    }
  };

  /* =========================
     Add temporary question in modal
     ========================= */
  const addQuestionToEditing = () => {
    const newQ = {
      id: `temp-${Date.now()}`,
      text: "",
      a: "",
      b: "",
      c: "",
      d: "",
      correct: "",
    };
    setEditedQuestions((prev) => [...prev, newQ]);
  };

  /* =========================
     Edit modal open/close
     ========================= */
  const openEditModal = (quiz) => {
    const copy = (quiz.questions || []).map((q) => ({ ...q }));
    setEditedQuestions(copy);
    setEditingQuizId(quiz.id);
    setIsEditModalOpen(true);
    setSelectedQuiz(quiz);
    setModalAlert({ type: "", message: "" });
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingQuizId(null);
    setEditedQuestions([]);
    setModalAlert({ type: "", message: "" });
  };

  /* =========================
     Filtered quizzes & counters
     ========================= */
  const filteredQuizzes = quizzes.filter((q) => {
    if (selectedGrade && q.grade !== selectedGrade) return false;
    if (selectedSubject && q.subject !== selectedSubject) return false;
    if (
      selectedUnit &&
      selectedUnit !== "Select Unit" &&
      selectedUnit !== "" &&
      selectedUnit !== "All Units" &&
      q.unit !== selectedUnit
    )
      return false;
    return true;
  });

  const totalQuizzes = filteredQuizzes.length;
  const totalQuestions = filteredQuizzes.reduce((t, q) => t + (q.questions?.length || 0), 0);

  /* =========================
     Confirm modal helpers
     ========================= */
  const confirmDeleteQuiz = (quizId) => {
    setConfirmAction(() => () => deleteQuiz(quizId));
    setConfirmOpen(true);
  };

  const confirmDeleteQuestion = (quizId, qId) => {
    setConfirmAction(() => () => deleteQuestion(quizId, qId));
    setConfirmOpen(true);
  };

  /* =========================
     handle edited question change
     ========================= */
  const handleEditedQuestionChange = (index, field, value) => {
    setEditedQuestions((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  /* =========================
     Render
     ========================= */
  return (
    <div className="min-h-screen flex flex-col app-background">
      <header ref={navbarRef} className="w-full fixed top-0 left-0 z-50">
        <AdminNavbar />
      </header>

      <main className="flex-1 p-8 overflow-y-auto" style={{ paddingTop: `${navbarHeight + 130}px` }}>
        <h1 className="text-4xl font-extrabold text-indigo-700 text-center mb-10">Manage Quizzes & Questions</h1>

        {/* SUMMARY */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/80 p-6 rounded-xl shadow border text-center">
            <p className="text-indigo-600 text-sm">Quizzes</p>
            <p className="text-4xl font-bold text-indigo-800">{totalQuizzes}</p>
          </div>

          <div className="bg-white/80 p-6 rounded-xl shadow border text-center">
            <p className="text-indigo-600 text-sm">Questions</p>
            <p className="text-4xl font-bold text-indigo-800">{totalQuestions}</p>
          </div>

          <div className="bg-white/80 p-6 rounded-xl shadow border text-center">
            <p className="text-indigo-600 text-sm">Question Limit</p>
            <p className="text-4xl font-bold text-indigo-800">{quizLimit}</p>
          </div>
        </div>

        {/* SELECT FORM */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4">
          {/* Grade select (from DB) */}
          <select
            value={selectedGradeId || ""}
            onChange={(e) => onGradeChange(e.target.value)}
            className="form-select"
          >
            <option value="">Select Grade</option>
            {grades.map((g) => (
              <option key={g._id} value={g._id}>
                {g.name}
              </option>
            ))}
          </select>

          {/* Subject select (from DB) */}
          <select
            value={selectedSubjectId || ""}
            onChange={(e) => onSubjectChange(e.target.value)}
            className="form-select"
          >
            <option value="">Select Subject</option>
            {subjects.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>

          {/* Units (from selected subject) */}
          <select
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value)}
            className="form-select"
          >
            <option value="">Select Unit</option>
            {getUnitsForSelectedSubject().map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>

          <input
            type="number"
            min={1}
            value={quizLimit}
            onChange={(e) => setQuizLimit(Number(e.target.value))}
            className="form-input"
          />

          <input
            className="form-input"
            placeholder="Quiz Title"
            value={newQuiz.title}
            onChange={(e) => setNewQuiz({ ...newQuiz, title: e.target.value })}
          />
        </div>

        {/* ADD QUIZ */}
        <div className="flex gap-3 mb-12">
          <div className="flex-1">
            <input
              className="form-input w-full"
              placeholder="Quiz Description"
              value={newQuiz.description}
              onChange={(e) => setNewQuiz({ ...newQuiz, description: e.target.value })}
            />
            <div className="mt-3">{quizAlert.message && <Alert type={quizAlert.type} message={quizAlert.message} />}</div>
          </div>

          <div className="flex flex-col items-end">
            <button onClick={addQuiz} className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:scale-105 transition-transform">
              <FaPlus className="inline mr-2" /> Add Quiz
            </button>
          </div>
        </div>

        {/* TWO COLUMNS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* LEFT – QUESTION FORM */}
          <div>
            {selectedQuiz ? (
              <div className="p-4 border rounded-lg bg-white/80 mb-5">
                <div className="mb-3">{questionAlert.message && <Alert type={questionAlert.type} message={questionAlert.message} />}</div>

                <h4 className="font-semibold text-indigo-700 mb-10">Add Question to: {selectedQuiz.title}</h4>

                <input value={newQuestion.text} onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })} placeholder="Question text" className="p-2 border border-indigo-200 rounded-md mb-8 w-full" />

                {["a", "b", "c", "d"].map((opt) => (
                  <input key={opt} value={newQuestion[opt]} onChange={(e) => setNewQuestion({ ...newQuestion, [opt]: e.target.value })} placeholder={`Option ${opt.toUpperCase()}`} className="p-2 border border-indigo-200 rounded-md mb-6 w-full" />
                ))}

                <select value={newQuestion.correct} onChange={(e) => setNewQuestion({ ...newQuestion, correct: e.target.value })} className="p-2 border border-indigo-200 rounded-md mb-6 w-full">
                  <option value="">Select Correct Answer</option>
                  <option value="a">A</option>
                  <option value="b">B</option>
                  <option value="c">C</option>
                  <option value="d">D</option>
                </select>

                <button onClick={addQuestion} disabled={selectedQuiz.questions.length >= selectedQuiz.limit} className={`w-full rounded-md py-2 mt-6 ${selectedQuiz.questions.length >= selectedQuiz.limit ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 text-white"}`}>
                  <FaSave className="inline mr-1" /> Save Question
                </button>

                {selectedQuiz.questions.length >= selectedQuiz.limit && <p className="text-red-600 mt-6 text-sm">Maximum number of questions reached!</p>}
              </div>
            ) : (
              <div className="p-6 border rounded-lg bg-white/80 text-center text-gray-500">Select a quiz (from the right) to add questions.</div>
            )}
          </div>

          {/* RIGHT – QUIZ LIST */}
          <div>
            {filteredQuizzes.length === 0 ? <p className="text-gray-500">No quizzes found.</p> : filteredQuizzes.map((quiz) => (
              <div key={quiz.id} className="admin-card p-5 rounded-xl mb-6 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-indigo-800">{quiz.title}</h3>
                    <p className="text-sm text-gray-600">{quiz.grade} → {quiz.subject} → {quiz.unit}</p>
                    <p className="text-gray-700 text-sm">{quiz.description}</p>
                  </div>

                  <div className="flex items-start gap-2">
                    <button onClick={() => { setSelectedQuiz(quiz); setEditedQuestions((quiz.questions || []).map((q) => ({ ...q }))); }} className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200" title="Select quiz to add questions">Select</button>

                    <button onClick={() => confirmDeleteQuiz(quiz.id)} className="text-red-600 hover:text-red-800" title="Delete quiz"><FaTrash /></button>
                  </div>
                </div>

                <div className="flex gap-3 items-center mb-3">
                  <button onClick={() => openEditModal(quiz)} className="px-4 py-2 bg-indigo-600 text-white rounded-md"><FaQuestionCircle className="inline mr-1" /> Edit Questions</button>

                  <div className="text-sm text-gray-600 ml-auto">Questions: {quiz.questions?.length || 0} / {quiz.limit}</div>
                </div>

                {quiz.questions.length > 0 && (
  <div className="bg-indigo-50 p-4 rounded-xl mt-3">
    <h4 className="font-semibold text-indigo-700 mb-3">
      Questions ({quiz.questions.length}/{quiz.limit})
    </h4>

    {/* SCROLLABLE QUESTION LIST BOX */}
    <div
      className="max-h-96 overflow-y-auto pr-2 space-y-2"
      style={{
        scrollbarWidth: "thin",
        scrollbarColor: "#818cf8 #e0e7ff",
      }}
    >
      {quiz.questions.map((q, index) => (
        <div
          key={q.id}
          className="bg-white border p-3 rounded-md flex justify-between shadow-sm"
        >
          <div>
            <p className="font-bold text-indigo-800">
              Q{index + 1}. {q.text}
            </p>
            <p>A. {q.a}</p>
            <p>B. {q.b}</p>
            <p>C. {q.c}</p>
            <p>D. {q.d}</p>

            <p className="text-green-600 font-semibold mt-1">
              Correct: {q.correct.toUpperCase()}
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <button
              onClick={() => {
                setSelectedQuiz(quiz);
                openEditModal(quiz);
              }}
              className="text-indigo-600 hover:text-indigo-800"
            >
              Edit
            </button>

            <button
              onClick={() => confirmDeleteQuestion(quiz.id, q.id)}
              className="text-red-600 hover:text-red-800"
            >
              <FaTrash />
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
)}

              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-60 flex items-start justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeEditModal} />

          <div className="relative z-70 w-[90%] max-w-4xl h-[80vh] mt-16 bg-white rounded-xl shadow-xl overflow-hidden border">
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h3 className="text-lg font-bold text-indigo-800">Edit Questions</h3>
                <p className="text-xs text-gray-500">Editing quiz: {quizzes.find((q) => q.id === editingQuizId)?.title || ""}</p>
                <div className="mt-2">{modalAlert.message && <Alert type={modalAlert.type} message={modalAlert.message} />}</div>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={addQuestionToEditing} className="px-3 py-1 bg-green-600 text-white rounded">+ Add Question</button>

                <button onClick={saveAllEditedQuestions} className="px-3 py-1 bg-indigo-600 text-white rounded">Save All</button>

                <button onClick={closeEditModal} className="p-2 ml-2 rounded text-gray-600 hover:text-gray-900"><FaTimes /></button>
              </div>
            </div>

            <div className="h-[calc(80vh-96px)] overflow-auto p-4 space-y-4">
              {editedQuestions.length === 0 ? (
                <div className="text-center text-gray-500 py-12">No questions. Add new.</div>
              ) : (
                editedQuestions.map((q, idx) => (
                  <div key={q.id} className="bg-gray-50 border p-4 rounded-lg shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <p className="font-semibold text-indigo-800">Q{idx + 1}</p>
                        <input className="w-full mt-2 p-2 rounded border" value={q.text} onChange={(e) => handleEditedQuestionChange(idx, "text", e.target.value)} placeholder="Question text" />
                      </div>

                      <div className="ml-4 flex flex-col items-end gap-2">
                        <button onClick={() => saveEditedQuestion(idx)} className="px-3 py-1 bg-indigo-600 text-white rounded">Save</button>

                        <button onClick={async () => {
                          if (!window.confirm("Delete question?")) return;
                          if (String(q.id).startsWith("temp-")) {
                            const qId = q.id;
                            setEditedQuestions((prev) => prev.filter((x) => x.id !== qId));
                            setQuizzes((prev) => prev.map((quiz) => quiz.id === editingQuizId ? { ...quiz, questions: quiz.questions.filter((x) => x.id !== qId) } : quiz));
                            showModalAlert("success", "Question removed.");
                            return;
                          }
                          await deleteQuestion(editingQuizId, q.id);
                          showModalAlert("success", "Question deleted.");
                        }} className="px-3 py-1 bg-red-600 text-white rounded">Delete</button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input className="p-2 rounded border" placeholder="Option A" value={q.a} onChange={(e) => handleEditedQuestionChange(idx, "a", e.target.value)} />
                      <input className="p-2 rounded border" placeholder="Option B" value={q.b} onChange={(e) => handleEditedQuestionChange(idx, "b", e.target.value)} />
                      <input className="p-2 rounded border" placeholder="Option C" value={q.c} onChange={(e) => handleEditedQuestionChange(idx, "c", e.target.value)} />
                      <input className="p-2 rounded border" placeholder="Option D" value={q.d} onChange={(e) => handleEditedQuestionChange(idx, "d", e.target.value)} />
                    </div>

                    <div className="mt-3 flex items-center gap-3">
                      <label className="text-sm text-gray-600">Correct:</label>
                      <select className="p-2 rounded border" value={q.correct} onChange={(e) => handleEditedQuestionChange(idx, "correct", e.target.value)}>
                        <option value="">Select</option>
                        <option value="a">A</option>
                        <option value="b">B</option>
                        <option value="c">C</option>
                        <option value="d">D</option>
                      </select>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex items-center justify-end gap-3 p-4 border-t">
              <button onClick={() => saveAllEditedQuestions()} className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded">Save & Close</button>
              <button onClick={closeEditModal} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete */}
      <ConfirmModal open={confirmOpen} title="Delete Confirmation" message="Are you sure you want to delete this?" onConfirm={() => { if (confirmAction) confirmAction(); setConfirmOpen(false); }} onCancel={() => setConfirmOpen(false)} />
    </div>
  );
};

export default AdmQuiz;
