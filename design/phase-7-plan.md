# Phase 7 — KB Analytics

## Context

`plan.md` lists Phase 7 (Analytics) as one of three CRUCIAL surfaces in the KB revamp; `design.md` maps it to Figma node `1952:10867` in `251DTRmxl2L6jmXd3FWzHe`. Today the package ships zero analytics components — the surface is unbuilt. Phase 6 (AI Gaps) just shipped + was Figma-rectified, so the codebase is in a good state to add a new surface without disturbing prior work.

The user wants a **detailed, paced build** with a **Figma checkpoint at every step**, because Phase 7 has more discrete components than any prior phase. We'll execute one step at a time, pausing for review between each.

## What's actually in Figma (live inspection — `varun.k@grexit.com` + Hiver Pro Full seat)

The analytics canvas contains **3 distinct page-frames** (not 7 — the duplicates seen in the overview are repeat copies of `analytics-03`):

| Page | Node ID | What it covers |
|---|---|---|
| `analytics-01` — Article Performance | `1974:53692` | Stat row, area chart, donut, attention table, performance table |
| `analytics-02` — Search | `1974:54154` | Two-up small charts (search vol + missed-search rate w/ goal annotation), top-keywords table, content-gaps table with action button |
| `analytics-03` — AI Answer Performance | `1974:53167` | AI stat row, area chart with goal annotation, AI conversation logs card, most-cited articles table |

Shared chrome on every page: **AppShell.rail (54 dark) + AppShell.explorer (288 AnalyticsSideNav, light) + KBBreadcrumbBar.category + page header with date-range pill**.

## Reusable pieces already in the codebase (per Explore agent)

| Need | Reuse | Path |
|---|---|---|
| Card chrome (border-card-border + rounded-12 + bg-white) | New `Card` primitive (extract pattern shared by AISuggestionsCard / SuggestionCard) | new `packages/kb-ui/src/components/primitives/Card.tsx` |
| Side-nav layout pattern | `AISubNav` structure | `packages/kb-ui/src/components/nav/AISubNav.tsx` |
| AppShell `explorer` slot | Already wired | `packages/kb-ui/src/components/shell/AppShell.tsx` |
| Tables — header / body row / divider conventions | `ArticlesTable.tsx`, `SubCategoriesTable.tsx` | `packages/kb-ui/src/components/content/` |
| Charts | `recharts ^2.12.0` already in `package.json` | no new dep needed |
| Tokens — surfaces, text, AI palette | Already in `tokens.css` `@theme` block | `packages/kb-ui/src/tokens.css` |

## Decisions (user-confirmed)

1. **Interaction depth: Light interactivity.** Date-range pill opens a real menu (Last 7/30/90 days). Conversation logs have client-side expand/collapse + sort. Charts have hover tooltips (recharts default). Chart data is hardcoded; no real backend wiring.
2. **Conversation logs split: two pieces.** `AIConversationLogsCard` (shell with header + sort + list) + `AIConversationLogEntry` (one Q+A row).

## Fidelity workflow (mandatory per step)

The kb-ui project's CLAUDE.md says **pixel-perfect, 1:1 component library**. Treat as hard constraint:

1. **Pre-dispatch (me, the orchestrator):**
   - `mcp__plugin_figma_figma__get_screenshot` for the component frame.
   - `mcp__plugin_figma_figma__get_variable_defs` for the same node — captures named tokens (`text/success/default`, `border/blue/default`, `Red/r400`, etc.).
   - `mcp__plugin_figma_figma__get_design_context` when token resolution is incomplete (rare; useful for "what's the named slot for this fill").
   - Brief includes the **exact tokens with hex values** — never "match Figma" ambiguity.

2. **Dispatch (ui-engineer):**
   - Re-fetches the same MCP calls if implementation needs deeper detail.
   - **No "simplified vs Figma" deferrals.** Anything not 1:1 is a regression to fix in-step or before next step starts.

3. **Post-dispatch:**
   - Treat agent-flagged deltas as repair tasks, not "future R-pass" notes.
   - Spot-check via `grep` against the built dist if a token rename/addition.

This was added 2026-04-25 after the user stopped Step 3 to point out Step 1/2 had eyeballed colors (`#22c55e/#ef4444` instead of Figma's `#086e3f/#d52c1f` for trend; donut-not-pie; goal-line dark not blue with pill). All three were repaired before Step 3 resumed.

## Build sequence — 8 steps, paced

Each step is a **single `ui-engineer` dispatch** with Figma node IDs **AND** the relevant `get_variable_defs` table included in the brief. **No Playwright captures** in verification.

### Step 0 — Token additions + `Card` primitive extraction

- New tokens (additive, no existing changes):
  - `--color-trend-up: #22c55e` (alias of ai-addition; semantic clarity for analytics)
  - `--color-trend-down: #ef4444`
  - `--color-trend-neutral: #64748b`
  - `--color-chart-views: #ef4444` (red — Total Views series in Figma)
  - `--color-chart-unique: #3b82f6` (blue — Unique Views series)
  - `--color-chart-positive: #22c55e` (green — Search vol over time, AI deflection)
  - `--color-chart-wash-up: rgba(34,197,94,0.10)` (sparkline area fill)
  - `--color-chart-wash-down: rgba(239,68,68,0.10)`
  - `--color-chart-wash-info: rgba(59,130,246,0.10)`
  - `--color-donut-1`..`--color-donut-5` (Figma palette: extract from `analytics-01` donut)
- Extract a new `Card` primitive (`packages/kb-ui/src/components/primitives/Card.tsx`):
  - Props: `padding?: 'sm' | 'md' | 'lg'` (defaults `md` = `p-6`), `className`, `children`
  - Base class: `rounded-[12px] border border-card-border bg-white`
  - Replaces inline chrome in AISuggestionsCard / SuggestionCard / AIGapSuggestionCard? **No — those stay as-is to keep this phase additive.** New analytics components consume `Card`; future cleanup can DRY the existing ones.

**Figma checkpoint:** screenshot the donut on `analytics-01` (`1974:53692`) and read the 5-segment palette before committing donut tokens.

**Files:** `tokens.css`, `tokens.ts`, `design.md` (color block), new `primitives/Card.tsx`, `primitives/Card.stories.tsx`, `primitives/index.ts` if exists else direct export from `src/index.ts`.

### Step 1 — Stat primitives + DateRangePill

- `StatCard` — `{ label, value, trendDelta, trendDirection: 'up'|'down'|'neutral' }`. Figma: stat block in `analytics-01` "Support Performance" card.
- `StatCardGrid` — wraps a `Card` with optional title + info-icon (Hover later) + a horizontal flex of N StatCards. Used by both Support Performance + AI Search Performance.
- `DateRangePill` — pill-shaped trigger: calendar-icon + label ("Last 7 days") + chevron-down. Opens a Radix `DropdownMenu` with options Last 7 / Last 30 / Last 90 days / Custom… (custom is a stub).
- `Card` primitive consumed throughout.

**Figma checkpoints:** stat row on `analytics-01` (top region of `1974:53692`), AI stat row on `analytics-03` (top of `1974:53167`), date pill — visible top-right of all three pages. Capture sub-screenshots before dispatch.

**Files:** `content/StatCard.tsx`, `content/StatCardGrid.tsx`, `content/DateRangePill.tsx` + 3 `.stories.tsx`. Storybook titles `Components/Content/Stat Card`, `Components/Content/Stat Card Grid`, `Components/Content/Date Range Pill`.

### Step 2 — Chart primitives

Three chart variants identified across the 3 pages, all built on `recharts`:

- `AnalyticsAreaChart` — supports 1 or 2 series, washes from chart tokens, optional goal-line annotation (dashed horizontal `Goal: 70%`). Used in: Article views over time (2 series), Search vol over time (1 series, blue), Missed search rate (1 series, green + goal), AI deflection rate (1 series, green + goal).
- `AnalyticsDonutChart` — Recharts PieChart with `innerRadius` for donut. 5-segment palette, side-legend with `bg-dot + label` rows.
- `AnalyticsChartCard` — composition: `Card` + title row (with optional info icon) + chart + optional legend below. Most charts on the page render through this wrapper; cleaner than every page-pattern repeating the chrome.

**Figma checkpoints:** the 4 chart instances (one each on the 3 pages). Verify wash colors, goal-annotation color (looks like `#0f172a` dashed), legend dot size, axis tick formatting (`mon`, `tue`, `0–12k` formatted as `3k 6k 9k 12k`).

**Files:** `content/AnalyticsAreaChart.tsx`, `content/AnalyticsDonutChart.tsx`, `content/AnalyticsChartCard.tsx` + 3 `.stories.tsx`.

### Repair log — Steps 1+2 reconciled to live Figma (2026-04-25)

User halted before Step 3 to enforce 1:1 fidelity. Two ui-engineer dispatches closed all known deltas:

**Repair-1 (token + chart visual fixes):**
- `--color-trend-up: #22c55e → #086e3f` (Figma `text/success/default`)
- `--color-trend-down: #ef4444 → #d52c1f` (Figma `text/danger/default`)
- `--color-chart-views: #ef4444 → #f56565` (Figma `Red/r400`)
- `--color-chart-unique: #3b82f6 → #4299e1` (Figma `Blue/b400`)
- Washes re-derived from new RGB values
- New tokens: `--color-chart-goal-line: #276cf0` (Figma `border/blue/default`), `--color-chart-goal-label-bg: #26292e` (Figma `NeutralLight/nl800`), `--color-donut-6: #4b5468` (Figma `NeutralLight/nl700`)
- `AnalyticsAreaChart`: goal-line stroke → blue, custom `<GoalLineLabel>` SVG component (dark pill + connector dot + white text), `<CartesianGrid vertical={true}>`
- `AnalyticsDonutChart`: default `ringThickness: 0` (full pie, was donut), 6-segment palette default

**Repair-2 (typography + body color):**
- New token `--color-chart-body: #4b5468` (Figma `NeutralLight/nl700` Body)
- `StatCard` trend delta: `text-[14px]` → `text-[13px] leading-[19px]` (Figma `body/xs/medium`)
- `AnalyticsDonutChart` legend label: `text-[#475569]` → `text-chart-body`
- `AnalyticsAreaChart` axis ticks + legend: `#64748b/#475569` → `var(--color-chart-body)`

Acceptable un-tokenized residuals: `--color-chart-positive: #22c55e` (Figma has no token for the AI deflection / search vol green line); `<CartesianGrid stroke="#e5e7eb">` (Figma has no token).

### Step 3 — `AnalyticsSideNav`

- 288 px wide, white bg, light theme — mirrors `AISubNav` structure.
- Header: 16px chart icon + "Analytics" (14 / semibold) — divider below.
- Items: 3 rows — `Article Performance`, `Search`, `AI Answer Performance`. Active state = `bg-[#f1f5f9]` pill, same as AISubNav.
- Same 14 / medium primary text per row (no section/item typography distinction — confirmed by R5 audit on AISubNav).

**Figma checkpoint:** side-nav region of `1974:53692`. Capture and verify icon glyphs (chart icon for header, chart-bar/article icons for rows).

**Files:** `nav/AnalyticsSideNav.tsx` + `.stories.tsx`. Story title: `Components/Navigation/Analytics Side Nav`.

### Step 4 — Article Performance tables (analytics-01)

Two distinct tables on the same page:

- `ArticlesNeedsAttentionTable` — 2 col (Article Title, Helpfulness%) + count badge in card header + helpfulness colored red (low) / green (high) per row. Card chrome via the new `Card` primitive.
- `ArticlePerformanceTable` — 5 col (Article, Category badge, Total Views, Avg Time Spent, Helpfulness%). Reuse `Badge` primitive for Category. Helpfulness colored red/green like the attention table.

Both tables wrap an HTML `<table>` (matches the 2026-04-20 semantic rewrite of ArticlesTable).

**Figma checkpoint:** both tables on `1974:53692`. Verify col widths, helpfulness color thresholds (Figma may show hard-coded green ≥ 50%, else red — confirm).

**Files:** `content/ArticlesNeedsAttentionTable.tsx`, `content/ArticlePerformanceTable.tsx` + `.stories.tsx`.

### Step 5 — Search-page tables (analytics-02)

- `SearchKeywordsTable` — 2 col (Keywords prefixed by `1.`, `2.`, … numbering, Search Count). Compact rows, simple chrome.
- `ContentGapsTable` — 4 col (Topic, Frequency, Ticket Rate, Action). The Action col contains a small ghost button "Write Article" with a pencil glyph — reuse the existing `Button` primitive at variant=ghost (or whatever variant matches).

**Figma checkpoint:** both tables on `1974:54154`. Verify the "Write Article" button styling (looks ghost/outlined with pencil glyph + 14/medium label).

**Files:** `content/SearchKeywordsTable.tsx`, `content/ContentGapsTable.tsx` + `.stories.tsx`.

### Step 6 — AI Conversation Logs card (analytics-03, most complex)

Two-piece split (per user decision):

- `AIConversationLogEntry` — single Q+A row:
  - Top row: question icon (Q) + question text (14 / medium) + timestamp right-aligned + ticket-created chip (`✉ Ticket created by user` style)
  - Below: AI answer summary (14 / regular muted)
  - "N Sources" link (clickable, opens existing `SourcesSideSheet` from Phase 6) + (sometimes) a `↳ follow up` nested entry
  - Expand/collapse client-state for follow-up threads (per "light interactivity")
- `AIConversationLogsCard` — wraps a `Card`:
  - Header: title + `Sort by` dropdown + `Ticket Created` toggle (Radix Switch)
  - Body: list of `AIConversationLogEntry`
  - Footer: `view all` link

**Figma checkpoint:** the AI Search & Conversation logs section of `1974:53167`. Capture and inspect: nested follow-up indentation, source-link color, ticket-created chip color/icon.

Also reuse `SourcesSideSheet` from Phase 6 for the "N Sources" click — verify the chip → sheet wiring works.

**Files:** `content/AIConversationLogEntry.tsx`, `content/AIConversationLogsCard.tsx` + 2 `.stories.tsx`.

### Step 7 — `MostCitedArticlesTable` + page patterns

- `MostCitedArticlesTable` — simple 2-col (Article Title with doc-icon, Citations count). Last small piece on `analytics-03`.
- Three page patterns at `Patterns/KB Analytics — *`:
  - `Patterns/KB Analytics — Article Performance` (composes `analytics-01`)
  - `Patterns/KB Analytics — Search` (composes `analytics-02`)
  - `Patterns/KB Analytics — AI Answer Performance` (composes `analytics-03`)

Each page uses `AppShell` with `rail = SideNavRail dark`, `explorer = AnalyticsSideNav`, `breadcrumb = KBBreadcrumbBar variant="category"`. Content column composes the components built in Steps 1–6 with hardcoded mock data matching the Figma copy.

**Figma checkpoint:** full-page screenshots of `1974:53692`, `1974:54154`, `1974:53167`. Pixel-diff the 3 rendered page stories side-by-side in Storybook.

**Files:** `content/MostCitedArticlesTable.tsx` + story; new `pages/KBAnalyticsArticlePerformancePage.stories.tsx`, `pages/KBAnalyticsSearchPage.stories.tsx`, `pages/KBAnalyticsAIAnswerPerformancePage.stories.tsx`.

### Step 8 — Verification + live-Figma re-audit

- `pnpm --filter @hiver/kb-ui typecheck`
- `pnpm --filter @hiver/kb-ui build`
- Token audit grep: AI gap files were patient; any new analytics-specific raw hex should be in `TYPE_META`-style local consts only.
- Live Figma re-audit pass: re-fetch the 3 page-frame screenshots and diff vs the just-built page patterns. Open issues become a small R-level dispatch (likely 0–3 deltas, given how careful we'll be on each step).
- Commit: single squash with message `feat(kb-ui): phase 7 (Analytics) — components + 3 page patterns`.

## Critical files

| File | Type | Notes |
|---|---|---|
| `packages/kb-ui/src/tokens.css` | modify | add chart + trend tokens (Step 0) |
| `packages/kb-ui/src/tokens.ts` | modify | mirror |
| `design.md` | modify | document new tokens, list Phase 7 nodes |
| `packages/kb-ui/src/components/primitives/Card.tsx` | new | shared card chrome |
| `packages/kb-ui/src/components/content/StatCard.tsx` | new | atom |
| `packages/kb-ui/src/components/content/StatCardGrid.tsx` | new | molecule |
| `packages/kb-ui/src/components/content/DateRangePill.tsx` | new | atom + Radix DropdownMenu |
| `packages/kb-ui/src/components/content/AnalyticsAreaChart.tsx` | new | recharts wrapper |
| `packages/kb-ui/src/components/content/AnalyticsDonutChart.tsx` | new | recharts wrapper |
| `packages/kb-ui/src/components/content/AnalyticsChartCard.tsx` | new | composition |
| `packages/kb-ui/src/components/nav/AnalyticsSideNav.tsx` | new | mirrors AISubNav |
| `packages/kb-ui/src/components/content/ArticlesNeedsAttentionTable.tsx` | new | helpfulness focus |
| `packages/kb-ui/src/components/content/ArticlePerformanceTable.tsx` | new | 5-col |
| `packages/kb-ui/src/components/content/SearchKeywordsTable.tsx` | new | 2-col numbered |
| `packages/kb-ui/src/components/content/ContentGapsTable.tsx` | new | 4-col + button |
| `packages/kb-ui/src/components/content/AIConversationLogEntry.tsx` | new | row |
| `packages/kb-ui/src/components/content/AIConversationLogsCard.tsx` | new | shell |
| `packages/kb-ui/src/components/content/MostCitedArticlesTable.tsx` | new | 2-col |
| `packages/kb-ui/src/pages/KBAnalyticsArticlePerformancePage.stories.tsx` | new | analytics-01 |
| `packages/kb-ui/src/pages/KBAnalyticsSearchPage.stories.tsx` | new | analytics-02 |
| `packages/kb-ui/src/pages/KBAnalyticsAIAnswerPerformancePage.stories.tsx` | new | analytics-03 |
| `packages/kb-ui/src/components/{content,nav}/index.ts` | modify | add new exports |
| `packages/kb-ui/src/index.ts` | modify | top barrel |

Plus stories for every new non-page component (matches Phase 6 cadence).

## Verification

After each step:
1. `pnpm --filter @hiver/kb-ui typecheck` — clean.
2. `pnpm --filter @hiver/kb-ui build` — clean.
3. Visual check by user against the Figma node IDs cited in the step. **No Playwright captures** (per saved memory — heavy on usage).
4. If user finds drift, log it as a "step deltas" tail in this file before moving to next step.

After Step 8:
5. Single `git commit` (no `--amend`); push not requested unless user asks.
6. Update `logs.md` and `plan.md` to mark Phase 7 done.
7. Open items go in `logs.md` §What's next.

## Risks / open items

- **Charts on hardcoded data.** When real data arrives, the chart components may need a flexible series-config shape rather than hardcoded series prop names. Designed for extensibility but not stress-tested.
- **`SourcesSideSheet` reuse from Phase 6.** Used by `AIConversationLogEntry`'s "N Sources" click. The sheet expects a `ConversationSource[]` shape; mock data needs to match.
- **Donut chart palette extraction.** Step 0 token palette will be eyeballed from screenshot; if the live Figma defines fills as variables we should pull those exactly.
- **`info-icon` (ⓘ) placement** on every card title. Need to extract the icon glyph from `@remixicon/react` (likely `RiInformationLine`) consistently.
- **DateRangePill menu** — Radix `DropdownMenu` is not yet a project dep. Phase 6 used `@radix-ui/react-dialog` for the sources sheet — same family, different package. Need to add `@radix-ui/react-dropdown-menu` if not present. Will check during Step 1.
