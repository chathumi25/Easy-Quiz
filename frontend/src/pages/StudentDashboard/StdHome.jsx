import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import StudentNavbar from "../../components/layouts/StudentNavbar";
import "../../index.css";

function StdHome() {
  const navbarRef = useRef(null);
  const [navbarHeight, setNavbarHeight] = useState(85);
  const navigate = useNavigate();

  // Detect and update navbar height dynamically
  useEffect(() => {
    const updateNavbarHeight = () => {
      if (navbarRef.current) setNavbarHeight(navbarRef.current.offsetHeight);
    };
    updateNavbarHeight();
    window.addEventListener("resize", updateNavbarHeight);
    return () => window.removeEventListener("resize", updateNavbarHeight);
  }, []);

  // Navigate to quiz page
  const handleStartQuiz = () => {
    navigate("/studentquiz"); // matches the App.jsx route
  };

  return (
    <div className="min-h-screen flex flex-col app-background">
      {/* Navbar fixed at top */}
      <header ref={navbarRef} className="w-full fixed top-0 left-0 z-50">
        <StudentNavbar />
      </header>

      {/* Main Dashboard Content */}
      <main
        className="flex-1 p-8 overflow-y-auto transition-all duration-500"
        style={{
          paddingTop: `${navbarHeight + 130}px`,
        }}
      >
        <h1 className="text-3xl font-bold text-indigo-700 mb-6">
          Student Dashboard
        </h1>

        {/* Dashboard Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white/80 backdrop-blur-sm shadow-md rounded-xl p-6 border border-indigo-100 hover:shadow-lg transition">
            <h2 className="text-lg font-semibold text-indigo-600 mb-2">
              Quizzes Attempted
            </h2>
            <p className="text-3xl font-bold text-indigo-800">24</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm shadow-md rounded-xl p-6 border border-indigo-100 hover:shadow-lg transition">
            <h2 className="text-lg font-semibold text-indigo-600 mb-2">
              Average Score
            </h2>
            <p className="text-3xl font-bold text-indigo-800">86%</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm shadow-md rounded-xl p-6 border border-indigo-100 hover:shadow-lg transition">
            <h2 className="text-lg font-semibold text-indigo-600 mb-2">
              Current Rank
            </h2>
            <p className="text-3xl font-bold text-indigo-800">#3</p>
          </div>
        </div>

        {/* ✅ Start Quiz Button */}
        <div className="flex justify-start mb-6">
          <button
            onClick={handleStartQuiz}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-md flex items-center gap-2 hover:scale-105 transition"
          >
            Start Quiz
          </button>
        </div>

        {/* Recent Activity */}
        <div className="mt-6">
          <h2 className="text-xl font-semibold text-indigo-700 mb-4">
            Recent Quizzes
          </h2>
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-md border border-indigo-100">
            <ul className="space-y-3 text-gray-700">
              <li>✅ Science — Scored 92%</li>
              <li>✅ Mathematics — Scored 87%</li>
              <li>✅ ICT — Scored 94%</li>
              <li>⚡ English — In progress...</li>
            </ul>
          </div>
        </div>

        {/* Progress Section */}
        <div className="mt-10">
          <h2 className="text-xl font-semibold text-indigo-700 mb-4">
            Performance Overview
          </h2>
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-md border border-indigo-100">
            <p className="text-gray-600">
              Track your improvement over time and identify subjects where you
              can perform better. More analytics will appear here soon.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default StdHome;
