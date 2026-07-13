// ============================================================
// SIDEBAR
// ============================================================
// Fixed left navigation, shown on every authenticated page.
// Links shown depend on the user's role — a student shouldn't
// see a "Manage Departments" link, for example.

import { NavLink } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const Sidebar = () => {
  const { user } = useContext(AuthContext);

  // Define nav links per role. Keeping this as data (not repeated JSX)
  // means adding a new link later is a one-line change, not restructuring markup.
  const linksByRole = {
    admin: [
      { to: "/admin/dashboard", label: "Dashboard" },
      { to: "/students", label: "Students" },
      { to: "/departments", label: "Departments" },
      { to: "/notices", label: "Notices" },
    ],
    faculty: [
      { to: "/faculty/dashboard", label: "Dashboard" },
      { to: "/attendance", label: "Attendance" },
      { to: "/results", label: "Results" },
      { to: "/notices", label: "Notices" },
    ],
    student: [
      { to: "/student/dashboard", label: "Dashboard" },
      { to: "/attendance", label: "My Attendance" },
      { to: "/results", label: "My Results" },
      { to: "/notices", label: "Notices" },
    ],
  };

  const links = user ? linksByRole[user.role] : [];

  return (
    <aside className="bg-ink text-paper w-60 min-h-screen flex flex-col">
      <div className="px-6 py-6 border-b border-ink-light">
        <h1 className="font-display text-xl font-semibold">College ERP</h1>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `block px-3 py-2 rounded text-sm transition-colors ${
                isActive
                  ? "bg-maroon text-paper font-medium"
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