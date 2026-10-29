// Layout B, "Show changes": the editor's spot shows the article the way
// the review page shows a change — old text struck through on red, new
// text on green — for every auto-applied suggestion at once, so "what
// changed from what" is answered in place. Right under each change sits
// its line: type, title, sources, "Auto-applied" and the round Revert
// (or "Reverted" and Re-apply, under the restored original). Read-only;
// "Hide changes" goes back to editing.
//
// Same frame as the editor: a 36px strip with the toolbar's shadow where
// the toolbar sits, then the content area at the editor's height.

import { useMemo } from 'react';
import { MaterialIcon } from '../components/ui/MaterialIcon';
import { Tooltip } from '../components/ui/Tooltip';
import { cn } from '../lib/cn';
import type { AppliedItem } from './autoApplied';
import { IconButton, RevertButton, SuggestionTypeLabel } from './ReviewAtoms';
import { buildReviewDocument } from './reviewDocument';
import { ReviewArticleBody, type BodySuggestionState } from './ReviewArticleBody';
import { SourcesLink, UndoGlyph } from './SuggestionCard';

export interface AutoChangesViewProps {
  title: string;
  /** The body before Hiver AI's changes; each change is rebuilt on it. */
  baseBodyHTML: string;
  items: AppliedItem[];
  heightOffset: number;
  /** Revert (applied) or Re-apply (reverted). */
  onToggle: (id: string) => void;
  onOpenSources: (id: string) => void;
}

export function AutoChangesView({ title, baseBodyHTML, items, heightOffset, onToggle, onOpenSources }: AutoChangesViewProps) {
  const suggestions = useMemo(() => items.map((i) => i.suggestion), [items]);
  const document = useMemo(() => buildReviewDocument(baseBodyHTML, suggestions), [baseBodyHTML, suggestions]);
  const states = useMemo(() => {
    const out: Record<string, BodySuggestionState> = {};
    for (const i of items) out[i.suggestion.id] = i.live ? 'diff' : 'dismissed';
    return out;
  }, [items]);

  const renderAfter = (id: string) => {
    const item = items.find((i) => i.suggestion.id === id);
    if (!item) return null;
    const { suggestion: s, live } = item;
    return (
      // Not part of the article text: no ck-content type, no selection.
      <div
        contentEditable={false}
        className="mt-[6px] mb-[14px] flex h-[28px] items-center gap-[10px] font-inter select-none"
      >
        <SuggestionTypeLabel type={s.type} />
        <span className={cn('min-w-0 truncate text-[13px] leading-[20px] font-medium', live ? 'text-legacy-ink' : 'text-legacy-meta')}>
          {s.title}
        </span>
        <SourcesLink count={s.sourceCount} onClick={() => onOpenSources(s.id)} />
        <span className="ml-auto text-[12px] leading-[20px] font-medium text-legacy-meta">{live ? 'Auto-applied' : 'Reverted'}</span>
        {live ? (
          <RevertButton suggestionTitle={s.title} onClick={() => onToggle(s.id)} />
        ) : (
          <Tooltip content="Re-apply">
            <IconButton label={`Re-apply: ${s.title}`} onClick={() => onToggle(s.id)} className="hover:bg-legacy-toolbar-hover">
              <UndoGlyph />
            </IconButton>
          </Tooltip>
        )}
      </div>
    );
  };

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
          title={title}
          document={document}
          states={states}
          renderAfter={renderAfter}
          className="border border-solid border-white px-[4px]"
        />
      </div>
    </div>
  );
}
