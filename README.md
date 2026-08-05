# DevLog

DevLog is a self-hosted developer activity tracker that logs time sessions against projects, DSA problems, articles, and snippets — then turns that raw activity into streaks, statistics, charts, and daily reports.

![Screenshot of the DevLog dashboard](link-to-screenshot.png)

🔗 **Live Demo:** [https://devlog.example.com](https://devlog.example.com) | 📹 **Video Walkthrough:** [https://www.youtube.com/watch?v=...](https://www.youtube.com/watch?v=...)

## Features

- **Live session timer** — start/stop coding sessions with an inline todo checklist, link sessions to projects, DSA problems, or articles, and keep your tracked time even if the network drops mid-session (state is only cleared after the session is saved)
- **Dashboard & streaks** — weekly time-by-session-type charts, current streaks, total sessions, and session frequency over time
- **Project analytics** — time logged, tasks completed, and 14-day session frequency per project, plus breakdowns by status and category
- **DSA problem tracker** — solved-problem log with difficulty, pattern, and confidence-level breakdowns
- **Reading list** — article backlog with Unread/Reading/Read statuses and statistics
- **Snippet library** — organized code snippets by language and category
- **Daily reports** — background-generated daily summaries via BullMQ + Redis
- **Auth** — email/password (JWT) plus Google OAuth
- **Developer quality** — paginated APIs, request rate limiting, helmet security headers, timezone-aware statistics, and a fully responsive dark-mode UI

## Tech Stack

**Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, TanStack Query, React Router, React Hook Form + Zod, Recharts, shadcn/ui
**Backend:** Node.js, NestJS (REST), Mongoose, Passport (JWT + Google OAuth), BullMQ
**Database:** MongoDB
**Other:** Redis (BullMQ), Axios, pnpm workspaces, Vercel (SPA deployment)

## Architecture

DevLog is a **pnpm monorepo** with a decoupled API and a single-page web client that share a common types package:

```
apps/web  (React SPA)  ──axios/HTTP──►  apps/api  (NestJS REST)  ──Mongoose──►  MongoDB
                                          │  │
   both import from ───────────────────────┘  └──BullMQ──►  Redis (daily report jobs)
packages/types (shared TS types & enums)
```

The API is organized into per-resource NestJS modules (`projects`, `articles`, `snippets`, `dsa`, `sessions`, `daily-report`, `dashboard`, `auth`). Controllers validate with class-validator DTOs, services own the Mongoose queries, and the web app consumes everything through TanStack Query hooks that wrap a per-resource Axios module — pages never call the network directly.

## Getting Started

### Prerequisites
- Node.js 20+
- pnpm 10+
- MongoDB (local or via `docker run -p 27017:27017 mongo`)
- Redis (local or via `docker run -p 6379:6379 redis`)

### Installation
```bash
git clone https://github.com/you/dev-log.git
cd dev-log
pnpm install
pnpm build:types   # build the shared @devlog/types package
```

### Environment Variables
Copy the example files into place and fill them in:
```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

```bash
# apps/api/.env
JWT_SECRET=openssl rand -hex 32
MONGODB_URI=mongodb://user:password@localhost:27017/dev-log?authSource=admin
REDIS_HOST=localhost
REDIS_PORT=6379
FRONTEND_URL=http://localhost:5173

# apps/web/.env
VITE_API_URL=http://localhost:3000
```

### Running Locally
```bash
docker run -d -p 27017:27017 mongo
docker run -d -p 6379:6379 redis
pnpm dev
```
- API → `http://localhost:3000`
- Web → `http://localhost:5173`

## Project Structure
```
apps/
  web/       # React 19 + Vite + Tailwind SPA (pages, features, hooks, api modules)
  api/       # NestJS REST API (per-resource modules, schemas, DTOs, services)
packages/
  types/     # Shared TypeScript types & enums consumed by both apps
```

## Challenges & Learnings

- **One source of truth across two apps.** Both the web client and the API need the same DTO shapes and enums (session types, DSA patterns, difficulty levels). Keeping them in a shared `packages/types` workspace package means a backend validation change is typed everywhere at once — no drift between "what the server validates" and "what the client assumes."
- **Timezone-aware statistics.** Daily aggregates had to respect the *user's* timezone, not the server's. The user's timezone rides along in the JWT and is threaded into queries, and day boundaries are computed with timezone-normalized dates (`fromZonedTime`) so a day's data doesn't leak across midnight boundaries.
- **Deleting data without orphaning references.** Sessions can point at a project via `linkedTo`; deleting that project used to leave dangling references that inflated statistics. The fix unlinks sessions in the same `remove()` call before deleting the project — small enough that a transaction wasn't needed.
- **Paginating every list endpoint consistently.** All five `findAll` endpoints (sessions, DSA, projects, articles, snippets) now return the same `{ data, total, page, limit, totalPages }` contract via a shared DTO and helper — so the frontend handles one response shape everywhere.
- **Never lose tracked time.** The active-session timer persists to `localStorage` and is only cleared after the "stop" request succeeds. If the API is down when you hit stop, the timer keeps running and surfaces the error — no more silently losing a 2-hour session to a network blip.
- **Deployment gotchas.** BrowserRouter deep links 404 on static hosts without a rewrite, so a `vercel.json` SPA fallback was added; the root error boundary wraps public and protected routes alike so a crash on the landing page never leaves a blank screen.

## Roadmap

- [ ] Recurring / scheduled daily reports with digest preferences
- [ ] Mobile PWA support with offline session logging
- [ ] Export session history (CSV / markdown)
- [ ] Team / shared projects support
- [ ] Goals & reminders based on weekly activity

## License

ISC
