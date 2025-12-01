/* FULL FIXED VERSION: UNIQUE KEYS + CONFIRM DELETE + UNIT DELETE WORKING */
import React, { useState, useEffect, useRef } from "react";
import { FaPlus, FaTrash, FaBookOpen, FaLayerGroup } from "react-icons/fa";
import AdminNavbar from "../../components/layouts/AdminNavbar";
import "../../index.css";
import "../../admin.css";

import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import Alert from "../../components/layouts/Alert";
import ConfirmModal from "../../components/layouts/ConfirmModal";

const DEFAULT_GRADES = [
  "Grade 6",
  "Grade 7",
  "Grade 8",
  "Grade 9",
  "Grade 10",
  "Grade 11",
];

const AdmSubject = () => {
  const navbarRef = useRef(null);
  const [navbarHeight, setNavbarHeight] = useState(85);

  const [subjects, setSubjects] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [newUnit, setNewUnit] = useState({ name: "", content: "" });

  const [loadingGrades, setLoadingGrades] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [addingSubject, setAddingSubject] = useState(false);
  const [addingUnit, setAddingUnit] = useState(false);
  const [removingSubjectId, setRemovingSubjectId] = useState(null);
  const [removingUnitId, setRemovingUnitId] = useState(null);

  // ALERT
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("success");

  // CONFIRM MODAL
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmTitle, setConfirmTitle] = useState("Confirm");
  const [confirmHandler, setConfirmHandler] = useState(() => {});

  // Auto-hide alert
  useEffect(() => {
    if (alertMessage) {
      const t = setTimeout(() => setAlertMessage(""), 3000);
      return () => clearTimeout(t);
    }
  }, [alertMessage]);

  const currentGradeObj =
    subjects.find((g) => String(g.gradeId) === String(selectedGrade)) || null;

  const currentSubjectObj =
    currentGradeObj?.subjects?.find((s) => s.name === selectedSubject) || null;

  useEffect(() => {
    const updateHeight = () => {
      if (navbarRef.current) setNavbarHeight(navbarRef.current.offsetHeight);
    };
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  // ---------------------------
  // FETCH GRADES + SUBJECT COUNTS
  // ---------------------------
  useEffect(() => {
    const fetchGrades = async () => {
      setLoadingGrades(true);
      try {
        const res = await axiosInstance.get(API_PATHS.ADMIN.GRADES);
        const grades = res.data?.grades || [];

        let container = grades.map((g) => ({
          grade: g.name,
          gradeId: g._id,
          subjects: [],
        }));

        if (container.length === 0) {
          container = DEFAULT_GRADES.map((g) => ({
            grade: g,
            gradeId: null,
            subjects: [],
          }));
        }

        setSubjects(container);
        setSelectedGrade(container[0]?.gradeId || "");

        // Load subject count for each grade
        for (const g of container) {
          try {
            const subRes = await axiosInstance.get(API_PATHS.ADMIN.GET_SUBJECTS, {
              params: { gradeId: g.gradeId },
            });

            const list = subRes.data?.subjects || [];

            setSubjects((prev) =>
              prev.map((item) =>
                item.gradeId === g.gradeId ? { ...item, subjects: list } : item
              )
            );
          } catch {}
        }
      } catch (err) {
        setAlertType("error");
        setAlertMessage("Failed to load grade list.");
      } finally {
        setLoadingGrades(false);
      }
    };

    fetchGrades();
  }, []);

  // ---------------------------
  // FETCH SUBJECTS FOR SELECTED GRADE
  // ---------------------------
  useEffect(() => {
    if (!selectedGrade) return;

    const fetchSubjects = async () => {
      setLoadingSubjects(true);
      try {
        const res = await axiosInstance.get(API_PATHS.ADMIN.GET_SUBJECTS, {
          params: { gradeId: selectedGrade },
        });

        const apiSubjects = res.data?.subjects || [];
        const transformed = apiSubjects.map((s) => ({
          name: s.name,
          subjectId: s._id,
          units: (s.units || []).map((u) => ({
            id: u._id || u.id,
            name: u.name,
            content: u.content,
          })),
        }));

        setSubjects((prev) =>
          prev.map((g) =>
            String(g.gradeId) === String(selectedGrade)
              ? { ...g, subjects: transformed }
              : g
          )
        );
      } catch (err) {
        setAlertType("error");
        setAlertMessage("Failed to load subjects.");
      } finally {
        setLoadingSubjects(false);
      }
    };

    fetchSubjects();
  }, [selectedGrade]);

  // ---------------------------
  // ADD SUBJECT
  // ---------------------------
  const addSubject = async () => {
    if (!selectedGrade) {
      setAlertType("error");
      setAlertMessage("Select a grade first!");
      return;
    }

    const name = newSubject.trim();
    if (!name) {
      setAlertType("error");
      setAlertMessage("Enter subject name");
      return;
    }

    const already = currentGradeObj?.subjects?.some(
      (s) => s.name.toLowerCase() === name.toLowerCase()
    );
    if (already) {
      setAlertType("error");
      setAlertMessage("Subject already exists!");
      return;
    }

    setAddingSubject(true);
    try {
      const res = await axiosInstance.post(API_PATHS.ADMIN.ADD_SUBJECT, {
        gradeId: selectedGrade,
        name,
      });

      const s = res.data.subject;
      const newSub = {
        name: s.name,
        subjectId: s._id,
        units: [],
      };

      setSubjects((prev) =>
        prev.map((g) =>
          g.gradeId === selectedGrade ? { ...g, subjects: [...g.subjects, newSub] } : g
        )
      );

      setNewSubject("");
      setSelectedSubject(newSub.name);

      setAlertType("success");
      setAlertMessage("Subject added successfully!");
    } catch {
      setAlertType("error");
      setAlertMessage("Failed to add subject.");
    } finally {
      setAddingSubject(false);
    }
  };

  // ---------------------------
  // DELETE SUBJECT WITH MODAL
  // ---------------------------
  const removeSubject = (subjectName) => {
    const subj = currentGradeObj.subjects.find((s) => s.name === subjectName);
    if (!subj) return;

    setConfirmTitle("Delete Subject?");
    setConfirmMessage(`Are you sure you want to delete subject "${subjectName}"?`);

    setConfirmHandler(() => async () => {
      setConfirmOpen(false);
      setRemovingSubjectId(subj.subjectId);

      try {
        await axiosInstance.post(API_PATHS.ADMIN.REMOVE_SUBJECT, {
          subjectId: subj.subjectId,
        });

        setSubjects((prev) =>
          prev.map((g) =>
            g.gradeId === selectedGrade
              ? { ...g, subjects: g.subjects.filter((s) => s.subjectId !== subj.subjectId) }
              : g
          )
        );

        if (selectedSubject === subjectName) setSelectedSubject("");

        setAlertType("success");
        setAlertMessage("Subject removed successfully!");
      } catch {
        setAlertType("error");
        setAlertMessage("Failed to delete subject.");
      } finally {
        setRemovingSubjectId(null);
      }
    });

    setConfirmOpen(true);
  };

  // ---------------------------
  // ADD UNIT
  // ---------------------------
  const addUnit = async () => {
    const subj = currentGradeObj.subjects.find((s) => s.name === selectedSubject);
    if (!subj) {
      setAlertType("error");
      setAlertMessage("Subject not found");
      return;
    }

    const name = newUnit.name.trim();
    const content = newUnit.content.trim();
    if (!name || !content) {
      setAlertType("error");
      setAlertMessage("Enter unit details");
      return;
    }

    setAddingUnit(true);
    try {
      const res = await axiosInstance.post(API_PATHS.ADMIN.ADD_UNIT, {
        subjectId: subj.subjectId,
        name,
        content,
      });

      const updated = res.data.subject;

      const updatedUnits = updated.units.map((u) => ({
        id: u._id || u.id,
        name: u.name,
        content: u.content,
      }));

      setSubjects((prev) =>
        prev.map((g) =>
          g.gradeId === selectedGrade
            ? {
                ...g,
                subjects: g.subjects.map((s) =>
                  s.subjectId === subj.subjectId ? { ...s, units: updatedUnits } : s
                ),
              }
            : g
        )
      );

      setNewUnit({ name: "", content: "" });

      setAlertType("success");
      setAlertMessage("Unit added successfully!");
    } catch {
      setAlertType("error");
      setAlertMessage("Failed to add unit");
    } finally {
      setAddingUnit(false);
    }
  };

  // ---------------------------
  // DELETE UNIT WITH MODAL
  // ---------------------------
  const removeUnit = (unitId) => {
    const subj = currentGradeObj.subjects.find((s) => s.name === selectedSubject);
    if (!subj) return;

    setConfirmTitle("Delete Unit?");
    setConfirmMessage("Are you sure you want to delete this unit?");

    setConfirmHandler(() => async () => {
      setConfirmOpen(false);
      setRemovingUnitId(unitId);

      try {
        const res = await axiosInstance.post(API_PATHS.ADMIN.REMOVE_UNIT, {
          subjectId: subj.subjectId,
          unitId,
        });

        const updated = res.data.subject;

        const updatedUnits = updated.units.map((u) => ({
          id: u._id || u.id,
          name: u.name,
          content: u.content,
        }));

        setSubjects((prev) =>
          prev.map((g) =>
            g.gradeId === selectedGrade
              ? {
                  ...g,
                  subjects: g.subjects.map((s) =>
                    s.subjectId === subj.subjectId ? { ...s, units: updatedUnits } : s
                  ),
                }
              : g
          )
        );

        setAlertType("success");
        setAlertMessage("Unit removed successfully!");
      } catch {
        setAlertType("error");
        setAlertMessage("Failed to remove unit");
      } finally {
        setRemovingUnitId(null);
      }
    });

    setConfirmOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col app-background">
      <header ref={navbarRef} className="w-full fixed top-0 left-0 z-50">
        <AdminNavbar />
      </header>

      <main className="flex-1 p-8 overflow-y-auto" style={{ paddingTop: navbarHeight + 130 }}>
        <h1 className="text-3xl font-bold text-indigo-700 mb-6">Manage Subjects & Units</h1>

        <Alert type={alertType} message={alertMessage} />

        {/* --------------------- GRADE SELECT --------------------- */}
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
                <option
                  key={g.gradeId || g.grade}
                  value={g.gradeId}
                >
                  {g.grade}
                </option>
              ))}
            </select>
          </div>

          {/* ADD SUBJECT */}
          <div className="flex gap-3 items-center">
            <input
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              placeholder="Add new subject"
              className="p-2 border border-indigo-200 rounded-md bg-white"
            />
            <button
              onClick={addSubject}
              disabled={addingSubject}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-md"
            >
              {addingSubject ? "Adding..." : "Add Subject"}
            </button>
          </div>
        </div>

        {/* --------------------- GRADE CARDS --------------------- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {subjects.map((g) => (
            <div
              key={g.gradeId || g.grade}
              className={`p-5 rounded-xl border shadow-md ${
                g.gradeId === selectedGrade
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

        {/* --------------------- SUBJECT SELECT --------------------- */}
        {currentGradeObj && currentGradeObj.subjects.length > 0 && (
          <div className="flex gap-3 items-center mb-6">
            <label className="text-indigo-700 font-semibold">Select Subject:</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="p-2 border border-indigo-200 rounded-md bg-white"
            >
              <option value="">-- Select Subject --</option>

              {currentGradeObj.subjects.map((s) => (
                <option
                  key={s.subjectId || s.name}
                  value={s.name}
                >
                  {s.name} ({s.units.length} units)
                </option>
              ))}
            </select>

            {selectedSubject && (
              <button
                onClick={() => removeSubject(selectedSubject)}
                disabled={Boolean(removingSubjectId)}
                className="px-3 py-2 bg-red-600 text-white rounded-md"
              >
                {removingSubjectId ? "Removing..." : "Delete Subject"}
              </button>
            )}
          </div>
        )}

        {/* --------------------- UNIT MANAGEMENT --------------------- */}
        {selectedSubject && (
          <>
            <h3 className="text-2xl font-semibold text-indigo-700 mb-4 flex items-center gap-2">
              <FaBookOpen /> {selectedSubject} Units
            </h3>

            {/* ADD UNIT */}
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
                disabled={addingUnit}
                className="px-4 py-2 bg-green-600 text-white rounded-md"
              >
                {addingUnit ? "Adding..." : "Add Unit"}
              </button>
            </div>

            {/* UNIT LIST */}
            {currentSubjectObj?.units.length === 0 ? (
              <p className="text-gray-500">No units yet. Add lessons using the form above.</p>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {currentSubjectObj.units.map((u) => (
                  <div key={u.id || u._id} className="p-4 bg-white/80 border rounded-xl shadow-md">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-indigo-800">{u.name}</h4>
                        <p className="text-gray-700 text-sm">{u.content}</p>
                      </div>
                      <button
                        onClick={() => removeUnit(u.id || u._id)}
                        disabled={Boolean(removingUnitId)}
                        className="text-red-600 hover:text-red-800"
                      >
                        {removingUnitId === u.id ? "Removing..." : <FaTrash />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* CONFIRM MODAL */}
        <ConfirmModal
          open={confirmOpen}
          title={confirmTitle}
          message={confirmMessage}
          onConfirm={async () => {
            try {
              await confirmHandler();
            } catch (err) {
              console.error(err);
            }
          }}
          onCancel={() => setConfirmOpen(false)}
        />
      </main>
    </div>
  );
};

export default AdmSubject;
