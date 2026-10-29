// Maps an article body + its AI suggestions onto an ordered list of
// review segments, and applies review decisions back onto the body.
//
// Pure string work (no DOM), so the same mapping drives both the review
// renderer and publishing: what the reviewer sees for a set of decisions
// is exactly what `applyDecisions` writes.
//
// Anchoring contract (enforced by the seed integrity check):
//   - `addition`  → `payload.newHTML` is inserted right AFTER the block
//                   whose `data-block-id` is `anchorBlockId`.
//   - `replace`   → the anchor block (=== `payload.oldHTML`) is swapped
//                   for `payload.newHTML`.
//   - `removal`   → the anchor block (=== `payload.oldHTML`) is removed.

import type { AISuggestion } from '../store/types';
import type { ReviewDecision } from './reviewState';

export type ReviewSegment =
  | { kind: 'static'; html: string }
  | { kind: 'addition'; suggestionId: string; newHTML: string }
  | { kind: 'replace'; suggestionId: string; oldHTML: string; newHTML: string }
  | { kind: 'removal'; suggestionId: string; oldHTML: string };

export type SuggestionSegment = Exclude<ReviewSegment, { kind: 'static' }>;

export interface ReviewDocument {
  segments: ReviewSegment[];
  /** Suggestion ids in document order (the review order). */
  orderedIds: string[];
  /** Suggestions whose anchor block is missing from the body. */
  unplacedIds: string[];
}

interface BlockRange {
  start: number;
  end: number;
}

/**
 * Character range of the element carrying `data-block-id="<blockId>"`,
 * from its opening `<` to the end of its matching close tag. Nested
 * elements with the same tag name are depth-counted.
 */
export function findBlockRange(html: string, blockId: string): BlockRange | null {
  const marker = `data-block-id="${blockId}"`;
  const at = html.indexOf(marker);
  if (at === -1) return null;
  const start = html.lastIndexOf('<', at);
  const tag = /^<([a-zA-Z][a-zA-Z0-9]*)/.exec(html.slice(start))?.[1];
  if (start === -1 || !tag) return null;

  const tagPattern = new RegExp(`<(/?)${tag}(?=[\\s>/])`, 'gi');
  tagPattern.lastIndex = start;
  let depth = 0;
  for (let m = tagPattern.exec(html); m; m = tagPattern.exec(html)) {
    depth += m[1] === '/' ? -1 : 1;
    if (depth === 0) {
      const close = html.indexOf('>', m.index);
      return close === -1 ? null : { start, end: close + 1 };
    }
  }
  return null;
}

interface PlacedOp {
  start: number;
  end: number;
  segment: SuggestionSegment;
}

function placeSuggestion(bodyHTML: string, s: AISuggestion): PlacedOp | null {
  const range = findBlockRange(bodyHTML, s.anchorBlockId);
  if (!range) return null;
  const blockHTML = bodyHTML.slice(range.start, range.end);
  switch (s.type) {
    case 'addition':
      if (!s.payload.newHTML) return null;
      return {
        start: range.end,
        end: range.end,
        segment: { kind: 'addition', suggestionId: s.id, newHTML: s.payload.newHTML },
      };
    case 'replace':
      if (!s.payload.newHTML) return null;
      return {
        ...range,
        segment: { kind: 'replace', suggestionId: s.id, oldHTML: blockHTML, newHTML: s.payload.newHTML },
      };
    case 'removal':
      return { ...range, segment: { kind: 'removal', suggestionId: s.id, oldHTML: blockHTML } };
    default: {
      const exhaustive: never = s.type;
      return exhaustive;
    }
  }
}

/** Splits `bodyHTML` into static runs and one segment per suggestion. */
export function buildReviewDocument(bodyHTML: string, suggestions: AISuggestion[]): ReviewDocument {
  const placed: PlacedOp[] = [];
  const unplacedIds: string[] = [];
  for (const s of suggestions) {
    const op = placeSuggestion(bodyHTML, s);
    if (op) placed.push(op);
    else unplacedIds.push(s.id);
  }
  // Document order; an insertion at offset p sorts before a range that
  // starts at p (addition after block A, then a change to block B).
  placed.sort((a, b) => a.start - b.start || a.end - b.end);

  const segments: ReviewSegment[] = [];
  const orderedIds: string[] = [];
  let cursor = 0;
  for (const op of placed) {
    if (op.start < cursor) {
      // Two suggestions claim the same block; keep the first.
      unplacedIds.push(op.segment.suggestionId);
      continue;
    }
    if (op.start > cursor) segments.push({ kind: 'static', html: bodyHTML.slice(cursor, op.start) });
    segments.push(op.segment);
    orderedIds.push(op.segment.suggestionId);
    cursor = op.end;
  }
  if (cursor < bodyHTML.length) segments.push({ kind: 'static', html: bodyHTML.slice(cursor) });
  return { segments, orderedIds, unplacedIds };
}

/**
 * HTML a suggestion segment contributes once `decision` is applied.
 * An undecided suggestion leaves the article as it is today.
 *
 * | Type     | Accepted     | Dismissed / undecided |
 * | -------- | ------------ | --------------------- |
 * | addition | new content  | nothing               |
 * | replace  | new content  | old content           |
 * | removal  | nothing      | old content           |
 */
export function resolveSegment(segment: SuggestionSegment, decision: ReviewDecision | undefined): string {
  const accepted = decision === 'accepted';
  switch (segment.kind) {
    case 'addition':
      return accepted ? segment.newHTML : '';
    case 'replace':
      return accepted ? segment.newHTML : segment.oldHTML;
    case 'removal':
      return accepted ? '' : segment.oldHTML;
    default: {
      const exhaustive: never = segment;
      return exhaustive;
    }
  }
}

/** The article body after the review's decisions are applied. */
export function applyDecisions(
  bodyHTML: string,
  suggestions: AISuggestion[],
  decisions: Record<string, ReviewDecision>,
): string {
  return buildReviewDocument(bodyHTML, suggestions)
    .segments.map((seg) => (seg.kind === 'static' ? seg.html : resolveSegment(seg, decisions[seg.suggestionId])))
    .join('');
}

/** The block an applied suggestion leaves in the body: the added block, or the replaced one. */
export function appliedBlockId(s: AISuggestion): string | undefined {
  if (s.type === 'replace') return s.anchorBlockId;
  if (s.type === 'addition') return /data-block-id="([^"]+)"/.exec(s.payload.newHTML ?? '')?.[1];
  return undefined;
}

function splice(html: string, start: number, end: number, insert: string): string {
  return html.slice(0, start) + insert + html.slice(end);
}

/**
 * Takes one applied suggestion back out of the CURRENT body, touching
 * only its own block, so edits made elsewhere since then survive.
 * `null` when its block is gone (e.g. a removal: nothing left to find).
 */
export function revertSuggestion(bodyHTML: string, s: AISuggestion): string | null {
  const blockId = appliedBlockId(s);
  const range = blockId ? findBlockRange(bodyHTML, blockId) : null;
  if (!range) return null;
  return splice(bodyHTML, range.start, range.end, s.type === 'replace' ? (s.payload.oldHTML ?? '') : '');
}

/** Puts a reverted suggestion back into the current body, next to (or over) its anchor block. */
export function reapplySuggestion(bodyHTML: string, s: AISuggestion): string | null {
  const range = findBlockRange(bodyHTML, s.anchorBlockId);
  if (!range) return null;
  if (s.type === 'addition') return splice(bodyHTML, range.end, range.end, s.payload.newHTML ?? '');
  if (s.type === 'replace') return splice(bodyHTML, range.start, range.end, s.payload.newHTML ?? '');
  return splice(bodyHTML, range.start, range.end, '');
}
