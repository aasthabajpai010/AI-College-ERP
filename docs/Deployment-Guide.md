# Deployment Guide

## AI-Integrated College ERP System

This guide covers running the project locally for development, and deploying it to production.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Local Development Setup](#local-development-setup)
- [Environment Variables](#environment-variables)
- [Seeding Demo Data](#seeding-demo-data)
- [Deploying the Backend](#deploying-the-backend)
- [Deploying the Frontend](#deploying-the-frontend)
- [Post-Deployment Checklist](#post-deployment-checklist)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

- Node.js 18 or higher
- A MongoDB Atlas account (free tier is sufficient) — [mongodb.com/atlas](https://www.mongodb.com/atlas)
- An OpenRouter API key — [openrouter.ai](https://openrouter.ai)
- Git

---

## Local Development Setup

### 1. Clone the repository

```bash
git clone https://github.com/aasthabajpai010/AI-College-ERP.git
cd AI-College-ERP
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Install frontend dependencies

```bash
cd ../frontend
npm install
```

### 4. Create environment files

Copy the example files and fill in real values:

```bash
cd ../backend
cp .env.example .env

cd ../frontend
cp .env.example .env
```

See [Environment Variables](#environment-variables) below for what each value should be.

### 5. Run both servers

In two separate terminal windows:

```bash
# Terminal 1 — Backend
cd backend
npm run dev
```

```bash
# Terminal 2 — Frontend
cd frontend
npm run dev
```

- Backend runs at `http://localhost:5000`
- Frontend runs at `http://localhost:5173`

Confirm the backend terminal shows both `Server is running on http://localhost:5000` and `MongoDB Connected: ...` before using the app.

---

## Environment Variables

### `backend/.env`

| Variable | Description | Example |
|---|---|---|
| `PORT` | Port the Express server listens on | `5000` |
| `MONGO_URI` | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/erp_db` |
| `JWT_SECRET` | Random secret used to sign JWTs | A long random string — generate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `JWT_EXPIRY` | Access token lifetime | `1d` |
| `OPENROUTER_API_KEY` | API key for AI notice summarization | From openrouter.ai/keys |

### `frontend/.env`

| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Backend REST API base URL | `http://localhost:5000/api` (local) or your deployed backend URL |
| `VITE_SOCKET_URL` | Backend Socket.IO URL | `http://localhost:5000` (local) or your deployed backend URL |

**Getting a MongoDB URI:** Atlas Dashboard → your Cluster → Connect → Drivers → copy the connection string, then replace `<password>` with your database user's password and add a database name before the `?`.

**Note on DNS issues:** If you see `querySrv ECONNREFUSED` when connecting to Atlas, this is typically a DNS resolution problem with the `mongodb+srv://` format on certain networks — switching your machine's DNS to a public resolver (e.g. Google DNS: 8.8.8.8 / 8.8.4.4) resolves it in most cases.

---

## Seeding Demo Data

To populate the database with realistic demo data instead of starting empty:

```bash
cd backend
node src/seed.js
```

This creates 1 Admin, 1 Faculty, 5 Students across 3 departments, 10 days of varied attendance, and result records — printing login credentials to the console when done.

**Warning:** This script deletes existing data in the Users, Departments, Students, Attendance, and Results collections before inserting fresh demo data. Do not run it against data you want to keep.

---

## Deploying the Backend

Any Node.js-friendly host works (Render, Railway, Fly.io, etc.). General steps using **Render** as an example:

1. Push your code to GitHub (already done if following this repo)
2. Create a new **Web Service** on Render, connect your GitHub repo
3. Set the **root directory** to `backend`
4. Set the **build command**: `npm install`
5. Set the **start command**: `npm start` (or `node server.js`)
6. Add all backend environment variables (from the table above) in Render's Environment tab — **do not** upload a `.env` file, set them directly in the dashboard
7. Deploy — Render gives you a public URL like `https://your-app.onrender.com`

### MongoDB Atlas Network Access

By default, Atlas blocks connections from unrecognized IPs. Once deployed:
1. Atlas Dashboard → Network Access → Add IP Address
2. Either add your hosting provider's specific IP range, or select **"Allow Access from Anywhere"** (`0.0.0.0/0`) for simplicity — acceptable for a portfolio project, not recommended for production systems handling real sensitive data

---

## Deploying the Frontend

Using **Vercel** or **Netlify** as an example (both work near-identically for a Vite app):

1. Connect your GitHub repo to Vercel/Netlify
2. Set the **root directory** to `frontend`
3. Set the **build command**: `npm run build`
4. Set the **output directory**: `dist`
5. Add frontend environment variables (`VITE_API_URL`, `VITE_SOCKET_URL`) pointing to your **deployed backend URL** (not localhost)
6. Deploy

### Updating CORS

Once the frontend has a real deployed URL, update the backend's CORS configuration to allow it (instead of only `localhost`) — either by allowing the specific origin explicitly, or reading it from an environment variable so the same code works in both environments without a code change.

---

## Post-Deployment Checklist

- [ ] Backend `/` root route responds (basic health check: `"ERP Backend Running"`)
- [ ] Frontend loads and redirects `/` → `/login`
- [ ] Register + Login work end-to-end against the deployed backend
- [ ] Socket.IO connects successfully (check browser console for connection errors)
- [ ] A notice posted by Faculty/Admin appears in real time for a connected Student
- [ ] AI summarization returns a summary (or gracefully returns `null` without breaking notice creation)
- [ ] MongoDB Atlas Network Access allows the deployed backend's IP
- [ ] All secrets are set via the hosting platform's environment variable dashboard, not committed to the repo

---

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---|---|---|
| `querySrv ECONNREFUSED` | DNS resolution issue with `mongodb+srv://` | Switch DNS to 8.8.8.8 / 8.8.4.4, or use a non-SRV connection string |
| CORS error in browser console | Frontend origin not allowed by backend | Update `cors()` config in `server.js` to include the deployed frontend URL |
| `401 Not authorized, no token` on every request | Frontend `.env` pointing to wrong `VITE_API_URL`, or token not persisting | Check `VITE_API_URL` matches the deployed backend; check `localStorage` for a saved token |
| Socket.IO won't connect | `VITE_SOCKET_URL` missing or incorrect, or backend not passing the HTTP server to Socket.IO correctly | Confirm `.env` has `VITE_SOCKET_URL`; confirm `server.js` uses `http.createServer(app)` before attaching Socket.IO |
| AI summary always `null` | Invalid/missing `OPENROUTER_API_KEY`, or the configured model is no longer free | Check backend terminal logs for the exact OpenRouter error; verify the model slug is still listed as free at openrouter.ai/models |
| `E11000 duplicate key error` | Expected behavior — compound unique index rejected a duplicate (e.g. same student + date) | Not a bug — this is the database enforcing data integrity as designed |