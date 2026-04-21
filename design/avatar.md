# Avatar

**Figma**: `https://figma.com/design/9aGp5t9fH1d0PXi4LMhOdb/library-check?node-id=2-388`
**Primary node**: `2:395` (page `2:388` "avatar" → instance "Avatar")
**Storybook target**: `packages/kb-ui/src/components/primitives/Avatar.tsx`

> All tokens below extracted live from Figma via `use_figma`. See `design/_tokens.md`.

## Anatomy

24×24 circle containing centered initials text; optional 8×8 status dot positioned at bottom-right (hidden by default).

## Frame tokens

| Property | Value | Token |
|---|---|---|
| size | 24×24 | — (variant Size=24) |
| border radius | 60 | (effectively full circle; spec uses `scale/radius/smooth`) |
| bg | `#e5e5e5` | `background/accents/gray/soft` |
| layout | vertical, center/center, 0 padding | |

## Text (initials)

| Property | Value | Token |
|---|---|---|
| font | Inter Medium 12 / 18 | body-xs medium |
| color | `#525252` | `text/accent/gray/default` |

## Status dot (variant `Status=true`)

| Property | Value | Token |
|---|---|---|
| outer ring | 8×8 `#ffffff` | `background/white/adaptive` (halo) |
| inner dot | 6×6 `#42cd83` | `background/accents/green/default` |
| position | bottom-right of avatar | |

## Component variants (from main component)

| Prop | Options |
|---|---|
| `Type` | `text` (initials) — other types likely image/icon (not in this node) |
| `Shape` | `circle` — square variant exists elsewhere |
| `Size` | `24` — other sizes likely 32/40 |
| `Color` | `gray` — also green/blue/orange/red etc (design system) |
| `emphasis` | `low` — controls soft vs bold bg/text pairing |
| `Status` | boolean — toggles online dot |

## Accessibility

- Root must have `role="img"` with `aria-label` describing the person (e.g. "Anna Smith, online").
- Initials alone do not provide sufficient AT context — never use the visible letters as the only label.
- Status dot needs to be reflected in the `aria-label`, not announced separately, to avoid double-speak.

## Raw-hex escape

None — all colors resolve to design tokens.
