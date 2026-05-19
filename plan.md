# plan.md — Build Plan & Architecture

## Tech Stack (chosen — do not deviate)

| Layer | Choice | Reason |
|---|---|---|
| Framework | **React 18 + TypeScript (strict)** | Industry standard, tree-shakeable, typed props = self-documenting components |
| Styling | **Tailwind CSS v4 + CSS custom properties (design tokens)** | Utility-first, token-driven, zero runtime overhead |
| Component base | **Radix UI primitives** | Accessible, unstyled — we own the visual layer 100% |
| Design tokens | **Style Dictionary** | Single source of truth; generates CSS vars, JS tokens, Tailwind config from one JSON |
| Build | **tsup** | Zero-config, fast, ESM + CJS dual output |
| Storybook | **Storybook 10** | Component playground, visual regression baseline |
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
| 6 | AI Gaps / AI Optimise (AISubNav, SuggestionCard, AISuggestionsCard, AIGapSuggestionCard, SuggestionBlock, ArticleBody, SourcesSideSheet, KB AI Optimise Hub pattern, KB AI Gaps Experience pattern) | ✅ Done 2026-04-21 |
| 7 | Analytics (StatCard/Grid, DateRangePill, AnalyticsAreaChart/DonutChart/ChartCard, AnalyticsSideNav, ArticlesNeedsAttentionTable, ArticlePerformanceTable, SearchKeywordsTable, ContentGapsTable, AIConversationLogsCard/Entry, MostCitedArticlesTable, HelpfulnessTag, Card primitive + 3 page patterns) | ✅ Done 2026-04-25 |
| 7.5 | Demo app (apps/demo) — full Journey A/B/C harness consuming @hiver/kb-ui via workspace | ✅ Done 2026-04-26 |
| 8 | Package + Ship — `@test-kb-ui/kb-ui` v1.0.0 published to npm | ✅ Done 2026-04-29 |
| 9 | MCP companion server — `@test-kb-ui/kb-mcp` v1.0.0 published to npm | ✅ Done 2026-04-29 |
| 11 | kb-mcp product-context surface (`kb://product/overview` + `get_product_context`) | ✅ Done 2026-04-29 |
| 13 | Extensibility refactor across all 36 components — composition APIs (slots / items[] / sections[] / render-props / registries). Breaking: `KBBreadcrumbBar.actions` slot. v2.0.0. | ✅ Done 2026-04-30 |
| 14 | Storybook polish — every story is an interactive `Playground` with realistic data; live at `https://main--69f2245c14966163bdac61ca.chromatic.com/` | ✅ Done 2026-04-30 |
| 16 | Category authoring entry points — `Textarea` primitive + `NewCategoryModal` pattern (create / edit modes per Figma 1958:34896); `Modal` extended with `radius` / `bodyPadding` / `footerLayout` props (backward-compat); `FileExplorerNav.renderRowAction` slot; demo wiring: PageHeader "+ New" Folder/Article dropdown + per-row hover 3-dot menu w/ Edit option; route-fade flicker fix; demo-only template-gallery empty state | ✅ Done 2026-05-14 |
| 17 | **ArticleSettingsPanel SEO tab** — General trim (3 fields: Author/Category/Slug, no chevron); new SEO tab w/ Meta title + length verdict meter (Short/Acceptable/Optimal/Long/HardCap), Description + Refine-with-AI affordance (subtle Button pill) + content-aware Skeleton shimmer + AI quality bump, URL field + copy-icon-swap (copy→check, no toast), collapsible canonical override disclosure, Exclude-from-search Switch + `noindex`/`nofollow` CodeChips, live Google SERP preview with stable-mount crossfade to "no preview available" when excluded. New kb-ui primitives: `Tabs` · `Switch` · `Skeleton` · `CodeChip`. New content components: `MetaLengthMeter` · `SerpPreview` · `SeoTabBody`. Existing primitives extended: `TextInput.error`, `Textarea.refining/refineSlot/field-sizing`, `Modal` reduced-motion fallback, `CompanyLogo.bgColor`. Global labels normalized to 13px medium. PRs #108-#121 (12 PRs, ~2.5k LOC). Figma nodes 2945-7756 / 2949-7844 / 2949-8306 / 2949-9407 / 2949-8067. | ✅ Done 2026-05-19 |

**Phase 7.5 (demo app)** was added as an integration-test surface between component completion and npm publish. The contract lives in [`demo-app-prd.md`](./demo-app-prd.md) (PRD — user journeys, edge cases, acceptance criteria) and [`demo-app-trd.md`](./demo-app-trd.md) (TRD — file structure, routing, state, component composition, dispatch breakdown). The result is a Vite + React 18 SPA at `apps/demo/` that consumes `@hiver/kb-ui` exactly as an external engineer would (`import { ... } from '@hiver/kb-ui'`), stitched into a navigable product covering the three primary journeys end-to-end against an in-memory mock store. The sign-off harness at `apps/demo/scripts/phase-7-5-9-signoff.mjs` is the canonical journey QA script — it spawns a dev server, walks all three PRD §6 journeys cold, and asserts every step. Phase 8 is unblocked because the demo proves every public export already resolves through the published barrel.

## Phase 6 Task List (Done)

Canonical spec: `design/ai-gaps.md`. Narrative spec: `ai-suggestions-flow.md` (repo root).

### New components (all via ui-engineer)

| Component | File | Figma node |
|---|---|---|
| `AISubNav` | `packages/kb-ui/src/components/nav/AISubNav.tsx` | `74:8871` |
| `SuggestionCard` | `packages/kb-ui/src/components/content/SuggestionCard.tsx` | `74:8927` |
| `AISuggestionsCard` | `packages/kb-ui/src/components/content/AISuggestionsCard.tsx` | `74:9431` (leftmost) |
| `AIGapSuggestionCard` | `packages/kb-ui/src/components/content/AIGapSuggestionCard.tsx` | `74:9431` (grid) |
| `SuggestionBlock` | `packages/kb-ui/src/components/content/SuggestionBlock.tsx` | inline article markup in `74:10788` |
| `ArticleBody` | `packages/kb-ui/src/components/content/ArticleBody.tsx` | `74:10788` (article region) |
| `SourcesSideSheet` | `packages/kb-ui/src/components/overlays/SourcesSideSheet.tsx` | `76:12567` |

### Shell changes

- `KBBreadcrumbBar` gained optional `publishDisabled?: boolean` prop (default `false`, backward compatible).

### New pattern stories

| Story title | File | Figma frame |
|---|---|---|
| `Patterns/AI Optimisation/AI Optimise Hub` | `packages/kb-ui/src/pages/KBAIOptimiseHubPage.stories.tsx` | `74:8928` |
| `Patterns/AI Optimisation/AI Gaps --frame-2-pre-review` | `KBAIGapsExperience.stories.tsx` | `81:17189` |
| `Patterns/AI Optimisation/AI Gaps --frame-3-active-addition` | same | `81:16926` |
| `Patterns/AI Optimisation/AI Gaps --frame-5-accepted-addition` | same | `81:16634` |
| `Patterns/AI Optimisation/AI Gaps --frame-6-active-replace` | same | `81:16342` |
| `Patterns/AI Optimisation/AI Gaps --frame-8-active-removal` | same | `81:15737` |
| `Patterns/AI Optimisation/AI Gaps --frame-10-terminal` | same | `81:14752` |
| `Patterns/AI Optimisation/AI Gaps --interactive` | same | full 10-frame flow (`74:10788`) |

### Pattern-internal utilities (not exported from public API)

- `packages/kb-ui/src/hooks/useAIGapsReducer.ts` — reducer + hook for the interactive pattern.

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
