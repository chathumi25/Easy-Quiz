import React, { useState, useEffect, useRef } from "react";
import {
  FaTachometerAlt,
  FaClipboardList,
  FaBook,
  FaQuestionCircle,
  FaUserCircle,
  FaChevronDown,
  FaUserEdit,
  FaSignOutAlt,
  FaUsers,
  FaTrash,
} from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../../assets/images/logo.png";

const AdminNavbar = () => {
  const user = JSON.parse(localStorage.getItem("user")) || {
    name: "Admin",
    profileImage: "",
  };

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [profileImage, setProfileImage] = useState(user.profileImage);
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef();

  const menuItems = [
    { label: "Dashboard", icon: <FaTachometerAlt />, path: "/admindashboard" },
    { label: "Grades", icon: <FaClipboardList />, path: "/admingrades" },
    { label: "Subjects", icon: <FaBook />, path: "/adminsubjects" },
    { label: "Quizzes", icon: <FaQuestionCircle />, path: "/adminquiz" },
    { label: "Profile", icon: <FaUserCircle />, path: "/adminprofile" },
  ];

  const getInitial = (name) =>
    name && name.length > 0 ? name[0].toUpperCase() : "A";

  const handleNavigation = (path) => navigate(path);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // ✅ Confirm delete modal logic
  const confirmRemovePicture = () => {
    setProfileImage("");
    try {
      const stored = JSON.parse(localStorage.getItem("user")) || {};
      localStorage.setItem("user", JSON.stringify({ ...stored, profileImage: "" }));
    } catch {
      localStorage.setItem("user", JSON.stringify({ profileImage: "" }));
    }
    setShowConfirmDelete(false);
    setDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <nav
        className="w-full fixed top-0 left-0 z-50 bg-gradient-to-r from-indigo-200 via-blue-200 to-purple-200 
        shadow-lg backdrop-blur-md px-6 py-3 flex justify-between items-center border-b border-indigo-100 transition-all duration-500"
      >
        {/* Left: Logo and title */}
        <div className="flex items-center gap-3">
          
          <h1 className="text-5xl md:text-5xl font-extrabold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">
            Easy Quiz
          </h1>
        </div>

        {/* Right side: Menu, Summary cards, and Profile */}
        <div className="flex items-center gap-6 justify-end">
          {/* Menu Tabs */}
          <div className="flex gap-3 md:gap-4 items-center">
            {menuItems.map((item, index) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={index}
                  onClick={() => handleNavigation(item.path)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 shadow-sm ${
                    isActive
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white scale-[1.05]"
                      : "bg-white/70 text-indigo-700 hover:bg-indigo-100 hover:scale-105"
                  }`}
                >
                  {item.icon} <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Summary Cards */}
          <div className="flex gap-2 lg:gap-3 flex-wrap">
            <div className="bg-white/80 px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm hover:shadow-md transition backdrop-blur-sm">
              <FaUsers className="text-blue-700 text-lg" />
              <div>
                <p className="text-xs text-blue-900 opacity-80">Users</p>
                <p className="font-semibold text-sm text-blue-900">1,245</p>
              </div>
            </div>

            <div className="bg-white/80 px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm hover:shadow-md transition backdrop-blur-sm">
              <FaBook className="text-yellow-700 text-lg" />
              <div>
                <p className="text-xs text-yellow-900 opacity-80">Subjects</p>
                <p className="font-semibold text-sm text-yellow-900">18</p>
              </div>
            </div>

            <div className="bg-white/80 px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm hover:shadow-md transition backdrop-blur-sm">
              <FaQuestionCircle className="text-pink-700 text-lg" />
              <div>
                <p className="text-xs text-pink-900 opacity-80">Quizzes</p>
                <p className="font-semibold text-sm text-pink-900">48</p>
              </div>
            </div>
          </div>

          {/* Profile Avatar */}
          <div className="relative dropdown-area" ref={dropdownRef}>
            <div
              className="flex items-center gap-1 cursor-pointer"
              onClick={() => setDropdownOpen((s) => !s)}
            >
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  className="w-11 h-11 rounded-full border-2 border-indigo-400 shadow-md object-cover hover:scale-105 transition-all"
                />
              ) : (
                <div className="w-11 h-11 rounded-full border-2 border-indigo-400 shadow-md bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg hover:scale-105 transition-all">
                  {getInitial(user.name)}
                </div>
              )}
              <FaChevronDown
                className={`text-indigo-700 ml-1 text-sm transform transition-all duration-300 ${
                  dropdownOpen ? "rotate-180" : "rotate-0"
                }`}
              />
            </div>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 top-14 w-48 bg-white shadow-xl rounded-xl border border-indigo-100 py-2 animate-fadeIn text-sm text-indigo-700 z-50">
                <button
                  onClick={() => {
                    navigate("/adminprofile");
                    setDropdownOpen(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 hover:bg-indigo-50 w-full text-left"
                >
                  <FaUserEdit className="text-indigo-500" /> Update Profile
                </button>

                <button
                  onClick={() => setShowConfirmDelete(true)}
                  className="flex items-center gap-2 px-4 py-2 hover:bg-indigo-50 w-full text-left"
                >
                  <FaTrash className="text-red-500" /> Remove Picture
                </button>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 hover:bg-indigo-50 w-full text-left text-red-600 font-medium"
                >
                  <FaSignOutAlt /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ✅ Confirmation Modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white/95 rounded-2xl p-6 shadow-2xl border border-indigo-200 w-[400px] text-center">
            <h2 className="text-xl font-bold text-red-600 mb-3">
              Remove Profile Picture?
            </h2>
            <p className="text-gray-700 mb-6">
              Are you sure you want to remove your profile picture? This action
              cannot be undone.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={confirmRemovePicture}
                className="px-6 py-2 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition"
              >
                Yes
              </button>
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminNavbar;
