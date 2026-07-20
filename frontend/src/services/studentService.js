// ============================================================
// STUDENT SERVICE
// ============================================================
// Wraps student-related API calls. Includes getMyProfile(), which
// uses the ownership-based /me endpoint — this is how a logged-in
// student finds their OWN Student _id, needed for calling the
// attendance/results/dashboard endpoints that expect a Student ID.

import api from "./api";

// Calls GET /api/students/me — returns the logged-in student's own profile
export const getMyProfile = async () => {
  const response = await api.get("/students/me");
  return response.data;
};

// Calls GET /api/students — full list, Admin/Faculty only
export const getAllStudents = async () => {
  const response = await api.get("/students");
  return response.data;
};

// Calls POST /api/students — create a new student profile, Admin only
export const createStudent = async (studentData) => {
  const response = await api.post("/students", studentData);
  return response.data;
};

// Add these two to src/services/studentService.js:

// Calls PUT /api/students/:id — update a student profile, Admin only
export const updateStudent = async (id, data) => {
  const response = await api.put(`/students/${id}`, data);
  return response.data;
};

// Calls DELETE /api/students/:id — delete a student profile, Admin only
export const deleteStudent = async (id) => {
  const response = await api.delete(`/students/${id}`);
  return response.data;
};