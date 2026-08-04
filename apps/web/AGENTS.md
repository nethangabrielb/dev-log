# DevLog Frontend — Agent Rules

Skills available in .agents/skills/ — check them for task-specific rules
before writing session, styling, API, or form code. Full spec: docs/FRONTEND.

## Stack (non-negotiable)

- React 18 + Vite + TypeScript
- TanStack Query v5 for all server state — no useEffect for data fetching
- React Router v6 for routing
- React Hook Form + Zod for all forms
- shadcn/ui for components, Tailwind for styling
- Recharts for charts, date-fns for dates, Axios for HTTP

## Monorepo rules

- Import enums and interfaces from `@devlog/types` — never redefine them locally
- SessionType, ProjectStatus, ArticleStatus, ArticleCategory etc. all live there

## API layer

- All API calls go through `src/api/client.ts` (Axios instance with withCredentials: true)
- Per-resource modules in `src/api/*.api.ts` — plain async functions, no classes
- Never call Axios directly inside a component or hook

## State

- All query keys go through the factory in `src/lib/queryKeys.ts`
- All queries wrapped in feature-scoped hooks in `src/features/<name>/hooks/`
- Pages import hooks, never useQuery directly

## Styling

- Dark mode only — CSS variables defined in index.css, never hardcode hex values
- Accent color is --devlog-accent (terminal amber, #c9762f) — never use plain
  --accent, that's shadcn's own token and gets overridden in dark mode
- All DevLog design tokens are prefixed --devlog-\* to avoid colliding with
  shadcn's generated :root/.dark variables
- Font: Geist for body, IBM Plex Mono for data/numbers/dates/badges
- No inline styles

## Folder rules

- src/pages/ — thin route wrappers only, composition happens in features/
- src/features/<name>/ — components, hooks, schemas scoped to one resource
- src/components/ui/ — shadcn generated, do not hand-edit

## Color enforcement

- Never use Tailwind's built-in color utility classes (bg-orange-500, text-purple-600,
  border-gray-800, etc.) for anything DevLog-branded — always var(--devlog-\*)
- Buttons and interactive elements: flat fill, no gradients, no glossy box-shadow
- Focus rings use var(--devlog-accent) at low opacity, not full-strength glow

## Sessions data model

- Sessions have NO title and NO notes field on the backend — do not invent one
- CreateSessionDto: type, durationInSeconds, startedAt, endedAt, todos?
  ({ name, completed }[]), linkedTo?
- durationInSeconds is NOT derived server-side — compute endedAt - startedAt
  client-side and send explicitly alongside both timestamps
- Sessions are created via start/stop timer only, never a manual form
- Todos are editable (add/toggle/remove) only before and during an active
  session — once POSTed, they render read-only on SessionCard
