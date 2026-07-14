// ============================================================
// NOTIFICATION CONTEXT
// ============================================================
// Holds the list of real-time notices received via Socket.IO, plus
// an unread count. This lives at the App level (not inside the
// Notices page) so the Navbar's bell icon can show a badge and
// dropdown no matter which page the user is currently on.

import { createContext, useState, useCallback } from "react";
import useSocket from "../hooks/useSocket";

// eslint-disable-next-line react-refresh/only-export-components
export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const handleNewNotice = useCallback((notice) => {
    setNotifications((prev) => [notice, ...prev]);
    setUnreadCount((prev) => prev + 1);
  }, []);

  // The socket connection itself lives HERE now, at the top of the
  // app, instead of inside Notices.jsx — this is what lets the bell
  // icon receive events regardless of which page is currently open.
  useSocket(handleNewNotice);

  const markAllRead = () => {
    setUnreadCount(0);
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAllRead }}>
      {children}
    </NotificationContext.Provider>
  );
};