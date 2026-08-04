---
name: devlog-api-query-pattern
description: Use when creating or editing API modules, TanStack Query hooks, or the Axios client. Covers DevLog's per-resource module convention, the query key factory, and the hook-wraps-query rule.
compatibility: opencode
---

# DevLog API + Query Conventions

## Axios client

Single shared instance at src/api/client.ts. withCredentials: true (auth is
httpOnly cookie). 401 responses redirect to /login via response interceptor.
Never instantiate axios directly anywhere else.

## Per-resource API modules

One file per resource in src/api/<resource>.api.ts. Plain exported async
functions, no classes, no singletons beyond the shared client:

```ts
export const sessionsApi = {
  findAll: (filters?: X) =>
    client.get("/sessions", { params: filters }).then((r) => r.data),
  create: (dto: Y) => client.post("/sessions", dto).then((r) => r.data),
  // ...
};
```

## Query key factory

All query keys go through src/lib/queryKeys.ts — a single object, one entry
per resource. Never write a raw array key inline in a hook or component:

```ts
export const keys = {
  sessions: {
    all: (filters?: object) => ["sessions", filters ?? {}] as const,
    stats: () => ["sessions", "stats"] as const,
  },
};
```

## Hook-wraps-query rule

Pages and components never call useQuery/useMutation directly. Every query is
wrapped in a feature-scoped hook in src/features/<name>/hooks/:

```ts
export function useSessions(filters?: Filters) {
  return useQuery({
    queryKey: keys.sessions.all(filters),
    queryFn: () => sessionsApi.findAll(filters),
  });
}
```

## Invalidation

Mutations invalidate the ENTIRE resource key family, not just the specific
query — e.g. creating a session invalidates ['sessions'] broadly (list, stats,
streaks all go stale together), plus ['dashboard'] since it reads session stats.

Full reference: apps/web/docs/FRONTEND.md, "API Layer" and "TanStack Query Patterns".
