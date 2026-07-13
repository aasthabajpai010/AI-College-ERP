// ============================================================
// PROTECTED ROUTE
// ============================================================
// Wraps a page component and checks two things before rendering it:
// 1. Is the user logged in at all?
// 2. If specific roles are required, does the user's role match?
//
// IMPORTANT: This is a UX convenience, NOT the real security boundary.
// The actual enforcement lives in the backend's protect + authorizeRoles
// middleware — this component just avoids showing a broken/empty page
// to a user who's about to get a 403 from the API anyway.

import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

// allowedRoles is an array, e.g. ["admin"] or ["admin", "faculty"]
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  // Avoid a flash-redirect to /login while AuthContext is still
  // reading localStorage on first load.
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // Not logged in at all → send to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Logged in, but role isn't in the allowed list for this route
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  // Passed both checks — render the actual page
  return children;
};

export default ProtectedRoute;