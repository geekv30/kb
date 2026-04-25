# logs.md — Progress Log

## Current Status

**Phase 6 complete. Ready for Phase 7 (Analytics) / Phase 8 (Package + Ship) / Phase 9 (MCP).**

Phases 1–6 done. Phase 6 shipped the **AI Gaps / AI Optimise surface** — the most business-critical piece of the KB revamp per user. Built atomically through 3 parallel ui-engineer dispatches (hub atoms + right-rail cards + sources sheet) followed by 2 sequential dispatches (hub page pattern + static frames + interactive state machine). Canonical spec at `design/ai-gaps.md`. All 9 new stories pixel-verified against Figma `9aGp5t9fH1d0PXi4LMhOdb` nodes. Typecheck + tsup build clean.

## Progress Log

| Date | Phase | Status | Notes |
|---|---|---|---|
| 2026-04-16 | Planning | ✅ Done | Figma explored, tokens extracted, 40+ components inventoried, plan written |
| 2026-04-16 | Phase 0 | ✅ Done | `packages/kb-ui/` scaffolded: tsup builds clean, tsc passes, Storybook 8 wired |
| 2026-04-17 | Figma study | ✅ Done | Screen 1 (category) + Screen 2 (editor) fully analyzed, all atoms documented in design.md |
| 2026-04-17 | Phase 1 | ✅ Done | `@theme` wired in tokens.css, `tokens.ts` exported, tailwind.config.ts slimmed to v4, build + tsc clean |
| 2026-04-17 | Phase 2a | ✅ Done | Button, Badge, Avatar, TextInput, Dropdown, Divider built — ~90% fidelity, polish items logged |
| 2026-04-18 | Phase 2b | ✅ Done | Badge fixes + SideNavRail, FileExplorerNav, Breadcrumb, Tables, PageHeader all built via ui-engineer, tsc clean, Playwright structural capture done |
| 2026-04-18 | Phase 2c | ✅ Done | FileExplorerNav rebuilt from correct Figma source (206:6837), 340px/36px rows, depth-based indentation (0/20/44/68px), articles at any depth, active-sub logic. lucide-react → @remixicon/react across all components. tsc + build clean. |
| 2026-04-18 | Phase 3 | ✅ Done | AppShell (rail+explorer+content layout) + KBBreadcrumbBar (category+editor variants, collapse/save/publish/close) — tsc + build clean |
| 2026-04-18 | Phase 4 | ✅ Done | ArticlesTable added to KBCategoryPage story (4 rows, Published/Draft badges, author avatars AK/MR/TS, dates). Full page Playwright-verified. tsc + build clean. |
| 2026-04-18 | Pixel polish | ✅ Done | 9-pass Figma diff against 1958:33209. All layout dimensions corrected (see fixes below). Playwright-verified v9. |
| 2026-04-20 | Component-wide audit | ✅ Done | Per-component Figma-vs-Storybook audit for all 8 components (Button/Avatar/Badge/Breadcrumb/SideNavRail/FileExplorerNav/PageHeader/Table). 70 🔴 + 52 🟡 + 133 🟢 findings documented in `design/_diff-report.md`. |
| 2026-04-20 | Pixel fixes — isolated components | ✅ Done | Button (3 fixes), Avatar (4), Badge (5), PageHeader (8 incl. new 44×44 icon tile), Table (8 incl. `<div>` → `<table>` semantic rewrite). All 🔴 resolved. |
| 2026-04-20 | Shell trio + invariants | ✅ Done | `SideNavRail` + `FileExplorerNav` + `KBBreadcrumbBar` fixed together against new `design/_layout-invariants.md` contract. 18/18 cross-component invariants pass at 1280 viewport. |
| 2026-04-20 | Precision round 2 | ✅ Done | Rail 24→16 icons, breadcrumb chevron→`/`, content column `#f5f5f5`→`#ffffff`, PageHeader icon tile aligned with card left edge. |
| 2026-04-20 | Phosphor experiment | 🔁 Reverted | Tried Phosphor icons for visual consistency; reverted to `@remixicon/react` per user preference. AI sparkle icon kept as `AiIcon.tsx` custom gradient SVG. CompanyLogo.svg integrated as rail brand. |
| 2026-04-21 | Storybook structure | ✅ Done | Custom theme (`.storybook/theme.ts` + `manager.ts`) with Hiver branding. Welcome page (`src/stories/Welcome.stories.tsx`, plain React due to Storybook 10 MDX bug). Sidebar hierarchy: Getting Started / Foundations / Components (Primitives/Navigation/Content/Shell) / Patterns. 16 stories retitled. |
| 2026-04-21 | Foundations story | ✅ Done | Single visual reference at `Foundations/Overview` with typography, text/bg/border/icon colors, icon catalog, icon-size ramp, spacing scale, radius scale. |
| 2026-04-21 | Variant coverage | ✅ Done | Button disabled states (3), Breadcrumb levels (3), FileExplorerNav default — added after Figma variant audit. 7 new variant stories. |
| 2026-04-21 | Phase 5 — ContentEditor | ✅ Done | Tiptap 3 + StarterKit + Link/Image/CodeBlockLowlight/Table/Highlight/Placeholder/Underline. 14-button floating toolbar via `BubbleMenu` on selection. Removed `FloatingMenu` in favor of slash command `/`. Notion-style slash menu (10 commands, auto-filter, floating-ui positioning at caret). All formatting: H1-3, lists, links, inline/block code, tables, blockquote, HR, AI highlight strips. |
| 2026-04-21 | Phase 5 — ArticleSettingsPanel | ✅ Done | 452px collapsible panel with 8 fields (Author, Category, Slug, Tags, Publish date, SEO title, Visibility, Reviewers). Reuses Avatar primitive. Tag chip with `×`, reviewer avatar stack with `+ Add`. |
| 2026-04-21 | Phase 5 — KBEditorPage | ✅ Done | `Patterns/KB Editor Page` composition matching Figma `53:8464` (collapsed shell variant). `AppShell.sidebarCollapsed` prop added — unmounts rail+explorer, content spans full viewport. Breadcrumb icon swaps side-panel→home. Editor flush-left, settings flush-right via `justify-between`. Publish button = primary black variant. Slug maxLength 32. |
| 2026-04-21 | Phase 6 planning | ✅ Done | 7 Figma nodes fetched (74:8794 / 74:8871 / 74:8927 / 74:8928 / 74:9431 / 76:12567 / 74:10788). `ai-suggestions-flow.md` audited vs Figma — 3 gaps found and amended (rail vs sub-rail distinction in Frame 1, HR divider in hub cards, dismissed chip confirmed). Advisor-validated plan, split into 5 ui-engineer dispatches. Tasks P6.1–P6.7. |
| 2026-04-21 | Phase 6 — hub atoms | ✅ Done | **P6.1 (parallel)** — `AISubNav` (288 px, `kind: section\|item`, section renders divider below, item renders pill on active) + `SuggestionCard` (hub card: icon + title / description / HR / meta row with kind chip · N conversations · IMPACT caption). Single pink `#D92FFF` across all glyphs. DOM-verified: 287.99 px / row 44 / active pill `#f1f5f9`. |
| 2026-04-21 | Phase 6 — right-rail cards | ✅ Done | **P6.3 (parallel)** — `ai-suggestion-types.ts` shared types + `AISuggestionsCard` (pre-review + terminal modes) + `AIGapSuggestionCard` (active + accepted + dismissed states, chip collapsed form) + `SuggestionBlock` (addition green / replace red+green split / removal red wash — emits `id` for scrollIntoView). 10 new stories. |
| 2026-04-21 | Phase 6 — sources sheet | ✅ Done | **P6.4 (parallel)** — `SourcesSideSheet` in new `overlays/` subfolder. Radix Dialog with Portal + Overlay + Content + Title (VisuallyHidden for a11y). 400 px width, fixed right, `bg-black/85` backdrop, header + count pill + close, body = conversation cards with mail icon / sender / timestamp / subject / snippet. Default + Interactive stories. |
| 2026-04-21 | Phase 6 — hub page pattern | ✅ Done | **P6.2** — `Patterns/KB AI Optimise Hub` composing AppShell + dark SideNavRail (ai active) + AISubNav (ai-optimise active) + KBBreadcrumbBar category + page header + 3 SuggestionCards. List uses `mask-image: linear-gradient(..., calc(100% - 120px), transparent)` for scroll-fade. Invariants: rail=54, sub-nav=288, content-column left=342. |
| 2026-04-21 | Phase 6 — static frame stories | ✅ Done | **P6.5a** — `ArticleBody` component (per-suggestion `decisions` prop → renders SuggestionBlock for inactive/active, applies or reverts content for accepted/dismissed per type) + 6 static frame stories (Frame 2 pre-review, 3 active-addition, 5 accepted-addition, 6 active-replace, 8 active-removal, 10 terminal). `KBBreadcrumbBar` gained optional `publishDisabled` prop (backward compatible, regression-verified). |
| 2026-04-21 | Phase 6 — interactive pattern | ✅ Done | **P6.5b** — `useAIGapsReducer` hook (9 action types: review/accept/reject/undo/prev/next/setActive/openSources/closeSources/reset) + Interactive story. `scrollIntoView` targets `<main>` scroll container via `document.getElementById(id)`. Sources sheet wired. Keyboard J/K/Y/N/Esc behind `enableKeyboard` (default true). 15 Playwright screenshots covering every state transition, DOM assertions on publish toggle + scroll position + dismissed chip visibility. |
| 2026-04-21 | Phase 6 — docs | ✅ Done | **P6.7** — `design/ai-gaps.md` created (canonical spec with node IDs / types / state machine / keyboard / stories / open items). `design.md` updated with Phase 6 pointer. `ai-suggestions-flow.md` amended with 3 Figma-verified gaps. |

## What's Done

- [x] Notion doc read + problem statement locked
- [x] Tech stack decided (React 18 + TS strict + Tailwind v4 + Radix + tsup + Storybook 8)
- [x] Distribution decided: npm package `@hiver/kb-ui` → MCP companion (Phase 9, after npm ships)
- [x] Figma explored: KB revamp, KB gaps, analytics — all 3 crucial pages
- [x] Design tokens extracted (colors, type scale, spacing, shadows, radii)
- [x] 40+ components inventoried across 9 build phases
- [x] Master plan written at `.claude/plans/reflective-skipping-manatee.md`
- [x] **Phase 0:** `packages/kb-ui/` scaffolded, tsup + tsc + Storybook 8 all clean
- [x] Screen 1 (category view) + Screen 2 (editor view) analyzed — atoms documented in design.md
- [x] **Phase 1:** `@theme` wired, `tokens.ts` exported, build clean
- [x] **Phase 2a:** Button (4 variants), Badge (published/draft), Avatar (status dot), TextInput (prefix/suffix/charCount), Dropdown, Divider — built and rendering in Storybook
- [x] Playwright gap analysis run — 3 polish items identified, all documented
- [x] Library-check Figma file (`9aGp5t9fH1d0PXi4LMhOdb`) explored — screenshots captured for all 8 nodes
- [x] **Phase 2b primitive fixes** — Badge draft/neutral borders + Badge published green dot (no icon needed)
- [x] **Phase 2b new components** — SideNavRail (dark+light), FileExplorerNav (dark+light), Breadcrumb, SubCategoriesTable, ArticlesTable, PageHeader — all built via ui-engineer agent, tsc strict passes clean
- [x] Barrel exports updated — `nav/` and `content/` modules wired into `src/index.ts`
- [x] **Phase 2b Playwright structural verification** — all 5 component stories captured in Storybook; structural layout matches documented specs
- [x] **Pixel polish pass** — 9-pass Figma diff fixes applied (see below)

## Pixel Polish Pass — Fixes Applied (2026-04-18)

All fixes should be dispatched via ui-engineer. The following were applied this session:

| Component | Fix | File |
|---|---|---|
| `KBCategoryPage` story | SideNavRail `theme="dark"` → `theme="light"` | `src/pages/KBCategoryPage.stories.tsx` |
| `KBCategoryPage` story | HiverLogo bg `#fff` → `#2d2d2d` (Figma spec: `background/accents/gray/strong`) | `src/pages/KBCategoryPage.stories.tsx` |
| `FileExplorerNav` | Header height `h-12` (48px) → `h-[54px]` to align with KBBreadcrumbBar | `src/components/nav/FileExplorerNav.tsx` |
| `FileExplorerNav` | Width `w-[340px]` → `w-[288px]` (Figma 1958:33209 measures 288px in context; content = 938px) | `src/components/nav/FileExplorerNav.tsx` |
| `FileExplorerNav` | `FolderRow` + `ArticleRow` `w-[340px]` → `w-full` (overflow bug introduced by width change) | `src/components/nav/FileExplorerNav.tsx` |
| `AppShell` | Added `border-r border-[#e2e8f0]` to rail wrapper div (vertical divider between rail and explorer) | `src/components/shell/AppShell.tsx` |
| `SubCategoriesTable` | Header row: added `bg-[#f8fafc] -mx-6 px-6 rounded-t-[12px]` (gray header per Figma) | `src/components/content/SubCategoriesTable.tsx` |
| `ArticlesTable` | Header row: added `bg-[#f8fafc] -mx-6 px-6 rounded-t-[12px]` (gray header, consistent with SubCategoriesTable) | `src/components/content/ArticlesTable.tsx` |

## Spec Corrections (from 1958:33209 Figma audit)

| Spec | Old value | Corrected value | Source |
|---|---|---|---|
| FileExplorerNav width | 340px (from standalone component frame 206:6837) | **288px** (from page context 1958:33209) | Figma JSON `w-[288px]` |
| Content area width | ~886px | **938px** (1280 - 54 - 288) | Derived |
| FileExplorerNav header height | 48px | **54px** (matches KBBreadcrumbBar) | Figma node 1958:33371 `h-[54px]` |
| SideNavRail theme in page | dark | **light** | Figma active-state `rgba(230,230,230,0.44)` |
| Logo bg color | #0f172a | **#2d2d2d** | Figma `background/accents/gray/strong` |

## What's Next

- [x] Phase 5: Article Editor — done 2026-04-21
- [x] Phase 6: KB Gaps / AI Optimise — done 2026-04-21
- [ ] Phase 7: Analytics (StatCard, LineChart, ConversationLogsTable, Dashboard)
- [ ] Phase 8: npm package + Storybook ship (barrel audit, tsup build, publish)
- [ ] Phase 9: MCP companion server

## Open items

**Phase 5 carryover:**
- `Save as draft` text color `#475569` (spec calls for `#94a3b8`).
- `Last updated N months ago` subtitle on Editor Page renders as body text (Tiptap strips inline styles) — needs a dedicated subtitle slot in `ContentEditor` if styling is required.
- AI icon in rail currently a faithful gradient sparkle from Figma; if the actual product ships a different glyph, swap `AiIcon.tsx`.
- Phosphor icon set was rejected; `@remixicon/react` is canonical.

**Phase 6 open product decisions** (all documented in `design/ai-gaps.md` §Open items):
- Navigation onto decided suggestions — no "focused chip" visual yet.
- Keyboard `y`/`n` on decided active overwrites decision — guard if product wants no-op.
- Terminal mode shows all 3 chips below Suggestions card (flow-doc says undo must remain available; Figma frame 10 hides them).
- `Avatar` primitive styled for light bg; reads low-contrast on dark rail — add `variant="dark"` in polish pass.
- Hub card click logs to console — wire to real article navigation in production.

**Phase 6 housekeeping:**
- ~70 Playwright verification PNG screenshots from ui-engineer dispatches are sitting at repo root + packages/kb-ui/. Safe to delete or move to a scratch dir.

## Key docs

- `design.md` — root tokens + spec summary + Foundations story pointer
- `design/_layout-invariants.md` — shell-grid cross-component contract
- `design/_tokens.md` — live Figma token tables
- `design/_diff-report.md` — full audit + fix log (all sessions)
- `design/editor.md` — ContentEditor decisions + slash menu UX
- `design/article-settings-panel.md` — Settings panel spec
- `design/ai-gaps.md` — **Phase 6 canonical spec** (AI Optimise hub + AI review pattern + sources sheet + state machine)
- `ai-suggestions-flow.md` (repo root) — 10-frame narrative spec of the AI review loop
- Per-component specs in `design/` (one file each)
