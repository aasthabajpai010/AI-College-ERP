// ============================================================
// DASHBOARD SERVICE
// ============================================================
// Wraps the dashboard aggregation endpoints. Pages call these
// functions instead of writing api.get(...) directly.

import api from "./api";

// Calls GET /api/dashboard/admin — college-wide summary
export const getAdminDashboard = async () => {
  const response = await api.get("/dashboard/admin");
  return response.data;
};

// Calls GET /api/dashboard/student/:studentId — one student's own summary
export const getStudentDashboard = async (studentId) => {
  const response = await api.get(`/dashboard/student/${studentId}`);
  return response.data;
};