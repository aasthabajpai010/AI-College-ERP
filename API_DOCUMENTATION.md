# API Documentation

## AI-Integrated College ERP System

Complete reference for every REST endpoint exposed by the backend, including request/response shapes, authentication requirements, role permissions, and error responses.

---

## Table of Contents

- [Base URL](#base-url)
- [Authentication](#authentication)
- [Response Format](#response-format)
- [Error Handling](#error-handling)
- [Endpoints](#endpoints)
  - [Auth](#1-auth)
  - [Departments](#2-departments)
  - [Students](#3-students)
  - [Attendance](#4-attendance)
  - [Results](#5-results)
  - [Dashboard](#6-dashboard)
  - [Notices](#7-notices)
- [Real-Time Events (Socket.IO)](#real-time-events-socketio)
- [Status Code Reference](#status-code-reference)
- [Postman Collection](#postman-collection)

---

## Base URL

```
http://localhost:5000/api
```

In production, replace with your deployed backend URL.

---

## Authentication

All endpoints except `POST /auth/register` and `POST /auth/login` require a JSON Web Token, sent as a Bearer token in the `Authorization` header:

```
Authorization: Bearer <token>
```

The token is obtained from the `/auth/login` response and encodes the user's `id` and `role`. It is verified on every protected request by the `protect` middleware, which populates `req.user` for downstream use.

**Token expiry:** 1 day (configurable via `JWT_EXPIRY` in `.env`). Expired or missing tokens return `401 Unauthorized`.

### Role-Based Access Control

Every protected route additionally checks the caller's role via `authorizeRoles(...)`. If the role isn't permitted for that action, the API returns `403 Forbidden` — this is distinct from `401`, which means "not authenticated at all."

| Role | Description |
|---|---|
| `admin` | Full access — manages departments, students, views all analytics |
| `faculty` | Marks attendance, enters results, posts notices |
| `student` | Views only their own attendance, results, and notices |

---

## Response Format

All responses are JSON. Successful responses follow this shape:

```json
{
  "success": true,
  "...": "resource-specific data"
}
```

Error responses follow this shape:

```json
{
  "success": false,
  "message": "Human-readable error description"
}
```

---

## Error Handling

All errors are caught by a centralized Express error-handling middleware, ensuring consistent formatting across every endpoint. Common error scenarios:

| Scenario | Status | Example Message |
|---|---|---|
| Missing/invalid token | 401 | `"Not authorized, no token"` |
| Expired/malformed token | 401 | `"Not authorized, token invalid or expired"` |
| Valid token, wrong role | 403 | `"Access denied, insufficient permissions"` |
| Resource not found | 404 | `"Student not found"` |
| Duplicate entry | 400 | `"Student with this roll number already exists"` |
| Validation/server error | 500 | `"Internal server error"` |

---

## Endpoints

### 1. Auth

#### Register a new user

```
POST /auth/register
```

**Access:** Public

**Request Body:**
```json
{
  "name": "Admin User",
  "email": "admin@test.com",
  "password": "123456",
  "role": "admin"
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | string | Yes | |
| `email` | string | Yes | Must be unique |
| `password` | string | Yes | Hashed with bcrypt before storage |
| `role` | string | Yes | One of `admin`, `faculty`, `student` |

**Success Response — `201 Created`:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "6a4cd262c3f8937acea0b749",
    "name": "Admin User",
    "email": "admin@test.com",
    "role": "admin"
  }
}
```

**Error Responses:**
| Status | Condition |
|---|---|
| 400 | `"User already exists"` — email already registered |

---

#### Login

```
POST /auth/login
```

**Access:** Public

**Request Body:**
```json
{
  "email": "admin@test.com",
  "password": "123456"
}
```

**Success Response — `200 OK`:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "6a4cd262c3f8937acea0b749",
    "name": "Admin User",
    "email": "admin@test.com",
    "role": "admin"
  }
}
```

**Error Responses:**
| Status | Condition |
|---|---|
| 400 | `"Invalid credentials"` — wrong email or password |

---

### 2. Departments

#### Create a department

```
POST /departments
```

**Access:** `admin`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "Computer Science",
  "code": "CSE"
}
```

**Success Response — `201 Created`:**
```json
{
  "success": true,
  "department": {
    "_id": "6a4cd79bd683720ad25c4bf3",
    "name": "Computer Science",
    "code": "CSE",
    "createdAt": "2026-07-06T14:49:49.203Z"
  }
}
```

**Error Responses:**
| Status | Condition |
|---|---|
| 400 | `"Department already exists"` |
| 403 | Caller is not `admin` |

---

#### Get all departments

```
GET /departments
```

**Access:** `admin`, `faculty`, `student`

**Success Response — `200 OK`:**
```json
{
  "success": true,
  "departments": [
    { "_id": "6a4cd79bd683720ad25c4bf3", "name": "Computer Science", "code": "CSE" }
  ]
}
```

---

#### Update a department

```
PUT /departments/:id
```

**Access:** `admin`

**Request Body:** any subset of `{ "name": "...", "code": "..." }`

**Success Response — `200 OK`:**
```json
{
  "success": true,
  "department": { "_id": "...", "name": "Computer Science & Engineering", "code": "CSE" }
}
```

**Error Responses:**
| Status | Condition |
|---|---|
| 404 | `"Department not found"` |
| 403 | Caller is not `admin` |

---

#### Delete a department

```
DELETE /departments/:id
```

**Access:** `admin`

**Success Response — `200 OK`:**
```json
{ "success": true, "message": "Department deleted successfully" }
```

---

### 3. Students

#### Get my own student profile

```
GET /students/me
```

**Access:** `student` (own profile only)

This is an **ownership-based** endpoint — it resolves the caller's Student document from their JWT (`req.user.id`), not from any ID passed in the request. A student can never use this route to view anyone else's profile.

**Success Response — `200 OK`:**
```json
{
  "success": true,
  "student": {
    "_id": "6a4f1bfe43970d9cd9a050f4",
    "user": { "_id": "...", "name": "Test Student", "email": "student@test.com", "role": "student" },
    "department": { "_id": "...", "name": "Computer Science", "code": "CSE" },
    "rollNumber": "CS2024091",
    "semester": 3,
    "section": "A",
    "phone": "9999999999",
    "address": "Test Address"
  }
}
```

**Error Responses:**
| Status | Condition |
|---|---|
| 404 | No Student profile linked to this account |
| 403 | Caller is not `student` |

---

#### Create a student profile

```
POST /students
```

**Access:** `admin`

**Request Body:**
```json
{
  "user": "6a4bc08d5da2601a8a237676",
  "department": "6a4cd79bd683720ad25c4bf3",
  "rollNumber": "CS2024001",
  "semester": 3,
  "section": "A",
  "phone": "9999999999",
  "address": "Test Address"
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `user` | ObjectId | Yes | Must reference an existing User |
| `department` | ObjectId | Yes | Must reference an existing Department |
| `rollNumber` | string | Yes | Must be unique |
| `semester` | number | Yes | 1–8 |
| `section` | string | Yes | |
| `phone` | string | No | |
| `address` | string | No | |

**Success Response — `201 Created`:**
```json
{
  "success": true,
  "student": {
    "_id": "6a4f1bfe43970d9cd9a050f4",
    "user": "6a4bc08d5da2601a8a237676",
    "department": "6a4cd79bd683720ad25c4bf3",
    "rollNumber": "CS2024001",
    "semester": 3,
    "section": "A"
  }
}
```

**Error Responses:**
| Status | Condition |
|---|---|
| 400 | `"Student with this roll number already exists"` |
| 403 | Caller is not `admin` |

---

#### Get all students

```
GET /students
```

**Access:** `admin`, `faculty`

Returns every student profile, with `user` and `department` populated.

**Success Response — `200 OK`:**
```json
{
  "success": true,
  "students": [
    {
      "_id": "6a4f1bfe43970d9cd9a050f4",
      "user": { "name": "Test Student", "email": "student@test.com", "role": "student" },
      "department": { "name": "Computer Science", "code": "CSE" },
      "rollNumber": "CS2024091",
      "semester": 3,
      "section": "A"
    }
  ]
}
```

---

#### Get a student by ID

```
GET /students/:id
```

**Access:** `admin`, `faculty`, `student`

> **Note:** This route checks role, not ownership — any authenticated student can technically fetch any student's profile by ID if they have it. See [Known Limitations](../README.md#known-limitations).

**Success Response — `200 OK`:** same shape as a single object from `GET /students`.

**Error Responses:**
| Status | Condition |
|---|---|
| 404 | `"Student not found"` |

---

#### Update a student

```
PUT /students/:id
```

**Access:** `admin`

**Request Body:** any subset of `{ "semester", "section", "phone", "address" }`

**Success Response — `200 OK`:**
```json
{ "success": true, "student": { "...": "updated fields" } }
```

---

#### Delete a student

```
DELETE /students/:id
```

**Access:** `admin`

**Success Response — `200 OK`:**
```json
{ "success": true, "message": "Student deleted successfully" }
```

---

### 4. Attendance

#### Mark attendance

```
POST /attendance
```

**Access:** `admin`, `faculty`

**Request Body:**
```json
{
  "student": "6a4f1bfe43970d9cd9a050f4",
  "date": "2026-07-01",
  "status": "present"
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `student` | ObjectId | Yes | References a Student document |
| `date` | date string | Yes | |
| `status` | string | Yes | `present` or `absent` |

The authenticated caller's ID is automatically recorded as `markedBy`.

**Success Response — `201 Created`:**
```json
{
  "success": true,
  "attendance": {
    "_id": "6a4ce48d683720ad25c4bf4",
    "student": "6a4f1bfe43970d9cd9a050f4",
    "date": "2026-08-01T00:00:00.000Z",
    "status": "present",
    "markedBy": "6a4cd262c3f8937acea0b749"
  }
}
```

**Error Responses:**
| Status | Condition |
|---|---|
| 400 | `"Attendance already marked for this date"` — enforced by a compound unique index on `(student, date)` |
| 403 | Caller is not `admin`/`faculty` |

---

#### Get a student's attendance history

```
GET /attendance/:studentId
```

**Access:** `admin`, `faculty`, `student`

**Success Response — `200 OK`:**
```json
{
  "success": true,
  "attendance": [
    { "_id": "...", "date": "2026-07-09T00:00:00.000Z", "status": "present" },
    { "_id": "...", "date": "2026-07-08T00:00:00.000Z", "status": "present" },
    { "_id": "...", "date": "2026-07-07T00:00:00.000Z", "status": "absent" }
  ]
}
```

---

#### Get attendance percentage

```
GET /attendance/:studentId/percentage
```

**Access:** `admin`, `faculty`, `student`

Computed via a MongoDB aggregation pipeline: `$match` on student, `$group` to count total and present records, then `(present / total) * 100`.

**Success Response — `200 OK`:**
```json
{
  "success": true,
  "totalClasses": 10,
  "present": 5,
  "percentage": 50
}
```

If the student has zero attendance records, this returns `{ "totalClasses": 0, "present": 0, "percentage": 0 }` rather than erroring.

---

#### Get the defaulter list

```
GET /attendance/defaulters
```

**Access:** `admin`, `faculty`

Returns every student whose attendance percentage is below 75%, computed via aggregation across all students (`$group` by student, then `$match` on the computed percentage).

**Success Response — `200 OK`:**
```json
{
  "success": true,
  "defaulters": [
    { "_id": "6a4f1bfe43970d9cd9a050f4", "rollNumber": "CS2024091", "percentage": 50 }
  ]
}
```

---

### 5. Results

#### Add a result

```
POST /results
```

**Access:** `admin`, `faculty`

**Request Body:**
```json
{
  "student": "6a4f1bfe43970d9cd9a050f4",
  "subject": "Data Structures",
  "semester": 3,
  "marksObtained": 85,
  "maxMarks": 100
}
```

Grade is calculated automatically server-side from the percentage — it is never accepted as user input:

| Percentage | Grade |
|---|---|
| ≥ 90 | A+ |
| ≥ 80 | A |
| ≥ 70 | B |
| ≥ 60 | C |
| ≥ 50 | D |
| < 50 | F |

**Success Response — `201 Created`:**
```json
{
  "success": true,
  "result": {
    "_id": "6a4f1cce43970d9cd9a050f5",
    "student": "6a4f1bfe43970d9cd9a050f4",
    "subject": "Data Structures",
    "semester": 3,
    "marksObtained": 85,
    "maxMarks": 100,
    "grade": "A",
    "enteredBy": "6a4cd262c3f8937acea0b749"
  }
}
```

**Error Responses:**
| Status | Condition |
|---|---|
| 400 | `"Result already exists for this subject and semester"` — enforced by a compound unique index on `(student, subject, semester)` |

---

#### Get a student's results

```
GET /results/:studentId
```

**Access:** `admin`, `faculty`, `student`

**Success Response — `200 OK`:**
```json
{
  "success": true,
  "results": [
    { "_id": "...", "subject": "Data Structures", "marksObtained": 85, "maxMarks": 100, "grade": "A" },
    { "_id": "...", "subject": "Operating Systems", "marksObtained": 70, "maxMarks": 100, "grade": "B" }
  ]
}
```

---

#### Get CGPA

```
GET /results/:studentId/cgpa
```

**Access:** `admin`, `faculty`, `student`

Computed via aggregation: average percentage across all results, converted to a 10-point scale using `percentage / 9.5` (standard Indian grading approximation).

**Success Response — `200 OK`:**
```json
{
  "success": true,
  "averagePercentage": 77.5,
  "cgpa": 8.16,
  "totalSubjects": 2
}
```

---

### 6. Dashboard

#### Admin dashboard summary

```
GET /dashboard/admin
```

**Access:** `admin`, `faculty`

Returns a college-wide analytics snapshot via multiple aggregation pipelines run in parallel.

**Success Response — `200 OK`:**
```json
{
  "success": true,
  "totalStudents": 2,
  "totalDepartments": 1,
  "averageAttendancePercentage": 75,
  "departmentWiseCount": [
    { "departmentName": "Computer Science", "count": 2 }
  ],
  "gradeDistribution": [
    { "grade": "A", "count": 1 },
    { "grade": "B", "count": 1 }
  ]
}
```

---

#### Student dashboard summary

```
GET /dashboard/student/:studentId
```

**Access:** `admin`, `faculty`, `student`

**Success Response — `200 OK`:**
```json
{
  "success": true,
  "attendancePercentage": 50,
  "cgpa": 8.16,
  "totalSubjects": 2
}
```

---

### 7. Notices

#### Create a notice

```
POST /notices
```

**Access:** `admin`, `faculty`

**Request Body:**
```json
{
  "title": "Exam Schedule Released",
  "content": "The semester end examinations will begin on August 15th, 2026. All students must collect their admit cards from the examination office by August 10th.",
  "department": "6a4cd79bd683720ad25c4bf3"
}
```

`department` is optional — omit it to broadcast to everyone.

This endpoint does three things in sequence:
1. Saves the notice to MongoDB
2. Emits a `newNotice` Socket.IO event to all connected clients (see [Real-Time Events](#real-time-events-socketio))
3. Calls the OpenRouter API to generate a short AI summary, saved into the `summary` field

If the AI call fails (rate limit, network error, etc.), the notice still saves successfully with `summary: null` — AI summarization degrades gracefully and never blocks notice creation.

**Success Response — `201 Created`:**
```json
{
  "success": true,
  "notice": {
    "_id": "6a51cb25a987e70e8e9b4609",
    "title": "Exam Schedule Released",
    "content": "The semester end examinations will begin on August 15th, 2026...",
    "summary": "Exams start Aug 15, 2026. Admit cards must be collected by Aug 10.",
    "postedBy": "6a4cd262c3f8937acea0b749",
    "department": null,
    "createdAt": "2026-07-11T04:48:37.137Z"
  }
}
```

---

#### Get all notices

```
GET /notices
```

**Access:** `admin`, `faculty`, `student`

Returns every notice, newest first, with `postedBy` populated.

**Success Response — `200 OK`:**
```json
{
  "success": true,
  "notices": [
    {
      "_id": "...",
      "title": "Exam Schedule Released",
      "content": "...",
      "summary": "...",
      "postedBy": { "name": "Admin User", "role": "admin" },
      "createdAt": "2026-07-11T04:48:37.137Z"
    }
  ]
}
```

---

## Real-Time Events (Socket.IO)

The backend runs Socket.IO on the same HTTP server as the REST API. Clients connect and authenticate using the same JWT issued at login.

### Connecting

```javascript
import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
  auth: { token: "<jwt-token>" },
});
```

The server's `io.use()` middleware verifies this token identically to the REST `protect` middleware — an invalid or missing token rejects the connection before it's established.

### Events

| Event | Direction | Payload | Description |
|---|---|---|---|
| `newNotice` | Server → Client | Full notice object (see [Create a notice](#create-a-notice)) | Emitted immediately after a notice is successfully created. Broadcast to all connected clients. |

### Example Listener

```javascript
socket.on("newNotice", (notice) => {
  console.log("New notice received:", notice.title);
  // update UI state, show a badge, etc.
});
```

---

## Status Code Reference

| Code | Meaning | Used When |
|---|---|---|
| `200` | OK | Successful GET, PUT, DELETE |
| `201` | Created | Successful POST that creates a new resource |
| `400` | Bad Request | Validation failure, duplicate entry |
| `401` | Unauthorized | Missing or invalid JWT — not authenticated |
| `403` | Forbidden | Valid JWT, but role lacks permission — not authorized |
| `404` | Not Found | Requested resource doesn't exist |
| `500` | Internal Server Error | Unexpected server-side failure |

---

## Postman Collection

A complete, ready-to-import Postman collection covering every endpoint above — including RBAC checks (expected 403s) and duplicate-entry checks (expected 400s) — is available at [`/postman/ERP_System.postman_collection.json`](./postman/ERP_System.postman_collection.json).

The collection uses collection variables (`baseUrl`, `adminToken`, `studentToken`, `departmentId`, `studentId`) with auto-save scripts on Login/Create requests, so tokens and IDs populate automatically as you work through the requests in order — no manual copy-pasting required.