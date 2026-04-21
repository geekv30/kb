# Design Tokens — Extracted from Figma

**Source**: `https://figma.com/design/9aGp5t9fH1d0PXi4LMhOdb/library-check`
**Extraction date**: 2026-04-18
**Method**: Figma Plugin API via `use_figma` — `getNodeByIdAsync` + `boundVariables` resolution

All tokens below are authoritative — resolved from Figma's variable system, not inferred from pixels.

## Spacing scale (`scale/space/*`)

| Token | Px | Common uses |
|---|---|---|
| `none` | 0 | zero padding/gap |
| `xs` | 2 | tight inner padding |
| `sm` | 4 | icon↔label gap, breadcrumb item padding |
| `md` | 6 | row top/bottom padding, button inner gap |
| `lg` | 8 | rail outer padding, vertical rhythm |
| `xl` | 12 | button horizontal padding |
| `2xl` | 16 | container padding, breadcrumb outer vertical |
| `3xl` | 20 | tree indent per level, table cell Y padding |
| `4xl` | 24 | page gutters, page-header side padding |

## Radius scale (`scale/radius/*`)

| Token | Px |
|---|---|
| `none` | 0 |
| `xs` | 2 |
| `sm` | 4 |
| `md` | 6 |
| `lg` | 8 |
| `smooth` | 999 (full pill) |

## Typography

| Token | Value |
|---|---|
| `typography/font_family` | Inter |
| `typography/font_weight/Regular` | 400 |
| `typography/font_weight/Medium` | 500 |
| `typography/font_weight/Semibold` | 600 |
| `typography/line_height/18` | 18px (body-xs) |
| `typography/line_height/20` | 20px (body-sm) |
| `typography/line_height/24` | 24px (body-md / title-sm) |
| `typography/line_height/28` | 28px (title-md) |

Common text styles:
- body-sm: Inter 14 / 20 / 0%
- body-xs: Inter 12 / 18 / 0%
- title-sm: Inter SemiBold 16 / 24
- title-md: Inter SemiBold 18 / 28

## Color tokens (resolved to hex)

### text/*
| Variable | Hex | Notes |
|---|---|---|
| `text/neutral/default` | `#0f172a` | primary body text |
| `text/neutral/subtle` | `#475569` | secondary / description |
| `text/white/adaptive` | `#ffffff` | on-dark / on-brand |
| `text/accent/green/default` | `#086e3f` | success tag text |
| `text/accent/gray/default` | `#525252` | avatar initials |

### background/*
| Variable | Hex |
|---|---|
| `background/canvas/white` | `#ffffff` |
| `background/canvas/default` | `#f5f5f5` (table-head grey) |
| `background/canvas/subtle` | `#fcfcfc` (draft tag) |
| `background/neutral/faint` | `#f8fafc` (hover base) |
| `background/black/static` | `#000000` (primary button) |
| `background/white/adaptive_200` | `#ffffff @ 20%` |
| `background/accents/green/default` | `#42cd83` (online dot) |
| `background/accents/green/soft` | `#f2fdf6` (success-tag bg) |
| `background/accents/gray/soft` | `#e5e5e5` (avatar bg) |
| `background/accents/gray/default` | `#898989` (draft dot) |
| `background/accents/gray/strong` | `#2d2d2d` |

### border/*
| Variable | Hex |
|---|---|
| `border/slate_blue/subtle` | `#e2e8f0` |
| `border/slate_blue/default` | `#cbd5e1` |
| `border/neutral/subtle` | `#e5e5e5` |

### icon/*
| Variable | Hex |
|---|---|
| `icon/neutral/default` | `#0f172a` |
| `icon/neutral/subtle` | `#475569` |
| `icon/neutral/faint` | `#64758b` |
| `icon/white/static` | `#ffffff` |
| `icon/on brand/default` | `#000000 @ 80%` |
| `icon/success/subtle` | `#086e3f` |
| `icon/accents/green/default` | `#086e3f` |
| `icon/accents/purple/default` | `#6634ef` |

## Known raw-hex escapes (NOT variables)

These appear in the Figma file but are NOT bound to a variable. Suggested promotion to tokens:

| Hex | Where it's used | Suggested token |
|---|---|---|
| `#e6e6e6 @ 44%` | article-explorer row active state (bg) | `background/row/active` |
| `#f5f5f5` is bound but shown on table heading — valid | | |
