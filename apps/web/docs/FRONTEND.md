# DevLog Frontend Specification

This document defines the frontend implementation plan for DevLog. It covers the
technology stack, folder structure, design system, routing architecture, data
fetching patterns, and per-page specifications. Treat it as the authoritative
reference before writing a single component.

---

## Stack

| Concern      | Library                    | Why                                                                 |
| ------------ | -------------------------- | ------------------------------------------------------------------- |
| Framework    | React 18 + Vite            | Already in monorepo                                                 |
| Language     | TypeScript                 | Already in monorepo                                                 |
| Routing      | React Router v6            | Protected route composition, nested layouts                         |
| Server state | TanStack Query v5          | Caching, background refetch, mutation handling                      |
| Forms        | React Hook Form + Zod      | Mirrors backend's class-validator; type-safe schemas                |
| Styling      | Tailwind CSS v3            | shadcn dependency; utility-first keeps components portable          |
| Components   | shadcn/ui                  | Generated into your codebase — readable, modifiable                 |
| Icons        | Lucide React               | Ships with shadcn; consistent icon weight                           |
| Charts       | Recharts                   | Composable, TypeScript-native, adequate for dashboard needs         |
| HTTP         | Axios                      | Interceptor support needed for 401 → redirect; withCredentials      |
| Dates        | date-fns                   | Timezone-aware formatting; pairs with backend's Asia/Manila default |
| Animation    | Tailwind transitions + CSS | No library needed; keep motion minimal for a tool UI                |

Install command from the monorepo root:

```bash
cd apps/frontend
pnpm add @tanstack/react-query axios react-router-dom react-hook-form zod
pnpm add recharts date-fns lucide-react
pnpm add -D @tanstack/react-query-devtools
npx shadcn@latest init
```

---

## Monorepo Integration

The shared `@devlog/types` package is already compiled to `dist/`. Import from it
directly in frontend code — never redefine enums or interfaces that already live
there.

```ts
// Good
import { SessionType, ProjectStatus, ArticleStatus } from '@devlog/types'

// Bad
enum SessionType { PROJECT = 'Project', ... }  // duplication, will drift
```

Ensure `tsconfig.json` in the frontend app has the path alias configured:

```json
{
  "compilerOptions": {
    "paths": {
      "@devlog/types": ["../../packages/types/dist"]
    }
  }
}
```

---

## Folder Structure

```
apps/frontend/src/
├── api/                    # Axios instance + per-resource API modules
│   ├── client.ts           # Base Axios instance, interceptors
│   ├── auth.api.ts
│   ├── sessions.api.ts
│   ├── dsa.api.ts
│   ├── projects.api.ts
│   ├── articles.api.ts
│   ├── snippets.api.ts
│   └── daily-reports.api.ts
│
├── components/
│   ├── ui/                 # shadcn-generated (do not hand-edit)
│   ├── layout/
│   │   ├── AppShell.tsx    # Sidebar + main content wrapper
│   │   ├── Sidebar.tsx     # Navigation links
│   │   └── PageHeader.tsx  # Title + optional action slot
│   └── common/
│       ├── StatCard.tsx    # Reusable metric tile
│       ├── EmptyState.tsx  # Zero-data placeholder
│       ├── ErrorBoundary.tsx
│       ├── LoadingSpinner.tsx
│       └── FilterBar.tsx   # Type + date range filter used across list pages
│
├── features/               # Feature-scoped components, hooks, schemas
│   ├── auth/
│   ├── dashboard/
│   ├── sessions/
│   ├── dsa/
│   ├── projects/
│   ├── articles/
│   ├── snippets/
│   └── daily-reports/
│
├── hooks/
│   ├── useAuth.ts          # Queries /auth/profile; gates protected routes
│   ├── useTimezone.ts      # Reads timezone from auth user, falls back to Asia/Manila
│   └── useDebounce.ts      # For snippet search input
│
├── lib/
│   ├── formatters.ts       # Duration formatting, date display, streak labels
│   ├── queryKeys.ts        # Centralised TanStack Query key factory
│   └── utils.ts            # shadcn's cn() helper + anything else
│
├── pages/                  # Route components — thin wrappers that compose features
│   ├── DashboardPage.tsx
│   ├── SessionsPage.tsx
│   ├── DSAPage.tsx
│   ├── ProjectsPage.tsx
│   ├── ProjectDetailPage.tsx
│   ├── ArticlesPage.tsx
│   ├── SnippetsPage.tsx
│   ├── DailyReportsPage.tsx
│   ├── LoginPage.tsx
│   └── RegisterPage.tsx
│
└── router/
    ├── index.tsx           # Route definitions
    └── ProtectedRoute.tsx  # Auth guard component
```

Each `features/<name>/` folder follows this internal shape:

```
features/sessions/
├── components/
│   ├── SessionList.tsx
│   ├── SessionCard.tsx
│   ├── SessionForm.tsx
│   └── SessionStats.tsx
├── hooks/
│   ├── useSessions.ts      # useQuery wrappers
│   └── useSessionMutations.ts
└── schemas/
    └── session.schema.ts   # Zod schema mirroring backend DTO
```

---

## API Layer

### Axios Client

```ts
// api/client.ts
import axios from "axios";

export const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // required — auth is httpOnly cookie
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      window.location.href = "/login";
    }
    return Promise.reject(err);
  },
);
```

`VITE_API_URL` points to `http://localhost:3000` in development and the Heroku
backend URL in production. Set both in `.env.development` and `.env.production`.

### Per-Resource Modules

Each API module exports plain async functions. No class instances, no singletons
beyond the shared client.

```ts
// api/sessions.api.ts
import { client } from "./client";
import type { CreateSessionDto, SessionFilters } from "@devlog/types";

export const sessionsApi = {
  findAll: (filters?: SessionFilters) =>
    client.get("/sessions", { params: filters }).then((r) => r.data),

  findOne: (id: string) => client.get(`/sessions/${id}`).then((r) => r.data),

  create: (dto: CreateSessionDto) =>
    client.post("/sessions", dto).then((r) => r.data),

  update: (id: string, dto: Partial<CreateSessionDto>) =>
    client.patch(`/sessions/${id}`, dto).then((r) => r.data),

  remove: (id: string) => client.delete(`/sessions/${id}`),

  getStats: () => client.get("/sessions/statistics").then((r) => r.data),

  getStreaks: () => client.get("/sessions/streaks").then((r) => r.data),
};
```

Follow this exact pattern for every resource.

---

## TanStack Query Patterns

### Query Key Factory

Centralise all query keys to avoid string drift across the codebase.

```ts
// lib/queryKeys.ts
export const keys = {
  auth: {
    profile: () => ["auth", "profile"] as const,
  },
  sessions: {
    all: (filters?: object) => ["sessions", filters ?? {}] as const,
    one: (id: string) => ["sessions", id] as const,
    stats: () => ["sessions", "stats"] as const,
    streaks: () => ["sessions", "streaks"] as const,
  },
  dsa: {
    all: (filters?: object) => ["dsa", filters ?? {}] as const,
    one: (id: string) => ["dsa", id] as const,
    stats: () => ["dsa", "stats"] as const,
  },
  projects: {
    all: () => ["projects"] as const,
    one: (id: string) => ["projects", id] as const,
    stats: (id: string) => ["projects", id, "stats"] as const,
  },
  articles: {
    all: (filters?: object) => ["articles", filters ?? {}] as const,
    stats: () => ["articles", "stats"] as const,
  },
  snippets: {
    all: (search?: string) => ["snippets", search ?? ""] as const,
  },
  dailyReports: {
    all: () => ["daily-reports"] as const,
    one: (date: string) => ["daily-reports", date] as const,
  },
};
```

### Hook Pattern

Wrap every query in a feature-scoped hook. Pages import hooks, not `useQuery`
directly.

```ts
// features/sessions/hooks/useSessions.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { sessionsApi } from "@/api/sessions.api";
import { keys } from "@/lib/queryKeys";

export function useSessions(filters?: SessionFilters) {
  return useQuery({
    queryKey: keys.sessions.all(filters),
    queryFn: () => sessionsApi.findAll(filters),
  });
}

export function useCreateSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: sessionsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sessions"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
```

Invalidate broadly on mutations. When a session is created or deleted, stats and
the dashboard are stale too — invalidate the entire `sessions` key family.

---

## Auth

### useAuth Hook

```ts
// hooks/useAuth.ts
import { useQuery } from "@tanstack/react-query";
import { authApi } from "@/api/auth.api";
import { keys } from "@/lib/queryKeys";

export function useAuth() {
  const query = useQuery({
    queryKey: keys.auth.profile(),
    queryFn: authApi.profile,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  return {
    user: query.data,
    isLoading: query.isLoading,
    isAuthenticated: !!query.data,
  };
}
```

### ProtectedRoute

```ts
// router/ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) return <LoadingSpinner />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <Outlet />
}
```

### Routing Structure

```ts
// router/index.tsx
<Routes>
  <Route path="/login" element={<LoginPage />} />
  <Route path="/register" element={<RegisterPage />} />

  <Route element={<ProtectedRoute />}>
    <Route element={<AppShell />}>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/sessions" element={<SessionsPage />} />
      <Route path="/dsa" element={<DSAPage />} />
      <Route path="/projects" element={<ProjectsPage />} />
      <Route path="/projects/:id" element={<ProjectDetailPage />} />
      <Route path="/articles" element={<ArticlesPage />} />
      <Route path="/snippets" element={<SnippetsPage />} />
      <Route path="/daily-reports" element={<DailyReportsPage />} />
    </Route>
  </Route>
</Routes>
```

`AppShell` renders the sidebar and wraps `<Outlet />` in the main content area.

---

## Form Pattern

Use Zod schemas that mirror the backend DTOs. Never duplicate field names or
validation rules — derive the TypeScript type from the schema.

```ts
// features/sessions/schemas/session.schema.ts
import { z } from "zod";
import { SessionType } from "@devlog/types";

export const createSessionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  sessionType: z.nativeEnum(SessionType),
  durationInSeconds: z.number().int().positive(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  linkedTo: z
    .object({
      kind: z.literal("Project"),
      id: z.string(),
    })
    .optional(),
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>;
```

```tsx
// features/sessions/components/SessionForm.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createSessionSchema,
  type CreateSessionInput,
} from "../schemas/session.schema";

export function SessionForm({ onSuccess }: { onSuccess: () => void }) {
  const { mutate, isPending } = useCreateSession();
  const form = useForm<CreateSessionInput>({
    resolver: zodResolver(createSessionSchema),
  });

  const onSubmit = (data: CreateSessionInput) => {
    mutate(data, { onSuccess });
  };

  return <form onSubmit={form.handleSubmit(onSubmit)}>{/* fields */}</form>;
}
```

---

## Design System

### Direction

Developer tool. Not a landing page, not a SaaS marketing site. Treat it like
Linear or Raycast — dense, precise, purposeful. Every pixel earns its place.

Dark mode is the primary theme. Do not build a light mode toggle unless you have
time after everything else works.

### Color Palette

**Accent direction: terminal amber, not violet.** Violet/purple is the default
almost every AI code generator and shadcn template reaches for — it's the
single fastest tell that a frontend was scaffolded rather than designed. DevLog
is a log tracker, so an amber accent draws on CRT terminal displays and
timestamped log output — thematically apt and rarely used elsewhere.

All DevLog-specific tokens are prefixed `--devlog-*`. This is deliberate: shadcn's
`init` already wrote its own `--accent`, `--border`, `--background`, etc. into this
file (further down, in the `.dark` block and the `@theme inline` block). Reusing
those exact names means shadcn's own dark-mode overrides silently replace your
colors after a mode switch. Namespacing avoids the collision entirely — never
add a plain `--accent` or `--border` override, only `--devlog-*` ones.

Define everything in CSS variables. Never hardcode a hex value in a component.

```css
/* index.css — add this block, do not touch shadcn's existing :root variables */
:root {
  --devlog-bg-base: #0d0d0f; /* near-black, slightly warm */
  --devlog-bg-surface: #141417; /* cards, sidebar */
  --devlog-bg-elevated: #1c1c21; /* modals, dropdowns */
  --devlog-bg-hover: #22222a;

  --devlog-border: #2a2a35;
  --devlog-border-subtle: #1e1e28;

  --devlog-text-primary: #e8e8f0;
  --devlog-text-secondary: #8888a4;
  --devlog-text-muted: #55556a;

  /* One accent. Commit to it. Terminal amber — warm, not neon, not violet. */
  --devlog-accent: #c9762f;
  --devlog-accent-dim: #8a5220;
  --devlog-accent-fg: #0d0d0f; /* dark text ON the accent, not white — reads intentional */

  /* Semantic */
  --devlog-success: #4ade80;
  --devlog-warning: #f4c542; /* shifted off-amber so it's distinguishable from accent */
  --devlog-danger: #f87171;
}
```

Assign semantic colors per resource type so charts and badges are consistent
everywhere. Only `PROJECT` uses the accent — every other type gets a distinct hue
so the accent stays a signal, not decoration:

```ts
// lib/formatters.ts
export const SESSION_TYPE_COLOR: Record<SessionType, string> = {
  [SessionType.PROJECT]: "var(--devlog-accent)",
  [SessionType.DSA]: "#4ade80",
  [SessionType.STUDY]: "#5b9bd9",
  [SessionType.ARTICLE]: "#f4c542",
  [SessionType.OTHER]: "var(--devlog-text-muted)",
};
```

### Typography

```css
@import url("https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Geist:wght@400;500;600&display=swap");

body {
  font-family: "Geist", sans-serif;
}
code,
.mono {
  font-family: "IBM Plex Mono", monospace;
}
```

Use `mono` class on: durations, dates, streak counts, badge labels, stat numbers.
These are data — display them as data.

### Spacing

Tailwind defaults are fine. Establish one rule: all page-level padding is
`px-6 py-6` on desktop. Sidebar is `w-56` fixed. Main content fills the rest.

### Component Rules

- No inline styles. CSS variables + Tailwind utilities only.
- shadcn components are the base layer. Wrap them in feature components rather than
  calling them directly in pages.
- Every list view needs an `EmptyState` component. Do not render nothing.
- Every async operation needs a loading state. Use skeleton loaders from shadcn,
  not spinners, for content areas.

---

## Page Specifications

### Dashboard `/`

**Purpose:** At-a-glance view of the current week.

**Data sources:**

- `GET /sessions/statistics` — totalByType, averagePerDay, mostProductiveDay,
  totalTimeSpent, currentStreak
- `GET /sessions/streaks` — per SessionType streak
- `GET /dsa/statistics` — currentStreak, totalProblemsSolved
- `GET /daily-reports` (latest 1) — yesterday's summary if generated

**Layout:**

```
┌─────────────────────────────────────────────────────┐
│  This Week              Streak    Total Sessions     │
│  [StatCard]             [StatCard]  [StatCard]       │
├──────────────────────────────┬──────────────────────┤
│  Time by Type (bar chart)    │  Type Breakdown       │
│                              │  (donut or list)      │
├──────────────────────────────┴──────────────────────┤
│  Yesterday's Report (collapsed, expand to read)      │
└─────────────────────────────────────────────────────┘
```

**Notes:**

- StatCards show `totalTimeSpent` formatted as `Xh Ym` (use `formatDuration` from
  `lib/formatters.ts`)
- Chart uses `SESSION_TYPE_COLOR` map for consistent colors across the app
- Dashboard queries run in parallel — one `Promise.all` equivalent via multiple
  `useQuery` hooks, not sequential

---

### Sessions `/sessions`

**Purpose:** Create and browse log entries.

**Data sources:**

- `GET /sessions?type=&startDate=&endDate=` — paginated list
- `POST /sessions` — create
- `DELETE /sessions/:id` — remove
- `PATCH /sessions/:id` — edit (type, title, duration)

**Layout:**

```
┌─────────────────────────────────────────────────────┐
│  [FilterBar: type, date range]       [+ New Session] │
├─────────────────────────────────────────────────────┤
│  SessionCard                                         │
│  SessionCard                                         │
│  ...                                                 │
└─────────────────────────────────────────────────────┘
```

**SessionCard shows:** type badge, title, duration, date, optional linked project.

**New Session:** slide-in Sheet (shadcn) from the right, not a full page. Form
fields: type (Select with SessionType enum), title, duration (number input in
minutes — convert to seconds before sending), notes (Textarea), project link
(optional Select populated from `GET /projects`).

---

### DSA `/dsa`

**Purpose:** Track solved problems and view pattern/difficulty breakdown.

**Data sources:**

- `GET /dsa` — list of problems
- `GET /dsa/statistics` — all stat fields
- `POST /dsa`, `PATCH /dsa/:id`, `DELETE /dsa/:id`

**Layout:** Two-column above the fold: stats panel left, problem list right. Stats
panel shows currentStreak, longestStreak, totalProblemsSolved. Below: two small
charts — breakdown by difficulty (horizontal bar), breakdown by pattern (horizontal
bar). The list is filterable by difficulty.

---

### Projects `/projects` + `/projects/:id`

**Purpose:** Browse projects; view one project's details and linked sessions.

**Data sources:**

- `GET /projects` — list
- `GET /projects/:id` — single project
- `GET /projects/:id/statistics` — totalTimeLogged, tasksCompleted,
  sessionFrequencyOverTime

**List page:** Grid of project cards. Card shows name, status badge, category,
totalTimeLogged from stats. Clicking navigates to detail.

**Detail page:**

```
┌─────────────────────────────────────────────────────┐
│  Project name    [status badge]    [Edit] [Delete]  │
│  description                                        │
├────────────────────┬────────────────────────────────┤
│  Total Time        │  Tasks Completed               │
│  [StatCard]        │  [StatCard]                    │
├────────────────────┴────────────────────────────────┤
│  Session frequency over time (14-day area chart)    │
├─────────────────────────────────────────────────────┤
│  Linked Sessions (filtered list of SessionCards)    │
└─────────────────────────────────────────────────────┘
```

---

### Articles `/articles`

**Purpose:** Reading list management.

**Data sources:**

- `GET /articles` — list, filterable by status
- `GET /articles/statistics`
- `POST /articles`, `PATCH /articles/:id`, `DELETE /articles/:id`

**Layout:** Status tabs at top (All, Unread, In Progress, Read). Article list
beneath. Each row: title, category badge, status badge, readAt if read. Mark as
read inline with a single click — triggers `PATCH /articles/:id` with
`{ status: 'Read' }`. Stats strip above the list: totalTimeSpentReading,
readRatio, readThisMonth.

---

### Snippets `/snippets`

**Purpose:** Searchable code snippet library.

**Data sources:**

- `GET /snippets` — all snippets
- `POST /snippets`, `PATCH /snippets/:id`, `DELETE /snippets/:id`

**Layout:** Search input at top (debounced, filters client-side after initial load).
Snippet cards show language badge, category, title, and a truncated code preview
using a `<pre>` block with `font-mono`. Full snippet expands in a Sheet or Dialog.

**Do not use a syntax highlighter on first pass.** A styled `<pre>` block with
`IBM Plex Mono` is enough. Add Shiki or Prism later if you want it.

---

### Daily Reports `/daily-reports`

**Purpose:** View auto-generated nightly summaries.

**Data sources:**

- `GET /daily-reports` — list of reports
- `GET /daily-reports/:date` — single report
- `PATCH /daily-reports/:date/read` — mark read

**Layout:** Sorted list, newest first. Unread reports have a dot indicator. Each
report expands to show: totalTimeLogged, topSessionType, breakdownBySessionType
(horizontal bar chart). Expanding a report automatically fires the mark-read
mutation.

---

### Auth Pages

**Login `/login`:**

- Email + password form
- Zod validation before submit
- On success → navigate to `/`
- Link to register

**Register `/register`:**

- Email, username, password, timezone (Select populated with common IANA zones,
  default `Asia/Manila`)
- On success → navigate to `/login` with a success toast

---

## Utility Functions

```ts
// lib/formatters.ts

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function formatDate(iso: string, tz = "Asia/Manila"): string {
  return new Intl.DateTimeFormat("en-PH", {
    timeZone: tz,
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}

export function formatRelativeDay(dateStr: string): string {
  // returns 'Today', 'Yesterday', or 'Jun 4'
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (dateStr === today) return "Today";
  if (dateStr === yesterday) return "Yesterday";
  return new Date(dateStr).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
  });
}
```

---

## Environment Variables

```bash
# apps/frontend/.env.development
VITE_API_URL=http://localhost:3000

# apps/frontend/.env.production
VITE_API_URL=https://your-heroku-backend.herokuapp.com
```

Vite only exposes variables prefixed with `VITE_`. Never prefix with `REACT_APP_`.

---

## Build & Dev Commands

Add to `apps/frontend/package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext ts,tsx --max-warnings 0",
    "type-check": "tsc --noEmit"
  }
}
```

From the monorepo root with pnpm:

```bash
pnpm --filter frontend dev
pnpm --filter frontend build
```

---

## Build Order

Build the frontend in this order. Each phase gates the next.

**Phase 1 — Foundation**

- Axios client + interceptors
- QueryClient setup in main.tsx
- Router skeleton with all routes registered (pages can be stubs)
- ProtectedRoute + useAuth
- AppShell + Sidebar with navigation links
- Login and Register pages (functional)

**Phase 2 — Core feature loop**

- Sessions: list, create, delete (FilterBar, SessionCard, SessionForm in Sheet)
- Dashboard: stat cards + time-by-type bar chart
- These two together exercise every pattern you will reuse everywhere else

**Phase 3 — Remaining resources**

- DSA page
- Projects list + detail
- Articles with status tabs
- Snippets with search

**Phase 4 — Polish**

- Daily Reports page
- Empty states on every list
- Skeleton loaders replacing spinners
- Toast notifications on mutations (shadcn Sonner)
- Error boundaries

Do not start Phase 4 until Phase 3 is working. Finishing matters more than
polishing.
