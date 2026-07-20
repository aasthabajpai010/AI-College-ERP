// ============================================================
// DEPARTMENT SERVICE
// ============================================================

import api from "./api";

// Calls GET /api/departments — everyone can view
export const getAllDepartments = async () => {
  const response = await api.get("/departments");
  return response.data;
};

// Calls POST /api/departments — Admin only
export const createDepartment = async (name, code) => {
  const response = await api.post("/departments", { name, code });
  return response.data;
};

// Calls DELETE /api/departments/:id — Admin only
export const deleteDepartment = async (id) => {
  const response = await api.delete(`/departments/${id}`);
  return response.data;
};