# AI Suggestions — Review Flow

**Source:** Figma `library-check` · node `81:14751` (section: *editor via AI Suggestions*)
**Reference experience:** Grammarly's document-review loop — open a doc, see inline issues, cycle through them, accept/reject one-by-one, end in a clean "all reviewed" state.

The flow has **10 frames** laid out left → right along the section. Annotations between each frame describe the transition trigger.

---

## Frame Map

| # | Node ID | Name | Annotation leading in |
|---|---------|------|-----------------------|
| 1 | `81:15392` | `ai-optimise-01` | *(entry)* |
| 2 | `81:17189` | `ai-article-02` | "click on card will open that particular article with gaps ui" |
| 3 | `81:16926` | `ai-article-03` | "will scroll to first sugesstion" |
| 4 | `81:17484` | `side-sheet`    | "sources side-sheet" |
| 5 | `81:16634` | `ai-article-04` | "closes the side-sheet" |
| 6 | `81:16342` | `ai-article-05` | "will scroll to next suggestion" |
| 7 | `81:16040` | `ai-article-06` | "will scroll to next suggestion" |
| 8 | `81:15737` | `ai-article-07` | "will scroll to next suggestion" |
| 9 | `81:15088` | `ai-article-08` | "accepted" |
| 10 | `81:14752` | `ai-article-09` | "will scroll to top once the last suggestion is acted upon" |

---

## 1. `ai-optimise-01` — AI Optimise Hub (Entry)

The landing screen. Lists all AI-generated improvement suggestions across the KB.

### Layout

The hub page has **three columns** — the 54 px app rail, the 288 px AI section sub-rail, and the main canvas. (Amended 2026-04-21 after Figma verification: the rail and sub-rail are distinct components, not a single "nav rail" — see nodes `74:8794` and `74:8871`.)

- **App rail (54 px, dark theme, Figma `74:8794`):** Hiver logo top, 3 icon buttons (AI — currently active with the pink sparkle glyph — pen/editor, settings gear), user avatar pinned bottom. App-level navigation only — these icons switch between Hiver products.
- **AI sub-rail (288 px, light theme, Figma `74:8871`):** Two rows — `AI Centre` (section header; 1 px `#e2e8f0` divider below) + `AI Optimise` (item, active, pill bg `#f1f5f9`). Section-level navigation within the AI surface.
- **Main canvas:** breadcrumb-style header (54 px) with a collapse-rail icon + "AI Optimise" pill. Page title **AI Optimise** (24/600), subtitle *"AI-powered suggestions to improve your Knowledge Base and support operations."* (14/400, text-meta).

### Suggestion Cards

Card structure (Figma `74:8927`):
- **Title row:** doc icon (pink `#D92FFF`) + title (14/600, `#0f172a`).
- **Description line:** 14/400, `#64748b` — one-line summary of the proposed change.
- **Horizontal rule** (1 px `#e5e5e5`, full card-content width) — separates description from meta. (Amended 2026-04-21 after Figma verification — was not documented in v1 of this flow doc.)
- **Meta row** — three items separated by `·`:
  - **Kind chip:** `✏️ Article Edit` (modify existing), `📖 New Article` (create from scratch), `📁 Billing › Reimbursements` (move-article — `pathFrom › pathTo` replaces the kind label).
  - **Conversation count:** `📨 12 Conversations` — number of support tickets that triggered the suggestion.
  - **Impact badge:** `HIGH IMPACT`, `MEDIUM IMPACT`, `LOW IMPACT` — uppercase 12/500 caption (no pill/border — pure text treatment).

Cards fade towards the bottom of the viewport, implying the list is scrollable. Implemented as a CSS `mask-image: linear-gradient(to bottom, black 70%, transparent)` on the list container — NOT a per-card faded prop.

### Expected actions
| Element | Action |
|---------|--------|
| Card body (click anywhere) | Opens that article in **gap-edit mode** (frame 2). Annotation: *"click on card will open that particular article with gaps ui"* |
| Conversation count (`📨 N Conversations`) | Likely opens the Sources side-sheet scoped to that suggestion (same sheet as frame 4), *without* entering the article. |
| Impact badge | Presumably a filter affordance or tooltip explaining scoring. Static in this flow. |
| Type chip | Filter affordance (no interaction shown). |
| Rail: `AI Centre` | Navigates to a parent dashboard (not in this flow). |
| Rail collapse icon (top of canvas) | Collapses the sub-rail to give the canvas more width. |

---

## 2. `ai-article-02` — Article Opens in Gap-Edit Mode

Clicking a card swaps the app shell for an **editor chrome** and loads the selected article with inline AI markup.

### Top bar (replaces the default app nav)
Left → right:
- 🏠 Home icon — exits editor, returns to KB root (or to AI Optimise hub).
- **Breadcrumb trail** — category path of the article, each segment clickable (`Getting Started / Integrating Hiver in Slack / Hiver in Incognito / How to reset your Password`). The last segment is the current article title, non-clickable.
- **`Save as draft`** (text link, disabled grey) — persists current review state without publishing. Disabled until at least one suggestion has been acted upon.
- **`🏷 Publish`** (outlined button, disabled) — publishes the edits. Disabled until there is at least one accepted change *(compare frame 2 vs 4 — activates after first accept)*.
- **`×`** — close the editor and return to the hub. Presumably prompts to save/discard if there are unsaved changes.

### Main column (article body)
Standard article render: H1 title, "Last updated N months ago" subtitle, intro paragraph, H2 section headings, numbered/bulleted lists. In this frame the body is scrolled to the top; **no suggestion is in view yet**, but the first suggestion marker (the H2 "Resetting Your Password via Mobile App") already shows a faint green highlight further down — the diff layer is rendered even before the user jumps to it.

### Right rail — two stacked cards
**Card A — `Settings` (collapsed)**
- Gear icon · label · chevron ▼ on the right.
- Collapsible; expanding presumably exposes article metadata (slug, category, tags, SEO description, permissions).

**Card B — `AI Suggestions` (pre-review state)**
- ✨ icon + title "AI Suggestions".
- Summary paragraph: *"Refining the article with updated instruction set, updating link and by removing legacy instructions"* — an AI-written overview of what the full review will do.
- **`▲` / `▼` arrows** — prev/next navigator. Pre-review they step to the first suggestion.
- **`Review Suggestions (3)`** — primary CTA (solid dark pill). Clicking it opens the first suggestion and scrolls the body to it → frame 3.

### Expected actions
| Element | Action |
|---------|--------|
| Body text | Plain-text editor? (no editing shown; the "gaps UI" refers to the diff overlays, not WYSIWYG edits.) |
| Home icon | Return to KB home. |
| Breadcrumb segment | Navigate to that category in the KB. |
| `Save as draft` | Save state, stay in editor. |
| `Publish` | Commit accepted changes and exit editor. |
| `×` | Close editor, confirm-discard if dirty. |
| Settings ▼ | Expand/collapse metadata panel. |
| `▲`/`▼` | Cycle to prev/next suggestion (scrolls body). |
| `Review Suggestions (N)` | Activate review mode; open first suggestion card. |

---

## 3. `ai-article-03` — First Suggestion Active (Addition)

The page auto-scrolls to the first suggestion, the right-rail card morphs into the **active-suggestion card**, and the next suggestion is stacked below it.

### Inline markup (body)
The section `Resetting Your Password via Mobile App` and its full 6-step numbered list are rendered with a **solid green background block** — this is the **Addition** preview: the content does not yet exist in the article, and the AI is proposing to insert it.

### Right rail — active card (Addition)
Structure of the active suggestion card (same layout for all three types):
1. **Type header**: colored icon + label.
   - Addition → `+ Addition` (green)
   - Replace → `↻ Replace` (blue)
   - Removal → `× Removal` (red)
2. **Title**: short label describing the change (e.g. "Mobile app password reset instructions").
3. **Description**: one-sentence rationale ("Add detailed mobile app password reset instructions with proper steps and bullet points").
4. **Footer row (split, left + right groups):**
   - Left: `▲` / `▼` — prev/next suggestion navigator.
   - Right: `📄 4 Sources` (text + icon, clickable) · `×` (red circle — reject) · `✓` (dark circle — accept).

### Stacked next suggestion (below active)
A preview of suggestion #2 — type header `↻ Replace`, title *"Update outdated URL"*, description *"Removing old link and adding new"* — rendered in a dimmer card. Preview only; becomes active when user advances.

### Expected actions
| Element | Action |
|---------|--------|
| `▲` | Go to previous suggestion (scrolls body + swaps card). |
| `▼` | Go to next suggestion. |
| `📄 N Sources` | Opens the **Sources side-sheet** (frame 4) listing the support conversations that motivated this suggestion. Annotation: *"sources side-sheet"* |
| `×` (red) | **Reject/dismiss** this suggestion. The inline green block disappears, rail collapses to a dismissed chip (presumably `+ Addition DISMISSED` + undo — symmetric to the ACCEPTED chip in later frames). Advances to next suggestion. |
| `✓` (dark) | **Accept** this suggestion. Inline highlight removes, body text stays, rail collapses to `+ Addition ACCEPTED` chip (frame 4 demonstrates for the Replace variant; logic is identical). Advances to next. |
| Preview of next suggestion | Clicking scrolls to that suggestion and makes it active. |

---

## 4. `side-sheet` — Sources Panel

Triggered by clicking `N Sources` on any suggestion. A right-docked sheet slides in over a dimmed backdrop (the underlying article is masked dark grey).

### Layout
- **Header:** `Sources` + count badge (e.g. `4`) · `×` close icon.
- **List of conversation cards.** Each card:
  - Mail icon + sender name (bold)
  - Timestamp (right-aligned, e.g. `Feb 4, 2:45 PM`)
  - Subject line (one line, bold-ish)
  - Preview snippet (muted, truncated with ellipsis)
- Example rows shown: Ava Johnson, Sophie Lee, Emma Garcia, Emma Johnson — all about login / syncing issues, which grounds why the AI wrote mobile-reset instructions.

### Expected actions
| Element | Action |
|---------|--------|
| `×` | Closes the sheet, returns focus to the editor. Annotation for next frame: *"closes the side-sheet"* |
| Card click | Presumably opens the full support conversation in Hiver (either deep-link into Hiver's conversation view in a new tab, or a secondary sheet). |
| Backdrop click | Standard sheet behavior — dismiss. |
| Keyboard `Esc` | Dismiss. |

---

## 5. `ai-article-04` — First Suggestion Accepted

State after clicking `✓` on the Addition from frame 3.

### What changed
- **Inline:** the green "Addition" block becomes plain body text — the content is now part of the article in its accepted form (mobile-app steps rendered normally, no green overlay).
- **Top bar:** the `Publish` button is now **active** (solid dark pill) — the article has at least one accepted change.
- **Right rail top card:** the active Addition card is replaced by a **collapsed accepted chip**:
  - Type icon + label: `+ Addition` (green)
  - Status pill: `ACCEPTED` (grey uppercase)
  - **Undo arrow `↶`** on the far right — reverts the accept, restoring the suggestion to active state.
- **Right rail second card:** suggestion #2 (`↻ Replace — Update outdated URL`) is now the active card with full controls, and a new stacked preview below it could appear (not visible in this frame because it's showing a mid-scroll position).

### Scroll behavior
Page auto-advances to bring suggestion #2 into view (annotation: *"will scroll to next suggestion"*). The replace suggestion shows in the body as a two-block diff — see next frame.

### Expected actions
| Element | Action |
|---------|--------|
| Accepted chip — `↶` undo | Revert the accept; suggestion returns to active state with green inline block restored. |
| `Publish` (now active) | Publish accepted changes. |
| All other controls | Same as frame 2/3. |

*Symmetric rejected state (Figma-confirmed `74:9431`, amended 2026-04-21):* chip reads `+ Addition DISMISSED` with the same undo arrow `↶`. Visual treatment identical to ACCEPTED — same card shape, same undo affordance, only the pill text changes. Undo restores the suggestion to active state for re-decision.

---

## 6. `ai-article-05` — Second Suggestion Active (Replace)

The Replace type renders as a **side-by-side inline diff** in the body: old text and new text stacked, both highlighted.

### Inline markup
- **Red-highlighted block (old):** *"Navigate to the admin panel at **admin.hiver.com/legacy/users** and select the user whose password needs to be reset."*
- **Green-highlighted block (new):** *"Navigate to the admin panel at **admin.hiver.com/settings/users** and select the user whose password needs to be reset. You can also use the search bar to quickly find users by name or email."*

The two blocks are stacked vertically, both rendered in full (no strikethrough — the color is sufficient signal). Accepting swaps them (red disappears, green becomes plain text, frame 6). Rejecting would do the inverse (green disappears, red stays as plain text).

### Right rail
Same active-suggestion card pattern:
- Type header `↻ Replace` (blue)
- Title: *"Update outdated URL"*
- Description: *"Removing old link and adding new"*
- Footer: `▲▼` · `📄 4 Sources` · `×` · `✓`

Above this card: the previously-accepted Addition chip persists (frame implicitly — scroll position may hide it).

---

## 7. `ai-article-06` — Second Suggestion Accepted

Replace is applied: red block is gone, the green block becomes plain text (`admin.hiver.com/settings/users` version remains). Right rail shows the collapsed `↻ Replace ACCEPTED` chip with undo. Page auto-scrolls to the third suggestion, which is already visible below — the `Troubleshooting` heading and `Resetting via Chrome Extension` subsection are rendered with **red highlights**, previewing a Removal.

---

## 8. `ai-article-07` — Third Suggestion Active (Removal)

### Inline markup
All content to be removed is rendered with red-tinted backgrounds:
- H2 "Troubleshooting"
- H3 "Resetting via Chrome Extension"
- The paragraph describing the Chrome-extension reset steps

### Right rail
Active card:
- Type header `× Removal` (red)
- Title: *"Legacy Instructions"*
- Description: *"Remove outdated reference to the old Chrome extension reset flow and steps"*
- Footer controls identical: `▲▼` · `📄 4 Sources` · `×` · `✓`

### Accept/Reject semantics for Removal
- **`✓` accept** → the red blocks disappear entirely; article shortens. Rail collapses to `× Removal ACCEPTED` chip.
- **`×` reject** → red highlight removes but the content stays in the article as plain text (i.e. the AI's removal proposal is declined and the existing text is kept).

---

## 9. `ai-article-08` — Third Suggestion Accepted

The Troubleshooting section and Chrome Extension subsection are **gone**. Article now ends at the Password Requirements bullet list. Right rail shows `× Removal ACCEPTED` chip. Annotation: *"accepted"* — this is the last of the three suggestions.

---

## 10. `ai-article-09` — All Reviewed (Terminal State)

### Auto-scroll
Page scrolls back to the **top** of the article once the last suggestion is actioned (annotation: *"will scroll to top once the last suggestion is acted upon"*). Same scroll position as frame 2.

### Right rail — terminal summary card
The top rail card morphs from "AI Suggestions" into a review-complete summary:
- ✨ icon + title **"Suggestions"** with count badge `3` (small rounded badge).
- Summary paragraph — retained, same copy as pre-review.
- Footer row:
  - Left: `▲` / `▼` arrows — still functional; cycle back through the accepted chips so the user can review or undo any decision.
  - Right: `✓ Reviewed All` — disabled pill (muted grey), replaces the `Review Suggestions (N)` CTA. Signals completion.

### Expected actions
| Element | Action |
|---------|--------|
| `▲` / `▼` | Navigate back through any suggestion — shows its accepted/dismissed chip in the rail. From there the user can undo via the chip's `↶`. |
| `Publish` (top bar) | Still active. Publishes the article. |
| `Save as draft` | Still active. Saves state for later review. |
| `×` close | Exit to AI Optimise hub. That suggestion card on the hub presumably disappears (or is marked complete) once the article is published. |

---

## Cross-cutting Patterns

### Suggestion types — inline treatment
| Type | Icon | Color | Body treatment | Accept | Reject |
|------|------|-------|----------------|--------|--------|
| Addition | `+` | Green | Green block containing the proposed insert | Block becomes plain text (content kept) | Block is removed (content never added) |
| Replace | `↻` | Blue (card) / Red+Green (body) | Red block (old) + Green block (new), stacked | Red removed, green becomes plain | Green removed, red becomes plain |
| Removal | `×` | Red | Red block over existing content | Block removed (content deleted) | Highlight clears, content stays |

### Card states in the rail
```
Pre-review:   ✨ AI Suggestions | summary | ▲▼ | [ Review Suggestions (N) ]
Active:       [TYPE] | title | description | ▲▼ | 📄 N Sources · × · ✓
Accepted:     [TYPE] ACCEPTED                                        ↶
Dismissed:    [TYPE] DISMISSED                                       ↶   (inferred)
Terminal:     ✨ Suggestions [N] | summary | ▲▼ | ✓ Reviewed All (disabled)
```

### Navigation behavior
- `▲`/`▼` arrows are always present and always both scroll the body and swap the active rail card.
- After accept/reject, the flow **auto-advances** to the next unreviewed suggestion. It does not stop; the user opts out by pressing `×` top-right.
- When the last suggestion is handled, the page auto-scrolls back to the top and the rail swaps to the terminal card.

### Publish gating
- `Publish` is disabled in frame 2 (no decisions made).
- It activates from frame 4 onward (first accept).
- It presumably remains active as long as there is at least one accepted change; if the user undoes every decision back to zero, it should return to disabled (not demonstrated but implied).

### Editor chrome vs app shell
Entering gap-edit mode swaps the left app rail for a centered breadcrumb header, and introduces the `Save as draft` / `Publish` / `×` controls. Exiting via `×` restores the hub app shell.

---

## Interaction Questions Worth Resolving Before Build

1. **Dismissed state visuals** — confirm the chip copy and color for rejected suggestions (symmetric to ACCEPTED or distinct?).
2. **Undo after publish** — once the article is published, does `↶` still work, or is it consumed?
3. **Sources card click** — does it open the full conversation in a modal, a secondary sheet, or deep-link out to Hiver's inbox?
4. **Hub card — what happens after publish** — does the suggestion card disappear, fade to "completed", or refresh with new AI suggestions?
5. **Keyboard navigation** — presumably `J`/`K` or `↓`/`↑` to step through suggestions, `Y`/`N` or `Enter` to accept, `Esc` to close sheets. Worth confirming with design before wiring.
6. **Scroll container** — is the body scroll on `window` or on an inner div? Affects how "scroll to suggestion" is implemented.
7. **Settings card contents** — metadata fields are not shown; need a separate spec before building.
8. **Empty state on hub** — what does the hub show when there are no AI suggestions (first-run, or after all have been processed)?
