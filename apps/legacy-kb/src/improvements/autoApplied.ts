// An article's auto-applied suggestions, in body order, as the review
// page lists them.

import type { AutoChange } from '../store/selectors';
import type { AISuggestion } from '../store/types';

/** One auto-applied suggestion; `applied` until a teammate reverts it. */
export type AppliedItem = { suggestion: AISuggestion; applied: boolean };

export function appliedItems(changes: AutoChange[]): AppliedItem[] {
  return changes.map((c) => ({ suggestion: c.suggestion, applied: c.status === 'applied' }));
}
