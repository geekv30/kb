# design/ai-gaps.md — Phase 6 (AI Gaps / AI Optimise) Spec

> **Source of truth for:** AI Optimise hub, AI gap review experience (editor chrome with inline suggestion diff), Sources side-sheet, and all supporting atoms.
>
> **Business criticality:** per user — "the most business critical piece in the entire KB revamp."
>
> **Narrative spec (READ FIRST):** `ai-suggestions-flow.md` at repo root. Ten-frame Grammarly-style review loop. This file is the implementation-level counterpart.

## Figma references

All nodes live in file `9aGp5t9fH1d0PXi4LMhOdb` ("library-check"). **`get_design_context` returns "nothing selected" for every node in this file** — use `get_screenshot` only.

| Node | Purpose |
|---|---|
| `74:8794` | `side-nav` ai-active — the 54 px app rail with AI active. Maps to existing `SideNavRail` with `activeId="ai"`. |
| `74:8871` | `file-explorer` ai-active — the 288 px AI sub-rail (two items: AI Centre + AI Optimise). Implemented as new `AISubNav`. |
| `74:8927` | `ai cards` — isolated `SuggestionCard` examples. |
| `74:8928` | `ai fullpage` — composed AI Optimise Hub page. Implemented as `Patterns/KB AI Optimise Hub`. |
| `74:9431` | `ai-gaps-cards` — 3×4 grid of right-rail card states: pre-review + 3 active + 3 accepted + 3 dismissed. |
| `76:12567` | `sources-sidesheet` — right-docked overlay triggered from the active gap card. |
| `74:10788` | `ai-gaps-experience` pattern — 10-frame strip of the full review flow. Individual frames: `81:17189` (Frame 2), `81:16926` (3), `81:17484` (4 / side-sheet), `81:16634` (5), `81:16342` (6), `81:16040` (7), `81:15737` (8), `81:15088` (9), `81:14752` (10). |

## Component inventory

| Component | File | Purpose |
|---|---|---|
| `AISubNav` | `packages/kb-ui/src/components/nav/AISubNav.tsx` | 288 px flat nav for the AI section with `kind: 'section' \| 'item'` rows |
| `SuggestionCard` | `packages/kb-ui/src/components/content/SuggestionCard.tsx` | Hub-level card — title / description / HR / meta row |
| `AISuggestionsCard` | `packages/kb-ui/src/components/content/AISuggestionsCard.tsx` | Rail-top summary card with `mode: 'pre-review' \| 'terminal'` |
| `AIGapSuggestionCard` | `packages/kb-ui/src/components/content/AIGapSuggestionCard.tsx` | Per-suggestion rail card with `state: 'active' \| 'accepted' \| 'dismissed'` |
| `SuggestionBlock` | `packages/kb-ui/src/components/content/SuggestionBlock.tsx` | Inline article wrapper: `type: 'addition' \| 'replace' \| 'removal'` |
| `ArticleBody` | `packages/kb-ui/src/components/content/ArticleBody.tsx` | Read-mode article body driven by `decisions: Record<'s1' \| 's2' \| 's3', ArticleSuggestionDecision>` |
| `SourcesSideSheet` | `packages/kb-ui/src/components/overlays/SourcesSideSheet.tsx` | Right-docked Radix Dialog with conversation cards |

## Shared types

`packages/kb-ui/src/components/content/ai-suggestion-types.ts`:

```ts
export type AISuggestionType = 'addition' | 'replace' | 'removal';
export type AISuggestionDecision = 'accepted' | 'dismissed';
export type AISuggestionState = 'active' | AISuggestionDecision;

export type AISuggestion = {
  id: string;
  type: AISuggestionType;
  title: string;
  description: string;
  sourceCount: number;
};
```

`ArticleBody.tsx` extends these with an `'inactive'` sentinel for pre-review highlight:

```ts
export type ArticleSuggestionDecision = 'inactive' | 'active' | 'accepted' | 'dismissed';
```

## Color & token conventions

All values Tailwind-arbitrary-class since the Figma kit uses shades outside the canonical token set.

| Surface | Value |
|---|---|
| AISubNav active pill | `#f1f5f9` (surface-muted) |
| Card border (all new cards) | `#e5e5e5` |
| Card HR (SuggestionCard + AIGapSuggestionCard active) | `#f1f5f9` |
| Hub card kind icon tint | `#D92FFF` (matches `AiIcon.tsx` gradient start — intentional single-pink choice across cards + icons) |
| Addition highlight | bg `rgba(34,197,94,0.12)`, left-bar `#22c55e`, radius 8 |
| Replace highlight | red half `rgba(239,68,68,0.10)` + green half `rgba(34,197,94,0.12)`, 8 px gap |
| Removal highlight | bg `rgba(239,68,68,0.10)`, left-bar `#ef4444` |
| Sources sheet backdrop | `bg-black/85` (Figma shows near-solid dark wash) |

## State machine — `useAIGapsReducer`

Co-located with the pattern story at `packages/kb-ui/src/pages/useAIGapsReducer.ts`. **Not exported from public API** (story-internal utility).

```ts
type AIGapsMode = 'pre-review' | 'reviewing' | 'terminal';

type AIGapsState = {
  mode: AIGapsMode;
  activeIndex: number;
  decisions: Record<string, AISuggestionDecision>;
  sourcesFor: string | null;
};

type AIGapsAction =
  | { type: 'review' }
  | { type: 'accept'; id: string }
  | { type: 'reject'; id: string }
  | { type: 'undo'; id: string }
  | { type: 'prev' }
  | { type: 'next' }
  | { type: 'setActive'; index: number }
  | { type: 'openSources'; id: string }
  | { type: 'closeSources' }
  | { type: 'reset' };
```

Semantics:
- `review` — `pre-review → reviewing`, scroll to activeIndex=0 (side effect in `useEffect`, not in reducer).
- `accept(id)` / `reject(id)` — record decision; if `allReviewed`, mode → `terminal`; else advance `activeIndex` to next un-decided (wrap-aware via `findNextUndecided`).
- `undo(id)` — clear decision; mode → `reviewing`; `activeIndex → suggestions.findIndex(id)`.
- `prev` / `next` — rotate `activeIndex` modulo length. Decided suggestions are navigable so the user can revisit/undo.
- `openSources(id)` — set `sourcesFor`; does NOT change `activeIndex` (sheet is cross-cutting).
- `closeSources` — clear `sourcesFor`.
- `reset` — full reset (used by breadcrumb `×` to return the story to initial state).

Derived:
- `isPublishEnabled(state)` — `Object.values(decisions).some(d => d === 'accepted')`.
- `isAllReviewed(state, suggestions)` — every suggestion has a decision.

## Scroll behavior (critical)

`AppShell`'s `<main>` is `overflow-y-auto`; `document` does not scroll. The interactive pattern scrolls by calling:

```ts
document.getElementById(activeId)?.scrollIntoView({ block: 'center', behavior: 'smooth' });
```

`SuggestionBlock` emits `id={id}` on its DOM root so each suggestion is addressable. **Do NOT** use `window.scrollTo` — it's a no-op here because window doesn't scroll.

On entering `terminal` or `pre-review`: scroll `main` back to top via `document.querySelector('main')?.scrollTo({top:0})`.

## Keyboard shortcuts

Wrapped behind `enableKeyboard?: boolean` prop (default `true`) on the interactive story. Only active when `mode === 'reviewing'` and no sheet is open.

| Key | Action |
|---|---|
| `j` / `ArrowDown` | `next` |
| `k` / `ArrowUp` | `prev` |
| `y` / `Enter` | `accept` current active |
| `n` | `reject` current active |
| `Escape` | Close sources sheet (Radix also handles this; wired for parity) |

## Publish gating

`KBBreadcrumbBar` gained an optional `publishDisabled?: boolean` prop (default `false`) in this phase. Threads through to the primitive `Button`'s `disabled` attribute. Existing `KBEditorPage` story regression-verified unchanged.

## Stories inventory

| Title | File | Purpose |
|---|---|---|
| `Components/Navigation/AI Sub Nav` | `AISubNav.stories.tsx` | Default |
| `Components/Content/Suggestion Card` | `SuggestionCard.stories.tsx` | Default / NewArticle / MoveArticle |
| `Components/Content/AI Suggestions Card` | `AISuggestionsCard.stories.tsx` | PreReview / Terminal |
| `Components/Content/AI Gap Suggestion Card` | `AIGapSuggestionCard.stories.tsx` | ActiveAddition / ActiveReplace / ActiveRemoval / AcceptedAddition / DismissedReplace |
| `Components/Content/Suggestion Block` | `SuggestionBlock.stories.tsx` | Addition / Replace / Removal |
| `Components/Content/Article Body` | `ArticleBody.stories.tsx` | AllInactive / AllAccepted |
| `Components/Overlays/Sources Side Sheet` | `SourcesSideSheet.stories.tsx` | Default / Interactive |
| `Patterns/KB AI Optimise Hub` | `KBAIOptimiseHubPage.stories.tsx` | Default |
| `Patterns/KB AI Gaps` | `KBAIGapsExperience.stories.tsx` | Frame2PreReview / Frame3ActiveAddition / Frame5AcceptedAddition / Frame6ActiveReplace / Frame8ActiveRemoval / Frame10Terminal / Interactive |

## Open items (product decisions to confirm)

1. **Navigation onto decided suggestions.** `prev`/`next` cycle through all slots including decided ones. When `activeIndex` lands on a decided suggestion the rail shows only chips (no active card). Design may want a "focused chip" visual to signal navigation position.
2. **Y/N on decided active.** Keyboard `y`/`n` on a decided slot currently overwrites the decision. If product wants a no-op, guard in keyboard handler.
3. **Terminal state chips.** Terminal mode renders all 3 chips below the Suggestions card so the user can undo from terminal. Figma frame 10 hides them. Chose to include per flow-doc "undo must remain available."
4. **Hub card click.** Currently logs to console. Production wiring needs to navigate into the review pattern with the right article loaded.
5. **Settings card in AI Gaps rail.** A simple collapsed placeholder is used; expanding behavior isn't speced. `ArticleSettingsPanel` exists from Phase 5 — could be wired in later.
6. **Avatar on dark rail.** The primitive `Avatar` is styled for light backgrounds (grey bg, dark text). On the hub's dark rail it reads lower-contrast than Figma. Add a `variant="dark"` to `Avatar` in a later polish pass.
7. **Rail theme inconsistency across hub patterns (cross-surface).** `Patterns/KB AI Optimise Hub` uses `SideNavRail theme="dark"` (matches Figma `74:8928` in `9aGp5t9fH1d0PXi4LMhOdb`). `Patterns/KB Category Page` uses `theme="light"` (matches Figma `1958:33209` in `251DTRmxl2L6jmXd3FWzHe`). Both render per their source Figma — this is a **design-system-level** question, not an implementation bug. If product wants a unified rail theme across all KB surfaces, that's a Figma revision upstream of us.
8. **Terminal mode `prev`/`next` buttons.** Visible in the terminal `AISuggestionsCard` but the reducer no-ops them (keyboard handler guards `mode !== 'reviewing'`, button clicks update `activeIndex` invisibly since the rail-below maps decisions to chips regardless of active-index at terminal). Low impact; revisit if the terminal card should expose navigation-through-reviewed-suggestions as a discoverable affordance.
