// ============================================================
// RESULT SERVICE
// ============================================================

import api from "./api";

// Calls POST /api/results — add marks for a student (Faculty/Admin only)
export const addResult = async (student, subject, semester, marksObtained, maxMarks) => {
  const response = await api.post("/results", {
    student,
    subject,
    semester,
    marksObtained,
    maxMarks,
  });
  return response.data;
};

// Calls GET /api/results/:studentId — list of results
export const getStudentResults = async (studentId) => {
  const response = await api.get(`/results/${studentId}`);
  return response.data;
};

// Calls GET /api/results/:studentId/cgpa — aggregation result
export const getCGPA = async (studentId) => {
  const response = await api.get(`/results/${studentId}/cgpa`);
  return response.data;
};