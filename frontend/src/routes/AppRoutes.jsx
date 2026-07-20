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
import StudentDashboard from "../pages/StudentDashboard";
import AdminDashboard from "../pages/AdminDashboard";
import FacultyDashboard from "../pages/FacultyDashboard";
import Attendance from "../pages/Attendance"; // NEW import
import Results from "../pages/Results"; 
import Students from "../pages/Students";
import Notices from "../pages/Notices"; 
import Register from "../pages/Register"; 
import Departments from "../pages/Departments"; 
import NotFound from "../pages/NotFound";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />


      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/faculty/dashboard"
        element={
          <ProtectedRoute allowedRoles={["faculty"]}>
            <FacultyDashboard />
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


      <Route
        path="/attendance"
        element={
          <ProtectedRoute allowedRoles={["admin", "faculty", "student"]}>
            <Attendance />
          </ProtectedRoute>
        }
      />

      <Route
  path="/results"
  element={
    <ProtectedRoute allowedRoles={["admin", "faculty", "student"]}>
      <Results />
    </ProtectedRoute>
  }
/>
<Route
  path="/students"
  element={
    <ProtectedRoute allowedRoles={["admin"]}>
      <Students />
    </ProtectedRoute>
  }
/>
<Route
  path="/notices"
  element={
    <ProtectedRoute allowedRoles={["admin", "faculty", "student"]}>
      <Notices />
    </ProtectedRoute>
  }
/>
<Route
  path="/departments"
  element={
    <ProtectedRoute allowedRoles={["admin"]}>
      <Departments />
    </ProtectedRoute>
  }
/>
{/* Catch-all — must be the LAST route. path="*" matches any URL
    that didn't match one of the routes defined above it. */}
<Route path="*" element={<NotFound />} />
 
 
 
  </Routes>
  );
};



export default AppRoutes;