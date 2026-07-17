// ============================================================
// NAVBAR
// ============================================================
// ============================================================
// NAVBAR
// ============================================================
// ============================================================
// NAVBAR
// ============================================================
// Top bar shown on every authenticated page. Displays the logged-in
// user's name, a dark-mode toggle, a real-time notification bell,
// a color-coded role badge, and Logout.

import { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { NotificationContext } from "../context/NotificationContext";
import { ThemeContext } from "../context/ThemeContext";
import { Sun, Moon, Bell } from "lucide-react";

const roleBadgeStyles = {
  admin: "bg-role-admin/10 text-role-admin border-role-admin/30",
  faculty: "bg-role-faculty/10 text-role-faculty border-role-faculty/30",
  student: "bg-role-student/10 text-role-student border-role-student/30",
};

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { notifications, unreadCount, markAllRead } = useContext(NotificationContext);
  const { isDark, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleBellClick = () => {
    setShowDropdown(!showDropdown);
    if (!showDropdown) markAllRead();
  };

  return (
    <header className="h-16 bg-paper dark:bg-ink-dark-surface border-b border-ink/10 dark:border-paper-dark/10 flex items-center justify-between px-6 relative transition-colors">
      <div className="font-body text-sm text-ink/60 dark:text-paper-dark/60">
        Welcome back,{" "}
        <span className="font-medium text-ink dark:text-paper-dark">{user?.name}</span>
      </div>

      <div className="flex items-center gap-4">
        {/* Dark mode toggle — swaps icon based on current mode, and
            toggleTheme() flips the "dark" class on <html>, which is
            what activates every dark: variant across the whole app. */}
        <button
          onClick={toggleTheme}
          className="text-ink/60 dark:text-paper-dark/60 hover:text-maroon transition-colors p-1"
        >
          {isDark ? <Sun size={18} strokeWidth={1.75} /> : <Moon size={18} strokeWidth={1.75} />}
        </button>

        {/* Bell icon with unread badge */}
        <div className="relative">
          <button
            onClick={handleBellClick}
            className="relative text-ink/60 dark:text-paper-dark/60 hover:text-maroon transition-colors p-1"
          >
            <Bell size={18} strokeWidth={1.75} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-maroon text-white text-[10px] font-body rounded-full w-4 h-4 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-ink-dark-surface rounded-lg shadow-lg border border-ink/10 dark:border-paper-dark/10 py-2 z-50">
              <div className="px-4 py-2 border-b border-ink/10 dark:border-paper-dark/10">
                <p className="font-body text-sm font-medium text-ink dark:text-paper-dark">
                  Notifications
                </p>
              </div>
              {notifications.length === 0 ? (
                <p className="font-body text-sm text-ink/40 dark:text-paper-dark/40 px-4 py-4 text-center">
                  No new notifications
                </p>
              ) : (
                <div className="max-h-72 overflow-y-auto">
                  {notifications.slice(0, 5).map((n) => (
                    <div
                      key={n._id}
                      className="px-4 py-2 hover:bg-paper dark:hover:bg-ink-dark-bg border-b border-ink/5 dark:border-paper-dark/5"
                    >
                      <p className="font-body text-sm text-ink dark:text-paper-dark font-medium">
                        {n.title}
                      </p>
                      <p className="font-body text-xs text-ink/50 dark:text-paper-dark/50 truncate">
                        {n.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              <Link
                to="/notices"
                onClick={() => setShowDropdown(false)}
                className="block px-4 py-2 text-center font-body text-sm text-maroon hover:underline"
              >
                View all notices
              </Link>
            </div>
          )}
        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-medium border capitalize ${
            roleBadgeStyles[user?.role]
          }`}
        >
          {user?.role}
        </span>

        <button
          onClick={handleLogout}
          className="text-sm font-body text-ink/60 dark:text-paper-dark/60 hover:text-maroon transition-colors"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Navbar;