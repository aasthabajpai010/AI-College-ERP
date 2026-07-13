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
import StudentDashboard from "../pages/StudentDashboard"; // NEW

const AdminDashboardPlaceholder = () => <h1 className="p-8 text-2xl">Admin Dashboard (placeholder)</h1>;
const FacultyDashboardPlaceholder = () => <h1 className="p-8 text-2xl">Faculty Dashboard (placeholder)</h1>;

const AppRoutes = () => {
  return (
    <Routes>
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
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default AppRoutes;