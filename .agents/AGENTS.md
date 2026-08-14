# DevLog

pnpm monorepo. `apps/api` (NestJS 11 + MongoDB/Mongoose + BullMQ), `apps/web` (React 19 + Vite SPA), `packages/types` (shared types/enums).

## Essential Commands (from root)

- `pnpm dev` — api (`:3000`) + web (`:5173`) in parallel
- `pnpm build:types` — rebuild `@devlog/types` FIRST after editing `packages/types`; apps consume its dist
- `pnpm build` — build api, then web
- `pnpm lint` — `pnpm -r lint` (web `eslint .`; api `eslint ... --fix`, auto-fixes)
- `pnpm --filter api test` — unit (jest, `src/**/*.spec.ts`)
- `pnpm --filter api test:e2e` — e2e via `test/jest-e2e.json`

## Architecture

- `apps/api/src/<resource>/` — one self-contained NestJS module per resource (controller/service/dto/schemas/entities)
- `apps/api/src/auth/` — JWT via httpOnly cookie; global `ValidationPipe({ transform: true })`; CORS locked to `http://localhost:5173`
- `apps/api/src/daily-report/` — BullMQ processor + scheduler (background jobs), not a plain request handler
- `packages/types` — single source of truth, imported as `@devlog/types`; never redefine types/enums in apps
- `apps/web/` — see `apps/web/AGENTS.md`; skills in `.agents/skills/` auto-trigger

## Boundaries

- Always run `pnpm build:types` after editing `packages/types`
- Ask first before changing the auth (httpOnly cookie), CORS origin, or an existing resource's MongoDB schema
- Never add a workspace package without updating `pnpm-workspace.yaml` and installs
