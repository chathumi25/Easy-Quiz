import React, { useState, useEffect, useRef } from "react";
import StudentNavbar from "../../components/layouts/StudentNavbar";
import "../../index.css";
import "../../student.css";

import { FaBookOpen, FaLayerGroup, FaCheckCircle, FaPlay } from "react-icons/fa";

import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";

const PROGRESS_KEY = "easyquiz_student_progress_v2";

function StdSubject() {
  const navbarRef = useRef(null);
  const [navbarHeight, setNavbarHeight] = useState(85);

  const [loading, setLoading] = useState(true);
  const [studentGradeId, setStudentGradeId] = useState("");
  const [studentGradeName, setStudentGradeName] = useState("");

  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState(""); // ← FIXED (use empty string)

  const [progress, setProgress] = useState({});

  // Load stored progress
  useEffect(() => {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (raw) {
      try {
        setProgress(JSON.parse(raw));
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  }, [progress]);

  // Navbar height
  useEffect(() => {
    const updateHeight = () => {
      if (navbarRef.current) setNavbarHeight(navbarRef.current.offsetHeight);
    };
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  // Load student profile → grade
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await axiosInstance.get(API_PATHS.STUDENT.PROFILE);
        const gradeObj = res.data?.profile?.grade;

        if (gradeObj) {
          setStudentGradeId(gradeObj.gradeId);
          setStudentGradeName(gradeObj.name);
        }
      } catch {
        console.log("Failed to load student profile");
      }
    };

    loadProfile();
  }, []);

  // Load subjects for student's grade
  useEffect(() => {
    if (!studentGradeId) return;

    const loadSubjects = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(API_PATHS.STUDENT.SUBJECTS);

        const apiSubjects = res.data?.subjects || [];

        // FIXED FIELD MAPPING FOR BACKEND MATCH
        setSubjects(
          apiSubjects.map((s) => ({
            subjectId: s._id,
            name: s.name,
            units: (s.units || []).map((u) => ({
              id: u._id,
              name: u.name,
              content: u.content,
            })),
          }))
        );
      } catch (err) {
        console.log("Failed to load subjects");
      } finally {
        setLoading(false);
      }
    };

    loadSubjects();
  }, [studentGradeId]);

  const currentSubject =
    subjects.find((s) => s.subjectId === selectedSubjectId) || null;

  // Mark complete toggle
  const toggleComplete = (subjectId, unitId) => {
    const key = `${subjectId}_${unitId}`;
    setProgress((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Calculate progress percentage
  const getProgressPercent = (subjectId) => {
    const subject = subjects.find((s) => s.subjectId === subjectId);
    if (!subject || !subject.units.length) return 0;

    const completedCount = subject.units.filter(
      (u) => progress[`${subjectId}_${u.id}`]
    ).length;

    return Math.round((completedCount / subject.units.length) * 100);
  };

  return (
    <div className="min-h-screen flex flex-col app-background">
      <header ref={navbarRef} className="w-full fixed top-0 left-0 z-50">
        <StudentNavbar />
      </header>

      <main
        className="flex-1 p-8 overflow-y-auto"
        style={{ paddingTop: navbarHeight + 120 }}
      >
        <h1 className="text-3xl font-bold text-indigo-700 mb-6">
          My Subjects & Units
        </h1>

        {studentGradeName && (
          <div className="mb-6 text-lg text-gray-700">
            📘 <strong>Your Grade:</strong> {studentGradeName}
          </div>
        )}

        {/* ----------------------------- */}
        {/* SUBJECT LIST PAGE */}
        {/* ----------------------------- */}
        {selectedSubjectId === "" && (
          <>
            <h2 className="text-2xl font-semibold text-indigo-700 mb-4 flex items-center gap-2">
              <FaLayerGroup /> Subjects in {studentGradeName}
            </h2>

            {loading ? (
              <p>Loading subjects...</p>
            ) : subjects.length === 0 ? (
              <p className="text-gray-500">No subjects available.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {subjects.map((s) => (
                  <div
                    key={s.subjectId}
                    className="student-card p-5 rounded-xl shadow-md bg-white/80 border border-indigo-100 hover:shadow-lg transition cursor-pointer"
                    onClick={() => setSelectedSubjectId(s.subjectId)} // ← SELECT SUBJECT
                  >
                    <h2 className="text-xl font-semibold text-indigo-700 flex items-center gap-2">
                      <FaBookOpen /> {s.name}
                    </h2>

                    <p className="text-gray-600">{s.units.length} Units</p>

                    <p className="text-sm text-gray-500 mt-2">
                      Progress:{" "}
                      <strong className="text-indigo-700">
                        {getProgressPercent(s.subjectId)}%
                      </strong>
                    </p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ----------------------------- */}
        {/* SUBJECT DETAIL PAGE */}
        {/* ----------------------------- */}
        {selectedSubjectId !== "" && currentSubject && (
          <div className="mt-6">
            {/* BACK BUTTON FIXED */}
            <button
              className="mb-4 text-indigo-600 hover:underline"
              onClick={() => setSelectedSubjectId("")}
            >
              ← Back to Subjects
            </button>

            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-semibold text-indigo-800 flex items-center gap-2">
                <FaBookOpen /> {currentSubject.name} Units
              </h3>

              <span className="text-sm text-gray-600">
                Progress:{" "}
                <strong className="text-indigo-700">
                  {getProgressPercent(selectedSubjectId)}%
                </strong>
              </span>
            </div>

            {currentSubject.units.length === 0 ? (
              <p className="text-gray-500">No units added by admin.</p>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {currentSubject.units.map((u) => {
                  const done = progress[`${selectedSubjectId}_${u.id}`];

                  return (
                    <div
                      key={u.id}
                      className={`p-5 rounded-xl shadow-md border ${
                        done
                          ? "bg-green-50 border-green-300"
                          : "bg-white/80 border-indigo-100"
                      }`}
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
                            toggleComplete(selectedSubjectId, u.id)
                          }
                          className={`px-3 py-1 rounded-md text-sm transition font-medium ${
                            done
                              ? "bg-green-600 text-white"
                              : "bg-indigo-600 text-white hover:bg-indigo-700"
                          }`}
                        >
                          {done ? (
                            <>
                              <FaCheckCircle className="inline mr-1" /> Done
                            </>
                          ) : (
                            "Mark Complete"
                          )}
                        </button>
                      </div>

                      <button className="mt-4 w-full bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700 flex justify-center items-center gap-2">
                        <FaPlay /> Start Quiz
                      </button>
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
