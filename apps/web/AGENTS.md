# Web Rules

React 19 + Vite + TS. TanStack Query v5, React Router v7, React Hook Form + Zod, shadcn/ui + Tailwind v4, Recharts, Axios. Dark mode only.

## Essential Commands

- `pnpm --filter web dev` — Vite on `:5173`
- `pnpm --filter web build` — `tsc -b && vite build`
- `pnpm --filter web lint` — `eslint .`
- Shared types come from `@devlog/types` (rebuild at root: `pnpm build:types`)

## Architecture

- `src/pages/` — thin route wrappers only
- `src/features/<name>/` — per-resource components, hooks, schemas; `hooks/` wrap queries
- `src/components/` — cross-cutting shared; `src/components/ui/` — shadcn-generated, do not hand-edit
- `src/api/<resource>.api.ts` — plain async modules over shared `src/api/client.ts` (withCredentials; 401 interceptor → /login)
- `src/lib/queryKeys.ts` — query key factory; no inline query keys

## Rules

- Never call `useQuery`/`useMutation`/Axios in pages or components — wrap in a feature hook
- Mutations invalidate the ENTIRE resource key family (plus `['dashboard']`), not one query
- Use `--devlog-*` tokens only; never Tailwind color utilities or raw hex. Accent = `--devlog-accent` (#c9762f)
- Zod schemas live in `src/features/<name>/schemas/` and mirror backend DTOs field-for-field
- RHF+Zod forms: Projects, Articles, Snippets, Auth ONLY. Sessions have NO form and NO title/notes — start/stop timer only
- Load the matching skill before writing related code — auto-triggered: devlog-api-query-pattern, devlog-design-tokens, devlog-forms-pattern, devlog-sessions-model

## References

- Full spec and design system: `docs/FRONTEND.md`
- Verify: `pnpm lint` after changes
