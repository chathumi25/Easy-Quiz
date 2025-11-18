// frontend/src/pages/AdminDashboard/AdmGrades.jsx
import React, { useEffect, useRef, useState } from "react";
import {
  FaPlus,
  FaTrash,
  FaUsers,
  FaFileExport,
  FaEnvelope,
  FaSearch,
  FaSpinner,
} from "react-icons/fa";

import AdminNavbar from "../../components/layouts/AdminNavbar";
import Toast from "../../components/Toast";
import "../../admin.css";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import AdminViewGradeBarChart from "../../components/Charts/AdminViewGradeBarChart";

import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";

/** ------------------------
 *  Helper utils
 *  ------------------------ */
const validateEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const FadeIn = ({ children }) => (
  <div className="animate-fadeIn">{children}</div>
);

/** ------------------------
 *  AdmGrades Main Component
 *  ------------------------ */
const AdmGrades = () => {
  const navbarRef = useRef(null);
  const gradeListRef = useRef(null);
  const nameInputRef = useRef(null);

  const [navbarHeight, setNavbarHeight] = useState(85);

  const [grades, setGrades] = useState([]);
  const [newGrade, setNewGrade] = useState("");
  const [gradeAddError, setGradeAddError] = useState("");

  const [selectedGradeIndex, setSelectedGradeIndex] = useState(null);
  const [showAddStudentForIndex, setShowAddStudentForIndex] = useState(null);
  const [newStudent, setNewStudent] = useState({ name: "", email: "" });

  const [emailError, setEmailError] = useState("");
  const [sendSuccess, setSendSuccess] = useState("");

  // loading states
  const [loadingGrades, setLoadingGrades] = useState(false);
  const [addingGrade, setAddingGrade] = useState(false);
  const [addingStudent, setAddingStudent] = useState(false);
  const [removingStudentId, setRemovingStudentId] = useState(null);
  const [removingGradeIndex, setRemovingGradeIndex] = useState(null);

  // search filter for students
  const [studentSearch, setStudentSearch] = useState("");

  // highlight class for recently-updated grade
  const [highlightedGradeId, setHighlightedGradeId] = useState(null);

  // Toasts
  const [toasts, setToasts] = useState([]);

  // ⭐ Student DELETE CONFIRM STATES
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);

  // ⭐ GRADE DELETE CONFIRM STATES
  const [showDeleteGradeConfirm, setShowDeleteGradeConfirm] = useState(false);
  const [gradeToDelete, setGradeToDelete] = useState(null);

  const pushToast = (type, message, ms = 3000) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, type, message }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, ms);
  };

  const removeToast = (id) =>
    setToasts((t) => t.filter((x) => x.id !== id));

  // Navbar height detection
  useEffect(() => {
    const update = () => {
      if (navbarRef.current)
        setNavbarHeight(navbarRef.current.offsetHeight);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Fetch grades
  useEffect(() => {
    const fetchGrades = async () => {
      setLoadingGrades(true);
      try {
        const res = await axiosInstance.get(API_PATHS.ADMIN.GRADES);
        if (res.data?.success) {
          setGrades(res.data.grades || []);
        } else {
          pushToast("error", "Failed to load grades from server");
        }
      } catch (err) {
        pushToast("error", "Failed to load grades");
      } finally {
        setLoadingGrades(false);
      }
    };
    fetchGrades();
  }, []);

  // Auto-focus name input
  useEffect(() => {
    if (showAddStudentForIndex !== null) {
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 80);
    }
  }, [showAddStudentForIndex]);

  // Auto-scroll to selected grade
  useEffect(() => {
    if (selectedGradeIndex === null) return;
    try {
      const container = gradeListRef.current;
      const gradeEl = container?.querySelectorAll("li")[selectedGradeIndex];
      if (gradeEl && container) {
        const containerRect = container.getBoundingClientRect();
        const elRect = gradeEl.getBoundingClientRect();
        const offset = elRect.top - containerRect.top - 80;
        container.scrollTo({
          top: container.scrollTop + offset,
          behavior: "smooth",
        });
      }
    } catch {}
  }, [selectedGradeIndex]);

  /** ------------------------------
   *  ADD GRADE
   *  ------------------------------ */
  const addGrade = async () => {
    const name = newGrade.trim();
    if (!name) {
      setGradeAddError("Please enter a grade name.");
      return;
    }

    setAddingGrade(true);
    try {
      const res = await axiosInstance.post(API_PATHS.ADMIN.ADD_GRADE, {
        name,
      });
      if (res.data?.success) {
        setGrades((prev) => [...prev, res.data.grade]);
        setNewGrade("");
        setGradeAddError("");
        pushToast("success", "Grade added");
      } else {
        setGradeAddError(res.data?.message || "Failed to add grade");
        pushToast("error", res.data?.message || "Failed to add grade");
      }
    } catch {
      setGradeAddError("Failed to add grade");
      pushToast("error", "Failed to add grade");
    } finally {
      setAddingGrade(false);
    }
  };

  /** ------------------------------
   *  REMOVE GRADE
   *  ------------------------------ */
  const removeGrade = async (index) => {
    const gradeName = grades[index]?.name;
    if (!gradeName) return;

    setRemovingGradeIndex(index);

    try {
      const res = await axiosInstance.post(
        API_PATHS.ADMIN.REMOVE_GRADE,
        { name: gradeName }
      );

      if (res.data?.success) {
        setGrades((prev) => {
          const updated = prev.filter((g) => g.name !== gradeName);

          setSelectedGradeIndex((sel) => {
            if (sel === null) return null;
            if (sel === index) return null;
            if (sel > index) return sel - 1;
            return sel;
          });

          return updated;
        });
        pushToast("success", "Grade removed");
      } else {
        pushToast("error", res.data?.message || "Failed to remove grade");
      }
    } catch {
      pushToast("error", "Failed to remove grade");
    } finally {
      setRemovingGradeIndex(null);
    }
  };

  /** ------------------------------
   *  ADD STUDENT
   *  ------------------------------ */
  const addStudentToGrade = async (gradeIndex) => {
    const gradeName = grades[gradeIndex]?.name;
    const { name, email } = newStudent;

    setEmailError("");

    if (!name?.trim() || !email?.trim()) {
      setEmailError("Please enter both name and email");
      return;
    }
    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email");
      return;
    }

    setAddingStudent(true);

    try {
      const res = await axiosInstance.post(
        API_PATHS.ADMIN.ADD_STUDENT,
        { gradeName, name, email }
      );

      if (res.data?.success) {
        const updatedGrade = res.data.grade;

        setGrades((prev) => {
          const updated = prev.map((g) =>
            g._id === updatedGrade._id ||
            g.name === updatedGrade.name
              ? updatedGrade
              : g
          );

          const newIndex = updated.findIndex(
            (g) =>
              g._id === updatedGrade._id ||
              g.name === updatedGrade.name
          );

          setSelectedGradeIndex(newIndex);
          setHighlightedGradeId(updatedGrade._id || updatedGrade.name);

          setTimeout(() => setHighlightedGradeId(null), 1800);

          return updated;
        });

        setNewStudent({ name: "", email: "" });
        setShowAddStudentForIndex(null);

        pushToast("success", `Student added to ${gradeName}`);
        setSendSuccess(`Student added to ${gradeName}`);

        setTimeout(() => setSendSuccess(""), 2500);
      } else {
        setEmailError(res.data?.message || "Failed to add student");
        pushToast("error", res.data?.message || "Failed to add student");
      }
    } catch (err) {
      setEmailError(err.response?.data?.message || "Failed to add student");
      pushToast("error", err.response?.data?.message || "Failed to add student");
    } finally {
      setAddingStudent(false);
    }
  };

  /** ------------------------------
   *  REMOVE STUDENT
   *  ------------------------------ */
  const removeStudent = async (gradeIndex, studentId) => {
  const gradeName = grades[gradeIndex]?.name;
  if (!gradeName || !studentId) return;

  setRemovingStudentId(studentId);

  try {
    const res = await axiosInstance.post(API_PATHS.ADMIN.REMOVE_STUDENT, {
      gradeName,
      studentId,
    });

    if (res.data?.success) {
      const updatedGrade = res.data.grade;

      // ⭐ REAL-TIME UPDATE FIX
      setGrades((prev) => {
        const updated = [...prev];
        updated[gradeIndex] = updatedGrade; // only update the changed grade
        return updated;
      });

      // ⭐ Keep same panel open
      setSelectedGradeIndex(gradeIndex);

      // ⭐ Highlight updated grade
      setHighlightedGradeId(updatedGrade._id || updatedGrade.name);
      setTimeout(() => setHighlightedGradeId(null), 1200);

      pushToast("success", "Student removed");
    } else {
      pushToast("error", res.data?.message || "Failed to remove student");
    }
  } catch {
    pushToast("error", "Failed to remove student");
  } finally {
    setRemovingStudentId(null);
  }
};


  /** ------------------------------
   *  EXPORT XLSX
   *  ------------------------------ */
  const exportGradeToXLSX = (gradeIndex) => {
    const grade = grades[gradeIndex];
    if (!grade || !grade.students?.length) {
      pushToast("error", "No students to export");
      return;
    }

    const data = grade.students.map((s, idx) => ({
      No: idx + 1,
      Name: s.name,
      Email: s.email,
      Grade: grade.name,
      RegisteredAt: s.registeredAt
        ? new Date(s.registeredAt).toLocaleString()
        : "",
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      wb,
      ws,
      (grade.name || "Grade").slice(0, 31)
    );

    const wbout = XLSX.write(wb, { type: "array", bookType: "xlsx" });
    saveAs(new Blob([wbout]), `${grade.name}_students.xlsx`);

    pushToast("success", `Exported ${grade.name}`);
  };

  /** ------------------------------
   *  DERIVED VALUES
   *  ------------------------------ */
  const totalStudents = grades.reduce(
    (t, g) => t + (g.students?.length || 0),
    0
  );

  const currentGrade =
    selectedGradeIndex !== null
      ? grades[selectedGradeIndex]
      : null;

  const filteredStudents =
    currentGrade?.students?.filter((s) => {
      if (!studentSearch?.trim()) return true;
      const q = studentSearch.toLowerCase();
      return (
        (s.name || "").toLowerCase().includes(q) ||
        (s.email || "").toLowerCase().includes(q)
      );
    }) || [];


    return (
    <div className="min-h-screen flex flex-col app-background">
      {/* Navbar */}
      <header ref={navbarRef} className="w-full fixed top-0 left-0 z-50">
        <AdminNavbar />
      </header>

      <main
        className="flex-1 p-8 overflow-y-auto transition-all duration-300"
        style={{ paddingTop: `${navbarHeight + 140}px`, paddingBottom: 48 }}
      >
        <div className="max-w-6xl mx-auto">
          {/* Title */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-extrabold text-indigo-700">
              Manage Grades
            </h1>
            <p className="text-sm text-gray-500 mt-2">
              Create grades, manage students, and export reports. Changes appear instantly.
            </p>
          </div>

          {/* Summary + Add Grade */}
          <div className="flex flex-col md:flex-row gap-6 items-start mb-8">
            <div className="flex gap-6">
              <div className="bg-white/80 p-5 rounded-xl shadow border w-40 text-center animate-fadeIn">
                <p className="text-indigo-600 text-sm">Grades</p>
                <p className="text-3xl font-bold text-indigo-800">
                  {grades.length}
                </p>
              </div>
              <div className="bg-white/80 p-5 rounded-xl shadow border w-40 text-center animate-fadeIn">
                <p className="text-indigo-600 text-sm">Students</p>
                <p className="text-3xl font-bold text-indigo-800">
                  {totalStudents}
                </p>
              </div>
            </div>

            <div className="flex-1 bg-white/80 p-4 rounded-xl shadow border flex gap-3 items-center">
              <input
                value={newGrade}
                onChange={(e) => {
                  setNewGrade(e.target.value);
                  setGradeAddError("");
                }}
                placeholder="Add new grade (e.g. Grade 12)"
                className="flex-1 p-3 rounded-lg border border-indigo-200 outline-none"
              />
              <button
                onClick={addGrade}
                disabled={addingGrade}
                className={`px-5 py-3 rounded-lg text-white ${
                  addingGrade
                    ? "bg-indigo-400"
                    : "bg-gradient-to-r from-indigo-600 to-purple-600"
                } transition-transform transform hover:scale-105`}
              >
                {addingGrade ? (
                  <>
                    <FaSpinner className="inline animate-spin mr-2" /> Adding...
                  </>
                ) : (
                  <>
                    <FaPlus className="inline mr-2" /> Add Grade
                  </>
                )}
              </button>
            </div>
          </div>

          {gradeAddError && (
            <div className="text-red-700 bg-red-100 border border-red-300 px-4 py-2 rounded mb-6">
              {gradeAddError}
            </div>
          )}

          {/* Main Grid (Vertical layout) */}
          <div className="flex flex-col gap-10">

            {/* Grade list (top) */}
            <div className="bg-white/80 p-6 rounded-xl shadow border h-[520px] overflow-auto w-full">
              <h3 className="text-indigo-700 font-semibold mb-4">Grade List</h3>

              {loadingGrades ? (
                <div className="text-center py-16 text-gray-500">
                  <FaSpinner className="inline animate-spin mr-2" /> Loading grades...
                </div>
              ) : (
                <ul className="space-y-4">
                  {grades.map((g, idx) => {
                    const isSelected = selectedGradeIndex === idx;
                    const highlight =
                      (g._id || g.name) === highlightedGradeId;

                    return (
                      <li
                        key={g._id || g.name || idx}
                        className={`p-3 rounded-xl flex justify-between items-center cursor-pointer transition-shadow ${
                          isSelected ? "bg-indigo-50 border" : "bg-white"
                        } ${highlight ? "ring-4 ring-indigo-200" : ""}`}
                      >
                        <div
                          onClick={() => {
                            setSelectedGradeIndex(idx);
                            setShowAddStudentForIndex(null);
                            setStudentSearch("");
                            setHighlightedGradeId(g._id || g.name);
                            setTimeout(() => setHighlightedGradeId(null), 900);
                          }}
                          className="flex items-center gap-3 w-full"
                        >
                          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center font-semibold text-indigo-700">
                            {g.name && g.name.match(/\d+/)
                              ? g.name.match(/\d+/)[0]
                              : g.name
                              ? g.name.charAt(0).toUpperCase()
                              : "?"}
                          </div>

                          <div className="min-w-0">
                            <p className="font-medium text-indigo-800 truncate">
                              {g.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {(g.students?.length || 0) + " students"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-2">

                          {/* Export grade */}
                          <button
                            onClick={() => exportGradeToXLSX(idx)}
                            title="Export"
                            className="p-2 rounded text-white bg-indigo-600"
                          >
                            <FaFileExport />
                          </button>

                          {/* Grade delete button with CONFIRM POPUP */}
                          <button
                            onClick={() => {
                              setGradeToDelete(idx);
                              setShowDeleteGradeConfirm(true);
                            }}
                            title="Delete grade"
                            className="p-2 rounded text-white bg-red-600"
                            disabled={removingGradeIndex === idx}
                          >
                            {removingGradeIndex === idx ? (
                              <FaSpinner className="animate-spin" />
                            ) : (
                              <FaTrash />
                            )}
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Right panel (Grade details + students) */}
            <div className="bg-white/80 p-6 rounded-xl shadow border h-[520px] overflow-auto">
              {selectedGradeIndex === null ? (
                <div className="text-center pt-28 text-gray-500">
                  Select a grade to view details & manage students.
                </div>
              ) : (
                <FadeIn>

                  {/* Top bar */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-indigo-800">
                        {grades[selectedGradeIndex]?.name}
                      </h2>
                      <p className="text-sm text-gray-500">
                        Created:{" "}
                        {new Date(
                          grades[selectedGradeIndex]?.createdAt || Date.now()
                        ).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center bg-gray-50 rounded p-2 border">
                        <FaSearch className="text-gray-400 mr-2" />
                        <input
                          placeholder="Search students (name / email)"
                          value={studentSearch}
                          onChange={(e) => setStudentSearch(e.target.value)}
                          className="outline-none bg-transparent text-sm"
                        />
                      </div>

                      <button
                        onClick={() => exportGradeToXLSX(selectedGradeIndex)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded"
                      >
                        Export
                      </button>
                    </div>
                  </div>

                  {/* Add Student button */}
                  {!showAddStudentForIndex && (
                    <button
                      onClick={() => {
                        setShowAddStudentForIndex(selectedGradeIndex);
                        setTimeout(() => nameInputRef.current?.focus(), 60);
                      }}
                      className="px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded mb-4"
                    >
                      <FaPlus className="inline mr-2" /> Add Student
                    </button>
                  )}

                  {/* Add Student Form */}
                  {showAddStudentForIndex === selectedGradeIndex && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                      <input
                        ref={nameInputRef}
                        value={newStudent.name}
                        onChange={(e) =>
                          setNewStudent({
                            ...newStudent,
                            name: e.target.value,
                          })
                        }
                        placeholder="Full name"
                        className="p-3 rounded border"
                      />

                      <input
                        value={newStudent.email}
                        onChange={(e) =>
                          setNewStudent({
                            ...newStudent,
                            email: e.target.value,
                          })
                        }
                        placeholder="Email"
                        className="p-3 rounded border"
                      />

                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            addStudentToGrade(selectedGradeIndex)
                          }
                          disabled={addingStudent}
                          className={`px-4 py-2 rounded text-white ${
                            addingStudent ? "bg-indigo-400" : "bg-green-600"
                          }`}
                        >
                          {addingStudent ? (
                            <>
                              <FaSpinner className="inline animate-spin mr-2" />{" "}
                              Adding...
                            </>
                          ) : (
                            "Add"
                          )}
                        </button>

                        <button
                          onClick={() => {
                            setShowAddStudentForIndex(null);
                            setNewStudent({ name: "", email: "" });
                            setEmailError("");
                          }}
                          className="px-4 py-2 rounded bg-gray-200"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {emailError && (
                    <div className="mt-3 text-red-700 bg-red-100 p-3 rounded">
                      {emailError}
                    </div>
                  )}

                  {sendSuccess && (
                    <div className="mt-3 text-green-700 bg-green-100 p-3 rounded flex items-center gap-2">
                      <FaEnvelope /> {sendSuccess}
                    </div>
                  )}

                  {/* Students list */}
                  <h4 className="text-lg font-semibold text-indigo-700 mb-3">
                    Registered Students ({filteredStudents.length})
                  </h4>

                  {filteredStudents.length === 0 ? (
                    <p className="text-gray-500 mb-6">
                      {grades[selectedGradeIndex].students?.length
                        ? "No results for the search."
                        : "No students yet."}
                    </p>
                  ) : (
                    <div className="space-y-3 mb-6">
                      {filteredStudents.map((s) => (
                        <div
                          key={s.studentId || s.email}
                          className="p-3 bg:white rounded-lg border flex justify-between items-center shadow-sm"
                        >
                          <div>
                            <p className="font-medium text-indigo-800">
                              {s.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {s.email}
                            </p>
                          </div>

                          <button
                            onClick={() => {
                              setStudentToDelete({
                                gradeIndex: selectedGradeIndex,
                                studentId:
                                  s.studentId || s.id || s._id,
                              });
                              setShowDeleteConfirm(true);
                            }}
                            disabled={
                              removingStudentId ===
                              (s.studentId || s.id || s._id)
                            }
                            className="px-3 py-2 bg-red-600 text-white rounded"
                          >
                            {removingStudentId ===
                            (s.studentId ||
                              s.id ||
                              s._id) ? (
                              <>
                                <FaSpinner className="inline animate-spin mr-2" />{" "}
                                Removing...
                              </>
                            ) : (
                              "Remove"
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                </FadeIn>
              )}
            </div>
          </div>


                    {/* Chart */}
          <div className="max-w-6xl mx-auto mt-10">
            <div className="bg-white/80 p-6 rounded-xl shadow border">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-indigo-700">
                  Students by Grade
                </h3>
                <p className="text-sm text-gray-500">Real-time</p>
              </div>
              <div style={{ width: "100%", height: 360 }}>
                <AdminViewGradeBarChart grades={grades} />
              </div>
            </div>
          </div>
        </div>

        {/* Toast component */}
        <Toast
          toasts={toasts}
          onRemove={removeToast}
          position="bottom-right"
        />

        {/* ⭐ STUDENT DELETE CONFIRMATION MODAL */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-xl w-[350px] text-center">

              <h2 className="text-xl font-bold text-red-600 mb-3">
                Delete Student?
              </h2>

              <p className="text-gray-700 mb-6">
                This action is permanent. Do you really want to remove this student?
              </p>

              <div className="flex justify-center gap-4">

                {/* YES DELETE STUDENT */}
                <button
                  onClick={() => {
                    removeStudent(
                      studentToDelete.gradeIndex,
                      studentToDelete.studentId
                    );
                    setShowDeleteConfirm(false);
                    setStudentToDelete(null);
                  }}
                  className="px-5 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Yes, Delete
                </button>

                {/* CANCEL */}
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setStudentToDelete(null);
                  }}
                  className="px-5 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>

              </div>
            </div>
          </div>
        )}

        {/* ⭐ GRADE DELETE CONFIRMATION MODAL */}
        {showDeleteGradeConfirm && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-xl w-[350px] text-center">

              <h2 className="text-xl font-bold text-red-600 mb-3">
                Delete Grade?
              </h2>

              <p className="text-gray-700 mb-6">
                Delete this grade permanently?<br />
                All students inside this grade will also be deleted.
              </p>

              <div className="flex justify-center gap-4">

                {/* YES DELETE GRADE */}
                <button
                  onClick={() => {
                    removeGrade(gradeToDelete);
                    setShowDeleteGradeConfirm(false);
                    setGradeToDelete(null);
                  }}
                  className="px-5 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Yes, Delete
                </button>

                {/* CANCEL */}
                <button
                  onClick={() => {
                    setShowDeleteGradeConfirm(false);
                    setGradeToDelete(null);
                  }}
                  className="px-5 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>

              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default AdmGrades;
