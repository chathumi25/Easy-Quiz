import React, { useRef, useState } from "react";
import {
  FaUsers,
  FaBook,
  FaQuestionCircle,
  FaChevronDown,
  FaUserEdit,
  FaSignOutAlt,
  FaTrash,
  FaCamera,
} from "react-icons/fa";

const AdminNavbar = () => {
  const user = JSON.parse(localStorage.getItem("user")) || {
    name: "Admin",
    profileImage: "", // if no image uploaded yet
  };

  const [profileImage, setProfileImage] = useState(user.profileImage);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [tempImage, setTempImage] = useState(profileImage);
  const fileInputRef = useRef(null);

  //  Get first letter of user's name (for avatar)
  const getInitial = (name) =>
    name && name.length > 0 ? name[0].toUpperCase() : "U";

  //  Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageURL = URL.createObjectURL(file);
      setTempImage(imageURL);
    }
  };

  //  Save new profile image
  const handleSaveProfile = () => {
    setProfileImage(tempImage);
    localStorage.setItem(
      "user",
      JSON.stringify({ ...user, profileImage: tempImage })
    );
    setShowProfileModal(false);
  };

  //  Discard changes
  const handleDiscardProfile = () => {
    setTempImage(profileImage);
    setShowProfileModal(false);
  };

  //  Confirm delete
  const handleDeleteImage = () => {
    setShowConfirmDelete(true);
    setDropdownOpen(false);
  };

  const confirmDelete = () => {
    setProfileImage("");
    setTempImage("");
    localStorage.setItem("user", JSON.stringify({ ...user, profileImage: "" }));
    setShowConfirmDelete(false);
  };

  const cancelDelete = () => setShowConfirmDelete(false);

  //  Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <>
      {/*  NAVBAR */}
      <nav
        className="w-full fixed top-0 left-0 z-30 bg-gradient-to-r from-indigo-200 via-blue-200 to-purple-200
                 shadow-lg backdrop-blur-md px-8 py-4 flex justify-between items-center
                 text-indigo-900 border-b border-indigo-200 transition-all duration-500"
      >
        {/* Left Section — App Title */}
        <div className="flex items-center gap-4">
          <h1 className="text-4xl font-extrabold tracking-wide bg-gradient-to-r from-indigo-700 to-purple-900 bg-clip-text text-transparent drop-shadow-sm">
            Easy Quiz
          </h1>
        </div>

        {/* Center Quick Cards */}
        <div className="flex gap-5 items-center ml-auto mr-8 justify-end">
          <div className="bg-white/70 px-5 py-2 rounded-xl flex items-center gap-2 shadow-sm hover:shadow-md transition backdrop-blur-sm">
            <FaUsers className="text-blue-700 text-lg" />
            <div>
              <p className="text-xs text-blue-900 opacity-80">Users</p>
              <p className="font-semibold text-sm text-blue-900">1,245</p>
            </div>
          </div>

          <div className="bg-white/70 px-5 py-2 rounded-xl flex items-center gap-2 shadow-sm hover:shadow-md transition backdrop-blur-sm">
            <FaBook className="text-yellow-700 text-lg" />
            <div>
              <p className="text-xs text-yellow-900 opacity-80">Subjects</p>
              <p className="font-semibold text-sm text-yellow-900">18</p>
            </div>
          </div>

          <div className="bg-white/70 px-5 py-2 rounded-xl flex items-center gap-2 shadow-sm hover:shadow-md transition backdrop-blur-sm">
            <FaQuestionCircle className="text-pink-700 text-lg" />
            <div>
              <p className="text-xs text-pink-900 opacity-80">Quizzes</p>
              <p className="font-semibold text-sm text-pink-900">48</p>
            </div>
          </div>
        </div>

        {/*  Right Profile Section */}
        <div className="relative flex items-center gap-2 cursor-pointer">
          {/* Profile Image or Initial */}
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
              className="w-11 h-11 rounded-full border-2 border-indigo-400 shadow-md bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg hover:scale-105 transition-all"
            >
              {getInitial(user.name)}
            </div>
          )}

          {/* Dropdown Icon */}
          <FaChevronDown
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className={`text-indigo-600 text-sm transform transition-all duration-300 ${
              dropdownOpen ? "rotate-180" : "rotate-0"
            }`}
          />

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div
              className="absolute right-0 top-14 w-48 bg-white shadow-xl rounded-xl border border-indigo-100 
                       py-2 animate-fadeIn text-sm text-indigo-700 z-50"
            >
              <button
                onClick={() => {
                  setShowProfileModal(true);
                  setDropdownOpen(false);
                }}
                className="flex items-center gap-2 px-4 py-2 hover:bg-indigo-50 w-full text-left"
              >
                <FaUserEdit className="text-indigo-500" /> Update Profile
              </button>

              <button
                onClick={handleDeleteImage}
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
      </nav>

      {/*  Update Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white/95 rounded-3xl p-10 shadow-2xl border border-blue-100 w-[450px] relative">
            <button
              onClick={handleDiscardProfile}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 p-1 rounded-full"
            >
              ✕
            </button>
            <h2 className="text-2xl font-bold text-center text-indigo-700 mb-6">
              Update Profile
            </h2>

            <div className="flex flex-col items-center">
              <div className="relative w-28 h-28 rounded-full border-4 border-indigo-200 shadow-lg overflow-hidden">
                {tempImage ? (
                  <img
                    src={tempImage}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold">
                    {getInitial(user.name)}
                  </div>
                )}
                <button
                  onClick={() => fileInputRef.current.click()}
                  className="absolute bottom-0 right-0 bg-indigo-600 text-white p-4 rounded-full hover:bg-indigo-700"
                >
                  <FaCamera />
                </button>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={handleSaveProfile}
                  className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:scale-105 transition"
                >
                  Save Changes
                </button>
                <button
                  onClick={handleDiscardProfile}
                  className="px-5 py-2 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition"
                >
                  Discard
                </button>
              </div>
            </div>

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageChange}
              className="hidden"
            />
          </div>
        </div>
      )}

      {/*  Confirm Delete Modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white/95 rounded-3xl p-8 shadow-2xl border border-red-100 w-[400px] text-center">
            <h2 className="text-xl font-bold text-red-600 mb-4">
              Remove Profile Picture?
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete your profile image?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={confirmDelete}
                className="px-5 py-2 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition"
              >
                Yes, Remove
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
    </>
  );
};

export default AdminNavbar;
