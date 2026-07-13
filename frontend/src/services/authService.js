// ============================================================
// AUTH SERVICE
// ============================================================
// Wraps every auth-related API call in one place. Pages call these
// functions (e.g., login(email, password)) instead of writing
// api.post("/auth/login", ...) directly — if the backend's auth
// endpoints ever change shape, only this file needs updating.

import api from "./api";

// ------------------------------------------------------------
// registerUser — calls POST /api/auth/register
// ------------------------------------------------------------
export const registerUser = async (name, email, password, role) => {
  const response = await api.post("/auth/register", {
    name,
    email,
    password,
    role,
  });
  return response.data; // { success, token, user }
};

// ------------------------------------------------------------
// loginUser — calls POST /api/auth/login
// ------------------------------------------------------------
export const loginUser = async (email, password) => {
  const response = await api.post("/auth/login", { email, password });
  return response.data; // { success, token, user }
};