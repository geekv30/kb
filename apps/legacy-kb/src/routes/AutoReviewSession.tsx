import { startTransition, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { backIcon } from '../assets/legacy';
import { Button } from '../components/ui/Button';
import { MaterialIcon } from '../components/ui/MaterialIcon';
import { ConfirmModal } from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';
import { cn } from '../lib/cn';
import { pluralize, whenText } from '../lib/format';
import { SUGGESTIONS_HUB_PATH } from '../lib/paths';
import { AutoChangeCard, type AutoChangeState } from '../improvements/AutoChangeCard';
import { AUTO_MODE_COPY } from '../improvements/autoModeCopy';
import { buildReviewDocument } from '../improvements/reviewDocument';
import { ReviewArticleBody, type BodySuggestionState } from '../improvements/ReviewArticleBody';
import { AIMark, CountPill } from '../improvements/ReviewAtoms';
import { SourcesSheet } from '../improvements/SourcesSheet';
import { SuggestionRail, type SuggestionRailItem } from '../improvements/SuggestionRail';
import { useArticleReview } from '../improvements/useArticleReview';
import { selectConversationSources, selectReviewSession } from '../store/selectors';
import { useStore } from '../store/StoreContext';

/** Same rail and timing as the manual review. */
const RAIL_WIDTH = 340;
const SUBMIT_DELAY_MS = 900;

type MergeAction = 'merge' | 'discard';

const MERGE_COPY: Record<
  MergeAction,
  { title: string; confirmLabel: string; loadingLabel: string; toast: (title: string) => string }
> = {
  merge: {
    title: 'Merge into live?',
    confirmLabel: 'Merge',
    loadingLabel: 'Merging…',
    toast: (title) => `Merged the improved version into “${title}”.`,
  },
  discard: {
    title: 'Discard this version?',
    confirmLabel: 'Discard',
    loadingLabel: 'Discarding…',
    toast: (title) => `Discarded the improved version of “${title}”.`,
  },
};

function mergeMessage(action: MergeAction, kept: number, removed: number, title: string): string {
  if (action === 'discard') return `No changes will be made to “${title}”.`;
  const parts = [`${pluralize(kept, 'change')} will go live on “${title}”.`];
  if (removed > 0) parts.push(`${removed === 1 ? 'The change you removed' : 'The changes you removed'} won’t be applied.`);
  return parts.join(' ');
}

/**
 * Summary at the top of the rail: what the batch does, how many changes
 * are in it, and when Hiver AI applied (or prepared) it.
 */
function AutoSummaryCard({ title, count, summary, note }: { title: string; count: number; summary: string; note: string }) {
  return (
    <section
      aria-label={title}
      className="box-border rounded-[5px] border border-solid border-legacy-input-border bg-white px-[16px] pt-[8px] pb-[16px] font-inter"
    >
      <div className="flex h-[32px] items-center gap-[8px]">
        <AIMark size={20} />
        <h2 className="m-0 p-0 text-[14px] leading-[17px] font-medium text-legacy-ink">{title}</h2>
        <CountPill count={count} label={pluralize(count, 'change')} />
      </div>
      <p className="m-0 p-0 text-[13px] leading-[20px] font-normal text-legacy-body">{summary}</p>
      <p className="m-0 mt-[12px] flex items-start gap-[6px] border-0 border-t border-solid border-legacy-input-border p-0 pt-[12px] text-[13px] leading-[20px] font-medium text-legacy-meta">
        <MaterialIcon name="schedule" size={16} className="mt-[2px] shrink-0 text-legacy-meta" />
        {note}
      </p>
    </section>
  );
}

export interface AutoReviewSessionProps {
  articleId: string;
}

/**
 * The review view for a batch Hiver AI handled in auto mode.
 *
 *   publish → the article as it is live now, every applied change marked
 *             up. Undo restores a change's original text on the live
 *             article straight away; Reapply puts it back.
 *   merge   → the improved version, every change pre-accepted. Remove /
 *             Add back shape the version; "Merge into live" publishes it
 *             (or "Discard version" once everything is removed).
 */
export function AutoReviewSession({ articleId }: AutoReviewSessionProps) {
  const navigate = useNavigate();
  const { state, dispatch } = useStore();
  const { showToast } = useToast();
  const article = state.articles[articleId];
  const option = state.autoModeOption;
  const copy = AUTO_MODE_COPY[option];
  const [review, send] = useArticleReview(articleId);

  const session = useMemo(
    () => selectReviewSession(state, articleId),
    [state.suggestions, state.aiReviewHistoryByArticle, article?.bodyHTML, articleId],
  );
  const suggestions = useMemo(() => session?.suggestions ?? [], [session]);
  const reviewDocument = useMemo(() => buildReviewDocument(session?.bodyHTML ?? '', suggestions), [session, suggestions]);

  // Sources are local: in the publish option nothing is pending, so the
  // review state machine has no items to open them against.
  const [sourcesFor, setSourcesFor] = useState<string | null>(null);
  const sources = useMemo(
    () => (sourcesFor ? selectConversationSources(state, sourcesFor) : []),
    [state.conversationSources, sourcesFor],
  );

  /** Kept in the article: applied (publish) or still in the version (merge). */
  const isKept = (id: string): boolean =>
    session?.kind === 'history' ? session.decisions[id] === 'accepted' : review.decisions[id] !== 'dismissed';
  const keptCount = suggestions.filter((s) => isKept(s.id)).length;
  const removedCount = suggestions.length - keptCount;

  const toggle = (id: string) => {
    if (!article) return;
    if (option === 'publish') {
      const wasApplied = isKept(id);
      dispatch({ type: 'ai/toggleAutoChange', suggestionId: id, modifierId: state.currentUserId, now: new Date().toISOString() });
      showToast(wasApplied ? 'Change undone. The original text is live again.' : 'Change reapplied to the live article.');
      return;
    }
    send({ type: isKept(id) ? 'reject' : 'accept', id });
  };

  const [confirm, setConfirm] = useState<MergeAction | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const submitTimer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(submitTimer.current), []);
  const submit = (action: MergeAction) => {
    if (!article || submitting) return;
    setSubmitting(true);
    const title = article.title;
    submitTimer.current = window.setTimeout(() => {
      startTransition(() => {
        dispatch({ type: 'aiReview/publish', articleId, modifierId: state.currentUserId, now: new Date().toISOString() });
        navigate(SUGGESTIONS_HUB_PATH);
      });
      showToast(MERGE_COPY[action].toast(title));
    }, SUBMIT_DELAY_MS);
  };

  const articleRef = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);

  const bodyStates = useMemo(() => {
    const out: Record<string, BodySuggestionState> = {};
    for (const s of suggestions) out[s.id] = isKept(s.id) ? 'diff' : 'dismissed';
    return out;
  }, [suggestions, session, review.decisions]);

  const railItems = useMemo<SuggestionRailItem[]>(
    () =>
      suggestions.map((s) => {
        const kept = isKept(s.id);
        const cardState: AutoChangeState =
          option === 'publish' ? (kept ? 'applied' : 'undone') : kept ? 'included' : 'removed';
        return {
          id: s.id,
          node: <AutoChangeCard suggestion={s} state={cardState} onToggle={toggle} onOpenSources={setSourcesFor} />,
        };
      }),
    [suggestions, session, review.decisions, option],
  );

  if (!article || !session) return null;
  const appliedAt = suggestions.find((s) => s.autoAppliedAt)?.autoAppliedAt;
  const mergeAction: MergeAction = keptCount > 0 ? 'merge' : 'discard';
  const confirmCopy = confirm ? MERGE_COPY[confirm] : undefined;

  return (
    <>
      <div className="relative box-border flex w-full shrink-0 flex-row items-center justify-between pt-[25px] pr-[40px] pb-[10px] pl-[20px]">
        <Button variant="ghost" iconSrc={backIcon} onClick={() => navigate(SUGGESTIONS_HUB_PATH)}>
          Back
        </Button>
        {option === 'merge' ? (
          <div className="box-border flex pl-[15px]">
            <Button variant="primary" onClick={() => setConfirm(mergeAction)}>
              {mergeAction === 'merge' ? 'Merge into live' : 'Discard version'}
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
              className="mt-[27px]"
              summary={
                <AutoSummaryCard
                  title={copy.reviewTitle}
                  count={keptCount}
                  summary={article.aiSummary ?? ''}
                  note={copy.reviewNote(appliedAt ? whenText(appliedAt) : 'recently')}
                />
              }
            />
          </div>
        </div>
      </div>

      <SourcesSheet
        open={sourcesFor !== null}
        onOpenChange={(open) => {
          if (!open) setSourcesFor(null);
        }}
        sources={sources}
      />

      <ConfirmModal
        open={confirmCopy !== undefined}
        onOpenChange={(open) => {
          if (open) return;
          window.clearTimeout(submitTimer.current);
          setSubmitting(false);
          setConfirm(null);
        }}
        title={confirmCopy?.title ?? ''}
        message={confirm ? mergeMessage(confirm, keptCount, removedCount, article.title) : ''}
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
