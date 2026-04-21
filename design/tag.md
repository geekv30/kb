# Tag (aka Badge)

**Figma**: `https://figma.com/design/9aGp5t9fH1d0PXi4LMhOdb/library-check?node-id=2-400`
**Primary nodes**: `2:401` (Published), `2:408` (Draft) — page `2:400`
**Storybook target**: `packages/kb-ui/src/components/primitives/Badge.tsx`

> All tokens below extracted live from Figma via `use_figma`. See `design/_tokens.md`.

## Anatomy

Pill-shaped container (`radius/smooth` = 999) with optional leading status dot + status text + optional close button.

## Shared frame tokens

| Property | Value | Token |
|---|---|---|
| outer gap (multi-tag container) | 4 | `scale/space/sm` |
| inner layout | horizontal, center/center, 4 gap | `scale/space/sm` |
| padding X (published) | 4 L, 8 R | `sm` / `lg` |
| padding X (draft) | 8 L, 8 R | `lg` / `lg` |
| padding Y | 2 | `scale/space/xs` |
| radius | 999 (pill) | `scale/radius/smooth` |

## Variants extracted

### Published (`2:401`)

| Property | Value | Token |
|---|---|---|
| bg | `#f2fdf6` | `background/accents/green/soft` |
| dot size | 4×4 ellipse, left of text | |
| dot color | `#086e3f` | `icon/success/subtle` |
| text | "Published" Inter Medium 12/18 | body-xs medium |
| text color | `#086e3f` | `text/accent/green/default` |
| close icon (hidden) | 12×12 stroke `#086e3f` | `icon/accents/green/default` |

### Draft (`2:408`)

| Property | Value | Token |
|---|---|---|
| bg | `#fcfcfc` | `background/canvas/subtle` |
| no dot | — | (dot is hidden on this variant) |
| text | "Draft" Inter Medium 12/18 | body-xs medium |
| text color | `#0f172a` | `text/neutral/default` |

## State matrix (by status semantic)

| Status | Bg | Text color | Dot color |
|---|---|---|---|
| published | `background/accents/green/soft` | `text/accent/green/default` | `icon/success/subtle` |
| draft | `background/canvas/subtle` | `text/neutral/default` | none |
| (inferred: failed / in-review) | likely `accents/red/*` and `accents/amber/*` — not in this node |

## Accessibility

- If the tag conveys state critical to comprehension (e.g. "Draft"), the color dot alone is insufficient — text label is required (already present in spec).
- For close affordance, the X must be a `<button type="button" aria-label="Remove {tag name}">`.

## Raw-hex escape

None — all colors resolve to tokens.


## Fixes applied (2026-04-18)

- Draft / Neutral variant bg: `#f1f5f9` (slate-100) -> `#fcfcfc` (`background/canvas/subtle`).
- Draft / Neutral variant text: `#475569` (`text/neutral/subtle`) -> `#0f172a` (`text/neutral/default`).
- File: `packages/kb-ui/src/components/primitives/Badge.tsx` lines 14-15 (`variantStyles.draft` and `variantStyles.neutral`).
- Closes diff-report item #3 (🔴).
