# syntax=docker/dockerfile:1

# ---------- Builder: full workspace install + compile ----------
FROM node:20-alpine AS builder
WORKDIR /app

ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable && corepack prepare pnpm@10.33.2 --activate

# Resolve all workspace manifests first so a single frozen install covers the whole monorepo
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY packages/types/package.json ./packages/types/package.json
COPY apps/api/package.json ./apps/api/package.json

# Force devDependencies on regardless of build-time NODE_ENV (build needs them)
RUN NODE_ENV=development pnpm install --frozen-lockfile

# Build the shared types package before the API (the API imports its compiled output)
COPY packages/types ./packages/types
RUN pnpm --filter @devlog/types build

# Compile the NestJS app (outputs apps/api/dist/main.js)
COPY apps/api ./apps/api
RUN pnpm --filter api build

# ---------- Runtime: slim image, production-only ----------
FROM node:20-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable && corepack prepare pnpm@10.33.2 --activate

# Install only the API's production dependencies (api + its workspace deps)
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/api/package.json ./apps/api/package.json
COPY packages/types/package.json ./packages/types/package.json
RUN pnpm install --frozen-lockfile --prod --filter api...

# Compiled output only — no frontend, no source, no dev dependencies
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/packages/types/dist ./packages/types/dist

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -T 3 -O - "http://localhost:${PORT:-3000}/health" >/dev/null || exit 1

CMD ["node", "apps/api/dist/main.js"]