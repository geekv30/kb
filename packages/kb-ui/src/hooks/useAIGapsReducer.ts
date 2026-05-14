// State machine that drives the AI Gaps review flow used by the
// `Patterns/KB AI Gaps → Interactive` story and by `apps/demo`.
//
// The reducer is intentionally exported **separately** from the hook so it
// can be unit-tested or re-composed by another consumer without pulling in
// React. It is a pure function: no side effects, no scroll calls. All DOM
// effects (scrolling into view, focus, keyboard wiring) live in the
// consumer component's `useEffect`s.
//
// Public API: re-exported from `src/index.ts` so external apps (the demo
// and downstream Hiver projects) can drive their own AI Gaps flows from
// the same state machine the in-package story uses.
import * as React from 'react';
import type {
  AISuggestion,
  AISuggestionDecision,
} from '../components/content/ai-suggestion-types';

/* ─────────────────────────────────────────────────────────────
 * Types
 * ───────────────────────────────────────────────────────────── */

export type AIGapsMode = 'pre-review' | 'reviewing' | 'terminal';

export type AIGapsState = {
  mode: AIGapsMode;
  /** Index into the suggestions array — always clamped to [0, len-1]. */
  activeIndex: number;
  /** Decisions keyed by `suggestion.id`. Missing key → not yet decided. */
  decisions: Record<string, AISuggestionDecision>;
  /** Id of the suggestion whose sources sheet is open, or null if closed. */
  sourcesFor: string | null;
};

export type AIGapsAction =
  | { type: 'review' }
  | { type: 'accept'; id: string }
  | { type: 'reject'; id: string }
  | { type: 'undo'; id: string }
  | { type: 'prev' }
  | { type: 'next' }
  | { type: 'setActive'; index: number }
  // Chunk 4 — single-card activation. Equivalent to `setActive` by index
  // but addresses the card by stable id (clicks on the rail card itself
  // don't carry index information). Also forces `mode: 'reviewing'` so
  // clicking a paired idle card transitions cleanly out of pre-review.
  | { type: 'activateSuggestion'; id: string }
  | { type: 'openSources'; id: string }
  | { type: 'closeSources' }
  | { type: 'reset' };

/* ─────────────────────────────────────────────────────────────
 * Initial state
 * ───────────────────────────────────────────────────────────── */

export const initialAIGapsState: AIGapsState = {
  mode: 'pre-review',
  activeIndex: 0,
  decisions: {},
  sourcesFor: null,
};

/* ─────────────────────────────────────────────────────────────
 * Helpers
 * ───────────────────────────────────────────────────────────── */

/**
 * Find the next un-decided suggestion starting AFTER `startIndex`, wrapping
 * to the beginning if necessary. Returns -1 if every suggestion has a
 * decision. A "decision" is any entry in `decisions` — accepted or dismissed.
 *
 * The wrap behaviour matches Grammarly-style review flows: accepting the
 * last suggestion while an earlier one is still un-decided jumps back to
 * that earlier one (so the user doesn't need to manually rewind).
 */
function findNextUndecided(
  suggestions: AISuggestion[],
  decisions: Record<string, AISuggestionDecision>,
  startIndex: number,
): number {
  const n = suggestions.length;
  for (let step = 1; step <= n; step += 1) {
    const idx = (startIndex + step) % n;
    if (decisions[suggestions[idx].id] === undefined) return idx;
  }
  return -1;
}

/**
 * Find the previous un-decided suggestion starting BEFORE `startIndex`.
 * Chunk 4 — used by the `prev` action to skip resolved cards when walking
 * the rail backwards. Returns -1 if none exist (every other card is
 * resolved).
 *
 * Non-wrapping: if you're on the first un-decided suggestion and press
 * `prev`, this returns -1 → the reducer keeps `activeIndex` where it is.
 * That maps to the user spec's "previous arrow is disabled at the first
 * unresolved card" rule.
 */
function findPrevUndecidedNoWrap(
  suggestions: AISuggestion[],
  decisions: Record<string, AISuggestionDecision>,
  startIndex: number,
): number {
  for (let idx = startIndex - 1; idx >= 0; idx -= 1) {
    if (decisions[suggestions[idx].id] === undefined) return idx;
  }
  return -1;
}

/**
 * Non-wrapping version of `findNextUndecided` — only searches indices
 * AFTER `startIndex`. Used by chunk 4's arrow-disabled UI to detect
 * "no unresolved cards remain after this one" without wrapping back to
 * the start of the list.
 */
function findNextUndecidedNoWrap(
  suggestions: AISuggestion[],
  decisions: Record<string, AISuggestionDecision>,
  startIndex: number,
): number {
  for (let idx = startIndex + 1; idx < suggestions.length; idx += 1) {
    if (decisions[suggestions[idx].id] === undefined) return idx;
  }
  return -1;
}

/**
 * First un-decided suggestion in the list, or -1 if every suggestion has
 * a decision. Used by chunk 4 when `activateSuggestion` lands on a card
 * that's already resolved, or when `next`/`prev` is invoked from a
 * terminal state.
 */
function findFirstUndecided(
  suggestions: AISuggestion[],
  decisions: Record<string, AISuggestionDecision>,
): number {
  for (let i = 0; i < suggestions.length; i += 1) {
    if (decisions[suggestions[i].id] === undefined) return i;
  }
  return -1;
}

/**
 * Returns `true` if the suggestion at `activeIndex` has at least one
 * un-decided neighbour on the requested side. Drives the arrow-disabled
 * UI on the active card so consumers don't have to re-derive this.
 */
export function hasUndecidedNeighbour(
  suggestions: AISuggestion[],
  decisions: Record<string, AISuggestionDecision>,
  activeIndex: number,
  direction: 'prev' | 'next',
): boolean {
  if (suggestions.length === 0) return false;
  if (direction === 'prev') {
    return findPrevUndecidedNoWrap(suggestions, decisions, activeIndex) !== -1;
  }
  return findNextUndecidedNoWrap(suggestions, decisions, activeIndex) !== -1;
}

/**
 * `publishEnabled` — disabled when no suggestion has been accepted. Even a
 * single accept flips Publish on; undoing back to zero-accepts flips it
 * back off. Per flow-doc §"Publish gating".
 */
export function isPublishEnabled(
  decisions: Record<string, AISuggestionDecision>,
): boolean {
  return Object.values(decisions).some((d) => d === 'accepted');
}

/**
 * `allReviewed` — true when every suggestion has a decision. Drives the
 * pre-review → terminal transition.
 */
export function isAllReviewed(
  suggestions: AISuggestion[],
  decisions: Record<string, AISuggestionDecision>,
): boolean {
  return suggestions.every((s) => decisions[s.id] !== undefined);
}

/* ─────────────────────────────────────────────────────────────
 * Reducer
 *
 * Curried over `suggestions` so the hook can bind the list once and hand
 * the reducer to React's `useReducer`. `suggestions` is treated as
 * immutable — callers should not mutate it while the reducer is live.
 * ───────────────────────────────────────────────────────────── */

export function aiGapsReducer(
  state: AIGapsState,
  action: AIGapsAction,
  suggestions: AISuggestion[],
): AIGapsState {
  switch (action.type) {
    case 'review': {
      if (state.mode !== 'pre-review') return state;
      return { ...state, mode: 'reviewing', activeIndex: 0 };
    }

    case 'accept':
    case 'reject': {
      const decision: AISuggestionDecision =
        action.type === 'accept' ? 'accepted' : 'dismissed';
      const nextDecisions = { ...state.decisions, [action.id]: decision };
      const allReviewed = isAllReviewed(suggestions, nextDecisions);
      if (allReviewed) {
        return { ...state, decisions: nextDecisions, mode: 'terminal' };
      }
      // Advance to the next un-decided suggestion. Start search from the
      // current active index so accepting the currently-visible one jumps
      // to the next logical target (which may wrap).
      const nextIdx = findNextUndecided(
        suggestions,
        nextDecisions,
        state.activeIndex,
      );
      return {
        ...state,
        mode: 'reviewing',
        decisions: nextDecisions,
        // If every suggestion is reviewed the branch above returns early;
        // otherwise `findNextUndecided` can't return -1 here.
        activeIndex: nextIdx === -1 ? state.activeIndex : nextIdx,
      };
    }

    case 'undo': {
      const nextDecisions = { ...state.decisions };
      delete nextDecisions[action.id];
      const idx = suggestions.findIndex((s) => s.id === action.id);
      return {
        ...state,
        mode: 'reviewing',
        decisions: nextDecisions,
        // If the id is missing from the list (shouldn't happen in practice)
        // keep the previous activeIndex rather than jumping to -1.
        activeIndex: idx === -1 ? state.activeIndex : idx,
      };
    }

    case 'prev': {
      const n = suggestions.length;
      if (n === 0) return state;
      // Chunk 4 — skip resolved cards. If currently no card is active
      // (pre-review or terminal) jump to the LAST un-decided card so
      // pressing Up out of pre-review still produces a sensible target.
      if (state.mode !== 'reviewing') {
        const first = findFirstUndecided(suggestions, state.decisions);
        if (first === -1) return state;
        return { ...state, mode: 'reviewing', activeIndex: first };
      }
      const prevIdx = findPrevUndecidedNoWrap(
        suggestions,
        state.decisions,
        state.activeIndex,
      );
      // -1 means "you're at the first unresolved; arrow should be disabled
      // at the UI layer". Reducer keeps the current activeIndex so the UI
      // doesn't lurch.
      if (prevIdx === -1) return state;
      return { ...state, activeIndex: prevIdx };
    }

    case 'next': {
      const n = suggestions.length;
      if (n === 0) return state;
      // Chunk 4 — same logic as `prev`, mirrored. From pre-review/terminal,
      // jump to the FIRST un-decided card so a fresh page can activate
      // via a simple `next` dispatch.
      if (state.mode !== 'reviewing') {
        const first = findFirstUndecided(suggestions, state.decisions);
        if (first === -1) return state;
        return { ...state, mode: 'reviewing', activeIndex: first };
      }
      const nextIdx = findNextUndecidedNoWrap(
        suggestions,
        state.decisions,
        state.activeIndex,
      );
      if (nextIdx === -1) return state;
      return { ...state, activeIndex: nextIdx };
    }

    case 'setActive': {
      const n = suggestions.length;
      if (n === 0) return state;
      // Clamp defensively so callers can't leak out-of-range indices.
      const clamped = Math.max(0, Math.min(n - 1, action.index));
      return { ...state, activeIndex: clamped };
    }

    case 'activateSuggestion': {
      // Chunk 4 — directly activate a card by id. Forces `mode:
      // 'reviewing'` so the first click out of pre-review transitions
      // both the summary card's chrome AND the rail's per-card decoration
      // in a single dispatch.
      //
      // Two edge cases:
      //   1. The id doesn't match any suggestion → no-op (defensive; the
      //      rail items are derived from `suggestions` so this shouldn't
      //      happen in practice).
      //   2. The target is already resolved → activate the first
      //      un-resolved card instead. Clicking an accepted/dismissed
      //      chip should never re-activate a finished decision.
      const idx = suggestions.findIndex((s) => s.id === action.id);
      if (idx === -1) return state;
      if (state.decisions[action.id] !== undefined) {
        const fallback = findFirstUndecided(suggestions, state.decisions);
        if (fallback === -1) return state;
        return { ...state, mode: 'reviewing', activeIndex: fallback };
      }
      return { ...state, mode: 'reviewing', activeIndex: idx };
    }

    case 'openSources': {
      return { ...state, sourcesFor: action.id };
    }

    case 'closeSources': {
      return { ...state, sourcesFor: null };
    }

    case 'reset': {
      return initialAIGapsState;
    }

    default: {
      // Exhaustive check — TS will surface unhandled action types.
      const _exhaustive: never = action;
      void _exhaustive;
      return state;
    }
  }
}

/* ─────────────────────────────────────────────────────────────
 * Hook
 * ───────────────────────────────────────────────────────────── */

export type UseAIGapsReducerResult = {
  state: AIGapsState;
  dispatch: React.Dispatch<AIGapsAction>;
  publishEnabled: boolean;
  allReviewed: boolean;
  /**
   * `true` when there is at least one un-decided suggestion BEFORE the
   * currently active one. Drives the up-arrow's disabled state on the
   * active card. Chunk 4.
   */
  canGoPrev: boolean;
  /**
   * `true` when there is at least one un-decided suggestion AFTER the
   * currently active one. Drives the down-arrow's disabled state on the
   * active card. Chunk 4.
   */
  canGoNext: boolean;
};

/**
 * Thin `useReducer` wrapper that binds the `suggestions` list to the
 * reducer and returns two derived booleans (`publishEnabled`,
 * `allReviewed`) that every consumer re-computes.
 *
 * The reducer is recreated on each render — correct because React 18 calls
 * the latest closure on dispatch. If `suggestions` is ever re-identified
 * (it shouldn't be — keep it module-level), the reducer will pick up the
 * new reference on the next dispatch.
 */
export function useAIGapsReducer(
  suggestions: AISuggestion[],
): UseAIGapsReducerResult {
  const [state, dispatch] = React.useReducer(
    (s: AIGapsState, a: AIGapsAction) => aiGapsReducer(s, a, suggestions),
    initialAIGapsState,
  );
  const publishEnabled = isPublishEnabled(state.decisions);
  const allReviewed = isAllReviewed(suggestions, state.decisions);
  const canGoPrev = hasUndecidedNeighbour(
    suggestions,
    state.decisions,
    state.activeIndex,
    'prev',
  );
  const canGoNext = hasUndecidedNeighbour(
    suggestions,
    state.decisions,
    state.activeIndex,
    'next',
  );
  return { state, dispatch, publishEnabled, allReviewed, canGoPrev, canGoNext };
}
