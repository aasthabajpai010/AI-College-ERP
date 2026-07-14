// ============================================================
// useSocket HOOK
// ============================================================
// Establishes ONE Socket.IO connection, authenticated with the same
// JWT used for REST calls. Any component that needs to react to
// real-time events (like a new notice) uses this hook, rather than
// each component opening its own separate socket connection.

import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

// onNewNotice is a callback passed in by whichever component wants
// to be notified when a "newNotice" event arrives.
const useSocket = (onNewNotice) => {
  // useRef (not useState) holds the socket instance — we don't want
  // changing this value to trigger a re-render, we just need a
  // stable reference to it across renders.
  const socketRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return; // don't attempt a socket connection if not logged in

    // Connect to the backend's Socket.IO server, passing the JWT
    // via the "auth" object — this is read by our backend's
    // io.use() middleware (socket.js) to verify identity, exactly
    // parallel to how api.js attaches the JWT to REST requests.
    const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";
    socketRef.current = io(socketUrl, {
      auth: { token },
    });

    // Listen for the "newNotice" event our backend's
    // notice.controller.js emits after successfully creating a notice.
    socketRef.current.on("newNotice", (notice) => {
      onNewNotice(notice);
    });

    // Cleanup: disconnect when this component unmounts, so we don't
    // leave stale connections open (e.g. after logout or navigating away).
    return () => {
      socketRef.current.disconnect();
    };
  }, [onNewNotice]);
};

export default useSocket;