// ============================================================
// SOCKET.IO SETUP
// ============================================================
// This file configures Socket.IO to run alongside our normal Express
// HTTP server. Unlike a regular HTTP request (one request, one
// response, connection closes), Socket.IO keeps a persistent,
// two-way connection open between server and client — so the server
// can PUSH data to the client at any time, without the client asking.

const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

let io; // will hold our Socket.IO server instance once initialized

// ------------------------------------------------------------
// initializeSocket(server)
// Called once from server.js, passing in the raw HTTP server
// (not the Express app directly — Socket.IO needs the lower-level
// HTTP server to attach itself to).
// ------------------------------------------------------------
const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*", // in production, replace with your actual frontend URL
      methods: ["GET", "POST"],
    },
  });

  // ------------------------------------------------------------
  // AUTHENTICATION MIDDLEWARE FOR SOCKET CONNECTIONS
  // ------------------------------------------------------------
  // Just like our Express "protect" middleware checks the JWT on
  // every HTTP request, this checks the JWT once, at the moment a
  // client tries to open a socket connection. The client sends the
  // token via the "auth" object when connecting:
  //   io(url, { auth: { token: "..." } })
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("Not authorized, no token"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // Attach decoded user info to the socket, so we can use
      // socket.user.role or socket.user.id later in event handlers
      socket.user = decoded;
      next(); // allow the connection
    } catch (error) {
      next(new Error("Not authorized, invalid token"));
    }
  });

  // ------------------------------------------------------------
  // CONNECTION HANDLER — runs once per client that successfully connects
  // ------------------------------------------------------------
  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}, user role: ${socket.user.role}`);

    // ------------------------------------------------------------
    // ROOMS: a client can "join" a named room. Later, we can emit
    // an event to just that room instead of broadcasting to everyone.
    // Here, every connected client automatically joins a room named
    // after their role, so we can target "all faculty" or "all students"
    // if needed later.
    // ------------------------------------------------------------
    socket.join(socket.user.role); // e.g. joins room "student", "faculty", or "admin"

    // Clean up when a client disconnects (closes tab, loses connection, etc.)
    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

// ------------------------------------------------------------
// getIO() — lets other files (like notice.controller.js) access
// the same Socket.IO instance to emit events, without needing to
// pass it around manually as a function parameter everywhere.
// ------------------------------------------------------------
const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO not initialized yet");
  }
  return io;
};

module.exports = { initializeSocket, getIO };