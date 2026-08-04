# Project Rules

## Monorepo

pnpm workspace. Workspace names: `web`, `api`, `@devlog/types`.

Commands from root:
- `pnpm dev` — start api + web in parallel
- `pnpm build` — build api then web
- `pnpm build:types` — rebuild shared types
- `pnpm lint` — lint all packages

## Shared types

`packages/types` exports enums and interfaces used by both apps.
Import from `@devlog/types` — never redefine in apps.

## Per-app rules

- `apps/web/AGENTS.md` — frontend conventions, skills, architecture
- `apps/api/` — NestJS backend (no agent rules yet)
