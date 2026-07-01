// ============================================================
// ERP BACKEND - Simple Express Server (Beginner Friendly)
// ============================================================

// ------------------------------------------------------------
// STEP 1: Load environment variables from the .env file
// ------------------------------------------------------------
//
// WHY dotenv?
// - Your app needs settings like PORT, database URLs, and API keys.
// - These values should NOT be hard-coded in your source code.
// - The .env file stores them locally (and is usually kept out of Git).
// - dotenv reads that file and puts each value into process.env.
//
// Example: if .env contains "PORT=5000", then process.env.PORT becomes "5000".
//
require("dotenv").config();

// ------------------------------------------------------------
// STEP 2: Import the packages we need
// ------------------------------------------------------------

// WHY express?
// - Express is a web framework for Node.js.
// - Node.js alone can handle HTTP, but Express makes it much easier:
//   defining routes (URLs), reading requests, and sending responses.
// - It is the most popular choice for building REST APIs and backends.
//
const express = require("express");

// WHY cors?
// - Browsers block requests from one origin to another by default
//   (this is called the "Same-Origin Policy").
// - Example: your React app runs on http://localhost:3000
//   and your API runs on http://localhost:5000 — different origins.
// - cors adds HTTP headers that tell the browser:
//   "It is OK for the frontend to call this backend."
// - Without cors, browser-based apps often get CORS errors.
//
const cors = require("cors");

const authRoutes = require("./src/routes/auth.routes");

// ------------------------------------------------------------
// STEP 3: Create the Express application
// ------------------------------------------------------------
//
// express() creates a new app object.
// Think of "app" as your server — you will attach routes and middleware to it.
//
const app = express();

// ------------------------------------------------------------
// STEP 4: Use middleware
// ------------------------------------------------------------
//
// Middleware = functions that run BEFORE your route handlers.
// They can modify the request, modify the response, or end the request early.
//
// app.use(cors()) enables CORS for ALL routes on this server.
// Every incoming request will get the proper CORS headers in the response.
//
app.use(cors());

app.use("/api/auth", authRoutes);

// ------------------------------------------------------------
// STEP 5: Define a route — GET "/"
// ------------------------------------------------------------
//
// A "route" connects an HTTP method + URL path to a function that handles it.
//
// app.get("/", ...) means:
//   "When someone sends a GET request to the root URL (/), run this function."
//
// GET is used to READ or FETCH data (not to create or delete).
//
// The function receives two objects:
//   req (request)  — everything the client sent (URL, headers, body, etc.)
//   res (response) — what we send back to the client
//
app.get("/", (req, res) => {
  // res.send() sends a response back to the client and ends the request.
  // Here we send plain text: "ERP Backend Running"
  res.send("ERP Backend Running");
});

// ------------------------------------------------------------
// STEP 6: Read PORT from environment variables and start the server
// ------------------------------------------------------------
//
// process.env.PORT reads the PORT value that dotenv loaded from .env.
// || 5000 is a fallback: if PORT is missing, use 5000 instead.
//
const PORT = process.env.PORT || 5000;

// app.listen() starts the server and waits for incoming HTTP requests.
//
// Arguments:
//   1. PORT — which port number to listen on (e.g. 5000)
//   2. Callback — runs once the server is ready
//
// After this runs, you can visit http://localhost:5000 in a browser
// or call the API from a frontend app.
//
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
