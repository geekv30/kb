# ArticleSettingsPanel

**File:** `packages/kb-ui/src/components/content/ArticleSettingsPanel.tsx`
**Story:** `Components/Content/ArticleSettingsPanel`
**Built:** 2026-04-21 (Phase 5 step 2)

The right-rail settings panel that accompanies the article editor. Bundles
all article metadata — author, category, slug, tags, publish date, SEO title,
visibility, reviewers — into a single collapsible card.

---

## Panel geometry

| Property | Spec | Implementation |
|---|---|---|
| Width | 452px | `w-[452px]` |
| Background | `#ffffff` | `bg-white` |
| Border | 1px `#e2e8f0` | `border border-[#e2e8f0]` |
| Border radius | 12 | `rounded-[12px]` |
| Padding | py 24 / px 22 | `py-6 px-[22px]` |
| Shadow | `0 4 6 -1 rgba(0,0,0,.05), 0 2 4 -2 rgba(0,0,0,.10)` | `shadow-[...]` arbitrary |
| Gap between fields | 20 | `gap-5` (inner stack) |

## Header

| Element | Spec | Notes |
|---|---|---|
| Leading icon | `RiSettings5Line` 16px `#0f172a` | shrink-0 |
| Title | "Settings" 14/20 Medium `#0f172a` | flex-1 |
| Trailing chevron | `RiArrowUpSLine` when expanded, `RiArrowDownSLine` when collapsed | 16px |
| Header gap | 8 | `gap-2` |
| Divider below header | 1px `#e5e5e5`, full width | only when expanded, `mt-5` from header, `mt-5` before first field |

Clicking the header toggles the collapsed state. `aria-expanded` + `aria-controls` announce
the state to screen readers. In the collapsed state the field stack is not rendered.

## Field shape (shared)

| Element | Spec | Implementation |
|---|---|---|
| Label | 14/20 Medium `#0f172a` | `FieldLabel` |
| Box height | 40 | `min-h-[40px]` (allows tag box to grow) |
| Box border | 1px `#e5e5e5`, focus-within → `#cbd5e1` | `border-[#e5e5e5]` |
| Box radius | 8 | `rounded-[8px]` |
| Box padding LR | 12 | `px-3` |
| Body text | 14/20 Regular `#0f172a`, placeholder `#94a3b8` | |
| Chevron suffix | `RiArrowDownSLine` 16px `#94a3b8`, right-aligned | `ml-auto` |
| Char counter | 12/18 Regular `#94a3b8`, right-aligned | `tabular-nums` |

## Field list (in order)

1. **Author** — 20px Avatar prefix + name text + chevron
2. **Category** — text + chevron
3. **Article Slug** — text `<input>` + chevron + char counter X/32 (above right). `maxLength = 32` per Figma `53:8464` (counter reads `14/32`).
4. **Tags** — chips inside 40-tall box (box grows via flex-wrap if many chips). Chip is a 22-tall pill bg `#f1f5f9`, text 12 Medium `#0f172a`, trailing `×` 12px. Trailing `+ Add` pill with dashed `#cbd5e1` border
5. **Publish date** — `RiCalendar2Line` 16px prefix + date text (no chevron per spec)
6. **SEO title** — text `<input>` + char counter X/60 (above right). `maxLength = 60`.
7. **Visibility** — text + chevron. Options `Public` | `Internal` | `Draft`
8. **Reviewers** — horizontal stack of 24×24 Avatars with `ring-2 ring-white` and `-ml-2` on all but the first (overlap). Trailing 24×24 dashed-border `+ Add` circle with `RiAddLine` 14px

## API

```tsx
export type ArticleVisibility = 'Public' | 'Internal' | 'Draft';

export type ArticleSettingsPerson = {
  name: string;
  initials: string;
};

export type ArticleSettings = {
  author?: ArticleSettingsPerson;
  category?: string;
  slug?: string;
  tags?: string[];
  publishDate?: string; // e.g. "Apr 12, 2026"
  seoTitle?: string;
  visibility?: ArticleVisibility;
  reviewers?: ArticleSettingsPerson[];
};

export type ArticleSettingsPanelProps = {
  value?: ArticleSettings;
  onChange?: (v: ArticleSettings) => void;
  defaultCollapsed?: boolean;
  className?: string;
};
```

## Stories

| Story | Purpose |
|---|---|
| `Default` | All 8 fields populated (author VK, tags Security/Account/Password, reviewers AK/MR/TS) |
| `Empty` | Placeholders only — every field renders in its empty state |
| `Collapsed` | `defaultCollapsed: true` — only header + downward chevron |
| `Interactive` | `useState` wiring + JSON mirror; tag × and reviewer + modify live state |

---

## Decisions log

### 1. No Radix primitives for v1

The spec explicitly calls out "These are presentational for v1. No real dropdown menus need
to open." Wiring Radix DropdownMenu / Popover for 5 of the 8 fields would be premature. Each
field that would normally be a Select is rendered as a focusable `<button>` with a chevron;
the `onClick` is currently a no-op (the prop is reserved for v2).

Focus state is CSS-only: `focus:border-[#cbd5e1]`. `focus-within` on the slug and SEO title
input wrappers gives the same treatment when a nested `<input>` is focused.

### 2. Tag chip is NOT the `Badge` primitive

`Badge` is optimized for 3 variants (`published` / `draft` / `neutral`) with specific color
pairs and a small dot accent. The tag chip here needs (a) a trailing `×` close affordance
and (b) the exact `#f1f5f9` background from the spec. Forcing that through `Badge.className`
overrides would leak styling concerns — a separate `TagChip` keeps Badge semantically clean
and avoids bloating the Badge API with a `removable` prop that no other consumer needs.

### 3. Reviewer stack via `ring-2 ring-white + -ml-2`

The classic "overlapping avatar row" pattern. Using a 2px white ring per avatar fakes the
cut-out without requiring SVG masks, and `-ml-2` on every avatar except the first creates a
4px (−8 + 12) visible stripe on the left edge of each subsequent avatar. Add button is the
same 24×24 dimension with a dashed border so the stack terminates cleanly.

### 4. Author avatar sized down to 20×20

The spec says the author field has a "20×20 Avatar prefix". The shared `Avatar` primitive
defaults to 24×24 (size-6). We override with `className="size-5 text-[10px] leading-[16px]"`
— the primitive stays unchanged, the consumer sites the smaller tile.

### 5. `value` is treated like `defaultValue` when there is no `onChange`

Pragmatic choice: the Default/Empty/Collapsed stories pass `value` but no `onChange` — they
still want × / + Add to feel alive. The component mirrors `value` into local state on mount
(and when `value` identity changes) and fires `onChange` if one is provided. Fully controlled
usage (Interactive story) works because the parent's `onChange` is the source of truth.

### 6. Char counter for slug lives above-right of the input

Spec: "12/18 Regular `#94a3b8` right-aligned below or inside the input". Placing it above
right (level with the label) stays out of the way of the chevron suffix and matches
well-known patterns (Linear's settings, Vercel's project config).

### 7. Slug input enforces 32-char cap; SEO title enforces 60

- **Slug**: `SLUG_MAX = 32`. `input maxLength={32}` blocks typing past 32;
  the controlled handler does a redundant `.slice(0, 32)` so paste
  operations are capped too. Figma `53:8464` shows the counter reading
  `14/32`, fixing an earlier 60-char assumption.
- **SEO title**: `SEO_MAX = 60`, unchanged. Figma shows `32/60` for the
  populated SEO title.

Both are soft caps wired through a single constant each, so story data
paste and manual entry obey the same cap.
