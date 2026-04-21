# Breadcrumb

**Figma**: `https://figma.com/design/9aGp5t9fH1d0PXi4LMhOdb/library-check?node-id=1-5389`
**Primary node**: `1:5390` (page `1:5389` "breadcrumb" → frame "Container" 938×54)
**Component set**: `_Base items (Breadcrumbs)` — variants by `Type` × `State`
**Storybook target**: `packages/kb-ui/src/components/primitives/Breadcrumb.tsx`

> All tokens below extracted live from Figma via `use_figma`. See `design/_tokens.md`.

## Anatomy

Full-width 938×54 bar, 16px vertical padding, horizontal list of items separated by chevron glyphs. Levels variant observed: `4+` (i.e. collapses with overflow indicator for 5+ levels).

## Outer container

| Property | Value | Token |
|---|---|---|
| padding | 16 TB, 0 LR | `scale/space/2xl` / `none` |
| gap | 8 | `scale/space/lg` |
| inner container padding | 0 TB, 22 LR | — |
| inner container gap | 10 | — |

## Item variants (from component set)

### Type=homve [sic, "home" typo in Figma], State=default

Single home icon (14×14) wrapped in 22×22 button with 4px all-sides padding, radius `sm` (4).

| Property | Value | Token |
|---|---|---|
| container size | 22×22 | — |
| padding | 4 all | `scale/space/sm` |
| radius | 4 | `scale/radius/sm` |
| icon color | `#64758b` | `icon/neutral/faint` |

### Type=chevron, State=default

Separator between items, 22×22 container hosting a 14×14 chevron-right icon.

| Property | Value | Token |
|---|---|---|
| container size | 22×22 | — |
| padding | 4 all | `scale/space/sm` |
| radius | 4 | `scale/radius/sm` |
| chevron color | `#64758b` | `icon/neutral/faint` |
| alternate separators in file | `straigh-line`, `slash` — variants of the separator glyph |

### Type=text, State=active

Terminal item (current page), rendered with background pill.

| Property | Value | Token |
|---|---|---|
| height | 20 | — |
| padding | 0 TB, 6 LR | `none` / `md` |
| radius | 4 | `scale/radius/sm` |
| bg | `#f7f7f7` | `background/neutral/faint` (note: `#f7f7f7` NOT `#f8fafc` — slight variant. Verified via Figma) |
| text | Inter Medium 14/20 | body-sm medium |
| text color | `#0f172a` | `text/neutral/default` |

### Type=text, State=default (intermediate clickable crumbs)

Observed but hidden in this frame — inferred from Figma's variant set:

| Property | Value | Token |
|---|---|---|
| bg | transparent | — |
| text | Inter Medium 14/20 `#475569` | `text/neutral/subtle` |
| hover bg | `#f7f7f7` | `background/neutral/faint` |

## Accessibility

- Root must be `<nav aria-label="Breadcrumb">` → `<ol>` → `<li>` list.
- Intermediate items: `<a href>` (focusable).
- Current page: `<span aria-current="page">` (not focusable, no link).
- Chevron separators: `<svg aria-hidden="true">`.
- Ellipsis overflow (for `Levels=4+`): `<button aria-label="Show N hidden levels">` expanding to a menu.

## Raw-hex escape

- Active-state bg is `#f7f7f7` in Figma but `#f8fafc` exists as `background/neutral/faint`. Small delta (~2 units lightness). Recommend either promoting `#f7f7f7` to its own token or accepting `background/neutral/faint` as the canonical choice. Flag for design.

## Open items

- Overflow collapse UI (when `Levels > 4`): the dropdown menu content isn't captured in this node.
- Hover state for intermediate items not explicitly shown in file.

## Separator revision (2026-04-21) — text `/` instead of chevron

- Per Figma source of truth (`9aGp5t9fH1d0PXi4LMhOdb/0:1`, reinforced by user), breadcrumb separator is a **text slash `/`**, not the `RiArrowRightSLine` chevron that was previously rendered in Storybook.
- Spec: text `/` at 14/20 (matching crumb text size), color `#cbd5e1` (`border/slate_blue/default` — used as a faint neutral here), 6px horizontal padding inside the separator span, no radius, no background.
- The collapse `«` control at the start of the bar is unchanged (it is a sidebar-collapse button, not a separator).
- Files changed:
  - `packages/kb-ui/src/components/shell/KBBreadcrumbBar.tsx` — separator span replaced, `RiArrowRightSLine` import removed.
  - `packages/kb-ui/src/components/primitives/Breadcrumb.tsx` — same separator swap. Note: this primitive is not consumed by `KBBreadcrumbBar` in production, it's a standalone breadcrumb primitive exposed for non-shell use; updated for parity.
- Verified at 1280×900: single `<li>` separator renders as text `/`, `hasSvg=false`, color `rgb(203, 213, 225)` = `#cbd5e1`, fontSize `14px`.

## Collapse icon (2026-04-21) — side-panel toggle, `RiLayoutLeftLine`

- The far-left icon in the breadcrumb bar is a **side-panel collapse** toggle — an outlined rounded rectangle with a single vertical divider on the left third, reading as a small sidebar-and-content schematic. It replaces a prior `CaretDoubleLeft` (`«`) which was semantically wrong for the affordance.
- Icon in use: **`RiLayoutLeftLine`** from `@remixicon/react` (regular-weight Line variant), size `14`.
- History: briefly rendered as Phosphor `SidebarSimple` earlier the same day (2026-04-21) during a full Remix→Phosphor swap; both that swap and this icon were reverted when Phosphor was removed. `RiLayoutLeftLine` is the closest Remix equivalent — same visual (rounded rect + single inner vertical divider, no tick marks) and same semantic.
- Files:
  - `packages/kb-ui/src/components/shell/KBBreadcrumbBar.tsx` — imports `RiLayoutLeftLine`, used at line ~57 inside the "Collapse sidebar" button.
  - `packages/kb-ui/src/components/primitives/Breadcrumb.tsx` — same icon, used at line ~34 in the standalone primitive (parity with shell).
- Size, color, and container untouched (22×22 button, 4px padding, 4px radius, `#64748b` / `#94a3b8` icon color, hover `#f8fafc` bg).

## Icon swap (2026-04-21) — side-panel vs. home, driven by `sidebarCollapsed`

The breadcrumb's leading button now renders one of **two** icons depending on the shell's sidebar state:

| `sidebarCollapsed` | Icon | `aria-label` | `data-testid` | Semantics |
|---|---|---|---|---|
| `false` (default) | `RiLayoutLeftLine` | `"Collapse sidebar"` | `"side-panel-icon"` | "click to hide the rail + explorer" |
| `true` | `RiHome5Line` | `"Expand sidebar"` | `"home-icon"` | "you are in the collapsed editor state — click to go back to the navigable shell" |

Source: Figma `9aGp5t9fH1d0PXi4LMhOdb#53:8464` shows a HOME icon at the left of the breadcrumb when rail+explorer are hidden; the prior state (`53:8463`, rail+explorer visible) uses the side-panel toggle.

- Icon container, padding, radius, colors are **unchanged** — only the glyph and `aria-label`/testid differ.
- The click handler is unified: `KBBreadcrumbBar` accepts `onToggleSidebar` (or legacy `onCollapse`) and fires it from either icon; callers can decide whether the same handler drives both directions or branch on state.
- `RiHome5Line` was chosen as the closest outlined rounded-roof house from `@remixicon/react`; other candidates (`RiHomeLine`, `RiHome2Line`–`RiHome8Line`) render with a filled square body or different proportions.
- File: `packages/kb-ui/src/components/shell/KBBreadcrumbBar.tsx` (icons imported, swap logic ~L40).

## Fixes applied (2026-04-20) — remove breadcrumb bottom border

- `KBBreadcrumbBar` and its `AppShell` wrapper (`data-kb-part="shell-breadcrumb"`) no longer render a 1px bottom border. Bar has no bottom border; the shell's rail+explorer dividers alone mark the 54px header line.
- Bar height unchanged (54 px). Only the visible `#e2e8f0` line is removed.
- Files: `packages/kb-ui/src/components/shell/AppShell.tsx:54` (removed `border-b border-[#e2e8f0]` from the breadcrumb wrapper).
- Verified at 1280: `KBBreadcrumbBar` computed `borderBottomWidth: 0px`; AppShell `shell-breadcrumb` wrapper `borderBottomWidth: 0px`. Shell invariants preserved: rail divider Y = 53.99, explorer divider Y = 53.99, breadcrumb bar bottom = 53.99 (all ≈ 54).
- Note: `KBBreadcrumbBar.stories.tsx` decorator still adds a decorative `borderBottom` to showcase the bar against its shell context in isolation — that is test-harness only and does not reflect production rendering.

## Publish button — primary variant (2026-04-21)

In the editor variant of `KBBreadcrumbBar`, the Publish action is a
**primary** button (black bg, white text, white 14 px send-plane icon),
not an outlined white button.

- Source: Figma `53:8464` — node `53:8556` declares
  `bg-[var(--background/black/adaptive,black)]`,
  `text-[color:var(--text/white/static,white)]`,
  `rounded-[var(--scale/radius/md,6px)]`, `px-[12] py-[6]`.
- Implementation: reuses the shared `Button` primary variant
  (`primitives/Button.tsx`), so any future tweak to the primary token
  propagates for free.
- Icon: `RiSendPlaneLine size={14}` — color inherits from `currentColor`
  (white) via the `Button`'s `text-white` class.
- File: `packages/kb-ui/src/components/shell/KBBreadcrumbBar.tsx` —
  imports `Button` from `../primitives/Button`; Publish rendered inside
  the `variant === 'editor'` action cluster.

### Current-crumb pill — retained per Figma source

The last (current) crumb in the editor variant keeps its existing pill
styling (`bg-#f8fafc rounded-4 px-6 py-0 font-medium text-#0f172a`). A
prior review round flagged "looks like no pill in the Figma export PNG",
but `get_design_context` on node `53:8464` returned an explicit
`bg-[var(--background/neutral/faint,#f8fafc)]` class list for the
current-crumb span (node `I53:8537;10138:12798`). Per the pixel-perfect
rule in CLAUDE.md, Figma source wins over a visual read of the PNG —
pill retained. The `#f8fafc`-on-`#ffffff` contrast is ~1 %, which explains
the "no pill" impression at 1 : 1 zoom.
