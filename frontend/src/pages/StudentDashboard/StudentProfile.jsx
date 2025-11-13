import React, { useState, useEffect, useRef } from "react";
import { FaCamera, FaLock } from "react-icons/fa";
import StudentNavbar from "../../components/layouts/StudentNavbar";
import "../../index.css";

const StudentProfile = () => {
  const user = JSON.parse(localStorage.getItem("user")) || {
    name: "Student",
    email: "student@easyquiz.com",
    grade: "Grade 10",
    role: "Student",
    profileImage: "",
  };

  const [profileImage, setProfileImage] = useState(user.profileImage);
  const [tempImage, setTempImage] = useState(profileImage);
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [navbarHeight, setNavbarHeight] = useState(85);
  const navbarRef = useRef(null);
  const fileInputRef = useRef(null);

  // ✅ Auto-detect Navbar height dynamically
  useEffect(() => {
    const updateNavbarHeight = () => {
      if (navbarRef.current) setNavbarHeight(navbarRef.current.offsetHeight);
    };
    updateNavbarHeight();
    window.addEventListener("resize", updateNavbarHeight);
    return () => window.removeEventListener("resize", updateNavbarHeight);
  }, []);

  // ✅ Get initial letter
  const getInitial = (name) =>
    name && name.length > 0 ? name[0].toUpperCase() : "U";

  // ✅ Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageURL = URL.createObjectURL(file);
      setTempImage(imageURL);
    }
  };

  // ✅ Save Profile
  const handleSaveProfile = () => {
    setProfileImage(tempImage);
    localStorage.setItem(
      "user",
      JSON.stringify({ ...user, profileImage: tempImage })
    );
    alert("✅ Profile updated successfully!");
  };

  // ✅ Change Password
  const handleChangePassword = () => {
    const { current, new: newPass, confirm } = passwords;
    if (!current || !newPass || !confirm)
      return alert("⚠️ Please fill out all fields.");
    if (newPass !== confirm) return alert("❌ Passwords do not match!");
    alert("✅ Password changed successfully!");
    setPasswords({ current: "", new: "", confirm: "" });
  };

  return (
    <div className="min-h-screen flex flex-col app-background">
      {/* Navbar */}
      <header ref={navbarRef} className="w-full fixed top-0 left-0 z-50">
        <StudentNavbar />
      </header>

      {/* Main Content */}
      <main
        className="flex-1 flex justify-center items-start p-10 mt-10 overflow-y-auto"
        style={{
          paddingTop: `${navbarHeight + 60}px`,
        }}
      >
        <div className="w-full max-w-3xl bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-10 border border-indigo-100">
          {/* Header */}
          <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-indigo-700 to-purple-800 bg-clip-text text-transparent mb-8">
            Student Profile Settings
          </h2>

          {/* Profile Section */}
          <div className="flex flex-col items-center">
            <div className="relative w-32 h-32 rounded-full border-4 border-indigo-300 shadow-xl overflow-hidden">
              {tempImage ? (
                <img
                  src={tempImage}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold">
                  {getInitial(user.name)}
                </div>
              )}
              <button
                onClick={() => fileInputRef.current.click()}
                className="absolute bottom-1 right-1 bg-indigo-600 text-white p-3 rounded-full hover:bg-indigo-700 shadow-md transition"
              >
                <FaCamera />
              </button>
            </div>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageChange}
              className="hidden"
            />

            <button
              onClick={handleSaveProfile}
              className="mt-6 px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-md hover:scale-105 transition"
            >
              Save Profile
            </button>
          </div>

          {/* Info Section */}
          <div className="mt-10 space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Full Name
              </label>
              <input
                type="text"
                defaultValue={user.name}
                className="w-full p-3 rounded-xl border border-indigo-200 bg-white/70 text-gray-800 focus:ring-2 focus:ring-indigo-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Email</label>
              <input
                type="email"
                defaultValue={user.email}
                className="w-full p-3 rounded-xl border border-indigo-200 bg-white/70 text-gray-800 focus:ring-2 focus:ring-indigo-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Grade</label>
              <input
                type="text"
                defaultValue={user.grade}
                className="w-full p-3 rounded-xl border border-indigo-200 bg-white/70 text-gray-800 focus:ring-2 focus:ring-indigo-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Role</label>
              <input
                type="text"
                value={user.role}
                readOnly
                className="w-full p-3 rounded-xl border border-indigo-200 bg-gray-100 text-gray-600"
              />
            </div>
          </div>

          {/* Change Password Section */}
          <div className="mt-10 border-t border-indigo-200 pt-8">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FaLock className="text-indigo-600" /> Change Password
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="password"
                placeholder="Current Password"
                value={passwords.current}
                onChange={(e) =>
                  setPasswords({ ...passwords, current: e.target.value })
                }
                className="p-3 rounded-xl border border-indigo-200 bg-white/70 focus:ring-2 focus:ring-indigo-400"
              />
              <input
                type="password"
                placeholder="New Password"
                value={passwords.new}
                onChange={(e) =>
                  setPasswords({ ...passwords, new: e.target.value })
                }
                className="p-3 rounded-xl border border-indigo-200 bg-white/70 focus:ring-2 focus:ring-indigo-400"
              />
              <input
                type="password"
                placeholder="Confirm Password"
                value={passwords.confirm}
                onChange={(e) =>
                  setPasswords({ ...passwords, confirm: e.target.value })
                }
                className="p-3 rounded-xl border border-indigo-200 bg-white/70 focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <button
              onClick={handleChangePassword}
              className="mt-6 px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow-md hover:scale-105 transition"
            >
              Update Password
            </button>
          </div>

          {/* About Section */}
          <div className="mt-10 border-t border-indigo-200 pt-8">
            <h3 className="text-xl font-semibold text-indigo-700 mb-4">
              About Student Role
            </h3>
            <p className="text-gray-700 leading-relaxed">
              As a student, you can explore quizzes by subject and grade,
              participate in assessments, and monitor your learning progress
              through your dashboard. Stay consistent, keep practicing, and grow
              your knowledge every day with EasyQuiz!
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentProfile;
