---
name: devlog-sessions-model
description: Use when creating, editing, or reading Session-related code (start/stop timer, SessionCard, todos checklist). Covers the exact CreateSessionDto shape and the no-title/no-notes constraint.
compatibility: opencode
---

# DevLog Session Data Model

Sessions have NO title and NO notes field on the backend. Do not invent one.

CreateSessionDto (apps/api/src/sessions/dto/create-session.dto.ts):

- type: SessionType (enum VALUE like "Project", not the key "PROJECT")
- durationInSeconds: number — NOT derived server-side, compute
  (endedAt - startedAt) client-side and send explicitly
- startedAt: Date, endedAt: Date — both required
- todos?: { name: string; completed: boolean }[]
- linkedTo?: { kind: LinkedToKind; id: string }

Sessions are created only via start/stop timer (ActiveSessionContext), never
a manual form. Todos are editable only before/during an active session — once
POSTed, SessionCard renders them read-only, no edit controls.

Full reference: apps/web/docs/FRONTEND.md, "Sessions /sessions" section.
