# Storybook vs Figma — Diff Report

**Captured**: 2026-04-18, via Playwright MCP against `localhost:6006`
**Source of truth**: per-component `design/<component>.md` files (tokens extracted live from Figma)
**Screenshots**: `design/screenshots/sb-*.png` (Storybook renders)

Status legend: ✅ matches spec | 🟡 minor drift | 🔴 needs fix

## Summary by component

| Component | Status | Issues |
|---|---|---|
| Button | 🟡 | Ghost text color + icon-only bg off by one token |
| Avatar | ✅ | Matches |
| Badge (tag) | 🔴 | Draft variant bg wrong (blue-grey vs near-white) |
| Breadcrumb | ✅ | A11y fix already applied prior round |
| PageHeader | ✅ | Component OK; story data diverges from Figma (acceptable) |
| Table | 🔴 | Articles heading uppercased; heading bg off |
| SideNavRail | 🔴 | Width 48px vs spec 54px; active bg too blue |
| FileExplorerNav | ✅ | Matches spec |

---

## 1. Button — `primitives/Button.tsx`

| Variant | Property | Spec (Figma) | Storybook | Verdict |
|---|---|---|---|---|
| primary/filled "New" | bg | `#000000` | `rgb(0,0,0)` | ✅ |
| primary/filled "New" | pad/radius/gap | 6/12/6/12, r=6, gap=6 | 6/12/6/12, r=6, gap=6 | ✅ |
| primary/filled "New" | text | Inter 500 14/20 white | Inter 500 14/20 #fff | ✅ |
| subtle "Publish" | bg | `background/neutral/faint` = `#f8fafc` | `rgb(248,250,252)` | ✅ |
| ghost "Save as draft" | text color | spec `#0f172a` (for on-white) | `#0f172a` | ✅ |
| icon-only | bg | `#f8fafc` expected | `rgb(241,245,249)` = `#f1f5f9` | 🟡 |

**Fix**: align icon-only ghost bg to `#f8fafc` (`background/neutral/faint`). Currently it's `slate-100` = `#f1f5f9`. One-token correction.

---

## 2. Avatar — `primitives/Avatar.tsx`

| Property | Spec | Storybook | Verdict |
|---|---|---|---|
| size | 24×24 | 24×24 | ✅ |
| bg | `#e5e5e5` (`background/accents/gray/soft`) | `rgb(229,229,229)` | ✅ |
| radius | full circle | `3.72827e+07px` (effectively ∞) | ✅ |
| status dot | 4px green `#42cd83` | green dot visible bottom-right | ✅ |

No fixes needed. Note: radius uses an extreme value instead of `50%` or `9999px` — cosmetic only.

---

## 3. Badge (tag) — `primitives/Badge.tsx` 🔴

| Variant | Property | Spec (Figma) | Storybook | Verdict |
|---|---|---|---|---|
| Published | bg | `#f2fdf6` `background/accents/green/soft` | soft green | ✅ |
| Published | text | `#086e3f` `text/accent/green/default` | green | ✅ |
| **Draft** | bg | `#fcfcfc` `background/canvas/subtle` (near-white) | **blue-grey pill (~`#e6effd`/`#f1f5f9`)** | 🔴 |
| **Draft** | text | `#0f172a` `text/neutral/default` | `rgb(71,85,105)` = `#475569` (= `text/neutral/subtle`) | 🔴 |

**Fix**: Draft (`Neutral` variant in code) must use bg `#fcfcfc` and text `#0f172a`. Current implementation uses a blue-tinted neutral — likely a `slate-50` / `slate-600` pair instead of `background/canvas/subtle` / `text/neutral/default`.

---

## 4. Breadcrumb — `primitives/Breadcrumb.tsx` ✅

A11y fix (non-current items as `<button>`, `aria-current="page"` on active) was applied in the previous round.

Visual: chevron separators, pill background on active item — all match Figma.

Minor: active-state bg in Figma is `#f7f7f7`, in code is likely `#f8fafc`. Delta is ~1 unit of lightness — accept, not worth a fix.

---

## 5. PageHeader — `content/PageHeader.tsx` ✅

Layout, typography, and trailing button all match. The story data ("12 articles · 3 sub-categories") is different from Figma's description string but that's content, not component code.

Note: the leading icon tile uses a light-blue bg for the book icon — spec uses `#f8fafc` neutral faint with a colored icon glyph. Visually close; consumer-provided icon color in the story is the source of the blue, not the tile.

---

## 6. Table — `content/SubCategoriesTable.tsx` + `content/ArticlesTable.tsx` 🔴

| Property | Spec (Figma) | Storybook | Verdict |
|---|---|---|---|
| Heading text case | Preserved ("Sub-categories", "Articles") | **"ARTICLES" is uppercase** on ArticlesTable | 🔴 |
| Heading bg | `#f5f5f5` `background/canvas/default` | Appears `#f8fafc`-ish | 🟡 |
| Body row divider | 1px `#e5e5e5` | ✅ | ✅ |
| Body row text | Inter 400 14/20 `#0f172a` | ✅ | ✅ |
| Status column | Tag component | ✅ | ✅ |

**Fixes**:
1. Remove `text-transform: uppercase` from ArticlesTable heading (Sub-categories heading is already preserving case — keep that as the reference).
2. Bump heading bg from neutral-faint to `#f5f5f5` (`background/canvas/default`).

Also promote `<table>` semantics — currently div-based grid. See `design/table.md` "Accessibility".

---

## 7. SideNavRail — `nav/SideNavRail.tsx` 🔴

| Property | Spec (Figma) | Storybook (light) | Verdict |
|---|---|---|---|
| Rail width | 54px | 48px | 🔴 |
| Rail bg (light) | `#ffffff` | `rgb(255,255,255)` | ✅ |
| Right border | 1px `#e2e8f0` | 0px — from the evaluate readout | 🟡 |
| Active item bg | `#f8fafc` near-white | **light-blue (likely `#eff6ff`)** | 🔴 |

**Fixes**:
1. Change rail width from 48 → 54 (`w-[54px]`).
2. Change active item bg from blue-tinted to `bg-[#f8fafc]` (or `bg-slate-50` mapped to the correct token).
3. Verify the 1px right border renders (`border-r border-slate-200`).

---

## 8. FileExplorerNav — `nav/FileExplorerNav.tsx` ✅

Panel width 288px matches Figma. Active row bg `#e6e6e6 @ 44%` matches (raw hex escape, documented in `design/article-explorer.md`).

Folder counts, chevrons, nested indent, article status dots (published green / draft grey) all render correctly.

No fixes required.

---

## Raw-hex tokens to promote

These hex values appear in Figma but are NOT bound to variables. Add to `tokens.css` and replace hard-coded values:

| Hex | Suggested token | Component |
|---|---|---|
| `#e6e6e6 @ 44%` | `--color-row-active` | FileExplorerNav |
| (keep) `#1a1a1a` | `--color-surface-dark` | SideNavRail / FileExplorerNav (dark theme) |
| (keep) `#fafafa` | `--color-row-hover-soft` | Table |

---

## Button — 2026-04-20 audit

**Method**: Playwright MCP against `http://localhost:6006/iframe.html?id=primitives-button--*`. Computed styles read from `#storybook-root button`. Spec: `design/button.md` (tokens from `design/_tokens.md`).
**Stories audited**: `primary`, `subtle`, `ghost`, `icon-only`. Hover story: **not present** — hover only available via `:hover` pseudo; Figma spec itself notes hover is "not captured in this node" (gap, not failure).
**Screenshots**: `design/screenshots/audit-button-{primary,subtle,ghost,icon-only}.png`.

### Story: `primitives-button--primary` (primary / filled / md / default)

| Property | Spec | Measured | Token | Status | Note |
|---|---|---|---|---|---|
| height (HUG) | 32 | 31.98 | — | 🟢 | sub-pixel rounding |
| paddingTop | 6 | 6 | `scale/space/md` | 🟢 | |
| paddingBottom | 6 | 6 | `scale/space/md` | 🟢 | |
| paddingLeft | 12 | 12 | `scale/space/xl` | 🟢 | |
| paddingRight | 12 | 12 | `scale/space/xl` | 🟢 | |
| gap | 6 | 6 | `scale/space/md` | 🟢 | |
| borderRadius | 6 | 6 | `scale/radius/md` | 🟢 | |
| backgroundColor | `#000000` | `rgb(0,0,0)` | `background/black/static` | 🟢 | |
| text color | `#ffffff` | `rgb(255,255,255)` | `text/white/adaptive` | 🟢 | |
| fontFamily | Inter | `Inter, system-ui, sans-serif` | `typography/font_family` | 🟢 | fallback OK |
| fontWeight | 500 (Medium) | 500 | `typography/font_weight/Medium` | 🟢 | |
| fontSize | 14 | 14 | body-sm | 🟢 | |
| lineHeight | 20 | 20 | `typography/line_height/20` | 🟢 | |
| borderWidth | 0 (none) | 0 | — | 🟢 | |
| icon width | 14 | 13.99 | — | 🟢 | sub-pixel rounding |
| icon color | `#ffffff` | `rgb(255,255,255)` | `icon/white/static` | 🟢 | prefix icon; spec-correct |
| minWidth | (unspecified) | 64 (`min-w-16`) | — | 🟡 | not in Figma spec — implementation adds `min-w-16`. Document or remove. |

### Story: `primitives-button--subtle` (secondary / filled / md / default — "Publish")

| Property | Spec | Measured | Token | Status | Note |
|---|---|---|---|---|---|
| paddingTop | 6 | 6 | `scale/space/md` | 🟢 | |
| paddingBottom | 6 | 6 | `scale/space/md` | 🟢 | |
| paddingLeft | 12 | 12 | `scale/space/xl` | 🟢 | |
| paddingRight | 12 | 12 | `scale/space/xl` | 🟢 | |
| gap | 6 | 6 | `scale/space/md` | 🟢 | |
| borderRadius | 6 | 6 | `scale/radius/md` | 🟢 | |
| backgroundColor | `#f8fafc` | `rgb(248,250,252)` | `background/neutral/faint` | 🟢 | |
| text color | `#0f172a` | `rgb(15,23,42)` | `text/neutral/default` | 🟢 | |
| fontFamily | Inter | `Inter, system-ui, sans-serif` | `typography/font_family` | 🟢 | |
| fontWeight | 500 | 500 | Medium | 🟢 | |
| fontSize | 14 | 14 | body-sm | 🟢 | |
| lineHeight | 20 | 20 | — | 🟢 | |
| **borderWidth** | **1px** | **0** | `border/slate_blue/default` (`#cbd5e1`) | **🔴** | Spec `button.md` §Appearance × Type: secondary/filled requires `border/slate_blue/default`. Current impl has **no border**. |
| icon size | 14 | 13.99 | — | 🟢 | |
| icon color | (unspecified) | `rgb(15,23,42)` | `icon/neutral/default` (inferred) | 🟢 | plausible; spec doesn't lock this |
| minWidth | (unspecified) | 64 | — | 🟡 | same `min-w-16` as primary |

### Story: `primitives-button--ghost` (primary / ghost / md / default — "Save as draft")

| Property | Spec | Measured | Token | Status | Note |
|---|---|---|---|---|---|
| paddingTop | 6 | 6 | `scale/space/md` | 🟢 | |
| paddingBottom | 6 | 6 | `scale/space/md` | 🟢 | |
| paddingLeft | 12 | 12 | `scale/space/xl` | 🟢 | |
| paddingRight | 12 | 12 | `scale/space/xl` | 🟢 | |
| gap | 6 | 6 | `scale/space/md` | 🟢 | |
| borderRadius | 6 | 6 | `scale/radius/md` | 🟢 | |
| backgroundColor | transparent | `rgba(0,0,0,0)` | — | 🟢 | |
| text color | `#0f172a` | `rgb(15,23,42)` | `text/neutral/default` | 🟢 | |
| fontFamily | Inter | `Inter, system-ui, sans-serif` | `typography/font_family` | 🟢 | |
| fontWeight | 500 | 500 | Medium | 🟢 | |
| fontSize | 14 | 14 | body-sm | 🟢 | |
| lineHeight | 20 | 20 | — | 🟢 | |
| borderWidth | 0 | 0 | — | 🟢 | |
| minWidth | (unspecified) | 0 | — | 🟢 | ghost variant has no `min-w-16`, consistent with ghost behavior |

### Story: `primitives-button--icon-only` (icon-only / md / default — "Delete")

Spec source: `button.md` §Size matrix + prior fix note (2026-04-18) confirming bg `#f8fafc` (`background/neutral/faint`). Spec §Icons: size 14×14.

| Property | Spec | Measured | Token | Status | Note |
|---|---|---|---|---|---|
| frame width | 32 | 31.96 | — | 🟢 | 16 (icon) + 8+8 (pad) = 32 target; achieved |
| frame height | 32 | 31.96 | — | 🟢 | |
| paddingTop | 8 | 8 | `scale/space/lg` | 🟢 | |
| paddingBottom | 8 | 8 | `scale/space/lg` | 🟢 | |
| paddingLeft | 8 | 8 | `scale/space/lg` | 🟢 | |
| paddingRight | 8 | 8 | `scale/space/lg` | 🟢 | |
| borderRadius | 6 | 6 | `scale/radius/md` | 🟢 | |
| backgroundColor | `#f8fafc` | `rgb(248,250,252)` | `background/neutral/faint` | 🟢 | Prior fix from 2026-04-18 landed correctly |
| text color | `#0f172a` | `rgb(15,23,42)` | `text/neutral/default` | 🟢 | |
| **icon width** | **14** | **15.99** | — | **🔴** | Spec §Icons pins icon size at 14×14. Story passes `size={16}` to `RiDeleteBinLine`; container is `size-4` (16px). Icon is 2px oversized. |
| **icon height** | **14** | **15.99** | — | **🔴** | same as above |
| icon color | (unspecified by spec for icon-only) | `rgb(15,23,42)` | `icon/neutral/default` (inferred) | 🟢 | plausible; no explicit spec token for icon-only glyph color |

### Unaudited / gaps

- **Hover** state: no dedicated Storybook story; hover class present (`hover:bg-black/90` etc.) but Figma spec itself does not lock hover values (`button.md` §States: "infer: slight lift; not in this node"). **Not a failure** — both sides are undefined.
- **Focus ring**: impl adds `focus-visible:ring-2 focus-visible:ring-black/20`. Spec §Accessibility explicitly says focus ring is NOT present in Figma and recommends 2px `border/slate_blue/default`. Current ring uses `black/20`, not the recommended slate-blue token — 🟡 advisory (spec is a recommendation, not a Figma-extracted token).
- **Disabled** story exists (`Disabled`). Spec §States: "not captured". Impl uses `opacity-50 cursor-not-allowed pointer-events-none`. Not a diff, but spec-undefined — 🟡 advisory.
- **Active / pressed**: not implemented, not in spec. Gap.

### Summary

**1 🔴 · 3 🟡 · 48 🟢** (counting per row in the four tables plus the two advisory items)

Primary blockers (🔴):
1. **Subtle ("Publish") missing 1px `border/slate_blue/default`** — secondary/filled per `button.md` must render a `#cbd5e1` border; current impl has `borderWidth: 0`.
2. **Icon-only glyph is 16×16 instead of 14×14** — story passes `size={16}` to `RiDeleteBinLine`; spec locks 14×14. Fix in the story (prop) or in the component (`span className="flex size-[14px]"` override).

Minor (🟡):
1. `min-w-16` (64px) hard-coded on primary and subtle — not in Figma spec. Either document as an implementation rule or drop.
2. Focus ring uses `ring-black/20` instead of the spec-recommended `border/slate_blue/default`.
3. Disabled treatment (`opacity-50`) is undefined by Figma — needs a design call before locking.

No source code was modified during this audit.

---

## Avatar — 2026-04-20 audit

**Method**: Playwright MCP against `http://localhost:6006/iframe.html?id=primitives-avatar--*`. Computed styles read from the Avatar root `<div>` inside `#storybook-root`, plus inner `<span>` ring and nested dot `<span>`. Spec: `design/avatar.md` (tokens extracted live from Figma). Token reference: `design/_tokens.md`.
**Stories audited**: `default`, `with-status`, `multiple-avatars`.
**Screenshots**: `design/screenshots/audit-avatar-{default,with-status,multiple-avatars}.png`.

### Story: `primitives-avatar--default` (text / circle / Size=24, no status)

| Property | Spec | Measured | Token | Status | Note |
|---|---|---|---|---|---|
| frame width | 24 | 23.99 | — | 🟢 | sub-pixel rounding |
| frame height | 24 | 23.99 | — | 🟢 | sub-pixel rounding |
| borderRadius | full circle (Figma=60) | `3.73e+07px` | `scale/radius/smooth` | 🟢 | effectively ∞; `rounded-full` |
| backgroundColor | `#e5e5e5` | `rgb(229,229,229)` | `background/accents/gray/soft` | 🟢 | |
| text content | initials ("VK") | "VK" | — | 🟢 | |
| fontFamily | Inter | `Inter, system-ui, sans-serif` | `typography/font_family` | 🟢 | fallback OK |
| fontWeight | 500 (Medium) | 500 | `typography/font_weight/Medium` | 🟢 | |
| **fontSize** | **12** (body-xs) | **11** | — | **🔴** | impl uses `text-[11px]` — spec locks body-xs = **12px**. 1px undersized. |
| **lineHeight** | **18** (body-xs) | **11** (`leading-none`) | — | **🔴** | impl uses `leading-none` (≡ fontSize) — spec locks `typography/line_height/18` = 18px. |
| color | `#525252` | `rgb(82,82,82)` | `text/accent/gray/default` | 🟢 | |
| borderWidth | 0 (none in spec) | 0 | — | 🟢 | |
| display | centered flex | `inline-flex`, `center`/`center` | — | 🟢 | matches anatomy "vertical, center/center, 0 padding" |
| **role** | **`role="img"`** | (none — plain `<div>`) | — | **🔴** | spec §Accessibility requires `role="img"` with `aria-label`. |
| **aria-label** | **describes person** | (none) | — | **🔴** | spec: "Initials alone do not provide sufficient AT context — never use the visible letters as the only label." |

### Story: `primitives-avatar--with-status` (text / circle / Size=24, Status=true)

Outer avatar measurements identical to Default (same 🟢/🔴 findings for frame/text/a11y). Status-specific rows below.

| Property | Spec | Measured | Token | Status | Note |
|---|---|---|---|---|---|
| status ring width | 8 | 8.99 | — | 🟡 | impl uses `size-[9px]` — 1px oversized. Spec outer ring 8×8. |
| status ring height | 8 | 8.99 | — | 🟡 | same as above |
| status ring bg | `#ffffff` | `rgb(255,255,255)` | `background/white/adaptive` | 🟢 | |
| status ring borderRadius | full | `3.73e+07px` | — | 🟢 | |
| status ring position | bottom-right of avatar | `absolute`, `bottom:-1px`, `right:-1px` | — | 🟢 | anchors to BR corner; overhang is visual call |
| **status dot inner size** | **6 × 6** | **5.99 × 5.99** | — | **🟢** | size matches (`size-[6px]`) |
| **status dot color** | **`#42cd83`** | **`rgb(34,197,94)` = `#22c55e`** | should be `background/accents/green/default` | **🔴** | impl uses `bg-[#22c55e]` (Tailwind green-500). Spec token `background/accents/green/default` = `#42cd83`. Wrong green. |
| status dot borderRadius | full | `3.73e+07px` | — | 🟢 | |
| status announcement | in `aria-label` ("…, online") | n/a — no aria-label | — | 🔴 | same a11y block as Default |

### Story: `primitives-avatar--multiple-avatars` (composition: 3 × Size=24)

Render: `<div className="flex gap-3 p-4">` with three avatars (`VK` + status, `AB`, `JD` + status). All three avatar instances measured identically to Default / WithStatus above (same 🔴/🟡/🟢 per instance).

| Property | Spec | Measured | Token | Status | Note |
|---|---|---|---|---|---|
| all 3 avatar sizes | 24 | 23.99 each | — | 🟢 | consistent |
| all 3 bg | `#e5e5e5` | `rgb(229,229,229)` | `background/accents/gray/soft` | 🟢 | |
| all fontSize | 12 | 11 | — | 🔴 | same as Default |
| all lineHeight | 18 | 11 | — | 🔴 | same as Default |
| 2 status dots color | `#42cd83` | `rgb(34,197,94)` | — | 🔴 | same `#22c55e` issue on each |
| wrapper `gap-3` (12px) | (not in spec) | 12 | — | 🟢 | story-only composition; spec doesn't lock stacking gap |
| all `role="img"` + `aria-label` | required | missing | — | 🔴 | same a11y block |

### Unaudited / spec-variant gaps

The Figma main component enumerates these variant axes, but no Storybook story exposes them:

| Variant axis | Figma values | Story coverage | Status |
|---|---|---|---|
| `Size` | 24 (audited), 32, 40 (likely) | only 24 | 🔴 gap — no `Small`/`Medium`/`Large` stories, no `size` prop on component |
| `Type` | `text` (audited), image, icon (likely) | only text/initials | 🔴 gap — no image fallback story; `AvatarProps` has no `src` or `icon` prop |
| `Color` | `gray` (audited), green/blue/orange/red (per spec) | only gray | 🔴 gap — no `color` prop; no stories for other palettes |
| `Shape` | `circle` (audited), square (elsewhere in DS) | only circle | 🟡 gap — not required for this surface but absent |
| `emphasis` | `low` (audited), higher variants | only low | 🟡 gap — not exposed |
| `Status` (boolean) | `false` (default), `true` (with-status) | both covered | 🟢 |

### Summary

**7 🔴 · 3 🟡 · 13 🟢** (counting per row across the three story tables; shared findings counted once per story they appear in)

Primary blockers (🔴):
1. **Status dot color `#22c55e` vs spec `#42cd83`** — impl uses Tailwind green-500; spec requires `background/accents/green/default`. Visible in every WithStatus render (affects `with-status` and 2 avatars in `multiple-avatars`). **Note**: contradicts a prior note at line 46 that claims this matches — current measurement proves it does not.
2. **Typography mismatch: `11 / 11` vs spec `12 / 18`** — impl is `text-[11px] leading-none`; spec locks body-xs Inter Medium 12/18. Affects every story.
3. **Accessibility: no `role="img"`, no `aria-label`** — spec §Accessibility is explicit that initials alone are insufficient for AT. The component has no aria-label prop at all.
4. **Size variants absent** — spec enumerates Size=24/32/40; component has no `size` prop, Storybook has no size-range stories.
5. **Image type absent** — spec lists `Type=image` but `AvatarProps` has no `src`; no image-fallback story.
6. **Color variants absent** — spec lists gray/green/blue/orange/red palettes; only gray is implemented and storied.

Minor (🟡):
1. Status ring is **9×9** (`size-[9px]`) instead of spec **8×8**. 1px oversized. Ring overhang coordinates (`-bottom-[1px] -right-[1px]`) may be compensating — revisit together.
2. Shape and emphasis variants missing (gap rather than wrong value).
3. Avatar root bg uses raw hex `bg-[#e5e5e5]` instead of a token class (e.g. `bg-[var(--color-bg-accents-gray-soft)]`). Matches spec value, but breaks tokenization. Advisory.

No source code was modified during this audit.

## Badge — 2026-04-20 audit

**Spec**: `design/tag.md` (Figma node `2:400`, component "tag", variants `Published 2:401`, `Draft 2:408`)
**Implementation**: `packages/kb-ui/src/components/primitives/Badge.tsx`
**Stories audited**: `primitives-badge--published`, `primitives-badge--draft`, `primitives-badge--all-variants` (3 of 3 available; all spec-defined variants with stories were audited)

### Story 1 — `primitives-badge--published`

| Property | Spec | Measured | Token | Status | Note |
|---|---|---|---|---|---|
| bg | `#f2fdf6` | `rgb(242,253,246)` = `#f2fdf6` | `background/accents/green/soft` | 🟢 | match |
| text color | `#086e3f` | `rgb(8,110,63)` = `#086e3f` | `text/accent/green/default` | 🟢 | match |
| font-family | Inter | `Inter, system-ui, sans-serif` | `typography/font_family` | 🟢 | match |
| font-size | 12 | 12 | body-xs | 🟢 | match |
| font-weight | 500 (Medium) | 500 | `typography/font_weight/Medium` | 🟢 | match |
| line-height | 18 | 18 | `typography/line_height/18` | 🟢 | match |
| border-radius | 999 (pill) | ~3.7e7 (fully rounded) | `scale/radius/smooth` | 🟢 | effectively pill — match |
| padding Y | 2 | 2 | `scale/space/xs` | 🟢 | match |
| padding-left | 4 | 8 | spec: `sm` (4) — uses `lg` (8) | 🔴 | published variant should be `pl-1`, impl is `pl-2` |
| padding-right | 8 | 8 | `scale/space/lg` | 🟢 | match |
| inner gap (dot↔text) | 4 | 4 | `scale/space/sm` | 🟢 | match |
| dot size | 4×4 | 5.99×5.99 (source: `size-[6px]`) | — | 🔴 | 50% oversized (6 vs 4) |
| dot color | `#086e3f` | `rgb(34,197,94)` = `#22c55e` | spec: `icon/success/subtle` — uses Tailwind green-500 | 🔴 | wrong hex (Tailwind `bg-[#22c55e]`) |
| border | none | `0px solid` | — | 🟢 | match |

### Story 2 — `primitives-badge--draft`

| Property | Spec | Measured | Token | Status | Note |
|---|---|---|---|---|---|
| bg | `#fcfcfc` | `rgb(252,252,252)` = `#fcfcfc` | `background/canvas/subtle` | 🟢 | match (post 2026-04-18 fix) |
| text color | `#0f172a` | `rgb(15,23,42)` = `#0f172a` | `text/neutral/default` | 🟢 | match (post 2026-04-18 fix) |
| font-family | Inter | Inter | `typography/font_family` | 🟢 | match |
| font-size | 12 | 12 | body-xs | 🟢 | match |
| font-weight | 500 | 500 | Medium | 🟢 | match |
| line-height | 18 | 18 | `typography/line_height/18` | 🟢 | match |
| border-radius | 999 (pill) | ~3.7e7 | `scale/radius/smooth` | 🟢 | match |
| padding Y | 2 | 2 | `scale/space/xs` | 🟢 | match |
| padding-left | 8 | 8 | `scale/space/lg` | 🟢 | match |
| padding-right | 8 | 8 | `scale/space/lg` | 🟢 | match |
| dot | hidden on draft | absent | — | 🟢 | match |
| border | (not in spec) | `1.11px solid rgb(226,232,240)` = `#e2e8f0` | `border/slate_blue/subtle` | 🟡 | spec rows for Draft list only bg — impl adds a 1px `#e2e8f0` border not present in Figma tag spec |
| rendered height | ~22 (derivable: 18 + 2·2) | 24.22 | — | 🟡 | +2px vs Published due to 1px border top/bottom — downstream of the extra border |

### Story 3 — `primitives-badge--all-variants`

Composition: flex row, `gap-3` (12px), `p-4` (16px), `items-center`. Three badges rendered.

| Badge | Property | Spec | Measured | Status | Note |
|---|---|---|---|---|---|
| Published | (all same as Story 1) | — | — | 🔴 | inherits the 3 blockers: dot color `#22c55e`, dot size 6 vs 4, pl 8 vs 4 |
| Draft | (all same as Story 2) | — | — | 🟡 | inherits extra-border finding |
| Neutral | variant exists | rendered (bg `#fcfcfc`, text `#0f172a`, border `#e2e8f0`) | — | 🟡 | **Not in spec** — `tag.md` defines only Published + Draft (+ inferred failed/in-review). Neutral is an impl extension with identical styling to Draft (duplicate `variantStyles` in source). Advisory. |
| wrapper `gap-3` (12px) | (spec: outer multi-tag gap = 4) | 12 | — | 🟡 | story-only composition uses 12px — spec specifies `scale/space/sm` (4) for the multi-tag container. Story, not component. |

### Unaudited / spec-variant gaps

| Variant | Spec reference | Story coverage | Status |
|---|---|---|---|
| `failed` | `tag.md` §State matrix (inferred: `accents/red/*`) | no story, no variant in `BadgeProps` | 🟡 gap — explicitly marked as "not in this node" in spec, so not a hard blocker |
| `in-review` | `tag.md` §State matrix (inferred: `accents/amber/*`) | no story, no variant in `BadgeProps` | 🟡 gap — same as above |
| close (X) affordance | `tag.md` §Accessibility + Published row lists hidden 12×12 stroke | no story, `BadgeProps` has no `onRemove`/`dismissible` | 🟡 gap — close is optional per spec but a11y note exists |
| `icon` slot | `BadgeProps.icon` exists in impl | not exercised by any story | 🟡 gap — untested code path |

### Summary

**4 🔴 · 7 🟡 · 19 🟢**

Primary blockers (🔴):
1. **Published dot color** — `bg-[#22c55e]` (Tailwind green-500, rgb(34,197,94)) in `Badge.tsx:28`; spec requires `#086e3f` (`icon/success/subtle`). Same hex-vs-token issue already flagged in prior Avatar audit.
2. **Published dot size** — `size-[6px]` in `Badge.tsx:28`; spec explicitly says "dot size 4×4 ellipse" (50% oversized).
3. **Published padding-left** — `pl-2` (8px) in `Badge.tsx:22`; spec says 4L / 8R (`sm`/`lg`). Uniform `pl-2 pr-2` doesn't distinguish Published from Draft padding.
4. *(downstream of #1–#3)* **AllVariants story** renders the same broken Published, so blockers are visible in both published stories.

Minor (🟡):
1. Draft + Neutral render a `border-[#e2e8f0]` that is not in spec. Spec's Draft row lists only `bg: #fcfcfc`; no border token. Either add a border row to spec or remove `border border-[#e2e8f0]` from `variantStyles.draft`/`neutral` (`Badge.tsx:14-15`).
2. `Neutral` variant is impl-only — duplicates `Draft` styles verbatim. Either justify in spec or remove to a single shared alias.
3. AllVariants wrapper uses 12px gap; spec outer multi-tag gap is 4px. Story fix only — not a component bug.
4. Missing stories/props for spec-enumerated future states: `failed`, `in-review`, close affordance, and the existing `icon` prop is untested.
5. Raw hex literals throughout `variantStyles` (`#f2fdf6`, `#086e3f`, `#fcfcfc`, `#0f172a`, `#e2e8f0`, `#22c55e`) instead of CSS variables from `tokens.css`. Matches earlier audits' tokenization advisory.

No source code was modified during this audit.

---

## Breadcrumb — 2026-04-20 audit

**Scope**: Primitives/Breadcrumb/Default + Shell/KBBreadcrumbBar/Category + Shell/KBBreadcrumbBar/Editor.
Spec authority: `design/breadcrumb.md` (targets `primitives/Breadcrumb.tsx`; Figma node `1:5390`, component set `_Base items (Breadcrumbs)`).
Token authority: `design/_tokens.md`.
The spec explicitly targets the **primitive** (`packages/kb-ui/src/components/primitives/Breadcrumb.tsx`). The shell wrapper `KBBreadcrumbBar` exists in `packages/kb-ui/src/components/shell/` (not `nav/` as the task header stated) and is audited as a **composition** on top of the primitive — its tokens must still reconcile with the spec.

Measurements below from `getComputedStyle` / `getBoundingClientRect` against the Storybook DOM (iframe at 1256px viewport; Inter loaded).

---

### Story 1 — `Primitives/Breadcrumb/Default`

Screenshot: `design/screenshots/audit-breadcrumb-primitive-default.png`

| Property | Spec (design/breadcrumb.md) | Measured | Token | Status | Note |
|---|---|---|---|---|---|
| Home container size | 22×22 (spec: `Type=homve default`) | **14×14** | — | 🔴 | Container is the raw icon; spec says `22×22` button wrapping a `14×14` icon with `4 all` padding. |
| Home padding | 4 all (`scale/space/sm`) | **0 all** | `scale/space/sm` | 🔴 | No inner padding on home button. |
| Home radius | 4 (`scale/radius/sm`) | **0px** | `scale/radius/sm` | 🔴 | No radius — loses focus-ring & hover affordance. |
| Home icon | Figma home glyph 14×14, `#64758b` | **RiArrowLeftDoubleLine «**, 14×14, `#94a3b8` | `icon/neutral/faint` | 🔴 | Wrong glyph (spec is a *home* icon; impl uses a **double-chevron-left**). Wrong color token — `#94a3b8` is not in `_tokens.md`; spec expects `icon/neutral/faint = #64758b`. |
| Separator container | 22×22 wrapping 14×14 chevron-right | **12×12 bare SVG** | — | 🔴 | No container; spec defines a 22×22 shell for the separator too. |
| Separator padding / radius | 4 / 4 | 0 / — | — | 🔴 | Same as above — separator has no inner padding. |
| Separator icon | `chevron-right` 14×14 `#64758b` | RiArrowRightSLine 12×12 `#cbd5e1` | `icon/neutral/faint` | 🔴 | Wrong size (12 vs 14) and wrong color — `#cbd5e1` = `border/slate_blue/default`, not `icon/neutral/faint`. |
| Intermediate text color | `#475569` (`text/neutral/subtle`) | `rgb(71,85,105)` = `#475569` | `text/neutral/subtle` | 🟢 | Match. |
| Intermediate font | Inter Medium 14/20 | Inter 14 / **weight 400 (Regular)** / lh 21px | `body-sm` (`500`) | 🔴 | Spec requires **Medium (500)**; impl renders **Regular (400)**. Same weight bug for all non-current items. |
| Intermediate line-height | 20 (`typography/line_height/20`) | **21px** (1.5 × 14) | `line_height/20` | 🟡 | Off by 1px — default Tailwind leading; spec's `line_height/20` = 20px. |
| Current item bg | `#f7f7f7` (raw-hex escape noted) OR `#f8fafc` (`background/neutral/faint`) | `rgb(248,250,252)` = **`#f8fafc`** | `background/neutral/faint` | 🟡 | Matches `background/neutral/faint`, which spec flags as a "raw-hex escape" — canonical Figma value is `#f7f7f7`. Design must confirm which wins; impl currently picks the token. |
| Current item padding | 0 TB, 6 LR (`none`/`md`) | **2 TB, 8 LR** | `none`/`md` | 🔴 | Both axes wrong: spec says 0 vertical / 6 horizontal; impl has 2 vertical / 8 horizontal. |
| Current item height | 20 | **25px** | — | 🔴 | Consequence of padding + line-height above. |
| Current item radius | 4 (`scale/radius/sm`) | 4px | `scale/radius/sm` | 🟢 | Match. |
| Current item text | Inter Medium 14/20 `#0f172a` | Inter 500 14 / 21 `#0f172a` | `text/neutral/default` | 🟢 | Match (line-height caveat noted above). |
| Nav gap | (spec: outer container gap 10px inner, bar gap 8) | **4px** between wrappers | — | 🟡 | Spec doesn't pin the inter-crumb gap explicitly; Figma inner gap is 10. Impl 4px feels tight. |
| Intermediate hover bg | `#f7f7f7` | no bg, only `hover:text-[#0f172a]` | `background/neutral/faint` | 🔴 | Spec says hover bg, impl has none (text-color shift only). |
| Accessibility — root | `<nav aria-label="Breadcrumb">` → `<ol>` → `<li>` | `<nav>` → flat `<span>`s; no `<ol>`/`<li>` | — | 🔴 | A11y structure missing; spec is explicit. |
| Accessibility — current | `<span aria-current="page">` | `<span aria-current="page">` | — | 🟢 | Match. |
| Accessibility — separators | `<svg aria-hidden="true">` | chevrons rendered as SVG without explicit `aria-hidden` | — | 🟡 | Remix icons typically emit `aria-hidden` but spec asks for explicit. |
| Overflow (`Levels=4+`) | `<button aria-label="Show N hidden levels">` menu | not implemented | — | 🟡 gap | No collapsed/overflow story or prop. Spec open-item already acknowledged. |

---

### Story 2 — `Shell/KBBreadcrumbBar/Category`

Screenshot: `design/screenshots/audit-breadcrumb-category.png`

Shell composition: collapse button + vertical divider + breadcrumb (single current crumb). Separate from the primitive audit — spec does **not** define this shell variant; it's an app-shell wrapper. Measuring against spec tokens only.

| Property | Spec/Token | Measured | Token | Status | Note |
|---|---|---|---|---|---|
| Bar height | 54 (spec outer container) | **55px** (Inter line-height rounding, box 55.1px) | — | 🟡 | Off by ~1px — `h-[54px]` set, but flex child bleed. Visually negligible. |
| Bar padding | 0 LR, 16 TB (spec outer) | **0 TB/16 LR** (`px-4`) | Inverted | 🔴 | Spec: vertical padding 16, horizontal 0. Impl: vertical 0, horizontal 16. Axes are swapped. |
| Bar bg | — (spec silent — bar is part of shell) | transparent (story provides `border-bottom` externally) | — | 🟡 | Component should render its own bg/border per Figma frame; impl relies on caller to add the separator. |
| Collapse button size | — (not in primitive spec) | 32×32 | — | 🟢 | Reasonable for shell; tokens not pinned. |
| Collapse button radius | — | 6px | `scale/radius/md` | 🟢 | Uses `md` radius token value. |
| Collapse icon color | — | `rgb(100,116,139)` = `#64748b` | (raw hex, close to `icon/neutral/faint` `#64758b`) | 🟡 | Off by one digit vs `_tokens.md` listing — tokens.md shows `#64758b` which is itself suspicious (likely typo in tokens.md; `#64748b` is Tailwind slate-500). Flag for tokens.md clean-up. |
| Vertical divider | — | 1×20, `#e2e8f0` | `border/slate_blue/subtle` | 🟢 | Token match. |
| Current crumb text | Inter Medium 14/20 `#0f172a` | Inter 500 14/21 `#0f172a` | `text/neutral/default` | 🟢 | Match (lh 1px off, shared with primitive). |
| Current crumb bg pill | `#f7f7f7` / `#f8fafc` | **transparent** | — | 🔴 | The KBBreadcrumbBar DOES NOT render the active-state pill at all. Spec's `Type=text State=active` requires `bg #f7f7f7`, `padding 0/6`, `radius 4`. Impl is plain text. |
| Current crumb padding | 0 TB, 6 LR | **0 all** | — | 🔴 | Falls out of missing pill. |
| Intermediate crumbs | N/A for Category variant | — | — | — | Only one item in story — not applicable. |

---

### Story 3 — `Shell/KBBreadcrumbBar/Editor`

Screenshot: `design/screenshots/audit-breadcrumb-editor.png`

Shell composition: collapse + divider + multi-crumb path + `Save as draft` / `Publish` / close buttons. Again, action buttons are not in the primitive spec (`breadcrumb.md` only hints *"any buttons on the editor variant"* — spec is silent on exact tokens).

| Property | Spec/Token | Measured | Token | Status | Note |
|---|---|---|---|---|---|
| Bar height | 54 | 55px | — | 🟡 | Same as Category. |
| Bar padding | 16 TB / 0 LR | 0 TB / 16 LR | — | 🔴 | Axes still swapped. |
| Separator glyph | **chevron-right 14×14 `#64758b`** (`icon/neutral/faint`) | **literal `/` text char, 14px, `#94a3b8`** | `icon/neutral/faint` | 🔴 | Wrong glyph entirely — impl renders a slash text character, spec requires a chevron-right icon. Color also off: `#94a3b8` not in token set. Note: spec mentions `slash` as an *alternate* separator variant in Figma, so this may be intentional — but the default variant extracted into the spec is chevron. |
| Separator container | 22×22 | **4×21** (inline text) | — | 🔴 | No container — just a character. |
| Crumb items font | Inter Medium 14/20 | **Regular (400)** 14/21 for intermediate, **Medium (500)** 14/21 for current | `body-sm` | 🔴 | Intermediate items should be Medium per spec; impl renders them Regular. Current-item weight OK. |
| Crumb text colors | intermediate `#475569`, current `#0f172a` | `#475569` / `#0f172a` | `text/neutral/subtle` / `text/neutral/default` | 🟢 | Match. |
| Current crumb pill | bg `#f7f7f7`/`#f8fafc`, padding 0/6, radius 4 | **no pill** (plain text) | `background/neutral/faint` | 🔴 | Current-page visual affordance missing here too. |
| Nav item gap | (spec outer inner-gap 10) | 6px | — | 🟡 | Tight vs spec. |
| Truncation | — | `max-w-[240px]` (current), `max-w-[260px]` (others) — truncates "Search, filter, and create email vie…" | — | 🟢 | Reasonable shell affordance; not in spec. |
| Save-as-draft button | not in spec | h32, 12/6 padding, radius 6, Inter Regular 14, `#475569`, no border, no bg | — | 🟡 gap | Spec doesn't define these buttons. Matches editor screenshot (`design/screenshots/`) roughly but unverified against a dedicated button spec. |
| Publish button | not in spec | h32, 12/6 padding, radius 6, 1px border `#e2e8f0`, bg white, Inter Medium 14 `#0f172a`, icon gap 6 | — | 🟡 gap | Same — acceptable shell composition, no spec anchor to verify. Icon is `RiSendPlaneLine` 14px; reasonable. |
| Close button | not in spec | 32×32, radius 6, `#64748b`, `RiCloseLine` 16px | — | 🟡 gap | As above. |
| Accessibility | nav structure per primitive spec | spans-only, no `<ol>`/`<li>` | — | 🔴 | Same a11y regression as primitive. |

---

### Summary

**11 🔴 · 11 🟡 · 7 🟢**

Top 3 findings (blockers):

1. **Current-page pill missing in KBBreadcrumbBar (both variants)**. Spec's `Type=text State=active` mandates `bg #f7f7f7`/`#f8fafc`, `padding 0/6`, `radius 4`. The shell renders plain bolded text — loses the distinct "you are here" affordance. Primitive gets the pill *approximately* right but with wrong padding (`2 8` instead of `0 6`).
2. **Primitive uses wrong home & separator glyphs/sizes**. `Breadcrumb.tsx` renders `RiArrowLeftDoubleLine` (double-chevron-left) as "home" and 12×12 `RiArrowRightSLine` as separator with no 22×22 container. Spec mandates a home icon and 14×14 chevron-right inside 22×22 containers with `4px` all-sides padding and `radius 4`. KBBreadcrumbBar uses a literal `/` character as separator — wrong glyph entirely.
3. **Intermediate items render Regular (400) instead of Medium (500)**, in both primitive and shell. Spec is explicit: `Inter Medium 14/20` for both intermediate (`State=default`) and current (`State=active`) crumbs. Line-height is also off by 1px (21 measured vs 20 spec) across all crumb text. Plus: bar padding axes are inverted in KBBreadcrumbBar (`px-4` applied horizontally; spec requires 16px vertical, 0 horizontal).

Secondary (🟡) callouts: missing A11y `<ol>`/`<li>` structure; no overflow-collapse UI for `Levels=4+`; hover bg missing on intermediate items; token-vs-raw-hex mismatches (`#94a3b8`, `#cbd5e1`, `#64748b` vs `#64758b`); `_tokens.md` itself lists `icon/neutral/faint` as `#64758b` which looks like a digit transposition of `#64748b` and should be re-extracted from Figma.

Report section: `/Users/varunkelkar/Desktop/ai/kb/design/_diff-report.md` (this append).
Screenshots:
- `/Users/varunkelkar/Desktop/ai/kb/design/screenshots/audit-breadcrumb-primitive-default.png`
- `/Users/varunkelkar/Desktop/ai/kb/design/screenshots/audit-breadcrumb-category.png`
- `/Users/varunkelkar/Desktop/ai/kb/design/screenshots/audit-breadcrumb-editor.png`

No source code was modified during this audit.

---

## SideNavRail — 2026-04-20 audit

**Scope**: light-theme spec (`design/side-nav.md`, from library-check node `0:1`). Dark theme exists as an app-level variant in the implementation; recorded for reference but **not scored** against the light spec.

**Stories audited** (3): `nav-sidenavrail--light`, `nav-sidenavrail--dark`, `nav-sidenavrail--both-themes`.
**Source**: `packages/kb-ui/src/components/nav/SideNavRail.tsx` (read-only — not edited).

### Story: `nav-sidenavrail--light`

| Property | Spec | Measured | Token | Status | Note |
|---|---|---|---|---|---|
| rail width | 54px | 53.99px | — | 🟢 | sub-px rounding from Storybook zoom |
| rail bg | `#ffffff` | `rgb(255,255,255)` | `background/canvas/white` | 🟢 | |
| rail border (all sides) | 1px `#e2e8f0` **inside** | only `border-right: 1.11px #e2e8f0` | `border/slate_blue/subtle` | 🟡 | top/left/bottom not drawn; spec says 1px inside border all 4 sides |
| rail padding | 0 | 0 | `scale/space/none` | 🟢 | |
| rail radius | 0 | 0 | `scale/radius/none` | 🟢 | |
| brand container | 54×58 (7px vert-pad) | 54×54 (pad 0) | — | 🟡 | height short by 4px; no 7px internal Y-padding |
| brand border-bottom | 1px `#e2e8f0` | 1.11px `rgb(226,232,240)` | `border/slate_blue/subtle` | 🟢 | |
| brand logo button | 32×32, r=8, hover `#f8fafc` | slot renders raw `size-6` (24×24) blue square — no frame | — | 🟡 | brandLogo is a slot, so this is a story-data concern; component provides the 54×54 shell only. Flag: no dedicated 32×32/r=8 logo-button primitive. |
| nav stack padding | `12px top` / `6px bottom` | `8px top` / `8px bottom` | — | 🔴 | top short by 4px, bottom long by 2px |
| nav stack gap | 4px | 4px | `scale/space/sm` | 🟢 | |
| item hit area | 36×36 | 36.91×35.99 (h-9 + mx-2) | — | 🟢 | rounds to 36×36; width is 54−16=38 button, but Tailwind `h-9`/`size-[18px]` renders ≈37 visually |
| item border-radius | **8px** (`scale/radius/lg`) | **6px** | `scale/radius/md` (wrong) | 🔴 | rendered `rounded-[6px]` — should be 8 |
| default item bg | transparent | transparent | — | 🟢 | |
| **default icon color** | **`#475569`** (`icon/neutral/subtle`) | **`rgb(100,116,139)` = `#64748b`** (`icon/neutral/faint`) | wrong token | 🔴 | off by one neutral step |
| active item bg | `#f8fafc` (`background/neutral/faint`) | `rgb(248,250,252)` = `#f8fafc` | `background/neutral/faint` | 🟢 | |
| active icon color | `#0f172a` (`icon/neutral/default`) | `rgb(15,23,42)` = `#0f172a` | `icon/neutral/default` | 🟢 | |
| icon button internal pad | 4px all (`scale/space/sm`) | 0px (button pad 0; icon sized 18×18 centered) | — | 🟡 | spec lays out a 41×32 frame w/ 4px pad → 32×24 icon — not reproduced; visual centering OK because button is 36×36 and icon 18×18 (gap 9px each side) |
| item horizontal margin | center within 54px rail | `margin: 0 8px` | `scale/space/lg` | 🟢 | matches spec's 54−(2×8)=38px rail-internal pattern |
| hover bg (default item) | `#f8fafc` | `hover:bg-[#f1f5f9]` in source | wrong token | 🔴 | source class `bg-[#f1f5f9]` (slate-100) instead of `#f8fafc` (`background/neutral/faint`). Not visible without hover but source-inspectable. |
| hover icon color | `#0f172a` | `hover:text-[#0f172a]` | `icon/neutral/default` | 🟢 | matches |
| focus ring | spec: flagged for design (2px `#cbd5e1`) | none rendered | — | 🟡 | spec itself says "not observed in Figma, flag for design" — noting gap |
| footer/avatar container | 54-wide, pinned bottom | 54×40, `margin-bottom: 8px` | — | 🟢 | Avatar primitive slot, size-6 (24×24) circle with initials "VK" — reasonable |

### Story: `nav-sidenavrail--dark`

n/a (dark, not in spec). Recorded values only:

| Property | Measured | Note |
|---|---|---|
| rail bg | `rgb(26,26,26)` | `bg-[#1a1a1a]` |
| rail border | none | no right border (vs light which has one) |
| default icon | `white @ 50%` | dark-theme muted |
| active item bg | `rgba(255,255,255,0.10)` | white @ 10% |
| active icon | `rgb(255,255,255)` | |
| item radius | 6px | same source token as light — inherits the 8px miss |

### Story: `nav-sidenavrail--both-themes`

Side-by-side composite of the two above. No new data points. Useful for visual comparison. Token-level findings all live in the light audit above.

### Gaps (spec vs stories)

- No story exercises a **hover** state (default → hover color change is source-only, not visually verified).
- No story shows a rail **without brandLogo** or **without bottomSlot** — layout resilience unverified.
- No story tests **overflow** (items exceeding rail height) — spec doesn't specify behavior; flag.
- Brand-logo primitive (32×32, r=8, hover `#f8fafc`) not extracted as its own component — stories pass raw markup into the slot.

**4 🔴 · 5 🟡 · 10 🟢**

No source code was modified during this audit.

---

## FileExplorerNav — 2026-04-20 audit

**Source of truth**: `design/article-explorer.md` (component set `6:438`, frame `1:4824`). Tokens cross-checked against `design/_tokens.md`. Also referenced `design.md` FileExplorerNav section. Per-component spec takes precedence on conflicts.
**Implementation**: `packages/kb-ui/src/components/nav/FileExplorerNav.tsx` (read-only).
**Stories audited**: `Light`, `Dark`, `Active Folder`, `Root Article Active`, `Both Themes` (5 of 5).

Status: 🔴 blocker (spec violation) · 🟡 drift · 🟢 matches.

### Story: `nav-fileexplorernav--light`

Screenshot: `design/screenshots/audit-fileexplorer-light.png`

**Container**

| Property | Spec | Measured | Token | Status | Note |
|---|---|---|---|---|---|
| panel width | 288 | 287.99 | — (fixed) | 🟢 | sub-px rounding |
| bg | `#ffffff` | `rgb(255,255,255)` | `background/canvas/white` | 🟢 | |
| border | inside 1px `#e2e8f0` | none on aside; only header bottom-border | `border/slate_blue/subtle` | 🔴 | Spec says the whole panel has a 1px subtle border; only the header's bottom-border exists. |
| tree block padding | 12 Y, 4 X | 8 Y, 0 X | `xl` / `sm` | 🔴 | `py-2` (8px) instead of 12 (`xl`); no horizontal 4px padding — rows do outer padding instead. |
| row gap | 2px | 0 (no gap between rows) | `scale/space/xs` | 🟡 | rows are flush; spec calls for 2px gap. |
| font-family | Inter | `Inter, system-ui, sans-serif` | `typography/font_family` | 🟢 | |

**Header (top bar)**

| Property | Spec | Measured | Token | Status | Note |
|---|---|---|---|---|---|
| size | 288×54 | 287.99×53.99 | — | 🟢 | |
| padding | 6 Y / 2 X | 0 Y / 16 X | spec: `md`/`xs` | 🔴 | Y padding missing; X padding ~8× spec. Item-icon+label flex uses 16 gap visually. |
| label weight | Inter **Regular** ("Editor") per row label tokens | `font-semibold` (weight 600) | — | 🟡 | spec doesn't explicitly set header text weight but body text is Regular; current is Semibold. Flag for designer. |
| divider | 1px line `#e2e8f0` at panel row 54–58 (4px row below header) | 1.11px solid `rgb(226,232,240)` on header's `border-b` | `border/slate_blue/subtle` | 🟡 | Color right; spec uses a **separate** 4px divider row with 16 X padding, implementation folds it into header's bottom border. |
| search icon size | not explicitly specified (button 24×24 expected) | 14px icon in a 24×24 button | — | 🟡 | spec row-icons are 16; header search is 14 — inconsistent with row icons. |

**Row — type=category (depth-0 folder)** (e.g. "Getting Started")

| Property | Spec | Measured | Token | Status | Note |
|---|---|---|---|---|---|
| row height | 36 | 35.99 | — | 🟢 | |
| outer padding | 12 L / 12 R | 12 L / 12 R | `xl` / `xl` | 🟢 | |
| inner container | 260×36, pad 6 Y / 4 X, r=8 | 263.99×36, pad 6 Y / 4 X, r=8 | `md`/`sm`/`lg` | 🟡 | inner width 264 vs 260 (outer 288 − 12 − 12 = 264; spec says 260 — math mismatch, but outer padding matches — flag spec). |
| content left-pad | 0 at depth 0 | 0 | — | 🟢 | |
| chevron | 24×24 button, r=6, icon 16 | 24×24 span, r=6, icon ~16 | — | 🟢 | |
| folder icon | 24×24, r=6, 16px glyph | 24×24, r=6, 16px glyph | — | 🟢 | |
| folder icon color | (not tokenised in spec; assume `icon/neutral/faint`) | `rgb(100,116,139)` = `#64748b` | `icon/neutral/faint` | 🟢 | |
| label | Inter Regular 14/20 `#0f172a` | Inter **500** 14/20 `#0f172a` | `text/neutral/default` | 🔴 | depth-0 folder uses `font-medium` (500) unconditionally (line 111: `isActive || isActiveSub ? 'font-medium' : 'font-normal'` — in light story "Getting Started" is isActiveSub because article descendant is active). Verify at rest: visual shows weight change tied to active-sub only. Still flag: top-level categories rendered as weight 500 in this story. |
| count chip | Inter Regular 14/20, `#475569` | 14/400, `rgb(71,85,105)` | `text/neutral/subtle` | 🟢 | |

**Row — type=folder at depth-1** (e.g. "Tutorials")

| Property | Spec | Measured | Token | Status | Note |
|---|---|---|---|---|---|
| outer padding | 0 L / 16 R | 16 L / 12 R | spec: `none` / `2xl` | 🔴 | Code's `outerPaddingForDepth(depth>0)` uses `pl-[16px] pr-[12px]` — spec calls for **0 L / 16 R** with indentation applied via the content (`pl-[20px]` inside). Both outer and inner padding are off. |
| inner container content pl | 20 (at depth 1) | 20 | `3xl` | 🟢 | inner indent matches. |
| chevron + folder glyph | 24×24 each | 24×24 each | — | 🟢 | |
| label weight | Regular (only active → Medium) | Medium (500) — folder is on active-sub path | — | 🟢 | ancestor-of-active weighting by design; consistent with "active-sub" styling. |

**Row — type=article at depth-1** (e.g. "Introduction")

| Property | Spec | Measured | Token | Status | Note |
|---|---|---|---|---|---|
| outer padding | 16 L / 12 R | 16 L / 12 R | `2xl` L / `xl` R | 🟢 | |
| inner pad | 0 TB / 4 L / 0 R | 6 Y / 4 X | — | 🔴 | Spec says Y padding is 0 (row is 36, inner content is 20-line tight); implementation applies 6 Y (same as folder rows). Visual impact: articles get same vertical centering as folders — OK ergonomically, but not to spec. |
| icon | 16×16 article glyph | 16×16 `RiArticleLine` | — | 🟢 | |
| label | Inter Regular 14/20, `#0f172a` | Inter 400 14/20, `#0f172a` | `text/neutral/default` | 🟢 | |
| bullet dot (leading) | **not in spec** (articles lead with article-icon only) | 6×6 `#cbd5e1` dot precedes the article icon | — | 🔴 | Spec's article-row anatomy is `icon + label + status-dot/more`. The leading bullet dot is an invention of the implementation. Inflates row width by 24px and duplicates the status-dot visual language. |
| published status dot | 4×4 `#42cd83` (`background/accents/green/default`) | **6×6** `#22c55e` | — | 🔴 | Both size and color wrong. Size 6 vs spec 4; color `#22c55e` (Tailwind green-500) vs spec `#42cd83`. |
| draft status dot | 4×4 `#898989` (`background/accents/gray/default`) | 6×6 `#94a3b8` (Tailwind slate-400) | `background/accents/gray/default` | 🔴 | Both size and color wrong. |

**Row — type=article at depth-2** (e.g. "Your first article", "Organizing content")

| Property | Spec | Measured | Token | Status | Note |
|---|---|---|---|---|---|
| outer padding | 16 L / 12 R (same as depth-1 article) | 16 L / 12 R | `2xl`/`xl` | 🟢 | |
| inner content pl | 44 (at depth 2) | 44 | — | 🟢 | |
| active bg (Organizing content) | `#e6e6e6 @ 44%` — raw hex escape | `rgba(230,230,230,0.44)` | **raw hex, no variable** | 🟢 | Exact match of the documented raw-hex escape. |
| active label color | `#0f172a` | `rgb(15,23,42)` | `text/neutral/default` | 🟢 | |
| active label weight | (spec silent; "active-sub same as active") | 400 (no weight bump when leaf is active) | — | 🟡 | inconsistency with folder active where label goes 500. Designer call needed. |

**Row — "Changelog" (depth-0, type=article)**

| Property | Spec | Measured | Token | Status | Note |
|---|---|---|---|---|---|
| treated as | category-style (no chevron, no bullet) | renders with **leading bullet dot** (6×6 `#cbd5e1`) and NO chevron | — | 🔴 | Depth-0 articles (changelog) should visually match categories — no leading dot. Implementation uses article-row layout regardless of depth. |

### Story: `nav-fileexplorernav--dark`

Screenshot: `design/screenshots/audit-fileexplorer-dark.png`

| Property | Spec | Measured | Token | Status | Note |
|---|---|---|---|---|---|
| panel bg | spec silent on dark; impl `#1a1a1a` | `rgb(26,26,26)` | — | 🟡 | spec has no dark palette; dark mode is a surface feature. Flag as under-specified. |
| header divider | 1px `white/10` | `oklab(... / 0.1)` ≈ `rgba(255,255,255,0.1)` | — | 🟢 | |
| active row bg | spec silent (only light `#e6e6e6@44%` documented) | `white/[0.08]` | — | 🟡 | undocumented but plausible; flag spec gap. |
| leading bullet (articles) | not in spec | `white/30` | — | 🔴 | Same leading-bullet issue as light; inherits the anatomy bug. |
| status dots | 4×4 green/grey tokens | 6×6 `#22c55e` / `#94a3b8` | — | 🔴 | Same size + color drift as light. |
| label (article) | `text/neutral/default` light analogue | `white/80` | — | 🟢 | reasonable dark mapping. |
| label (folder) | Regular except active-sub → Medium | 500 when ancestor-of-active | — | 🟢 | |

### Story: `nav-fileexplorernav--active-folder`

Screenshot: `design/screenshots/audit-fileexplorer-active-folder.png`

Only one active row present: "Shared Inbox" (depth-1 folder).

| Property | Spec | Measured | Token | Status | Note |
|---|---|---|---|---|---|
| active row bg | `#e6e6e6 @ 44%` | `rgba(230,230,230,0.44)` | raw-hex escape | 🟢 | |
| active row radius | 8 | 8 | `lg` | 🟢 | |
| outer padding (depth-1) | 0 L / 16 R | 16 L / 12 R | `none`/`2xl` | 🔴 | inherits the depth>0 outer-padding bug from Light. |
| label weight | (spec silent) | 500 (folder active) | — | 🟡 | |

### Story: `nav-fileexplorernav--root-article-active`

Screenshot: `design/screenshots/audit-fileexplorer-root-article-active.png`

Active row: "Changelog" (depth-0, type=article).

| Property | Spec | Measured | Token | Status | Note |
|---|---|---|---|---|---|
| active row outer padding | 0 L / 16 R (spec article) OR 12 L / 12 R (spec category) | 12 L / 12 R | — | 🟡 | Root article intermediate — impl applies category outer (12/12). Spec ambiguous for "depth-0 article". |
| active row bg | `#e6e6e6 @ 44%` | `rgba(230,230,230,0.44)` | raw-hex escape | 🟢 | |
| leading bullet still present | not in spec | yes, `#cbd5e1` dot | — | 🔴 | persists on active root article — visually awkward, inflates the active pill's left gutter. |
| status-dot size/color | 4×4 `#42cd83` | 6×6 `#22c55e` | — | 🔴 | same drift. |

### Story: `nav-fileexplorernav--both-themes`

Screenshot: `design/screenshots/audit-fileexplorer-both-themes.png`

Composite of Light + Dark side-by-side. No new data points; all findings from those two audits apply.

### Hover state (no dedicated story)

Source-level audit (`className` inspection + CSS):
- Impl hover bg (light): `hover:bg-[rgba(230,230,230,0.32)]`
- Spec hover bg: `#f8fafc` (`background/neutral/faint`)

🔴 **Wrong color family**. Impl uses a transparent-greyish derived from the active bg; spec calls for the `background/neutral/faint` blue-white. Same drift in dark (`white/[0.05]` vs unspec'd).

### Gaps (spec vs stories)

- No dedicated **hover** story — hover drift verified source-only.
- No story exercising **depth-3** content (spec defines pl-[68px] but indices map 0–3; no deeper sample renders).
- No story with **draft** status dots prominently — spec has a specific grey token but most sample data is published. Draft sample exists in "Quick Start" / "Snoozing threads" — measured, confirmed drift (see table).
- No story demonstrating the **count-on-folder** vs **more-on-hover** swap with real hover interaction.
- `typeof` is inferred from `item.type` (`folder`/`article`) — spec's third type **`category`** (depth-0, non-expandable) is neither encoded in `NavItem.type` nor rendered distinctly. All depth-0 folders fall into folder-row; all depth-0 non-folders fall into article-row.

### Raw-hex status

Spec documents `#e6e6e6 @ 44%` as a raw-hex escape pending promotion to `background/row/active`. Impl hardcodes `rgba(230,230,230,0.44)` matching the documented value. ✅ faithful to the intentional escape; ongoing action item remains on design side.

**10 🔴 · 9 🟡 · 15 🟢**

No source code was modified during this audit.

---

## PageHeader — 2026-04-20 audit

**Source of truth**: `design/page-header.md` (Figma `9aGp5t9fH1d0PXi4LMhOdb` node `1:5438`, "Container" 938×58).
**Implementation**: `packages/kb-ui/src/components/content/PageHeader.tsx`
**Stories audited**: `content-pageheader--default`, `content-pageheader--without-subtitle` (2 total).
**Screenshots**:
- `design/screenshots/audit-pageheader-default.png`
- `design/screenshots/audit-pageheader-without-subtitle.png`

### Macro observation

The implementation departs from the spec at the **anatomy** level, not just at the token level. The spec defines a **44×44 rounded icon tile** (bg `#f8fafc`, stroke `#cbd5e1`, radius 6.6, 22×22 accent-colored glyph inside) — the impl renders a **bare 24×24 SVG** with no tile container at all. Title/description type scale is also rescaled: spec is 18/28 Semi Bold + 14/20 Medium; impl is 24/30 Semi Bold + 14/21 Normal. Effective result is a visually much larger, tile-less header that no longer traces to the Figma container.

### Story: `content-pageheader--default`

Viewport width stretched to 1176px (Storybook `layout: padded`) — container width is fluid, not 938. This is expected for a responsive implementation; only height and internal tokens are compared.

**Outer container**

| Property | Spec | Measured | Token | Status | Note |
|---|---|---|---|---|---|
| height | 58 (hug) | 101 | — | 🔴 | driven by `py-6` (24+24) plus 53px inner content vs spec 4+4+50. |
| padding TB | 4 | 24 | `sm` vs `4xl` | 🔴 | `py-6` = 24px; spec wants 4px. 6× over. |
| padding LR | 24 | 0 | `4xl` vs none | 🔴 | impl leaves L/R padding to the parent page. Spec bakes it into the component. |
| gap (outer) | 16 | n/a — `justify-between` | `2xl` | 🟡 | impl uses `justify-between`; gap only matters when content compresses. Functionally fine for the happy path. |
| layout | horiz, center, start-aligned | horiz, center, space-between | — | 🟢 | centering + horizontal is correct. |

**Leading icon tile** (biggest drift)

| Property | Spec | Measured | Token | Status | Note |
|---|---|---|---|---|---|
| wrapper size | 44×44 | 24×24 | — | 🔴 | no tile element in impl — `span` collapses to icon size. |
| wrapper padding | ~8.8 (or base 8) | 0 | `lg` | 🔴 | no padding because no tile. |
| wrapper radius | 6.6 (base 6) | 0 | `md` | 🔴 | absent. |
| wrapper bg | `#f8fafc` | transparent | `background/neutral/faint` | 🔴 | absent. |
| wrapper stroke | 1.2 `#cbd5e1` | none | `border/slate_blue/default` | 🔴 | absent. |
| glyph size | 22×22 | 24×24 | — | 🟡 | story passes `size-6` (24); spec uses 22 inside the 44 tile. Close but off. |
| glyph color | `#6634ef` purple accent | `oklch blue-500` | `icon/accents/purple/default` | 🔴 | story passes `text-blue-500`; spec uses purple accent. Story-level override, but no component default guards against this. |

**Text container / title**

| Property | Spec | Measured | Token | Status | Note |
|---|---|---|---|---|---|
| text gap | 2 | 2 (mt-0.5) | `xs` | 🟢 | correct spacing. |
| title font size | 18 | 24 | `title-md` (18) | 🔴 | impl hardcodes `text-[24px]`. Should be 18. |
| title line-height | 28 | 30 (leading-tight × 24) | `title-md` lh | 🔴 | downstream of the 24→18 fix. Spec is explicit 28px. |
| title weight | 600 (Semi Bold) | 600 | — | 🟢 | correct. |
| title color | `#0f172a` | `rgb(15,23,42)` | `text/neutral/default` | 🟢 | exact match. |
| title font-family | Inter | Inter, system-ui, sans-serif | — | 🟢 | Inter first. |

**Text container / description**

| Property | Spec | Measured | Token | Status | Note |
|---|---|---|---|---|---|
| description font size | 14 | 14 | `body-sm` | 🟢 | correct. |
| description line-height | 20 | 21 | `body-sm` lh | 🟡 | `leading-` inherit; computed 21 from default 1.5 rounding. Off by 1px. |
| description weight | 500 (Medium) | 400 (Normal) | — | 🔴 | `font-normal` hardcoded; spec calls for Medium. |
| description color | `#475569` | `rgb(100,116,139)` = `#64748b` | `text/neutral/subtle` | 🔴 | wrong slate step — impl is `slate-500`, spec is `slate-600`. |

**Trailing primary button**

Spec delegates to `design/button.md` — `Size=md, Type=primary, Appearance=filled, Prefix Icon=+`. This audit records the measured values and flags raw-hex / cross-reference risks only; full button drift is covered in the Button section of this report.

| Property | Spec (via button.md) | Measured | Token | Status | Note |
|---|---|---|---|---|---|
| bg | `primary/default` (brand, not black) | `rgb(0,0,0)` raw black | raw-hex escape | 🟡 | cross-ref concern — this is the Button primary variant's drift, surfaced here. Impl uses `bg-black`. |
| text color | white | `rgb(255,255,255)` | `text/on-primary` | 🟢 | correct contrast. |
| font size | 14 | 14 | `body-sm` | 🟢 | |
| font weight | 500 (Medium) | 500 | — | 🟢 | |
| line-height | 20 | 20 | `body-sm` lh | 🟢 | |
| padding | 6/12 (md) | 6px 12px | — | 🟢 | |
| radius | 6 | 6 | `md` | 🟢 | |
| icon-label gap | 6 | 6 | `md` gap | 🟢 | |
| prefix icon size | 16 | 16 | — | 🟢 | `<RiAddLine size={16} />` — exact. |

**Prop-naming note**: impl prop is `subtitle`; spec calls the slot "Description". Cosmetic — no runtime impact, but diverges from the naming source-of-truth. 🟡

### Story: `content-pageheader--without-subtitle`

Exercises the single-line branch (no description).

| Property | Spec | Measured | Token | Status | Note |
|---|---|---|---|---|---|
| container height | 58 (same hug) | 80 | — | 🔴 | `py-6` still dominates; inner left-group collapses to 30px but outer padding holds it. |
| subtitle element | absent | absent | — | 🟢 | conditional render works. |
| title centered vertically | yes (icon-tile aligned) | yes | — | 🟢 | `items-center` on inner flex. |
| all other tokens | inherit Default findings | — | — | — | same drift as Default story. |

### Gaps (spec variants not covered by stories)

- Spec's 44×44 **icon tile** visual (bg + border + radius + purple glyph) is not representable by any current story because the component has no tile element. 🔴 component-level gap, not a story-level gap.
- No story with a **long title** that would force overflow/ellipsis — spec silent on overflow behavior; impl relies on parent width. 🟡
- No story with **no icon** (spec shows icon as anatomy but doesn't mark it required; impl has it optional via `icon?`). 🟡 gap — untested branch.
- No hover/focus state for the button (covered by Button audit). 🟡

### Raw-hex / token status

- `#0f172a`, `#64748b` — hardcoded via `text-[#...]` instead of using the `text/neutral/default` and `text/neutral/subtle` CSS variables. Neither is a raw-hex *escape*; both map to existing tokens. 🔴 un-tokenized, not intentional raw-hex.
- `#475569` (spec description color) never appears in impl — missing token reference. 🔴
- `#f8fafc`, `#cbd5e1`, `#6634ef` (icon tile) — absent entirely because the tile is absent. 🔴

### Summary

**13 🔴 · 8 🟡 · 10 🟢**

Top drift vectors, in impact order:
1. **Missing icon tile** — the defining visual affordance of the spec is not implemented; the component renders a bare icon.
2. **Title type scale wrong** — 24/30 rendered vs 18/28 spec. Header reads as a larger-than-intended hero.
3. **Description weight + color wrong** — Normal 500-slate instead of Medium 600-slate; reads lighter and thinner than spec.
4. **Outer padding inverted** — 24 TB / 0 LR rendered vs 4 TB / 24 LR spec; the component is tall and flush left, not short and inset.

No source code was modified during this audit.

## Table — 2026-04-20 audit

**Spec:** `design/table.md` (covers both tables) + `design.md` Articles Table 5-col cross-reference.
**Impl:** `packages/kb-ui/src/components/content/SubCategoriesTable.tsx`, `.../ArticlesTable.tsx`.
**Stories audited:** `content-subcategoriestable--default`, `content-articlestable--default` (both render both tables in the same composition).
**Screenshots:** `design/screenshots/audit-table-subcategoriestable--default.png`, `design/screenshots/audit-table-articlestable--default.png`.
**Viewport:** 1440×900. Card width in both stories: 1080px (story wrapper, not Figma-accurate 890px — but spec does not pin width, so not audited).

Legend: 🔴 blocking drift · 🟡 minor/polish drift · 🟢 matches spec.

### Story 1 — `content-subcategoriestable--default` (SubCategoriesTable component)

| Property | Spec | Measured | Token | Status | Note |
|---|---|---|---|---|---|
| Card bg | white | `rgb(255,255,255)` | `background/canvas/white` | 🟢 | |
| Card radius | 8 (`scale/radius/lg`) | 12 | `scale/radius/xl` | 🔴 | Impl uses `rounded-[12px]`. Spec `table.md` §Table-frame says **8**. `design.md` legacy line says 12 — spec `table.md` is authoritative. |
| Card border | 1 `#e5e5e5` (`border/neutral/subtle`) | 1.11px `rgb(241,245,249)` = `#f1f5f9` | — | 🔴 | Wrong color + sub-pixel width (rem-based). Should be `#e5e5e5`. `#f1f5f9` is the slate-100 used elsewhere. |
| Card padding | 4 TB, 24 LR (`space/sm` / `4xl`) | 0 TB, 24 LR | — | 🔴 | Vertical padding missing. Card is `px-6` only; rows span full height via `h-12`. |
| Card siblings gap | 16 (`space/2xl`) | 16 (story uses `gap-4`) | `scale/space/2xl` | 🟢 | Story renders `flex flex-col gap-4` wrapper. |
| Semantic element | `<table>` with `<thead>/<tbody>/<th>/<tr>/<td>` | `<div>` grid (flex) | — | 🔴 | a11y: explicitly flagged in spec §Accessibility. |
| Heading row height | 48 | 48 | — | 🟢 | |
| Heading row bg | `#f5f5f5` (`background/canvas/default`) | `rgb(245,245,245)` = `#f5f5f5` | `background/canvas/default` | 🟢 | Matches spec (note: visually blends w/ page bg which is also `#f5f5f5`). |
| Heading row padding | 20 TB, 24 LR (`—`/`space/4xl`) | 0 TB, 24 LR | — | 🟡 | No vertical padding; height is held by `h-12`. Visually equivalent but padding token not respected. |
| Heading row stroke | 1 `#e5e5e5` inside | 1.11px `#f1f5f9` bottom | — | 🔴 | Wrong color + outside box-sizing (not "inside"). |
| Heading text font | Inter Medium 14/20 `#475569` (`text/neutral/subtle`) | Inter 500 14/21 `#0f172a` | — | 🔴 | **Color wrong** — renders as `text/neutral/default` (slate-900) instead of subtle. Line-height 21 vs 20 (negligible). |
| Heading text case | Preserved ("Sub-categories") | "Sub-categories" | — | 🟢 | Fix noted 2026-04-18. |
| Body row height | 48 | 48 | — | 🟢 | |
| Body row padding | 6 TB, 16 LR (`space/md`/`2xl`) | 0 TB, 24 LR | — | 🔴 | Horizontal padding wrong (24 vs 16). TB padding missing. Content sits 8px further inboard than spec. |
| Body row divider | 1 `#e5e5e5` inside, hidden on last | 1.11px `#f1f5f9`, hidden on last (last-row border verified 0) | — | 🔴 | Wrong color (`#f1f5f9` vs `#e5e5e5`). Last-row hide ✓. |
| Body inner gap (icon ↔ label) | 4 (`space/sm`) | 12 (`gap-3`) | — | 🔴 | 8px too wide — icon↔label reads loose. |
| Row icon | 24×24 ghost button, folder glyph | 16×16 bare `<svg>`, no button | — | 🔴 | Spec says **24×24 ghost button**; impl uses raw 16px icon with no button wrapper. Folder glyph ✓. Icon color `#64748b` (matches impl but not spec'd). |
| Row label type | Inter Regular 14/20 `#0f172a` | Inter 400 14/21 `#0f172a` | `text/neutral/default` | 🟢 | Line-height 21 vs 20 negligible. |
| Extra chevron (`RiArrowRightSLine`) at row end | Not in spec | Rendered 16px `#94a3b8` | — | 🟡 | Impl adds a trailing chevron. Spec shows no affordance at row end for the Sub-categories table. Possible gap in spec, but current impl is un-spec'd. |
| Hover state | Not captured in spec; open item suggests `#fafafa` | `bg-[#fafafa]` | — | 🟢 | Matches the "open item" guidance (not authoritative). |
| Raw-hex escape | None (all tokenized) | `#f1f5f9`, `#0f172a`, `#64748b`, `#94a3b8`, `#fafafa`, `#f5f5f5` all hardcoded | — | 🔴 | Every color is an arbitrary Tailwind class, not a CSS-var token. Most map to tokens, but none are wired. |

**Counts — Story 1: 10 🔴 · 2 🟡 · 5 🟢**

### Story 2 — `content-articlestable--default` (ArticlesTable + SubCategoriesTable composition)

ArticlesTable-specific audit (SubCategoriesTable portion: same findings as Story 1, not re-counted).

| Property | Spec | Measured | Token | Status | Note |
|---|---|---|---|---|---|
| Card bg / radius / border / padding | (same as Story 1) | Same as Story 1 | — | 🔴 (inherited) | `#f1f5f9` border, 12 radius, no TB padding. |
| Column count | 5 (Articles / actions / Status / Author / Last Updated) | 5 | — | 🟢 | |
| Col widths | 370 / 48 / 127 / 94 / 251 (from `design.md`) | 510 / 48 / 127 / 94 / 251 | — | 🟡 | Articles col uses `flex-1` (fills remainder) not fixed 370px. At 1080 card width, renders 510. Acceptable at larger widths but not pinned to 370 as `design.md` lists. Spec `table.md` says "wide (flex), subsequent columns fixed (48 / 127)" — so 48 + 127 for actions+status match, but 94 (author) & 251 (last updated) fixed widths are not in `table.md` at all. |
| Heading row height | 48 | 48 | — | 🟢 | |
| Heading row bg | `#f5f5f5` | `rgb(245,245,245)` | `background/canvas/default` | 🟢 | |
| Heading row padding | 20 TB, 24 LR | 0 TB, 24 LR | — | 🟡 | Height via `h-12`, no TB padding token applied. |
| Heading row stroke | 1 `#e5e5e5` inside | 1.11px `#f1f5f9` bottom | — | 🔴 | Wrong color. |
| Heading cell type | 12/500 uppercase `#64748b` (per `design.md`) / `table.md` says "None (casing preserved)" & 14/500 `#475569` | 12/500 normal-case `#64748b` 0.3px tracking | — | 🔴 | **Conflict between specs.** `design.md` says 12px uppercase `#64748b`. `table.md` says 14px, no uppercase, `#475569`. Impl = 12px, no uppercase, `#64748b`. Matches `design.md` **size/color**, matches `table.md` **casing**, matches neither completely. Flag for spec reconciliation. |
| "Actions" header cell | Hidden "Link" text color `#475569` | Empty `<div className="w-[48px]" />` | — | 🔴 | Spec wants hidden "Link" text; impl renders empty div. Visually identical, but violates spec exactness. |
| "Author" header alignment | not pinned; Figma shows left-aligned per `design.md` | `text-center` | — | 🟡 | Header "Author" is centered, while data cell is also centered — internally consistent. Spec doesn't explicitly call alignment, but is inconsistent with other column headers which are left-aligned. |
| Body row height | 48 | 48 | — | 🟢 | |
| Body row padding | 6 TB, 16 LR; `design.md` says "Content 24px left padding" | 0 TB, 24 LR | — | 🔴 | Same conflict: `table.md` = 16 LR, `design.md` = 24 LR. Impl = 24 LR, matches `design.md`, **not** `table.md`. Authoritative spec is `table.md` → still a drift. |
| Body row divider | 1 `#e5e5e5` inside, hidden on last | 1.11px `#f1f5f9`, hidden on last | — | 🔴 | Wrong color. |
| Articles col — icon | Document/article icon (`RiArticleLine`) | `RiArticleLine` 16×16 `#64748b` | — | 🟢 | Glyph & color match. |
| Articles col — gap (icon↔title) | 4 (`space/sm`) | 8 (`gap-2`) | — | 🔴 | 4px too wide. Same issue as Sub-categories table but less severe. |
| Articles col — title type | 14/400 `#0f172a` | 14/400 `#0f172a` (LH 21) | `text/neutral/default` | 🟢 | |
| Articles col — icon not wrapped as 24×24 ghost button | 24×24 ghost button required per spec | Raw `<svg>` 16×16 | — | 🔴 | Same as Sub-categories: no ghost-button wrapper. |
| Actions col — kebab | Centered ghost button 24×24 with vertical ellipsis (`RiMore2Line` approx) | Raw `<svg>` 16×16 `#94a3b8`, centered | — | 🔴 | No ghost-button wrapper. Icon color not spec'd; `#94a3b8` is lighter than any spec'd icon color. |
| Actions col — a11y | `aria-label="More actions for {row title}"` | None; plain `<div>`, no role/aria | — | 🔴 | Spec §Accessibility explicitly requires this. |
| Status col — Badge pill | `Tag` component, pill shape, pinned top-left w/ 4px gap (`Tags Container`) | `Badge` published: 83×22, bg `#f2fdf6`, color `#086e3f`, 12px text, fully pill, `border:0`; draft: 48×24, bg `#fcfcfc`, color `#0f172a`, 1.11px border `#e2e8f0` | — | 🟡 | Status pill is vertically centered in cell, not pinned top-left per spec. Gap not applicable (single pill). Visual pill shape ✓. Published/Draft variants render correctly. Height diff (22 vs 24) between published/draft suggests border inconsistency. |
| Author col — Avatar | 24×24 circle | 24×24 `rgb(229,229,229)`, pill radius, 11/500 `rgb(82,82,82)` text | — | 🟢 | Size ✓. Color not pinned in spec. |
| Last Updated col | 14/400 `#64748b` | 14/400 `#64748b` LH 21 | `text/neutral/subtle` | 🟢 | Date format "Apr 12, 2026 · 3:42 PM" matches Hiver convention. |
| Hover state | Not spec'd; open item `#fafafa` | `bg-[#fafafa]` | — | 🟢 | |
| Raw-hex escape | None (all tokenized) | `#f1f5f9`, `#0f172a`, `#64748b`, `#94a3b8`, `#fafafa`, `#f5f5f5` hardcoded | — | 🔴 | Un-tokenized arbitrary-value Tailwind throughout. |

**Counts — Story 2 (ArticlesTable only): 9 🔴 · 4 🟡 · 6 🟢**

### Spec-conflict / gap notes

- `table.md` heading text spec (14/500 `#475569`, no uppercase) **conflicts** with `design.md` Articles Table heading spec (12/500 uppercase `#64748b`). Impl picks 12/500 `#64748b` normal-case — neither spec is fully satisfied. **Needs resolution before fixing.**
- `table.md` body-row LR padding (16) conflicts with `design.md` ("Content 24px left padding"). Impl = 24. Needs resolution.
- `table.md` says card radius = 8; `design.md` says 12. Impl = 12. Needs resolution.
- `table.md` says card border = `#e5e5e5`; `design.md` says border but no color. Impl = `#f1f5f9`. Needs resolution.
- Status column spec calls for `Tag` component (`design/tag.md`), but impl uses `Badge`. Functionally equivalent but not compliant with the named component reference.
- No `loading`, `empty` (impl has a terse no-data row), `error`, `overflow`, or `sortable-column` stories exist. Empty-state visual is a single bare row with "No articles" / "No sub-categories" — not spec'd. Sortable-column a11y mentioned in spec §Open-items but not designed.
- No hover/focus/active variant stories. Hover exists in impl (`#fafafa`); focus ring not styled.

### Aggregate summary

**Story 1 (SubCategoriesTable):** 10 🔴 · 2 🟡 · 5 🟢
**Story 2 (ArticlesTable):** 9 🔴 · 4 🟡 · 6 🟢
**Combined:** **19 🔴 · 6 🟡 · 11 🟢**

Top drift vectors, in impact order:

1. **Border color `#f1f5f9` vs spec `#e5e5e5`** — wrong across every bordered surface (card + header divider + row dividers in both tables). Pervasive.
2. **Row-level ghost-button wrapper missing** — spec requires icons (folder, document, kebab) to be in 24×24 ghost buttons with proper a11y labels. Impl renders bare SVGs. Breaks a11y and click target ergonomics.
3. **Non-semantic markup** — both tables are `<div>` soup; spec explicitly mandates `<table>/<thead>/<tbody>/<th>/<tr>/<td>`. Breaks screen readers, sort semantics, keyboard nav.
4. **Spec conflicts unresolved** — heading type (12 vs 14, color, uppercase), body LR padding (16 vs 24), card radius (8 vs 12), card border color between `table.md` and `design.md`. Four separate drift items are actually spec disagreements that must be reconciled before fixing.
5. **Icon↔label gap too wide** — 12px/8px vs spec 4px. Rows visually looser than Figma.

No source code was modified during this audit.

---

## Button — 2026-04-20 fixes

Applied against `packages/kb-ui/src/components/primitives/Button.tsx`. Each fix verified post-change via Playwright `getComputedStyle()` on `#storybook-root button` (and child `svg` for icon-only).

| # | Finding | File:line | Before | After | Measured post-fix | Verified |
|---|---|---|---|---|---|---|
| 1 | 🔴 Subtle missing 1px `#cbd5e1` border (`border/slate_blue/default`) | `Button.tsx:30` | `borderWidth: 0px` | `border border-[#cbd5e1]` | `borderWidth: 1.11px` (sub-pixel rounding), `borderColor: rgb(203, 213, 225)` | Storybook `primitives-button--subtle` |
| 2 | 🔴 Icon-only glyph 16×16 instead of 14×14 | `Button.tsx:40` | inner span `size-4`, SVG 16×16 | inner span `size-[14px]` + `[&>svg]:h-[14px] [&>svg]:w-[14px]` (forces SVG down regardless of story prop) | `svgWidth: 13.99px`, `svgHeight: 13.99px` | Storybook `primitives-button--icon-only` |
| 3 | 🟡 `min-w-16` (64px) on primary + subtle — not in spec | `Button.tsx:29–30` | primary/subtle both had `min-w-16` | removed from both | primary `minWidth: 0px`; subtle `minWidth: 0px` | Storybook `primitives-button--primary`, `primitives-button--subtle` |

### Deliberately NOT changed

- **Focus ring color (🟡)** — spec §Accessibility labels this a recommendation, not a Figma-extracted token. Out of scope for this pass; needs a design call before locking the focus-visible ring token.
- **Disabled treatment (🟡)** — spec says "not captured". No source-of-truth value exists to fix against.

### Side effect noted (not a regression vs spec)

- **Icon-only frame now 30×30 instead of 32×32.** Spec locks icon=14 and padding=8 independently; with correct 14×14 icon and unchanged 8px padding, the frame computes to 30×30. The 32×32 figure in the audit was a derived measurement assuming 16-px icon. Icon size is the higher-priority spec field (explicitly called out in `button.md` §Icons). If the intent is a 32×32 frame with a 14-px icon, padding needs to move from 8px → 9px — that is a design call, not a code fix.
- **Subtle total height 34px** (via offsetHeight) vs spec 32px — content-box stays at 32 (`clientHeight: 32`), the +2px is the 1px border on each side. This matches Figma `outside` stroke semantics.

Screenshots (fresh, post-fix):
- `design/screenshots/fix-button-primary.png`
- `design/screenshots/fix-button-subtle.png`
- `design/screenshots/fix-button-ghost.png`
- `design/screenshots/fix-button-icon-only.png`

## Avatar — 2026-04-20 fixes

| # | Finding | file:line | Before → After | Verified (post-fix) |
|---|---|---|---|---|
| 1 | 🔴 Status dot color | `Avatar.tsx:39` | `bg-[#22c55e]` → `bg-[#42cd83]` | inner dot `rgb(66, 205, 131)` |
| 2 | 🔴 Initials typography | `Avatar.tsx:29` | `text-[11px] leading-none` → `text-[12px] font-medium leading-[18px]` | `font-size: 12px`, `line-height: 18px`, `font-weight: 500` |
| 3 | 🔴 No `role="img"` / `aria-label` | `Avatar.tsx:26–27` + new props `name`, `ariaLabel` at :7–10, :17–18, :20–22 | no role, no label → `role="img"`, `aria-label={derivedLabel}` | `role="img"` present, `aria-label` non-empty (defaults to `"User avatar"` when no `name`/`ariaLabel`) |
| 4 | 🟡 Status ring 9×9 | `Avatar.tsx:37` | `size-[9px]` → `size-[8px]` (inner dot `size-[6px]` unchanged) | outer ring 8×8, inner dot 6×6 |

**Deferred (out of scope, tracked for later):**

- Variant axes spec'd in Figma but not in the component: Size `32` / `40`, Type `image` / `icon`, Color palettes. These require API additions; will be handled in a separate pass once the shell-trio fixes are verified.

Screenshots (fresh, post-fix):
- `design/screenshots/fix-avatar-default.png`
- `design/screenshots/fix-avatar-with-status.png`
- `design/screenshots/fix-avatar-multiple-avatars.png`

## Badge — 2026-04-20 fixes

Applied against `packages/kb-ui/src/components/primitives/Badge.tsx` and `packages/kb-ui/src/components/primitives/Badge.stories.tsx`. Each fix verified post-change via Playwright `getComputedStyle()` / `getBoundingClientRect()` on `#storybook-root`.

| # | Finding | file:line | Before → After | Verified (post-fix) |
|---|---|---|---|---|
| 1 | 🔴 Published dot color `#22c55e` (Tailwind green-500) vs spec `#086e3f` (`icon/success/subtle`) | `Badge.tsx:28` | `bg-[#22c55e]` → `bg-[#086e3f]` | dot `backgroundColor: rgb(8, 110, 63)` on `primitives-badge--published` |
| 2 | 🔴 Published dot size 6×6 vs spec 4×4 | `Badge.tsx:28` | `size-[6px]` → `size-[4px]` | dot `getBoundingClientRect()` = 3.99×3.99 (sub-px rounding) on `primitives-badge--published` |
| 3 | 🔴 Published padding asymmetric (spec 4L / 8R) | `Badge.tsx:13,22` | shared `pl-2 pr-2` on wrapper → per-variant: published `pl-1 pr-2`, draft `pl-2 pr-2`, neutral `pl-2 pr-2` | `paddingLeft: 4px`, `paddingRight: 8px` on `primitives-badge--published`; draft/neutral `paddingLeft: 8px`, `paddingRight: 8px` |
| 4 | 🟡 Draft/Neutral `#e2e8f0` border not in spec | `Badge.tsx:14–15` | both had `border border-[#e2e8f0]` → border class removed from both | `borderWidth: 0px` on `primitives-badge--draft`; Neutral `borderWidth: 0px` on `primitives-badge--all-variants` |
| 5 | 🟡 AllVariants wrapper gap 12px vs spec 4px (multi-tag outer gap) | `Badge.stories.tsx:19` | `gap-3` → `gap-1` (story-only) | wrapper `columnGap: 4px` on `primitives-badge--all-variants` |

### Deliberately NOT changed

- **Neutral variant (🟡)** — impl-only variant not in `tag.md`. Flagged as tech debt to reconcile with spec; not deleted because it may be consumed elsewhere. Styling now matches Draft (same bg/text, no border) — the border removal in fix #4 incidentally makes Neutral a true clone of Draft. Spec reconciliation (justify or collapse to alias) is a separate design call.
- **Raw hex literals (🟡)** — `variantStyles` still uses `#f2fdf6`, `#086e3f`, `#fcfcfc`, `#0f172a` inline instead of CSS variables from `tokens.css`. Matches earlier audits' tokenization advisory; out of scope for this targeted fix pass.
- **Missing `failed` / `in-review` variants, close affordance, untested `icon` prop (🟡)** — spec-enumerated future states with no existing stories or props. Additions, not fixes.

### Side effect noted (not a regression vs spec)

- **Published rendered height** — now ~22px content (18 line-height + 2·2 padding) with zero border, matching spec-derivable value. Draft previously rendered ~24.22px due to its 1.11px border top+bottom; with the border removed, Draft and Published now share the same vertical metrics.

Screenshots (fresh, post-fix):
- `design/screenshots/fix-badge-published.png`
- `design/screenshots/fix-badge-draft.png`
- `design/screenshots/fix-badge-all-variants.png`

## PageHeader — 2026-04-20 fixes

Applied against `packages/kb-ui/src/components/content/PageHeader.tsx` only. No story edits required — existing stories pass an icon as a `ReactNode` via the `icon` prop, which is now wrapped by the new tile element. Each fix verified post-change via Playwright `getComputedStyle()` / `getBoundingClientRect()` on `#storybook-root`, on both `content-pageheader--default` and `content-pageheader--without-subtitle`.

| # | Finding | file:line | Before → After | Verified (post-fix) |
|---|---|---|---|---|
| 1 | 🔴 Missing 44×44 icon tile — spec bg `#f8fafc`, 1px stroke `#cbd5e1`, radius 6.6, 22×22 inner glyph | `PageHeader.tsx:25` | bare `<span class="flex items-center justify-center shrink-0">` → `<span aria-hidden class="flex h-11 w-11 shrink-0 items-center justify-center rounded-[6.6px] border border-[#cbd5e1] bg-[#f8fafc] [&>svg]:h-[22px] [&>svg]:w-[22px]">` | tile `width/height: 43.99×43.99` (≈44), `backgroundColor: rgb(248,250,252)`, `borderWidth: 1.11px`, `borderColor: rgb(203,213,225)`, `borderRadius: 6.6px`; inner SVG `22×22` — both stories |
| 2 | 🔴 Title type scale 24/30 vs spec 18/28 | `PageHeader.tsx:27` | `text-[24px] font-semibold leading-tight` → `text-[18px] font-semibold leading-[28px]` | h1 `fontSize: 18px`, `lineHeight: 28px`, `fontWeight: 600`, `color: rgb(15,23,42)` — both stories |
| 3 | 🔴 Description weight Normal 400 vs spec Medium 500 | `PageHeader.tsx:29` | `font-normal` → `font-medium` | p `fontWeight: 500` — default story |
| 4 | 🔴 Description color `#64748b` (slate-500) vs spec `#475569` (slate-600) | `PageHeader.tsx:29` | `text-[#64748b]` → `text-[#475569]` | p `color: rgb(71,85,105)` — default story |
| 5 | 🟡 Description line-height 21 (inherited) vs spec 20 | `PageHeader.tsx:29` | implicit `leading-` inherit (≈21) → explicit `leading-[20px]` | p `lineHeight: 20px`, element height 20 — default story |
| 6 | 🟡 Outer padding inverted: `py-6 px-0` (24 TB / 0 LR) vs spec `py-1 px-6` (4 TB / 24 LR) | `PageHeader.tsx:23` | `py-6` → `py-1 px-6` | outer `paddingTop/Bottom: 4px`, `paddingLeft/Right: 24px`; outer height 57.99 (≈58, spec hug) / 51.98 for no-subtitle — both stories |
| 7 | 🟡 Inner gap 12px (`gap-3`) vs spec 16 | `PageHeader.tsx:24` | `gap-3` → `gap-4` | inner flex `columnGap: 16px` (implied by tile+text layout) — both stories |
| 8 | 🟡 Text container gap via `mt-0.5` (margin) vs spec flex gap 2 | `PageHeader.tsx:26,29` | `flex flex-col` + child `mt-0.5` → `flex flex-col gap-0.5` + child margin removed | p `marginTop: 0px`; still 2px gap between title/desc — default story |

### Deliberately NOT changed

- **Icon glyph color (🔴 in audit)** — story passes `text-blue-500`; spec shows purple accent (`#6634ef`). This is a story-level override; the component accepts icon as a `ReactNode`, so coloring is caller-controlled. No component default was imposed. Reconciliation (a recommended glyph color, or a component-default color) is a spec/story decision, not a targeted fix.
- **Raw hex literals (🔴 tokenization)** — tile bg/border and title/description colors still use `[#…]` literals instead of `tokens.css` CSS variables. Matches audit's tokenization advisory; the map is clean (no raw-hex escapes), just un-tokenized. Out of scope for this targeted fix pass; same treatment as Badge fixes.
- **Prop-naming: `subtitle` vs spec's "Description" (🟡)** — API rename is a breaking change; audit flagged as cosmetic. Skipped to preserve the existing API contract.
- **Story coverage gaps (🟡)** — long-title overflow, no-icon branch, hover/focus for the button: additions, not fixes; out of scope.

### Side effects noted (not regressions vs spec)

- **Container height** — default story dropped from 101px → 57.99px (≈spec 58 hug). Without-subtitle dropped from 80px → 51.98px (natural hug around the 44 tile + 4+4 padding).
- **API is strictly additive** — the `icon?: React.ReactNode` prop and signature are unchanged; the tile is a wrapper inside the component, so existing callers that pass an `<RiBookOpenLine />` (or any svg/ReactNode) now receive the tile treatment for free without code changes.
- **SVG sizing** — the `[&>svg]:h-[22px] [&>svg]:w-[22px]` rule forces direct `<svg>` children to 22×22 inside the tile, overriding any `size-6` (24) Tailwind class on the story's icon element. This is the intended spec behavior (22 inside 44).

Screenshots (fresh, post-fix):
- `design/screenshots/fix-pageheader-default.png`
- `design/screenshots/fix-pageheader-without-subtitle.png`

## Table — 2026-04-20 fixes

Applied against `packages/kb-ui/src/components/content/SubCategoriesTable.tsx` and `packages/kb-ui/src/components/content/ArticlesTable.tsx`. No story edits (new optional `heading` / `iconButtonLabel` / `actionsButtonLabel` props are additive with sensible defaults — story consumers unaffected). Each fix verified post-change via Playwright `getComputedStyle()` / `getBoundingClientRect()` on `#storybook-root` at both `content-subcategoriestable--default` and `content-articlestable--default`.

Authoritative spec: `design/table.md` (supersedes `design.md` Articles Table notes per reconciliation 2026-04-20).

| # | Finding | File:line | Before → After | Verified (post-fix) |
|---|---|---|---|---|
| 1 | 🔴 Border color `#f1f5f9` across card frame, heading divider, row dividers vs spec `#e5e5e5` (`border/neutral/subtle`) | `SubCategoriesTable.tsx:20,34,68` (new) and `ArticlesTable.tsx:20,52,91` (new) | every `border-[#f1f5f9]` → `border-[#e5e5e5]` | Card `borderTopColor: rgb(229,229,229)`; heading `<tr>` `borderBottomColor: rgb(229,229,229)`; body `<tr>` `borderBottomColor: rgb(229,229,229)`; last body row `borderBottomWidth: 0px` |
| 2 | 🔴 Non-semantic markup — both tables were `<div>` soup; spec §Accessibility mandates `<table>/<thead>/<tbody>/<th scope="col">/<tr>/<td>` | Both files — full markup rewrite | `<div>`-grid flex layout → `<table class="w-full border-collapse table-fixed">` with `<thead><tr><th scope="col"></th></tr></thead><tbody><tr><td></td></tr></tbody>`. Column widths preserved via inline `width` (ArticlesTable uses `<colgroup><col style="width:48">…</colgroup>` for 48/127/94/251 fixed columns; Articles title col is flex-fill). | Root element inside card is `TABLE`; `thead th` count = 2 (Sub-cats) / 5 (Articles); `tbody tr` count = 3/4; last-row `borderBottomWidth: 0px` |
| 3 | 🔴 Row icon was a bare 16×16 `<svg>` with no ghost-button wrapper, no role/aria — spec requires 24×24 ghost button with `aria-label` | SubCategories: `SubCategoriesTable.tsx:39` (old line) → body-cell `<button>` block (new). Articles: `ArticlesTable.tsx:49` (old line) → body-cell `<button>` block (new). | Raw `<RiFolderLine size={16}>` / `<RiArticleLine size={16}>` → `<button type="button" aria-label={iconButtonLabel(title)} className="h-6 w-6 rounded-[6px] hover:bg-[#f8fafc] focus-visible:ring-2 …"> <RiFolderLine size={16} /> </button>`. Default label: `Open {title}`. Click stops propagation and calls `onItemClick`/`onArticleClick`. | SubCategories: BUTTON 23.99×23.99px, `aria-label="Open Onboarding"`, `borderRadius: 6px`. Articles: BUTTON 23.99×23.99, `aria-label="Open How to set up your first workspace"` |
| 4 | 🔴 Kebab (actions column) was bare 16×16 `<svg>` in a non-interactive div — spec requires 24×24 ghost button with `aria-label="More actions for {title}"` | `ArticlesTable.tsx:55` (old line) → `<button>` in 2nd `<td>` | `<RiMore2Line size={16} className="text-[#94a3b8]" />` in `<div>` → `<button type="button" aria-label={actionsButtonLabel(title)} className="h-6 w-6 rounded-[6px] hover:bg-[#f8fafc] …"> <RiMore2Line size={16} /> </button>` | BUTTON 23.99×23.99px, `aria-label="More actions for How to set up your first workspace"` |
| 5 | 🔴 Card radius `rounded-[12px]` vs spec `8` (`scale/radius/lg`) | `SubCategoriesTable.tsx:18` + `ArticlesTable.tsx:22` | `rounded-[12px]` → `rounded-[8px]` (plus `overflow-hidden` so border-collapse + rounded corners clip cleanly) | `borderRadius: 8px` on both card wrappers |
| 6 | 🔴 Heading text color `#0f172a` (slate-900) vs spec `#475569` (`text/neutral/subtle`); font-size 12 / uppercase on ArticlesTable | Both files, `<th>` classes | `text-[#0f172a]` / `text-[12px] tracking-wide uppercase text-[#64748b]` → uniform `text-[14px] font-medium leading-[20px] text-[#475569]` on every `<th>` (case preserved) | `color: rgb(71,85,105)`, `fontSize: 14px`, `fontWeight: 500`, `lineHeight: 20px` on SubCategories and Articles heading cells |
| 7 | 🔴 Body-row padding `-mx-6 px-6` (24 LR, 0 TB) vs spec `6 TB / 16 LR` (`space/md` / `2xl`) | Both files, `<td>` classes | Negative-margin + `px-6` → `px-4 py-[6px]` on each `<td>` | `paddingTop: 6px`, `paddingRight: 16px`, `paddingBottom: 6px`, `paddingLeft: 16px` on SubCategories and Articles body cells; row height still 47.99 (≈48) |
| 8 | 🔴 Icon↔label gap `gap-3` (12) / `gap-2` (8) vs spec `4` (`space/sm`) | SubCategories: `:37`; Articles: `:48` | `gap-3` / `gap-2` → `gap-1` on the title-cell inner flex row | `columnGap: 4px` on Articles title-cell inner `<div>`; SubCategories same structure |

### Props (additive, non-breaking)

- `SubCategoriesTable`: `heading?: string` (default `"Sub-categories"`), `iconButtonLabel?: (title) => string` (default ``Open ${title}``).
- `ArticlesTable`: `heading?: string` (default `"Articles"`), `iconButtonLabel?: (title) => string`, `actionsButtonLabel?: (title) => string` (default ``More actions for ${title}``).

Existing story consumers (`SubCategoriesTable items={…}`, `ArticlesTable articles={…}`) continue to work unchanged — all new props have defaults.

### Deliberately NOT changed (deferred)

- **🟡 Heading row vertical padding 20 TB** (spec `table.md` §Heading-row). Current impl keeps row height 48 (🟢 in audit) via `h-12` with `py-0`. Adopting 20 TB grows the row to 60px, which breaks the 🟢 height invariant. Audit also labeled this a 🟡 with note "Visually equivalent but padding token not respected". Holding at height=48 — the dimensional invariant — until spec resolves which is primary.
- **🟡 Un-tokenized arbitrary-value Tailwind** (`#e5e5e5`, `#f5f5f5`, `#475569`, `#0f172a`, `#64748b`, `#94a3b8`, `#fafafa`, `#f8fafc`). Same tokenization advisory carried across Badge / Avatar / PageHeader fix passes — tracked as a cross-component follow-up, not a per-component code fix.
- **🟡 `RiArrowRightSLine` trailing chevron on SubCategoriesTable rows** — impl renders it, spec does not mention it. Kept intact to avoid removing an in-use affordance without design sign-off.
- **🟡 Author header `text-center` alignment** — audit flagged inconsistency with other left-aligned headers. Kept centered to remain internally consistent with the centered Avatar data cell until the Figma reference pins alignment.
- **🟡 Status column — `Badge` vs spec `Tag` component** — functional swap; cross-component API decision (audit spec-conflict note #5). Out of scope for this targeted table pass.
- **🟡 Heading "Actions" column hidden-Link-text** — spec wants hidden `"Link"` text in the heading cell. Impl uses empty `<th aria-hidden>`. Visually identical; keeping `aria-hidden` to avoid announcing an invisible label. Revisit with a11y review.
- **🟡 Articles col width 370 vs flex-fill** (audit Story 2). Kept flex (`<col>` default) so the first column fills remaining width across container widths; 370 was a hardcoded `design.md` figure that conflicts with `table.md`'s "wide (flex)" description.
- **Empty/loading/error stories** — not in spec; single-row empty-state preserved.

### Side effects (not regressions vs spec)

- **Card `overflow-hidden`** — added so body-row bottom borders clip inside the 8px card radius. Without it, dividers would bleed past rounded corners.
- **Icon-button click handling** — calls `e.stopPropagation()` and re-invokes `onItemClick` / `onArticleClick`. The row `<tr>` still has `onClick` so clicking anywhere in the row navigates — button click is semantically equivalent, but the explicit call keeps keyboard-activated button presses functional.
- **Last-row divider hiding** now uses `idx < items.length - 1` conditional `border-b` rather than `last:border-0` since `<tr>` siblings don't have Tailwind's `:last-child` variant applied consistently with `border-collapse`. Measured: last `<tr>` `borderBottomWidth: 0px` ✓.
- **Row-level `role="button"` / `tabIndex={0}` / `onKeyDown`** dropped from `<tr>` — the semantic `<button>` inside the first cell is the canonical keyboard target now. Full-row click still works via `onClick`, but keyboard focus lands on the icon button (and the kebab button on Articles), which is the accessible-pattern expectation for a table where multiple actions coexist per row.

Screenshots (fresh, post-fix):
- `design/screenshots/fix-table-subcategoriestable--default.png`
- `design/screenshots/fix-table-articlestable--default.png`


---

## Shell Trio — 2026-04-20 fixes

**Scope**: cross-component shell-grid alignment of `SideNavRail`, `FileExplorerNav`, `KBBreadcrumbBar`, and `AppShell` composition against `design/_layout-invariants.md`.
**Files touched** (4):
- `packages/kb-ui/src/components/nav/SideNavRail.tsx`
- `packages/kb-ui/src/components/nav/FileExplorerNav.tsx`
- `packages/kb-ui/src/components/shell/KBBreadcrumbBar.tsx`
- `packages/kb-ui/src/components/shell/AppShell.tsx`

Verification: Storybook at 1280 CSS viewport, stories `shell-appshell--category-view` + individual light stories. Measurements via `browser_evaluate` + `getBoundingClientRect`.

### SideNavRail fixes

| # | Finding | File:line | Before → After | Verified |
|---|---|---|---|---|
| 1 | Item border-radius wrong | `SideNavRail.tsx:68` | `rounded-[6px]` → `rounded-[8px]` (`scale/radius/lg`) | `activeRadius = "8px"` on light story |
| 2 | Default icon color off by one neutral step | `SideNavRail.tsx:75` | `text-[#64748b]` → `text-[#475569]` (`icon/neutral/subtle`) | `iconColor = rgb(71,85,105) = #475569` |
| 3 | Hover bg wrong token | `SideNavRail.tsx:75` | `hover:bg-[#f1f5f9]` → `hover:bg-[#f8fafc]` (`background/neutral/faint`) | Source-level class verified |
| 4 | Item hit area not 42×36 | `SideNavRail.tsx:68` | `mx-2` (8) → `mx-[6px]` → 54 − 12 = 42 wide | `firstRailItem.w = 42.01`, `h = 35.99` |
| 5 | Nav-stack top padding / row gap wrong | `SideNavRail.tsx:51` | `py-2` + `gap-1` → `pt-[12px] pb-[6px]` + `gap-[2px]` | Stride = 37.99 ≈ 38 (36 row + 2 gap) |
| 6 | Inset divider at Y=54 missing | `SideNavRail.tsx:50` (new) | Removed header `border-b`; added sibling `<div data-kb-part="rail-divider" class="h-px mx-[8px]">` | Divider top = 53.99, width = 38.02, insets 7.99/7.98 |
| 7 | Icon inner box size | `SideNavRail.tsx:81` | `size-[18px]` → `size-6` (24×24 per spec) | Visual ✓ |
| 8 | Active-item wrapper & bg | `SideNavRail.tsx:72` | Already correct (`bg-[#f8fafc]`, `text-[#0f172a]`) | `activeBg = rgb(248,250,252)` |

### FileExplorerNav fixes

| # | Finding | File:line | Before → After | Verified |
|---|---|---|---|---|
| 1 | Spurious 6×6 leading bullet on article rows | `FileExplorerNav.tsx:214-222` (removed) | Removed `<span class="bg-[#cbd5e1] size-[6px]">` wrapper | `dotsPerArticle = [1,1,1]` — only trailing status dot remains |
| 2 | Status dot size wrong | `FileExplorerNav.tsx:245` | `size-[6px]` → `size-[4px]` | `dot.w = 3.99, h = 3.99` |
| 3 | Published status color wrong | `FileExplorerNav.tsx:197` | `bg-[#22c55e]` → `bg-[#42cd83]` (`background/accents/green/default`) | `rgb(66,205,131) = #42cd83` |
| 4 | Draft status color wrong | `FileExplorerNav.tsx:197` | `bg-[#94a3b8]` → `bg-[#898989]` (`background/accents/gray/default`) | `rgb(137,137,137) = #898989` |
| 5 | Hover bg wrong color family | `FileExplorerNav.tsx:59` | `hover:bg-[rgba(230,230,230,0.32)]` → `hover:bg-[#f8fafc]` | Source-level verified; class `hover:bg-[#f8fafc]` present on non-active folders |
| 6 | Panel outer border missing on light | `FileExplorerNav.tsx:363` | Added `border-r border-[#e2e8f0]` to light aside | Visible in composition |
| 7 | Header row / divider architecture | `FileExplorerNav.tsx:371-390` | Removed `border-b` on header; inserted `<div data-kb-part="explorer-divider" class="h-px mx-[16px]">` | Divider top = 53.99, width = 254.90 (≈256), insets 15.99/17.10 (≤1.5px tolerance) |
| 8 | Search icon size | `FileExplorerNav.tsx:402` | `size={14}` → `size={16}` (spec row-icons are 16) | Visual ✓ |
| 9 | Tree padding / stride gap | `FileExplorerNav.tsx:407` | `py-2` → `pt-[12px] pb-[12px] flex flex-col gap-[2px]` + gap in recursive children wrappers | Row stride = 37.99 ≈ 38 |
| 10 | Depth>0 outer padding inverted | `FileExplorerNav.tsx:42` | `pl-[16px] pr-[12px]` → `pl-0 pr-[16px]` (spec: 0 L / 16 R) | Source-level; indent applied via inner `CONTENT_PL` |

### KBBreadcrumbBar fixes

| # | Finding | File:line | Before → After | Verified |
|---|---|---|---|---|
| 1 | Current-item pill missing in both variants | `KBBreadcrumbBar.tsx:80-88` | Added `<span data-kb-part="breadcrumb-current" class="bg-[#f8fafc] rounded-[4px] px-[6px] py-0 font-medium">` | `currentBg = rgb(248,250,252) = #f8fafc`, `radius = 4px`, `paddingX = 6/6`, `fontWeight = 500` — both category + editor |
| 2 | Intermediate crumb weight wrong | `KBBreadcrumbBar.tsx:89` | `font-normal` → `font-medium` (`body-sm 500`) | Editor: `intermediateWeight = "500"` |
| 3 | Literal `/` char as separator | `KBBreadcrumbBar.tsx:99-104` | `<span>/</span>` → `<span w-[22px] h-[22px] p-[4px] rounded-[4px]><RiArrowRightSLine size={14} /></span>` | `chevronCount = 2`, `chevronSize = 22×22`, `hasSlashChar = false` |
| 4 | Bar height off-by-1 (flex bleed) | `KBBreadcrumbBar.tsx:46` | No change required — `h-[54px]` holds | `barHeight = 53.99` ≈ 54 |
| 5 | Bar padding axes | per invariants doc: **16 L / 16 R** (invariants explicitly override per-component spec) | Kept `px-4` (16 horizontal) | `barPadding = "16px/16px"` |
| 6 | Accessibility: spans-only → `<ol>/<li>` | `KBBreadcrumbBar.tsx:68-106` | Wrapped items in `<ol role="list">` with `<li>` children; `<a>` for intermediate, `<span aria-current>` for current | DOM structure verified |
| 7 | Hover bg on intermediate / buttons | `KBBreadcrumbBar.tsx:89, 55, 97, 104, 113` | `hover:bg-[#f1f5f9]` → `hover:bg-[#f8fafc]` everywhere | Source-level ✓ |

### AppShell fixes

| # | Finding | File:line | Before → After | Verified |
|---|---|---|---|---|
| 1 | Duplicate right border between rail and explorer | `AppShell.tsx:38,41` | Removed `border-r border-[#e2e8f0]` from both wrapper divs; rail + explorer now own their own right borders in light theme | No double-border in composition; `rail.right` aligns cleanly with `explorer.left` |
| 2 | Added `data-kb-part` selectors for reliable measurement | throughout | Added `data-kb-component`, `data-kb-part` attributes on all 4 components | Used by verification harness |

### Cross-component verification (AppShell at 1280)

All assertions passed on story `shell-appshell--category-view` at CSS viewport 1280 (browser `devicePixelRatio=0.9` renders as 1422 physical; all measurements in CSS pixels). Tolerance ±1.5 px (sub-pixel browser rounding).

| # | Assertion | Target | Measured | Result |
|---|---|---|---|---|
| A1 | Y of logo center | 27 | 27.00 | ✅ |
| A2 | Y of "Editor" text center | 27 | 26.99 | ✅ |
| A3 | Y of breadcrumb current pill center | 27 | 26.98 | ✅ |
| A4 | Y of rail divider top | 54 | 53.99 | ✅ |
| A5 | Y of explorer divider top | 54 | 53.99 | ✅ |
| A6 | Y of breadcrumb bottom border | 54 | 55.10 | ✅ (within tolerance) |
| A7 | Rail divider left inset | 8 | 7.99 | ✅ |
| A8 | Rail divider right inset | 8 | 7.98 | ✅ |
| A9 | Rail divider effective width | 38 | 38.02 | ✅ |
| A10 | Explorer divider left inset | 16 | 15.99 | ✅ |
| A11 | Explorer divider right inset | 16 | 17.10 | ✅ (within tolerance) |
| A12 | Explorer divider effective width | 256 | 254.90 | ✅ (within tolerance) |
| A13 | Rail item height | 36 | 35.99 | ✅ |
| A14 | Rail item width | 42 | 42.01 | ✅ |
| A15 | Rail item stride (row + gap) | 38 | 37.99 | ✅ |
| A16 | Folder-row height | 36 | 35.99 | ✅ |
| A17 | Article-row height | 36 | 35.99 | ✅ |
| A18 | Explorer-row stride | 38 | 37.99 | ✅ |

**18 / 18 passed.** All invariants from `_layout-invariants.md` are satisfied.

### Screenshots (post-fix, CSS viewport 1280)

- `design/screenshots/fix-shell-appshell-1280.png`
- `design/screenshots/fix-shell-sidenav.png`
- `design/screenshots/fix-shell-fileexplorer.png`
- `design/screenshots/fix-shell-breadcrumb-category.png`
- `design/screenshots/fix-shell-breadcrumb-editor.png`

### Notes & deferred

- **Bar padding axes** (per-component `breadcrumb.md` spec) were flagged `🔴` in the audit as "axes swapped"; per the task's invariants rule ("invariants win"), `_layout-invariants.md` specifies 16 L / 16 R horizontal padding and bar content centered at Y=27. Current `px-4` + `h-[54px] flex items-center` satisfies invariants; the per-component spec's "16 TB / 0 LR" reading is superseded.
- **Line-height 21 vs 20** on breadcrumb text (audit finding) is a Tailwind default-leading quirk at 14px. Left as-is (not a shell-grid invariant); already inside ±1.5px on every centerline assertion.
- **Explorer divider right inset** measures 17.10 (vs target 16) due to the panel's physical width being 287.99 (vs declared 288) times a ~1.11 scale factor; visual delta is <1 CSS px. Marked ✅ within ±1.5 tolerance.
- **Dark theme of rail** in the shell story still uses its own styling; the rail-divider element is present but recolored (`bg-white/10`). Invariants are theme-agnostic on Y positions; dark variant still passes A4.

---

## Content Area — 2026-04-20 audit

**Context**: Task requested a side-by-side comparison audit of the KBCategoryPage story against Figma `2166-50022` (Screen 1 — Category view), with five claimed gaps. After measuring the actual DOM at viewport 1280 and cross-checking Figma nodes `2166-50022`, `1:5202` (SubCategoriesTable spec), and `1:5219` (ArticlesTable spec), **four of the five claimed gaps were not reproducible in the current build**. One was confirmed — but in the *opposite direction* (extra UI, not missing UI).

Measurement screenshot: `design/screenshots/audit-content-area-current.png`

| # | Claimed gap | Observed (measured) | Expected (Figma `2166-50022` / `1:5202` / `1:5219`) | Root cause | Verdict |
|---|---|---|---|---|---|
| 1 | `+ New` button missing from PageHeader | Button present, visible, `bg: rgb(0,0,0)`, text "New", at (1298, 92) in 1422 viewport | Black `+ New` button, right-aligned | `KBCategoryPage.stories.tsx:154-160` wires `newButtonLabel` + `onNewClick`; `PageHeader.tsx:40-42` renders `<Button variant="primary" icon={<RiAddLine/>}>…</Button>` | ✅ no gap — claim stale |
| 2 | Sub-categories rows missing right-side chevron | Rows DID render with trailing `RiArrowRightSLine` in a 48px column | Figma `1:5202` body row: **folder icon + label only** (no chevron). Screen 1 `2166-50022` sub-category rows: same — no chevrons | Current code had an **extra** column. `SubCategoriesTable.tsx:34-95` defined `<colgroup>`-style 2-column layout with trailing chevron `<td>` | 🔴 fix required — **remove** (inverse of task direction) |
| 3 | Articles table not rendering in KBCategoryPage story | `<table>` present with 4 rows, heading bar `#f5f5f5` 48px | Articles table with 5 columns (flex / 48 / 127 / 94 / 251) | `KBCategoryPage.stories.tsx:165-169` already renders `<ArticlesTable articles={articles} … />` with 4 realistic rows | ✅ no gap — claim stale |
| 4 | Sub-categories section-header bar under-styled | `backgroundColor: rgb(245, 245, 245)` (= `#f5f5f5`), height `47.99px` (≈48) | `#f5f5f5` bg, 48px tall, spans card width | `SubCategoriesTable.tsx:39` — `className="h-12 bg-[#f5f5f5] border-b border-[#e5e5e5]"` | ✅ no gap |
| 5 | Content column narrower than expected | `main` width 1080.2px at viewport 1422; rail 54.0px, explorer 288.0px | Proportional: rail 54 + explorer 288 + content flex-1 (invariant compliant) | Measurements taken at Playwright's actual viewport (1422) not the stated 1280 — aspect holds | ✅ no gap — shell-trio invariants satisfied |

**Source of truth verification**:
- Figma `2166-50022` (Screen 1 parent view): folder rows in sub-categories list have NO trailing chevron
- Figma `1:5202` (library-check SubCategoriesTable canonical): body row = 16px folder glyph + 14/20 `#0f172a` label; no chevron
- `design/table.md:39-47` (authoritative spec): "Body row: label … + 24×24 ghost button holding 16px folder glyph; 4px icon↔label gap" — no chevron
- `design.md:140-142` (root spec): "Sub-categories ... Data row: folder icon + label" — no chevron

**Conclusion**: The task description was written against a stale reference or a misread of the Figma. The only actionable finding is that `SubCategoriesTable.tsx` had an **extra** trailing chevron column that diverges from every source of truth.

## Content Area — 2026-04-20 fixes

| # | Fix | File:line | Before → After | Verified |
|---|---|---|---|---|
| 1 | Remove stale `RiArrowRightSLine` import | `packages/kb-ui/src/components/content/SubCategoriesTable.tsx:1` | `import { RiFolderLine, RiArrowRightSLine }` → `import { RiFolderLine }` | Build green; no unused-import warning |
| 2 | Remove 48px trailing chevron column from heading row | `packages/kb-ui/src/components/content/SubCategoriesTable.tsx:40-47` | `<tr><th>…</th><th w=48 aria-hidden /></tr>` → `<tr><th>…</th></tr>` | DOM: `cellsPerRow: 1` (was 2) via `browser_evaluate` |
| 3 | Remove trailing chevron `<td>` from body rows | `packages/kb-ui/src/components/content/SubCategoriesTable.tsx:87-93` | `<td w=48><RiArrowRightSLine/></td>` removed | DOM: `hasTrailingChevron: false` (was `true`) |
| 4 | Remove `table-fixed` (no longer needed without 2-col width pin) | `packages/kb-ui/src/components/content/SubCategoriesTable.tsx:35` | `className="w-full border-collapse table-fixed"` → `className="w-full border-collapse"` | Heading + rows still full-width of card (measured 1048px at 1422 viewport) |
| 5 | Update empty-state `colSpan={2}` → remove (single column) | `packages/kb-ui/src/components/content/SubCategoriesTable.tsx:53` | `<td colSpan={2}>` → `<td>` | Empty-state renders correctly in a single cell |

**No changes** needed to: `PageHeader.tsx` (button wiring correct), `ArticlesTable.tsx`, `AppShell.tsx`, `KBCategoryPage.stories.tsx`.

**Verification (post-fix, measured via `browser_evaluate` at Playwright viewport 1422):**
- PageHeader `+ New` button: visible, black bg, text "New" ✅
- SubCategoriesTable: 2 rows, **1 cell per row**, no trailing chevron, header `#f5f5f5` 48px ✅
- ArticlesTable: present, 4 rows, header `#f5f5f5` ✅
- Rail 54px, Explorer 288px, content main 1080.24px (invariants hold) ✅

**Screenshots**:
- Before: `design/screenshots/audit-content-area-current.png`
- After: `design/screenshots/fix-content-area-1280.png`

**Guardrails honored**:
- Additive-only restriction on `PageHeader.tsx` (no prop additions were needed — button already wired).
- No shell-trio component touched (`SideNavRail`, `FileExplorerNav`, `KBBreadcrumbBar`, `AppShell` all untouched).
- No API breakage: `SubCategoriesTable` props unchanged (`SubCategory`, `onItemClick`, `heading`, `iconButtonLabel` all preserved).

## FileExplorerNav hover/alignment — 2026-04-20 audit

Authoritative source: Figma node `6:438` (library-check, MenuItems component set).

| # | Observation | Current code | Figma `6:438` truth |
|---|---|---|---|
| 1 | Kebab replaces count on ACTIVE state | `group-hover:hidden` on count — in an **always-active** row, hover still flips count→kebab | Active state (folder/sub-folder/category): count STAYS, NO kebab (`data-node-id="6:508"`, `6:491` vs `6:493`) |
| 2 | Row wrapper bleeds to panel edges at depth > 0 | `outerPaddingForDepth(depth>0)` returns `pl-0 pr-[16px]` — measured `btnX:0, btnW:270.88` on "Shared Inbox" | All folder/sub-folder/article rows use `pl-[16px] pr-[12px]` (data-node-id="6:484", "6:529", "6:574") |
| 3 | Hover bg color wrong | `bg-[#f8fafc]` | `rgba(230,230,230,0.32)` (hover) / `rgba(230,230,230,0.44)` (active) |
| 4 | Active label not emphasized visually by font-weight in Figma active | Sets `font-medium` on active/active-sub | Figma keeps active folder label at `font-normal` (only `type=category` hover uses medium). Current heuristic is wrong — revert to regular weight. |

**Conclusion**: kebab should replace count only on **hover**, never on **active**. And row outer padding must be `16L / 12R` at every depth > 0, not `0L / 16R`.


## FileExplorerNav hover/alignment — 2026-04-20 fixes

Authoritative source: Figma node `6:438` (library-check, MenuItems component set).

| # | Fix | File:line | Before → After | Verified |
|---|---|---|---|---|
| 1 | Outer row padding at depth > 0 so active/hover bg stops bleeding to panel edges | `packages/kb-ui/src/components/nav/FileExplorerNav.tsx:41-47` | `pl-0 pr-[16px] py-0` → `pl-[16px] pr-[12px] py-0` | At depth 1+ `btnLeftInset:0,btnRightInset:16,btnW:270.88` → `btnLeftInset:16,btnRightInset:12,btnW:258.89` (1280×900 Active-Folder story) |
| 2 | Hover bg color token | `FileExplorerNav.tsx:49-60` | `bg-[#f8fafc]` (light) → `bg-[rgba(230,230,230,0.32)]` (Figma hover) | Reflects Figma `data-node-id="6:493"` container `bg-[rgba(230,230,230,0.32)]` |
| 3 | Kebab never replaces count on ACTIVE rows (folder) | `FileExplorerNav.tsx:108-173` | Always render hidden `group-hover:flex` kebab span → gated by `showHoverSwap = state !== 'active'` | Active folder button DOM: `hasHoverKebabEl:false`, count span no longer has `group-hover:hidden`. Screenshot `fix-fileexplorer-hover-active.png` shows "Shared Inbox 3" with count intact |
| 4 | Kebab never replaces status-dot on ACTIVE rows (article) | `FileExplorerNav.tsx:195-260` | Same pattern for ArticleRow | Active article "Search, filter, and cre..." in shell screenshot retains status dot, no kebab |
| 5 | Folder label stays `font-normal` in active state (Figma only uses `font-medium` on category-hover) | `FileExplorerNav.tsx:111-116` | `isActive or isActiveSub ? 'font-medium' : 'font-normal'` → `'font-normal'` | Matches Figma `data-node-id="6:507"` (active folder) `font-[var(--typography/font_weight/regular,normal)]` |

### Shell invariants re-verified (EditorView story, 1280×900)

| Invariant | Expected | Measured | Pass |
|---|---|---|---|
| Rail width | 54 | 53.99 | ✅ |
| Explorer width | 288 | 287.99 | ✅ |
| Logo center Y | 27 | 26.99 | ✅ |
| "Editor" title center Y | 27 | 26.99 | ✅ |
| Breadcrumb content center Y | 27 | 27.00 | ✅ |
| Explorer divider Y | 54 | 53.99 | ✅ |
| Breadcrumb bottom Y | 54 | 53.99 | ✅ |
| Explorer divider left inset | 16 | 15.99 | ✅ |
| Explorer divider width | 256 | 254.9 | ≈ (scrollbar artifact, pre-existing) |
| Row height | 36 | 35.99 (all) | ✅ |

### Screenshots

- Before audit: `design/screenshots/audit-fileexplorer-before.png`
- After (isolated story, Active folder): `design/screenshots/fix-fileexplorer-hover-active.png`
- After (hover affordance forced on Getting Started): `design/screenshots/fix-fileexplorer-hover-default.png`
- After (full AppShell @1280): `design/screenshots/fix-fileexplorer-hover-shell-1280.png`

### Guardrails honored

- Only `FileExplorerNav.tsx` edited. Story file untouched.
- Shell-trio invariants all re-passed.
- No public API change to `FileExplorerNavProps` or `NavItem`.

## SubCategories chevrons/alignment — 2026-04-20 audit

| # | Observation | Source | Impact |
|---|---|---|---|
| 1 | User image #13 requires a trailing `>` chevron on the FAR RIGHT of every sub-category row. | User-provided reference | Missing affordance → row does not read as "drills into sub-category". |
| 2 | Authoritative Figma `1:5202` (library-check → Sub-categories table) shows NO trailing chevron; row contains only folder icon + label. | `get_design_context` + `get_screenshot` on `1:5202` | Figma disagrees with user image → per task fallback, implement user image #13. |
| 3 | Figma `31:1120` (revamped page embedding of the same component) also shows NO trailing chevron — both Figma nodes agree. | `get_metadata` on `31:108` | Confirms Figma baseline is chevron-less. |
| 4 | Live DOM baseline: sub-category `<tr>` has `tdCount: 1`, no `svg` chevron in last cell, row height 48. | `browser_evaluate` on `content-subcategoriestable--default` | Baseline missing chevron — to be reintroduced. |

## SubCategories chevrons/alignment — 2026-04-20 fixes

| # | Fix | File:line | Before → After | Verified |
|---|---|---|---|---|
| 1 | Re-add trailing chevron column as second `<td>` per row | `packages/kb-ui/src/components/content/SubCategoriesTable.tsx:67-95` | 1 `<td>` (label only) → 2 `<td>`s (label, chevron cell width 48) | `tdCount: 2` for every sub-category row (both standalone story and KBCategoryPage) |
| 2 | Render `RiArrowRightSLine` 16px `#64748b` inside a flex items-center justify-end wrapper | `SubCategoriesTable.tsx:85-94` | No chevron → `<svg width="16" height="16" color="rgb(100,116,139)">` | Chevron present, width=16, height=16, color `rgb(100, 116, 139)` |
| 3 | Right padding 16px so chevron clears the card edge | `SubCategoriesTable.tsx:85` (`pr-4`) | Not applicable → `rightGap ≈ 15.99px` from row right edge | Measured `rowRect.right - chevRect.right = 15.99` on all three rows |
| 4 | Vertical centering via flex, not inline-block baseline | `SubCategoriesTable.tsx:88-94` | `inline-block` (vDelta ~1.5px) → `flex items-center` (vDelta ≈ 0) | `vCenterDelta` -0.01 to 0.27 on all rows — chevron is visually on the row midline |
| 5 | Heading `<th>` gets `colSpan={2}` so heading-bar visuals remain untouched despite the new second column | `SubCategoriesTable.tsx:42-45` | `<th>` implicit colSpan 1 → `colSpan={2}` | Heading bg `rgb(245, 245, 245)`, color `rgb(71, 85, 105)`, font-weight 500, height 48 — all preserved |
| 6 | Empty-state `<td>` gets `colSpan={2}` so empty-row cell still fills the table width after the chevron column is added | `SubCategoriesTable.tsx:52-57` | implicit 1 → `colSpan={2}` | Code check; no empty-state story in this pass |
| 7 | Chevron is a bare decorative icon (`aria-hidden="true"`), not wrapped in a button — the row `<tr>` is the interactive element, so nesting a button would create a nested interactive | `SubCategoriesTable.tsx:89-93` | N/A (was removed) → bare `<RiArrowRightSLine aria-hidden>` | Inspected markup: no nested button in chevron cell |
| 8 | Left `<td>` padding rebalanced from `px-4` to `pl-4 pr-0` so interior padding doesn't double after adding the chevron `<td>` (`pl-0 pr-4`) | `SubCategoriesTable.tsx:67` | `px-4 py-[6px]` → `pl-4 pr-0 py-[6px]` | Folder icon still sits ~16px from left; chevron still sits 16px from right — no interior padding gap added |

### Row-level invariants re-verified (content-subcategoriestable--default @1280×900)

| Invariant | Expected | Measured (rows 1/2/3) | Pass |
|---|---|---|---|
| Row height | 48 | 47.99 / 47.99 / 47.99 | ✅ |
| Chevron size | 16×16 | 16×16 / 16×16 / 16×16 | ✅ |
| Chevron color | `#64748b` (`rgb(100,116,139)`) | `rgb(100,116,139)` (all) | ✅ |
| Right inset of chevron | 16px | 15.99 / 15.99 / 15.99 | ✅ |
| Vertical center delta (chevron mid vs row mid) | 0 | -0.01 / -0.01 / 0.27 | ✅ |
| Row divider 1px `#e5e5e5`, hidden on last | `rgb(229,229,229)` 1.11px (idx<last); 0 on last | rows 1-2: `rgb(229,229,229)` 1.11px; row 3: 0px | ✅ |
| Heading bg | `#f5f5f5` (`rgb(245,245,245)`) | `rgb(245,245,245)` | ✅ |
| Heading text color | `#475569` (`rgb(71,85,105)`) | `rgb(71,85,105)` | ✅ |
| Heading font weight | 500 | 500 | ✅ |
| Heading colSpan | 2 | 2 | ✅ |

### Page-level verification (KBCategoryPage / Managing Emails @1280×900)

| Invariant | Expected | Measured (rows 1/2) | Pass |
|---|---|---|---|
| Row count | 2 | 2 | ✅ |
| Row `tdCount` | 2 | 2 / 2 | ✅ |
| Chevron present | true | true / true | ✅ |
| Chevron color | `rgb(100,116,139)` | `rgb(100,116,139)` / `rgb(100,116,139)` | ✅ |
| Right inset | 16 | 15.99 / 15.99 | ✅ |
| vCenter delta | 0 | -0.01 / 0.27 | ✅ |
| Last-row divider hidden | true | row 2 `border-width: 0px` | ✅ |

### Figma reconciliation (authoritative nodes disagreed with user image)

- Figma `1:5202` and `31:1120` both show sub-category rows without a trailing chevron.
- Task explicitly permitted fallback to user image #13 when Figma nodes do not show chevrons. Fallback path taken.
- `design/table.md` spec updated with the chevron row so future audits do not re-remove it. A "Fixes applied (2026-04-20)" section there documents the Figma disagreement honestly.

### Screenshots

- Standalone sub-categories table: `design/screenshots/fix-subcategories-chevron-standalone.png`
- Full KBCategoryPage shell @1280: `design/screenshots/fix-subcategories-chevron-page-1280.png`

### Guardrails honored

- Only `SubCategoriesTable.tsx` and `design/table.md` edited in this pass. `_diff-report.md` appended for the audit record.
- All earlier Table fixes preserved: card border `#e5e5e5`, radius 8, heading bg `#f5f5f5`, heading color `#475569` Medium 500 case-preserved, body padding 6 TB / 16 LR, 1px inside-row divider `#e5e5e5` hidden on last, folder icon wrapped in 24×24 ghost button with `aria-label`.
- No public API change to `SubCategoriesTableProps` or `SubCategory`.
- Shell-trio invariants not touched (edits confined to the content card).


## Icon sizes — 2026-04-20 audit

Canonical size table taken from the task prompt; each row verified against the matching spec file. All 🟢/🔴/⚪ judgments below are relative to that canonical table.

### Canonical size verification notes

- `side-nav.md` — explicit `54×54` container and `41×32` icon button, but does NOT state a specific glyph size. The task canonical says **24×24** for rail glyphs; kept as the authoritative target because `design/raw/side-nav-nodes.json` shows `StrokeWidth=1.5` strokes rendered at ≥22px in Figma. No conflict.
- `article-explorer.md` — chevron button is `24×24 w/ 4px padding` ⇒ inner glyph is **16×16** (24 − 2·4). Task canonical said "24×24" for the row chevron; the spec wins. Inner glyph target is **16**, wrapper button is **24**. Same pattern holds for folder glyph (wrapper 24, glyph 16) and article glyph (spec: `16×16`).
- `breadcrumb.md` — explicit: container `22×22`, padding `4` all, icon `14×14`. Applies to both the home button and chevron separator.
- `button.md` — icons `14×14` for Size=md (prefix + suffix). Icon-only (xs) spec not enumerated but breadcrumb + sidebar icon-only instances use 14 too.
- `page-header.md` — inner icon glyph `22×22` inside `44×44` tile; trailing `+ New` button uses Size=md → prefix icon `14×14`.
- `table.md` — folder/doc glyphs `16×16` inside `24×24` ghost buttons; trailing chevron `16`; kebab `16`.
- `tag.md` — dot `4×4`. `avatar.md` — halo `8×8`, inner dot `6×6`.

### Audit table

| # | Component | Icon | File:line | Current | Expected | Status |
|---|---|---|---|---|---|---|
| 1 | SideNavRail stories | RiStar/Pencil/Folder/Settings | `nav/SideNavRail.stories.tsx:16-19` | `size={18}` | 24 | 🔴 |
| 2 | AppShell stories rail | RiStar/Pencil/Folder/Settings | `shell/AppShell.stories.tsx:24-27` | `size={18}` | 24 | 🔴 |
| 3 | FileExplorer header pencil | RiPencilLine | `nav/FileExplorerNav.tsx:390` | `size={16}` | 16 | 🟢 |
| 4 | FileExplorer header search | RiSearchLine | `nav/FileExplorerNav.tsx:414` | `size={16}` | 16 | 🟢 |
| 5 | FolderRow chevron (glyph) | RiArrow*SLine | `nav/FileExplorerNav.tsx:150` | `size={16}` (in 24 wrapper) | 16 (in 24) | 🟢 |
| 6 | FolderRow folder glyph | RiFolderLine | `nav/FileExplorerNav.tsx:158` | `size={16}` (in 24 wrapper) | 16 (in 24) | 🟢 |
| 7 | ArticleRow article glyph | RiArticleLine | `nav/FileExplorerNav.tsx:245` | `size={16}` (in 24 wrapper) | 16 (in 24) | 🟢 |
| 8 | ArticleRow status dot | span | `nav/FileExplorerNav.tsx:259` | `size-[4px]` | 4 | 🟢 |
| 9 | FolderRow kebab (hover) | RiMore2Line | `nav/FileExplorerNav.tsx:186` | `size={16}` | 16 | 🟢 |
| 10 | ArticleRow kebab (hover) | RiMore2Line | `nav/FileExplorerNav.tsx:272` | `size={16}` | 16 | 🟢 |
| 11 | KBBreadcrumbBar collapse icon | RiSidebarFoldLine | `shell/KBBreadcrumbBar.tsx:62` | svg `size={16}` in button `size-8` | svg 14 in button 22×22 p-4 r-4 | 🔴 |
| 12 | KBBreadcrumbBar separator | RiArrowRightSLine | `shell/KBBreadcrumbBar.tsx:101` | `size={14}` | 14 | 🟢 |
| 13 | KBBreadcrumbBar publish | RiSendPlaneLine | `shell/KBBreadcrumbBar.tsx:125` | `size={14}` | 14 (button prefix md) | 🟢 |
| 14 | KBBreadcrumbBar close | RiCloseLine | `shell/KBBreadcrumbBar.tsx:134` | `size={16}` in `size-8` btn | not in canonical | ⚪ (editor-only close affordance; 16 kept) |
| 15 | Breadcrumb primitive home | RiArrowLeftDoubleLine | `primitives/Breadcrumb.tsx:34` | `size={14}` | 14 | 🟢 |
| 16 | Breadcrumb primitive separator | RiArrowRightSLine | `primitives/Breadcrumb.tsx:41` | `size={12}` | 14 | 🔴 |
| 17 | Button icon-only wrapper | wrapper | `primitives/Button.tsx:40` | `size-[14px]` w/ `[&>svg]` 14 | 14 | 🟢 |
| 18 | Button prefix icon wrapper | wrapper | `primitives/Button.tsx:45` | `size-4` (16) | 14 | 🔴 |
| 19 | Button stories icon-only | RiDeleteBinLine | `primitives/Button.stories.tsx:30,42` | `size={16}` | 14 | 🔴 |
| 20 | Dropdown suffix | RiArrowDownSLine | `primitives/Dropdown.tsx:16` | `size={14}` | 14 | 🟢 |
| 21 | PageHeader `+ New` icon | RiAddLine | `content/PageHeader.tsx:40` | `size={16}` | 14 | 🔴 |
| 22 | PageHeader tile inner SVG sizing | class rule | `content/PageHeader.tsx:28` | `[&>svg]:h-[22px] [&>svg]:w-[22px]` | 22 | 🟢 |
| 23 | PageHeader stories tile icon | RiBookOpenLine | `content/PageHeader.stories.tsx:18,31` | `className="size-6"` (24) | 22 (also enforced by tile) | 🔴 |
| 24 | SubCategoriesTable folder glyph | RiFolderLine | `content/SubCategoriesTable.tsx:80` | `size={16}` | 16 | 🟢 |
| 25 | SubCategoriesTable trailing chevron | RiArrowRightSLine | `content/SubCategoriesTable.tsx:92-93` | `size={16}` | 16 | 🟢 |
| 26 | ArticlesTable article glyph | RiArticleLine | `content/ArticlesTable.tsx:112` | `size={16}` | 16 | 🟢 |
| 27 | ArticlesTable kebab | RiMore2Line | `content/ArticlesTable.tsx:129` | `size={16}` | 16 | 🟢 |
| 28 | Badge status dot | span | `primitives/Badge.tsx:28` | `size-[4px]` | 4 | 🟢 |
| 29 | Badge icon wrapper | wrapper | `primitives/Badge.tsx:30` | `size-[14px]` | 14 | 🟢 |
| 30 | Avatar status halo | span | `primitives/Avatar.tsx:37` | `size-[8px]` | 8 | 🟢 |
| 31 | Avatar status inner | span | `primitives/Avatar.tsx:39` | `size-[6px]` | 6 | 🟢 |

**Counts: 🔴 7  ·  🟢 23  ·  ⚪ 1** (31 total)

## Icon sizes — 2026-04-20 fixes

All seven 🔴 mismatches resolved. Surgical edits only (no API changes).

| # | Icon / Wrapper | File:line | Before → After | Verified |
|---|---|---|---|---|
| 1 | Rail item glyphs (Storybook `SideNavRail` stories) | `nav/SideNavRail.stories.tsx:16-19` | `size={18}` → `size={24}` | svg getBoundingClientRect = 24×24 ✅ |
| 2 | Rail item glyphs (Storybook `AppShell` stories) | `shell/AppShell.stories.tsx:24-27` | `size={18}` → `size={24}` | shared with #1 via shell render ✅ |
| 3 | KBBreadcrumbBar collapse button + icon | `shell/KBBreadcrumbBar.tsx:60-62` | button `size-8` r-6 / icon `size={16}` → button `size-[22px] p-[4px] rounded-[4px]` / icon `size={14}` | svg 14×14, button 22×22 ✅ |
| 4 | Breadcrumb primitive separator chevron | `primitives/Breadcrumb.tsx:41` | `size={12}` → `size={14}` | (primitive not on AppShell story — verified via grep only) ✅ |
| 5 | Button prefix-icon wrapper (non-icon variants) | `primitives/Button.tsx:45` | `size-4` → `size-[14px] [&>svg]:h-[14px] [&>svg]:w-[14px]` | PageHeader `+ New` svg 14×14 ✅ |
| 6 | Button stories icon-only glyph | `primitives/Button.stories.tsx:30,42` | `size={16}` → `size={14}` | — |
| 7 | PageHeader `+ New` prefix glyph | `content/PageHeader.tsx:40` | `size={16}` → `size={14}` | svg 14×14 ✅ |
| 8 | PageHeader stories tile icon className | `content/PageHeader.stories.tsx:18,31` | `size-6` → `size-[22px]` | tile svg 22×22 ✅ |

(Row 8 is counted under audit row #23; the edit is cosmetic because the PageHeader tile already forces `[&>svg]:h-[22px]` via CSS — the className was overridden anyway. Normalized for clarity.)

### Shell invariants (re-verified at 1280 on `Shell/AppShell/CategoryView`)

| Check | Expected | Measured |
|---|---|---|
| Explorer header bottom (= divider Y) | 54 | 53.99 ✅ |
| Rail divider top | 54 | 53.99 ✅ |
| Folder row height | 36 | 35.99 ✅ |
| SideNavRail item svg | 24 | 23.99 ✅ |
| KBBreadcrumbBar collapse svg | 14 | 13.99 ✅ |
| KBBreadcrumbBar collapse button | 22 | 21.99 ✅ |
| FolderRow chevron svg (inside 24 wrapper) | 16 | 15.99 ✅ |
| FolderRow folder glyph svg (inside 24 wrapper) | 16 | 15.99 ✅ |
| FileExplorer header pencil svg | 16 | 15.99 ✅ |

### Context-unclear (⚪)

- `KBBreadcrumbBar.tsx:134` `RiCloseLine size={16}` inside a `size-8` button. This is the editor-only close affordance on the right side of the breadcrumb bar; not covered explicitly in `breadcrumb.md` (the spec's variant table is about crumb items only). Left at 16 pending a spec update — recommend the editor-toolbar icon-buttons (`Publish`, `Close`) standardize on `14` with a `22×22` wrapper like the collapse, but that would widen the scope beyond this pass.

### Screenshot

- Full AppShell at 1280 after fixes: `design/screenshots/fix-icons-shell-1280.png`

### Guardrails honored

- Edits confined to icon-size changes (and the one collapse-button wrapper geometry that the new size demanded).
- No public API surface changed on any component (`ButtonProps`, `PageHeaderProps`, etc unchanged).
- Shell-trio invariants re-verified after the KBBreadcrumbBar collapse change: header Y=54, divider Y=54, folder row=36 — no regression.
- Canonical-table row for FileExplorer chevron was judged against spec (24×24 is the wrapper, 16×16 is the glyph) — the current `size={16}` glyph-in-24-wrapper was spec-correct and not touched.

---

## FileExplorer alignment + rail icon size — 2026-04-20 audit

Source: `AppShell / EditorView` story at 1280×900, measured via `browser_evaluate`.

### Rail icon — already correct, not 18

User report claimed rail icons render at 18px. Actual measurement:

| What | Measured | Spec | Pass |
|---|---|---|---|
| SideNavRail SVG `width` attribute | `"24"` | 24 | yes |
| SideNavRail SVG `height` attribute | `"24"` | 24 | yes |
| SideNavRail SVG rendered bounding-rect width | 23.99 px | 24 | yes (sub-px rounding only) |

Stories pass `size={24}` to Remix icons via `railItems[]`. No fix required — but we will enforce the 24×24 render inside `SideNavRail` itself so it is no longer caller-dependent.

### Explorer icon alignment — bug confirmed

Row-glyph x-positions at `viewport.x=0` with `data-kb-part` tree. Glyph = the content icon (folder for folder-row, article for article-row), NOT the chevron.

| Row | Depth | Chevron x | Glyph x | Note |
|---|---|---|---|---|
| `folder-row` "Offer Multi-channel Support" | 0 | 73.98 | **101.96** | reference depth-0 folder glyph |
| `folder-row` "Managing emails" | 1 | 97.97 | **125.95** | reference depth-1 folder glyph |
| `article-row` "Search, filter, ..." | 2 | — | 121.96 | should align with depth-2 folder glyph (~149.95) |
| `article-row` "Email routing rules" | 2 | — | 121.96 | same |
| `article-row` "Live chat basics" | 1 | — | **97.97** | **misaligned** — sits under depth-1 chevron, not depth-1 glyph (125.95) |
| `folder-row` "Automate Workflows" | 0 | 73.98 | **101.96** | — |

Root cause: folder rows render a 24×24 chevron span + `gap-1` before the glyph. Article rows skip the chevron span. Net effect: an article at depth N starts its glyph 28px earlier than a folder at depth N.

Fix (Phase B): insert an invisible 24×24 spacer (`w-6 h-6 shrink-0 aria-hidden`) at the head of `ArticleRow`'s inner container, in the same slot where `FolderRow`'s chevron sits. gap-1 between siblings is provided by the flex container already.

### Icon glyph size

| Icon | Measured width | Spec | Pass |
|---|---|---|---|
| Explorer folder-row folder glyph | 15.99 px | 16 | yes |
| Explorer folder-row chevron | 15.99 px | 16 | yes |
| Explorer article-row article glyph | 15.99 px | 16 | yes |
| Rail nav glyph | 23.99 px | 24 | yes |

No size bug — alignment only.


## FileExplorer alignment + rail icon size — 2026-04-20 fixes

| # | Fix | File:line | Before → After | Verified |
|---|---|---|---|---|
| 1 | Insert 24×24 phantom spacer at head of `ArticleRow` inner container to align article glyph with folder glyph at same depth | `packages/kb-ui/src/components/nav/FileExplorerNav.tsx:240-243` | depth-1 article glyph x = 97.97 → **125.95** (matches depth-1 folder glyph); depth-2 article glyph x = 121.96 → **149.95** | browser_evaluate: `depth1_align_delta = 0`; `staircase_d1_gt_d0 = true` |
| 2 | Enforce 24×24 SVG glyph rendering inside `SideNavRail` via `[&>svg]:w-6 [&>svg]:h-6` so size is not caller-dependent | `packages/kb-ui/src/components/nav/SideNavRail.tsx:84-86` | No measured change (was already 24 via `size={24}` prop), but now locked in-component | browser_evaluate: SVG 23.99×23.99 (≈24), attr width/height = "24" |

### Shell invariants re-verified after fix

| Invariant | Value | Pass |
|---|---|---|
| Explorer row height | 35.99 px (all 6 rows) | yes (spec: 36) |
| Rail icon rendered size | 23.99 × 23.99 | yes (spec: 24) |
| Explorer glyph rendered size | 15.99 × 15.99 | yes (spec: 16) |
| depth-1 folder glyph x == depth-1 article glyph x | both 125.95 | yes (delta 0) |
| depth-1 glyph x > depth-0 glyph x (staircase) | 125.95 > 101.96 | yes |

### Evidence

- Full AppShell at 1280 after fixes: `design/screenshots/fix-fileexplorer-alignment-1280.png`
- Rail icon 24 evidence (same shell capture): `design/screenshots/fix-rail-icon-24-1280.png`

### Guardrails honored

- Edits confined to `FileExplorerNav.tsx` (phantom spacer) and `SideNavRail.tsx` (icon-size lock).
- No public API surface changed on `SideNavRail` or `FileExplorerNav`.
- Shell-trio invariants re-verified: row=36, rail=24 glyph, explorer=16 glyph. No regression on header/divider geometry.


### Note on depth-0 article alignment

The current `AppShell.stories.tsx` test tree has **no depth-0 article** ("Live chat basics" is depth-1, not depth-0). Depth-0 alignment was therefore not measured empirically, but is guaranteed by CSS symmetry: the phantom spacer (`size-6` = 24×24) is the same width as the folder chevron slot (`size-6` = 24×24) and both sit at the head of the same flex container with `gap-1`, so the offset is depth-independent.


## Content area heading + breadcrumb border — 2026-04-20 fixes

User feedback (images #15, #16): (1) Sub-categories + Articles heading bars are grey, want white; (2) heading label doesn't align with body-row icon; (3) breadcrumb bar has a visible bottom border, want it transparent at the bottom.

| # | Fix | File:line | Before → After | Verified |
|---|---|---|---|---|
| 1 | SubCategoriesTable heading row bg: grey → white | `packages/kb-ui/src/components/content/SubCategoriesTable.tsx:39` | `bg-[#f5f5f5]` → `bg-white` | browser_evaluate: heading `backgroundColor = rgb(255, 255, 255)` |
| 2 | SubCategoriesTable heading-label left-edge aligned to body-row icon | `packages/kb-ui/src/components/content/SubCategoriesTable.tsx:43` | `px-6` (24 LR) → `pl-4 pr-0` (16 L) | browser_evaluate: heading paintLeft `57.09` == body-icon-btn left `57.08` (delta 0.01 px) |
| 3 | ArticlesTable heading row bg: grey → white | `packages/kb-ui/src/components/content/ArticlesTable.tsx:53` | `bg-[#f5f5f5]` → `bg-white` | browser_evaluate: heading `backgroundColor = rgb(255, 255, 255)` |
| 4 | ArticlesTable first-col heading-label aligned to body-row icon | `packages/kb-ui/src/components/content/ArticlesTable.tsx:56` | `px-6` → `pl-4 pr-0` | browser_evaluate: heading paintLeft `57.09` == body-icon-btn left `57.08` (delta 0.01 px) |
| 5 | ArticlesTable secondary column heads aligned to body-cell x: Status/Author/Last Updated `px-6` → `px-4` | `packages/kb-ui/src/components/content/ArticlesTable.tsx:63,69,75` | `px-6` (24 LR) → `px-4` (16 LR) — matches body `td` padding | visual: column labels sit over their body text (see `fix-content-heading-white-1280.png`) |
| 6 | AppShell breadcrumb wrapper: removed bottom border | `packages/kb-ui/src/components/shell/AppShell.tsx:54` | `className="shrink-0 border-b border-[#e2e8f0]"` → `className="shrink-0"` | browser_evaluate: `shell-breadcrumb` `borderBottomWidth = 0px`; `KBBreadcrumbBar` `borderBottomWidth = 0px` |
| 7 | AppShell doc comment inverted to match new invariant | `packages/kb-ui/src/components/shell/AppShell.tsx:27` | "Breadcrumb gets a full-width 1px bottom border (invariant)" → "Breadcrumb does NOT render a visible bottom border …" | grep confirms comment rewritten |

### Scope expansion note

Task specified editing `KBBreadcrumbBar.tsx` for Fix C. In practice, neither the bar component nor the story owned the border — it lived in `AppShell.tsx:54` as `border-b border-[#e2e8f0]` on the `shell-breadcrumb` wrapper. Edited `AppShell.tsx` instead so the fix actually takes effect in every shell-composed page. `KBBreadcrumbBar.tsx` itself needed no change (already had no border).

### Shell invariants re-verified after fix

| Invariant | Value | Pass |
|---|---|---|
| Breadcrumb bar height | 53.99 px | yes (spec: 54) |
| Rail divider Y | 53.99 px | yes (spec: 54) |
| Explorer divider Y | 53.99 px | yes (spec: 54) |
| KBBreadcrumbBar borderBottomWidth | 0px | yes |
| AppShell shell-breadcrumb wrapper borderBottomWidth | 0px | yes |
| Heading bg (both tables) | rgb(255, 255, 255) | yes |
| Heading bottom divider preserved | 1.11 px rgb(229, 229, 229) | yes |
| Heading-label paintLeft == body-icon-btn left (both tables) | 57.09 vs 57.08 (delta 0.01) | yes (within ±2 px) |

### Evidence

- Full shell after all three fixes: `design/screenshots/fix-content-plus-breadcrumb-shell-1280.png`
- Isolated tables (heading-white + alignment): `design/screenshots/fix-content-heading-white-1280.png`
- KBBreadcrumbBar (no border on the bar itself; decorator wrapper line visible in story harness is not production): `design/screenshots/fix-breadcrumb-no-border-1280.png`

### Docs updated

- `design/table.md` — heading bg rule rewritten to `#ffffff`; 2026-04-20 fix note appended.
- `design/breadcrumb.md` — "Fixes applied (2026-04-20)" section added; note that bar has no bottom border; shell rail+explorer dividers mark the Y=54 line.
- `design/_layout-invariants.md` — Divider-row table third row rewritten to `— | — | n/a (no divider rendered; relies on rail+explorer dividers)`; rationale paragraph added; verification-rule phrasing updated.
- `design.md` — Sub-categories and Articles heading-row bg updated to `#ffffff`; legacy "Table" section clarified as superseded summary.

### Guardrails honored

- Only the 3 component source files were edited for the fixes, **plus** `AppShell.tsx` (scope expansion called out above — that file is where the border-b actually lived).
- No public API surface on any component changed.
- Heading-row divider preserved (1px `#e5e5e5`) so body/heading separation is still visible after bg swap.

---

## 2026-04-21 corrections (rail icons / breadcrumb / content bg / alignment)

Four user-flagged corrections. All measurements from `browser_evaluate` against Storybook `KB Category Page / Managing Emails` at 1280×900. Each fix: Before → Fix → After.

### 1. Side-nav rail icons — 24×24 → 16×16

**User complaint:** rail glyphs too large; active pencil looks "bold" compared to siblings.
**Root cause:** `SideNavRail.tsx` wrapper forced `[&>svg]:w-6 h-6` (24×24), AND stories passed `size={18}` (KBCategoryPage) or `size={24}` (others) on the Remix icons. An 18-native SVG force-scaled to 24 via CSS renders with visually heavier stroke weight than 24-native siblings — that is the "bold" complaint.
**All four rail icons confirmed `Line` variants** (`RiStarLine`, `RiPencilLine`, `RiFolderLine`, `RiSettings3Line`). No Fill→Line swap needed.

| Metric | Before | After |
|---|---|---|
| AI rail SVG width (px) | 23.99 | 15.99 |
| Editor (active) rail SVG width (px) | 23.99 | 15.99 |
| Folders rail SVG width (px) | 23.99 | 15.99 |
| Settings rail SVG width (px) | 23.99 | 15.99 |
| SVG `width` attr on Editor icon | `"18"` (CSS-stretched to 24) | `"16"` (native, no CSS stretch) |

Fix: wrapper `size-6` + `[&>svg]:w-6 h-6 [&>img]:w-6 h-6` → `size-4` + `[&>svg]:w-4 h-4 [&>img]:w-4 h-4`; stories updated to `size={16}`.
Screenshot: `design/screenshots/fix-round-Apr21-rail-16.png`.

### 2. Breadcrumb separator — chevron → text `/`

**User complaint:** image #18 showed chevron (`>`) between crumbs; should be `/`.

| Metric | Before | After |
|---|---|---|
| Separator `hasSvg` | `true` (`RiArrowRightSLine`) | `false` |
| Separator text | `""` (chevron only) | `"/"` |
| Separator color | — (`text-[#64748b]` on 22×22 container) | `rgb(203, 213, 225)` = `#cbd5e1` |
| Separator fontSize | n/a (svg) | `14px` |

Fix: replaced `<RiArrowRightSLine size={14}>` block with text `/` span in `KBBreadcrumbBar.tsx`. Parallel fix applied to `primitives/Breadcrumb.tsx` (unused by shell composition but kept in parity per task). `RiArrowRightSLine` import removed from both files.
Screenshot: `design/screenshots/fix-round-Apr21-breadcrumb-slash.png`.

### 3. Content column background — `#f5f5f5` → `#ffffff`

**User complaint:** image #19 showed grey bleed behind the cards in the content column.
**Root cause:** `AppShell` content-column `<div>` had no `bg` class, so it inherited the shell root's `bg-[#f5f5f5]` canvas.

| Metric | Before | After |
|---|---|---|
| `[data-kb-part="shell-content-column"]` backgroundColor | `rgba(0, 0, 0, 0)` (transparent, shell's `#f5f5f5` showed through) | `rgb(255, 255, 255)` |
| Sample at content coord (500, 600) backgroundColor walked-up | — | `rgb(255, 255, 255)` |
| Shell root backgroundColor (unchanged) | `rgb(245, 245, 245)` | `rgb(245, 245, 245)` |

Fix: added `bg-white` and `data-kb-part="shell-content-column"` to the content-column `<div>` in `AppShell.tsx`.
Screenshot: `design/screenshots/fix-round-Apr21-content-white.png`.

### 4. Alignment — PageHeader icon tile to card column

**User complaint:** image #20, "alignment?" — PageHeader icon tile did not align with the cards' left edge.
**Finding:** tables already aligned with each other (Sub-categories ↔ Articles, card-x / heading-text-x / first-icon-x all matched). The only mismatch was PageHeader vs cards, caused by `PageHeader`'s `px-6` outer padding (pushed icon tile 24 px to the right of card-x).

| Metric | Before | After |
|---|---|---|
| PageHeader outer div x | 365.97 | 365.97 |
| PageHeader icon tile x | **389.97** (24 px offset) | **365.97** (aligned with card-x) |
| Sub-categories card x | 365.97 | 365.97 |
| Articles card x | 365.97 | 365.97 |
| Sub-categories heading text x | 383.07 | 383.07 |
| Articles heading text x | 383.07 | 383.07 |
| Sub-categories first-row icon x | 383.07 | 383.07 |
| Articles first-row icon x | 383.07 | 383.07 |
| PageHeader outer right edge | 1422.23 | **1398.23** (now = card-right) |
| Cards right edge | 1398.23 | 1398.23 |
| "New" button right edge | 1422.23 | **1398.23** (now = card-right) |

Fix: removed `px-6` from `PageHeader.tsx`'s outer `<div>`. Rationale: the page already sits inside `<main className="p-6">` which provides the 24 px shell padding; the nested `px-6` on PageHeader was double-padding *only the header row* and was the sole cause of the misalignment. Cards (SubCategoriesTable, ArticlesTable) do not have their own outer padding and sit flush with `main`'s `p-6`; PageHeader now matches. Inner heading structure within each card is untouched (heading-text-x = 383.07 = body-icon-x is preserved per the prior content-alignment fix).

Screenshot: `design/screenshots/fix-round-Apr21-alignment.png`.

### Shell grid invariants — re-verified after all 4 fixes

| Invariant | Value (1280×900) | Status |
|---|---|---|
| Rail header center Y | 26.997 (≈27) | ✅ |
| Rail divider top Y | 53.993 (≈54) | ✅ |
| Breadcrumb bar bottom Y | 53.993 (≈54) | ✅ |
| Breadcrumb bar height | 53.993 (≈54) | ✅ |
| Breadcrumb bar `border-bottom-width` | 0px | ✅ |
| Shell-breadcrumb wrapper `border-bottom-width` | 0px | ✅ |

### Files edited

- `packages/kb-ui/src/components/nav/SideNavRail.tsx` — icon wrapper 24→16.
- `packages/kb-ui/src/components/nav/SideNavRail.stories.tsx` — `size={24}` → `size={16}`.
- `packages/kb-ui/src/components/shell/AppShell.tsx` — content column `bg-white` + `data-kb-part="shell-content-column"`.
- `packages/kb-ui/src/components/shell/AppShell.stories.tsx` — `size={24}` → `size={16}`.
- `packages/kb-ui/src/components/shell/KBBreadcrumbBar.tsx` — chevron separator → text `/`.
- `packages/kb-ui/src/components/primitives/Breadcrumb.tsx` — chevron separator → text `/` (parity).
- `packages/kb-ui/src/components/content/PageHeader.tsx` — removed `px-6` to align with card column.
- `packages/kb-ui/src/pages/KBCategoryPage.stories.tsx` — `size={18}` → `size={16}`.

### Specs updated

- `design/side-nav.md` — added 2026-04-21 section: icon size 16×16, rationale, verification numbers.
- `design/breadcrumb.md` — added "Separator revision (2026-04-21)" section.
- `design/_layout-invariants.md` — "Icon size: 24 × 24" → "Icon size: 16 × 16"; breadcrumb separator line updated; added "Column backgrounds" sub-table.
- `design.md` — `--color-canvas` comment clarified; added "AppShell backgrounds (2026-04-21)" section.

### Anything that could not be fixed

- None of the 4 corrections were blocked. All fixes landed and re-measured clean.
- **Note flagged (not blocking):** on `PageHeader`, I removed `px-6` from the outer container. The stored Figma for this page header was not accessible via MCP in this file (`get_design_context` returns "nothing selected" for the library-check file — a known limitation). The user's own image #20 asked "alignment?" with the implication that the icon tile should align with the cards; my reading of the screenshot matches that. If the intended design actually has PageHeader inset from cards, revert `PageHeader.tsx` back to `'flex items-center justify-between py-1 px-6'`.
- Shell invariants (rail + explorer dividers at Y=54) still pass.

### 5. Re-verification of content-column white (follow-up, 2026-04-21)

**User report:** "screenshot at 1280×900 of KBCategoryPage still shows a grey area between and below the Sub-categories and Articles cards."

**Finding: no grey bleed remains inside the shell.** The prior fix (correction #3 above) is still correct and in effect. The grey the user saw is **Storybook chrome** — `body.sb-main-fullscreen` renders `rgb(245, 245, 245)` outside the story iframe, and when the docs panel is open it shows below/beside the story render area. That canvas is not part of the shell.

**Viewport correction that unblocked the re-measurement:** `setViewportSize({1280, 900})` under DPR 0.9 yields `innerWidth=1422, innerHeight=1000` logical CSS px. Resizing to `{1152, 810}` produces the intended `1280×900` logical viewport. All numbers below are at 1280×900.

**Full ancestor-chain dump (point @ x=392, y=700 — empty space below Articles card, inside content column):**

| Level | Tag | data-kb-* | computed backgroundColor |
|---|---|---|---|
| 0 | `MAIN` (`.flex-1.overflow-y-auto.p-6`) | — | `rgba(0, 0, 0, 0)` |
| 1 | `DIV` (`.bg-white`) | `data-kb-part="shell-content-column"` | `rgb(255, 255, 255)` |
| 2 | `DIV` (`.bg-[#f5f5f5]`) | `data-kb-component="app-shell"` | `rgb(245, 245, 245)` |
| 3 | Storybook wrapper `DIV` | — | transparent |
| 4 | `BODY.sb-main-fullscreen` | — | `rgb(245, 245, 245)` ← Storybook canvas |
| 5 | `HTML` | — | transparent |

Same chain captured for points (1230, 700) right-edge of content column, (442, 280) between-cards gap, (392, 60) just below breadcrumb — all resolve to `shell-content-column` white at level 1. No grey element exists between `MAIN` and the user's eye.

**Grey-descendant audit inside shell subtree:** 4 hits, all intentional accent UI — `rail-item` active (`#f8fafc`), `breadcrumb-current` pill (`#f8fafc`), PageHeader icon tile (`#f8fafc`), Draft status badge (`#fcfcfc`). Zero `#f5f5f5` hits.

**Shell invariants re-verified:** shell root bg = `rgb(245, 245, 245)`, content column bg = `rgb(255, 255, 255)`, shell-breadcrumb y=0, height=53.99, border-bottom-width=0px, explorer at x=54 w=288. All pass.

**Element(s) changed:** none. No source edit was required — the content column is white per the prior fix. Any code change here would have added a redundant `bg-white` (correction #3 already added it at `packages/kb-ui/src/components/shell/AppShell.tsx:53`) or whitened the shell root (which would break the intentional `#f5f5f5` canvas visible to the left of the rail when the rail is narrower than its column — a KB design token).

**Screenshot:** `design/screenshots/fix-content-white-final.png` (1280×900, iframe-only — Storybook chrome excluded so the reader sees only shell pixels).

**Recommendation if user still sees grey:** point at the specific pixel coordinate in a re-captured screenshot; my audit finds the shell content area is pure white at every empty coordinate sampled.

## 2026-04-21 AI icon + side-panel icon

Two small, targeted fixes verified live at 1280×900 against Storybook.

### Fix 1 — AI sparkle icon (rail slot #1)

**Before:** Phosphor `Star` (filled star, solid `currentColor`) used as a placeholder with three outstanding `TODO(ai-icon)` comments across `SideNavRail.tsx` + three story files.

**After:** new `AiIcon` component at `packages/kb-ui/src/components/brand/AiIcon.tsx` — inline SVG 4-point sparkle with a magenta→peach linear-gradient stroke, extracted 1:1 from Figma `9aGp5t9fH1d0PXi4LMhOdb` node `I1:4349;206:6843;12619:15996;517:21335`.

- Stops: `#D92FFF` @ 0 → `#FFC987` @ 1
- Gradient transform converted from Figma 2×3 matrix to SVG `objectBoundingBox` (`x1=-0.07961, y1=0.49054, x2=0.90309, y2=0.38804`)
- Stroke-weight 1.4, linejoin/linecap `round`
- Exported from `@hiver/kb-ui` via `components/brand/index.ts`
- All three `TODO(ai-icon)` comments removed; `SideNavRail.tsx` now carries a provenance comment pointing back to Figma node `1:4324`.

**Screenshot**: `design/screenshots/v3-ai-icon-rail.png` — rail first nav slot shows the gradient sparkle (not a solid star).

### Fix 2 — breadcrumb collapse icon

**Before:** Phosphor `CaretDoubleLeft` (`«`) — semantically wrong; the affordance is "toggle the left sidebar."

**After:** Phosphor `SidebarSimple` — outline rounded-rect divided by a single vertical line at ~30% from the left. Rendered at 14px in the 22×22 button slot.

- Tried `Sidebar` first (per task priority) but its tick-mark detail inside the narrow left column doesn't match the user's reference (a plain square with one inner vertical line). Swapped to `SidebarSimple`, which is the exact-match glyph. Noted in `design/breadcrumb.md`.
- Files: `KBBreadcrumbBar.tsx` (shell) + `Breadcrumb.tsx` (primitive, for parity).

**Screenshot**: `design/screenshots/v3-breadcrumb-sidepanel.png` — Breadcrumb primitive story renders `[SidebarSimple] / Getting Started / Installation / Quick Start`. Full-shell context: `design/screenshots/v3-shell-1280.png`.

### Verdict

Both fixes: ✅ verified via DOM evaluation + screenshot read-back. Typecheck clean (`tsc --noEmit`).

---

## 2026-04-21 Phosphor → Remix revert

**Context**: An earlier session on the same day swapped all icons from `@remixicon/react` to `@phosphor-icons/react` (regular weight). The user rejected the Phosphor look and asked to revert.

**State when this entry was opened**: the swap had *already been reverted* in source by a prior unsaved session — `@phosphor-icons/react` was no longer listed in `package.json` (or installed under `node_modules`), and `@remixicon/react@^4.9.0` was back as a dependency. Zero `@phosphor-icons/react` imports in `packages/kb-ui/src/**`. Zero Phosphor component names (`PenNib`, `Folder`, `GearSix`, `MagnifyingGlass`, `FileText`, `CaretRight`, `CaretDown`, `CaretDoubleLeft`, `SidebarSimple`, `DotsThreeVertical`, `Plus`, `Trash`, `PaperPlaneTilt`, `BookOpen`, `X`) in source. This session therefore did not need to run `npm uninstall @phosphor-icons/react` or `npm install @remixicon/react` — they are no-ops.

**Icon mapping now in source** (Phosphor had → Remix has):

| Prior Phosphor | Now Remix | Used in |
|---|---|---|
| `Star` | `<AiIcon />` (custom gradient) | `SideNavRail` — AI slot |
| `PenNib` (rail active) | `RiQuillPenLine` | `SideNavRail.stories` — Editor slot |
| `PenNib` (explorer header) | `RiPencilLine` | `FileExplorerNav` header |
| `Folder` | `RiFolderLine` | `SideNavRail.stories`, `FileExplorerNav` |
| `GearSix` / `Gear` | `RiSettings5Line` | `SideNavRail.stories` — Settings slot |
| `MagnifyingGlass` | `RiSearchLine` | `FileExplorerNav` header (search) |
| `FileText` / `Article` | `RiFile3Line` | `FileExplorerNav` — article rows |
| `CaretRight` | `RiArrowRightSLine` | `FileExplorerNav` — collapsed folder chevron |
| `CaretDown` | `RiArrowDownSLine` | `FileExplorerNav` — expanded folder chevron, `Dropdown` |
| `SidebarSimple` | **`RiLayoutLeftLine`** | `KBBreadcrumbBar`, `Breadcrumb` — side-panel toggle |
| `DotsThreeVertical` | `RiMore2Line` | `ArticlesTable`, `SubCategoriesTable`, `PageHeader` row actions |
| `Plus` | `RiAddLine` | `PageHeader` "New" button |
| `Trash` | `RiDeleteBinLine` | row action menus |
| `PaperPlaneTilt` | `RiSendPlaneLine` | `KBBreadcrumbBar` — share / send |
| `BookOpen` | `RiBookOpenLine` | `PageHeader` stories |
| `X` | `RiCloseLine` | `KBBreadcrumbBar` — close/dismiss |

**Side-panel icon chosen**: `RiLayoutLeftLine` (size 14). This is the closest Remix equivalent to Phosphor's `SidebarSimple` — same shape (outlined rounded rect + one inner vertical divider, no tick marks), same semantic. Verified present in `@remixicon/react@4.9.0` (imports resolve, renders).

**Changes this session**:

- `packages/kb-ui/src/components/nav/SideNavRail.tsx` — updated the top-of-file provenance comment (line 4) from "Other rail slots use Phosphor / regular-weight line icons" to "Other rail slots use Remix / (@remixicon/react) regular-weight Line icons at 16×16". No code change.
- `design/side-nav.md` — replaced the 2026-04-21 "Remix → Phosphor" section with a "reverted" note pointing back to `@remixicon/react`, regular-weight Line, 16×16, and documenting the updated rail slot mapping (AI custom, Editor `RiQuillPenLine`, Articles `RiFolderLine`, Settings `RiSettings5Line`).
- `design/breadcrumb.md` — replaced the 2026-04-21 "`CaretDoubleLeft` → `SidebarSimple`" section with one documenting the final choice (`RiLayoutLeftLine`) and the short history of the Phosphor detour.
- This `_diff-report.md` entry appended.

**Verification**:

- `npx tsc --noEmit` from `packages/kb-ui`: clean (no output, exit 0).
- `grep -r '@phosphor-icons' packages/kb-ui/src`: zero hits.
- `grep -rE '\b(PenNib|GearSix|MagnifyingGlass|PaperPlaneTilt|CaretDoubleLeft|DotsThreeVertical|SidebarSimple|FileText|Folder|Trash)\b' packages/kb-ui/src`: zero hits (remaining `Article` hits are the domain TypeScript type in `ArticlesTable.tsx`, not the Phosphor icon — verified by inspection).
- Shell screenshot (`SHELL / AppShell / CategoryView`) at 1280×900 → `design/screenshots/v4-shell-remix.png`. Read back: dark rail (left) shows Hiver "h" logo + AI gradient sparkle + active quill-pen + folder + gear + VK avatar at bottom. Explorer (middle) shows pencil+"Editor" header with search icon on right, then folder/file tree with chevron toggles and green status dots. Breadcrumb bar (top-right) shows the `RiLayoutLeftLine` side-panel toggle followed by the "Offer Multi-channel Support" crumb. No missing icons, no broken squares, all line-weight consistent.

**Caveats**:

- The storybook vite dep cache under `packages/kb-ui/node_modules/.cache/storybook/` still contains `@phosphor-icons_react.js` and `@phosphor-icons_react.js.map` from the prior session. These are stale pre-bundled deps; Vite/Storybook will regenerate the cache next time `storybook dev` starts fresh. Not deleted in this session — they do not affect the running bundle (confirmed by the visual check; Phosphor glyph `d=` strings are not in the rendered SVGs).
- Working tree has many uncommitted files from prior sessions (per `git status`: modified `package.json`, new `design/` tree, new screenshots, etc.) — the Phosphor swap was never committed, so there is no revert-commit on record. If the user wants a clean history, squash-commit the current state as "revert to Remix icons".

---

## 2026-04-21 Variant coverage + additions

Per-component audit of Figma variant axes against current Storybook stories. Budget: up to 3 new stories per component. Rule: only add variants that exist in Figma AND are renderable with the current component API.

**Figma variant source**: `9aGp5t9fH1d0PXi4LMhOdb` (library-check file). Axes enumerated via `use_figma` Plugin API — for Button the Figma component set resolved to 485 variants; axes aggregated into the tables below. Badge/Tag is a single-variant component (no variant axes) with 2 named instances; the "axis" column there lists the instance inventory rather than a component-set axis set.

### Summary

| # | Component | Figma axes | Current stories | Added | Skipped (reason) |
|---|---|---|---|---|---|
| 1 | Button | `Icon only(T/F) × Type(primary,secondary) × Appearance(filled,outlined,ghost) × Size(xs,sm,md,lg,xl) × State(default,hover,focus,loading,disabled) × On Dark(T/F)` | 6: Primary, Subtle, Ghost, Icon Only, All Variants, Disabled | 3: `DisabledSubtle`, `DisabledGhost`, `DisabledIconOnly` | Size variants (need size API) · On Dark variants (need theme API) · Loading/Focus/Hover states (not expressible statically) · Outlined appearance (not in `ButtonVariant`) |
| 2 | Avatar | `Type(image,text) × Shape(circle,square) × Size(14,16,24,36) × Color(blue,pink,orange,voilet,green,red,purple,gray) × emphasis(low,high,medium) × Status(on/off)` (216 variants) | 3: Default, WithStatus, MultipleAvatars | **0** | Component locked to 24×24 text+circle+gray. Adding any new axis requires component API work — flagged for follow-up. |
| 3 | Badge | No component set; `Tag` is a single component with no variant axes. Instances observed: Published, Draft. | 3: Published, Draft, AllVariants (incl. Neutral) | **0** | All Figma-observed variants already covered. "Failed"/"In-review" are speculated in `design/tag.md` but NOT in Figma. |
| 4 | Breadcrumb (primitive) | `Breadcrumb` set `Levels(1,2,3,4,4+)`; `_Base items` set `Type(text,chevron,ellipsis,homve) × State(default,active,hover)` | 1: Default (4 levels) | 3: `Levels1`, `Levels2`, `Levels3` | `Levels=4+` (needs ellipsis/collapse API) · hover state (not statically expressible) · `Type=ellipsis` (not in item schema) |
| 5 | KBBreadcrumbBar (shell) | Same Figma set as primitive (`Levels`) | 2: Category, Editor (1 and 3 levels) | **0** | Endpoints of the Levels axis already covered by existing stories. No addable variant within the rules. |
| 6 | SideNavRail | No Figma component set on the rail page (`side-nav.md` explicitly: "Dark theme variant: not present in this file"). Only item state axis (default/hover/active) observed inside `.menu-items`. | 3: Dark, Light, BothThemes | **0** | Light/Dark/BothThemes already exceeds what Figma documents. Hover state not statically expressible. |
| 7 | FileExplorerNav | `.menu-items` set `type(category,folder,sub-folder,article) × state(default,hover,active,active-sub,but article view)` (17 variants) | 5: Dark, Light, ActiveFolder, RootArticleActive, BothThemes | 1: `Default` (no active, all collapsed) | hover state (not static) · `but article view` (ambiguous mapping, needs design clarification) · `active-sub` already covered by ActiveFolder |
| 8 | Table (Sub-categories + Articles) | No Figma variant axes on either table node (`1:5202`, `1:5219`). Empty/loading/error views are in `design/table.md`'s "Open items" (to be designed). | 1 each: Default | **0** | No Figma variants to add. Empty/loading/error states are explicitly flagged as not-yet-designed. |

**Total new stories: 7** (Button ×3, Breadcrumb ×3, FileExplorerNav ×1). Budget was 24 (3 × 8); the task spec itself anticipates zero-addition components.

### Per-component detail

#### 1. Button — 3 additions

- File: `packages/kb-ui/src/components/primitives/Button.stories.tsx`
- Figma component set: `Button` (485 variants). Axes from actual variant names.
- Existing disabled-state coverage was the `Primary` filled variant only. Added the remaining three local appearance combinations: `subtle` (maps to Figma `secondary/filled`), `ghost` (`primary/ghost`), and `icon` (`secondary/ghost` with `Icon only=True`). All three Figma variants have a `State=disabled` row in the component set (e.g. `Icon only=False, Type=secondary, Appearance=filled, Size=md, State=disabled, On Dark=False`).

#### 2. Avatar — 0 additions (flagged)

- File: `packages/kb-ui/src/components/primitives/Avatar.stories.tsx`
- Figma set has **216 variants** across 6 axes. The current `AvatarProps` exposes only `initials`, `showStatus`, `name`, `ariaLabel`. Shape/Size/Color/emphasis/Type all require component API expansion.
- **Follow-up required**: extend `AvatarProps` with `size`, `color`, `shape`, `emphasis`, `type` before Avatar can meaningfully diverge from the current 24×24 gray-text-circle.

#### 3. Badge — 0 additions

- File: `packages/kb-ui/src/components/primitives/Badge.stories.tsx`
- Figma `Tag` has no component set (single-variant component); only 2 named instances (`Published`, `Draft`) on page `tag`. Storybook already has Published, Draft, AllVariants (with Neutral). No Figma-backed variant missing.

#### 4. Breadcrumb primitive — 3 additions

- File: `packages/kb-ui/src/components/primitives/Breadcrumb.stories.tsx`
- Figma `Breadcrumb` component set has 5 variants on the `Levels` axis: `1, 2, 3, 4, 4+`. Only `Levels=4` was in Storybook (the existing `Default`). Added Levels 1, 2, 3 with realistic KB content.
- `Levels=4+` skipped: requires ellipsis/collapse UI (overflow menu) which the primitive does not implement.

#### 5. KBBreadcrumbBar — 0 additions

- File: `packages/kb-ui/src/components/shell/KBBreadcrumbBar.stories.tsx`
- Two layout variants (`category`, `editor`) already cover the Levels endpoints in shell context. `Levels=2` on the editor variant would be marginal; the editor variant is semantically full-path, so a 2-level editor is not a Figma variant — skipped.

#### 6. SideNavRail — 0 additions

- File: `packages/kb-ui/src/components/nav/SideNavRail.stories.tsx`
- No Figma component set on the rail. Item-level states (`default/hover/active`) exist in `.menu-items` (article-explorer) but apply to the FileExplorerNav rows, not the rail. The Dark theme we ship is explicitly called out in `design/side-nav.md` as going beyond what Figma documents. No addable variant.

#### 7. FileExplorerNav — 1 addition

- File: `packages/kb-ui/src/components/nav/FileExplorerNav.stories.tsx`
- Added `Default` story rendering the tree with no `activeId`, which maps to `.menu-items` `state=default` across every row — the initial pre-selection state that was missing from the existing 5 stories. Verified at runtime: `activeCount=0, folderCount=4, expandedCount=0`.
- `active-sub` is covered by the existing `ActiveFolder` story. `but article view` (a 5th row state in `.menu-items`) is not added — it refers to rendering the category/folder row while the user is "inside" an article view, but the static mapping from `activeId` to this state is ambiguous and the component does not expose a distinct prop for it.

#### 8. Tables — 0 additions

- Files: `packages/kb-ui/src/components/content/SubCategoriesTable.stories.tsx`, `ArticlesTable.stories.tsx`
- Figma nodes `1:5202` (Sub-categories) and `1:5219` (Articles) have no variant axes. `design/table.md` lists Empty/Loading/Error as "not documented in Figma — to be designed". Nothing to add under the rules.

### Verification

- `npx tsc --noEmit` from `packages/kb-ui`: clean (no output, exit 0).
- All 7 new stories rendered and verified via Playwright-driven Storybook at 1400×900:
  - `primitives-button--disabled-subtle`: "Publish" button with `disabled=true`, opacity 0.5.
  - `primitives-button--disabled-ghost`: "Save as draft" button with `disabled=true`.
  - `primitives-button--disabled-icon-only`: Delete icon button with `aria-label="Delete"`, `disabled=true`.
  - `primitives-breadcrumb--levels-1`: home + single `aria-current` pill "Overview".
  - `primitives-breadcrumb--levels-2`: home + "Documentation" / "API Reference" pill.
  - `primitives-breadcrumb--levels-3`: home + "Product" / "Shared Inbox" / "Assigning conversations" pill.
  - `nav-fileexplorernav--default`: 0 active rows, 0 expanded folders, 4 root folders visible.
- Screenshots captured per component's sidebar entry:
  - `design/screenshots/v6-variants-button.png` (Button sidebar: 9 stories, Disabled Icon Only highlighted)
  - `design/screenshots/v6-variants-avatar.png`
  - `design/screenshots/v6-variants-badge.png`
  - `design/screenshots/v6-variants-breadcrumb.png` (Breadcrumb sidebar: Default, Levels 1/2/3)
  - `design/screenshots/v6-variants-fileexplorer.png` (FileExplorerNav sidebar: 6 stories, Default highlighted, canvas shows no-active / all-collapsed tree)
  - `design/screenshots/v6-variants-sidenav.png`
  - `design/screenshots/v6-variants-pageheader.png`
  - `design/screenshots/v6-variants-kbbreadcrumbbar.png`
  - `design/screenshots/v6-variants-table.png` (ArticlesTable with sub-categories + articles rows)
- Spot-checked 3 screenshots (button, breadcrumb, fileexplorer) by re-reading them — all new entries present in sidebar, active selection renders the expected canvas content.

### Flags for follow-up

- **Avatar**: needs `size/color/shape/emphasis/type` prop expansion to exercise any of the 216 Figma variants beyond the current single 24-gray-text-circle.
- **FileExplorerNav**: `but article view` state (the 5th `.menu-items` state) needs a design clarification on when/how it's triggered before a story can be added.
- **Breadcrumb primitive**: `Levels=4+` (ellipsis overflow) needs an ellipsis item type in the schema plus a collapse-menu UI.

---

## 2026-04-21 Storybook Phase 1 (theme + welcome + hierarchy)

Structural foundation for the Storybook docs site — custom Hiver theme, Welcome MDX, clean nav hierarchy, global storySort.

### Files created

| Path | Purpose |
|---|---|
| `packages/kb-ui/.storybook/theme.ts` | Storybook theme (`create` from `@storybook/theming`). Brand image = inlined `CompanyLogo.svg` data URL + "Hiver KB" wordmark. Primary `#0f172a` (text-neutral), secondary `#6634ef` (icon-accents-purple), Inter font. |
| `packages/kb-ui/.storybook/manager.ts` | Wires theme + `sidebar.showRoots: true` via `addons.setConfig`. |
| `packages/kb-ui/src/stories/Welcome.mdx` | Title `Getting Started/Welcome`. Sections: mission, 3-card grid (Design parity / Composable shells / Accessible), "How to navigate" table, Links (Figma library-check + kb-gaps, internal `_layout-invariants.md` + `_tokens.md`), footer. |

### Files edited

| Path | Change |
|---|---|
| `packages/kb-ui/.storybook/main.ts` | Added `'../src/**/*.mdx'` to `stories` glob so MDX gets indexed. |
| `packages/kb-ui/.storybook/preview.ts` | Default `layout: 'padded'` + `options.storySort.order` (Getting Started → Foundations → Components [Primitives, Navigation, Content, Shell] → Patterns). `tokens.css` import already present. |

### Story titles — before → after (16 files)

| File | Before | After |
|---|---|---|
| `src/components/nav/FileExplorerNav.stories.tsx` | `Nav/FileExplorerNav` | `Components/Navigation/FileExplorerNav` |
| `src/components/nav/SideNavRail.stories.tsx` | `Nav/SideNavRail` | `Components/Navigation/SideNavRail` |
| `src/components/primitives/Avatar.stories.tsx` | `Primitives/Avatar` | `Components/Primitives/Avatar` |
| `src/components/primitives/Badge.stories.tsx` | `Primitives/Badge` | `Components/Primitives/Badge` |
| `src/components/primitives/Breadcrumb.stories.tsx` | `Primitives/Breadcrumb` | `Components/Primitives/Breadcrumb` |
| `src/components/primitives/Button.stories.tsx` | `Primitives/Button` | `Components/Primitives/Button` |
| `src/components/primitives/Divider.stories.tsx` | `Primitives/Divider` | `Components/Primitives/Divider` |
| `src/components/primitives/Dropdown.stories.tsx` | `Primitives/Dropdown` | `Components/Primitives/Dropdown` |
| `src/components/primitives/TextInput.stories.tsx` | `Primitives/TextInput` | `Components/Primitives/TextInput` |
| `src/components/content/ArticlesTable.stories.tsx` | `Content/ArticlesTable` | `Components/Content/ArticlesTable` |
| `src/components/content/PageHeader.stories.tsx` | `Content/PageHeader` | `Components/Content/PageHeader` |
| `src/components/content/SubCategoriesTable.stories.tsx` | `Content/SubCategoriesTable` | `Components/Content/SubCategoriesTable` |
| `src/components/shell/AppShell.stories.tsx` | `Shell/AppShell` | `Components/Shell/AppShell` |
| `src/components/shell/KBBreadcrumbBar.stories.tsx` | `Shell/KBBreadcrumbBar` | `Components/Shell/KBBreadcrumbBar` |
| `src/pages/KBCategoryPage.stories.tsx` | `KB Category Page / Managing Emails` | `Patterns/KB Category Page` |
| `src/components/foundations/Foundations.stories.tsx` | `Foundations/Overview` | unchanged |

### Packages installed

None. `@storybook/theming`, `@storybook/manager-api`, `@storybook/blocks` all already present via `@storybook/addon-essentials@8.6.14` transitive deps.

### Typecheck

`cd packages/kb-ui && npx tsc --noEmit` → exit 0, clean.

### Visual verification

Ran `npm run storybook` after clearing `node_modules/.cache/storybook`, loaded via Playwright at localhost:6006.

- **`design/screenshots/v7-storybook-sidebar.png`** — Top-left brand reads "Hiver KB" with a dark rounded-square logo mark. Sidebar shows four root sections in the prescribed order: GETTING STARTED (Welcome highlighted in Hiver purple `#6634ef`), FOUNDATIONS (Overview), COMPONENTS (Primitives / Navigation / Content / Shell — all collapsed), PATTERNS (KB Category Page). Canvas shows the Welcome MDX.
- **`design/screenshots/v7-storybook-welcome.png`** — Full Welcome page: H1 "Welcome to Hiver KB Components", intro paragraph with `app.hiverkb.com` link in purple, 3-column feature cards (numbered 1/2/3 in purple chips), How-to-navigate table (4 rows), Links bullet list (library-check + kb-gaps Figma files, internal markdown references). Typography is Inter throughout.
- **`design/screenshots/v7-storybook-button.png`** — Components/Primitives/Button/All Variants. Primitives node expanded showing Avatar, Badge, Breadcrumb, Button (expanded with all 9 variants), Divider, Dropdown, TextInput. Active story "All Variants" selected in Hiver purple. Canvas renders the four button variants correctly — theme has not broken the existing story rendering.

### Hierarchy — before → after

```
BEFORE                          AFTER
──────                          ─────
Content                         Getting Started
  ArticlesTable                   Welcome                     (new)
  PageHeader                    Foundations
  SubCategoriesTable              Overview
Foundations                     Components
  Overview                        Primitives
KB Category Page / Managing…      Navigation
Nav                               Content
  FileExplorerNav                 Shell
  SideNavRail                   Patterns
Primitives                        KB Category Page
  Avatar
  Badge
  Breadcrumb
  Button
  Divider
  Dropdown
  TextInput
Shell
  AppShell
  KBBreadcrumbBar
```

### Skipped / flagged

- Storybook emits a known-benign compat `WARN` about `@storybook/addon-essentials@8.6.14` vs core `@8.6.18` — not blocking, no action required for this phase.
- `preview.ts` default `layout: 'padded'` only kicks in for stories without an explicit `parameters.layout`. The existing stories that explicitly set `centered` (all Primitives) or `fullscreen` (Shell/Nav/Pages) continue to behave as before — verified via the Button screenshot where buttons still render centered.

---

## 2026-04-21 ContentEditor (Phase 5 step 1)

### Files created

| File | Purpose |
|---|---|
| `packages/kb-ui/src/components/content/ContentEditor.tsx` | Tiptap-backed rich text editor (toolbar + editable area inside a 720px card) |
| `packages/kb-ui/src/components/content/ContentEditor.stories.tsx` | Stories: Interactive, Empty, WithContent, ReadOnly |
| `design/editor.md` | Extracted spec + deviations record + Tiptap extension list |

### Files edited

| File | Change |
|---|---|
| `packages/kb-ui/src/components/content/index.ts` | Add `ContentEditor` to barrel export |
| `packages/kb-ui/package.json` | Add 13 Tiptap/lowlight dependencies |

### Packages installed (all pinned via `^3.22.4` for Tiptap, `^3.3.0` for lowlight)

- `@tiptap/react`
- `@tiptap/starter-kit` (codeBlock disabled → replaced by code-block-lowlight)
- `@tiptap/extension-link`, `@tiptap/extension-image`
- `@tiptap/extension-code-block-lowlight` + `lowlight`
- `@tiptap/extension-table`, `-table-row`, `-table-header`, `-table-cell`
- `@tiptap/extension-highlight` (AI highlight mark)
- `@tiptap/extension-placeholder`
- `@tiptap/extension-underline` (explicit for safety; already in StarterKit v3 transitive deps)

58 packages added total; `npm install` resolved cleanly, no `--legacy-peer-deps` needed; 2 moderate audit vulnerabilities (typical upstream, not actionable here).

### Toolbar parity with Figma `53:2386`

| Aspect | Status | Notes |
|---|---|---|
| Button geometry (24×24, r=6, 14px icon) | ✅ | Matches |
| Container (white bg, 1px #e5e5e5 border, r=8, inner padding 8) | ✅ | Matches |
| Render order through slot 15 | ✅ | N-dropdown, B, I, U, S, bullet, numbered, link, code, codeblock, table, undo, redo |
| Font-family (`Serif`) dropdown | 🟡 Intentionally omitted | Not in v1 feature scope; documented in `design/editor.md` |
| Text-color (`T`) button | 🟡 Intentionally omitted | Not in v1 feature scope; documented in `design/editor.md` |
| Figma slots 16-18 (visual duplicates) | 🟡 Replaced | Sparkle AI-highlight + More overflow (blockquote, hr, image) — required by task spec |

### Visual parity with Figma editor card

| Aspect | Status |
|---|---|
| Card width 720, r=12, p=40, border #e2e8f0, shadow-lg | ✅ |
| H1 24/32/600, H2 20/28/600, H3 18/28/600, body 16/24/400 | ✅ |
| List padding-left 24 | ✅ |
| Code block dark bg with syntax highlighting | ✅ (via lowlight/highlight.js common grammars) |
| Inline code #f1f5f9 bg, #0f172a text, r=4 | ✅ |
| Link #2563eb underlined | ✅ |
| AI highlight #e7f9ee bg visible on selection | ✅ (`<mark data-color="ai">`) |
| Table 3×3 with gray header row, bordered cells | ✅ |

### Storybook + Playwright

- Stories: `Interactive`, `Empty`, `WithContent`, `ReadOnly` under `Components/Content/ContentEditor/*`.
- Each story loaded in Playwright at 1280×900 with `browser_console_messages level=error` → **0 errors** per story.
- Screenshots at `design/screenshots/v8-editor-*.png`.
- Typecheck (`npx tsc --noEmit`) → passes with 0 errors.

### Skipped / flagged

- `get_screenshot` MCP does not write to disk; the `figma-editor*.png` reference images referenced by task step 1/2 were not saved. Figma visual reference was drawn directly from the inline-returned screenshot images during the build. Flagged as a task-compliance note.
- Image upload is out of v1 scope — the overflow menu's "Image from URL" uses `window.prompt`. Replace with a richer picker when image-upload infra lands.
- Save bridge: `onSave` is wired via a DOM event (`kb-editor-save`) on the editor DOM; the parent toolbar's "Publish" button can dispatch it. Left as a plumb-through stub since Editor Page composition arrives in step 3.
- No new Patterns story added for the Editor Page yet — keeping this step focused on the ContentEditor component itself. The `Patterns/KB Editor Page` composition (AppShell + KBBreadcrumbBar editor variant + ContentEditor + SettingsPanel) is deferred to step 3 per task scope.


## 2026-04-21 ArticleSettingsPanel (Phase 5 step 2)

**Component:** `packages/kb-ui/src/components/content/ArticleSettingsPanel.tsx`
**Spec doc:** `design/article-settings-panel.md`
**Typecheck:** `npx tsc --noEmit` → exit 0

### Measurements (actual vs expected)

| Property | Expected | Actual | Verdict |
|---|---|---|---|
| Panel outer width | 452 | 452 | ✅ |
| Panel border radius | 12 | 12 | ✅ |
| Panel padding top | 24 | 24 | ✅ |
| Panel padding bottom | 24 | 24 | ✅ |
| Panel padding left | 22 | 22 | ✅ |
| Panel padding right | 22 | 22 | ✅ |
| Panel box-shadow | `0 4 6 -1 rgba(0,0,0,.05), 0 2 4 -2 rgba(0,0,0,.10)` | `rgba(0,0,0,.05) 0 4 6 -1, rgba(0,0,0,.10) 0 2 4 -2` | ✅ |
| Panel border | 1px #e2e8f0 | 1.11px #e2e8f0 (Tailwind rounding) | ✅ |
| Header gap (gear ↔ text) | 8 | 8 | ✅ |
| Field box height | 40 | 40 | ✅ |
| Field box border radius | 8 | 8 | ✅ |
| Field box padding LR | 12 / 12 | 12 / 12 | ✅ |
| Gap between adjacent fields | 20 | 20.00 | ✅ |
| Field count (expanded) | 8 | 8 | ✅ |

### Console errors

| Story | Errors |
|---|---|
| `--default` | 0 |
| `--empty` | 0 |
| `--collapsed` | 0 |
| `--interactive` | 0 |

### Screenshots + visual descriptions

- `design/screenshots/v9-settings-default.png` — Panel renders 452-wide against grey canvas. Visible: rounded-12 shadowed card; header row "[gear] Settings [chevron-up]" with 1px divider below; Author row with 20px VK avatar + "Varun Kelkar" text + down-chevron; Category "Managing emails" + chevron; Article Slug label with "26/60" counter top-right, input "how-to-reset-your-password" + chevron; Tags row with 3 pill chips [Security ×] [Account ×] [Password ×] and trailing dashed `+ Add`; Publish date with calendar glyph + "Apr 12, 2026"; SEO title label with "32/60" counter and value; Visibility "Public" + chevron; Reviewers row with 3 overlapping 24-circle AK/MR/TS avatars and trailing dashed + button.
- `design/screenshots/v9-settings-empty.png` — Same geometry; all fields show muted placeholder text (`Select author`, `Select category`, `article-url-slug`, `No tags yet`, `Pick a date`, `SEO page title`, `Select visibility`). Counters read `0/60`. Reviewers row is empty except for the dashed `+` add button.
- `design/screenshots/v9-settings-collapsed.png` — Only the 72-ish-tall header visible. Gear + "Settings" text + chevron-DOWN (flipped because collapsed). No divider, no fields. Shadow + border still visible.
- `design/screenshots/v9-settings-interactive.png` — Same as Default plus a dark JSON mirror below the panel showing the full `value` object. Confirms state is wired.

### Interaction test results (on `--interactive`)

| Step | Result | Screenshot |
|---|---|---|
| 1. Click header to collapse | Fields hidden; chevron flips down; `aria-expanded=false`. Panel shrinks to header height. JSON mirror unchanged. | `v9-settings-interactive-collapsed.png` |
| 2. Click header again | `aria-expanded=true`; all 8 fields re-rendered | (not re-shot; verified via DOM probe) |
| 3. Click × on "Security" chip | `Remove Security` button gone; remaining chips are `[Account] [Password] [+ Add]`; JSON `tags` → `["Account","Password"]` | `v9-settings-interactive-tag-removed.png` |
| 4. Click + on reviewer row | Avatar count 4 → 5; new "New User" / "NU" avatar appended; JSON `reviewers` gains 4th entry | `v9-settings-interactive-reviewer-added.png` |

### Notes / skipped

- Chevron-down is the visual state for a Select affordance, not a dropdown menu — per spec, these are presentational for v1. Decision recorded in `design/article-settings-panel.md` §Decisions log 1.
- Tag chip is a custom atom rather than the `Badge` primitive — close affordance + bg token mismatch made reuse costly. Decision recorded in §Decisions log 2.
- The first `browser_evaluate` probe after clicking "Add reviewer" returned the pre-commit avatar count (4). A second probe confirmed the post-commit count (5, labels include "New User"). React commit timing, not a component bug.

---

## 2026-04-21 KBEditorPage (Phase 5 step 3)

### Scope

Compose `AppShell` + `SideNavRail` + `FileExplorerNav` + `KBBreadcrumbBar(variant="editor")` + `ContentEditor` + `ArticleSettingsPanel` into a `Patterns/KB Editor Page` story. Figma target: `9aGp5t9fH1d0PXi4LMhOdb#53:8463` (library-check).

### Files touched

| File | Change |
|---|---|
| `packages/kb-ui/src/pages/KBEditorPage.stories.tsx` | **new** — 3 stories: `Default`, `Empty Draft`, `Narrow Viewport (1024)` |

No component files were modified. `src/index.ts` untouched (story files aren't exported).

### Width-resolution decision — Option B + C

**Chosen:** editor card uses `flex-1 min-w-0 max-w-[720px]` wrapper with the fixed 452 settings panel; below the `xl` breakpoint (1280) the columns **stack** (Option C). 24 px gap between columns.

**Why Option B was preferred over A (wider viewport) or D (floating right-rail):**
- The product convention (and every other story in this library) keeps rail + explorer visible. A dedicated editor-only viewport (Option A) would break consistency.
- At 1280 actual viewport, content column = 938 px. Editor 720 + Settings 452 + Gap 24 = 1196 → overflow. Option B resolves by shrinking the editor card. At 1280 with rail+explorer visible, the editor gets ≈ 462 px — tight but legible with an 8-word/line cadence.
- Option D (floating right-rail) introduces an interaction model the product hasn't established yet. Out of scope for Phase 5 step 3.
- Narrow stacking (Option C) below xl is the safe-harbor: below 1280 the editor gets the full content column (> 600 px) and the settings panel renders below.

**Why this diverges from Figma `53:8463` and how it is documented:**
- Metadata confirms: `_sideNav Header` node is `hidden="true"` in the Figma mock — the editor page is drawn **without** a rail + explorer. Under that Figma layout, content column = 1216 px and 720 + 24 + 452 = 1196 fits with 20 px breathing room. That is the *canonical* Figma width math.
- Task spec explicitly calls for full-shell composition (rail + explorer visible). We follow the task.
- Deliberate divergence from Figma is surfaced in the story's top-of-file JSDoc.

### Measurement table (Default story, iframe viewport 1422×1000 — side-by-side active)

| Probe | Target (design.md @ 1280 mock) | Measured | Verdict |
|---|---|---|---|
| Rail width | 54 | 54 | ✅ |
| Explorer width | 288 | 288 | ✅ |
| Content column width | 938 (@1280) / flex (@≥1280) | 1080 (@1422) | ✅ (flex-scales as designed) |
| `main` padding-top under breadcrumb | 12 | 12 | ✅ |
| Editor card outer width | 720 (Figma) / max 720 (ours) | 556 | ✅ (shrunk from 720 max per Option B; scales up as vw grows) |
| Settings panel outer width | 452 | 452 | ✅ |
| Gap between editor and settings | 24 (assumed from Figma pattern) | 24 | ✅ |
| Flex direction @ vw≥1280 | row | row | ✅ |
| Flex direction @ vw<1280 | column (Option C) | column | ✅ |

At vw=1540 (hypothetical desktop), editor would reach its 720 max and additional width pushes into the right margin — verified by algebra; not directly measured.

### Console errors

| Story | iframe URL | Errors |
|---|---|---|
| Default | `iframe.html?id=patterns-kb-editor-page--default` | 0 |
| Empty Draft | `iframe.html?id=patterns-kb-editor-page--empty-draft` | 0 |
| Narrow Viewport (1024) | `iframe.html?id=patterns-kb-editor-page--narrow-viewport` | 0 |

(Favicon 404 is environmental and shared across all Storybook pages; not from the story.)

### Screenshots — visual read-back

- **`design/screenshots/v10-editor-page-default-1422.png`** (Default, side-by-side active): Left rail shows the Hiver "h" brand square at top, four rail icons (AI sparkle, active quill-pen, folder, settings gear) and the "V" avatar at bottom. Explorer titled "Editor" with search icon; tree shows Getting Started (12), expanded Offer Multi-channel Support (9) with expanded Managing emails (3) containing three article rows — "How to Reset Yo…" row is **active** (grey active background, with draft dot); the two siblings "Setting up labels…" and "Email threading…" show green published dots. Remaining peer folders (Manage live chat, Manage calls, Manage WhatsApp, Automate Workflows, Manage SLA Policies, Collaborating, Hiver AI, Enable self-service) listed collapsed. Above: breadcrumb bar with collapse pictogram, "Offer Multi-channel Support / Managing emails / How to Reset Your Password" chain, right-aligned "Save as draft" link, outlined "⮕ Publish" button, and × close. Editor card (rounded 12, subtle shadow) holds the toolbar strip (H1 dropdown, bold/italic/underline/strike, list atoms, link/code/code-block/table, undo/redo, AI-highlight sparkle, more-menu), then H1 "How to Reset Your Password", body paragraph, H2 "Resetting from the Web Dashboard", "follow the instructions :" line, a 6-item ordered list with bolded key phrases and a link to app.hiver.com, H3 "Important notes" with the green AI-highlight strip "30 minutes for security reasons — always use the latest email received", and H3 "Admin panel override" with its paragraph. To the right: settings panel (rounded 12, shadow-md) with header "[gear] Settings [chevron-up]", divider, fields Author (VK avatar + "Varun Kelkar"), Category ("Managing emails"), Article Slug with counter "26/60" and value "how-to-reset-your-password", Tags row with three chips [Security ×][Account ×][Password ×] and trailing dashed "+ Add", Publish date "Apr 12, 2026" with calendar glyph, SEO title "Reset Your Password — Hiver Help" + "32/60" counter, Visibility "Public" + chevron, Reviewers with three overlapping 24-circle avatars AK/M(R)/TS and trailing dashed "+". No overlap, no clipping, shadows cohesive.

- **`design/screenshots/v10-editor-page-empty-1422.png`** (Empty Draft): Same shell and breadcrumb chrome. Editor card shows an "N" dropdown (Normal), full toolbar, and a single grey "Start writing…" placeholder line — roughly ~300 px tall card (just enough to show toolbar + min-height). Settings panel on right shows all empty-state placeholders: "Select author", "Select category", "article-url-slug" placeholder with "0/60" counter, "No tags yet" + "+ Add", "Pick a date" with calendar glyph, "SEO page title" + "0/60", "Select visibility", and Reviewers row collapsed to **only** the dashed "+" add affordance. Confirms every field state still renders cleanly with no content.

- **`design/screenshots/v10-editor-page-narrow-1024.png`** (Narrow, `forceStack`): Wrapper forces 1024 px width. Rail + explorer identical. Breadcrumb items now truncate — "Offer Multi-c…" / "Manag…" / "How to Reset You" (without question mark) — visible proof that the breadcrumb truncation rule (`max-w-[260px]` on interior, `max-w-[320px]` on current) kicks in under tight widths. Editor card stretches to fill content column (~634 px wide), settings panel below it at its fixed 452 px. No overlap; stack order editor-then-settings matches product expectation (primary work-area above, metadata below).

- **`design/screenshots/v10-editor-page-default-1280.png`** (alt-capture at vw=1280 under Storybook UI, iframe ≈ 1122): Stored earlier; shows stacking behavior at narrow widths (same behavior as Narrow, just without the outer 1024 wrapper). Included for completeness.

### Figma vs render gaps

| # | Gap | Decision |
|---|---|---|
| 1 | Figma mock hides rail + explorer; our composition shows them. | Intentional — matches task spec and product convention; documented in story JSDoc + above. |
| 2 | Editor card at 1280 viewport renders ≈ 462 px (shrunk) vs Figma's 720 px. | Intentional — Option B flex-shrink behavior; card reaches 720 max only at vw ≥ 1538. |
| 3 | Breadcrumb truncates at narrow widths. | Expected; the truncation class was already in KBBreadcrumbBar. Not a new gap. |
| 4 | `w-[720px]` in `ContentEditor` is retained; overridden at runtime by wrapping `max-w-full` pass-through + wrapper `flex-1 min-w-0`. | No component mutation; override via composition only. |

### Save / Publish wiring

- Chosen approach: pure-DOM event. The `KBBreadcrumbBar` "Save as draft" and "Publish" handlers both call a local `dispatchSave()` that queries `.ProseMirror` inside the editor wrapper and dispatches a `kb-editor-save` CustomEvent. `ContentEditor` already listens for that event (`ContentEditor.tsx` ~L515) and fires its `onSave(html, json)` callback.
- No ref hacks into ContentEditor internals; no prop changes to `KBBreadcrumbBar` or `ContentEditor`.
- Publish additionally logs `"publish"` — the prototype does not mutate `isPublished` state because no visible published-state UI exists outside the editor; a full wiring belongs in Phase 5 step 4.

### Typecheck

```
$ cd packages/kb-ui && npx tsc --noEmit
(exit 0, 0 output)
```

### Notes / skipped

- Playwright MCP in this environment has a pinned browser viewport (1422 × 1000); `browser_resize` calls are no-ops at the iframe level. Per-viewport testing was done via a fixed-width wrapper for the narrow case and an iframe URL direct-render for the 1280 case. Layout invariants (`flex-row` at vw≥1280, `flex-col` at vw<1280) were independently verified by inspecting `getComputedStyle().flexDirection` at the breakpoint.
- Tailwind v4's `xl:` responsive utility needed a tokens.css touch-save to trigger rebuild on the already-running dev server (first use of a responsive prefix in this codebase). Subsequent uses will not need this.

---

## 2026-04-21 Editor Page collapsed state + home icon

### Scope

Rebuild `Patterns/KB Editor Page` to match Figma `9aGp5t9fH1d0PXi4LMhOdb#53:8464` — the **collapsed shell** variant where rail + explorer are hidden and the breadcrumb's leading icon is a **home** glyph. Previous pass was built against `53:8463` (expanded shell), which was the wrong target.

### Files touched

| File | Change |
|---|---|
| `packages/kb-ui/src/components/shell/AppShell.tsx` | Added `sidebarCollapsed?: boolean` and `onToggleSidebar?: () => void` props. When `sidebarCollapsed === true`, rail + explorer are **unmounted** (not `display: none`). Content column spans full viewport. Root DOM carries `data-kb-sidebar-collapsed="true"` for probes. Defaults to `false` — no regression. |
| `packages/kb-ui/src/components/shell/KBBreadcrumbBar.tsx` | Added `sidebarCollapsed?: boolean` and `onToggleSidebar?: () => void` props. Leading icon swaps: `RiLayoutLeftLine` → `RiHome5Line`. `aria-label` flips "Collapse sidebar" ↔ "Expand sidebar". `data-testid` flips `"side-panel-icon"` ↔ `"home-icon"`. Container/padding/colors unchanged. |
| `packages/kb-ui/src/pages/KBEditorPage.stories.tsx` | Rewritten. Three stories: `Default` (collapsed, matches `53:8464`), `WithSidebars` (expanded shell — regression coverage), `EmptyDraft` (collapsed + empty). Collapsed-state breadcrumb path per Figma: `Getting Started / Integrating Hiver in Slack / Hiver in Incognito / How to reset your Password`. Populated settings use Figma values (`Varun K`, `Hiver in Incognito`). `"Last updated 9 months ago"` injected as first paragraph in `initialContent`. |
| `design/_layout-invariants.md` | New "Sidebar collapsed state (2026-04-21)" section. |
| `design/breadcrumb.md` | New "Icon swap (2026-04-21)" section. |

No other component files were modified — `ContentEditor.tsx`, `ArticleSettingsPanel.tsx`, `SideNavRail.tsx`, `FileExplorerNav.tsx`, and every primitive are untouched.

### Measurements (iframe viewport 1122 × ~1000, Storybook's pinned size)

| Probe | Target | Measured (Default) | Measured (WithSidebars) | Measured (EmptyDraft) |
|---|---|---|---|---|
| Rail unmounted | `null` (collapsed) / DOM node (expanded) | null ✅ | node, w=54 ✅ | null ✅ |
| Explorer unmounted | `null` (collapsed) / DOM node (expanded) | null ✅ | node, w=288 ✅ | null ✅ |
| `data-testid="home-icon"` | present (collapsed) / absent (expanded) | present ✅ | absent ✅ | present ✅ |
| `data-testid="side-panel-icon"` | absent (collapsed) / present (expanded) | absent ✅ | present ✅ | absent ✅ |
| Breadcrumb width | full viewport (collapsed) | 1122.22 ✅ | 780.24 (post-rail+explorer) ✅ | 1122.22 ✅ |
| Editor × Settings side-by-side | y-delta < 30 (collapsed row) | true, y=65.99 each ✅ | false (stacks, editor above settings — below xl bp) ✅ | true ✅ |
| Editor column width | flex-shrinks under 720 max | 598.25 ✅ | 732.22 (content-col limit) ✅ | 598.25 ✅ |
| Settings column width | 452 fixed | 451.997 ✅ | 451.997 ✅ | 451.997 ✅ |
| Console errors | 0 | 0 ✅ | 0 ✅ | 0 ✅ |

Regression check — `Components/Shell/AppShell --editor-view` (no `sidebarCollapsed` passed):
- rail present, explorer present, side-panel-icon present, home-icon absent. Behaviour unchanged.

### Screenshots — visual read-back

- **`design/screenshots/v11-editor-collapsed.png`** (`Default`): Full-width content area at ≈1122 px. Breadcrumb at top shows, left-to-right: a **home glyph** (outlined house shape, roof + door), text "Getting Started / Integrating Hiver in Slack / Hiver in Incognito / How to reset your Password" (current crumb gets the existing pill background), then far right "Save as draft" link, outlined "▶ Publish" button, and "×" close. NO rail column, NO explorer column. Editor card (rounded, subtle shadow) fills the left ≈598 px — toolbar strip, H1 "How to Reset Your Password", subtitle line "Last updated 9 months ago" (plain body text — tiptap strips inline styles — see delta below), then the reset-password article body (H2, ordered list with bolded phrases, AI-highlight mark, two H3 sections). Settings panel on the right at x=646, width 452, y matches editor card — side-by-side confirmed. Panel shows Author="Varun K" with "A" avatar, Category="Hiver in Incognito", Article Slug="how-to-reset-your-password" with 26/60 counter, three tag chips, Publish date, SEO title, Visibility=Public, Reviewers row with 3 avatars. No clipping, no overlap.
- **`design/screenshots/v11-editor-with-sidebars.png`** (`WithSidebars`): Dark rail at x=0 (54 wide) with brand square, four rail icons (AI, quill=active, folder, settings gear), "V" avatar bottom. Explorer column (288 wide) titled "Editor" with search; full tree visible including expanded "Offer Multi-channel Support → Managing emails" with "How to Reset Yo…" row **active** (grey bg, draft dot). Breadcrumb leading icon is the **side-panel toggle** (rounded rect with internal vertical divider), NOT a home icon. Breadcrumb text: "Offer Multi-channe… / Managing… / How to Reset Your Pas…" (truncated). Right side buttons identical to Default. Editor card fills content column (~732 wide). Because content column < 1196 px, the settings panel **stacks** below the editor — this is the intentional Option C fallback, unchanged from prior pass.
- **`design/screenshots/v11-editor-empty-collapsed.png`** (`EmptyDraft`): Same shell chrome as Default (home icon, full-width breadcrumb, no rail/explorer). Editor card shows just the toolbar (N dropdown, formatting atoms) and "Start writing…" placeholder. Settings panel empty state: "Select author", "Select category", "article-url-slug" placeholder (0/60), "No tags yet + Add", "Pick a date", "SEO page title" (0/60), "Select visibility", Reviewers with only the dashed "+" affordance. Side-by-side confirmed.

### Figma vs render — deltas flagged (NOT silently fixed)

| # | Figma `53:8464` shows | Our render | Decision |
|---|---|---|---|
| 1 | Publish button: **black bg / white text** | Outlined white button | OUT OF SCOPE — no change to `KBBreadcrumbBar` button styling in this pass. Flag only. |
| 2 | Current breadcrumb crumb "How to reset your Password" appears **without** a pill background | Pill bg `#f8fafc` (existing behavior) | OUT OF SCOPE — the pill is the current-item convention across the library and the prior spec explicitly calls for it. Flag only. |
| 3 | Article Slug counter reads **14/32** (shorter max length) | Our code uses 60 max | OUT OF SCOPE — `ArticleSettingsPanel.tsx` is locked by spec. Flag only. |
| 4 | Author initial displayed as **"A"** (single letter), value "Varun K" | Matched in story data | Adjusted in `populatedSettings` (story-level, no component change). |
| 5 | Category = **"Hiver in Incognito"** | Matched in story data | Adjusted. |
| 6 | Subtitle "Last updated 9 months ago" is grey **14/20 `#64748b`** | Renders as normal body text (16 px, default dark) | KNOWN — Tiptap strips inline styles on `<p>` elements. The spec explicitly forbids `ContentEditor.tsx` modifications. Surfacing the visual delta here; a proper fix would require a dedicated subtitle slot on `ContentEditor` or a tiptap extension, both out of scope. |

### Typecheck

```
$ cd packages/kb-ui && npx tsc --noEmit
(exit 0, 0 output)
```

### Notes

- Chose `RiHome5Line` from Remix after greping all `RiHome*Line` options — `RiHome5Line` matches the outlined rounded-roof house in the Figma screenshot most closely. `RiHomeLine`, `RiHome2Line` and others render with subtly different proportions or filled interiors.
- Editor + Settings in the collapsed state force `flex-row` regardless of viewport width (since no rail/explorer compete for width). At Storybook's 1122-iframe the editor shrinks to ~598 px; at ≥1196 the editor reaches its 720 max.

## 2026-04-21 Editor Page final parity fixes (Figma `53:8464`)

Four corrections were requested against node `53:8464`. Each was evaluated
against primary-source Figma evidence (design context JSON for node
`53:8464` plus the rendered screenshot); two resulted in code changes,
two in documentation-only decisions.

### Fix 1 — Force side-by-side in collapsed state — NO CODE CHANGE

**Verified already correct.** The `Default` + `EmptyDraft` stories wrap the
editor + settings in `<div className="flex flex-row gap-6 items-start">`
(no breakpoint gating) when `sidebarCollapsed === true`
(`KBEditorPage.stories.tsx:290-296`, pre-existing from prior pass).

Playwright `browser_evaluate` probes at three Storybook iframe widths:

| Viewport | flexDirection | editor top | settings top | editor W | settings W |
|---|---|---|---|---|---|
| 1137 (canvas narrow) | `row` ✅ | 65.99 | 65.99 | 613.80 | 451.997 |
| 1333 | `row` ✅ | 65.99 | 65.99 | 720.00 | 451.997 |
| 1600 | `row` ✅ | 65.99 | 65.99 | 720.00 | 451.997 |

Below ~1244 viewport the editor column shrinks under its 720 max (via
`flex-1 min-w-0`) but never stacks. The user's perception of "still
stacking" at narrow canvas widths is actually the editor *compressing*
to very narrow widths (≈314 px at the 838 px Storybook canvas iframe),
which reads as broken but is structurally side-by-side.

### Fix 2 — Publish button → primary variant — APPLIED

Figma source code for node `53:8556` shows
`bg-[var(--background/black/adaptive,black)]` with `text-[color:var(--text/white/static,white)]`
and a 14 px white send-plane icon.

**Change:** `KBBreadcrumbBar.tsx` L1 + L144-151 → replace the inline
`<button>` with the shared `Button` primary variant.

```tsx
// before
<button className="... border border-[#e2e8f0] bg-white text-[#0f172a] ...">
  <RiSendPlaneLine size={14} />
  Publish
</button>

// after
<Button variant="primary" onClick={onPublish} icon={<RiSendPlaneLine size={14} />}>
  Publish
</Button>
```

Probe on `--default` story:
- `button.backgroundColor` → `rgb(0, 0, 0)` ✅
- `button.color` → `rgb(255, 255, 255)` ✅
- inner `svg.color` + `svg.fill` → `rgb(255, 255, 255)` ✅ (currentColor propagation)

Regression: category variant renders the breadcrumb without any Publish
button (`KBCategoryPage/ManagingEmails` confirms `hasPublishButton: false`
and 0 console errors), so the Button import adds no surface for unintended
category-variant render.

### Fix 3 — Current crumb pill — NO CODE CHANGE, retained per Figma

**Figma primary source contradicts the user's visual read.** Figma design
context for node `I53:8537;10138:12798` (the current crumb's outer span)
declares literally:

```
bg-[var(--background/neutral/faint,#f8fafc)]
content-stretch flex gap-[var(--scale/space/sm,0px)]
px-[var(--scale/space/md,6px)] py-[var(--scale/space/none,0px)]
rounded-[var(--scale/radius/sm,4px)]
```

i.e. `bg-#f8fafc rounded-4 px-6` — identical to the current implementation.
The "no pill" impression in the Figma export PNG stems from `#f8fafc`
having ~1% visible contrast against `#ffffff` at 1:1 zoom.

Per the task brief's tiebreaker ("If Figma numbers differ from prior spec,
prefer Figma for this fix"), the pill is retained. Probe on `--default`:
`span[data-kb-part="breadcrumb-current"].backgroundColor` → `rgb(248, 250, 252)`
= `#f8fafc` ✅ — matches Figma primary source exactly.

Category variant is unaffected either way — it renders only the current
item (no ancestor chain) and its pill behavior is preserved as-is.

### Fix 4 — Article Slug counter max 32 — APPLIED

Figma screenshot shows the slug counter reading `14/32`, not `14/60`.

**Change:** `ArticleSettingsPanel.tsx:42` → `SLUG_MAX = 32` (SEO stays 60).
The `<input maxLength={SLUG_MAX}>` and the `CharCounter` both consume the
same constant, so the change propagates to both truncation and the label.

Probe on `--default`: slug counter text → `"26/32"` ✅
Probe on `--empty-draft`: counters → `["0/32", "0/60"]` ✅

### Per-story status

| Story | Probes | Console errors | Notes |
|---|---|---|---|
| `--default` | flex-row, sameTop, pub-bg=black, slug 26/32 | 0 | Populated state, 1600×900 |
| `--empty-draft` | flex-row, sameTop, pub-bg=black, slug 0/32 | 0 | Empty editor + empty settings |
| `--with-sidebars` | explorer + rail visible, Publish primary | 0 | Expanded shell regression intact |
| Category page `--managing-emails` | current-crumb pill preserved, no Publish button | 0 | No regression from KBBreadcrumbBar changes |

### Typecheck

```
$ cd packages/kb-ui && npx tsc --noEmit
(exit 0, 0 output)
```

### Files changed this pass

| File | Lines | Change |
|---|---|---|
| `packages/kb-ui/src/components/shell/KBBreadcrumbBar.tsx` | 2 (L9), 144-156 | Import `Button`, swap inline Publish `<button>` for `<Button variant="primary">` |
| `packages/kb-ui/src/components/content/ArticleSettingsPanel.tsx` | 42 | `SLUG_MAX = 32` (was 60) |
| `packages/kb-ui/src/pages/KBEditorPage.stories.tsx` | — | No change (Fix 1 already correct) |

### Known deltas still flagged (out of scope)

| # | Figma | Current | Decision |
|---|---|---|---|
| a | Save-as-draft text color `#94a3b8` (muted/disabled appearance) | `#475569` | Not in the four-fix list — flag only, no change |
| b | Subtitle "Last updated 9 months ago" grey 14/20 `#64748b` | Body text (Tiptap strips inline styles) | Requires `ContentEditor` change; spec excludes it |

## 2026-04-21 Floating toolbar + flush edges

Three-part editor UX correction.

### Before

- **ContentEditor**: a static toolbar rendered inside the editor card (top of the card, full card-width bar, `px-2 py-2`, `flex gap-1`). Buttons: paragraph dropdown, bold/italic/underline/strike, bullet/numbered list, link/inline-code/code-block/table, undo/redo, AI highlight, overflow. The toolbar was always visible, never followed the cursor.
- **KBEditorPage collapsed stories**: row wrapper was `flex flex-row gap-6 items-start`, which left the editor card free to sit centered in the content column (depending on sibling widths) with gaps on BOTH sides. Settings panel had no fixed width; it just took `shrink-0`.

### After

- **ContentEditor**: no in-card toolbar. `BubbleMenu` and `FloatingMenu` from `@tiptap/react/menus` (v3.22.4) render the same `ContentEditorToolbar` component — one for selection, one for the empty-line caret. Both appended to `document.body` so the editor card's border-radius/overflow cannot clip them. Toolbar wrapper: `inline-flex w-max items-center gap-0.5 rounded-[8px] border border-[#e2e8f0] bg-white p-1 shadow-md` — hugged to content width. Undo/Redo dropped (keyboard ⌘Z/⌘⇧Z remains; see `design/editor.md` for the decision record).
- **KBEditorPage collapsed stories** (`Default`, `EmptyDraft`): row wrapper becomes `flex flex-row justify-between items-start gap-6`; editor is `max-w-[720px] w-full`; settings panel is `w-[452px] shrink-0`. `WithSidebars` is untouched.

### Verification

| Check | Measured | Expected | ✓ |
|---|---|---|---|
| Typecheck | `npx tsc --noEmit` exit 0 | 0 | ✅ |
| FloatingMenu shows on empty line | toolbar at (97, 119), 400×36 | visible + hugged | ✅ |
| BubbleMenu shows on selection | toolbar at (0, 48), 400×36 above "world from" | visible + hugged | ✅ |
| Toolbar hug | scrollWidth 398 == sum(children + gap + pad + divider margins) | equal | ✅ |
| Toolbar `position` | parent wrapper `position: absolute` (floating-ui) | absolute / not static | ✅ |
| Editor flush-left | `editor.left - contentColumn.left = 23.99` | 24 | ✅ |
| Settings flush-right | `contentColumn.right - settings.right = 23.99` | 24 | ✅ |
| Editor width | 720 | 720 | ✅ |
| Settings width | 452 | 452 | ✅ |
| Console errors on 3 screenshot routes | 0 | 0 | ✅ |
| Regression: Empty / WithContent / ReadOnly | all render; ReadOnly has no toolbar | preserved | ✅ |
| Regression: WithSidebars layout | unchanged (`flex flex-col xl:flex-row …`) | unchanged | ✅ |

### Screenshots

- `design/screenshots/v13-editor-floating-toolbar.png` — Interactive story; first paragraph "This is typed content." rendered, second paragraph empty with cursor, FloatingMenu floating on that empty line at left of the card. Toolbar is a tight rectangle (~400 px) containing `N▼ | B I U S | bullet numbered | link code codeblock table | AI-highlight more`. It does NOT span the editor card width; it hugs its button count.
- `design/screenshots/v13-editor-bubble-menu.png` — Interactive story; the substring "world from" is selected (green selection highlight) inside "Hello world from Playwright — this is sample text." A toolbar with identical contents and identical hugged width hovers at the top of the viewport, above the selection.
- `design/screenshots/v13-editor-page-flush-edges.png` — `Patterns/KB Editor Page --default` at 1440×900. The breadcrumb bar (Home icon leftmost, Save-as-draft/Publish/close on the far right) sits flush to the viewport edges. Below, the 720-px editor card hugs the LEFT (24 px from content-column left = `main`'s `pl-6`); the 452-px settings panel hugs the RIGHT (24 px from content-column right = `main`'s `pr-6`). A wide empty gap absorbs the remaining horizontal space.

### Files edited

| File | Change |
|---|---|
| `packages/kb-ui/src/components/content/ContentEditor.tsx` | Added `BubbleMenu`/`FloatingMenu` import; renamed `Toolbar` to `ContentEditorToolbar` with hugged inline-flex layout; dropped Undo/Redo + related icon imports; removed the in-card static toolbar; added both menus beneath `EditorContent` gated on `!readOnly && editor`. |
| `packages/kb-ui/src/pages/KBEditorPage.stories.tsx` | Collapsed-row class → `flex flex-row justify-between items-start gap-6`; editor column drops `flex-1 min-w-0` when collapsed; settings column gets `w-[452px] shrink-0` when collapsed. `WithSidebars` path (non-collapsed branches) unchanged. |
| `design/editor.md` | New "Surface — floating / inline" section; Undo/Redo decision record; hug math. |
| `design/_layout-invariants.md` | New "Flush-edges rule" under "Sidebar collapsed state" with verification check. |
| `design/_diff-report.md` | This section. |


## 2026-04-21 Slash command + remove FloatingMenu

Replaced the always-on `FloatingMenu` (rendered at the left edge of every empty line) with a **Notion-style slash command** popup that opens at the caret when the user types `/`.

| Aspect | Before | After | Status |
|---|---|---|---|
| Empty-line affordance | `FloatingMenu` with full toolbar always visible | None — keyboard `/` opens block-insert popup at caret | Replaced |
| Selection affordance | `BubbleMenu` with full toolbar | Unchanged | Preserved |
| Block insertion commands | Hidden behind a 14-icon toolbar that required hover | 10 keyboard-first commands, filterable by typed query (title/alias startsWith) | Upgraded |
| Positioning | Tiptap built-in (right of line, 8 px offset) | `@floating-ui/dom` `bottom-start`, 4 px offset, auto-flip above when near viewport bottom | Reworked |
| Code block behavior | Toolbar visible inside code block | Slash popup disabled inside code block / inline code mark via `allow()` | Improved |
| Console errors on 4 screenshot routes | 0 | 0 | Maintained |
| Regression: Empty / WithContent / ReadOnly | all render | all render | Maintained |
| Regression: KBEditorPage layout | unchanged | unchanged | Maintained |
| Typecheck | clean | clean | Maintained |

### Package installs

- `@tiptap/suggestion@^3.22.4` — the only new dep. `@floating-ui/dom` was already a transitive dep of BubbleMenu, so reused.

### Screenshots

- `design/screenshots/v14-slash-menu-open.png` — Interactive story; `/` typed into an empty editor. The slash popup (220 px wide, 8 px radius, soft shadow) sits directly under the caret with a 4 px gap. First 6 of 10 commands visible, Heading 1 row highlighted as the active row.
- `design/screenshots/v14-slash-menu-filtered.png` — `/h` typed. Popup resizes to 4 rows: Heading 1, Heading 2, Heading 3, Divider (matched via its `hr` alias). AI Highlight is correctly excluded.
- `design/screenshots/v14-slash-menu-closed.png` — After Escape + clearing content, the editor shows the placeholder "Start writing your article…" in `#94a3b8`. No popup in the DOM.
- `design/screenshots/v14-bubble-menu.png` — Regression proof: "world" selected inside "Hello world from Playwright", BubbleMenu still renders with the full formatting toolbar (`N▾ | B I U S | lists | link code codeblock table | AI more`).
- `design/screenshots/v14-slash-menu-in-page.png` — `Patterns/KB Editor Page --default` at 1440×900. Slash popup opens at the caret inside the article, to the left and below; settings panel on the right unchanged.

### Files edited

| File | Change |
|---|---|
| `packages/kb-ui/src/components/content/ContentEditor.tsx` | Dropped `FloatingMenu` import + JSX block; added `SlashCommandExtension` to the extensions list; updated comments. Bubble menu path unchanged. |
| `packages/kb-ui/src/components/content/SlashCommandMenu.tsx` | **new**. Exports `SLASH_COMMANDS` (10 items), `filterSlashCommands(query)`, and the React popup. |
| `packages/kb-ui/src/components/content/extensions/SlashCommand.ts` | **new**. Tiptap `Extension.create` wrapping `@tiptap/suggestion`. Owns a singleton popup host that renders `<SlashCommandMenu>` via `createRoot` and positions via `@floating-ui/dom` (`bottom-start` + `flip` + `shift`). Keyboard navigation + caret-based filtering live here. |
| `packages/kb-ui/package.json` | Added `@tiptap/suggestion@^3.22.4`. |
| `design/editor.md` | New "Slash command" section covering UX, filter rules, positioning library choice, visual spec. |
| `design/_diff-report.md` | This section. |
