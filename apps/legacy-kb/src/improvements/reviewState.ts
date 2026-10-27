// AI suggestions review state machine.
//
// Forked verbatim (logic) from `packages/kb-ui/src/hooks/useAIGapsReducer.ts`
// so the legacy app reproduces the new UI's review behavior exactly:
// strict-forward auto-advance, `activeIndex = -1` "no active card"
// sentinel, prev/next that skip decided cards without wrapping, undo
// re-activating the undone card, and terminal on the last decision.
//
// Why a fork instead of an import: `@test-kb-ui/kb-ui` only resolves
// through its built `dist/`, which would make this app's build depend on
// a kb-ui build. The reducer is pure and small, so a copy keeps the two
// apps independent. Keep the two in sync if the kb-ui reducer changes.

export type ReviewMode = 'pre-review' | 'reviewing' | 'terminal';

export type ReviewDecision = 'accepted' | 'dismissed';

/** Only the fields the state machine reads. */
export type ReviewItem = { id: string };

export type ReviewState = {
  mode: ReviewMode;
  /** Index into the suggestion list; -1 means "no active card". */
  activeIndex: number;
  /** Decisions keyed by suggestion id. Missing key → not decided yet. */
  decisions: Record<string, ReviewDecision>;
  /** Suggestion whose Sources sheet is open, or null when closed. */
  sourcesFor: string | null;
};

export type ReviewAction =
  | { type: 'review' }
  | { type: 'accept'; id: string }
  | { type: 'reject'; id: string }
  | { type: 'undo'; id: string }
  | { type: 'prev' }
  | { type: 'next' }
  | { type: 'setActive'; index: number }
  | { type: 'activateSuggestion'; id: string }
  | { type: 'openSources'; id: string }
  | { type: 'closeSources' }
  | { type: 'reset' };

export const initialReviewState: ReviewState = {
  mode: 'pre-review',
  activeIndex: 0,
  decisions: {},
  sourcesFor: null,
};

function isUndecided(items: ReviewItem[], decisions: Record<string, ReviewDecision>, idx: number): boolean {
  const item = items[idx];
  return item !== undefined && decisions[item.id] === undefined;
}

function findPrevUndecidedNoWrap(
  items: ReviewItem[],
  decisions: Record<string, ReviewDecision>,
  startIndex: number,
): number {
  for (let idx = startIndex - 1; idx >= 0; idx -= 1) {
    if (isUndecided(items, decisions, idx)) return idx;
  }
  return -1;
}

function findNextUndecidedNoWrap(
  items: ReviewItem[],
  decisions: Record<string, ReviewDecision>,
  startIndex: number,
): number {
  for (let idx = startIndex + 1; idx < items.length; idx += 1) {
    if (isUndecided(items, decisions, idx)) return idx;
  }
  return -1;
}

function findFirstUndecided(items: ReviewItem[], decisions: Record<string, ReviewDecision>): number {
  for (let i = 0; i < items.length; i += 1) {
    if (isUndecided(items, decisions, i)) return i;
  }
  return -1;
}

/** Drives the disabled state of the active card's prev/next arrows. */
export function hasUndecidedNeighbour(
  items: ReviewItem[],
  decisions: Record<string, ReviewDecision>,
  activeIndex: number,
  direction: 'prev' | 'next',
): boolean {
  if (items.length === 0) return false;
  if (direction === 'prev') return findPrevUndecidedNoWrap(items, decisions, activeIndex) !== -1;
  return findNextUndecidedNoWrap(items, decisions, activeIndex) !== -1;
}

/** Publishing needs at least one accepted suggestion. */
export function isPublishEnabled(decisions: Record<string, ReviewDecision>): boolean {
  return Object.values(decisions).some((d) => d === 'accepted');
}

export function isAllReviewed(items: ReviewItem[], decisions: Record<string, ReviewDecision>): boolean {
  return items.every((s) => decisions[s.id] !== undefined);
}

export function reviewReducer(state: ReviewState, action: ReviewAction, items: ReviewItem[]): ReviewState {
  switch (action.type) {
    case 'review': {
      if (state.mode !== 'pre-review') return state;
      return { ...state, mode: 'reviewing', activeIndex: 0 };
    }

    case 'accept':
    case 'reject': {
      const decision: ReviewDecision = action.type === 'accept' ? 'accepted' : 'dismissed';
      const nextDecisions = { ...state.decisions, [action.id]: decision };
      if (isAllReviewed(items, nextDecisions)) {
        return { ...state, decisions: nextDecisions, mode: 'terminal', activeIndex: -1 };
      }
      // Strict forward auto-advance: never wrap back to earlier cards.
      const nextIdx = findNextUndecidedNoWrap(items, nextDecisions, state.activeIndex);
      return { ...state, mode: 'reviewing', decisions: nextDecisions, activeIndex: nextIdx };
    }

    case 'undo': {
      const nextDecisions = { ...state.decisions };
      delete nextDecisions[action.id];
      const idx = items.findIndex((s) => s.id === action.id);
      return {
        ...state,
        mode: 'reviewing',
        decisions: nextDecisions,
        activeIndex: idx === -1 ? state.activeIndex : idx,
      };
    }

    case 'prev': {
      if (items.length === 0) return state;
      if (state.mode !== 'reviewing' || state.activeIndex < 0) {
        for (let i = items.length - 1; i >= 0; i -= 1) {
          if (isUndecided(items, state.decisions, i)) return { ...state, mode: 'reviewing', activeIndex: i };
        }
        return state;
      }
      const prevIdx = findPrevUndecidedNoWrap(items, state.decisions, state.activeIndex);
      if (prevIdx === -1) return state;
      return { ...state, activeIndex: prevIdx };
    }

    case 'next': {
      if (items.length === 0) return state;
      if (state.mode !== 'reviewing' || state.activeIndex < 0) {
        const first = findFirstUndecided(items, state.decisions);
        if (first === -1) return state;
        return { ...state, mode: 'reviewing', activeIndex: first };
      }
      const nextIdx = findNextUndecidedNoWrap(items, state.decisions, state.activeIndex);
      if (nextIdx === -1) return state;
      return { ...state, activeIndex: nextIdx };
    }

    case 'setActive': {
      if (items.length === 0) return state;
      const clamped = Math.max(0, Math.min(items.length - 1, action.index));
      return { ...state, activeIndex: clamped };
    }

    case 'activateSuggestion': {
      const idx = items.findIndex((s) => s.id === action.id);
      if (idx === -1) return state;
      if (state.decisions[action.id] !== undefined) {
        const fallback = findFirstUndecided(items, state.decisions);
        if (fallback === -1) return state;
        return { ...state, mode: 'reviewing', activeIndex: fallback };
      }
      return { ...state, mode: 'reviewing', activeIndex: idx };
    }

    case 'openSources':
      return { ...state, sourcesFor: action.id };

    case 'closeSources':
      return { ...state, sourcesFor: null };

    case 'reset':
      return initialReviewState;

    default: {
      const exhaustive: never = action;
      void exhaustive;
      return state;
    }
  }
}
