// Figma: 9aGp5t9fH1d0PXi4LMhOdb#74:9431 (and #74:10788)
/**
 * Shared type definitions for the AI suggestion review flow.
 *
 * The flow has a fixed, small state machine:
 *   pre-review  →  active  →  (accepted | dismissed)  →  terminal
 *
 * These types are consumed by:
 *   - AISuggestionsCard    — rail shell (pre-review + terminal)
 *   - AIGapSuggestionCard  — rail card (active + accepted/dismissed chips)
 *   - SuggestionBlock      — inline body highlight wrapper
 */

export type AISuggestionType = 'addition' | 'replace' | 'removal';

export type AISuggestionDecision = 'accepted' | 'dismissed';

export type AISuggestion = {
  id: string;
  type: AISuggestionType;
  title: string;
  description: string;
  sourceCount: number;
};

/**
 * Visual + lifecycle state of an AI gap suggestion card.
 *
 *   idle       → paired with a suggestion but not the currently-active one.
 *                Recessed look: canvas-grey BG, faint border, drop shadow,
 *                title color steps down to text-secondary. Sits behind the
 *                active summary card in the editor's right rail.
 *   active     → the card under review. White BG, body type-primary,
 *                full set of arrows / sources / accept-reject affordances.
 *   accepted   → terminal chip — collapsed card with "ACCEPTED" label.
 *   dismissed  → terminal chip — collapsed card with "DISMISSED" label.
 */
export type AISuggestionState = 'idle' | 'active' | AISuggestionDecision;
