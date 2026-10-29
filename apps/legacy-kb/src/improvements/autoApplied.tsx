// Shared by both ways of showing an article's auto-applied suggestions
// (A: article + suggestion rail, B: list above the editor). Both tell
// the same story in the same words:
//
//   Auto mode is on → Hiver AI applied these suggestions to this article
//   automatically → here is each one (numbered in the article) → revert
//   any you don't want.

import { Link } from 'react-router-dom';
import { MaterialIcon } from '../components/ui/MaterialIcon';
import { firstName, pluralize, whenText } from '../lib/format';
import { SITE_SETTINGS_PATH } from '../lib/paths';
import type { AutoChange } from '../store/selectors';
import type { AISuggestion, StoreState } from '../store/types';
import { appliedBlockId } from './reviewDocument';

/** One auto-applied suggestion, numbered in body order (1-based). */
export type AppliedItem = { suggestion: AISuggestion; index: number; live: boolean };

export function appliedItems(changes: AutoChange[]): AppliedItem[] {
  return changes.map((c, i) => ({ suggestion: c.suggestion, index: i + 1, live: c.status === 'live' }));
}

export function htmlToText(html: string | undefined): string {
  if (!html) return '';
  const el = document.createElement('div');
  el.innerHTML = html;
  return (el.textContent ?? '').replace(/\s+/g, ' ').trim();
}

/**
 * The live body, marked up for display (never saved): each live
 * suggestion's block carries its number (`data-auto-applied`, styled in
 * styles.css) and `data-suggestion-id` for the rail. A reverted one gets
 * a zero-height anchor where it was, so its card stays level with it.
 */
export function decorateLiveBody(bodyHTML: string, items: AppliedItem[]): string {
  const template = document.createElement('template');
  template.innerHTML = bodyHTML;
  const root = template.content;
  const block = (id: string | undefined) =>
    id ? root.querySelector<HTMLElement>(`[data-block-id="${CSS.escape(id)}"]`) : null;
  for (const { suggestion: s, index, live } of items) {
    if (live) {
      const el = block(appliedBlockId(s));
      if (!el) continue;
      el.setAttribute('data-suggestion-id', s.id);
      el.setAttribute('data-auto-applied', String(index));
      continue;
    }
    const anchor = block(s.anchorBlockId);
    if (!anchor) continue;
    if (s.type === 'replace') {
      anchor.setAttribute('data-suggestion-id', s.id);
    } else {
      const spot = document.createElement('div');
      spot.setAttribute('data-suggestion-id', s.id);
      spot.setAttribute('aria-hidden', 'true');
      spot.style.height = '0';
      anchor.after(spot);
    }
  }
  return template.innerHTML;
}

/** Numbered disc, the same in the article and on the suggestion. */
export function AppliedNumber({ index, live }: { index: number; live: boolean }) {
  return (
    <span
      aria-hidden
      className={
        live
          ? 'inline-flex size-[20px] shrink-0 items-center justify-center rounded-full bg-legacy-success font-inter text-[12px] leading-none font-semibold text-white'
          : 'inline-flex size-[20px] shrink-0 items-center justify-center rounded-full bg-legacy-disabled font-inter text-[12px] leading-none font-semibold text-legacy-meta'
      }
    >
      {index}
    </span>
  );
}

/** "✓ Auto-applied · Live" / "Reverted". */
export function AppliedStatus({ live }: { live: boolean }) {
  return live ? (
    <span className="inline-flex items-center gap-[4px] text-[12px] leading-[20px] font-medium text-legacy-success">
      <MaterialIcon name="check_circle" size={14} className="text-legacy-success" />
      Auto-applied · Live
    </span>
  ) : (
    <span className="inline-flex items-center gap-[4px] text-[12px] leading-[20px] font-medium text-legacy-meta">
      <MaterialIcon name="undo" size={14} className="text-legacy-meta" />
      Reverted · original is live
    </span>
  );
}

/**
 * The sentence that opens both layouts. Counts follow reverts; once the
 * article is marked as reviewed it says who did it.
 */
export function AutoAppliedStory({ state, items, articleId }: { state: StoreState; items: AppliedItem[]; articleId: string }) {
  const live = items.filter((i) => i.live).length;
  const reverted = items.length - live;
  const appliedAt = items[0]?.suggestion.autoAppliedAt;
  const review = state.autoReviewByArticle[articleId];
  return (
    <p className="m-0 p-0 text-[14px] leading-[22px] font-normal text-legacy-body">
      <strong className="font-medium text-legacy-ink">Auto mode is on.</strong> Hiver AI applied{' '}
      <strong className="font-medium text-legacy-ink">{pluralize(items.length, 'suggestion')}</strong> to this article
      automatically{appliedAt ? ` ${whenText(appliedAt)}` : ''}, without waiting for a review.{' '}
      {live > 0
        ? reverted > 0
          ? `${live} ${live === 1 ? 'is' : 'are'} live, ${reverted} reverted. `
          : `${live === 1 ? 'It’s' : 'They’re'} live on your help center. `
        : 'All of them are reverted. '}
      {live > 0 ? 'Revert any you don’t want.' : ''}
      {review ? ` Reviewed by ${firstName(state, review.reviewedById)} ${whenText(review.reviewedAt)}.` : ''}{' '}
      <Link to={SITE_SETTINGS_PATH} className="font-medium whitespace-nowrap text-legacy-blue no-underline hover:underline">
        Auto mode settings
      </Link>
    </p>
  );
}
