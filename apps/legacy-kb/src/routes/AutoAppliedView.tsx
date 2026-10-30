import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { backIcon } from '../assets/legacy';
import { Button } from '../components/ui/Button';
import { ConfirmModal } from '../components/ui/Modal';
import { cn } from '../lib/cn';
import { firstName, pluralize, whenText } from '../lib/format';
import { SUGGESTIONS_HUB_PATH } from '../lib/paths';
import { AUTO_MODE_COPY } from '../improvements/autoModeCopy';
import { buildReviewDocument } from '../improvements/reviewDocument';
import { ReviewArticleBody, type BodySuggestionState } from '../improvements/ReviewArticleBody';
import { SourcesSheet } from '../improvements/SourcesSheet';
import { SuggestionCard } from '../improvements/SuggestionCard';
import { SuggestionRail, type SuggestionRailItem } from '../improvements/SuggestionRail';
import { SuggestionsSummaryCard } from '../improvements/SuggestionsSummaryCard';
import { useAutoApplied } from '../improvements/useAutoApplied';
import { articleEditPath, selectAutoReviewDocument, type AutoWhere } from '../store/selectors';
import type { AISuggestion, StoreState } from '../store/types';
import { useStore } from '../store/StoreContext';

/** Same rail width and spacing as the manual review. */
const RAIL_WIDTH = 340;

/**
 * The summary card's status line: when Hiver AI applied the changes and
 * where they stand — not published yet, or published by whom.
 */
function statusNote(
  state: StoreState,
  articleId: string,
  where: AutoWhere,
  appliedAt: string | undefined,
  appliedCount: number,
): string {
  const when = appliedAt ? ` ${whenText(appliedAt)}` : '';
  const applied = `Applied by Hiver AI${when}`;
  if (appliedCount === 0) return `${applied} · all reverted`;
  const review = state.autoReviewByArticle[articleId];
  if (where === 'live') {
    return review?.published
      ? `Published by ${firstName(state, review.reviewedById)} ${whenText(review.reviewedAt)} · applied by Hiver AI${when}`
      : applied;
  }
  const reviewed = review ? ` · reviewed by ${firstName(state, review.reviewedById)} ${whenText(review.reviewedAt)}` : '';
  return `${applied}${reviewed} · ${where === 'draft' ? 'in this draft, not published' : 'not published yet'}`;
}

/** The Publish changes confirm: what goes live, including teammates' own edits. */
function publishMessage(state: StoreState, articleId: string, applied: number, reverted: number): string {
  const article = state.articles[articleId];
  const parts = [`${pluralize(applied, 'suggestion')} from Hiver AI will go live on “${article?.edits?.title ?? article?.title ?? ''}”.`];
  const people = (article?.edits?.people ?? []).map((id) => firstName(state, id));
  if (people.length > 0) parts.push(`${people.join(' and ')}’s unpublished edits will go live too.`);
  if (reverted > 0) parts.push('Reverted suggestions won’t change the article.');
  return parts.join(' ');
}

/**
 * The article's "Edited by AI" state — the manual review page, built from
 * the same pieces so a suggestion looks the same in both modes:
 *
 *   - summary card: "Edited by AI", how many are applied, what they
 *     change, and whether they're published;
 *   - each suggestion: the usual idle card; opening it shows the change
 *     on the article's current text (red / green), its why, sources and
 *     Revert; a reverted one recedes to the grey chip (Re-apply);
 *   - top bar: Open article (the editor) and the one primary action —
 *     Publish changes, or Mark as reviewed for a draft / nothing applied.
 *
 * Once a teammate publishes, it's history: chips only, no Revert.
 */
export function AutoAppliedView({ articleId }: { articleId: string }) {
  const navigate = useNavigate();
  const { state } = useStore();
  const article = state.articles[articleId];
  const auto = useAutoApplied(articleId);
  const articleRef = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [confirmPublish, setConfirmPublish] = useState(false);
  /** Published: the changes are history, read-only. */
  const isHistory = auto.where === 'live';

  // The current text with Hiver AI's changes taken out, plus each change
  // as it reads now, so the open one shows its change on today's text.
  const source = useMemo(
    () => selectAutoReviewDocument(state, articleId),
    [state.suggestions, article?.bodyHTML, article?.edits, articleId],
  );
  const suggestions = useMemo(() => auto.items.map((i) => i.suggestion), [auto.items]);
  const reviewDocument = useMemo(() => buildReviewDocument(source.bodyHTML, suggestions), [source, suggestions]);
  const applied = (id: string) => auto.items.find((i) => i.suggestion.id === id)?.applied ?? false;
  /** Published earlier (an older batch): history, shown as a chip beside the new ones. */
  const settled = (s: AISuggestion) => isHistory || !s.waitsForPublish;

  // Opening a suggestion brings its change into view.
  useEffect(() => {
    if (!activeId) return;
    articleRef.current
      ?.querySelector<HTMLElement>(`[data-suggestion-id="${CSS.escape(activeId)}"]`)
      ?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [activeId]);

  const bodyStates = useMemo(() => {
    const out: Record<string, BodySuggestionState> = {};
    for (const s of suggestions) out[s.id] = s.id === activeId ? 'active' : applied(s.id) ? 'accepted' : 'dismissed';
    return out;
  }, [suggestions, activeId, auto.items]);

  /** Next / previous applied suggestion still waiting. */
  const step = (dir: 1 | -1) => {
    const ids = suggestions.filter((s) => applied(s.id) && !settled(s)).map((s) => s.id);
    const i = activeId ? ids.indexOf(activeId) : dir === 1 ? -1 : ids.length;
    const next = ids[i + dir];
    if (next) setActiveId(next);
  };

  const railItems = useMemo<SuggestionRailItem[]>(
    () =>
      suggestions.map((s, i) => {
        if (settled(s) || !applied(s.id)) {
          const isApplied = applied(s.id);
          return {
            id: s.id,
            node: (
              <SuggestionCard
                suggestion={s}
                state={isApplied ? 'accepted' : 'dismissed'}
                chipLabel={isApplied ? 'Published' : 'Reverted'}
                chipActionLabel="Re-apply"
                onUndo={settled(s) ? undefined : auto.toggle}
              />
            ),
          };
        }
        if (s.id === activeId) {
          return {
            id: s.id,
            node: (
              <SuggestionCard
                suggestion={s}
                state="active"
                position={{ index: i + 1, total: suggestions.length }}
                onPrev={() => step(-1)}
                onNext={() => step(1)}
                canGoPrev={i > 0}
                canGoNext={i < suggestions.length - 1}
                onOpenSources={auto.setSourcesFor}
                onRevert={(id) => {
                  auto.toggle(id);
                  setActiveId(null);
                }}
              />
            ),
          };
        }
        return {
          id: s.id,
          node: <SuggestionCard suggestion={s} state="idle" onActivate={setActiveId} />,
        };
      }),
    [suggestions, activeId, auto.items, auto.toggle, auto.setSourcesFor, isHistory],
  );

  if (!article || suggestions.length === 0) return null;
  const appliedCount = auto.items.filter((i) => i.applied && (isHistory || i.suggestion.waitsForPublish)).length;
  const revertedCount = auto.items.filter((i) => !i.applied && i.suggestion.waitsForPublish).length;
  const canPublish = auto.where === 'edits' && article.edits !== undefined;
  const primary: { label: string; onClick: () => void } | null = !auto.needsReview
    ? null
    : canPublish
      ? { label: 'Publish changes', onClick: () => setConfirmPublish(true) }
      : { label: 'Mark as reviewed', onClick: auto.markReviewed };

  return (
    <>
      <div className="relative box-border flex w-full shrink-0 flex-row items-center justify-between pt-[25px] pr-[40px] pb-[10px] pl-[20px]">
        <Button variant="ghost" iconSrc={backIcon} onClick={() => navigate(SUGGESTIONS_HUB_PATH)}>
          Back
        </Button>
        <div className="box-border flex items-center gap-[15px] pl-[15px]">
          {/* The way to the article itself; this page is its "Edited by AI" state. */}
          <Button variant="ghost" onClick={() => navigate(articleEditPath(state, articleId))}>
            Open article
          </Button>
          {primary ? (
            <Button variant="primary" onClick={primary.onClick}>
              {primary.label}
            </Button>
          ) : null}
        </div>
        <span
          aria-hidden
          className={cn(
            'pointer-events-none absolute right-0 bottom-0 left-0 h-px bg-legacy-table-border',
            'transition-opacity duration-150 ease-out motion-reduce:duration-100',
            scrolled ? 'opacity-100' : 'opacity-0',
          )}
        />
      </div>

      <div className="relative flex min-h-0 flex-1 flex-col">
        <div onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 0)} className="min-h-0 flex-1 overflow-y-auto">
          <div className="box-border flex flex-row items-start gap-[40px] pt-[40px] pr-[40px] pb-[80px] pl-[65px]">
            <ReviewArticleBody
              ref={articleRef}
              title={article.edits?.title ?? article.title}
              document={reviewDocument}
              states={bodyStates}
              className="w-full max-w-[720px] flex-1"
            />
            <SuggestionRail
              articleRef={articleRef}
              width={RAIL_WIDTH}
              items={railItems}
              activeId={activeId ?? undefined}
              className="mt-[27px]"
              summary={
                <SuggestionsSummaryCard
                  mode="terminal"
                  title={isHistory ? 'Suggestions' : AUTO_MODE_COPY.tag}
                  count={appliedCount}
                  countLabel={`${appliedCount} applied`}
                  summary={article.aiSummary ?? 'Hiver AI applied these suggestions from recent customer conversations.'}
                  historyNote={statusNote(state, articleId, auto.where, suggestions[0]?.autoAppliedAt, appliedCount)}
                  historyIcon={isHistory ? 'check_circle' : null}
                />
              }
            />
          </div>
        </div>
      </div>

      <SourcesSheet
        open={auto.sourcesFor !== null}
        onOpenChange={(open) => {
          if (!open) auto.setSourcesFor(null);
        }}
        sources={auto.sources}
      />
      <ConfirmModal
        open={confirmPublish}
        onOpenChange={setConfirmPublish}
        title="Publish changes?"
        message={publishMessage(state, articleId, appliedCount, revertedCount)}
        confirmLabel="Publish"
        cancelVariant="secondary"
        tone="primary"
        onConfirm={() => {
          setConfirmPublish(false);
          auto.publish();
          navigate(SUGGESTIONS_HUB_PATH);
        }}
      />
    </>
  );
}
