import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import AuthLayout from "../../components/layouts/AuthLayout";
import { BASE_URL, API_PATHS } from "../../utils/apiPaths";
import { validateEmail } from "../../utils/helper";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateEmail(email)) return setError("Please enter a valid email.");
    if (!password) return setError("Please enter your password.");

    try {
      const response = await axios.post(
        `${BASE_URL}${API_PATHS.AUTH.LOGIN}`,
        { email, password }
      );
      const { token, user } = response.data;
      if (token) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("role", "student");
        navigate("/studentdashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Try again.");
    }
  };

  return (
    <AuthLayout>
      <div
        className={`animate-fadeIn relative w-full sm:w-[800px]
          bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl border border-blue-100 
          p-12 flex flex-col justify-center mx-auto hover:shadow-blue-300 
          transition-all duration-500 ${showAdminLogin ? "blur-sm scale-[0.98]" : ""}`}
      >
        <h2 className="text-3xl font-bold text-center text-indigo-700 mb-4">
          Welcome Back
        </h2>
        <p className="text-gray-600 text-center mb-8">
          Please enter your credentials to log in
        </p>

        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email Field */}
          <div className="flex flex-col">
            <label className="mb-2 text-gray-700 font-medium">Email Address</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          {/* Password Field with Eye Icon */}
          <div className="flex flex-col relative">
            <label className="mb-2 text-gray-700 font-medium">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-indigo-600 focus:outline-none"
              >
                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          {/* Login Button */}
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition duration-300"
          >
            LOGIN
          </button>
        </form>

        {/* Footer Links */}
        <p className="text-sm text-gray-700 mt-6 text-center">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-blue-600 font-medium hover:underline">
            Sign Up
          </Link>
        </p>

        <p className="text-sm text-gray-700 mt-4 text-center">
          Login as an admin?{" "}
          <button
            onClick={() => setShowAdminLogin(true)}
            className="text-blue-600 font-medium hover:underline"
          >
            Login
          </button>
        </p>
      </div>

      {/* ✅ Admin Login Modal */}
      {showAdminLogin && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 animate-fadeIn">
          <div
            className="relative w-[700px] max-w-[90%] bg-white/95 backdrop-blur-lg 
                 rounded-3xl shadow-2xl border border-blue-100 
                 p-12 transition-all duration-300 scale-95 animate-modalPop"
          >
            {/* Close Button */}
            <button
              onClick={() => setShowAdminLogin(false)}
              className="absolute top-6 right-6 text-gray-900 hover:text-gray-700 
                   bg-blue-100 hover:bg-red-200 p-2 rounded-full transition"
            >
              ✕
            </button>

            <h2 className="text-3xl font-bold text-center text-indigo-700 mb-4">
              Admin Portal
            </h2>
            <p className="text-gray-600 text-center mb-6">
              Please enter your admin credentials
            </p>

            <AdminLoginForm onClose={() => setShowAdminLogin(false)} />
          </div>
        </div>
      )}
    </AuthLayout>
  );
};

/* ✅ Admin Login Form with same logic */
const AdminLoginForm = ({ onClose }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateEmail(email)) return setError("Enter a valid email.");
    if (!password) return setError("Enter your password.");

    try {
      const response = await axios.post(
        `${BASE_URL}${API_PATHS.AUTH.LOGIN}`,
        { email, password }
      );
      const { token, user } = response.data;
      if (token) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("role", "admin");
        navigate("/admindashboard");
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials.");
    }
  };

  return (
    <form onSubmit={handleAdminLogin} className="space-y-5">
      <div>
        <label className="block mb-2 text-sm text-gray-700 font-medium">Admin Email</label>
        <input
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@example.com"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </div>

      {/* Admin Password with Correct Icon */}
      <div className="relative">
        <label className="block mb-2 text-sm text-gray-700 font-medium">Password</label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="********"
            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            title={showPassword ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-indigo-600 focus:outline-none"
          >
            {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
          </button>
        </div>
      </div>

      {error && <p className="text-red-500 text-sm text-center">{error}</p>}

      <button
        type="submit"
        className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:scale-105 transition duration-300"
      >
        LOGIN AS ADMIN
      </button>
    </form>
  );
};

export default Login;
