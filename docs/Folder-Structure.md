# Folder Structure Documentation

## AI-Integrated College ERP System

Complete breakdown of every folder and file in the project, what it's for, and why it's organized this way.

---

## Top-Level Structure

```
AI-College-ERP/
├── backend/                  # Express API server
├── frontend/                 # React client application
├── postman/                  # API testing collection
├── docs/                     # All documentation (this folder)
├── README.md
├── ARCHITECTURE.md
├── API_DOCUMENTATION.md
├── PRD.md
├── RULES.md
├── DESIGN.md
├── MEMORY.md
└── .gitignore
```

Backend and frontend are kept as fully separate projects (each with its own `package.json`, `node_modules`, and `.env`) within one Git repository — they deploy independently but are versioned together.

---

## Backend (`backend/`)

```
backend/
├── src/
│   ├── config/
│   │   └── db.js                      # MongoDB connection setup
│   │
│   ├── models/
│   │   ├── user.model.js              # User schema + password hashing hook
│   │   ├── department.model.js
│   │   ├── student.model.js           # + department/semester indexes
│   │   ├── attendance.model.js        # + compound unique index
│   │   ├── result.model.js            # + compound unique index
│   │   └── notice.model.js
│   │
│   ├── controllers/
│   │   ├── auth.controller.js         # register, login
│   │   ├── department.controller.js
│   │   ├── student.controller.js      # includes getMyStudentProfile (ownership endpoint)
│   │   ├── attendance.controller.js   # includes aggregation pipelines
│   │   ├── result.controller.js       # includes grade calculation + CGPA aggregation
│   │   ├── dashboard.controller.js    # aggregation queries per role
│   │   └── notice.controller.js       # Socket.IO emit + AI summarization call
│   │
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── department.routes.js
│   │   ├── student.routes.js          # /me route defined BEFORE /:id
│   │   ├── attendance.routes.js       # /defaulters defined BEFORE /:studentId
│   │   ├── result.routes.js
│   │   ├── dashboard.routes.js
│   │   └── notice.routes.js
│   │
│   ├── middlewares/
│   │   ├── auth.middleware.js         # protect() + authorizeRoles()
│   │   └── error.middleware.js        # centralized error handler
│   │
│   ├── utils/
│   │   ├── generateToken.js           # JWT signing helper
│   │   └── summarizeNotice.js         # OpenRouter API call, isolated for reuse/testing
│   │
│   ├── socket/
│   │   └── socket.js                  # Socket.IO server + JWT auth middleware
│   │
│   └── seed.js                        # Demo data population script
│
├── .env                                # Not committed — see .env.example
├── .env.example
├── server.js                           # Entry point
└── package.json
```

**Why this structure:** Follows MVC strictly — `routes/` only maps URLs to functions, `controllers/` hold all business logic, `models/` are pure Mongoose schemas. `middlewares/`, `utils/`, and `socket/` are cross-cutting concerns kept separate from any single feature, since auth, error handling, and real-time all apply across every module rather than belonging to one.

---

## Frontend (`frontend/`)

```
frontend/
├── src/
│   ├── pages/                         # One file per full route/screen
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── AdminDashboard.jsx
│   │   ├── FacultyDashboard.jsx
│   │   ├── StudentDashboard.jsx
│   │   ├── Students.jsx
│   │   ├── Departments.jsx
│   │   ├── Attendance.jsx             # role-conditional rendering
│   │   ├── Results.jsx                # role-conditional rendering
│   │   ├── Notices.jsx
│   │   └── NotFound.jsx
│   │
│   ├── components/                    # Reusable pieces, never full pages
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   ├── DashboardLayout.jsx        # composes Sidebar + Navbar + page content
│   │   └── ProtectedRoute.jsx         # client-side role gate
│   │
│   ├── context/                       # Global state via React Context
│   │   ├── AuthContext.jsx
│   │   ├── NotificationContext.jsx    # owns the Socket.IO connection
│   │   └── ThemeContext.jsx           # dark mode
│   │
│   ├── services/                      # One file per backend resource
│   │   ├── api.js                     # shared axios instance, JWT interceptor
│   │   ├── authService.js
│   │   ├── studentService.js
│   │   ├── departmentService.js
│   │   ├── attendanceService.js
│   │   ├── resultService.js
│   │   ├── noticeService.js
│   │   └── dashboardService.js
│   │
│   ├── hooks/
│   │   └── useSocket.js               # Socket.IO connection hook
│   │
│   ├── routes/
│   │   └── AppRoutes.jsx              # All route definitions
│   │
│   ├── assets/
│   │   └── campus_illustration.svg
│   │
│   ├── App.jsx                        # Provider composition root
│   ├── main.jsx                       # Vite entry point
│   └── index.css                      # Tailwind v4 theme tokens, dark mode, animations
│
├── .env                                # Not committed — see .env.example
├── .env.example
├── index.html
└── package.json
```

**Why this structure:** Pages never call the API directly — they go through `services/`, which is the frontend's equivalent of the backend's controller layer. `context/` holds anything that needs to be read by components anywhere in the tree without prop drilling. `hooks/` isolates reusable stateful logic (currently just the socket connection) from any single component.

---

## Documentation (`docs/`)

```
docs/
├── architecture.md          # High-level system architecture (also mirrored as ARCHITECTURE.md at root)
├── database.md              # Schemas, relationships, keys, ER diagram
├── deployment.md            # Setup and deploy instructions
├── folder-structure.md      # This file
├── er-diagram.png
├── sequence-diagram.png
├── screenshots/
│   ├── login.png
│   ├── register.png
│   ├── admin-dashboard.png
│   ├── faculty-dashboard.png
│   ├── student-attendance-chart.png
│   └── notices.png
└── images/
    ├── backend_flow.png
    ├── frontend_flow.png
    ├── schema_relationships.png
    └── rbac_matrix.png
```

---

## Postman (`postman/`)

```
postman/
└── ERP_System.postman_collection.json
```

A single importable collection covering every endpoint across all 7 modules, with collection variables (`baseUrl`, `adminToken`, `studentToken`, `departmentId`, `studentId`) and auto-save scripts on Login/Create requests — tokens and IDs populate automatically as requests are run in order.

---

## Naming Conventions Used Throughout

| Convention | Example |
|---|---|
| React components | PascalCase — `StudentDashboard.jsx` |
| Service/utility files | camelCase — `studentService.js`, `generateToken.js` |
| Backend files | `<name>.<layer>.js` — `student.controller.js`, `auth.routes.js` |
| Mongoose models | Singular, PascalCase export — `mongoose.model("Student", ...)` |
| MongoDB collections | Auto-pluralized, lowercase by Mongoose — `students`, `departments` |
| Environment variables | SCREAMING_SNAKE_CASE — `JWT_SECRET`, `MONGO_URI` |
| CSS custom properties | kebab-case — `--color-role-admin` |