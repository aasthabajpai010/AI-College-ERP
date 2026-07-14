// ============================================================
// ATTENDANCE SERVICE
// ============================================================

import api from "./api";

// Calls POST /api/attendance — mark a student present/absent (Faculty/Admin only)
export const markAttendance = async (student, date, status) => {
  const response = await api.post("/attendance", { student, date, status });
  return response.data;
};

// Calls GET /api/attendance/:studentId — list of attendance records
export const getStudentAttendance = async (studentId) => {
  const response = await api.get(`/attendance/${studentId}`);
  return response.data;
};

// Calls GET /api/attendance/:studentId/percentage — aggregation result
export const getAttendancePercentage = async (studentId) => {
  const response = await api.get(`/attendance/${studentId}/percentage`);
  return response.data;
};

// Calls GET /api/attendance/defaulters — students below 75% (Admin/Faculty only)
export const getDefaulterList = async () => {
  const response = await api.get("/attendance/defaulters");
  return response.data;
};