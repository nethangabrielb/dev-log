---
name: devlog-forms-pattern
description: Use when building a form for Projects, Articles, Snippets, or Auth. Do NOT use for Sessions — sessions use a start/stop timer, not a form (see devlog-sessions-model).
compatibility: opencode
---

# DevLog Forms

React Hook Form + Zod applies to Projects, Articles, Snippets, and Auth
(login/register) only.

Sessions are the deliberate exception — no form exists for creating a session.
See devlog-sessions-model for the start/stop timer pattern instead. If you're
about to write a SessionForm component, stop — it was already removed once.

## Schema location

Zod schemas live in src/features/<resource>/schemas/<resource>.schema.ts and
must mirror the backend DTO field-for-field. Never invent a field the DTO
doesn't have (this bit Sessions once — title/notes don't exist on that DTO).

## Standard pattern

Use the react-hook-form-zod skill for the useForm/zodResolver mechanics.
DevLog-specific: submit buttons use var(--devlog-accent) flat fill, no
gradient/shadow (see devlog-design-tokens). Forms for create-flows open in a
shadcn Sheet from the right; edit-flows use a Dialog.

Full reference: apps/web/docs/FRONTEND.md, "Form Pattern" section.
