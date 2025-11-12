import React, { useEffect, useRef, useState } from "react";
import {
  FaPlus,
  FaTrash,
  FaUsers,
  FaBook,
  FaQuestionCircle,
  FaEnvelope,
} from "react-icons/fa";
import AdminSidebar from "../../components/layouts/AdminSidebar";
import AdminNavbar from "../../components/layouts/AdminNavbar";
import "../../index.css";
import "../../admin.css"; // External admin CSS

const DEFAULT_GRADES = [
  "Grade 6",
  "Grade 7",
  "Grade 8",
  "Grade 9",
  "Grade 10",
  "Grade 11",
];

// Mock subject & quiz count generator
const mockStatsForGrade = (gradeName) => {
  const base = [...gradeName].reduce((s, c) => s + c.charCodeAt(0), 0);
  const subjects = 3 + (base % 4);
  const quizzes = 5 + (base % 7);
  return { subjects, quizzes };
};

const STORAGE_KEY = "easyquiz_admin_grades_v2";

// Utility: generate random password
const generatePassword = (length = 8) => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@$!%*?";
  return Array.from({ length }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join("");
};

// Utility: validate email format
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const AdmGrades = () => {
  const navbarRef = useRef(null);
  const [navbarHeight, setNavbarHeight] = useState(85);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [grades, setGrades] = useState([]);
  const [newGrade, setNewGrade] = useState("");
  const [gradeExists, setGradeExists] = useState(false);

  const [selectedGradeIndex, setSelectedGradeIndex] = useState(null);
  const [showAddStudentForIndex, setShowAddStudentForIndex] = useState(null);
  const [newStudent, setNewStudent] = useState({ name: "", email: "" });
  const [emailError, setEmailError] = useState("");
  const [sendSuccess, setSendSuccess] = useState("");

  // Load grades
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setGrades(JSON.parse(raw));
        return;
      } catch (e) {}
    }
    const initial = DEFAULT_GRADES.map((g) => ({
      name: g,
      students: [],
      createdAt: new Date().toISOString(),
    }));
    setGrades(initial);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  }, []);

  // Save grades
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(grades));
  }, [grades]);

  // Navbar height dynamic
  useEffect(() => {
    const updateNavbarHeight = () => {
      if (navbarRef.current) setNavbarHeight(navbarRef.current.offsetHeight);
    };
    updateNavbarHeight();
    window.addEventListener("resize", updateNavbarHeight);
    return () => window.removeEventListener("resize", updateNavbarHeight);
  }, []);

  // Sidebar responsiveness
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) setIsSidebarOpen(false);
      else setIsSidebarOpen(true);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Add grade logic
  const addGrade = () => {
    const name = newGrade.trim();
    if (!name) return;
    if (grades.some((g) => g.name.toLowerCase() === name.toLowerCase())) {
      setGradeExists(true);
      return;
    }
    const updated = [
      ...grades,
      { name, students: [], createdAt: new Date().toISOString() },
    ];
    setGrades(updated);
    setNewGrade("");
    setGradeExists(false);
  };

  // Remove grade
  const removeGrade = (index) => {
    if (
      !window.confirm(
        `Remove ${grades[index].name}? This will delete all its students.`
      )
    )
      return;
    const updated = grades.filter((_, i) => i !== index);
    setGrades(updated);
    if (selectedGradeIndex === index) setSelectedGradeIndex(null);
  };

  // Add student with email validation & simulated email
  const addStudentToGrade = (gradeIndex) => {
    const name = newStudent.name.trim();
    const email = newStudent.email.trim();

    if (!name || !email)
      return setEmailError("⚠️ Please enter both name and email.");

    if (!validateEmail(email))
      return setEmailError("❌ Please enter a valid email address.");

    // Generate random password
    const password = generatePassword(8);

    const updated = grades.map((g, i) => {
      if (i !== gradeIndex) return g;
      const id = `stu_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      return {
        ...g,
        students: [
          ...g.students,
          { id, name, email, password, registeredAt: new Date().toISOString() },
        ],
      };
    });

    setGrades(updated);
    setNewStudent({ name: "", email: "" });
    setEmailError("");

    // Simulated sending email
    setSendSuccess(
      `✅ Email with credentials sent to ${email} (Password: ${password})`
    );

    // Later: replace this with real API call (e.g. EmailJS or backend endpoint)
    setTimeout(() => setSendSuccess(""), 4000);
    setShowAddStudentForIndex(null);
  };

  const removeStudent = (gradeIndex, studentId) => {
    if (!confirm("Remove this student?")) return;
    const updated = grades.map((g, i) => {
      if (i !== gradeIndex) return g;
      return { ...g, students: g.students.filter((s) => s.id !== studentId) };
    });
    setGrades(updated);
  };

  const totalStudents = grades.reduce(
    (s, g) => s + (g.students?.length || 0),
    0
  );

  const totalGrades = grades.length;

  return (
    <div className="min-h-screen flex flex-col app-background">
      {/* Navbar */}
      <header ref={navbarRef} className="w-full fixed top-0 left-0 z-50">
        <AdminNavbar />
      </header>

      <div className="flex flex-1 transition-all duration-500">
        {/* Sidebar */}
        <aside
          className={`fixed left-0 z-40 transition-all duration-500 hidden md:block ${
            isSidebarOpen ? "w-64" : "w-0 overflow-hidden"
          }`}
          style={{
            top: `${navbarHeight}px`,
            height: `calc(100vh - ${navbarHeight}px)`,
          }}
        >
          <div className="h-full overflow-y-auto bg-gradient-to-b from-indigo-100 via-blue-100 to-purple-100 shadow-2xl border-r border-indigo-200">
            <AdminSidebar />
          </div>
        </aside>

        {/* Main Content */}
        <main
          className="flex-1 p-8 overflow-y-auto transition-all duration-500"
          style={{
            paddingTop: `${navbarHeight + 130}px`,
            marginLeft: isSidebarOpen ? "16rem" : "0",
          }}
        >
          <h1 className="text-3xl font-bold text-indigo-700 mb-6">
            Manage Grades
          </h1>

          {/* Add new grade section */}
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6">
            <div className="flex gap-4">
              <div className="bg-white/80 p-4 rounded-xl shadow-md border border-indigo-100">
                <p className="text-sm text-indigo-600">Grades</p>
                <p className="text-2xl font-bold text-indigo-800">
                  {totalGrades}
                </p>
              </div>
              <div className="bg-white/80 p-4 rounded-xl shadow-md border border-indigo-100">
                <p className="text-sm text-indigo-600">Students</p>
                <p className="text-2xl font-bold text-indigo-800">
                  {totalStudents}
                </p>
              </div>
            </div>

            <div className="bg-white/80 p-4 rounded-xl shadow-md border border-indigo-100 flex gap-3 items-center">
              <input
                value={newGrade}
                onChange={(e) => {
                  setNewGrade(e.target.value);
                  setGradeExists(false);
                }}
                placeholder="Add new grade (e.g. Grade 12)"
                className="p-2 rounded-md border border-indigo-200 outline-none"
              />
              <button
                onClick={addGrade}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-md shadow hover:scale-105 transition"
              >
                <FaPlus className="inline mr-2" /> Add Grade
              </button>
            </div>
          </div>

          {/* Grade exists message */}
          {gradeExists && (
            <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded-lg mb-4 animate-fadeIn">
              ⚠️ This grade already exists!
            </div>
          )}

          {/* Grades list */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="col-span-1">
              <div className="bg-white/80 rounded-2xl p-4 shadow-md border border-indigo-100">
                <h2 className="text-lg font-semibold text-indigo-700 mb-3">
                  Grades
                </h2>
                <ul className="space-y-3">
                  {grades.map((g, idx) => {
                    const stats = mockStatsForGrade(g.name);
                    return (
                      <li
                        key={g.name + idx}
                        className={`p-3 rounded-xl flex justify-between items-center cursor-pointer transition ${
                          selectedGradeIndex === idx
                            ? "bg-indigo-50 border border-indigo-200"
                            : "bg-white"
                        }`}
                      >
                        <div
                          onClick={() => setSelectedGradeIndex(idx)}
                          className="flex items-center gap-3"
                        >
                          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold shadow">
                            {g.name.split(" ").slice(-1)[0]}
                          </div>
                          <div>
                            <div className="font-medium text-indigo-800">
                              {g.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {g.students?.length || 0} students
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="text-xs text-gray-500 mr-2">
                            <div className="flex items-center gap-2">
                              <FaBook /> <span>{stats.subjects}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <FaQuestionCircle /> <span>{stats.quizzes}</span>
                            </div>
                          </div>

                          <button
                            onClick={() => removeGrade(idx)}
                            title="Remove grade"
                            className="px-3 py-2 bg-red-600 text-white rounded-md shadow hover:opacity-90"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            {/* Right: Grade details + students */}
            <div className="col-span-1 lg:col-span-2">
              <div className="bg-white/80 rounded-2xl p-6 shadow-md border border-indigo-100">
                {selectedGradeIndex === null ? (
                  <div className="text-center py-12 text-gray-600">
                    Select a grade to view details and manage students.
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between mb-4">
                      <h3 className="text-2xl font-bold text-indigo-800">
                        {grades[selectedGradeIndex].name}
                      </h3>
                      <div className="text-sm text-gray-500">
                        Created:{" "}
                        {new Date(
                          grades[selectedGradeIndex].createdAt
                        ).toLocaleString()}
                      </div>
                    </div>

                    {/* Students list */}
                    <h4 className="text-lg font-semibold text-indigo-700 mb-3">
                      Registered Students
                    </h4>
                    {grades[selectedGradeIndex].students.length === 0 ? (
                      <p className="text-gray-500">
                        No students registered yet.
                      </p>
                    ) : (
                      grades[selectedGradeIndex].students.map((s) => (
                        <div
                          key={s.id}
                          className="flex justify-between items-center p-3 mb-2 bg-white border rounded-md shadow-sm"
                        >
                          <div>
                            <p className="font-medium text-indigo-800">
                              {s.name}
                            </p>
                            <p className="text-xs text-gray-500">{s.email}</p>
                          </div>
                          <button
                            onClick={() =>
                              removeStudent(selectedGradeIndex, s.id)
                            }
                            className="px-3 py-1 bg-red-600 text-white rounded-md text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      ))
                    )}

                    {/* Add Student */}
                    <div className="mt-6">
                      {!showAddStudentForIndex && (
                        <button
                          onClick={() =>
                            setShowAddStudentForIndex(selectedGradeIndex)
                          }
                          className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-md"
                        >
                          Add Student
                        </button>
                      )}

                      {showAddStudentForIndex === selectedGradeIndex && (
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                          <input
                            value={newStudent.name}
                            onChange={(e) =>
                              setNewStudent({
                                ...newStudent,
                                name: e.target.value,
                              })
                            }
                            placeholder="Full Name"
                            className="p-3 rounded-xl border border-indigo-200"
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
                            className="p-3 rounded-xl border border-indigo-200"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => addStudentToGrade(selectedGradeIndex)}
                              className="px-4 py-2 bg-green-600 text-white rounded-md"
                            >
                              Add
                            </button>
                            <button
                              onClick={() => {
                                setShowAddStudentForIndex(null);
                                setNewStudent({ name: "", email: "" });
                                setEmailError("");
                              }}
                              className="px-4 py-2 bg-gray-200 rounded-md"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Email validation & success */}
                    {emailError && (
                      <div className="mt-3 text-red-600 bg-red-100 border border-red-200 rounded-md p-2 animate-fadeIn">
                        {emailError}
                      </div>
                    )}
                    {sendSuccess && (
                      <div className="mt-3 text-green-700 bg-green-100 border border-green-200 rounded-md p-2 animate-fadeIn flex items-center gap-2">
                        <FaEnvelope /> {sendSuccess}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdmGrades;
