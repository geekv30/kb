# Side-nav (collapsed rail)

**Figma**: `https://figma.com/design/9aGp5t9fH1d0PXi4LMhOdb/library-check?node-id=0-1`
**Primary node**: `1:4324` (page `0:1` "side-nav" → frame "option 12")
**Storybook target**: `packages/kb-ui/src/components/nav/SideNavRail.tsx` (and related)

> All tokens below extracted live from Figma via `use_figma` Plugin API (boundVariables resolved). See `design/_tokens.md` for the token reference table.

## Anatomy

Vertical 54px-wide rail, full-height (635px reference), white background, 1px subtle border all around.
- Header zone: 54×58 container with 7px vertical padding, hosts logo button (32×32, 8px radius, uses `background/neutral/faint` on hover state).
- Divider: .menu-items row of 4px height with internal 8px horizontal padding.
- Nav stack: vertical list with 4px gap between items, 12px top padding, 6px bottom padding.
- Items: 36×36 square hit area, icon-only within 54px rail.
- Footer item pinned at bottom of rail (avatar/settings).

## Frame tokens

| Property | Value | Token |
|---|---|---|
| width | 54px | — (fixed rail width) |
| bg | `#ffffff` | `background/canvas/white` |
| border | 1px `#e2e8f0` (inside) | `border/slate_blue/subtle` |
| padding | 0 all sides | `scale/space/none` |
| gap between sections | 6px | `scale/space/md` |
| corner radius | 0 | `scale/radius/none` |

## Item (icon-only, active/default)

| Property | Value | Token |
|---|---|---|
| container size | 54×54 | — |
| internal padding Y | 7px | — (raw, no variable) |
| internal padding X | 2px | `scale/space/xs` |
| icon button frame | 41×32 | — |
| icon button padding | 4px all | `scale/space/sm` |
| icon button radius | 8px | `scale/radius/lg` |
| hover/active bg | `#f8fafc` | `background/neutral/faint` |
| icon color | `#475569` | `icon/neutral/subtle` (stroke) |

## States

| State | Background | Icon color |
|---|---|---|
| default | transparent | `icon/neutral/subtle` `#475569` |
| hover | `background/neutral/faint` `#f8fafc` | `icon/neutral/default` `#0f172a` |
| active | `background/neutral/faint` `#f8fafc` | `icon/neutral/default` `#0f172a` |

## Accessibility

- Each rail item must be a focusable `<button>` or `<a>` with a meaningful `aria-label` (there's no visible text).
- Active item must expose `aria-current="page"` (or `aria-selected="true"` for tabs pattern).
- Focus ring: recommend 2px outer ring using `border/slate_blue/default` `#cbd5e1` — NOT observed in Figma, flag for design.

## Open questions

- Dark theme variant: not present in this file's 54×635 frame; the existing `SideNavRail.tsx` implements one — treat as app-level decision, not extractable from this Figma node.
- Pinned logo at top uses `background/accents/gray/strong` `#2d2d2d` as fill in the icon glyph — this is inside the icon, not the container.


## Fixes applied (2026-04-18)

- Rail width: already `w-[54px]` in source (prior fix); no change required.
- Light-theme active item bg: `#f1f5f9` (slate-100, blue-tinted) -> `#f8fafc` (`background/neutral/faint`).
- Light-theme right border: added `border-r border-[#e2e8f0]` to the light-theme branch of the nav container (previously missing, hence 0px readout in evaluate).
- File: `packages/kb-ui/src/components/nav/SideNavRail.tsx` lines 34 (border) and 67 (active bg).
- Closes diff-report item #7 (🔴 active bg + 🟡 border).

## Icon-size enforcement (2026-04-20)

- The **24×24 nav glyph is now enforced inside `SideNavRail`** (not left to callers). The icon wrapper applies `[&>svg]:w-6 [&>svg]:h-6` so any SVG dropped into `item.icon` is forced to 24×24 regardless of the caller's `size` prop.
- Source: `packages/kb-ui/src/components/nav/SideNavRail.tsx` line ~86.

## Icon-size revision to 16 × 16 (2026-04-21)

- **Icon size is now 16 × 16** (down from 24×24). Figma source of truth: `9aGp5t9fH1d0PXi4LMhOdb/0:1`. User-reported that active pencil looked "bold" compared to other rail glyphs — root cause was stories passing `size={18}` on the Remix icon, which the old wrapper then scaled up to 24 via `[&>svg]:w-6 h-6`. The SVG's native stroke renders at 18 but was being force-scaled, making stroke weight appear heavier than the other line glyphs at the same stretch. All four rail icons are confirmed `Line` variants (`RiStarLine`, `RiPencilLine`, `RiFolderLine`, `RiSettings3Line`) — no Fill→Line swap needed.
- Wrapper now applies `size-4` + `[&>svg]:w-4 [&>svg]:h-4 [&>img]:w-4 [&>img]:h-4`.
- Stories updated: `SideNavRail.stories.tsx` (`size={24}` → `size={16}`), `AppShell.stories.tsx` (`size={24}` → `size={16}`), `KBCategoryPage.stories.tsx` (`size={18}` → `size={16}`).
- Verified at 1280×900: all 4 rail SVGs render at 15.99×15.99 with `width="16" height="16"` attributes (native, not CSS-scaled). Before: 23.99×23.99 with `width="18"`.
- Source: `packages/kb-ui/src/components/nav/SideNavRail.tsx` line ~86.

## Brand asset (2026-04-21) — CompanyLogo component

- Rail's top brand slot now renders a dedicated `<CompanyLogo size={24} />` React component at `packages/kb-ui/src/components/brand/CompanyLogo.tsx`. It returns an inline SVG of the 24×24 Hiver mark: dark `#2D2D2D` rounded-rect (radius 4) with white inner glyph — sourced from repo-root `CompanyLogo.svg`.
- Previous placeholder was `<div className="size-6 rounded bg-blue-500" />` (SideNavRail stories) and an ad-hoc `<HiverLogo>` `size-8` dark square with a text "h" (KBCategoryPage story). Both are replaced.
- Stories updated: `SideNavRail.stories.tsx`, `AppShell.stories.tsx`, `KBCategoryPage.stories.tsx`.
- Export: re-exported from `@hiver/kb-ui` via `src/index.ts` → `components/brand`.

## Icon library (2026-04-21, reverted) — `@remixicon/react`, regular-weight Line, 16×16

- Icon library in use across the rail (and the rest of the library) is **`@remixicon/react`**, regular-weight `Line` variants, rendered at 16×16.
- Rail slot mapping: AI → `<AiIcon />` (custom gradient sparkle, not from any icon set) · Editor (active) → `RiQuillPenLine` · Articles → `RiFolderLine` · Settings → `RiSettings5Line`.
- An earlier session (same day) briefly swapped to `@phosphor-icons/react`. That swap was reverted the same day — the Phosphor look was rejected as too heavy / inconsistent with the rest of the product. Nothing in `src/` imports Phosphor; `@phosphor-icons/react` is not a dependency.

## AI icon (2026-04-21) — gradient sparkle from Figma

- The rail's **first nav slot** (id `ai`, label "AI") now renders a real `<AiIcon size={16} />` component at `packages/kb-ui/src/components/brand/AiIcon.tsx`. The earlier Phosphor `Star` placeholder is gone; all three `TODO(ai-icon)` comments have been removed.
- **Provenance**: extracted live from Figma `9aGp5t9fH1d0PXi4LMhOdb` (library-check), page `0:1` "side-nav", vector node `I1:4349;206:6843;12619:15996;517:21335` (inside the first rail nav item `1:4349`).
- **Shape**: 4-point sparkle on a 13.333×13.333 path, centered in a 16×16 canvas (translate 1.333,1.333 — matches Figma's 8.33% / 8.35% insets on the enclosing 16-frame).
- **Stroke**: `GRADIENT_LINEAR`, stroke-weight `1.4`, two stops:
  - `offset=0`: `#D92FFF` (rgb 217, 47, 255 — magenta)
  - `offset=1`: `#FFC987` (rgb 255, 201, 135 — peach)
  - Gradient axis: mapped from Figma 2×3 transform `[[0.98271, 0.10255, -0.07961], [-0.10250, 0.11847, 0.49054]]` to SVG `gradientUnits="objectBoundingBox"` with `x1=-0.07961, y1=0.49054, x2=0.90309, y2=0.38804`. Reproduced bit-for-bit — no values fabricated.
- Exported from `@hiver/kb-ui` via `components/brand/index.ts`.
- Stories updated: `SideNavRail.stories.tsx`, `AppShell.stories.tsx`, `KBCategoryPage.stories.tsx` — each now imports `AiIcon` and drops the `TODO(ai-icon)` comment.
- Verified at 1280×900 (light rail story): rail first nav item `aria-label="AI"`, SVG `width=16 height=16`, `<linearGradient>` with stops `#D92FFF → #FFC987`, path `stroke="url(#kb-ai-icon-gradient)"`.
