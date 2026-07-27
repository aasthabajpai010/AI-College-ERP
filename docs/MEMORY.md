# MEMORY.md — Project State & Context

## AI-Integrated College ERP System

**Purpose of this file:** Unlike the other planning docs (PRD, Architecture, Rules, Design), this file is meant to be updated as work progresses. It exists so an AI tool or a new contributor picking this project back up doesn't need to re-read the entire codebase to understand what's done, what's in progress, and what decisions have already been made. Update this file at the end of any significant work session.

---

## Current Status: Feature-Complete

All planned core and differentiator features are built, tested, and functioning end-to-end (backend + frontend + real database).

---

## What's Done

### Backend (100%)
- [x] Auth — register, login, JWT issuance, bcrypt hashing
- [x] RBAC middleware — `protect` + `authorizeRoles`, applied to every protected route
- [x] Department module — full CRUD
- [x] Student module — full CRUD + ownership-based `/students/me` endpoint
- [x] Attendance module — mark, history, percentage (aggregation), defaulter list (aggregation)
- [x] Result module — add marks (auto grade calc), history, CGPA (aggregation)
- [x] Dashboard module — admin summary (aggregation), student summary (aggregation)
- [x] Notice module — CRUD, Socket.IO broadcast on create, OpenRouter AI summarization with graceful degradation
- [x] Centralized error-handling middleware
- [x] Database indexing — compound unique indexes (Attendance, Result), single + compound indexes on Student
- [x] Socket.IO server setup with JWT-authenticated handshake, shares HTTP server with Express
- [x] Seed script (`backend/src/seed.js`) for demo data

### Frontend (100%)
- [x] Login page — split-screen, custom illustration, animated
- [x] Register page — same visual treatment as Login
- [x] AuthContext — JWT + user state, persisted to localStorage
- [x] NotificationContext — global Socket.IO connection, unread count, powers Navbar bell
- [x] ThemeContext — dark mode, persisted
- [x] ProtectedRoute — client-side role gate
- [x] DashboardLayout — Sidebar + Navbar + content composition
- [x] Admin Dashboard — stat cards, bar chart (departments), pie chart (grades)
- [x] Faculty Dashboard — quick-action tiles, snapshot stats
- [x] Student Dashboard — attendance/CGPA/subjects stat cards
- [x] Students page — list, create, inline edit, delete (Admin)
- [x] Departments page — list, create, delete (Admin)
- [x] Attendance page — role-conditional (mark form vs. donut chart + history)
- [x] Results page — role-conditional (add-marks form vs. bar chart + subject table)
- [x] Notices page — list, AI summary display, real-time updates, post form
- [x] 404 page
- [x] Global notification bell (Navbar) — unread badge, dropdown, works across all pages
- [x] Dark mode toggle
- [x] Full icon set (lucide-react) across Sidebar, Navbar, page headers
- [x] Skeleton loading states on every data-fetching page
- [x] Hover animations on all cards/buttons

### Documentation
- [x] README.md — with screenshots
- [x] ARCHITECTURE.md — with colorful diagrams (backend flow, frontend flow, schema relationships, RBAC matrix)
- [x] API_DOCUMENTATION.md — every endpoint documented with real request/response examples
- [x] PRD.md, RULES.md, DESIGN.md (this set)
- [x] Postman collection — full coverage including RBAC-failure and duplicate-entry test cases

---

## Known Gaps (Deliberate, Documented)

These are not oversights — they're documented trade-offs, and the honest interview answer for each is already prepared (see the project's interview-prep materials):

1. **No refresh token** — single JWT with 1-day expiry. Refresh token rotation is understood conceptually, deferred for scope.
2. **Ownership check gap** — `GET /students/:id` and similar routes check role but not ownership; only `/students/me` closes this gap for the most sensitive case. A student could technically query another student's ID if they had it.
3. **No pagination** — acceptable at current/demo data scale (single digits to low tens of records). Would need `skip()`/`limit()` before production use with a large student body.
4. **No automated tests** — all testing was manual via Postman, covering success paths, validation failures, and RBAC-403 cases explicitly.
5. **No rate limiting** — login and other endpoints have no request-throttling yet.

---

## Key Technical Decisions Log

| Date/Stage | Decision | Why |
|---|---|---|
| Auth build | Single JWT, no refresh token | Simplicity within timeline; refresh token flow was partially started then deliberately dropped to finish core CRUD modules first |
| DB choice | MongoDB over PostgreSQL | Faster iteration with Mongoose; data is admittedly relational enough that SQL would be equally valid at scale |
| Student ownership | Built `/students/me` as a separate endpoint | Closes the role-vs-ownership RBAC gap for the highest-sensitivity case (a student's own data) without a full refactor of every route |
| AI integration | OpenRouter, with try/catch isolating the AI call from notice creation | A third-party API failure must never block the core save — this graceful-degradation pattern was treated as non-negotiable |
| Styling | Custom navy/maroon academic theme, not a generic blue SaaS template | Differentiates the project visually; ties into "this is a college system," not "this is a generic dashboard" |
| Frontend real-time state | Socket.IO connection lives in `NotificationContext` at the App level, not inside the Notices page | Lets the Navbar bell receive events regardless of which page the user is currently on |

---

## Environment / Setup Notes (things that took debugging effort — don't relearn these)

- **MongoDB Atlas connection (`querySrv ECONNREFUSED`)** — was a DNS resolution issue with the `mongodb+srv://` format on the local network; fixed by switching the machine's DNS to Google DNS (8.8.8.8 / 8.8.4.4).
- **Tailwind v4** uses a CSS-based config (`@theme` block inside `index.css`), not a `tailwind.config.js` file — the old `npx tailwindcss init -p` workflow does not apply.
- **OpenRouter free models rotate** — a previously-working free model can return 404 ("unavailable for free") or 429 (rate-limited) without warning. The summarization utility includes a retry-with-backoff for 429s; if a model starts 404ing, check `openrouter.ai/models` for a current free-tier slug.
- **Express route ordering matters** — any route with a static segment that could collide with a dynamic `:param` (e.g. `/students/me` vs `/students/:id`, `/attendance/defaulters` vs `/attendance/:studentId`) must be declared **before** the dynamic route in the router file, or Express will treat the static segment as a param value.

---

## Next Session Starting Point

If resuming work, the codebase is stable and feature-complete. Reasonable next steps, in priority order if continuing:
1. Add pagination to `GET /students` and `GET /notices` if the demo dataset grows
2. Extend ownership checks to `GET /students/:id`, `GET /results/:studentId`, `GET /attendance/:studentId`
3. Add Jest + Supertest coverage for at least the Auth and RBAC middleware paths
4. Implement refresh token rotation if deploying beyond a portfolio/demo context