import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import AuthLayout from "../../components/layouts/AuthLayout";
import { BASE_URL, API_PATHS } from "../../utils/apiPaths";
import { validateEmail } from "../../utils/helper";
import { FaCamera, FaEye, FaEyeSlash } from "react-icons/fa"; // ✅ Icons

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    profileImage: null,
  });
  const [preview, setPreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false); // ✅ Password toggle
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Handle text input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle image upload + preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, profileImage: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  // Submit signup
  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateEmail(formData.email)) return setError("Enter a valid email.");
    if (!formData.password || formData.password.length < 6)
      return setError("Password must be at least 6 characters long.");

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("email", formData.email);
      data.append("password", formData.password);
      if (formData.profileImage) data.append("profileImage", formData.profileImage);

      const response = await axios.post(
        `${BASE_URL}${API_PATHS.AUTH.REGISTER}`,
        data,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.data.success) navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed. Try again.");
    }
  };

  return (
    <AuthLayout>
      <div className="w-full sm:w-[800px] bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl border border-blue-100 p-10 flex flex-col justify-center mx-auto hover:shadow-blue-300 transition-all duration-500">
        <h2 className="text-3xl font-bold text-center text-indigo-700 mb-1">
          Create Your Account
        </h2>

        <form onSubmit={handleSignup} className="space-y-4">
          {/* Profile Image Upload Section */}
          <div className="flex flex-col items-center mb-2">
            <div className="relative flex flex-col items-center">
              {/* Image Preview Circle */}
              <div className="w-28 h-28 rounded-full border-4 border-indigo-200 shadow-md overflow-hidden flex items-center justify-center bg-gray-100 hover:shadow-lg transition-all duration-300">
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-400 text-xs">No Image</span>
                )}
              </div>

              {/* Upload Icon Button */}
              <label
                htmlFor="profileImage"
                className="absolute bottom-1 right-1 bg-gradient-to-r from-indigo-600 to-purple-600 p-3 rounded-full cursor-pointer shadow-lg hover:scale-110 transition"
                title="Upload Profile Image"
              >
                <FaCamera className="text-white text-sm" />
              </label>

              <input
                id="profileImage"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="mb-1 text-gray-700 font-medium text-sm">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 text-sm"
            />
          </div>

          {/* Email */}
          <div>
            <label className="mb-1 text-gray-700 font-medium text-sm">Email</label>
            <input
              type="text"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="user@example.com"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 text-sm"
            />
          </div>

          {/* Password with Eye Toggle */}
          <div className="flex flex-col relative">
            <label className="mb-1 text-gray-700 font-medium text-sm">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="********"
                className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-indigo-600 focus:outline-none"
              >
                {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
              </button>
            </div>
          </div>

           {/* Confirm Password with Eye Toggle */}
          <div className="flex flex-col relative">
            <label className="mb-1 text-gray-700 font-medium text-sm">Confirm Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="********"
                className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-indigo-600 focus:outline-none"
              >
                {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:scale-105 transition"
          >
            SIGN UP
          </button>
        </form>

        {/* Redirect */}
        <p className="text-sm text-gray-700 mt-4 text-center">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-600 font-medium hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Signup;
