// backend/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const connectDB = require("./config/db");
const app = express();
// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
// Serve uploaded images
app.use("/uploads", express.static(uploadsDir));
// Connect MongoDB
connectDB();
// Load Routes
// Load Routes
try {
  // AUTH
  console.log("Loading authRoutes");
  app.use("/api/auth", require("./routes/authRoutes.js"));

  // ADMIN ROUTES
  console.log("Loading AdmDashboardRoutes");
  app.use("/api/adm/dashboard", require("./routes/AdmDashboardRoutes.js"));

  console.log("Loading AdmGradeRoutes");
  app.use("/api/adm/grades", require("./routes/AdmGradeRoutes.js"));

  console.log("Loading AdmProfileRoutes");
  app.use("/api/adm/profile", require("./routes/AdmProfileRoutes.js"));

  console.log("Loading AdmQuizRoutes");
  app.use("/api/adm/quiz", require("./routes/AdmQuizRoutes.js"));

  console.log("Loading AdmSubjectRoutes");
  app.use("/api/adm/subjects", require("./routes/AdmSubjectRoutes.js"));

  // STUDENT ROUTES
  console.log("Loading StdProfileRoutes");
  app.use("/api/std/profile", require("./routes/StdProfileRoutes.js"));

  console.log("Loading StdDashboardRoutes");
  app.use("/api/std/dashboard", require("./routes/StdDashboardRoutes.js"));

  console.log("Loading StdGradeRoutes");
  app.use("/api/std/grades", require("./routes/StdGradeRoutes.js"));

  console.log("Loading StdProgressRoutes");
  app.use("/api/std/progress", require("./routes/StdProgressRoutes.js"));

  console.log("Loading StdQuizRoutes");
  app.use("/api/std/quiz", require("./routes/StdQuizRoutes.js"));

  console.log("Loading StdSubjectRoutes");
  app.use("/api/std/subjects", require("./routes/StdSubjectRoutes.js"));

} catch (err) {
  console.error("🔥 ROUTE LOAD ERROR:", err);
}

// Health check
app.get("/", (req, res) => {
  res.send("EasyQuiz Backend is running 🚀");
});
// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});
// Error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📂 Uploads served at: /uploads`);
});
