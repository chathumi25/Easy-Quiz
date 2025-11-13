import React, { useState, useEffect, useRef } from "react";
import StudentNavbar from "../../components/layouts/StudentNavbar";
import "../../index.css";
import "../../student.css";
import { FaBookOpen, FaLayerGroup, FaCheckCircle, FaClock } from "react-icons/fa";

const STORAGE_KEY = "easyquiz_admin_subjects_v6"; // Admin's created subjects
const PROGRESS_KEY = "easyquiz_student_progress_v1"; // Student progress data
const RECENT_KEY = "easyquiz_recent_units_v1"; // Recently learned tracking

function StdSubject() {
  const navbarRef = useRef(null);
  const [navbarHeight, setNavbarHeight] = useState(85);
  const [subjects, setSubjects] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [progress, setProgress] = useState({});
  const [recent, setRecent] = useState([]); // store recently learned units

  // ✅ Load subjects (read-only)
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setSubjects(JSON.parse(raw));
      } catch {
        console.warn("Invalid subject data");
      }
    }
  }, []);

  // ✅ Load progress
  useEffect(() => {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (raw) {
      try {
        setProgress(JSON.parse(raw));
      } catch {
        console.warn("Invalid progress data");
      }
    }
  }, []);

  // ✅ Load recent learned
  useEffect(() => {
    const raw = localStorage.getItem(RECENT_KEY);
    if (raw) {
      try {
        setRecent(JSON.parse(raw));
      } catch {
        console.warn("Invalid recent data");
      }
    }
  }, []);

  // ✅ Save progress & recent changes
  useEffect(() => {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  }, [progress]);

  useEffect(() => {
    localStorage.setItem(RECENT_KEY, JSON.stringify(recent));
  }, [recent]);

  // ✅ Handle navbar height dynamically
  useEffect(() => {
    const updateHeight = () => {
      if (navbarRef.current) setNavbarHeight(navbarRef.current.offsetHeight);
    };
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  // ✅ Mark unit as completed (and track recent)
  const toggleComplete = (grade, subject, unitId, unitName) => {
    const key = `${grade}_${subject}_${unitId}`;
    const isNowDone = !progress[key];

    setProgress((prev) => ({
      ...prev,
      [key]: isNowDone,
    }));

    if (isNowDone) {
      // Add to recent
      const newEntry = {
        id: Date.now(),
        grade,
        subject,
        unitId,
        unitName,
        date: new Date().toLocaleString(),
      };
      setRecent((prev) => {
        const updated = [newEntry, ...prev.filter((r) => r.unitId !== unitId)];
        return updated.slice(0, 5); // keep max 5
      });
    } else {
      // Remove from recent if unmarked
      setRecent((prev) => prev.filter((r) => r.unitId !== unitId));
    }
  };

  // ✅ Helper: get progress percentage
  const getProgressPercent = (grade, subject, units) => {
    if (!units || units.length === 0) return 0;
    const completed = units.filter((u) => progress[`${grade}_${subject}_${u.id}`]);
    return Math.round((completed.length / units.length) * 100);
  };

  const currentGrade = subjects.find((g) => g.grade === selectedGrade);
  const currentSubject =
    currentGrade?.subjects.find((s) => s.name === selectedSubject) || null;

  return (
    <div className="min-h-screen flex flex-col app-background">
      {/* Navbar */}
      <header ref={navbarRef} className="w-full fixed top-0 left-0 z-50">
        <StudentNavbar />
      </header>

      {/* Main Content */}
      <main
        className="flex-1 p-8 overflow-y-auto transition-all duration-500"
        style={{
          paddingTop: `${navbarHeight + 130}px`,
        }}
      >
        <h1 className="text-3xl font-bold text-indigo-700 mb-6">
          My Subjects & Lessons
        </h1>

        {/* 📘 Recently Learned Section */}
        {recent.length > 0 && (
          <div className="mb-10">
            <h2 className="text-2xl font-semibold text-indigo-700 mb-4 flex items-center gap-2">
              <FaClock /> Recently Learned
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recent.map((r) => (
                <div
                  key={r.id}
                  className="p-5 bg-white/90 border border-indigo-100 rounded-xl shadow-md hover:shadow-lg transition"
                >
                  <h4 className="text-lg font-bold text-indigo-700">
                    {r.unitName}
                  </h4>
                  <p className="text-gray-700 text-sm mt-1">
                    <strong>{r.subject}</strong> — {r.grade}
                  </p>
                  <p className="text-gray-500 text-xs mt-2">
                    <FaCheckCircle className="inline mr-1 text-green-600" />
                    Completed on {r.date}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Grade Selector */}
        <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <label className="text-indigo-700 font-semibold">
              Select Grade:
            </label>
            <select
              value={selectedGrade}
              onChange={(e) => {
                setSelectedGrade(e.target.value);
                setSelectedSubject("");
              }}
              className="p-2 border border-indigo-200 rounded-md bg-white"
            >
              <option value="">-- Select Grade --</option>
              {subjects.map((g) => (
                <option key={g.grade} value={g.grade}>
                  {g.grade}
                </option>
              ))}
            </select>
          </div>

          {currentGrade && (
            <div className="flex items-center gap-3">
              <label className="text-indigo-700 font-semibold">
                Select Subject:
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="p-2 border border-indigo-200 rounded-md bg-white"
              >
                <option value="">-- Select Subject --</option>
                {currentGrade.subjects.map((s) => (
                  <option key={s.name} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Display Grade Cards */}
        {!selectedGrade && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {subjects.map((g) => (
              <div
                key={g.grade}
                className="student-card p-5 rounded-xl shadow-md bg-white/80 border border-indigo-100 hover:shadow-lg transition cursor-pointer"
                onClick={() => setSelectedGrade(g.grade)}
              >
                <h2 className="text-xl font-semibold text-indigo-700 flex items-center gap-2">
                  <FaLayerGroup /> {g.grade}
                </h2>
                <p className="text-gray-600">{g.subjects.length} Subjects</p>
              </div>
            ))}
          </div>
        )}

        {/* Subject Units */}
        {selectedGrade && selectedSubject && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-semibold text-indigo-800 flex items-center gap-2">
                <FaBookOpen /> {selectedSubject} Units
              </h3>
              <span className="text-sm text-gray-600">
                Progress:{" "}
                <strong className="text-indigo-700">
                  {getProgressPercent(
                    selectedGrade,
                    selectedSubject,
                    currentSubject?.units || []
                  )}
                  %
                </strong>
              </span>
            </div>

            {currentSubject?.units.length === 0 ? (
              <p className="text-gray-500">
                No units added by admin for this subject.
              </p>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {currentSubject.units.map((u) => {
                  const isDone =
                    progress[`${selectedGrade}_${selectedSubject}_${u.id}`];
                  return (
                    <div
                      key={u.id}
                      className={`p-5 rounded-xl shadow-md border ${
                        isDone
                          ? "bg-green-50 border-green-300"
                          : "bg-white/80 border-indigo-100"
                      } transition`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-indigo-800">
                            {u.name}
                          </h4>
                          <p className="text-gray-700 text-sm">{u.content}</p>
                        </div>
                        <button
                          onClick={() =>
                            toggleComplete(
                              selectedGrade,
                              selectedSubject,
                              u.id,
                              u.name
                            )
                          }
                          className={`px-3 py-1 rounded-md text-sm font-medium transition ${
                            isDone
                              ? "bg-green-600 text-white"
                              : "bg-indigo-600 text-white hover:bg-indigo-700"
                          }`}
                        >
                          {isDone ? (
                            <>
                              <FaCheckCircle className="inline mr-1" /> Done
                            </>
                          ) : (
                            "Mark Complete"
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default StdSubject;
