# Button (primary, filled, md)

**Figma**: `https://figma.com/design/9aGp5t9fH1d0PXi4LMhOdb/library-check?node-id=1-5452`
**Primary node**: `1:5453` (page `1:5452` "button" → instance "Button")
**Main component**: `Icon only=False, Type=primary, Appearance=filled, Size=md, State=default, On Dark=False`
**Storybook target**: `packages/kb-ui/src/components/primitives/Button.tsx`

> All tokens below extracted live from Figma via `use_figma`. See `design/_tokens.md`.

## Anatomy

32×32 (approx — width HUGs content) horizontal pill with optional prefix icon, text label, and optional suffix icon or dropdown chevron.

## Frame tokens (Size=md)

| Property | Value | Token |
|---|---|---|
| height (HUG) | 32 | — |
| padding Y | 6 | `scale/space/md` |
| padding X | 12 | `scale/space/xl` |
| gap (icon ↔ text) | 6 | `scale/space/md` |
| radius | 6 | `scale/radius/md` |
| bg (primary/filled) | `#000000` | `background/black/static` |

## Text

| Property | Value | Token |
|---|---|---|
| font | Inter Medium 14 / 20 | body-sm medium |
| color (primary) | `#ffffff` | `text/white/adaptive` |

## Icons

| Property | Value | Token |
|---|---|---|
| size | 14×14 | — |
| prefix icon stroke | `#ffffff` | `icon/white/static` |
| suffix / dropdown icon stroke | `#000000 @ 80%` | `icon/on brand/default` — **note mismatch**: icons rendered on black bg use `icon/on brand/default` (black) which is incorrect for contrast. Verify with design: likely should be `icon/white/static` too. |

## Component variant matrix (from main component name)

| Prop | Options seen in file |
|---|---|
| `Icon only` | True / False |
| `Type` | primary / secondary |
| `Appearance` | filled / ghost |
| `Size` | xs / sm / md (observed) |
| `State` | default / hover (observed; assume active/disabled/focus exist) |
| `On Dark` | True / False |

### Size matrix (inferred from instances observed across the file)

| Size | Height | Padding Y | Padding X | Font | Radius |
|---|---|---|---|---|---|
| xs | 24 | 4 (sm) | 4 (sm) | — (icon-only) | 6 (md) |
| sm | 28 | 6 (md) | 6 (md) | body-xs | 6 (md) |
| md | 32 | 6 (md) | 12 (xl) | body-sm medium | 6 (md) |

### Appearance × Type (inferred)

| Type × Appearance | Bg | Text | Border |
|---|---|---|---|
| primary / filled | `#000` | white | none |
| primary / ghost | transparent | `#0f172a` | none |
| secondary / ghost (sidebar) | transparent | `icon/neutral/subtle` | none; hover bg `background/neutral/faint` |
| secondary / filled | `#f8fafc` | `#0f172a` | `border/slate_blue/default` |

## States

| State | Primary filled bg | Ghost secondary bg |
|---|---|---|
| default | `#000` | transparent |
| hover | (infer: slight lift; not in this node) | `#f8fafc` |
| active/pressed | (not captured) | (not captured) |
| disabled | (not captured) | (not captured) |
| focus | ring — not captured | ring — not captured |

## Accessibility

- `<button type="button">` by default; `<a>` only if navigating.
- Icon-only buttons (`Icon only=True`) MUST have `aria-label`.
- Focus ring: NOT present in the Figma node — needs to be defined. Recommend 2px outer ring using `border/slate_blue/default` for on-white and inner 1px gap.

## Raw-hex escape

- The `icon/on brand/default` = `#000000 @ 80%` for the suffix icon on a black filled button is likely a Figma authoring mistake (the icon is invisible on a black bg). Flag for design review.

## Open items

- Icon-only button node is not on this page — must be referenced from elsewhere in the library (e.g. `1:1802` seen in breadcrumb extraction).
- Hover / focus / disabled visuals need to be captured from a separate state-variants frame.


## Fixes applied (2026-04-18)

- Icon-only variant bg: `#f1f5f9` (slate-100) -> `#f8fafc` (`background/neutral/faint`), matching Figma spec for icon-only ghost.
- File: `packages/kb-ui/src/components/primitives/Button.tsx` line 32 (Tailwind arbitrary value `bg-[#f1f5f9]` -> `bg-[#f8fafc]`).
- Closes diff-report item #1 (🟡).
