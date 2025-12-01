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
    PROFILE: "/api/std/profile",
    UPDATE: "/api/std/profile/update",
    UPDATE_IMAGE: "/api/std/profile/update-image",
    REMOVE_IMAGE: "/api/std/profile/remove-image",
    CHANGE_PASSWORD: "/api/std/profile/change-password",
    DELETE_ACCOUNT: "/api/std/profile/delete-account",

    DASHBOARD: "/api/std/dashboard",
    GRADES: "/api/std/grades",
    PROGRESS: "/api/std/progress",
    SUBJECTS: "/api/std/subjects",
    QUIZ: "/api/std/quiz",
  },

  // -------------------------
  // ADMIN ROUTES
  // -------------------------
    ADMIN: {
    DASHBOARD: "/api/adm/dashboard",

    GRADES: "/api/adm/grades",
    ADD_GRADE: "/api/adm/grades/add",
    REMOVE_GRADE: "/api/adm/grades/remove",
    ADD_STUDENT: "/api/adm/grades/add-student",
    REMOVE_STUDENT: "/api/adm/grades/remove-student",

    // ===== SUBJECT API =====
    GET_SUBJECTS: "/api/adm/subjects",                 // GET ?gradeId=
    ADD_SUBJECT: "/api/adm/subjects/add",
    REMOVE_SUBJECT: "/api/adm/subjects/remove",
    ADD_UNIT: "/api/adm/subjects/add-unit",
    REMOVE_UNIT: "/api/adm/subjects/remove-unit",

    QUIZ: "/api/adm/quiz",

    PROFILE: "/api/adm/profile",
    UPDATE: "/api/adm/profile/update",
    UPDATE_IMAGE: "/api/adm/profile/update-image",
    REMOVE_IMAGE: "/api/adm/profile/remove-image",
    CHANGE_PASSWORD: "/api/adm/profile/change-password",
    DELETE_ACCOUNT: "/api/adm/profile/delete-account",
},



  IMAGE: {
    UPLOAD_IMAGE: "/api/auth/upload-image",
  },
};
