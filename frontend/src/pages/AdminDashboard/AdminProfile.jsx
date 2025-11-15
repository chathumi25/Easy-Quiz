import React, { useState, useEffect, useRef, useContext } from "react";
import {
  FaCamera,
  FaLock,
  FaTrash,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

import AdminNavbar from "../../components/layouts/AdminNavbar";
import axios from "../../utils/axiosInstance";
import { BASE_URL } from "../../utils/apiPaths";
import { UserContext } from "../../context/userContext";
import "../../admin.css";

const AdminProfile = () => {
  // ⭐ USE CONTEXT
  const { user: storedUser, updateUser } = useContext(UserContext);

  const [name, setName] = useState(storedUser?.name || "");
  const [email] = useState(storedUser?.email || "");
  const [role] = useState(storedUser?.role || "");

  const [tempImage, setTempImage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const [message, setMessage] = useState("");
  const [passMessage, setPassMessage] = useState("");

  const [passwords, setPasswords] = useState({
    adminKey: "",
    current: "",
    new: "",
    confirm: "",
  });

  const [showPass, setShowPass] = useState({
    adminKey: false,
    current: false,
    new: false,
    confirm: false,
  });

  const [navbarHeight, setNavbarHeight] = useState(85);
  const navbarRef = useRef(null);
  const fileInputRef = useRef(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // ⭐ FIX: Sync image with context
  useEffect(() => {
    if (!storedUser) return;

    let img = storedUser.profileImage;

    if (img?.startsWith("/uploads")) {
      img = BASE_URL + img;
    }

    setTempImage(img || "");
  }, [storedUser]);

  // NAVBAR HEIGHT
  useEffect(() => {
    const updateHeight = () => {
      if (navbarRef.current)
        setNavbarHeight(navbarRef.current.offsetHeight);
    };
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  const getInitial = (name) =>
    name && name.length > 0 ? name[0].toUpperCase() : "U";

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setTempImage(url);
    }
  };

  // ⭐ SAVE PROFILE
  const handleSaveProfile = async () => {
    try {
      const formData = new FormData();
      formData.append("name", name);

      if (selectedFile) {
        formData.append("profileImage", selectedFile);
      }

      const res = await axios.put("/api/adm/profile/update", formData);

      if (res.data.success) {
        const updatedUser = res.data.user;

        const fullImage = updatedUser.profileImage
          ? `${BASE_URL}${updatedUser.profileImage}`
          : "";

        updateUser({
          ...storedUser,
          name: updatedUser.name,
          profileImage: updatedUser.profileImage,
        });

        setTempImage(fullImage);
        setMessage("✅ Profile updated successfully!");
      } else {
        setMessage("❌ Update failed.");
      }
    } catch (err) {
      console.error(err);
      setMessage(
        "❌ Update failed: " + (err.response?.data?.message || "")
      );
    }

    setTimeout(() => setMessage(""), 3000);
  };

  // ⭐ FIXED: CHANGE PASSWORD (uses adminKey field)
  const handleChangePassword = async () => {
    const { adminKey, current, new: newPass, confirm } = passwords;

    if (!adminKey || !current || !newPass || !confirm) {
      setPassMessage("⚠ Please fill all fields.");
      return;
    }

    if (newPass !== confirm) {
      setPassMessage("❌ New passwords do not match.");
      return;
    }

    try {
      const res = await axios.put("/api/adm/profile/change-password", {
        adminKey: adminKey,
        currentPassword: current,
        newPassword: newPass,
      });

      if (res.data.success) {
        setPassMessage("✅ Password updated successfully!");
        setPasswords({ adminKey: "", current: "", new: "", confirm: "" });
      } else {
        setPassMessage("❌ Password update failed.");
      }
    } catch (err) {
      setPassMessage(
        "❌ Error: " + (err.response?.data?.message || "")
      );
    }

    setTimeout(() => setPassMessage(""), 3000);
  };

  // DELETE ACCOUNT
  const confirmDelete = async () => {
    try {
      const res = await axios.delete("/api/adm/profile/delete-account");

      if (res.data.success) {
        localStorage.clear();
        window.location.href = "/login";
      }
    } catch (err) {
      alert("Error deleting account");
    }
  };

  // UI
  return (
    <div className="min-h-screen flex flex-col app-background">
      <header ref={navbarRef} className="w-full fixed top-0 left-0 z-50">
        <AdminNavbar />
      </header>

      <main
        className="p-6 md:p-12"
        style={{ marginTop: `${navbarHeight + 120}px` }}
      >
        <div className="max-w-6xl mx-auto space-y-10">

          {/* HEADER */}
          <div className="text-center animate-fadeIn">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-700 to-purple-800 bg-clip-text text-transparent">
              Admin Profile Settings
            </h1>
            <p className="text-gray-600 mt-2">
              Manage profile, password & account.
            </p>
          </div>

          {/* PROFILE CARD */}
          <div className="admin-card p-8 md:p-10 animate-fadeInExpand">
            <h2 className="text-2xl font-semibold text-indigo-700 mb-6">
              Profile Information
            </h2>

            {message && (
              <div className="p-3 mb-4 rounded-lg bg-green-100 text-green-700 font-medium">
                {message}
              </div>
            )}

            <div className="flex flex-col md:flex-row items-center gap-10">

              {/* IMAGE */}
              <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-indigo-300 shadow-xl">
                {tempImage ? (
                  <img src={tempImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-indigo-500 text-white flex items-center justify-center text-5xl font-bold">
                    {getInitial(name)}
                  </div>
                )}

                <button
                  onClick={() => fileInputRef.current.click()}
                  className="absolute bottom-2 right-2 bg-indigo-600 p-3 text-white rounded-full"
                >
                  <FaCamera />
                </button>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>

              {/* PROFILE FORM */}
              <div className="flex-1 space-y-5 w-full">
                <div>
                  <label className="font-medium text-sm">Full Name</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-3 rounded-xl border bg-white/70"
                  />
                </div>

                <div>
                  <label className="font-medium text-sm">Email Address</label>
                  <input
                    value={email}
                    readOnly
                    className="w-full p-3 rounded-xl border bg-white/70"
                  />
                </div>

                <div>
                  <label className="font-medium text-sm">Role</label>
                  <input
                    value={role}
                    readOnly
                    className="w-full p-3 rounded-xl border bg-white/70"
                  />
                </div>

                <button onClick={handleSaveProfile} className="btn-gradient mt-4">
                  Save Profile
                </button>
              </div>
            </div>
          </div>

          {/* PASSWORD CARD */}
          <div className="admin-card p-8 md:p-10 animate-fadeInExpand">
            <h2 className="text-2xl font-semibold text-indigo-700 mb-6 flex items-center gap-2">
              <FaLock /> Change Password
            </h2>

            {passMessage && (
              <div className="p-3 mb-4 rounded-lg bg-indigo-100 text-indigo-700 font-medium">
                {passMessage}
              </div>
            )}

            {/* ⭐ ADDED ADMIN KEY INPUT FIELD */}
            <PasswordField
              label="Admin Security Key"
              value={passwords.adminKey}
              onChange={(v) =>
                setPasswords({ ...passwords, adminKey: v })
              }
              show={showPass.adminKey}
              toggle={() =>
                setShowPass({ ...showPass, adminKey: !showPass.adminKey })
              }
            />

            <div className="grid md:grid-cols-3 gap-4 mt-4">
              <PasswordField
                label="Current Password"
                value={passwords.current}
                onChange={(v) =>
                  setPasswords({ ...passwords, current: v })
                }
                show={showPass.current}
                toggle={() =>
                  setShowPass({ ...showPass, current: !showPass.current })
                }
              />

              <PasswordField
                label="New Password"
                value={passwords.new}
                onChange={(v) => setPasswords({ ...passwords, new: v })}
                show={showPass.new}
                toggle={() =>
                  setShowPass({ ...showPass, new: !showPass.new })
                }
              />

              <PasswordField
                label="Confirm Password"
                value={passwords.confirm}
                onChange={(v) =>
                  setPasswords({ ...passwords, confirm: v })
                }
                show={showPass.confirm}
                toggle={() =>
                  setShowPass({
                    ...showPass,
                    confirm: !showPass.confirm,
                  })
                }
              />
            </div>

            <button onClick={handleChangePassword} className="btn-gradient mt-6">
              Update Password
            </button>
          </div>

          {/* DELETE SECTION */}
          <div className="admin-card p-8 md:p-10 text-center animate-fadeInExpand">
            <h2 className="text-xl font-semibold text-red-600 mb-4">
              Danger Zone
            </h2>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="btn-danger px-6 py-2"
            >
              <FaTrash className="inline mr-2" />
              Delete My Account
            </button>
          </div>

          {/* ABOUT ADMIN */}
          <div className="admin-card p-8 md:p-10 animate-fadeInExpand">
            <h2 className="text-2xl font-semibold text-indigo-700 mb-4">
              About Admin Role
            </h2>
            <p className="text-gray-700 leading-relaxed">
              As an EasyQuiz administrator, you hold complete authority over the system.
              You can manage users, grades, subjects, quiz banks, evaluations, and track
              platform-wide academic performance. Admins ensure the learning environment
              stays secure, organized, and efficient providing students and teachers
              the best experience possible.
            </p>
          </div>

        </div>
      </main>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-xl">
            <h3 className="text-xl font-bold text-red-600 mb-4">
              Delete Your Account?
            </h3>
            <p className="text-gray-600 mb-6">
              This action cannot be undone.
            </p>

            <div className="flex justify-center gap-4">
              <button onClick={confirmDelete} className="btn-danger px-6 py-2">
                Yes, Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-6 py-2 bg-gray-200 rounded-xl"
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

const PasswordField = ({ label, value, onChange, show, toggle }) => (
  <div className="relative">
    <input
      type={show ? "text" : "password"}
      placeholder={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="p-3 w-full rounded-xl border bg-white/70 pr-12"
    />
    <span
      onClick={toggle}
      className="absolute right-4 top-3 cursor-pointer text-indigo-600"
    >
      {show ? <FaEyeSlash /> : <FaEye />}
    </span>
  </div>
);

export default AdminProfile;
