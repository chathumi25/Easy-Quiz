import React, { useState, useEffect, useRef } from "react";
import { FaPlus, FaTrash, FaBookOpen, FaLayerGroup } from "react-icons/fa";
import AdminNavbar from "../../components/layouts/AdminNavbar";
import "../../index.css";
import "../../admin.css";

const STORAGE_KEY = "easyquiz_admin_subjects_v6";
const DEFAULT_GRADES = [
  "Grade 6",
  "Grade 7",
  "Grade 8",
  "Grade 9",
  "Grade 10",
  "Grade 11",
];

// Helper to create default data
const createDefaultData = () =>
  DEFAULT_GRADES.map((g) => ({ grade: g, subjects: [] }));

const AdmSubject = () => {
  const navbarRef = useRef(null);
  const [navbarHeight, setNavbarHeight] = useState(85);

  const [subjects, setSubjects] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn("Invalid stored data, resetting to defaults.", e);
    }
    const initial = createDefaultData();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  });

  const [selectedGrade, setSelectedGrade] = useState(() => DEFAULT_GRADES[0] || "");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [newUnit, setNewUnit] = useState({ name: "", content: "" });

  // keep localStorage in sync
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(subjects));
    } catch (e) {
      console.error("Failed to save subjects to localStorage:", e);
    }
  }, [subjects]);

  // capture navbar height
  useEffect(() => {
    const updateHeight = () => {
      if (navbarRef.current) setNavbarHeight(navbarRef.current.offsetHeight);
    };
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  // derived helpers
  const currentGrade = subjects.find((g) => g.grade === selectedGrade) || null;
  const currentSubject =
    currentGrade?.subjects.find((s) => s.name === selectedSubject) || null;

  // Add subject
  const addSubject = () => {
    if (!selectedGrade) return alert("Please select a grade first!");
    const name = (newSubject || "").trim();
    if (!name) return alert("Enter a subject name.");

    setSubjects((prev) =>
      prev.map((g) => {
        if (g.grade !== selectedGrade) return g;
        if (g.subjects.some((s) => s.name.toLowerCase() === name.toLowerCase())) {
          alert("This subject already exists in this grade!");
          return g;
        }
        return { ...g, subjects: [...g.subjects, { name, units: [] }] };
      })
    );

    setNewSubject("");
    setSelectedSubject(name);
  };

  // Remove subject
  const removeSubject = (subjectName) => {
    if (!window.confirm(`Delete ${subjectName}?`)) return;
    setSubjects((prev) =>
      prev.map((g) =>
        g.grade === selectedGrade
          ? { ...g, subjects: g.subjects.filter((s) => s.name !== subjectName) }
          : g
      )
    );
    if (selectedSubject === subjectName) setSelectedSubject("");
  };

  // Add unit
  const addUnit = () => {
    if (!selectedGrade || !selectedSubject)
      return alert("Select a grade and subject before adding a unit!");
    const name = (newUnit.name || "").trim();
    const content = (newUnit.content || "").trim();
    if (!name || !content) return alert("Enter both unit name and description!");

    const newUnitObj = { id: Date.now(), name, content };

    setSubjects((prev) =>
      prev.map((g) =>
        g.grade === selectedGrade
          ? {
              ...g,
              subjects: g.subjects.map((s) =>
                s.name === selectedSubject
                  ? { ...s, units: [...s.units, newUnitObj] }
                  : s
              ),
            }
          : g
      )
    );

    setNewUnit({ name: "", content: "" });
  };

  // Remove unit
  const removeUnit = (unitId) => {
    setSubjects((prev) =>
      prev.map((g) =>
        g.grade === selectedGrade
          ? {
              ...g,
              subjects: g.subjects.map((s) =>
                s.name === selectedSubject
                  ? { ...s, units: s.units.filter((u) => u.id !== unitId) }
                  : s
              ),
            }
          : g
      )
    );
  };

  useEffect(() => {
    if (!subjects.some((g) => g.grade === selectedGrade)) {
      setSelectedGrade(subjects[0]?.grade || "");
      setSelectedSubject("");
    }
  }, [subjects, selectedGrade]);

  return (
    <div className="min-h-screen flex flex-col app-background">
      {/* Navbar */}
      <header ref={navbarRef} className="w-full fixed top-0 left-0 z-50">
        <AdminNavbar />
      </header>

      {/* Main Section */}
      <main
        className="flex-1 p-8 overflow-y-auto transition-all duration-500"
        style={{
          paddingTop: `${navbarHeight + 130}px`,
          marginLeft: "0", // No sidebar now
        }}
      >
        <h1 className="text-3xl font-bold text-indigo-700 mb-6">
          Manage Subjects & Units
        </h1>

        {/* Grade + Add Subject row */}
        <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <label className="text-indigo-700 font-semibold">Select Grade:</label>
            <select
              value={selectedGrade}
              onChange={(e) => {
                setSelectedGrade(e.target.value);
                setSelectedSubject("");
              }}
              className="p-2 border border-indigo-200 rounded-md bg-white"
            >
              {subjects.map((g) => (
                <option key={g.grade} value={g.grade}>
                  {g.grade}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 items-center">
            <input
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              placeholder="Add new subject"
              className="p-2 border border-indigo-200 rounded-md bg-white"
            />
            <button
              onClick={addSubject}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-md"
            >
              <FaPlus className="inline mr-2" /> Add Subject
            </button>
          </div>
        </div>

        {/* Grade Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {subjects.map((g) => (
            <div
              key={g.grade}
              className={`p-5 rounded-xl border shadow-md ${
                selectedGrade === g.grade
                  ? "bg-indigo-50 border-indigo-400"
                  : "bg-white border-indigo-100"
              }`}
            >
              <h2 className="text-lg font-bold text-indigo-800 flex items-center gap-2">
                <FaLayerGroup /> {g.grade}
              </h2>
              <p className="text-gray-600 text-sm">{g.subjects.length} Subjects</p>
            </div>
          ))}
        </div>

        {/* Subject Selection */}
        {currentGrade && currentGrade.subjects.length > 0 && (
          <div className="flex gap-3 items-center mb-6">
            <label className="text-indigo-700 font-semibold">Select Subject:</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="p-2 border border-indigo-200 rounded-md bg-white"
            >
              <option value="">-- Select Subject --</option>
              {currentGrade.subjects.map((s) => (
                <option key={s.name} value={s.name}>
                  {s.name} ({s.units.length} units)
                </option>
              ))}
            </select>

            {selectedSubject && (
              <button
                onClick={() => removeSubject(selectedSubject)}
                className="px-3 py-2 bg-red-600 text-white rounded-md"
              >
                <FaTrash className="inline mr-1" /> Delete Subject
              </button>
            )}
          </div>
        )}

        {/* Unit Management */}
        {selectedSubject && (
          <>
            <h3 className="text-2xl font-semibold text-indigo-700 mb-4 flex items-center gap-2">
              <FaBookOpen /> {selectedSubject} Units
            </h3>

            {/* Add Unit */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
              <input
                value={newUnit.name}
                onChange={(e) => setNewUnit({ ...newUnit, name: e.target.value })}
                placeholder="Unit (Lesson) Name"
                className="p-2 border border-indigo-200 rounded-md"
              />
              <input
                value={newUnit.content}
                onChange={(e) => setNewUnit({ ...newUnit, content: e.target.value })}
                placeholder="Lesson Description"
                className="p-2 border border-indigo-200 rounded-md"
              />
              <button
                onClick={addUnit}
                className="px-4 py-2 bg-green-600 text-white rounded-md"
              >
                <FaPlus className="inline mr-1" /> Add Unit
              </button>
            </div>

            {/* Unit List */}
            {currentSubject?.units.length === 0 ? (
              <p className="text-gray-500">
                No units yet. Add lessons using the form above.
              </p>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {currentSubject.units.map((u) => (
                  <div key={u.id} className="p-4 bg-white/80 border rounded-xl shadow-md">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-indigo-800">{u.name}</h4>
                        <p className="text-gray-700 text-sm">{u.content}</p>
                      </div>
                      <button
                        onClick={() => removeUnit(u.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default AdmSubject;
