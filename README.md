# DevLog

A developer activity tracker that logs time sessions against projects, DSA problems, articles, and snippets — then turns that raw activity into streaks, statistics, charts, and daily reports.

**Live:** https://https://developer-logs.netlify.app

## Features

- **Live session timer** — start/stop coding sessions with an inline todo checklist and link each session to a project, DSA problem, or article. Timer state persists to `localStorage` so tracked time survives network drops or accidental tab closes.
- **Dashboard & streaks** — weekly time-by-session-type charts, current streak, total sessions, time logged today, and session frequency over time.
- **Project analytics** — per-project time logged, tasks completed, and 14-day session frequency chart with breakdowns by status and category. Filter and search across all projects.
- **DSA problem tracker** — solved-problem log with difficulty, pattern, and confidence-level breakdowns.
- **Reading list** — article backlog with Unread / Reading / Read statuses and reading-time statistics.
- **Snippet library** — organized code snippets by language and category with Shiki syntax highlighting and one-click copy.
- **Daily reports** — background-generated daily summaries via BullMQ + Redis.
- **Authentication** — email / password (JWT stored in httpOnly cookies) plus Google OAuth 2.0.
- **Developer quality** — paginated APIs with a consistent response contract, request rate limiting, Helmet security headers, timezone-aware statistics, and a fully responsive dark-mode UI.

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, TanStack Query, React Router v7, React Hook Form + Zod, Recharts, shadcn/ui, Shiki |
| **Backend** | Node.js, NestJS 11 (REST), Mongoose, Passport (JWT + Google OAuth), BullMQ |
| **Database** | MongoDB |
| **Infrastructure** | Redis (BullMQ job queue), pnpm workspaces, Vercel (SPA deployment) |

## Architecture

DevLog is a **pnpm monorepo** with a decoupled REST API and a single-page web client that share a common types package:

```
apps/web  (React SPA)  ──Axios──►  apps/api  (NestJS REST)  ──Mongoose──►  MongoDB
                                       │
                                       └──BullMQ──►  Redis  (daily report jobs)

packages/types  ──────────────►  shared TypeScript types & enums for both apps
```

The API is organized into self-contained NestJS modules — one per resource (`projects`, `articles`, `snippets`, `dsa`, `sessions`, `daily-report`, `dashboard`, `auth`, `users`). Controllers validate input with class-validator DTOs, services own the Mongoose queries, and the web app consumes everything through TanStack Query hooks wrapping per-resource Axios modules.

## Getting Started

### Prerequisites

| Requirement | Version |
|---|---|
| Node.js | 20+ |
| pnpm | 10+ |
| MongoDB | 6+ (local or Docker) |
| Redis | 7+ (local or Docker) |

### Installation

```bash
git clone https://github.com/you/dev-log.git
cd dev-log
pnpm install
pnpm build:types   # build @devlog/types — required before first run
```

### Environment Variables

Copy the example files and fill in your values:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

**API** (`apps/api/.env`):

| Variable | Description | Default |
|---|---|---|
| `NODE_ENV` | Runtime environment | `development` |
| `JWT_SECRET` | Secret for signing JWT tokens — generate with `openssl rand -hex 32` | — |
| `MONGODB_URI` | MongoDB connection string | `mongodb://user:password@localhost:27017/dev-log?authSource=admin` |
| `REDIS_HOST` | Redis host for BullMQ | `localhost` |
| `REDIS_PORT` | Redis port for BullMQ | `6379` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | — |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | — |
| `GOOGLE_CALLBACK_URL` | Google OAuth callback URL | `http://localhost:3000/auth/google/callback` |
| `FRONTEND_URL` | Allowed CORS origin | `http://localhost:5173` |

**Web** (`apps/web/.env`):

| Variable | Description | Default |
|---|---|---|
| `VITE_API_URL` | Base URL of the backend API | `http://localhost:3000` |

### Running Locally

Start MongoDB and Redis (Docker example), then launch both apps in parallel:

```bash
docker run -d -p 27017:27017 mongo
docker run -d -p 6379:6379 redis
pnpm dev
```

| Service | URL |
|---|---|
| API | `http://localhost:3000` |
| Web | `http://localhost:5173` |

## Troubleshooting

- **Login doesn't work (email/password or Google)** — If login fails in every mode, it's most likely your browser, not the app. Tested in Brave: login fails until you turn off Shields for the site (then it works). Try disabling similar privacy/security features (ad blockers, strict cookie blocking) or a different browser.

## Available Scripts

All scripts run from the monorepo root:

| Script | Description |
|---|---|
| `pnpm dev` | Start API (`:3000`) and Web (`:5173`) in parallel |
| `pnpm build:types` | Rebuild `@devlog/types` (run after editing `packages/types`) |
| `pnpm build` | Production build — API then Web |
| `pnpm lint` | Lint all workspaces |
| `pnpm --filter api test` | Run API unit tests (Jest) |
| `pnpm --filter api test:e2e` | Run API end-to-end tests |

## Project Structure

```
dev-log/
├── apps/
│   ├── api/                  # NestJS REST API
│   │   └── src/
│   │       ├── auth/         #   JWT + Google OAuth
│   │       ├── projects/     #   Projects CRUD + analytics
│   │       ├── sessions/     #   Session timer + tracking
│   │       ├── dsa/          #   DSA problem log
│   │       ├── articles/     #   Reading list
│   │       ├── snippets/     #   Code snippet library
│   │       ├── dashboard/    #   Aggregated statistics
│   │       ├── daily-report/ #   BullMQ scheduled reports
│   │       ├── users/        #   User management
│   │       └── common/       #   Shared DTOs, guards, pipes
│   └── web/                  # React 19 + Vite SPA
│       ├── src/
│       │   ├── api/          #   Per-resource Axios modules
│       │   ├── components/   #   Shared UI (shadcn/ui based)
│       │   ├── features/     #   Feature-sliced modules
│       │   ├── hooks/        #   TanStack Query hooks
│       │   ├── pages/        #   Route-level page components
│       │   └── router/       #   React Router config
│       └── docs/
│           └── FRONTEND.md   #   Frontend conventions
├── packages/
│   └── types/                # Shared TypeScript types & enums (@devlog/types)
│       └── src/
│           ├── enums/        #   SessionType, ProjectStatus, etc.
│           └── interfaces/   #   Request/response shapes
├── pnpm-workspace.yaml
└── package.json
```

## Challenges & Learnings

- **Shared types across apps** — A `packages/types` workspace package ensures both API validation DTOs and client-side TypeScript agree on the same shapes and enums. Changing a backend enum propagates compile errors to the frontend immediately.
- **Timezone-aware statistics** — Daily aggregates respect the user's timezone (carried in the JWT) with `date-fns-tz`, preventing day-boundary data leaks around midnight.
- **Consistent pagination** — All list endpoints return the same `{ data, total, page, limit, totalPages }` contract via a shared DTO, so the frontend handles one response shape everywhere.
- **Resilient session tracking** — The active timer persists to `localStorage` and clears only after a successful save. Network failures surface errors without losing tracked time.
- **SPA deep-link routing** — A `vercel.json` rewrite rule ensures BrowserRouter deep links don't 404 on the static host.

## Roadmap

- [ ] Recurring / scheduled daily reports with digest preferences
- [ ] Mobile PWA support with offline session logging
- [ ] Export session history (CSV / Markdown)
- [ ] Team / shared projects support
- [ ] Goals & reminders based on weekly activity

## License

ISC
