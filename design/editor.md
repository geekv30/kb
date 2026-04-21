# design/editor.md — ContentEditor spec

**Source of truth:** Figma `53:2301` (editor card) and `50:7076` (editor content area) in library-check file `9aGp5t9fH1d0PXi4LMhOdb`. Authored 2026-04-21 alongside Phase 5 step 1 build.

## Editor Card

| Property | Value | Token |
|---|---|---|
| Width | `720px` | `--layout-editor-card` (implicit) |
| Background | `#ffffff` | `background/canvas/white` |
| Border | `1px solid #e2e8f0` | `border/slate_blue/subtle` |
| Border radius | `12px` | `scale/radius/xl` |
| Padding | `40px` (all sides) | `scale/space/5xl` |
| Shadow | `0px 8px 12px -4px rgba(0,0,0,0.05), 0px 4px 6px -2px rgba(0,0,0,0.10)` | `shadows/lg` |

## Typography (Inter, applied inside `.kb-editor-prose`)

| Element | Size / Line-height / Weight | Color |
|---|---|---|
| H1 | 24 / 32 / 600 | `#0f172a` |
| H2 | 20 / 28 / 600 | `#0f172a` |
| H3 | 18 / 28 / 600 | `#0f172a` |
| Body / paragraph | 16 / 24 / 400 | `#0f172a` |
| List item | 16 / 24 / 400 | `#0f172a` (padding-left 24) |
| Blockquote | 16 / 24 / 400 italic | `#475569`, left border 3px `#e2e8f0` |
| Inline code | 14 monospace | `#0f172a` on `#f1f5f9`, 6/2 padding, r=4 |
| Code block | 14 / 20 / 400 monospace | `#e2e8f0` on `#0f172a`, padding 16, r=8 |
| Table cell | 14 / 20 / 400 | `#0f172a`, 1px `#e5e5e5` border, 8/12 padding |
| Table header | 14 / 20 / 600 | `#0f172a` on `#f8fafc` |
| Link | 16 underlined | `#2563eb` (hover `#1d4ed8`) |

## Toolbar (ref: Figma `53:2386`)

### Surface — floating / inline (2026-04-21)

The toolbar no longer sits statically at the top of the editor card. It is a floating affordance that appears **wherever the user is typing**, implemented with Tiptap's two built-in menus:

| Menu | Trigger | Placement | Extension |
|---|---|---|---|
| `BubbleMenu` | Non-empty text selection | `top`, offset 8 (above selection) | `@tiptap/react/menus` (v3.22.4) |
| `FloatingMenu` | Cursor on an empty line (block) | `right`, offset 8 (next to block) | `@tiptap/react/menus` (v3.22.4) |

Both menus render the **same** `ContentEditorToolbar` component, so the button set is identical whether the user is selecting text or about to write on an empty line. Both are appended to `document.body` via `appendTo={() => document.body}` so the editor card's `overflow`/`border-radius` cannot clip them.

Import: `import { BubbleMenu, FloatingMenu } from '@tiptap/react/menus'`.

### Visual

The toolbar is an `inline-flex w-max` row so its width equals the **sum of its children** — NOT the editor card width. Measured at 1440×900 on `--interactive` story: 400 px wide, which matches `padding (8) + 12 buttons (288) + 1 paragraph dropdown (34) + 4 dividers with mx-1 margins (36) + 16 gaps × 2 (32) ≈ 398` content-box (+2 px border).

| Property | Value | Token |
|---|---|---|
| Background | `#ffffff` | `background/canvas/white` |
| Border | `1px #e2e8f0` | `border/slate_blue/subtle` |
| Radius | `8px` | `scale/radius/lg` |
| Padding | `4px` all sides (p-1) | tight |
| Shadow | `shadow-md` (Tailwind) | — |
| Layout | `inline-flex w-max items-center gap-0.5` | single row, 2 px between items |

Each toolbar button: `24×24, r=6, 14px icon`.
- **Inactive:** transparent bg, icon `#475569`.
- **Hover:** bg `#f8fafc`, icon `#0f172a`.
- **Active:** bg `#f8fafc`, icon `#0f172a`, `aria-pressed="true"`.
- **Disabled:** 40% opacity, no hover.

Dividers: 1px × 16px, `#e2e8f0`, 4px horizontal margin.

### Render order (as implemented, matches Figma with documented deviations)

| Slot | Tool | Icon | Figma match |
|---|---|---|---|
| 1 | Text style dropdown (Normal / H1 / H2 / H3) | Text `N` / `H1` etc + `RiArrowDownSLine` | ✅ Figma slot 1 (`N ▼`) |
| — | *(Serif font-family dropdown — Figma slot 2)* | — | ✋ Omitted (not in v1 feature scope) |
| 2 | Bold | `RiBold` | ✅ Figma slot 3 |
| 3 | Italic | `RiItalic` | ✅ Figma slot 4 |
| 4 | Underline | `RiUnderline` | ✅ Figma slot 5 |
| — | *(Text color `T` — Figma slot 6)* | — | ✋ Omitted (not in v1 feature scope) |
| 5 | Strikethrough | `RiStrikethrough` | ✅ Figma slot 7 |
| 6 | Bullet list | `RiListUnordered` | ✅ Figma slot 8 |
| 7 | Numbered list | `RiListOrdered` | ✅ Figma slot 9 |
| 8 | Link | `RiLinkM` | ✅ Figma slot 10 |
| 9 | Inline code | `RiCodeLine` | ✅ Figma slot 11 |
| 10 | Code block | `RiCodeBoxLine` | ✅ Figma slot 12 |
| 11 | Table (insert 3×3) | `RiTable2` | ✅ Figma slot 13 |
| — | *(Undo — Figma slot 14)* | — | ✋ Dropped from floating toolbar (2026-04-21); keyboard ⌘Z remains |
| — | *(Redo — Figma slot 15)* | — | ✋ Dropped from floating toolbar (2026-04-21); keyboard ⌘⇧Z remains |
| 12 | **AI highlight** (toggle) | `RiSparkling2Line` | ➕ Replaces Figma's 3 trailing duplicate icons (slots 16-18) |
| 13 | **More** (blockquote, hr, image) | `RiMore2Line` | ➕ Overflow for spec-required features absent from Figma toolbar |

### Undo/Redo decision (2026-04-21)

Undo and Redo are **omitted** from the floating toolbar. They do not describe the state under the cursor (unlike Bold/Italic/H1/list), so they add noise to an affordance whose job is to format the current selection. The keyboard shortcuts (⌘Z / ⌘⇧Z on macOS, Ctrl-Z / Ctrl-Shift-Z elsewhere) are the canonical affordance and remain wired up via StarterKit's History extension. If a future review demands visible undo/redo, a page-level surface (e.g., the breadcrumb bar) is the correct home — not the inline menu.

### Deviations from Figma — decision record

The Figma toolbar shows `Serif` (font-family dropdown) and `T` (text color) — these are **not** in v1 feature scope per the task spec and are intentionally omitted. Reintroduce when a dedicated font-family or color-picker feature lands.

Figma's trailing 3 icons (slots 16-18 in the Font frame) visually repeat earlier icons (strikethrough, align, bullet list); these read as design placeholders. They are replaced with (a) an AI-highlight toggle (required by spec) and (b) an overflow menu (holds spec-required blockquote, horizontal rule, image).

## AI highlight

Implemented via `@tiptap/extension-highlight` configured with `multicolor: true`. Applying it sets a `<mark data-color="ai">` around the selection; styling renders `#e7f9ee` bg with `#0f172a` text at 24px line-height (so a single-line selection becomes a ~24px-tall strip per spec).

Trigger via the sparkle button in the toolbar; untoggle by clicking again with the selection inside.

## Tiptap extension set

| Extension | Source | Notes |
|---|---|---|
| `StarterKit` | `@tiptap/starter-kit@3.22.4` | `codeBlock: false, link: false` (use our own) |
| `Link` | `@tiptap/extension-link@3.22.4` | `openOnClick: false`, `target=_blank` |
| `Image` | `@tiptap/extension-image@3.22.4` | URL insert only (upload out of scope v1) |
| `CodeBlockLowlight` | `@tiptap/extension-code-block-lowlight@3.22.4` | `lowlight.createLowlight(common)` |
| `Table` / `TableRow` / `TableHeader` / `TableCell` | `@tiptap/extension-table*@3.22.4` | `resizable: false`; 3×3 default |
| `Highlight` | `@tiptap/extension-highlight@3.22.4` | `multicolor: true`, used for AI highlight |
| `Placeholder` | `@tiptap/extension-placeholder@3.22.4` | empty-state text |
| `lowlight` | `lowlight@3.3.0` | `createLowlight(common)` for code-block highlighting |

StarterKit v3 already includes Underline, Blockquote, HorizontalRule, Strike, Heading, OrderedList, BulletList, Code, History — so no separate packages needed for those.

## API

```tsx
type ContentEditorProps = {
  initialContent?: string | object;           // HTML or Tiptap JSON
  onChange?: (html: string, json: object) => void;
  onSave?: (html: string, json: object) => void; // dispatched via `kb-editor-save` DOM event on editor root
  placeholder?: string;                        // default: "Start writing…"
  className?: string;
  readOnly?: boolean;                          // default: false (hides toolbar)
};
```

## States covered

| State | Rendered |
|---|---|
| Empty | Placeholder visible, toolbar enabled |
| With content | Full article renders; toolbar reflects cursor context |
| Read-only | Toolbar hidden; content visible; ProseMirror editor non-editable |
| Undo/redo exhausted | Buttons disabled (40% opacity) |
| Link active | Link button uses active bg; click unlinks |
| Inside heading | Text-style dropdown label updates (N → H1 / H2 / H3) |

## Slash command (`/`) — block insert (added 2026-04-21)

The `FloatingMenu` (always-on empty-line rail) has been removed. In its place, the editor uses a **Notion-style slash command** triggered by typing `/` anywhere a block can start. The slash menu opens at the caret; the bubble menu on selection remains unchanged.

### UX summary

| Aspect | Behavior |
|---|---|
| Trigger | `/` at start-of-node or after whitespace (`' '`, `'\n'`, `'\t'`). Mid-word `/` does NOT trigger (URL paths, etc.) |
| Disabled in | Code block, inline code mark (via `allow()`) |
| Positioning | `@floating-ui/dom` `bottom-start` with 4 px offset, `flip()` above when there's no space below, `shift()` for horizontal clamping |
| Anchor | Caret rect (provided by `@tiptap/suggestion` as `clientRect`) |
| Layer | Appended to `document.body`, `z-index: 60` |
| Close | Escape, clicking outside, pressing any character that makes the query not match a command leaves it open with "No results" |
| Keyboard | `ArrowUp` / `ArrowDown` cycle, `Enter` selects, `Escape` dismisses. Hover also sets active row. |
| Regression | Bubble menu on text selection is untouched |

### Popup visual spec

| Property | Value |
|---|---|
| Background | `#ffffff` |
| Border | `1px solid #e2e8f0`, radius `8 px` |
| Shadow | `0px 4px 6px -1px rgba(0,0,0,0.10), 0px 2px 4px -2px rgba(0,0,0,0.06)` |
| Width | `min-w-[220px] max-w-[320px]` |
| Max height | `280 px` (items scroll internally) |
| Row padding | `10/6 px` (px 2.5 / py 1.5) |
| Icon | `16×16`, color `#475569` |
| Title | `14 / 20 / 500`, color `#0f172a` |
| Subtitle | `12 / 18 / 400`, color `#64748b` |
| Active row | `bg #f8fafc` (hover + keyboard focus share one style) |
| Empty state | Text-only row "No results" in `#64748b` |

### Command list (v1 — 10 items)

| # | Icon | Title | Subtitle | Tiptap chain | Aliases |
|---|---|---|---|---|---|
| 1 | `RiH1` | Heading 1 | Big section heading | `toggleHeading({ level: 1 })` | h1, heading, title |
| 2 | `RiH2` | Heading 2 | Medium section heading | `toggleHeading({ level: 2 })` | h2, heading, subtitle |
| 3 | `RiH3` | Heading 3 | Small section heading | `toggleHeading({ level: 3 })` | h3, heading |
| 4 | `RiListUnordered` | Bullet List | Unordered list | `toggleBulletList` | bullet, ul, unordered, list |
| 5 | `RiListOrdered` | Numbered List | Ordered list | `toggleOrderedList` | ol, ordered, numbered, list |
| 6 | `RiCodeBoxLine` | Code Block | Fenced code with syntax highlight | `toggleCodeBlock` | code, pre, fenced |
| 7 | `RiTable2` | Table | 3×3 with header row | `insertTable({ rows: 3, cols: 3, withHeaderRow: true })` | table, grid |
| 8 | `RiDoubleQuotesL` | Blockquote | Indented quote | `toggleBlockquote` | quote, blockquote, cite |
| 9 | `RiSeparator` | Divider | Horizontal rule | `setHorizontalRule` | hr, rule, separator, divider |
| 10 | `RiSparkling2Line` | AI Highlight | Mark text as AI-sourced | `toggleHighlight({ color: 'ai' })` | ai, sparkle |

Each command deletes the `/query` range before running its chain, so the typed trigger is consumed.

### Filter rules

`filterSlashCommands(query)` (`SlashCommandMenu.tsx`):

1. Case-insensitive.
2. Match if the **title starts with** the query (strict prefix, not substring).
3. Match if any alias starts with the query.

Intentional outcome: `/h` → Heading 1, Heading 2, Heading 3, Divider (alias `hr`). `/hea` → only the three Headings. `/bullet` → only Bullet List. The "AI Highlight" `highlight` alias is deliberately omitted so `/h` does not surface a selection-only mark.

### Why `@floating-ui/dom` (not tippy.js)

Tiptap 3 does not bundle `tippy.js`. `@floating-ui/dom` is already a transitive dependency (used by BubbleMenu), so we reuse it and avoid pulling in another positioning library. `computePosition({ placement: 'bottom-start', middleware: [offset(4), flip(), shift()] })` handles all the edge cases the spec calls for.

## Files

- `packages/kb-ui/src/components/content/ContentEditor.tsx`
- `packages/kb-ui/src/components/content/ContentEditor.stories.tsx`
- `packages/kb-ui/src/components/content/index.ts` (barrel export)
- `packages/kb-ui/src/components/content/SlashCommandMenu.tsx` *(added 2026-04-21)*
- `packages/kb-ui/src/components/content/extensions/SlashCommand.ts` *(added 2026-04-21)*
- `packages/kb-ui/package.json` (dependencies, incl. `@tiptap/suggestion`)
