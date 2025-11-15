import React, { useState, useEffect, useRef } from "react";
import AdminNavbar from "../../components/layouts/AdminNavbar.jsx";
import "../../index.css";
import "../../admin.css";

function AdmHome() {
  const navbarRef = useRef(null);
  const [navbarHeight, setNavbarHeight] = useState(85); // fallback height

  // ✅ Auto-detect Navbar height dynamically
  useEffect(() => {
    const updateNavbarHeight = () => {
      if (navbarRef.current) setNavbarHeight(navbarRef.current.offsetHeight);
    };
    updateNavbarHeight();
    window.addEventListener("resize", updateNavbarHeight);
    return () => window.removeEventListener("resize", updateNavbarHeight);
  }, []);

  return (
    

    <div className="min-h-screen flex flex-col app-background app-bg-bubble">


      {/* ✅ Navbar fixed at top */}
      <header ref={navbarRef} className="w-full fixed top-0 left-0 z-50">
        <AdminNavbar />
      </header>

      {/* ✅ Main Content */}
      <main
        className="flex-1 p-8 overflow-y-auto transition-all duration-500"
        style={{
          paddingTop: `${navbarHeight + 130}px`, // space below navbar
          marginLeft: "0", // no sidebar
        }}
      >
        <h1 className="text-3xl font-bold text-indigo-700 mb-6">
          Admin Dashboard
        </h1>

        {/* Dashboard Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/80 backdrop-blur-sm shadow-md rounded-xl p-6 border border-indigo-100 hover:shadow-lg transition">
            <h2 className="text-lg font-semibold text-indigo-600 mb-2">
              Total Users
            </h2>
            <p className="text-3xl font-bold text-indigo-800">1,245</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm shadow-md rounded-xl p-6 border border-indigo-100 hover:shadow-lg transition">
            <h2 className="text-lg font-semibold text-indigo-600 mb-2">
              Total Quizzes
            </h2>
            <p className="text-3xl font-bold text-indigo-800">48</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm shadow-md rounded-xl p-6 border border-indigo-100 hover:shadow-lg transition">
            <h2 className="text-lg font-semibold text-indigo-600 mb-2">
              Active Students
            </h2>
            <p className="text-3xl font-bold text-indigo-800">856</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-10">
          <h2 className="text-xl font-semibold text-indigo-700 mb-4">
            Recent Activity
          </h2>
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-md border border-indigo-100">
            <p className="text-gray-600">
              Recent quiz submissions, performance stats, and system updates
              will appear here.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdmHome;
