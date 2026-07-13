// ============================================================
// AUTH CONTEXT — GLOBAL LOGIN STATE
// ============================================================
// This is the single source of truth for "who is logged in right now"
// across the ENTIRE app. Any component, no matter how deeply nested,
// can access the current user/token by calling useContext(AuthContext)
// — without needing it passed down through props at every level.

import { createContext, useState, useEffect } from "react";
import api from "../services/api";

// createContext() sets up the "container" that will hold our shared data.
// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // WHY useState here, initialized from localStorage?
  // On a page refresh, React state resets to nothing — but the JWT
  // is still sitting in localStorage from before. Reading it here
  // means a refreshed page doesn't log the user out.
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [loading, setLoading] = useState(true);

  // On first mount, confirm we're not in a broken state (e.g. a user
  // object exists but the token got cleared some other way).
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
    }
    setLoading(false);
  }, []);

  // ------------------------------------------------------------
  // login() — called by the Login page after a successful API call.
  // Centralizing this here means the Login page doesn't need to know
  // HOW auth state is stored (localStorage vs cookies vs anything else)
  // — it just calls login(userData, token) and this handles the rest.
  // ------------------------------------------------------------
  const login = (userData, token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  // ------------------------------------------------------------
  // logout() — clears everything, from anywhere in the app.
  // ------------------------------------------------------------
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  // Whatever we put inside "value" is what every component using
  // useContext(AuthContext) will be able to read/call.
  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};