# DevLog Frontend Specification

Authoritative reference for page-level architecture. For coding conventions
(API patterns, query hooks, forms, styling, sessions model), use the skills
in `.agents/skills/` — they auto-trigger and are kept in sync with the code.

---

## Folder Structure

```
src/
├── api/                    # Axios client + per-resource API modules
│   ├── client.ts           # Base instance, 401 interceptor
│   ├── auth.api.ts
│   ├── sessions.api.ts
│   ├── dsa.api.ts
│   ├── projects.api.ts
│   ├── articles.api.ts
│   ├── snippets.api.ts
│   ├── daily-reports.api.ts
│   └── dashboard.api.ts
│
├── components/
│   ├── ui/                 # shadcn-generated (do not hand-edit)
│   ├── layout/             # AppShell, Sidebar, PageHeader
│   └── common/             # StatCard, EmptyState, ErrorBoundary, FilterBar
│
├── features/               # Per-resource: components, hooks, schemas
│   ├── auth/
│   ├── dashboard/
│   ├── sessions/
│   ├── dsa/
│   ├── projects/
│   ├── articles/
│   ├── snippets/
│   └── daily-reports/
│
├── hooks/                  # Cross-cutting: useAuth, useTimezone, useDebounce
├── lib/                    # formatters.ts, queryKeys.ts, utils.ts
├── pages/                  # Thin route wrappers — composition in features/
└── router/                 # Route definitions, ProtectedRoute
```

---

## Design System

Developer tool. Dense, precise, purposeful — like Linear or Raycast.

### Accent

Terminal amber, not violet. `--devlog-accent: #c9762f`. All DevLog tokens
prefixed `--devlog-*` to avoid collision with shadcn's `:root/.dark` vars.

### Semantic Colors

Per-resource type colors for charts/badges — only `PROJECT` uses accent:

| Type      | Color                      |
|-----------|----------------------------|
| PROJECT   | `var(--devlog-accent)`     |
| DSA       | `#4ade80` (green)          |
| STUDY     | `#5b9bd9` (blue)           |
| ARTICLE   | `#f4c542` (yellow)         |
| OTHER     | `var(--devlog-text-muted)` |

### Typography

- Body: Geist
- Data/numbers/dates/badges: IBM Plex Mono (`mono` class)

---

## Page Specifications

### Dashboard `/`

At-a-glance view of the current week.

**Data:** `GET /sessions/statistics`, `GET /sessions/streaks`,
`GET /dsa/statistics`, `GET /daily-reports` (latest 1)

**Layout:** Stat cards (totalTimeSpent, streak, totalSessions) →
time-by-type bar chart + type breakdown → yesterday's report (collapsible)

---

### Sessions `/sessions`

Create and browse log entries via start/stop timer.

**Data:** `GET /sessions?type=&startDate=&endDate=`,
`POST /sessions`, `DELETE /sessions/:id`, `PATCH /sessions/:id`

**Layout:** FilterBar (type, date range) + New Session button →
SessionCard list. New session opens as a Sheet from the right.

**SessionCard shows:** type badge, duration, date, optional linked project.

---

### Sessions Overview `/sessions/overview`

Aggregated session statistics and trends.

---

### DSA `/dsa`

Track solved problems, pattern/difficulty breakdown.

**Data:** `GET /dsa`, `GET /dsa/statistics`,
`POST /dsa`, `PATCH /dsa/:id`, `DELETE /dsa/:id`

**Layout:** Two-column: stats panel (streaks, total solved) left,
problem list right. Below: difficulty + pattern bar charts.

---

### DSA Overview `/dsa/overview`

Aggregated DSA statistics and trends.

---

### Projects `/projects` + `/projects/:id`

Browse projects; view one project's details and linked sessions.

**Data:** `GET /projects`, `GET /projects/:id`,
`GET /projects/:id/statistics`

**List:** Grid of project cards — name, status badge, category, totalTimeLogged.

**Detail:** Project header → stat cards (totalTime, tasksCompleted) →
session frequency area chart (14-day) → linked sessions list.

---

### Projects Overview `/projects/overview`

Aggregated project statistics and trends.

---

### Articles `/articles`

Reading list management with status tracking.

**Data:** `GET /articles`, `GET /articles/statistics`,
`POST /articles`, `PATCH /articles/:id`, `DELETE /articles/:id`

**Layout:** Status tabs (All, Unread, In Progress, Read) → article list.
Stats strip: totalTimeSpentReading, readRatio, readThisMonth.
Mark as read inline with single click.

---

### Articles Overview `/articles/overview`

Aggregated article statistics and trends.

---

### Snippets `/snippets`

Searchable code snippet library.

**Data:** `GET /snippets`,
`POST /snippets`, `PATCH /snippets/:id`, `DELETE /snippets/:id`

**Layout:** Debounced search input → snippet cards (language badge,
category, title, truncated `<pre>` code preview).
Full snippet expands in a Sheet or Dialog.
No syntax highlighter on first pass — styled `<pre>` with IBM Plex Mono.

---

### Daily Reports `/daily-reports`

Auto-generated nightly summaries.

**Data:** `GET /daily-reports`, `GET /daily-reports/:date`,
`PATCH /daily-reports/:date/read`

**Layout:** Sorted list (newest first), unread dot indicator.
Expanding a report shows: totalTimeLogged, topSessionType,
breakdownBySessionType bar chart. Auto-marks read on expand.

---

### Daily Reports Overview `/daily-reports/overview`

Aggregated daily report statistics and trends.

---

### Auth Pages

**Login `/login`:** Email + password, Zod validation, redirects to `/` on success.

**Register `/register`:** Email, username, password, timezone (default `Asia/Manila`),
redirects to `/login` with success toast.

---

## Environment Variables

```bash
# apps/web/.env.development
VITE_API_URL=http://localhost:3000

# apps/web/.env.production
VITE_API_URL=https://your-heroku-backend.herokuapp.com
```

Vite only exposes variables prefixed with `VITE_`.

---

## Build & Dev Commands

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "lint": "eslint ."
  }
}
```

From monorepo root: `pnpm --filter web dev`, `pnpm --filter web build`.

---

## Build Order

**Phase 1 — Foundation:** Axios client, QueryClient, Router skeleton,
ProtectedRoute + useAuth, AppShell + Sidebar, Login/Register.

**Phase 2 — Core loop:** Sessions (list, create, delete) + Dashboard
(stat cards + bar chart). These exercise every reusable pattern.

**Phase 3 — Remaining resources:** DSA, Projects, Articles, Snippets.

**Phase 4 — Polish:** Daily Reports, empty states, skeleton loaders,
toast notifications, error boundaries.
