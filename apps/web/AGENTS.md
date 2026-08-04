# Frontend Rules

## Stack

React 19 + Vite + TypeScript. TanStack Query v5, React Router v7,
React Hook Form + Zod, shadcn/ui + Tailwind, Recharts, date-fns, Axios.

## Conventions

### Types
Import enums/interfaces from `@devlog/types`. Never redefine locally.

### API layer
- Client: `src/api/client.ts` (Axios, withCredentials, 401 → /login)
- Per-resource: `src/api/<name>.api.ts` — exported object of async functions
- Never call Axios directly in components or hooks

### State
- Query keys: `src/lib/queryKeys.ts` factory only
- Hooks: `src/features/<name>/hooks/` — wrap all queries
- Pages import hooks, never `useQuery` directly

### Styling
- Dark mode only. CSS variables in index.css, never hardcode hex.
- Tokens prefixed `--devlog-*` (not shadcn's `--accent`, `--border`, etc.)
- Accent: `--devlog-accent` (#c9762f terminal amber)
- Fonts: Geist body, IBM Plex Mono for data/numbers
- No inline styles. No Tailwind color utilities for branded elements.
- Flat fill buttons, no gradients. Focus rings at low opacity.

### Folder structure
- `src/pages/` — thin route wrappers only
- `src/features/<name>/` — components, hooks, schemas per resource
- `src/components/ui/` — shadcn-generated, do not hand-edit

## Skills

7 skills in `.agents/skills/`. They auto-trigger on task description.
Use them for: API/query patterns, design tokens, forms, sessions model,
shadcn/ui, recharts, react-hook-form + zod.

Full page specs: `docs/FRONTEND.md` (use when building a page from scratch).
