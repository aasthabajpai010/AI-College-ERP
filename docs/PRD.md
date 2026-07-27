# PRD.md — Project Requirements Document

## AI-Integrated College ERP System

---

## 1. What We're Building

A full-stack, role-based ERP (Enterprise Resource Planning) platform for a college, digitizing core academic operations: student records, daily attendance, academic results, and campus-wide announcements. The system replaces manual/paper-based or spreadsheet-based college administration with a single, secure, real-time web application.

This is not a generic CRUD demo — it's built to mirror how a production academic management system is actually architected: role-based access control, database-level data integrity, aggregated analytics, real-time communication, and third-party AI integration.

---

## 2. Who This Is For (Target Users)

Three distinct user roles share one platform, each with a permission-scoped experience:

| Role | Who They Are | What They Need |
|---|---|---|
| **Admin** | College administrative staff | Full control: manage departments and student records, view college-wide analytics, oversee all data |
| **Faculty** | Teaching staff | Mark daily attendance, enter subject-wise marks, post notices to students |
| **Student** | Enrolled students | View their own attendance %, results/CGPA, and receive real-time notices — read-only access to their own data |

---

## 3. Core Problem This Solves

Colleges commonly manage attendance and results through disconnected spreadsheets, physical registers, or fragmented tools — leading to:
- No single source of truth for a student's academic standing
- Manual, error-prone percentage/CGPA calculations
- Delayed communication (notices posted on physical boards, missed by students)
- No access control — anyone with the spreadsheet can edit anything

This system centralizes all of that behind proper authentication, role permissions, and automated calculation — with instant notice delivery instead of static postings.

---

## 4. Features the Project Should Have

### 4.1 Must-Have (Core Scope)

- **Authentication** — secure registration and login (JWT-based)
- **Role-Based Access Control** — Admin / Faculty / Student, enforced on every protected action
- **Department Management** — create, view, update, delete departments
- **Student Management** — create, view, update, delete student profiles; a student can view their own profile via an ownership-verified endpoint
- **Attendance** — Faculty/Admin mark daily attendance; automatic percentage calculation; a defaulter list (students below 75%)
- **Results** — Faculty/Admin enter marks; automatic grade calculation; automatic CGPA calculation
- **Dashboards** — role-specific summary views with visual charts (college-wide for Admin/Faculty, personal for Student)
- **Notices** — Faculty/Admin post announcements; all roles can view them

### 4.2 Should-Have (Differentiators)

- **Real-time notifications** — new notices appear instantly for connected users without a page refresh (Socket.IO)
- **AI-powered notice summarization** — long notices get an automatically generated short summary (OpenRouter API)
- **Dark mode** — persisted user preference
- **Polished, cohesive UI** — not just functional, but presentable — consistent design system, charts, icons, loading states

### 4.3 Explicitly Out of Scope

- Fee/payment management
- Library management
- Multi-language support
- Refresh token rotation (single JWT accepted as a scope trade-off)
- Automated test suite (manual Postman-based testing used instead)
- Pagination (acceptable at current/demo data scale)

---

## 5. Success Criteria

The project is considered complete when:
1. All three roles can register, log in, and reach a role-appropriate dashboard
2. Every core CRUD module (Department, Student, Attendance, Result, Notice) works end-to-end, frontend to backend to database
3. RBAC is verifiably enforced — a lower-permission role attempting a restricted action receives a `403`, not a silent failure
4. Attendance percentage, defaulter list, and CGPA are computed correctly via database aggregation, not application-side loops
5. A notice posted by Faculty/Admin appears live for a connected Student without any manual refresh
6. The AI summarizer produces a usable summary, and gracefully does nothing (rather than erroring) if the API call fails
7. The application is visually cohesive and presentable — suitable to demo live in a placement interview

---

## 6. Constraints

- **Timeline:** Built as an individual academic/portfolio project — scope was deliberately kept achievable rather than exhaustive
- **Team size:** Solo developer
- **Budget:** Free-tier services only (MongoDB Atlas free tier, OpenRouter free-tier models)

---

## 7. Key Stakeholder Decisions

| Decision | Reasoning |
|---|---|
| Single JWT, no refresh token | Simpler auth flow, fully testable within scope; refresh token pattern understood but deferred |
| MongoDB over SQL | Faster iteration with Mongoose; data is admittedly relational enough that SQL would be equally valid |
| Manual testing over automated tests | Time trade-off; every endpoint was tested for success, validation-failure, and RBAC-failure paths via Postman |