# AI-Integrated College ERP System

A full-stack, role-based ERP platform for colleges — built with the MERN stack, Tailwind CSS, Socket.IO, and the OpenRouter AI API. It digitizes core academic workflows (student records, attendance, results, and notices) with dedicated Admin, Faculty, and Student portals, real-time notifications, and AI-powered notice summarization.

![Tech Stack](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)
![Tech Stack](https://img.shields.io/badge/Express.js-000000?style=flat&logo=express&logoColor=white)
![Tech Stack](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)
![Tech Stack](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)
![Tech Stack](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![Tech Stack](https://img.shields.io/badge/Socket.IO-010101?style=flat&logo=socket.io&logoColor=white)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Screenshots](#screenshots)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Overview](#api-overview)
- [Project Structure](#project-structure)
- [Key Design Decisions](#key-design-decisions)
- [Known Limitations](#known-limitations)
- [Future Improvements](#future-improvements)
- [License](#license)

---

## Overview

This project simulates a real college's administrative backbone — the kind of system that manages student enrollment, daily attendance, academic results, and campus-wide announcements. It was built to demonstrate production-style architecture (not just CRUD), including role-based access control, database aggregation pipelines, real-time communication, and third-party AI integration.

Three roles share one platform, each with a distinct, permission-scoped experience:

- **Admin** — full visibility and control: manage departments, students, view college-wide analytics
- **Faculty** — mark attendance, enter results, post notices
- **Student** — view their own attendance, results, and CGPA; receive real-time notices

---

## Features

### Authentication & Security
- JWT-based authentication with bcrypt password hashing
- Role-Based Access Control (RBAC) middleware enforced on every protected route
- Ownership-based endpoints (e.g. a student can only ever fetch *their own* profile, not just any profile their role permits)

### Academic Management
- Department, Student, Attendance, and Result modules with full CRUD
- MongoDB aggregation pipelines for:
  - Attendance percentage calculation
  - Defaulter list generation (students below 75% attendance)
  - CGPA calculation (10-point scale)
  - College-wide dashboard analytics (department-wise counts, grade distribution, average attendance)
- Compound unique indexes preventing duplicate attendance/result entries at the database level

### Real-Time & AI
- Socket.IO-powered live notifications — new notices appear instantly across all connected clients, with a global notification bell (unread badge + dropdown) visible on every page
- AI-generated notice summaries via the OpenRouter API, with graceful degradation if the AI call fails (the notice still saves successfully)

### Frontend Experience
- Role-based dashboards with interactive charts (bar, pie, donut) via Recharts
- Split-screen Login/Register pages with custom illustration
- Dark mode with persisted user preference
- Skeleton loading states, hover animations, and a cohesive navy/maroon academic design system
- Fully responsive layouts

### Engineering Practices
- MVC architecture (Routes → Controllers → Models)
- Centralized Express error-handling middleware
- RESTful API conventions with consistent status codes
- Environment-based configuration (no secrets in source control)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js, Tailwind CSS, React Router, Recharts |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | JWT, bcrypt |
| Real-time | Socket.IO |
| AI | OpenRouter API |
| Icons | lucide-react |
| Build Tool | Vite |

---

## Screenshots

> Add screenshots here before publishing — a login page, one dashboard per role, and the notices page with the AI summary visible all make strong first impressions on a repo's README.

```
/screenshots
  ├── login.png
  ├── admin-dashboard.png
  ├── student-dashboard.png
  └── notices.png
```

---

## Architecture

```
Client (React)
      │
      ▼
Axios instance (JWT auto-attached via interceptor)
      │
      ▼
Express Routes  →  Auth Middleware (protect + authorizeRoles)  →  Controllers
      │                                                              │
      ▼                                                              ▼
Socket.IO (real-time layer, JWT-authenticated)              Mongoose Models
      │                                                              │
      └──────────────────────────┬───────────────────────────────────┘
                                  ▼
                            MongoDB Atlas
```

Socket.IO runs on the same HTTP server as the REST API (`http.createServer(app)`), sharing one port. When a notice is created, it's saved through the normal REST flow **and** broadcast via `io.emit()` — connected clients receive it instantly without polling.

For a fully diagrammed breakdown of both backend and frontend architecture, see [`ARCHITECTURE.md`](./ARCHITECTURE.md).

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB instance)
- An OpenRouter API key ([openrouter.ai](https://openrouter.ai))

### Installation

```bash
# Clone the repository
git clone https://github.com/aasthabajpai010/AI-College-ERP.git
cd AI-College-ERP

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Running Locally

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

The backend runs on `http://localhost:5000`, and the frontend on `http://localhost:5173`.

### Seeding Demo Data (optional)

A seed script is available to populate the database with realistic demo data (students, departments, varied attendance patterns, and results):

```bash
cd backend
node src/seed.js
```

This creates demo login credentials:
```
Admin:    admin@test.com   / 123456
Faculty:  faculty@test.com / 123456
Student:  aarav@test.com   / 123456
```

---

## Environment Variables

**`backend/.env`**
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRY=1d
OPENROUTER_API_KEY=your_openrouter_api_key
```

**`frontend/.env`**
```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

---

## API Overview

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register a new user |
| POST | `/api/auth/login` | Public | Login, returns JWT |
| GET | `/api/students/me` | Student | Get own student profile |
| GET / POST / PUT / DELETE | `/api/students` | Admin (write), Admin+Faculty (read) | Student CRUD |
| GET / POST / PUT / DELETE | `/api/departments` | Admin (write), All (read) | Department CRUD |
| POST | `/api/attendance` | Admin, Faculty | Mark attendance |
| GET | `/api/attendance/:studentId/percentage` | All | Attendance % (aggregation) |
| GET | `/api/attendance/defaulters` | Admin, Faculty | Students below 75% |
| POST | `/api/results` | Admin, Faculty | Add marks (auto-calculates grade) |
| GET | `/api/results/:studentId/cgpa` | All | CGPA (aggregation) |
| GET | `/api/dashboard/admin` | Admin, Faculty | College-wide summary |
| GET | `/api/dashboard/student/:studentId` | All | Student's own summary |
| POST / GET | `/api/notices` | Admin+Faculty (post), All (view) | Notices, with AI summary + Socket.IO broadcast |

A full Postman collection covering all endpoints, including RBAC and validation edge cases, is available in [`/postman`](./postman).

---

## Project Structure

```
AI-College-ERP/
├── backend/
│   ├── src/
│   │   ├── config/          # Database connection
│   │   ├── models/          # Mongoose schemas
│   │   ├── controllers/     # Business logic
│   │   ├── routes/          # Express routes
│   │   ├── middlewares/     # Auth (JWT/RBAC), error handling
│   │   ├── socket/          # Socket.IO setup
│   │   └── utils/           # JWT generation, AI summarization
│   └── server.js
│
├── frontend/
│   └── src/
│       ├── pages/           # Route-level page components
│       ├── components/      # Reusable UI (Navbar, Sidebar, etc.)
│       ├── context/         # Auth, Notification, Theme state
│       ├── services/        # API call functions per resource
│       ├── hooks/           # useSocket, etc.
│       └── routes/          # Route definitions
│
└── postman/
    └── ERP_System.postman_collection.json
```

---

## Key Design Decisions

- **Single JWT (no refresh token)** — chosen deliberately to keep the auth flow simple and fully tested within project scope. The refresh token pattern is understood and would be the next security enhancement for a production deployment.
- **MongoDB over a relational database** — chosen for development speed with Mongoose; the data is admittedly fairly relational (Student–Department–Attendance–Result), so a SQL database would be an equally reasonable choice at larger scale.
- **Aggregation pipelines over application-side computation** — attendance percentage, CGPA, and dashboard stats are computed inside MongoDB rather than pulling raw records into Node.js, reducing data transferred over the network.
- **Ownership checks beyond role checks** — `/students/me` resolves the student's own profile from their JWT rather than trusting any ID passed in the URL, closing a common RBAC gap where role-only checks allow accessing another user's data.

---

## Known Limitations

- No automated test suite (testing was done manually via Postman, covering success paths, validation failures, and RBAC enforcement)
- No pagination on list endpoints — acceptable at current scale, would need addressing before large datasets
- Rate limiting is not yet implemented on the API

---

## Future Improvements

- [ ] Refresh token rotation for improved session security
- [ ] Automated testing with Jest + Supertest
- [ ] Pagination and search on the Students list
- [ ] Rate limiting on authentication endpoints
- [ ] Ownership-ID ambiguity fix on shared role-based routes

---

## License

This project was built for educational and portfolio purposes.