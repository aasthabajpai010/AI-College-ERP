import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

// ... roleBadgeStyles same rahega ...

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // clears token + user from context/localStorage
    navigate("/login"); // immediately redirect, don't wait for next navigation
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