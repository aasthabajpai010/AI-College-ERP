// ============================================================
// DATABASE CONNECTION
// ============================================================
// This file has ONE job: connect our Node.js app to MongoDB using Mongoose.
// We keep database setup separate from server.js (clean MVC / config pattern).

const mongoose = require("mongoose");

/**
 * connectDB — connects to MongoDB when the server starts.
 * Import and call this once from server.js before app.listen().
 */
const connectDB = async () => {
  try {
    // ----------------------------------------------------------------
    // WHY read MONGO_URI from process.env instead of hardcoding it?
    // ----------------------------------------------------------------
    // - Security: database URLs often contain usernames and passwords.
    //   Hardcoding them in source code is risky (Git history, leaks).
    // - Flexibility: dev, staging, and production use different databases.
    //   Same code, different .env file — no code changes needed.
    // - dotenv (loaded in server.js) puts .env values into process.env.
    //
    // Example .env value:
    // MONGO_URI=mongodb://localhost:27017/college_erp

    // ----------------------------------------------------------------
    // WHY async/await with mongoose.connect()?
    // ----------------------------------------------------------------
    // mongoose.connect() returns a Promise — it does NOT finish instantly.
    // Connecting over the network takes time (milliseconds to seconds).
    // await pauses this function until the connection succeeds or fails.
    // Without await, we would not know when (or if) the DB is ready.
    await mongoose.connect(process.env.MONGO_URI);

    // ----------------------------------------------------------------
    // WHAT is mongoose.connection.host?
    // ----------------------------------------------------------------
    // After a successful connect, Mongoose stores connection details on
    // mongoose.connection. The .host property is the MongoDB server
    // hostname we connected to (e.g. "localhost" or a cloud cluster name).
    // Logging it confirms WHICH database server we actually reached.
    console.log(`MongoDB Connected: ${mongoose.connection.host}`);
  } catch (error) {
    // ----------------------------------------------------------------
    // WHY wrap in try/catch?
    // ----------------------------------------------------------------
    // Network errors, wrong URI, auth failures, or MongoDB being down
    // will reject the Promise from mongoose.connect().
    // try/catch lets us handle that failure instead of crashing silently
    // or with an unhandled promise rejection.
    console.error(`Error: ${error.message}`);

    // ----------------------------------------------------------------
    // WHY process.exit(1) on failure?
    // ----------------------------------------------------------------
    // An ERP system depends on the database for users, placements, etc.
    // Running the API without a DB would break every route that needs data.
    // Exiting immediately makes the failure obvious (server won't stay up)
    // and lets process managers (PM2, Docker, hosting platforms) restart it.
    process.exit(1);
  }
};

module.exports = connectDB;
