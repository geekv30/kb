# CLAUDE.md

This is the root context file. **At the start of every session, read all companion files before doing anything:**

```
Read: plan.md       → build phases, tech stack, component inventory
Read: design.md     → design tokens, Figma references, per-component specs
Read: logs.md       → current status, what's done, what's next
```

---

## ACTIVE PROJECT: Hiver KB Component Library

Build a **pixel-perfect, 1:1 component library** for Hiver's KB product (`app.hiverkb.com`), distributed as the npm package `@test-kb-ui/kb-ui`.

**Problem statement in full:** designers, PMs, and engineers should be able to build any new KB feature from a PRD alone — zero bespoke Figma effort, 100% visual cohesion with the product.

---

## Mandatory Rules

### 1. Pixel-perfect

Every component must match Figma **exactly**: padding, spacing, border-radius, typography, color tokens, shadows, interaction states. Extract all values from Figma before writing a single line of CSS. See `design.md` for extracted specs and screen node IDs.

### 2. Use the ui-engineer agent for all coding

**Every coding task must go through the `ui-engineer` agent** (`agents/ui-engineer.md`). Do not write production component code in the main Claude session. Dispatch to `ui-engineer`, review the output.

### 3. Build order

Follow the phases in `plan.md` exactly. Do not skip phases. Do not reorder. Atoms before molecules before organisms.

### 4. Figma first

Before building any component, always fetch the relevant Figma screen via `get_design_context` + `get_screenshot`. Unique screen node IDs are in `design.md`.

### 5. Storybook must still work at the end of every PR

The user keeps Storybook open. There's **no in-flight scope limit** on what files Phase 8 (publish) or Phase 9 (MCP) work can edit — any file in the repo is fair game. The rule is end-state: every issue's PR must leave Storybook bootable. Add a Storybook smoke-boot to the per-issue verification gate alongside the existing tsc / build / harness checks — cheapest version is `npm run --workspace=packages/kb-ui build-storybook` (catches every story compile error). If a regression surfaces, fix it in the same PR; no flag-for-later deferrals.

---

## Repository Purpose (secondary)

This repo also stores reusable Claude Code agent definitions in `agents/`. Agent files use YAML frontmatter:

```markdown
---
name: agent-name
description: One-line description — used by Claude to decide when to invoke
tools: Read, Grep, Glob, Bash, Edit, Write, WebSearch, WebFetch
model: opus | sonnet | haiku
permissionMode: bypassPermissions | default
skills:
  - skill-name
  - namespace:skill-name
---
```

Key fields: `description` (critical for routing), `model` (opus=complex, sonnet=balanced, haiku=fast), `skills` (use `namespace:skill-name` format).