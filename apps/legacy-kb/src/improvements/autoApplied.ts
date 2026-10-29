// An article's auto-applied suggestions, in body order, as both layouts
// (A: review page, B: edit-page banner) list them.

import type { AutoChange } from '../store/selectors';
import type { AISuggestion } from '../store/types';

/** One auto-applied suggestion; `live` until someone reverts it. */
export type AppliedItem = { suggestion: AISuggestion; live: boolean };

export function appliedItems(changes: AutoChange[]): AppliedItem[] {
  return changes.map((c) => ({ suggestion: c.suggestion, live: c.status === 'live' }));
}
