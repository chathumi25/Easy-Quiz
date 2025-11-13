import React, { useRef, useState, useEffect } from "react";
import {
  FaChartLine,
  FaQuestionCircle,
  FaMedal,
  FaChevronDown,
  FaUserEdit,
  FaSignOutAlt,
  FaTrash,
  FaTachometerAlt,
  FaBook,
  FaBars,
  FaTimes,
  FaClipboardCheck,   // Icon for Results
} from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../../assets/images/logo.png";

// ✅ FIXED IMPORT PATH
import StdGrade from "../../pages/StudentDashboard/StdGrade.jsx";

const StudentNavbar = () => {
  const user = JSON.parse(localStorage.getItem("user")) || {
    name: "Student",
    profileImage: "",
  };

  const [profileImage, setProfileImage] = useState(user.profileImage);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef();

  // -------------------------
  // Menu Items (Updated)
  // -------------------------
  const menuItems = [
    { label: "Dashboard", icon: <FaTachometerAlt />, path: "/studentdashboard" },
    { label: "Progress", icon: <FaChartLine />, path: "/studentprogress" },
    { label: "Subjects", icon: <FaBook />, path: "/studentsubject" },
    { label: "Quizzes", icon: <FaQuestionCircle />, path: "/studentquiz" },
    { label: "Results", icon: <FaClipboardCheck />, path: "/studentgrades" },  // Results Tab
    { label: "Profile", icon: <FaUserEdit />, path: "/studentprofile" },
  ];

  const getInitial = (name) => (name && name.length > 0 ? name[0].toUpperCase() : "U");

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) setIsMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const confirmRemovePicture = () => {
    setProfileImage("");
    localStorage.setItem("user", JSON.stringify({ ...user, profileImage: "" }));
    setShowConfirmDelete(false);
    setDropdownOpen(false);
  };

  const cancelRemovePicture = () => setShowConfirmDelete(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
      {/* Navbar */}
      <nav className="w-full fixed top-0 left-0 z-50 bg-gradient-to-r from-indigo-200 via-blue-200 to-purple-200 shadow-lg backdrop-blur-md px-8 py-4 flex justify-between items-center text-indigo-900 border-b border-indigo-200 transition-all duration-500">
        
        {/* Logo */}
        <div className="flex items-center gap-4">
          <h1 className="text-5xl md:text-5xl font-extrabold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">
            Easy Quiz
          </h1>
        </div>

        {/* Menu Items */}
        <div className="hidden md:flex items-center gap-6 ml-auto">

          <div className="flex gap-5 items-center">
            {menuItems.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleNavigation(item.path)}
                className={`flex items-center gap-1 px-4 py-2 rounded-lg font-medium transition ${
                  location.pathname === item.path
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                    : "text-indigo-800 hover:bg-indigo-100"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          {/* Summary Cards */}
          <div className="flex gap-3 items-center">
            <div className="bg-white/70 px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm hover:shadow-md transition backdrop-blur-sm">
              <FaChartLine className="text-green-700 text-lg" />
              <div>
                <p className="text-xs text-green-900 opacity-80">Progress</p>
                <p className="font-semibold text-sm text-green-900">85%</p>
              </div>
            </div>

            <div className="bg-white/70 px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm hover:shadow-md transition backdrop-blur-sm">
              <FaQuestionCircle className="text-indigo-700 text-lg" />
              <div>
                <p className="text-xs text-indigo-900 opacity-80">Quizzes Taken</p>
                <p className="font-semibold text-sm text-indigo-900">24</p>
              </div>
            </div>

            <div className="bg-white/70 px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm hover:shadow-md transition backdrop-blur-sm">
              <FaMedal className="text-yellow-700 text-lg" />
              <div>
                <p className="text-xs text-yellow-900 opacity-80">Rank</p>
                <p className="font-semibold text-sm text-yellow-900">#3</p>
              </div>
            </div>
          </div>

          {/* Profile Dropdown */}
          <div className="relative flex items-center gap-2 cursor-pointer ml-4" ref={dropdownRef}>
            {profileImage ? (
              <img
                src={profileImage}
                alt="Profile"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-11 h-11 rounded-full border-2 border-indigo-400 shadow-md object-cover cursor-pointer hover:scale-105 transition-all"
              />
            ) : (
              <div
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-11 h-11 rounded-full border-2 border-indigo-400 bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md hover:scale-105 transition-all"
              >
                {getInitial(user.name)}
              </div>
            )}

            <FaChevronDown
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={`text-indigo-600 text-sm transform transition-all duration-300 ${
                dropdownOpen ? "rotate-180" : "rotate-0"
              }`}
            />

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 top-14 w-48 bg-white shadow-xl rounded-xl border border-indigo-100 py-2 animate-fadeIn text-sm text-indigo-700 z-50">
                
                <button
                  onClick={() => {
                    navigate("/studentprofile");
                    setDropdownOpen(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 hover:bg-indigo-50 w-full text-left"
                >
                  <FaUserEdit className="text-indigo-500" /> Update Profile
                </button>

                <button
                  onClick={() => {
                    setShowConfirmDelete(true);
                    setDropdownOpen(false);
                  }}
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

        {/* Mobile Toggle */}
        {isMobile && (
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="ml-auto text-indigo-700 p-2 rounded-full hover:bg-indigo-100 transition"
          >
            {isMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>
        )}
      </nav>

      {/* Confirm Remove Modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white/95 rounded-2xl p-6 shadow-2xl border border-indigo-200 w-[400px] text-center">
            <h2 className="text-xl font-bold text-red-600 mb-3">Remove Profile Picture?</h2>
            <p className="text-gray-700 mb-6">
              Are you sure you want to remove your profile picture? This action cannot be undone.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={confirmRemovePicture}
                className="px-6 py-2 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition"
              >
                Yes
              </button>
              <button
                onClick={cancelRemovePicture}
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

export default StudentNavbar;
