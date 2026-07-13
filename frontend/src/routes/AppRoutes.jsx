// ============================================================
// APP ROUTES
// ============================================================
// Maps every URL path to a page component. Dashboard routes are
// wrapped in ProtectedRoute with the specific roles allowed to
// access them — this is the code version of the routing flow
// diagram (Login → role check → redirect to the right dashboard).

import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import ProtectedRoute from "../components/ProtectedRoute";

// TEMPORARY placeholder components — will be replaced by the real
// AdminDashboard.jsx, FacultyDashboard.jsx, StudentDashboard.jsx
// files once we reach that build step.
const AdminDashboardPlaceholder = () => <h1 className="p-8 text-2xl">Admin Dashboard (placeholder)</h1>;
const FacultyDashboardPlaceholder = () => <h1 className="p-8 text-2xl">Faculty Dashboard (placeholder)</h1>;
const StudentDashboardPlaceholder = () => <h1 className="p-8 text-2xl">Student Dashboard (placeholder)</h1>;

const AppRoutes = () => {
  return (
    <Routes>
      {/* Root path redirects straight to login for now */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/login" element={<Login />} />

      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboardPlaceholder />
          </ProtectedRoute>
        }
      />

      <Route
        path="/faculty/dashboard"
        element={
          <ProtectedRoute allowedRoles={["faculty"]}>
            <FacultyDashboardPlaceholder />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/dashboard"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <StudentDashboardPlaceholder />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default AppRoutes;