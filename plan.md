# plan.md — Build Plan & Architecture

## Tech Stack (chosen — do not deviate)

| Layer | Choice | Reason |
|---|---|---|
| Framework | **React 18 + TypeScript (strict)** | Industry standard, tree-shakeable, typed props = self-documenting components |
| Styling | **Tailwind CSS v4 + CSS custom properties (design tokens)** | Utility-first, token-driven, zero runtime overhead |
| Component base | **Radix UI primitives** | Accessible, unstyled — we own the visual layer 100% |
| Design tokens | **Style Dictionary** | Single source of truth; generates CSS vars, JS tokens, Tailwind config from one JSON |
| Build | **tsup** | Zero-config, fast, ESM + CJS dual output |
| Storybook | **Storybook 8** | Component playground, visual regression baseline |
| Distribution | **npm package** | Consumed via `import { KBSidebar } from '@hiver/kb-ui'` |

## Distribution — DECIDED

**Phase 1: npm package `@hiver/kb-ui`** — the primary artifact. Engineers consume it via `import { KBSidebar } from '@hiver/kb-ui'`. Versioned, tree-shakeable, typed.
**Phase 2: MCP companion (later)** — a thin MCP server that exposes the component library's specs/docs to Claude, enabling any PM to describe a feature in plain English and get correct `@hiver/kb-ui` code back.
Do NOT flip this order. Ship the npm package first.

## Build Phases (DO NOT SKIP, DO NOT REORDER)

| Phase | Scope | Status |
|---|---|---|
| 0 | Repo scaffold (tsup, Tailwind v4, Storybook 8, tsconfig) | ✅ Done |
| 1 | Token system (tokens.css CSS vars + Tailwind @theme + tokens.ts export) | ✅ Done |
| 2a | Primitives — initial pass (Button, Badge, Avatar, TextInput, Dropdown, Divider) | ✅ Done |
| 2b | Primitives — polish + library-check atoms (SideNavRail, FileExplorerNav, Breadcrumb, Table, PageHeader) | ✅ Done (tsc clean, Playwright captured) |
| 2c | Figma pixel-diff — side-by-side audit of all Phase 2 components + consolidated fixes | ✅ Done |
| 3 | Shell + Nav (AppShell, KBBreadcrumbBar) | ✅ Done |
| 4 | KB Content (CategoryHeader, SubCategoriesList, ArticlesTable) | ✅ Done |
| 5 | Article Editor (ContentEditor, ArticleSettingsPanel, KBEditorPage) | ✅ Done 2026-04-21 |
| 6 | KB Gaps (SuggestionCard × 9 variants, KBGapsPanel, Modal) | ⬜ |
| 7 | Analytics (StatCard, LineChart, ConversationLogsTable, Dashboard) | ⬜ |
| 8 | Package + Ship (barrel export, Storybook stories, tsup build) | ⬜ |
| 9 | MCP companion server | ⬜ |

## Phase 2b Task List (Done)

### Primitive Fixes
- [x] **Badge**: Added `border border-[#e2e8f0]` to draft/neutral variants
- [x] **Badge Published**: Built-in green dot (`size-[6px] rounded-full bg-[#22c55e]`), no external icon needed

### New Components (from library-check Figma `9aGp5t9fH1d0PXi4LMhOdb`)
| Component | Figma Node | File | Status |
|---|---|---|---|
| `SideNavRail` | `0:1` | `src/components/nav/SideNavRail.tsx` | ✅ dark + light + active state |
| `FileExplorerNav` | `1:4823` | `src/components/nav/FileExplorerNav.tsx` | ✅ dark + light, expand/collapse |
| `Breadcrumb` | `1:5389` | `src/components/primitives/Breadcrumb.tsx` | ✅ pill-style current item |
| `SubCategoriesTable` + `ArticlesTable` | `1:5178` | `src/components/content/` | ✅ 5 cols, status + avatar |
| `PageHeader` | `1:5452` | `src/components/content/PageHeader.tsx` | ✅ icon + title + New button |

## Phase 2c Task List — ✅ Done
- [x] FileExplorerNav rebuilt from Figma `206:6837` (340px, 36px rows, depth indentation 0/20/44/68px, NavItem unified type, articles at any depth, active-sub logic)
- [x] Icon library switched project-wide: lucide-react → @remixicon/react
- [x] SideNavRail active-state sizing fixed

## Phase 3 Task List (Active) — Shell + Nav

### AppShell
- [ ] Layout wrapper: Rail (54px) + Explorer (340px) + Content (flex-1), `h-screen overflow-hidden`
- [ ] Props: `rail`, `explorer`, `breadcrumb`, `children`

### KBBreadcrumbBar ✅
- [x] `variant="category"`: collapse-sidebar icon + `|` separator + current category name. 54px, white bg.
- [x] `variant="editor"`: collapse icon + path chain + current item (font-medium) + right: Save as draft + Publish (RiSendPlaneLine) + close. 54px.
- [x] Type: `KBBreadcrumbItem` (renamed from `BreadcrumbItem` to avoid collision with Breadcrumb primitive)

## Component Inventory (40+ across 8 phases)

Build in this order — atoms before molecules before organisms.

### Atoms (build first)
`Button` `Badge` `Avatar` `TextInput` `Dropdown` `Divider` `SearchBar` `IconButton` `StatusPill` `Chevron`

### Shell
`AppShell` `KBTopBar` `KBBrandBar` `Breadcrumb`

### Nav
`SideNavRail` `FileExplorerNav` `NavTreeItem` `NavTreeSection`

### Content
`CategoryHeader` `SubCategoriesList` `ArticlesTable` `ArticleStatusBadge` `ArticleRow`

### Editor
`ArticleEditor` `ContentEditor` `ArticleSettingsPanel` `EditorTopBar`

### Gaps
`SuggestionCard` `SuggestionBadge` `SuggestionCardActions` `SuggestionsList` `KBGapsPanel` `SuggestionModal`

### Analytics
`StatCard` `StatCardGrid` `AnalyticsLineChart` `ConversationLogsTable` `CitedArticlesTable` `AnalyticsSideNav` `AnalyticsDashboard`
