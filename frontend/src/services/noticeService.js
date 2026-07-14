// ============================================================
// NOTICE SERVICE
// ============================================================

import api from "./api";

// Calls POST /api/notices — creates a notice AND triggers backend's
// Socket.IO broadcast + AI summarization (both happen server-side,
// this call doesn't need to know about either).
export const createNotice = async (title, content, department) => {
  const response = await api.post("/notices", { title, content, department });
  return response.data;
};

// Calls GET /api/notices — fetches the full saved list, newest first
export const getAllNotices = async () => {
  const response = await api.get("/notices");
  return response.data;
};