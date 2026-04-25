# Phase 7 — Storybook ↔ Figma diff report

**Captured:** 2026-04-25 via `packages/kb-ui/capture-stories.mjs` (Playwright headless chromium, viewport per-story, deviceScaleFactor 2). 32 stories, 0 capture failures.

**Figma file:** `251DTRmxl2L6jmXd3FWzHe`. Reference frames at `/tmp/figma-audit/`.

**Storybook captures at:** `/tmp/storybook-captures/`.

**Severity legend:** 🔴 critical / clearly visible · 🟡 noticeable on close inspection · 🟢 nit / sub-pixel.

---

## Summary

| # | Severity | Component / surface | Delta |
|---|---|---|---|
| 1 | 🔴 | `StatCard` value typography | 24/600/32 → Figma `body/lg/medium` is **18/500/28** |
| 2 | 🔴 | `AnalyticsDonutChart` (and consumers) | PieChart SVG not visible in any consumer; only the legend renders. Flex-shrink issue around recharts `<PieChart width=size>` |
| 3 | 🟡 | `AnalyticsAreaChart.WithGoalLine` story data | Uses `yTicks=[0..12000]` with `goal.y=70` → goal-line falls below y=0 (bottom of chart). Component itself is correct; story-data fix only |
| 4 | 🟡 | `AIConversationLogsCard` sort trigger | Trigger renders selected value (e.g. "Recent") — Figma shows literal "Sort by" placeholder regardless of selection |

Everything else (date pill, side nav, all 5 tables, helpfulness tag, area chart 2-series, conversation log entries, the 3 page patterns at structural level) matches Figma 1:1 by visual inspection.

---

## Detail

### 1. 🔴 StatCard value typography (file: `packages/kb-ui/src/components/content/StatCard.tsx`)

**Capture:** `/tmp/storybook-captures/stat-card-grid-support.png`
**Figma:** `/tmp/figma-audit/stat-support-1974-53911.png`

Storybook value (e.g. "112,678") renders very large + bold; Figma's value renders at the same size as the trend chip — clearly a smaller token.

**Verified Figma var defs** (node `1974:53911`):
- `body/sm/medium`: 14/500/20 — labels and trend deltas
- `body/lg/medium`: 18/500/28 — **stat values**

**Fix:** in `StatCard.tsx`, change the value `<span>` className from `text-[24px] font-semibold leading-[32px]` to `text-[18px] font-medium leading-[28px]`. No structural change — same flex layout, same data-attrs.

### 2. 🔴 AnalyticsDonutChart not rendering visibly (file: `packages/kb-ui/src/components/content/AnalyticsDonutChart.tsx`)

**Captures showing the bug:**
- `/tmp/storybook-captures/donut-chart-default.png` — legend renders right, **no pie chart on the left**
- `/tmp/storybook-captures/chart-card-with-donut.png` — same issue inside ChartCard
- `/tmp/storybook-captures/page-article-perf.png` — same issue at page-pattern level (Views by Category card shows only the legend)

**Figma:** `/tmp/figma-audit/analytics-01-1974-53692.png` — full pie chart with 6 segments, legend right. Verified live.

The PieChart SVG is generated but invisible in all three consumers. Most likely cause: the wrapping `flex items-center gap-8` lets the explicit `<PieChart width={size} height={size}>` be flex-shrunk to 0 width. Recharts honors fixed dimensions only when the parent doesn't override.

**Fix candidates** (try in order):
1. Wrap the `<PieChart>` in a `<div className="shrink-0">` so flex doesn't squash it.
2. If that doesn't work, switch to `<ResponsiveContainer width={size} height={size}>` around the `<PieChart>`.
3. If still broken, set explicit `min-width: ${size}px` on the wrapper.

### 3. 🟡 AreaChart WithGoalLine story data (file: `packages/kb-ui/src/components/content/AnalyticsAreaChart.stories.tsx`)

**Capture:** `/tmp/storybook-captures/area-chart-with-goal.png`

The chart renders only the LEFT half of the viewport, and the goal-line label `Goal : 70%` sits at y=0 (bottom of chart). Component is correct — the same chart renders perfectly inside `chart-card-with-goal` and on the AI Answer Performance page.

The standalone `WithGoalLine` story passes:
- `yTicks=[0, 3000, 6000, 9000, 12000]`
- `goalLine={{ y: 70, label: 'Goal : 70%' }}`

`y=70` on a 0-12k scale lands almost at zero. Story data is wrong.

**Fix:** in `AnalyticsAreaChart.stories.tsx` `WithGoalLine`, switch to a percentage scale matching the AI deflection chart story:

```ts
data: [
  { x: 'mon', positive: 18 },
  { x: 'tue', positive: 24 },
  { x: 'wed', positive: 30 },
  { x: 'fri', positive: 42 },
  { x: 'sat', positive: 48 },
  { x: 'sun', positive: 55 },
],
yTicks: [0, 25, 50, 75, 100],
goalLine: { y: 70, label: 'Goal : 70%' },
```

This puts the goal line near the top, with the data trending toward it — matches Figma's intent.

The chart container ending at the left half is a side-effect of the same data issue (Recharts auto-extends domain when goal y > yTicks max — it does the inverse here too if the data range collapses oddly). The above data fix should naturally restore full-width rendering.

### 4. 🟡 AIConversationLogsCard sort trigger label (file: `packages/kb-ui/src/components/content/AIConversationLogsCard.tsx`)

**Capture:** `/tmp/storybook-captures/convlog-card-default.png`
**Figma:** `/tmp/figma-audit/ai-logs-2045-9269.png`

Storybook trigger reads "Recent ⌄" (the current `sortBy` selection). Figma always shows the literal text "Sort by" regardless of selection — a placeholder-style trigger.

**Two interpretations** — pick one:
- **Strict 1:1 (recommended):** Always render the literal "Sort by" on the trigger, regardless of selection. The user only sees the active sort indirectly (e.g. via the menu's checked item). Matches Figma exactly.
- **Standard UX:** Keep current behavior (trigger reflects selection). Figma's "Sort by" is the placeholder before the user picks anything.

Going with strict 1:1 per the project's pixel-perfect rule. **Fix:** change the trigger's inner text from `{currentLabel}` to the literal `"Sort by"`. Optionally add an aria-label attaching the selected value for accessibility.

---

## Acceptance criteria for the repair pass

After fixes:
1. `pnpm --filter @hiver/kb-ui typecheck` clean.
2. `pnpm --filter @hiver/kb-ui build` clean.
3. Re-run `node packages/kb-ui/capture-stories.mjs` — no failures.
4. Re-Read all 4 affected captures, confirm:
   - StatCard value renders at same size as trend chip (per Figma).
   - Donut chart is visibly drawn on the left, legend on the right.
   - AreaChart WithGoalLine fills full width, goal line at ~70% of vertical.
   - Sort trigger reads "Sort by" not the selected value.
5. Confirm no regressions in the other 28 captures (re-Read 4-6 sample stories spanning the surface).

---

## Captured stories — reference

```
card-default                            stat-card-default              stat-card-down
stat-card-grid-support (✗ value size)   stat-card-grid-ai-search (✗ value size)
date-pill-default                       date-pill-interactive
area-chart-two-series                   area-chart-one-positive       area-chart-with-goal (✗ story data)
donut-chart-default (✗ render)          donut-chart-no-legend
chart-card-with-chart                   chart-card-with-goal           chart-card-with-donut (✗ render)
helpfulness-up                          helpfulness-down
table-articles-needs-attention          table-article-performance
table-search-keywords                   table-content-gaps
table-most-cited
convlog-default                         convlog-with-ticket            convlog-with-followup            convlog-negative
convlog-card-default (✗ sort label)
sidenav-default                         sidenav-article-active
page-article-perf (✗ stat size + donut) page-search                    page-ai-answer (✗ stat size)
```
