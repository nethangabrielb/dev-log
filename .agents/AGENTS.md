# Project Rules

- **Path Aliases**: Do not modify or remove existing path aliases (e.g., `@/*`)
  in apps/web/tsconfig.json or apps/web/tsconfig._.json when updating TypeScript
  compiler options. This does not apply to packages/types/tsconfig.json or
  apps/api/tsconfig_.json, which don't share this alias.

## Monorepo layout

pnpm monorepo. Workspace commands: `pnpm --filter web <cmd>`, `pnpm --filter api <cmd>`.
Shared types live in packages/types — never redefine enums/interfaces in apps.

## Frontend work (apps/web)

Rules and skills live in apps/web/, NOT here — these are not auto-discovered
from repo root. Before touching any frontend code, read apps/web/AGENTS.md
explicitly.

Skills are in apps/web/.agents/skills/: devlog-sessions-model,
devlog-design-tokens, devlog-api-query-pattern, devlog-forms-pattern,
react-hook-form-zod, shadcn-ui, recharts. Full spec: apps/web/docs/FRONTEND.md.

## Backend work (apps/api)

apps/api/AGENTS.md (once it exists) — same pattern as above.
