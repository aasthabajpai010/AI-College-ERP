// ============================================================
// NAVBAR
// ============================================================
// Top bar shown alongside the Sidebar. Shows the logged-in user's
// name and a role badge with a role-specific accent color — this
// is the "signature element" from our design plan: at a glance,
// the badge color tells you which role's view you're looking at.

import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

// Maps each role to its badge color, defined in our Tailwind theme tokens.
const roleBadgeStyles = {
  admin: "bg-role-admin",
  faculty: "bg-role-faculty",
  student: "bg-role-student",
};

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="bg-paper border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div>
        <h2 className="font-display text-lg text-ink">
          Welcome, {user?.name}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Role badge — the signature element mentioned in the design plan */}
        <span
          className={`${roleBadgeStyles[user?.role]} text-paper text-xs font-medium px-3 py-1 rounded-full capitalize`}
        >
          {user?.role}
        </span>

        <button
          onClick={handleLogout}
          className="text-sm text-ink/70 hover:text-maroon transition-colors"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Navbar;