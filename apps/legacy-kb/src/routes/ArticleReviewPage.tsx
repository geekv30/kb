import { useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { backIcon } from '../assets/legacy';
import { Button } from '../components/ui/Button';
import { buildReviewDocument } from '../improvements/reviewDocument';
import { ReviewArticleBody, type BodySuggestionState } from '../improvements/ReviewArticleBody';
import { hasUndecidedNeighbour, isPublishEnabled, type ReviewDecision } from '../improvements/reviewState';
import { smoothScrollTo } from '../improvements/smoothScrollTo';
import { SourcesSheet } from '../improvements/SourcesSheet';
import { SuggestionCard } from '../improvements/SuggestionCard';
import { SuggestionRail, type SuggestionRailItem } from '../improvements/SuggestionRail';
import { SuggestionsSummaryCard } from '../improvements/SuggestionsSummaryCard';
import { useArticleReview } from '../improvements/useArticleReview';
import { useStore } from '../store/StoreContext';
import { selectArticleBySlug, selectConversationSources, selectReviewSuggestions } from '../store/selectors';
import type { AISuggestion } from '../store/types';
import { NotFound } from './NotFound';

/** Rail width; fits a 1470px viewport next to the 720px body. */
const RAIL_WIDTH = 340;
/** The active highlight's center lands at this fraction of the viewport. */
const SCROLL_FOCUS = 0.4;
const SCROLL_DURATION_MS = 400;

const FALLBACK_SUMMARY =
  'Hiver’s AI found ways to improve this article based on recent customer conversations. Review each suggestion below.';

/** Once published from review, every suggestion reads as decided (accepted). */
function historicalDecisions(suggestions: AISuggestion[]): Record<string, ReviewDecision> {
  const out: Record<string, ReviewDecision> = {};
  for (const s of suggestions) {
    if (s.status === 'accepted' || s.status === 'dismissed') out[s.id] = s.status;
    else if (s.status === 'published') out[s.id] = 'accepted';
  }
  return out;
}

/** Keys that belong to a focused control rather than to the review shortcuts. */
function isOwnedByFocusedControl(e: KeyboardEvent): boolean {
  const target = e.target as HTMLElement | null;
  if (!target) return false;
  if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return true;
  return e.key === 'Enter' && Boolean(target.closest('button, a[href], [role="button"]'));
}

interface ReviewSessionProps {
  articleId: string;
}

function ReviewSession({ articleId }: ReviewSessionProps) {
  const navigate = useNavigate();
  const { state } = useStore();
  const article = state.articles[articleId];
  const [review, send] = useArticleReview(articleId);

  // Keyed on the slices that shape the list (not the whole store), so
  // unrelated dispatches don't hand the scroll effect a new identity.
  const suggestions = useMemo(
    () => selectReviewSuggestions(state, articleId),
    [state.suggestions, article?.bodyHTML, articleId],
  );
  const reviewDocument = useMemo(
    () => buildReviewDocument(article?.bodyHTML ?? '', suggestions),
    [article?.bodyHTML, suggestions],
  );
  const sources = useMemo(
    () => selectConversationSources(state, articleId),
    [state.conversationSources, articleId],
  );

  const alreadyPublished = suggestions.length > 0 && suggestions.every((s) => s.status === 'published');
  const mode = alreadyPublished ? 'terminal' : review.mode;
  const decisions = alreadyPublished ? historicalDecisions(suggestions) : review.decisions;
  const activeSuggestion = review.activeIndex >= 0 ? suggestions[review.activeIndex] : undefined;
  const remaining = suggestions.length - Object.keys(decisions).length;
  const canGoPrev = hasUndecidedNeighbour(suggestions, decisions, review.activeIndex, 'prev');
  const canGoNext = hasUndecidedNeighbour(suggestions, decisions, review.activeIndex, 'next');

  const scrollRef = useRef<HTMLDivElement>(null);
  const articleRef = useRef<HTMLElement>(null);

  /* Scroll: active highlight to 40% of the viewport; top otherwise. */
  useEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller) return;
    if (mode !== 'reviewing') {
      smoothScrollTo({ target: 0, duration: SCROLL_DURATION_MS, scrollElement: scroller });
      return;
    }
    const id = suggestions[review.activeIndex]?.id;
    const el = id ? articleRef.current?.querySelector<HTMLElement>(`[data-suggestion-id="${CSS.escape(id)}"]`) : null;
    if (!el) return;
    const scrollerRect = scroller.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const centerFromTop = elRect.top - scrollerRect.top + elRect.height / 2;
    const target = Math.max(0, scroller.scrollTop + centerFromTop - scrollerRect.height * SCROLL_FOCUS);
    smoothScrollTo({ target, duration: SCROLL_DURATION_MS, scrollElement: scroller });
  }, [mode, review.activeIndex, suggestions]);

  /* Keyboard: J/↓ next, K/↑ previous, Y/Enter accept, N dismiss. */
  useEffect(() => {
    if (mode !== 'reviewing') return;
    if (review.sourcesFor !== null) {
      const onEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') send({ type: 'closeSources' });
      };
      window.addEventListener('keydown', onEscape);
      return () => window.removeEventListener('keydown', onEscape);
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey || isOwnedByFocusedControl(e)) return;
      const activeId = activeSuggestion?.id;
      switch (e.key) {
        case 'j':
        case 'ArrowDown':
          e.preventDefault();
          send({ type: 'next' });
          break;
        case 'k':
        case 'ArrowUp':
          e.preventDefault();
          send({ type: 'prev' });
          break;
        case 'y':
        case 'Enter':
          if (!activeId) return;
          e.preventDefault();
          send({ type: 'accept', id: activeId });
          break;
        case 'n':
          if (!activeId) return;
          e.preventDefault();
          send({ type: 'reject', id: activeId });
          break;
        default:
          break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mode, review.sourcesFor, activeSuggestion, send]);

  const bodyStates = useMemo(() => {
    const out: Record<string, BodySuggestionState> = {};
    suggestions.forEach((s, i) => {
      out[s.id] = decisions[s.id] ?? (mode === 'reviewing' && i === review.activeIndex ? 'active' : 'inactive');
    });
    return out;
  }, [suggestions, decisions, mode, review.activeIndex]);

  const railItems = useMemo<SuggestionRailItem[]>(
    () =>
      suggestions.map((s, i) => {
        const decision = decisions[s.id];
        if (decision) {
          return {
            id: s.id,
            node: (
              <SuggestionCard
                suggestion={s}
                state={decision}
                onUndo={alreadyPublished ? undefined : (id) => send({ type: 'undo', id })}
              />
            ),
          };
        }
        if (mode === 'reviewing' && s.id === activeSuggestion?.id) {
          return {
            id: s.id,
            node: (
              <SuggestionCard
                suggestion={s}
                state="active"
                onPrev={() => send({ type: 'prev' })}
                onNext={() => send({ type: 'next' })}
                onOpenSources={(id) => send({ type: 'openSources', id })}
                onAccept={(id) => send({ type: 'accept', id })}
                onReject={(id) => send({ type: 'reject', id })}
                canGoPrev={canGoPrev}
                canGoNext={canGoNext}
                position={{ index: i + 1, total: suggestions.length }}
              />
            ),
          };
        }
        return {
          id: s.id,
          node: (
            <SuggestionCard
              suggestion={s}
              state="idle"
              onActivate={alreadyPublished ? undefined : (id) => send({ type: 'activateSuggestion', id })}
              onAccept={alreadyPublished ? undefined : (id) => send({ type: 'accept', id })}
              onReject={alreadyPublished ? undefined : (id) => send({ type: 'reject', id })}
            />
          ),
        };
      }),
    [suggestions, decisions, mode, activeSuggestion, alreadyPublished, send, canGoPrev, canGoNext],
  );

  if (!article) return null;
  const category = state.categories[article.categoryId];
  const editPath = `/product/category/${category?.slug ?? 'getting-started'}/article/edit/${article.slug}`;
  const summary = article.aiSummary ?? FALLBACK_SUMMARY;

  return (
    <>
      <div className="box-border flex w-full shrink-0 flex-row items-center justify-between pt-[25px] pr-[40px] pb-[10px] pl-[20px]">
        <Button variant="ghost" iconSrc={backIcon} onClick={() => navigate(editPath)}>
          Back
        </Button>
        <div className="box-border flex pl-[15px]">
          <Button
            variant="primary"
            disabled={!isPublishEnabled(decisions) || alreadyPublished}
            onClick={() => {
              // TODO(chunk 4): publish — write applyDecisions(article.bodyHTML,
              // suggestions, decisions) to the article and mark suggestions published.
            }}
          >
            Publish changes
          </Button>
        </div>
      </div>

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
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
            activeId={mode === 'reviewing' ? activeSuggestion?.id : undefined}
            className="mt-[27px]"
            summary={
              <SuggestionsSummaryCard
                mode={mode}
                count={mode === 'reviewing' ? remaining : suggestions.length}
                summary={summary}
                onReview={() => {
                  const firstId = suggestions[0]?.id;
                  if (firstId) send({ type: 'activateSuggestion', id: firstId });
                }}
                onPrev={() => send({ type: 'prev' })}
                onNext={() => send({ type: 'next' })}
              />
            }
          />
        </div>
      </div>

      <SourcesSheet
        open={review.sourcesFor !== null}
        onOpenChange={(open) => {
          if (!open) send({ type: 'closeSources' });
        }}
        sources={sources}
      />
    </>
  );
}

/**
 * `/product/category/:categorySlug/article/review/:articleSlug` — AI
 * suggestions review for one article, inside the old app shell.
 */
export function ArticleReviewPage() {
  const { articleSlug } = useParams();
  const { state } = useStore();
  const article = selectArticleBySlug(state, articleSlug);

  if (!article) {
    return <NotFound title="This article doesn’t exist" message="It may have been moved or deleted." />;
  }
  if (selectReviewSuggestions(state, article.id).length === 0) {
    return (
      <NotFound title="No suggestions to review" message="Hiver’s AI hasn’t suggested any changes to this article." />
    );
  }
  return <ReviewSession key={article.id} articleId={article.id} />;
}
