# Table (sub-categories + articles)

**Figma**: `https://figma.com/design/9aGp5t9fH1d0PXi4LMhOdb/library-check?node-id=1-5178`
**Primary nodes**: `1:5202` (Sub-categories), `1:5219` (Articles with Status column) — page `1:5178`
**Storybook target**: `packages/kb-ui/src/components/content/SubCategoriesTable.tsx` (and similar)

> All tokens below extracted live from Figma via `use_figma`. See `design/_tokens.md`.

## Anatomy

Full-width (938px ref) container with 24px left/right gutter. Inside: 890×* `<table>` frame with 1px subtle border and 8px radius. First column is wide (flex), subsequent columns are fixed (48 / 127).

## Outer container

| Property | Value | Token |
|---|---|---|
| padding | 4 TB, 24 LR | `scale/space/sm` / `4xl` |
| gap (siblings) | 16 | `scale/space/2xl` |

## Table frame

| Property | Value | Token |
|---|---|---|
| radius | 8 | `scale/radius/lg` |
| border | 1 inside `#e5e5e5` | `border/neutral/subtle` |

## Heading row

| Property | Value | Token |
|---|---|---|
| height | 48 | — |
| bg | `#f5f5f5` | `background/canvas/default` |
| padding | 0 TB, 16 LR (label aligned to body-row icon's left edge — NOT 24 LR) | — / `scale/space/2xl` |
| divider | 1 `#e5e5e5` bottom (visual separation from body) | `border/neutral/subtle` |
| text | Inter Medium 14/20 `#475569` | `text/neutral/subtle` |
| text-transform | None (casing preserved) | |

## Body row

| Property | Value | Token |
|---|---|---|
| height | 48 | — |
| padding | 6 TB, 16 LR | `scale/space/md` / `2xl` |
| inner container gap | 4 (icon ↔ label) | `scale/space/sm` |
| row stroke (divider) | 1 `#e5e5e5` inside, hidden on last | `border/neutral/subtle` |
| row label | Inter Regular 14/20 `#0f172a` | `text/neutral/default` |
| icon | 24×24 ghost button (folder / file glyph) | |
| trailing chevron (per row, SubCategoriesTable) | `RiArrowRightSLine` 16px `#64748b`, right padding 16, vertically centered | `text/neutral/subtle` |

## Status column (Articles table only)

- Cell padding: 6 TB, 20 LR (`scale/space/3xl` L/R)
- Content: `Tag` component (see `design/tag.md`), pinned top-left via `Tags Container` with 4px horizontal gap.

## Last column (Actions, 48px wide)

- Heading cell: same bg / padding but hidden "Link" text (`#475569`).
- Body cell: centered ghost button 24×24 with icon (vertical ellipsis).

## Raw-hex escape

None — all colors resolve to tokens.

## Accessibility

- Container MUST be a semantic `<table>` — currently rendered as div grid; flag for fix.
- Heading row: `<thead><tr><th scope="col">…</th></tr></thead>`.
- Body: `<tbody><tr><td>…</td></tr></tbody>`.
- Icon-only action buttons need `aria-label="More actions for {row title}"`.
- Sortable columns (not in this node) should expose `aria-sort="none|ascending|descending"`.

## Open items

- Hover state not captured in this node. Existing implementation uses `#fafafa` — suggest promoting to `background/row/hover-soft`.
- "Empty state" / "loading" / "error" views not documented in Figma — to be designed.


## Fixes applied (2026-04-18)

- ArticlesTable heading: removed `uppercase` class so "Articles" preserves case, matching SubCategoriesTable reference.
- Heading bg: `#f8fafc` (`background/neutral/faint`) -> `#f5f5f5` (`background/canvas/default`) on both ArticlesTable and SubCategoriesTable heading rows.
- Files: `packages/kb-ui/src/components/content/ArticlesTable.tsx` line 23; `packages/kb-ui/src/components/content/SubCategoriesTable.tsx` line 19.
- Closes diff-report item #6 (🔴 case + 🟡 bg).


## Fixes applied (2026-04-20) — trailing chevron on sub-category rows

- Re-introduced per-row trailing chevron (`RiArrowRightSLine` 16px `#64748b`) on the far right of every body row in `SubCategoriesTable`, with 16px right padding. Chevron is bare decorative icon (`aria-hidden`), not a nested button — the row itself owns the click.
- Heading `<th>` now uses `colSpan={2}` so the heading-bar visuals stay identical while the body splits across two cells. Empty-state `<td>` likewise uses `colSpan={2}`.
- **Figma reconciliation:** Figma nodes `1:5202` (library-check / Sub-categories primary) and `31:1120` (revamped page embedding) do NOT show a trailing chevron. This reintroduction is per user image #13 direction and the task fallback path — documented here so future audits do not remove it silently.


## Fixes applied (2026-04-20) — heading-row bg -> white + left-align heading to body icon

- Heading-row bg: `#f5f5f5` -> `#ffffff` (`background/canvas/white`) on both `SubCategoriesTable` and `ArticlesTable`. Heading-row now shares the card background; visual separation from body is preserved by the 1px `#e5e5e5` bottom border on the heading `<tr>`.
- Heading-label left padding: first `<th>` shifted from `px-6` (24 LR) to `pl-4` (16 L). This aligns the heading label's left edge to the body-row icon button's left edge (delta ≈ 0.01 px @ 1280).
- Secondary column heads (`Status`, `Author`, `Last Updated`) also shifted from `px-6` to `px-4` so they line up with their body cells (which use `px-4`).
- Body-row rules unchanged.
- Files: `packages/kb-ui/src/components/content/SubCategoriesTable.tsx:39-46`, `packages/kb-ui/src/components/content/ArticlesTable.tsx:53-79`.
- Verified at 1280: heading bg `rgb(255, 255, 255)`; heading bottom border `1.11px rgb(229, 229, 229)`; heading-text paintLeft `57.09` == body-icon-btn left `57.08` (delta 0.01 px).


## Fixes applied (2026-04-21) — revert heading-row bg back to GREY

- Reverting the 2026-04-20 change above: user confirmed (screenshot pass) that Hiver heading row is GREY `#f5f5f5` (`background/canvas/default`), NOT white. The spec table above has been updated to reflect grey as the canonical value.
- Heading-row bg: `#ffffff` -> `#f5f5f5` on both `SubCategoriesTable` and `ArticlesTable`.
- Heading-label `pl-4` alignment with body-row icon is retained.
- Verified at 1280 (KBCategoryPage): subCat header bg `rgb(245, 245, 245)`; articles header bg `rgb(245, 245, 245)`.
- Row icons also swapped to Phosphor regular (Folder, FileText, CaretRight, DotsThreeVertical) — see `design/_tokens.md` changelog.
