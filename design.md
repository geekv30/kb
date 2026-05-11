# design.md — Design Tokens, Figma Reference & Component Specs

## Foundations story (source of visual token verification)

Every design token, text style, and icon used in this package is rendered on a single Storybook page: `**Foundations/Overview**` (file: `packages/kb-ui/src/components/foundations/Foundations.stories.tsx`). Use this story to eyeball-check tokens against Figma before assuming a component is off-spec. Sibling stories `Foundations/Overview` → Typography, Colors, Icons, Spacing & Radius split the same content into narrower views.

## Figma Source

File: `https://www.figma.com/design/251DTRmxl2L6jmXd3FWzHe/kb-gaps`


| Section                                | Node ID      | Priority  |
| -------------------------------------- | ------------ | --------- |
| KB revamp (core layout + navigation)   | `1952-10869` | CRUCIAL   |
| KB gaps (AI feature)                   | `1958-32263` | CRUCIAL   |
| KB analytics dashboard                 | `1952-10867` | CRUCIAL   |
| Login revamp                           | `1952-10870` | Secondary |
| KB creation flow (from main Hiver app) | `1952-10868` | Secondary |


### Unique Screens (study before building any component)


| Screen                   | Node ID      | What it covers                                                        |
| ------------------------ | ------------ | --------------------------------------------------------------------- |
| Screen 1 — Category view | `2166-50022` | Rail nav, tree nav, breadcrumb, category header, sub-categories table |
| Screen 1 atoms           | `2172-51551` | Isolated atoms for screen 1                                           |
| Screen 2 — Editor view   | `2166-51107` | Editor card, settings panel, breadcrumb with actions                  |
| Screen 2 atoms           | `2172-51552` | Isolated atoms for screen 2                                           |


**Rule:** Always `get_design_context` + `get_screenshot` on the relevant screen node before building any component from that screen.

### Library-Check File (component isolation, Phase 2b + Phase 6 source)

File key: `9aGp5t9fH1d0PXi4LMhOdb` — **Note: `get_design_context` returns "nothing selected" for all nodes in this file. Use screenshots + specs below.**


| Component           | Node ID  | Themes            |
| ------------------- | -------- | ----------------- |
| SideNavRail         | `0:1`    | dark + light      |
| FileExplorerNav     | `1:4823` | dark + light      |
| Avatar              | `2:388`  | light only        |
| StatusBadge (tag)   | `2:400`  | published + draft |
| Table               | `1:5178` | light only        |
| Breadcrumb          | `1:5389` | light only        |
| PageHeader + Button | `1:5452` | light only        |


**Phase 6 — AI Gaps surface** (canonical spec at `design/ai-gaps.md`):


| Component / Pattern         | Node ID    | Notes                                                         |
| --------------------------- | ---------- | ------------------------------------------------------------- |
| SideNavRail ai-active state | `74:8794`  | Uses existing `SideNavRail` with `activeId="ai"`              |
| AISubNav                    | `74:8871`  | NEW component — 288 px flat nav with section/item kinds       |
| SuggestionCard (hub)        | `74:8927`  | NEW — hub card with title / description / HR / meta row       |
| KB AI Optimise Hub page     | `74:8928`  | Pattern story composing rail + AISubNav + breadcrumb + cards  |
| AI gap cards (rail)         | `74:9431`  | 3×4 grid — pre-review + 3 active + 3 accepted + 3 dismissed   |
| Sources side-sheet          | `76:12567` | Radix Dialog overlay                                          |
| AI Gaps Experience pattern  | `74:10788` | 10-frame review loop — 6 static frame stories + 1 interactive |


---

## Design Tokens

### Colors

```css
--color-canvas:          #f5f5f5   /* page-background concept — AppShell root uses this but its content column covers it; in practice rail/explorer/content columns all paint white (see note below) */
--color-surface:         #ffffff   /* cards, panels */
--color-surface-subtle:  #f8fafc   /* breadcrumb active bg */
--color-surface-muted:   #f1f5f9   /* button subtle bg */
--color-surface-tab:     #f1f2f4   /* chrome tab bar bg */
--color-brand-bar:       #e6effd   /* brand accent strip */
--color-nav-rail:        #e2e8f0   /* rail separator */
--color-text-primary:    #0f172a
--color-text-secondary:  #334155
--color-text-meta:       #475569
--color-text-muted:      #64748b
--color-text-disabled:   #94a3b8
--color-success-text:    #086e3f
--color-highlight:       #e7f9ee   /* text selection / AI highlight */
--color-btn-primary:     #000000
--color-btn-danger-bg:   #feeeec
--color-border:          #f1f5f9
--color-border-input:    #e2e8f0   /* Phase 15 — unified to slate-200 (was #e5e5e5) */
--color-border-faint:    #cbd5e1   /* Phase 15 — slate-300, soft hairlines / chevron separators / pressed-state bg */

/* AI Gaps semantic palette */
--color-ai-addition:       #22c55e
--color-ai-replace:        #3b82f6
--color-ai-removal:        #ef4444
--color-ai-pink:           #d92fff
--color-ai-addition-wash:  rgba(34,197,94,0.12)
--color-ai-removal-wash:   rgba(239,68,68,0.10)

/* Semantic washes (Phase 15) */
--color-success-wash-subtle: #f2fcf6   /* softest success wash — HelpfulnessTag up + Badge published */

/* Card semantics */
--color-card-border:       #e2e8f0   /* Phase 15 — unified to slate-200 (was #e5e5e5) */
--color-card-divider:      #e2e8f0   /* Phase 15 — unified to slate-200 (was #e5e5e5) */

/* Analytics — trend indicators (Figma SupportPerformanceCard 1974:53911) */
--color-trend-up:          #086e3f   /* Figma text/success/default + icon/success/subtle */
--color-trend-down:        #d52c1f   /* Figma text/danger/default + icon/danger/default */
--color-trend-neutral:     #64748b

/* Analytics — chart series + washes (Figma Article-views-over-time 1974:53969) */
--color-chart-views:       #f56565   /* Figma Red/r400 — "Total Views" */
--color-chart-unique:      #4299e1   /* Figma Blue/b400 — "Unique Views" */
--color-chart-positive:    #22c55e   /* search vol + AI deflection green — not tokenized in Figma yet */
--color-chart-body:        #4b5468   /* Figma NeutralLight/nl700 (Body) — analytics body text + axis ticks */
--color-chart-wash-up:     rgba(8,110,63,0.10)     /* derived from trend-up */
--color-chart-wash-down:   rgba(213,44,31,0.10)    /* derived from trend-down */
--color-chart-wash-info:   rgba(66,153,225,0.10)   /* derived from chart-unique */

/* Analytics — chart annotations (Figma AI-deflection-rate 1974:53443) */
--color-chart-goal-line:     #276cf0   /* Figma border/blue/default — goal-line stroke */
--color-chart-goal-label-bg: #26292e   /* Figma NeutralLight/nl800 — goal-label pill BG */

/* Analytics — donut/pie palette (Figma Views-by-Category 1974:53988, 6 segments) */
--color-donut-1:           #4fd1c5   /* Figma Teal/t300 */
--color-donut-2:           #b4bfcc   /* Figma NeutralLight/nl400 */
--color-donut-3:           #6e7b91   /* Figma NeutralLight/nl600 */
--color-donut-4:           #98a2b2   /* Figma NeutralLight/nl500 */
--color-donut-5:           #dde3ee   /* Figma NeutralLight/nl300 */
--color-donut-6:           #4b5468   /* Figma NeutralLight/nl700 */
```

**Card + input borders unified to #e2e8f0 (slate-200) in Phase 15.** `--color-border-input` is preserved as an alias for semantic clarity in input components.

**Why trend tokens duplicate ai- hexes:** AI gaps semantics (`addition`/`replace`/`removal`) are about diff direction in an article; analytics trend tokens are about a metric going up or down. Same hex, distinct semantic — don't conflate the two in component code.

**Phase 15 foundation consolidation:**

- slate-500 typo fixed across 107 lines → `#64748b`
- card-border family unified to `#e2e8f0` (was `#e5e5e5`): `--color-card-border`, `--color-card-divider`, `--color-border-input`
- new tokens: `--color-border-faint` (`#cbd5e1`), `--color-success-wash-subtle` (`#f2fcf6`)
- `--color-text-faint` dropped as duplicate of `--color-text-muted`; components migrated to token classes (`text-text-primary`, `bg-canvas`, `border-card-border`, etc.) — minimal raw inline hex remains in `packages/kb-ui/src/components/**/*.tsx`

### Typography (all Inter)


| Token             | Size | Weight       | Line Height |
| ----------------- | ---- | ------------ | ----------- |
| `heading/lg`      | 24px | 600 SemiBold | 32px        |
| `heading/md`      | 20px | 600 SemiBold | 28px        |
| `body/lg`         | 16px | 400 Regular  | 24px        |
| `body/sm/medium`  | 14px | 500 Medium   | 20px        |
| `body/sm/regular` | 14px | 400 Regular  | 20px        |
| `body/xs`         | 12px | 500 Medium   | 18px        |
| `body/xs/regular` | 12px | 400 Regular  | 18px        |


### Spacing & Layout

```
Canvas width:     1280px
Chrome height:    85px (tab bar + nav bar)
Rail width:       54px
Tree nav width:   288px
Content width:    938px
Editor card:      720px
Settings panel:   452px
```

### Border Radius


| Token          | Value | Used on                    |
| -------------- | ----- | -------------------------- |
| `r-card`       | 12px  | cards, panels, editor card |
| `r-button`     | 6px   | buttons, icon buttons      |
| `r-input`      | 8px   | text inputs, dropdowns     |
| `r-pill`       | 999px | status badges, pills       |
| `r-breadcrumb` | 4px   | breadcrumb items           |


### Shadows

```css
/* shadow-md — settings panel */
box-shadow: 0px 4px 6px -1px rgba(0,0,0,0.05), 0px 2px 4px -2px rgba(0,0,0,0.10);

/* shadow-lg — editor card */
box-shadow: 0px 8px 12px -4px rgba(0,0,0,0.05), 0px 4px 6px -2px rgba(0,0,0,0.10);
```

---

## Component Specs (from Figma screen analysis)

### Rail Nav (54px wide)

- Logo slot: 54×54, icon centered, 1px separator below
- Nav icon items: 54×36, icon only, centered
- Bottom: Avatar 54×36
- Background: white

### Tree Nav (288px wide)

- Header: 288×54 — "Editor" text (16px semibold) + search icon button (28px, r:4) at right, 24px h-padding
- Separator: 1px full-width
- Nav row (`.menu-items`): 284×36 — chevron (24px) + folder icon (24px) + label + count badge + add/more icons
- Row stacking: 36px row + 2px gap = 38px stride
- Subfolder rows: same structure, indented

### Breadcrumb Bar (1280×54)

- Height: 54px, white bg, sticky
- Left: collapse-left icon (14px) → slash (14px) → text items (14px regular, color text-meta) → slash → current item (14px medium, bg surface-subtle, r:4)
- Right (editor only): "Save as draft" button + "Publish" button (with icon) + trash icon button (32×32, r:6, bg surface-muted)

### Category Header

- Icon (24px branded) + Title (24px semibold) + subtitle (14px regular, text-meta)
- `+ New` button: black bg, white text, 14px medium, r:6, px:12 py:6

### Sub-categories Table

> Authoritative spec: `design/table.md` (live Figma tokens). This section summarises.

- **Outer container**: padding 4 TB / 24 LR; sibling gap 16.
- **Table frame**: radius 8, 1px inside border `#e5e5e5`.
- **Heading row**: 48px tall; bg `#f5f5f5` (`background/canvas/default` — **2026-04-21 revert of the 2026-04-20 white-bg change; user confirmed grey is correct**); padding 0 TB / 16 LR (heading-label left edge aligned with body-row icon's left edge); 1px `#e5e5e5` bottom divider to separate from body; text Inter Medium 14/20 `#475569` (case preserved — no uppercase).
- **Body row**: 48px tall; padding 6 TB / 16 LR; 1px inside row-divider `#e5e5e5` (hidden on last row); label Inter Regular 14/20 `#0f172a`; 24×24 ghost button holding 16px folder glyph; 4px icon↔label gap.

### Articles Table (5-col)

Same outer container + table frame + heading/body row rules as Sub-categories. Columns:


| Col          | Width | Content                                                     |
| ------------ | ----- | ----------------------------------------------------------- |
| Articles     | flex  | 24×24 ghost button (doc icon) + title                       |
| Actions      | 48    | centered 24×24 ghost button (ellipsis)                      |
| Status       | 127   | `Tag` pill (see `design/tag.md`); cell padding 6 TB / 20 LR |
| Author       | 94    | Avatar 24×24                                                |
| Last Updated | 251   | text 14/20 `#64748b`                                        |


Heading-row "Actions" column hides its "Link" label but preserves padding. All rows 48px tall.

### SideNavRail (54px wide — from library-check `0:1`)

**Dark theme (default):**

- Background: `#1e1e1e` or near-black (~`#1a1a1a`)
- Width: 54px, full viewport height
- Top: Hiver brand logo icon, 54×54, centered
- 1px separator below logo
- Nav items: 54×40px each — icon only, centered, `text-white/60`
- Active item: icon bg highlight `#2a2a2a` or `rgba(255,255,255,0.1)`, icon `text-white`
- Icons (top to bottom): AI/star icon, Editor/pen icon (active), folder icon, settings gear icon
- Bottom: Avatar circle (24px, gray, initials "A")

**Light theme variant:**

- Background: white
- Nav items: icon `text-[#64748b]`
- Active: bg `#f1f5f9`, icon `text-[#0f172a]`

### FileExplorerNav (288px wide in page context — Figma node `206:6837` in `251DTRmxl2L6jmXd3FWzHe`)

**Width:** `288px` in page context (`1958:33209`). The standalone component frame (`206:6837`) renders at 340px — use 288px for the actual product layout.

**Source of truth for structure: `206:6837`**; **source of truth for width: `1958:33209`**.

**Data model:** `NavItem` (unified — articles can appear at any depth 0-3):

```ts
type NavItem = { id, title, type: 'folder'|'article', status?, count?, children? }
```

**Width: 340px. Row height: 36px.**

**Header (48px):**

- Left: `RiPencilLine` (16px, `#64748b`) + "Editor" (14px semibold, `#0f172a`)
- Right: `RiSearchLine` search button
- 1px border-bottom

**Indentation system (content left-padding inside inner container):**


| Depth    | Outer padding              | Content pl  |
| -------- | -------------------------- | ----------- |
| 0 (root) | `px-[12px] py-0`           | 0           |
| 1        | `pl-[16px] pr-[12px] py-0` | `pl-[20px]` |
| 2        | same                       | `pl-[44px]` |
| 3        | same                       | `pl-[68px]` |


**Folder row:** Chevron (`RiArrowRightSLine`/`RiArrowDownSLine`) + `RiFolderLine` + label (14px) + count (right, 14px, `#475569`). On hover: count replaced by `RiMore2Line`.

**Article row:** 6px bullet dot (no chevron) + `RiArticleLine` + label (14px) + status dot (right, `#22c55e` published / `#94a3b8` draft). On hover: status dot replaced by `RiMore2Line`.

**State backgrounds (light):**

- default: transparent
- hover: `rgba(230,230,230,0.32)`
- active: `rgba(230,230,230,0.44)`
- active-sub: transparent (expanded ancestor of active, no bg)

**Dark:** hover `white/[0.05]`, active `white/[0.08]`

**Behavior:** Collapsed by default; auto-expands ancestors of `activeId`. Clicking folder toggles + fires `onItemClick`.

### Breadcrumb (from library-check `1:5389`)

- Height: 32px pill (not full-width bar)
- Items: text `14px regular`, color `#475569`
- Current item: text `14px medium`, bg `#f8fafc`, r:4, px:8 py:1
- Separator: `ChevronRight` icon, 12px, color `#cbd5e1`
- First item: collapse-left `ChevronsLeft` or `ChevronLeft` icon (14px)
- Example: `⟨ Getting Started ›`

### Table (from library-check `1:5178`)

> Authoritative spec: `design/table.md`. The entry below is a legacy summary kept for screen-level context — it predates the 2026-04-20 heading-bg and alignment fix. See the "Sub-categories Table" / "Articles Table" sections above for the current canonical summary.

**Sub-categories section:**

- White card, r:8, border `#e5e5e5`
- Header row 48px (bg `#ffffff`, 1px `#e5e5e5` bottom divider): "Sub-categories" (14px medium, `#475569`), left edge aligned with body-row icon
- Data row 48px: folder icon (16px, `#64748b`) + label (14px regular, `#0f172a`), 16px left padding

**Articles section:**

- White card, r:8, border `#e5e5e5`
- Column headers (48px, 14px medium `#475569`, bg `#ffffff`, 1px `#e5e5e5` bottom divider): Articles | (actions) | Status | Author | Last Updated
- Data row (48px): 
  - Articles col: document icon + title (14px regular, `#0f172a`)
  - Actions col: `MoreHorizontal` icon (kebab), 24px, `#64748b`
  - Status col: StatusBadge pill (published=green dot + "Published", draft=gray + "Draft")
  - Author col: Avatar 24px circle
  - Last Updated col: date text (14px regular, `#64748b`)

### PageHeader (from library-check `1:5452`)

- Layout: horizontal flex, align items center, space-between
- Left: icon (24px, branded color) + Title (24px semibold, `#0f172a`) + subtitle (14px regular, `#64748b`) — vertical stack or horizontal with gap
- Right: `+ New` Button — variant `primary` (black bg), icon `Plus` (14px), text "New article"
- Full-width, no card bg (lives on canvas `#f5f5f5`)

---

### Primitive Fixes Required (from Playwright gap analysis)


| Component             | Issue                                   | Fix                                                                      |
| --------------------- | --------------------------------------- | ------------------------------------------------------------------------ |
| Badge (draft/neutral) | Pill invisible on white background      | Add `border border-[#e2e8f0]` to draft + neutral variants                |
| Badge (published)     | `CheckCircle2` icon doesn't match Figma | Replace with `<span className="size-[6px] rounded-full bg-[#22c55e]" />` |


---

### Editor Card (720px)

- White, r:12, p:40, shadow-lg, border
- Title: 24px semibold, `#0f172a`
- Body text: 16px regular, 24px line-height
- Section headings: 20px semibold
- Lists: 16px, `padding-left: 24px`
- AI highlight strips: `#e7f9ee` bg, 24px height

### Settings Panel (452px)

- White, r:12, px:22 py:24, gap:20, shadow-md, border
- Header: gear icon (16px) + "Settings" label (14px medium) + chevron-up (16px)
- Divider: 1px
- Dropdown field = label (14px medium, 20px tall) + input (40px, r:8, border #e5e5e5)
  - Author: avatar prefix + name + chevron suffix
  - Category: text + chevron suffix
  - Article Slug: text + chevron + char counter (12px, text-faint, right-aligned)

---

---

## Phase 6 spec pointer

See `**design/ai-gaps.md`** for the full AI Gaps / AI Optimise specification covering:

- Figma node IDs for every surface
- Component inventory + file paths
- Shared TypeScript types (`AISuggestion`, `AISuggestionDecision`, etc.)
- Color tokens for highlight blocks (addition / replace / removal)
- State machine (`useAIGapsReducer`) contract
- Scroll behavior (inside `<main>`, not window)
- Keyboard shortcut matrix
- Story inventory (9 new stories across Components + Patterns)
- Open product decisions

---

## AppShell backgrounds (2026-04-21)

Per user clarification: the `--color-canvas` `#f5f5f5` token is a *page-background* concept; in the live AppShell composition the right-hand **content column** (which wraps the breadcrumb bar + main content) is painted `#ffffff` (`background/canvas/white`). The shell root retains `bg-[#f5f5f5]` for defensive purposes, but with the content column now filling the right portion, the `#f5f5f5` canvas is never visible in practice. Rail (light theme) and FileExplorerNav already paint white. Net result: the entire shell is `#ffffff` end-to-end.

Invariant: `[data-kb-part="shell-content-column"]` MUST have `bg-white` (or equivalent `#ffffff`). See `design/_layout-invariants.md` → "Column backgrounds" table.