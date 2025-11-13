import React, { useState, useEffect, useRef } from "react";
import { FaCamera, FaLock, FaTrash } from "react-icons/fa";
import AdminNavbar from "../../components/layouts/AdminNavbar";
import "../../index.css";

const AdminProfile = () => {
  const user = JSON.parse(localStorage.getItem("user")) || {
    name: "Admin",
    email: "admin@easyquiz.com",
    role: "Administrator",
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // ✅ Detect Navbar Height
  useEffect(() => {
    const updateNavbarHeight = () => {
      if (navbarRef.current) setNavbarHeight(navbarRef.current.offsetHeight);
    };
    updateNavbarHeight();
    window.addEventListener("resize", updateNavbarHeight);
    return () => window.removeEventListener("resize", updateNavbarHeight);
  }, []);

  // ✅ Extract first initial
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

  // ✅ Save profile
  const handleSaveProfile = () => {
    setProfileImage(tempImage);
    localStorage.setItem(
      "user",
      JSON.stringify({ ...user, profileImage: tempImage })
    );
    alert("✅ Profile updated successfully!");
  };

  // ✅ Change password
  const handleChangePassword = () => {
    const { current, new: newPass, confirm } = passwords;
    if (!current || !newPass || !confirm)
      return alert("⚠️ Please fill out all fields.");
    if (newPass !== confirm) return alert("❌ Passwords do not match!");
    alert("✅ Password changed successfully!");
    setPasswords({ current: "", new: "", confirm: "" });
  };

  // ✅ Delete account logic
  const handleDeleteAccount = () => setShowDeleteConfirm(true);
  const confirmDelete = () => {
    alert("⚠️ Account deleted!");
    localStorage.clear();
    window.location.href = "/login";
  };
  const cancelDelete = () => setShowDeleteConfirm(false);

  return (
    <div className="min-h-screen flex flex-col app-background">
      {/* Navbar */}
      <header ref={navbarRef} className="w-full fixed top-0 left-0 z-50">
        <AdminNavbar />
      </header>

      {/* Main Content */}
      <main
        className="flex-1 p-10 overflow-y-auto transition-all duration-500"
        style={{
          marginTop: `${navbarHeight + 130}px`,
        }}
      >
        <div className="max-w-4xl mx-auto bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-10 border border-indigo-100">
          {/* Header */}
          <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-indigo-700 to-purple-800 bg-clip-text text-transparent mb-8">
            Admin Profile Settings
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
                value={user.name}
                readOnly
                className="w-full p-3 rounded-xl border border-indigo-200 bg-white/70 text-gray-800"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Email
              </label>
              <input
                type="text"
                value={user.email}
                readOnly
                className="w-full p-3 rounded-xl border border-indigo-200 bg-white/70 text-gray-800"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Role</label>
              <input
                type="text"
                value={user.role}
                readOnly
                className="w-full p-3 rounded-xl border border-indigo-200 bg-white/70 text-gray-800"
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

          {/* Delete Account Section */}
          <div className="mt-10 border-t border-indigo-200 pt-8 text-center">
            <h3 className="text-lg font-semibold text-red-600 mb-3">
              Danger Zone
            </h3>
            <button
              onClick={handleDeleteAccount}
              className="px-6 py-2 bg-red-600 text-white rounded-xl font-semibold shadow-md hover:bg-red-700 transition"
            >
              <FaTrash className="inline mr-2" />
              Delete Account
            </button>
          </div>

          {/* About Section */}
          <div className="mt-10 border-t border-indigo-200 pt-8">
            <h3 className="text-xl font-semibold text-indigo-700 mb-4">
              About Admin Role
            </h3>
            <p className="text-gray-700 leading-relaxed">
              As an administrator, you have full control over managing users,
              subjects, quizzes, and performance analytics across the EasyQuiz
              system. You can also oversee student progress and maintain data
              integrity.
            </p>
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white/95 rounded-3xl p-8 shadow-2xl border border-red-100 w-[400px] text-center">
            <h2 className="text-xl font-bold text-red-600 mb-4">
              Delete Your Account?
            </h2>
            <p className="text-gray-600 mb-6">
              This action is permanent and cannot be undone.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={confirmDelete}
                className="px-5 py-2 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition"
              >
                Yes, Delete
              </button>
              <button
                onClick={cancelDelete}
                className="px-5 py-2 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProfile;
