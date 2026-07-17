// ============================================================
// THEME CONTEXT
// ============================================================
// Manages dark/light mode globally. The chosen mode is saved to
// localStorage so it persists across page refreshes and future
// visits — same pattern as AuthContext persisting the JWT.

import { createContext, useState, useEffect } from "react";

// eslint-disable-next-line react-refresh/only-export-components
export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  // Whenever isDark changes, add/remove the "dark" class on the root
  // <html> element — Tailwind's dark: variant only activates when
  // an ancestor has this exact class present.
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};