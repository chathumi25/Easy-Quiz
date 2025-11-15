// backend/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const connectDB = require("./config/db");

const app = express();

/**
 * Ensure uploads directory exists
 */
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

/**
 * Middleware
 */
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Serve uploaded files
app.use("/uploads", express.static(uploadsDir));

/**
 * MongoDB Connect
 */
connectDB();

/**
 * Load Routes (EXACT MATCH with apiPaths.js)
 */
try {
  // ----------------------------------------------------------
  // AUTH ROUTES
  // ----------------------------------------------------------
  app.use("/api/auth", require("./routes/authRoutes"));

  // ----------------------------------------------------------
  // ADMIN ROUTES
  // ----------------------------------------------------------
  // These EXACTLY match:
  // /api/adm/dashboard
  // /api/adm/grades
  // /api/adm/profile
  // /api/adm/profile/update
  // /api/adm/profile/update-image
  // /api/adm/profile/remove-image
  // /api/adm/profile/change-password
  // /api/adm/profile/delete-account

  app.use("/api/adm/dashboard", require("./routes/AdmDashboardRoutes"));
  app.use("/api/adm/grades", require("./routes/AdmGradeRoutes"));
  app.use("/api/adm/profile", require("./routes/AdmProfileRoutes"));  
  app.use("/api/adm/quiz", require("./routes/AdmQuizRoutes"));
  app.use("/api/adm/subjects", require("./routes/AdmSubjectRoutes"));

  // ----------------------------------------------------------
  // STUDENT ROUTES
  // ----------------------------------------------------------
  // These EXACTLY match:
  // /api/std/profile
  // /api/std/profile/update-image
  // /api/std/profile/remove-image
  // /api/std/dashboard
  // /api/std/grades
  // /api/std/progress
  // /api/std/quiz
  // /api/std/subjects

  app.use("/api/std/profile", require("./routes/StdProfileRouters"));
  app.use("/api/std/dashboard", require("./routes/StdDashboardRoutes"));
  app.use("/api/std/grades", require("./routes/StdGradeRoutes"));
  app.use("/api/std/progress", require("./routes/StdProgressRoutes"));
  app.use("/api/std/quiz", require("./routes/StdQuizRoutes"));
  app.use("/api/std/subjects", require("./routes/StdSubjectRoutes"));

} catch (err) {
  console.error("🔥 ROUTE LOAD ERROR:", err);
}

/**
 * Health check
 */
app.get("/", (req, res) => {
  res.send("EasyQuiz Backend is running 🚀");
});

/**
 * 404 handler (AFTER all routes)
 */
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

/**
 * Global Error Handler
 */
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

/**
 * Start server
 */
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📂 Uploads served at: /uploads`);
});
