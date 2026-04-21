# Shell-Grid Layout Invariants

> These are **cross-component** invariants. They describe how `SideNavRail`, `FileExplorerNav`, and `KBBreadcrumbBar` must align when composed in `AppShell`. Per-component token files (`design/<component>.md`) MUST NOT contradict anything here.
>
> Source: Figma `library-check` page `31:108` (and children `31-307`, `31-868`, `31-2606`). Measurements below are taken from the annotated screenshots (2026-04-20).

## The single shell row grid

The shell is a 3-column strip: `SideNavRail (54) | FileExplorerNav (288) | content`.
All three columns share a **common 54px header row** at the top.

```
y = 0 ─────────────────────────────────────────────────────────
   │ Logo 54×54 │ pen icon + "Editor" + search │ breadcrumb bar
y = 54 ────────────────────────────────────────────────────────
   │ 1px divider (inset per column, see below)
   │ 12px gap
   │ 36px rows (items/folders)
```

### Header row (54px tall, all three columns)

| Column | Contents | Notes |
|---|---|---|
| SideNavRail | Hiver brand logo, 54×54 container, logo centered | No text |
| FileExplorerNav | `RiQuillPenLine` (16px) + "Editor" (14/600) + `RiSearchLine` at right | 16px horizontal padding |
| Breadcrumb | Collapse icon + crumb trail + current-item pill | 16px horizontal padding |

Rule: the **vertical center of the logo**, the **vertical center of "Editor" text**, and the **vertical center of breadcrumb content** all sit on the same Y axis (Y = 27).

### Divider row (at Y = 54)

A 1px horizontal divider sits directly below the header at Y = 54 in the **rail** and **explorer** columns. The breadcrumb column does NOT render its own divider — the eye reads the rail+explorer dividers as continuing across the content strip, which is sufficient to mark the Y=54 header line. The three columns are **not connected** — each inset is measured from its own column edges:

| Column | Left inset | Right inset | Effective width |
|---|---|---|---|
| SideNavRail (54) | 8 | 8 | 38 |
| FileExplorerNav (288) | 16 | 16 | 256 |
| Breadcrumb (content width) | — | — | n/a (no divider rendered; relies on rail+explorer dividers) |

### Column backgrounds

| Column | Background | Token |
|---|---|---|
| SideNavRail (light theme) | `#ffffff` | `background/canvas/white` |
| FileExplorerNav | `#ffffff` | `background/canvas/white` |
| Content column (shell `[data-kb-part="shell-content-column"]`, contains breadcrumb + main) | `#ffffff` | `background/canvas/white` (set 2026-04-21; previously transparent and showed shell's `#f5f5f5`) |
| AppShell root | `#f5f5f5` (now never visible — content column fully covers the right side) | `background/canvas/muted` |

Divider color: `#e2e8f0` (`border/slate_blue/subtle`).

**Rationale for no breadcrumb divider (2026-04-20):** Breadcrumb bar sits on the `#f5f5f5` canvas; it has white bg and 54 px height. Visual continuity of the Y=54 header line is maintained by the rail+explorer dividers — adding a divider to the breadcrumb produced a visible seam under the bar, whereas the current setup reads as a single continuous header strip. The breadcrumb bar itself has NO `border-bottom`, and the `AppShell`'s `shell-breadcrumb` wrapper also has NO border.

### Gap to content (below divider)

After the divider, both `SideNavRail` and `FileExplorerNav` use the same rhythm:

- **12px** gap below divider before the first content row.
- **36px** row height for every content item (nav icon, folder row, article row).
- **2px** gap between consecutive content rows (so stride = 38px).

## Side-nav item geometry

```
SideNavRail column (54 wide)
│
│  padding-x: 6px (so content box = 42 wide)
│  ┌─────────────────────────────────────┐
│  │ Active item wrapper: 42 × 36        │
│  │ bg: #f8fafc, radius: 8              │
│  │ Icon centered inside, 24px          │
│  └─────────────────────────────────────┘
│  Inactive item: same 42×36 hit box, no bg
```

- Item outer hit area: **42 × 36** (centered in 54 rail; 6px L/R gutter).
- Active background: `#f8fafc`, radius `8px`.
- Icon size: `16 × 16`, color `#475569` default / `#0f172a` active. (Revised 2026-04-21 from 24×24; see `design/side-nav.md`.)
- Brand logo container (top): **54 × 54**, not 42×36 (different from item slots).

## File-explorer row geometry

```
FileExplorerNav column (288 wide)
│
│  padding-x: 12px (outer)
│  ┌─────────────────────────────────────┐
│  │ Row: 36 tall, 264 wide              │
│  │ chevron (24) + folder (16) + label  │
│  │ + count at right (or status dot)    │
│  └─────────────────────────────────────┘
```

- Row height: **36**.
- Active row bg: `#f8fafc` (same as side-nav active).
- Hover bg: `#f8fafc` at lower opacity (match spec).
- Font: label 14/400, count 14/400 color `#475569`.

## Breadcrumb bar geometry

- Bar height: **54** (matches shell header row).
- Horizontal padding: **16L / 16R** (above the 54px line, sits in the content column).
- Items: text 14/400 `#475569`; current item has pill bg `#f8fafc`, radius 4, padding `0 / 6`.
- Separators: text `/` (14/20, color `#cbd5e1`), 6px horizontal padding. (Revised 2026-04-21 from `RiArrowRightSLine` chevron; see `design/breadcrumb.md`.)
- Collapse icon at far left: 14px, same chevron family.

## Verification rules (apply to every shell-related fix)

Any fix to `SideNavRail`, `FileExplorerNav`, `KBBreadcrumbBar`, or `AppShell` MUST be verified by:

1. Opening the **shell composition story** (or creating one if missing) that places all three next to each other.
2. Running `browser_evaluate` to measure:
   - Y of logo center == Y of "Editor" center == Y of breadcrumb content center (== 27)
   - Y of rail divider == Y of explorer divider == Y of breadcrumb bar bottom edge (== 54). Breadcrumb has no visible divider — only the rail+explorer dividers are measured at Y=54.
   - Rail divider width == 38, insets 8/8
   - Explorer divider width == 256, insets 16/16
   - All 36px content rows have exactly 36 height, 2px stride gap between them
3. Taking a side-by-side screenshot at viewport width 1280 and comparing to the reference Figma screenshots.

Per-component fixes that would break these invariants must be rejected.

## Sidebar collapsed state (2026-04-21) — editor page `53:8464`

The shell supports a **collapsed** state in which the rail and explorer are hidden and the content column spans the full viewport.

- Activated via `AppShell.sidebarCollapsed={true}`.
- Rail (`data-kb-part="shell-rail"`) is **unmounted** — not `display: none`. DOM probes return `null`. Same for `shell-explorer`.
- Content column stretches from `x=0` to the right edge; breadcrumb and `main` both inherit that full width.
- Breadcrumb's leading icon **swaps** from the side-panel toggle (`RiLayoutLeftLine`) to a home icon (`RiHome5Line`) — see `design/breadcrumb.md`. Click target stays in the same 22×22 container with the same `aria-label` verb ("Expand sidebar" vs. "Collapse sidebar") and a `data-testid` of `"home-icon"` or `"side-panel-icon"` respectively.
- When expanded (`sidebarCollapsed={false}`, default), behaviour is unchanged from the invariants above.
- Canonical Figma source: `9aGp5t9fH1d0PXi4LMhOdb#53:8464`.

Verification rules for this state (`Patterns/KB Editor Page --default`):
- `document.querySelector('[data-kb-part="shell-rail"]')` is `null`.
- `document.querySelector('[data-kb-part="shell-explorer"]')` is `null`.
- `document.querySelector('[data-testid="home-icon"]')` is non-null.
- Editor card and settings panel sit on the **same Y** (row layout), no stacking.

### Flush-edges rule — editor page, collapsed state (2026-04-21)

When the shell is collapsed, the editor card hugs the **left** edge of the content column and the settings panel hugs the **right** edge, with the space between absorbed by `justify-between`:

```tsx
<div className="flex flex-row justify-between items-start gap-6">
  <ContentEditor ... className="max-w-[720px] w-full" />
  <ArticleSettingsPanel ... className="w-[452px] shrink-0" />
</div>
```

The row wrapper has **no horizontal padding of its own** — the shell's `main` element already applies `pl-6 pr-6 pb-6` (see `AppShell.tsx`), so all breathing room against the content-column edge comes from there. Adding `px-6` on the row would double it to 48 px and break the flush-edges rule.

Verification (on `Patterns/KB Editor Page --default` at any viewport ≥ 1200):
- `editorCard.left - shellContentColumn.left === 24` (= `main`'s `pl-6`)
- `shellContentColumn.right - settingsPanel.right === 24` (= `main`'s `pr-6`)
- Editor card width = `720` (max-w-[720px] + w-full)
- Settings panel width = `452` (`w-[452px] shrink-0`)
- No regression on `WithSidebars` — that story keeps the `flex flex-col xl:flex-row gap-6 items-start` layout because the content column is narrower and the columns stack below `xl`.

This rule applies to the collapsed editor page only (`Patterns/KB Editor Page --default`, `--empty-draft`). Expanded (`WithSidebars`) is unaffected.

## Row-glyph horizontal alignment (2026-04-20)

Article rows in `FileExplorerNav` include a **24×24 leading spacer** so their glyph aligns horizontally with folder-row glyphs at the same depth. Folder rows carry a 24×24 chevron slot; without the spacer, article glyphs would fall under the folder chevron x, not the folder glyph x. Enforced at `packages/kb-ui/src/components/nav/FileExplorerNav.tsx` inside `ArticleRow`.

Verification (at 1280×900):
- `depth-N folder glyph.x === depth-N article glyph.x` (delta 0 px)
- `depth-(N+1) glyph.x - depth-N glyph.x === 24 px` (staircase)
