# Article-explorer (secondary tree nav)

**Figma**: `https://figma.com/design/9aGp5t9fH1d0PXi4LMhOdb/library-check?node-id=1-4823`
**Primary node**: `1:4824` (page `1:4823` "article-explorer" → frame "option 11")
**Component set (row states)**: `6:438`
**Storybook target**: `packages/kb-ui/src/components/nav/FileExplorerNav.tsx`

> All tokens below extracted live from Figma via `use_figma`. See `design/_tokens.md`.

## Anatomy

288px-wide panel, full-height (635px ref), white bg, 1px subtle border.
- Top bar (288×54): 6px vertical + 2px horizontal padding, hosts "Editor" label + search icon button.
- Divider row (288×4): 16px horizontal padding, full-width 1px line `border/slate_blue/subtle`.
- Tree body: vertical stack, 12px top + 12px bottom padding, 4px horizontal padding, 2px row gap.
- Rows: 36×36, each bound to a `type=…, state=…` variant from `6:438`.

## Frame tokens

| Property | Value | Token |
|---|---|---|
| panel width | 288px | — (fixed) |
| bg | `#ffffff` | `background/canvas/white` |
| border | 1px `#e2e8f0` (inside) | `border/slate_blue/subtle` |
| tree block padding | 12px top/bottom, 4px L/R | `xl` / `sm` |
| row gap | 2px | `scale/space/xs` |

## Row variants (component set `6:438`)

Each row is 284×36 with horizontal padding that encodes tree depth.

### type=folder (collapsible parent)

| Property | Value | Token |
|---|---|---|
| row padding | 0 L, 16 R | `scale/space/none` / `2xl` |
| inner container padding | 0, 0, 0, 20 (left indent) | `scale/space/3xl` |
| chevron button | 24×24, 4px padding, 6px radius | |
| icon: folder | ghost button 24×24, `scale/space/sm` padding, radius `md` | |
| label | Inter Regular 14/20 `#0f172a` | `text/neutral/default` |
| count chip | 24×24 wrapper, text Inter Regular 14/20 `#475569` | `text/neutral/subtle` |

### type=category (top-level, non-expandable)

| Property | Value | Token |
|---|---|---|
| row outer padding | 12 L, 12 R | `scale/space/xl` both sides |
| row inner container | 260×36, padding 6Y 4X, radius 8 | `md` Y, `sm` X, radius `lg` |

### type=article (leaf)

| Property | Value | Token |
|---|---|---|
| row outer padding | 16 L, 12 R | `2xl` L, `xl` R |
| inner padding | 0 TB, 4 L, 0 R | — |
| icon | 16×16 (article glyph) | |
| label | Inter Regular 14/20 | `text/neutral/default` |
| status dot (if published) | 4×4 circle | `background/accents/green/default` `#42cd83` |
| status dot (if draft) | 4×4 circle | `background/accents/gray/default` `#898989` |

## States

| State | Row inner bg |
|---|---|
| default | transparent |
| hover | `#f8fafc` `background/neutral/faint` |
| **active** | `#e6e6e6 @ 44%` — **RAW HEX, NO VARIABLE** — flagged for design |
| active-sub | same as active |
| but article view | `#f8fafc` `background/neutral/faint` (appears on category rows that contain the currently viewed article) |

## Typography

| Role | Style | Token |
|---|---|---|
| row label | Inter Regular 14 / 20 | `text/neutral/default` |
| row count | Inter Regular 14 / 20 | `text/neutral/subtle` |

## Raw-hex escape

- **`#e6e6e6 @ 44%`** — row active background. Not bound to any variable in Figma. Must be promoted to a design token (e.g. `background/row/active`) or approximated via a CSS layer. Currently in code as `rgba(230,230,230,0.44)`.

## Accessibility

- Tree must be `<ul role="tree">` with each row as `<li role="treeitem" aria-expanded={…} aria-level={…}>`.
- Selected row needs `aria-current="page"` (or `aria-selected="true"` if multi-select).
- Chevron button is decorative for AT when row itself is expandable — use `aria-hidden` on the chevron, toggle expansion from row click.

## Row alignment rule (2026-04-20)

- **Article rows render a 24×24 phantom spacer at the head of the inner container**, in the same slot where `type=folder` renders the chevron button. This keeps the article glyph horizontally aligned with folder glyphs at the same depth. See `_layout-invariants.md` row-geometry section.
- Source: `packages/kb-ui/src/components/nav/FileExplorerNav.tsx` — `<span aria-hidden className="size-6 shrink-0" />` inside `ArticleRow` before `RiArticleLine`.
