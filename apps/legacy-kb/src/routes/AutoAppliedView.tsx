import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { backIcon } from '../assets/legacy';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/cn';
import { firstName, whenText } from '../lib/format';
import { SUGGESTIONS_HUB_PATH } from '../lib/paths';
import { buildReviewDocument } from '../improvements/reviewDocument';
import { ReviewArticleBody, type BodySuggestionState } from '../improvements/ReviewArticleBody';
import { SourcesSheet } from '../improvements/SourcesSheet';
import { SuggestionCard } from '../improvements/SuggestionCard';
import { SuggestionRail, type SuggestionRailItem } from '../improvements/SuggestionRail';
import { SuggestionsSummaryCard } from '../improvements/SuggestionsSummaryCard';
import { useAutoApplied } from '../improvements/useAutoApplied';
import { selectReviewSession } from '../store/selectors';
import { useStore } from '../store/StoreContext';

/** Same rail width and spacing as the manual review. */
const RAIL_WIDTH = 340;

/**
 * Layout A — the manual review page in an "auto-applied" state, built
 * from the same pieces so a suggestion looks the same in both modes:
 *
 *   - summary card: "Auto-applied", how many are live, what they change,
 *     and "Applied automatically by Hiver AI · <when>";
 *   - each suggestion: the usual idle card (type + title); opening it
 *     shows the change in the article (red /
 *     green, as in manual review) and the card's one-line why, sources
 *     and a single Revert;
 *   - a reverted one recedes to the grey chip ("Reverted", Re-apply);
 *   - Mark as reviewed is the page's one primary button.
 */
export function AutoAppliedView({ articleId }: { articleId: string }) {
  const navigate = useNavigate();
  const { state } = useStore();
  const article = state.articles[articleId];
  const auto = useAutoApplied(articleId);
  const articleRef = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  // The pre-AI body + each suggestion, so the open one can show its change.
  const session = useMemo(
    () => selectReviewSession(state, articleId),
    [state.suggestions, state.aiReviewHistoryByArticle, article?.bodyHTML, articleId],
  );
  const suggestions = useMemo(() => auto.items.map((i) => i.suggestion), [auto.items]);
  const reviewDocument = useMemo(
    () => buildReviewDocument(session?.bodyHTML ?? '', suggestions),
    [session, suggestions],
  );
  const live = (id: string) => auto.items.find((i) => i.suggestion.id === id)?.live ?? false;

  // Opening a suggestion brings its change into view.
  useEffect(() => {
    if (!activeId) return;
    articleRef.current
      ?.querySelector<HTMLElement>(`[data-suggestion-id="${CSS.escape(activeId)}"]`)
      ?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [activeId]);

  const bodyStates = useMemo(() => {
    const out: Record<string, BodySuggestionState> = {};
    for (const s of suggestions) out[s.id] = s.id === activeId ? 'active' : live(s.id) ? 'accepted' : 'dismissed';
    return out;
  }, [suggestions, activeId, auto.items]);

  /** Next / previous live suggestion; from nothing open, the first / last one. */
  const step = (dir: 1 | -1) => {
    const liveIds = suggestions.filter((s) => live(s.id)).map((s) => s.id);
    const i = activeId ? liveIds.indexOf(activeId) : dir === 1 ? -1 : liveIds.length;
    const next = liveIds[i + dir];
    if (next) setActiveId(next);
  };

  const railItems = useMemo<SuggestionRailItem[]>(
    () =>
      suggestions.map((s, i) => {
        if (!live(s.id)) {
          return {
            id: s.id,
            node: (
              <SuggestionCard
                suggestion={s}
                state="dismissed"
                chipLabel="Reverted"
                chipActionLabel="Re-apply"
                onUndo={auto.toggle}
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
    [suggestions, activeId, auto.items, auto.toggle, auto.setSourcesFor],
  );

  if (!article || !session) return null;
  const liveCount = auto.items.filter((i) => i.live).length;
  const appliedAt = suggestions[0]?.autoAppliedAt;
  const review = state.autoReviewByArticle[articleId];
  const note = [
    `Applied automatically by Hiver AI${appliedAt ? ` ${whenText(appliedAt)}` : ''}`,
    review ? `reviewed by ${firstName(state, review.reviewedById)} ${whenText(review.reviewedAt)}` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <>
      <div className="relative box-border flex w-full shrink-0 flex-row items-center justify-between pt-[25px] pr-[40px] pb-[10px] pl-[20px]">
        <Button variant="ghost" iconSrc={backIcon} onClick={() => navigate(SUGGESTIONS_HUB_PATH)}>
          Back
        </Button>
        {auto.needsReview ? (
          <div className="box-border flex pl-[15px]">
            <Button variant="primary" onClick={auto.markReviewed}>
              Mark as reviewed
            </Button>
          </div>
        ) : null}
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
              title={article.title}
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
                  title="Auto-applied"
                  count={liveCount}
                  countLabel={`${liveCount} live`}
                  summary={article.aiSummary ?? 'Hiver AI applied these suggestions from recent customer conversations.'}
                  historyNote={note}
                  historyIcon={null}
                  navEnabled={liveCount > 0}
                  onPrev={() => step(-1)}
                  onNext={() => step(1)}
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
    </>
  );
}
