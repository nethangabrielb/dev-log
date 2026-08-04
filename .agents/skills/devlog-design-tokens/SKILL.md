---
name: devlog-design-tokens
description: Use when writing any styled component, page, or CSS. Covers the --devlog-* color tokens and rules against Tailwind default colors.
compatibility: opencode
---

# DevLog Design Tokens

All DevLog tokens are prefixed --devlog-\* to avoid colliding with shadcn's own
:root/.dark variables (--accent, --border, --background, etc. are shadcn's —
never reuse those names for DevLog styling).

Accent is terminal amber, not violet: var(--devlog-accent) = #c9762f.
Accent-fg is dark text ON the accent (#0d0d0f), not white.

Never use Tailwind color utility classes (bg-orange-500, text-purple-600, etc.)
for DevLog-branded elements. Buttons: flat fill, no gradient, no glossy shadow.
Focus rings: var(--devlog-accent) at low opacity, not full glow.

Full token list: apps/web/docs/FRONTEND.md, "Design System" section.
