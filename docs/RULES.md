# RULES.md — AI Development Boundaries

## AI-Integrated College ERP System

This document defines the constraints followed while building this project with AI assistance — what tools/libraries to default to, what to avoid, and how the AI should behave when uncertain or when errors occur. Written retrospectively to capture the rules that were actually followed throughout development.

---

## 1. Tech Stack Boundaries (Use These, Not Alternatives)

| Layer | Use | Do NOT substitute with |
|---|---|---|
| Backend framework | Express.js | Fastify, Koa, NestJS |
| Database | MongoDB + Mongoose | PostgreSQL, MySQL, Prisma |
| Auth | JWT (jsonwebtoken) + bcryptjs | Passport.js, Auth0, Firebase Auth |
| Frontend framework | React (functional components + hooks) | Vue, Angular, Svelte |
| Styling | Tailwind CSS (v4, CSS-based config) | Bootstrap, Material UI, styled-components |
| Routing | React Router | Next.js routing, Wouter |
| State management | React Context API | Redux, Zustand, Recoil |
| HTTP client | Axios (single shared instance) | fetch() called directly in components |
| Real-time | Socket.IO | raw WebSockets, Server-Sent Events, Pusher |
| Charts | Recharts | Chart.js, D3 directly, Victory |
| Icons | lucide-react | Font Awesome, Material Icons, emoji-only |
| AI provider | OpenRouter API | Direct OpenAI API, Anthropic API directly |
| Build tool | Vite | Create React App, Webpack config from scratch |

**Reasoning:** Consistency was prioritized over exploring alternatives — once a library was chosen early (e.g., Tailwind, Axios), every subsequent feature reused the same pattern rather than mixing approaches.

---

## 2. Architectural Rules

- **Backend must follow MVC** — Routes contain no logic, only map URLs to controllers. Controllers contain business logic and call Models. Models are Mongoose schemas only.
- **Frontend must follow a service-layer pattern** — Page components never call `axios` or `api` directly. Every API call goes through a dedicated `services/*.js` file, one file per backend resource.
- **Authentication middleware order is fixed** — `protect` must always run before `authorizeRoles` in any route chain, since the latter depends on `req.user` being set by the former.
- **Ownership checks are required for self-access endpoints** — any "get my own data" endpoint (e.g. `/students/me`) must resolve identity from the verified JWT (`req.user.id`), never from a client-supplied ID.
- **All list-returning endpoints requiring joined data must use Mongoose `populate()`** — never manually issue a second query to fetch referenced documents.
- **Aggregation over application-side computation** — any calculation that can be expressed as a MongoDB aggregation pipeline (percentages, sums, averages, counts) must be done in the database layer, not by pulling raw documents into Node.js and looping.

---

## 3. Error Handling Rules

- All backend errors must funnel through the centralized Express error-handling middleware — no ad-hoc `res.status(500)` blocks scattered without a consistent shape.
- Every error response must follow `{ success: false, message: "..." }` — no raw stack traces or driver-level errors returned to the client.
- Third-party API failures (specifically the OpenRouter AI call) must **never** block the primary operation. If AI summarization fails, the notice must still save successfully with `summary: null`. This graceful-degradation rule is non-negotiable for any external API integration added to this project.
- Duplicate-prevention must be enforced at the database level (compound unique indexes), not only checked in application code — application-level checks are a UX nicety, not the actual guarantee.

---

## 4. What the AI Should NOT Do

- **Do not silently swap a chosen library for "a better one"** without being asked — e.g., don't replace Axios with fetch, or Context API with Redux, mid-project.
- **Do not add authentication patterns not already in use** — e.g., don't introduce cookie-based sessions or OAuth flows when the project standard is header-based JWT.
- **Do not fabricate response field names** — when unsure of an actual API response shape, say so explicitly and ask for the real response (via Postman/console) rather than guessing and writing frontend code against an assumed shape.
- **Do not skip explaining *why*** — every non-trivial code block should include a comment explaining the reasoning, not just what the code does, since this project is also a learning artifact for interview preparation.
- **Do not treat a working feature as "done" without a test path** — every new endpoint or page must have an explicit manual test step (Postman request or browser action) before being considered complete.
- **Do not claim the project is more complete than it is** — if a feature is planned but not yet built, it must be described as such, not written up as already functioning.

---

## 5. How the AI Should Handle Errors and Ambiguity

- **When a bug is reported, ask for the exact error message/stack trace first** (browser console, terminal output) rather than guessing at the cause from a description alone.
- **When multiple files could be responsible for an error, narrow it down systematically** — check the most specific error location first (e.g., a Vite parse error naming an exact file and line) before broadly re-examining unrelated files.
- **When a design or scope decision is ambiguous, default to the simpler option** and state the trade-off, rather than silently picking the more complex path (e.g., defaulting to a single JWT over refresh-token rotation, and explaining why).
- **When the user's instruction conflicts with an established rule in this document, flag the conflict** rather than quietly overriding either the new instruction or the existing standard.

---

## 6. Security Non-Negotiables

- Passwords are never stored, logged, or returned in any API response — only their bcrypt hash exists in the database.
- Secrets (`JWT_SECRET`, `MONGO_URI`, `OPENROUTER_API_KEY`) live only in `.env` files, which are git-ignored. They are never hardcoded, even temporarily "for testing."
- Every protected route must have both authentication (`protect`) and authorization (`authorizeRoles`) — a route is never left "protected but open to any role" unless that is the explicit, documented intent (e.g., `GET /departments`, viewable by all authenticated roles).