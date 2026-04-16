# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## ACTIVE PROJECT: Hiver KB Component Library

**NEVER lose sight of this problem statement.**

### What we are building
A **pixel-perfect, 1:1 component library** for Hiver's redesigned Knowledge Base product (`app.hiverkb.com`). The library must be distributable as an **npm package** so any designer, PM, or engineer can build new KB features using just a PRD — with zero bespoke Figma effort and 100% visual/functional cohesion with the product.

### Tech Stack (chosen — do not deviate)
| Layer | Choice | Reason |
|---|---|---|
| Framework | **React 18 + TypeScript (strict)** | Industry standard, tree-shakeable, typed props = self-documenting components |
| Styling | **Tailwind CSS v4 + CSS custom properties (design tokens)** | Utility-first, token-driven, zero runtime overhead |
| Component base | **Radix UI primitives** | Accessible, unstyled — we own the visual layer 100% |
| Design tokens | **Style Dictionary** | Single source of truth; generates CSS vars, JS tokens, Tailwind config from one JSON |
| Build | **tsup** | Zero-config, fast, ESM + CJS dual output |
| Storybook | **Storybook 8** | Component playground, visual regression baseline |
| Distribution | **npm package** | Consumed via `import { KBSidebar } from '@hiver/kb-ui'` |

### Figma Source (always reference before building any component)
File: `https://www.figma.com/design/251DTRmxl2L6jmXd3FWzHe/kb-gaps`

| Section | Node ID | Priority |
|---|---|---|
| KB revamp (core layout + navigation) | `1952-10869` | CRUCIAL |
| KB gaps (AI feature) | `1958-32263` | CRUCIAL |
| KB analytics dashboard | `1952-10867` | CRUCIAL |
| Login revamp | `1952-10870` | Secondary |
| KB creation flow (from main Hiver app) | `1952-10868` | Secondary |

### Pixel-perfect rule
Every component must match the Figma design **exactly**: same padding, spacing, border-radius, typography scale, color tokens, shadow, and interaction states. No approximations. Extract all values from Figma before writing a single line of CSS.

### Key components identified (from redesign)
- Left sidebar (collapsible, file-explorer style)
- File-explorer navigation tree
- Rich breadcrumb bar
- KB home page (category cards grid)
- Category / sub-category views
- Article list view
- Article read view
- Article edit view (rich text editor)
- KB Gaps panel (AI suggestion cards)
- KB Analytics dashboard (charts, tables)

### Distribution — DECIDED
**Phase 1: npm package `@hiver/kb-ui`** — the primary artifact. Engineers consume it via `import { KBSidebar } from '@hiver/kb-ui'`. Versioned, tree-shakeable, typed.
**Phase 2: MCP companion (later)** — a thin MCP server that exposes the component library's specs/docs to Claude, enabling any PM to describe a feature in plain English and get correct `@hiver/kb-ui` code back. This is what makes the "no Figma effort" goal truly work.
Do NOT flip this order. Ship the npm package first.

### Design Tokens (hardcoded in Figma — no variables)
```
--color-canvas:        #f5f5f5    --color-surface:       #ffffff
--color-surface-subtle:#f8fafc    --color-surface-muted: #f1f5f9
--color-surface-tab:   #f1f2f4    --color-brand-bar:     #e6effd
--color-nav-rail:      #e2e8f0    --color-text-primary:  #0f172a
--color-text-secondary:#334155    --color-text-meta:     #475569
--color-text-muted:    #64748b    --color-success-text:  #086e3f
--color-btn-primary:   #000000    --color-btn-danger-bg: #feeeec
--color-border:        #f1f5f9

Typography: all Inter — Semi Bold 16/24, Medium 14/20, Regular 14/20, Medium 12/18
Layout: 1280px canvas · 54px rail · 288px tree nav · 938px content · 85px chrome
Spacing: card 24/22 pad · r:12 cards · r:6 buttons · r:999 pills · 28px icon buttons
```

### Build Phases (DO NOT SKIP, DO NOT REORDER)
```
Phase 0 → Repo scaffold    (tsup, Tailwind v4, Storybook 8, tsconfig)
Phase 1 → Token system     (src/tokens.css CSS vars + Tailwind config)
Phase 2 → Primitives       (Button, Badge, Avatar, Dropdown, Input, Divider)
Phase 3 → Shell + Nav      (AppShell, SideNavRail, FileExplorerNav, Breadcrumb)
Phase 4 → KB Content       (CategoryHeader, SubCategoriesList, ArticlesTable)
Phase 5 → Article Editor   (ContentEditor, ArticleSettingsPanel, EditorTopBar)
Phase 6 → KB Gaps          (SuggestionCard × 9 variants, KBGapsPanel, Modal)
Phase 7 → Analytics        (StatCard, LineChart, ConversationLogsTable, Dashboard)
Phase 8 → Package + Ship   (barrel export, Storybook stories, tsup build)
```

### Component Inventory (40+ components across 8 phases)
Shell: `AppShell` `KBTopBar` `KBBrandBar` `Breadcrumb`
Nav: `SideNavRail` `FileExplorerNav` `NavTreeItem` `NavTreeSection`
Content: `CategoryHeader` `SubCategoriesList` `ArticlesTable` `ArticleStatusBadge` `ArticleRow`
Editor: `ArticleEditor` `ContentEditor` `ArticleSettingsPanel` `EditorTopBar`
Gaps: `SuggestionCard` `SuggestionBadge` `SuggestionCardActions` `SuggestionsList` `KBGapsPanel` `SuggestionModal`
Analytics: `StatCard` `StatCardGrid` `AnalyticsLineChart` `ConversationLogsTable` `CitedArticlesTable` `AnalyticsSideNav` `AnalyticsDashboard`
Primitives: `Button` `Badge` `Avatar` `Dropdown` `TextInput` `Divider` `SearchBar`

### Coding rule — MANDATORY
**For every coding task in this project, use the `ui-engineer` agent** (`agents/ui-engineer.md`). Do not write production code directly in the main Claude session. Dispatch to `ui-engineer` and review the output.

---

## Progress Log

| Date | Phase | Status | Notes |
|---|---|---|---|
| 2026-04-16 | Planning | ✅ Done | Figma explored, tokens extracted, 40+ components inventoried, plan written |

## Current Status
**Next up: Phase 1 — Token System**
`src/tokens.css` exists with all CSS vars. Next: wire Tailwind v4 `@theme` and export `tokens.ts` JS object.

## What's Done
- [x] Notion doc read + problem statement locked
- [x] Tech stack decided (React 18 + TS strict + Tailwind v4 + Radix + tsup + Storybook 8)
- [x] Distribution decided: npm package `@hiver/kb-ui` → MCP companion (Phase 9, after npm ships)
- [x] Figma explored: KB revamp, KB gaps, analytics — all 3 crucial pages
- [x] Design tokens extracted (14 colors, full type scale, all spacing values)
- [x] 40+ components inventoried across 9 build phases
- [x] Master plan written at `.claude/plans/reflective-skipping-manatee.md`
- [x] **Phase 0 complete** — `packages/kb-ui/` scaffolded: tsup builds clean, tsc passes, Storybook 8 wired

## What's Next
- [ ] Phase 1: Token system (tokens.ts JS export + Tailwind @theme wiring)
- [ ] Phase 2: Primitives
- [ ] Phase 2: Primitives
- [ ] Phase 3: Shell + Nav
- [ ] Phase 4: KB Content
- [ ] Phase 5: Article Editor
- [ ] Phase 6: KB Gaps
- [ ] Phase 7: Analytics
- [ ] Phase 8: npm package + Storybook
- [ ] Phase 9: MCP companion

---

## Repository Purpose

This is a knowledge base (`kb`) for Claude Code agent definitions. It stores reusable agent configuration files (`.md` with YAML frontmatter) that define specialized agents for use across projects.

## Agent File Format

Agent files live in `agents/` and follow this structure:

```markdown
---
name: agent-name
description: One-line description — used by Claude to decide when to invoke this agent
tools: Read, Grep, Glob, Bash, Edit, Write, WebSearch, WebFetch
model: opus | sonnet | haiku
permissionMode: bypassPermissions | default
memory: project | user | none
skills:
  - skill-name
  - namespace:skill-name
---

# Agent Title
...persona and instructions...
```

## Key Fields

| Field | Purpose |
|---|---|
| `name` | Unique identifier for the agent |
| `description` | Critical — Claude uses this to match agents to tasks |
| `tools` | Comma-separated list of allowed tools |
| `model` | `opus` for complex reasoning, `sonnet` for balanced, `haiku` for fast |
| `permissionMode` | `bypassPermissions` skips tool approval prompts |
| `skills` | Axiom or superpowers skills to load into agent context |

## Conventions

- Agent descriptions should be action-oriented and specific about when to invoke
- Skills use `namespace:skill-name` format for non-default namespaces (e.g., `figma:implement-design`)
- Technology stack and principles belong in the agent body, not the frontmatter
