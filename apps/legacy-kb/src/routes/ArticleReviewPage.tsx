import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { backIcon } from '../assets/legacy';
import { Button } from '../components/ui/Button';
import { ConfirmModal } from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';
import { Tooltip } from '../components/ui/Tooltip';
import { cn } from '../lib/cn';
import { firstName, pluralize, whenText } from '../lib/format';
import { BackToSuggestion, type CardPlacement } from '../improvements/BackToSuggestion';
import { buildReviewDocument } from '../improvements/reviewDocument';
import { ReviewArticleBody, type BodySuggestionState } from '../improvements/ReviewArticleBody';
import { hasUndecidedNeighbour, type ReviewDecision } from '../improvements/reviewState';
import { smoothScrollTo } from '../improvements/smoothScrollTo';
import { SourcesSheet } from '../improvements/SourcesSheet';
import { SuggestionCard } from '../improvements/SuggestionCard';
import { SuggestionRail, type SuggestionRailItem } from '../improvements/SuggestionRail';
import { SuggestionsSummaryCard } from '../improvements/SuggestionsSummaryCard';
import { useArticleReview } from '../improvements/useArticleReview';
import { SUGGESTIONS_HUB_PATH } from '../lib/paths';
import { useStore } from '../store/StoreContext';
import { selectArticleBySlug, selectConversationSources, selectReviewSession } from '../store/selectors';
import type { AISuggestion } from '../store/types';
import { NotFound } from './NotFound';

/** Rail width; fits a 1470px viewport next to the 720px body. */
const RAIL_WIDTH = 340;
/** The active highlight's center lands at this fraction of the viewport. */
const SCROLL_FOCUS = 0.4;
const SCROLL_DURATION_MS = 400;
const FALLBACK_SUMMARY =
  'Hiver’s AI found ways to improve this article based on recent customer conversations. Review each suggestion below.';
/** Shown once part of the review is already live, so the batch summary no longer fits. */
const REMAINING_SUMMARY = 'The other changes from this review are already live. Decide on the rest below.';

/** How long the confirm button shows the loader before the work lands. */
const SUBMIT_DELAY_MS = 900;

type PrimaryAction = 'publish' | 'markReviewed';

interface DecisionCounts {
  accepted: number;
  dismissed: number;
  undecided: number;
}

function countDecisions(suggestions: AISuggestion[], decisions: Record<string, ReviewDecision>): DecisionCounts {
  let accepted = 0;
  let dismissed = 0;
  for (const s of suggestions) {
    if (decisions[s.id] === 'accepted') accepted += 1;
    else if (decisions[s.id] === 'dismissed') dismissed += 1;
  }
  return { accepted, dismissed, undecided: suggestions.length - accepted - dismissed };
}

/**
 * Top-bar action: Publish changes once anything is accepted or the text
 * was edited; Mark as reviewed when every suggestion is dismissed
 * (otherwise the article would sit in "To review" forever); a disabled
 * Publish changes until then.
 */
function primaryActionFor(counts: DecisionCounts, edited: boolean): { action: PrimaryAction; enabled: boolean } {
  if (counts.accepted > 0 || edited) return { action: 'publish', enabled: true };
  if (counts.undecided === 0) return { action: 'markReviewed', enabled: true };
  return { action: 'publish', enabled: false };
}

function publishMessage(counts: DecisionCounts, title: string, edited: boolean): string {
  const parts =
    counts.accepted === 0
      ? [`Your edits will go live on “${title}”.`]
      : [
          `${pluralize(counts.accepted, 'accepted suggestion')}${edited ? ' and your edits' : ''} will go live on “${title}”.`,
        ];
  if (counts.dismissed === 1) parts.push('The dismissed suggestion won’t change the article.');
  else if (counts.dismissed > 1) parts.push('Dismissed suggestions won’t change the article.');
  if (counts.undecided > 0) {
    parts.push(
      `${counts.undecided} ${counts.undecided === 1 ? 'suggestion is' : 'suggestions are'} still undecided and will stay in your review list.`,
    );
  }
  return parts.join(' ');
}

const CONFIRM_COPY: Record<
  PrimaryAction,
  {
    title: string;
    message: (counts: DecisionCounts, title: string, edited: boolean) => string;
    confirmLabel: string;
    loadingLabel: string;
    toast: (title: string) => string;
  }
> = {
  publish: {
    title: 'Publish changes?',
    message: publishMessage,
    confirmLabel: 'Publish',
    loadingLabel: 'Publishing…',
    toast: (title) => `Changes published to “${title}”.`,
  },
  markReviewed: {
    title: 'Mark as reviewed?',
    message: (_counts, title) => `No changes will be made to “${title}”.`,
    confirmLabel: 'Mark as reviewed',
    loadingLabel: 'Marking as reviewed…',
    toast: (title) => `Marked “${title}” as reviewed.`,
  },
};

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
  const { state, dispatch } = useStore();
  const { showToast } = useToast();
  const article = state.articles[articleId];
  const [review, send] = useArticleReview(articleId);

  // Keyed on the slices that shape the session (not the whole store), so
  // unrelated dispatches don't hand the scroll effect a new identity.
  const session = useMemo(
    () => selectReviewSession(state, articleId),
    [state.suggestions, state.aiReviewHistoryByArticle, article?.bodyHTML, articleId],
  );
  const isHistory = session?.kind === 'history';
  const suggestions = useMemo(() => session?.suggestions ?? [], [session]);
  const reviewDocument = useMemo(
    () => buildReviewDocument(session?.bodyHTML ?? '', suggestions),
    [session, suggestions],
  );
  const sources = useMemo(
    () => (review.sourcesFor ? selectConversationSources(state, review.sourcesFor) : []),
    [state.conversationSources, review.sourcesFor],
  );

  // History: every suggestion is final; the review replays read-only.
  const mode = isHistory ? 'terminal' : review.mode;
  const decisions = session?.kind === 'history' ? session.decisions : review.decisions;
  const activeSuggestion = review.activeIndex >= 0 ? suggestions[review.activeIndex] : undefined;
  const remaining = suggestions.length - Object.keys(decisions).length;
  const canGoPrev = hasUndecidedNeighbour(suggestions, decisions, review.activeIndex, 'prev');
  const canGoNext = hasUndecidedNeighbour(suggestions, decisions, review.activeIndex, 'next');

  const counts = countDecisions(suggestions, decisions);
  /** The reviewer changed the article text here (saved on blur). */
  const [edited, setEdited] = useState(false);
  const primary = primaryActionFor(counts, edited);
  const [confirm, setConfirm] = useState<PrimaryAction | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const submitTimer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(submitTimer.current), []);

  const submit = (action: PrimaryAction) => {
    if (!article || submitting) return;
    setSubmitting(true);
    const title = article.title;
    submitTimer.current = window.setTimeout(() => {
      // One transition so the store update and the route change commit
      // together — the review never flashes its post-publish state.
      startTransition(() => {
        dispatch({
          type: 'aiReview/publish',
          articleId,
          modifierId: state.currentUserId,
          now: new Date().toISOString(),
          edited,
        });
        navigate(SUGGESTIONS_HUB_PATH);
      });
      showToast(CONFIRM_COPY[action].toast(title));
    }, SUBMIT_DELAY_MS);
  };

  const scrollRef = useRef<HTMLDivElement>(null);
  const articleRef = useRef<HTMLElement>(null);
  /** Drives the top bar's divider: shown only once content is under it. */
  const [scrolled, setScrolled] = useState(false);

  const activeId = mode === 'reviewing' ? activeSuggestion?.id : undefined;

  /** False while the page scrolls itself, so the pill never flashes mid-glide. */
  const [settled, setSettled] = useState(true);
  const settleTimer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(settleTimer.current), []);

  /** Brings the active highlight to 40% of the viewport. */
  const scrollToActive = useCallback(() => {
    const scroller = scrollRef.current;
    const el = activeId
      ? articleRef.current?.querySelector<HTMLElement>(`[data-suggestion-id="${CSS.escape(activeId)}"]`)
      : null;
    if (!scroller || !el) return;
    const scrollerRect = scroller.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const centerFromTop = elRect.top - scrollerRect.top + elRect.height / 2;
    const target = Math.max(0, scroller.scrollTop + centerFromTop - scrollerRect.height * SCROLL_FOCUS);
    setSettled(false);
    window.clearTimeout(settleTimer.current);
    settleTimer.current = window.setTimeout(() => setSettled(true), SCROLL_DURATION_MS + 60);
    smoothScrollTo({ target, duration: SCROLL_DURATION_MS, scrollElement: scroller });
  }, [activeId]);

  /* Scroll when the active suggestion or the mode changes — keyed on the
     id, not the suggestion list, so saving an edit never yanks the page. */
  useEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller) return;
    if (mode !== 'reviewing') {
      smoothScrollTo({ target: 0, duration: SCROLL_DURATION_MS, scrollElement: scroller });
      return;
    }
    scrollToActive();
  }, [mode, scrollToActive]);

  /* Where the active card is relative to the viewport. Under half of it
     on screen counts as gone: the pill offers the way back, and Y / N
     bring it back instead of deciding on something out of sight. */
  const [placement, setPlacement] = useState<CardPlacement>('visible');
  const placementRef = useRef<CardPlacement>('visible');
  placementRef.current = placement;
  useEffect(() => {
    setPlacement('visible');
    const scroller = scrollRef.current;
    const card = activeId
      ? scroller?.querySelector<HTMLElement>(`[data-rail-card-id="${CSS.escape(activeId)}"]`)
      : null;
    if (!scroller || !card) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.intersectionRatio >= 0.5) setPlacement('visible');
        else setPlacement(entry.boundingClientRect.top < (entry.rootBounds?.top ?? 0) ? 'above' : 'below');
      },
      { root: scroller, threshold: [0, 0.5, 1] },
    );
    io.observe(card);
    return () => io.disconnect();
  }, [activeId]);

  /* Rail column, in the scroll area's coordinates, for the pill. */
  const [railBox, setRailBox] = useState({ left: 0, width: RAIL_WIDTH });
  useEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller) return;
    const measure = () => {
      const rail = scroller.querySelector<HTMLElement>('aside[aria-label="AI suggestions"]');
      if (!rail) return;
      const left = rail.getBoundingClientRect().left - scroller.getBoundingClientRect().left;
      setRailBox((prev) => (prev.left === left ? prev : { left, width: rail.offsetWidth }));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(scroller);
    return () => ro.disconnect();
  }, []);

  /* Keyboard: J/↓ next, K/↑ previous, Y/Enter accept, N dismiss. */
  useEffect(() => {
    // The confirm dialog owns the keyboard while it is open.
    if (mode !== 'reviewing' || confirm !== null) return;
    if (review.sourcesFor !== null) {
      const onEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') send({ type: 'closeSources' });
      };
      window.addEventListener('keydown', onEscape);
      return () => window.removeEventListener('keydown', onEscape);
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey || isOwnedByFocusedControl(e)) return;
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
        case 'n':
          if (!activeId) return;
          e.preventDefault();
          if (placementRef.current !== 'visible') scrollToActive();
          else send({ type: e.key === 'n' ? 'reject' : 'accept', id: activeId });
          break;
        default:
          break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mode, confirm, review.sourcesFor, activeId, scrollToActive, send]);

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
                onUndo={isHistory ? undefined : (id) => send({ type: 'undo', id })}
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
              onActivate={isHistory ? undefined : (id) => send({ type: 'activateSuggestion', id })}
            />
          ),
        };
      }),
    [suggestions, decisions, mode, activeSuggestion, isHistory, send, canGoPrev, canGoNext],
  );

  if (!article || !session) return null;
  const partlyLive = !isHistory && state.aiReviewHistoryByArticle[articleId] !== undefined;
  const summary = partlyLive ? REMAINING_SUMMARY : (article.aiSummary ?? FALLBACK_SUMMARY);
  const confirmCopy = confirm ? CONFIRM_COPY[confirm] : undefined;
  const history = state.aiReviewHistoryByArticle[articleId];
  const historyNote =
    isHistory && history
      ? `${history.published ? 'Published' : 'Marked as reviewed'} by ${firstName(state, history.reviewedById)} ${whenText(history.reviewedAt)}`
      : undefined;

  return (
    <>
      <div className="relative box-border flex w-full shrink-0 flex-row items-center justify-between pt-[25px] pr-[40px] pb-[10px] pl-[20px]">
        <Button variant="ghost" iconSrc={backIcon} onClick={() => navigate(SUGGESTIONS_HUB_PATH)}>
          Back
        </Button>
        {isHistory ? null : (
          <div className="box-border flex pl-[15px]">
            <Tooltip
              content={primary.enabled ? undefined : 'Accept a suggestion or edit the article to publish'}
              placement="bottom-end"
              className="cursor-default"
            >
              <Button
                variant="primary"
                aria-disabled={primary.enabled ? undefined : true}
                onClick={() => {
                  if (primary.enabled) setConfirm(primary.action);
                }}
              >
                {primary.action === 'markReviewed' ? 'Mark as reviewed' : 'Publish changes'}
              </Button>
            </Tooltip>
          </div>
        )}
        {/* 1px table-border rule that fades in once the page scrolls, so
            content passing under the bar reads as scrolled, not clipped.
            Opacity-only already; reduced motion just shortens it. */}
        <span
          aria-hidden
          data-part="review-topbar-divider"
          className={cn(
            'pointer-events-none absolute right-0 bottom-0 left-0 h-px bg-legacy-table-border',
            'transition-opacity duration-150 ease-out motion-reduce:duration-100',
            scrolled ? 'opacity-100' : 'opacity-0',
          )}
        />
      </div>

      <div className="relative flex min-h-0 flex-1 flex-col">
        <div
          ref={scrollRef}
          onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 0)}
          className="min-h-0 flex-1 overflow-y-auto"
        >
          <div className="box-border flex flex-row items-start gap-[40px] pt-[40px] pr-[40px] pb-[80px] pl-[65px]">
            <ReviewArticleBody
              ref={articleRef}
              title={article.title}
              document={reviewDocument}
              states={bodyStates}
              onDirty={isHistory ? undefined : () => setEdited(true)}
              onActivateSuggestion={isHistory ? undefined : (id) => send({ type: 'activateSuggestion', id })}
              onEdit={
                isHistory
                  ? undefined
                  : (bodyHTML) => {
                      if (bodyHTML !== article.bodyHTML) dispatch({ type: 'article/updateBody', articleId, bodyHTML });
                    }
              }
              className="w-full max-w-[720px] flex-1"
            />
            <SuggestionRail
              articleRef={articleRef}
              width={RAIL_WIDTH}
              items={railItems}
              activeId={activeId}
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
                  historyNote={historyNote}
                />
              }
            />
          </div>
        </div>
        {placement !== 'visible' && settled && activeId ? (
          <BackToSuggestion
            placement={placement}
            position={{ index: review.activeIndex + 1, total: suggestions.length }}
            left={railBox.left}
            width={railBox.width}
            onClick={scrollToActive}
          />
        ) : null}
      </div>

      <SourcesSheet
        open={review.sourcesFor !== null}
        onOpenChange={(open) => {
          if (!open) send({ type: 'closeSources' });
        }}
        sources={sources}
      />

      <ConfirmModal
        open={confirmCopy !== undefined}
        onOpenChange={(open) => {
          if (open) return;
          // Closing mid-publish cancels it: nothing has been written yet.
          window.clearTimeout(submitTimer.current);
          setSubmitting(false);
          setConfirm(null);
        }}
        title={confirmCopy?.title ?? ''}
        message={confirmCopy?.message(counts, article.title, edited) ?? ''}
        confirmLabel={confirmCopy?.confirmLabel ?? ''}
        loadingLabel={confirmCopy?.loadingLabel}
        cancelVariant="secondary"
        tone="primary"
        loading={submitting}
        onConfirm={() => {
          if (confirm) submit(confirm);
        }}
      />
    </>
  );
}

/**
 * `/product/ai/suggestions/:articleSlug` — AI suggestions review for one
 * article, inside the old app shell. Back returns to the hub.
 */
export function ArticleReviewPage() {
  const { articleSlug } = useParams();
  const { state } = useStore();
  const article = selectArticleBySlug(state, articleSlug);

  if (!article) {
    return <NotFound title="This article doesn’t exist" message="It may have been moved or deleted." />;
  }
  if (!selectReviewSession(state, article.id)) {
    return (
      <NotFound title="No suggestions to review" message="Hiver’s AI hasn’t suggested any changes to this article." />
    );
  }
  return <ReviewSession key={article.id} articleId={article.id} />;
}
