// ============================================================
// AXIOS INSTANCE — CENTRAL API CONFIGURATION
// ============================================================
// This is the ONLY place in the entire frontend that knows the
// backend's base URL and how to attach authentication.
// Every service file (authService, studentService, etc.) imports
// THIS instance instead of importing axios directly — that way,
// JWT attachment and expired-token handling happen automatically,
// without repeating this logic in every single API call.

import axios from "axios";

// Create a pre-configured axios instance with our backend's base URL.
// Reading from an environment variable (not hardcoding) means this
// same code works in both local development and production without
// any code changes — just a different .env value.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// ------------------------------------------------------------
// REQUEST INTERCEPTOR — runs before every single outgoing request
// ------------------------------------------------------------
// This automatically attaches the JWT (if one exists in localStorage)
// to every request's Authorization header, so individual service
// functions never need to manually add it themselves.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ------------------------------------------------------------
// RESPONSE INTERCEPTOR — runs on every response, success or failure
// ------------------------------------------------------------
// If ANY API call comes back with 401 (token expired or invalid),
// this catches it in ONE place, clears the stale token, and sends
// the user back to login — instead of every page needing its own
// try/catch to handle this exact scenario.
api.interceptors.response.use(
  (response) => response, // pass successful responses through unchanged
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;