export const BASE_URL = "http://localhost:8000";

export const API_PATHS = {
  AUTH: {
    REGISTER: "/api/auth/register",
    ADMIN_REGISTER: "/api/auth/admin-register",
    LOGIN: "/api/auth/login",
    ME: "/api/auth/me",
  },

  // -------------------------
  // STUDENT ROUTES
  // -------------------------
  STUDENT: {
    DASHBOARD: "/api/std/dashboard",
    GRADES: "/api/std/grades",
    PROGRESS: "/api/std/progress",
    SUBJECTS: "/api/std/subjects",
    QUIZ: "/api/std/quiz",
    PROFILE: "/api/std/profile",

    UPDATE_IMAGE: "/api/std/profile/update-image",
    REMOVE_IMAGE: "/api/std/profile/remove-image",
  },

  // -------------------------
  // ADMIN ROUTES
  // -------------------------
  ADMIN: {
    DASHBOARD: "/api/adm/dashboard",
    GRADES: "/api/adm/grades",
    SUBJECTS: "/api/adm/subjects",
    QUIZ: "/api/adm/quiz",
    PROFILE: "/api/adm/profile",   // GET PROFILE

    UPDATE: "/api/adm/profile/update", // UPDATE NAME + IMAGE
    CHANGE_PASSWORD: "/api/adm/profile/change-password",
    DELETE_ACCOUNT: "/api/adm/profile/delete-account",

    UPDATE_IMAGE: "/api/adm/profile/update-image",
    REMOVE_IMAGE: "/api/adm/profile/remove-image",
  },

  IMAGE: {
    UPLOAD_IMAGE: "/api/auth/upload-image",
  },
};
