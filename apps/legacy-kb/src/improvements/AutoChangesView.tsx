// Layout B, "Show changes": the editor's spot shows the article the way
// the review page shows a change — old text struck through on red, new
// text on green — for every auto-applied suggestion at once, so "what
// changed from what" is answered in place. Reverted ones show their
// original text. Read-only; "Hide changes" goes back to editing.
//
// Same frame as the editor: a 36px strip with the toolbar's shadow where
// the toolbar sits, then the content area at the editor's height.

import { useEffect, useMemo, useRef } from 'react';
import { MaterialIcon } from '../components/ui/MaterialIcon';
import type { AppliedItem } from './autoApplied';
import { buildReviewDocument } from './reviewDocument';
import { ReviewArticleBody, type BodySuggestionState } from './ReviewArticleBody';

export interface AutoChangesViewProps {
  title: string;
  /** The body before Hiver AI's changes; each change is rebuilt on it. */
  baseBodyHTML: string;
  items: AppliedItem[];
  /** Row hovered in the banner: its change is brought into view. */
  focusedId: string | null;
  heightOffset: number;
}

export function AutoChangesView({ title, baseBodyHTML, items, focusedId, heightOffset }: AutoChangesViewProps) {
  const articleRef = useRef<HTMLElement>(null);
  const suggestions = useMemo(() => items.map((i) => i.suggestion), [items]);
  const document = useMemo(() => buildReviewDocument(baseBodyHTML, suggestions), [baseBodyHTML, suggestions]);
  const states = useMemo(() => {
    const out: Record<string, BodySuggestionState> = {};
    for (const i of items) out[i.suggestion.id] = i.live ? 'diff' : 'dismissed';
    return out;
  }, [items]);

  useEffect(() => {
    if (!focusedId) return;
    articleRef.current
      ?.querySelector<HTMLElement>(`[data-suggestion-id="${CSS.escape(focusedId)}"]`)
      ?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [focusedId]);

  return (
    <div className="relative">
      <div className="relative shadow-legacy-toolbar">
        <p className="m-0 box-border flex h-[36px] items-center gap-[6px] rounded-t-[2px] bg-white px-[12px] font-inter text-[13px] leading-[20px] text-legacy-meta">
          <MaterialIcon name="visibility" size={16} className="text-legacy-meta" />
          Showing what Hiver AI changed. Editing is paused until you hide the changes.
        </p>
      </div>
      <div className="box-border overflow-y-auto px-[20px]" style={{ height: `calc(100vh - ${200 + heightOffset}px)` }}>
        <ReviewArticleBody
          ref={articleRef}
          title={title}
          document={document}
          states={states}
          className="border border-solid border-white px-[4px]"
        />
      </div>
    </div>
  );
}
