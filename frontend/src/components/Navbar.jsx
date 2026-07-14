// ============================================================
// NAVBAR
// ============================================================
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

// YE OBJECT COMPONENT FUNCTION SE BAHAR, TOP PE HONA CHAHIYE
const roleBadgeStyles = {
  admin: "bg-role-admin/10 text-role-admin border-role-admin/30",
  faculty: "bg-role-faculty/10 text-role-faculty border-role-faculty/30",
  student: "bg-role-student/10 text-role-student border-role-student/30",
};

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="h-16 bg-paper border-b border-ink/10 flex items-center justify-between px-6">
      <div className="font-body text-sm text-ink/60">
        Welcome back, <span className="font-medium text-ink">{user?.name}</span>
      </div>

      <div className="flex items-center gap-4">
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium border capitalize ${
            roleBadgeStyles[user?.role]
          }`}
        >
          {user?.role}
        </span>

        <button
          onClick={handleLogout}
          className="text-sm font-body text-ink/60 hover:text-maroon transition-colors"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Navbar;