// ============================================================
// SIDEBAR
// ============================================================
// Fixed left navigation, present on every authenticated page.
// Shows different links depending on the logged-in user's role —
// reads role from AuthContext, same pattern as ProtectedRoute.

import { useContext } from "react";
import { NavLink } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Sidebar = () => {
  const { user } = useContext(AuthContext);

  // Define nav links per role. Each role sees a different set of
  // pages, matching what their backend RBAC actually permits them
  // to do — no point showing a "Manage Students" link to a student.
  const navLinksByRole = {
    admin: [
      { label: "Dashboard", path: "/admin/dashboard" },
      { label: "Students", path: "/students" },
      { label: "Departments", path: "/departments" },
      { label: "Attendance", path: "/attendance" },
      { label: "Results", path: "/results" },
      { label: "Notices", path: "/notices" },
    ],
    faculty: [
      { label: "Dashboard", path: "/faculty/dashboard" },
      { label: "Attendance", path: "/attendance" },
      { label: "Results", path: "/results" },
      { label: "Notices", path: "/notices" },
    ],
    student: [
      { label: "Dashboard", path: "/student/dashboard" },
      { label: "My Attendance", path: "/attendance" },
      { label: "My Results", path: "/results" },
      { label: "Notices", path: "/notices" },
    ],
  };

  const links = navLinksByRole[user?.role] || [];

  return (
    <aside className="w-64 bg-ink text-paper min-h-screen flex flex-col">
      <div className="px-6 py-6 border-b border-white/10">
        <h1 className="font-display text-xl font-semibold tracking-tight">
          College ERP
        </h1>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              `block px-3 py-2 rounded font-body text-sm transition-colors ${
                isActive
                  ? "bg-maroon text-white"
                  : "text-paper/70 hover:bg-ink-light hover:text-paper"
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;