# Page header

**Figma**: `https://figma.com/design/9aGp5t9fH1d0PXi4LMhOdb/library-check?node-id=1-5437` (corrected — user's URL list #8 was a duplicate of #7)
**Primary node**: `1:5438` (page `1:5437` "page-header" → frame "Container" 938×58)
**Storybook target**: `packages/kb-ui/src/components/content/PageHeader.tsx`

> All tokens below extracted live from Figma via `use_figma`. See `design/_tokens.md`.

## Anatomy

Horizontal 938×58 bar: 44×44 leading icon tile, flexible 2-line text block (title + description), trailing primary button.

## Outer container

| Property | Value | Token |
|---|---|---|
| padding | 4 TB, 24 LR | `scale/space/sm` / `4xl` |
| gap | 16 | `scale/space/2xl` |
| layout | horizontal, start-aligned, center cross-axis | |

## Leading icon tile

| Property | Value | Token |
|---|---|---|
| size | 44×44 | — (raw, no variable for the wrapper itself) |
| padding | ~8.8 all | `scale/space/lg` × 1.1 multiplier (likely zoomed instance) |
| radius | 6.6 | `scale/radius/md` × 1.1 |
| bg | `#f8fafc` (hidden in this variant) | `background/neutral/faint` |
| stroke | 1px **dashed** `#cbd5e1` center-aligned | `border/slate_blue/default` |
| icon glyph | 22×22 (Slack example) | filled `#6634ef` `icon/accents/purple/default` |

**Note**: the `1.1` multiplier on paddings/radii suggests the tile is a *zoomed instance* of a base 40×40 button. Treat the base button size as `40×40` with `padding=8`, `radius=6`.

## Text container

| Property | Value | Token |
|---|---|---|
| padding | 0 TB, 2 LR | `scale/space/xs` |
| gap | 2 | `scale/space/xs` |
| layout | vertical, center cross | |

### Title

| Property | Value | Token |
|---|---|---|
| font | Inter Semi Bold 18 / 28 | title-md |
| color | `#0f172a` | `text/neutral/default` |

### Description

| Property | Value | Token |
|---|---|---|
| font | Inter Medium 14 / 20 | body-sm medium |
| color | `#475569` | `text/neutral/subtle` |

## Trailing primary button

See `design/button.md` — this slot uses the `Size=md, Type=primary, Appearance=filled` button with `Prefix Icon#12193:0 = true`, meaning the `+ New` affordance.

## Raw-hex escape

None on the component frame itself. The 1.1 multiplier on tile paddings/radii is a Figma artifact — not a real token. Treat as the nearest variable.

## Accessibility

- Landmark: `<header role="banner">` for the page-level instance, or an `<h1>` wrapper for the title.
- Icon tile: decorative (`aria-hidden="true"`) unless it conveys information not in the title.
- Trailing button: standard `<button>` — if it opens a menu, add `aria-haspopup="menu"` and `aria-expanded`.

## Open items

- No subtitle, no tabs variant observed — the KB product uses a two-line title+desc only.
- Hover/focus visuals for the icon tile (if interactive) not captured.

## Change log

- **2026-04-21** — Icon tile stroke confirmed as **dashed** 1px `#cbd5e1` per user annotated screenshot #23. Tile retains 44×44 dimensions, radius 6.6, bg `#f8fafc`. Previous spec listed `1.2` solid stroke; dashed supersedes.
- **2026-04-21** — Icon glyph swapped from Remix (`RiAddLine`, etc.) to Phosphor regular weight (`Plus`, `BookOpen`, `EnvelopeSimple`). No size change.
