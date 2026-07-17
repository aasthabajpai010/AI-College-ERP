// ============================================================
// APP.JSX — ROOT COMPONENT
// ============================================================
// This wraps the entire app in AuthProvider (so every nested
// component can access login state via useContext) and renders
// AppRoutes (which decides which page to show based on the URL).
// This file itself never changes based on navigation — it's the
// one-time setup layer.

import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import { ThemeProvider } from "./context/ThemeContext";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <NotificationProvider>
            <AppRoutes />
          </NotificationProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;