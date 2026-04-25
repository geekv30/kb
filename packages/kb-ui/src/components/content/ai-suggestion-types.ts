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

export type AISuggestionState = 'active' | AISuggestionDecision;
