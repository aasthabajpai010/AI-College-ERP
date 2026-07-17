// ============================================================
// SIDEBAR
// ============================================================
// Fixed left navigation, present on every authenticated page.
// Shows different links depending on the logged-in user's role —
// reads role from AuthContext, same pattern as ProtectedRoute.

// ============================================================
// SIDEBAR
// ============================================================
import { useContext } from "react";
import { NavLink } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
  LayoutDashboard,
  Users,
  Building2,
  ClipboardCheck,
  GraduationCap,
  Bell,
} from "lucide-react";

const Sidebar = () => {
  const { user } = useContext(AuthContext);

  // Each link now carries an icon component alongside its label —
  // icons make the sidebar scannable at a glance instead of relying
  // purely on reading text, which is how most polished dashboards feel.
  const navLinksByRole = {
    admin: [
      { label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
      { label: "Students", path: "/students", icon: Users },
      { label: "Departments", path: "/departments", icon: Building2 },
      { label: "Attendance", path: "/attendance", icon: ClipboardCheck },
      { label: "Results", path: "/results", icon: GraduationCap },
      { label: "Notices", path: "/notices", icon: Bell },
    ],
    faculty: [
      { label: "Dashboard", path: "/faculty/dashboard", icon: LayoutDashboard },
      { label: "Attendance", path: "/attendance", icon: ClipboardCheck },
      { label: "Results", path: "/results", icon: GraduationCap },
      { label: "Notices", path: "/notices", icon: Bell },
    ],
    student: [
      { label: "Dashboard", path: "/student/dashboard", icon: LayoutDashboard },
      { label: "My Attendance", path: "/attendance", icon: ClipboardCheck },
      { label: "My Results", path: "/results", icon: GraduationCap },
      { label: "Notices", path: "/notices", icon: Bell },
    ],
  };

  const links = navLinksByRole[user?.role] || [];

  return (
    <aside className="w-64 bg-ink dark:bg-ink-dark-surface text-paper min-h-screen flex flex-col transition-colors">
      <div className="px-6 py-6 border-b border-white/10">
        <h1 className="font-display text-xl font-semibold tracking-tight">
          College ERP
        </h1>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg font-body text-sm transition-all ${
                  isActive
                    ? "bg-maroon text-white shadow-sm"
                    : "text-paper/70 hover:bg-ink-light hover:text-paper hover:translate-x-0.5"
                }`
              }
            >
              <Icon size={18} strokeWidth={1.75} />
              {link.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;