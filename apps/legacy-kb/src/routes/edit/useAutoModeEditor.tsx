import { useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { MaterialIcon } from '../../components/ui/MaterialIcon';
import { ConfirmModal } from '../../components/ui/Modal';
import { useToast } from '../../components/ui/Toast';
import { AiChangeMarkers } from '../../improvements/AiChangeMarkers';
import { AutoChangesView } from '../../improvements/AutoChangesView';
import { AutoAppliedPanel } from '../../improvements/AutoAppliedPanel';
import { SourcesSheet } from '../../improvements/SourcesSheet';
import { BannerCount, SuggestionsBanner } from '../../improvements/SuggestionsBanner';
import { useAutoApplied } from '../../improvements/useAutoApplied';
import { pluralize } from '../../lib/format';
import { autoSuggestionsPath, selectAutoChanges, selectAutoDraftBody, selectConversationSources } from '../../store/selectors';
import { useStore } from '../../store/StoreContext';
import type { Article } from '../../store/types';

type DraftConfirm = 'publish' | 'discard';

export interface AutoModeEditor {
  /** Above the editor: layout A's or B's banner, or the draft banner. */
  top: ReactNode;
  /** Layout B with changes shown: rendered in the editor's place (given the banner's height). */
  replaceEditor?: (heightOffset: number) => ReactNode;
  /** Draft option: the draft update's body, shown instead of the live one. */
  editorBody: string | undefined;
  readOnly: boolean;
  /** Changes when a suggestion is reverted / re-applied, so the editor reseeds. */
  editorKey: string;
  overlay: ReactNode;
  /** Sources sheet and confirm dialogs. */
  dialogs: ReactNode;
}

/**
 * The edit page's part in auto mode.
 *
 *   publish, layout A → a short banner: auto mode applied N suggestions,
 *                       "View suggestions" opens the article + rail view.
 *   publish, layout B → a one-line banner; "Show changes" swaps the editor
 *                       for the red / green view, a Revert under each change.
 *   draft (parked)    → the draft update, read-only, with Publish update /
 *                       Discard draft.
 */
export function useAutoModeEditor(article: Article | undefined): AutoModeEditor {
  const { state, dispatch } = useStore();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const option = state.autoModeOption;
  const articleId = article?.id ?? '';
  const applied = useAutoApplied(articleId);
  const [showChanges, setShowChanges] = useState(false);
  const [confirm, setConfirm] = useState<DraftConfirm | null>(null);
  const [draftSources, setDraftSources] = useState<string | null>(null);

  const changes = useMemo(
    () => (article ? selectAutoChanges(state, articleId) : []),
    [state.suggestions, state.aiReviewByArticle, state.aiReviewHistoryByArticle, article?.bodyHTML, articleId],
  );
  const draftBody = useMemo(
    () => (article && option === 'merge' ? selectAutoDraftBody(state, articleId) : undefined),
    [state.suggestions, state.aiReviewByArticle, article?.bodyHTML, articleId, option],
  );
  const editorKey = changes.map((c) => `${c.suggestion.id}:${c.status}`).join('|');
  const sourcesSheet = (open: string | null, close: () => void) => (
    <SourcesSheet
      open={open !== null}
      onOpenChange={(o) => {
        if (!o) close();
      }}
      sources={open ? selectConversationSources(state, open) : []}
    />
  );

  // ── Publish automatically ──
  if (option === 'publish') {
    const live = applied.items.filter((i) => i.live).length;
    if (!article || applied.items.length === 0) {
      return { top: null, editorBody: undefined, readOnly: false, editorKey, overlay: null, dialogs: null };
    }
    if (state.autoLayout === 'rail') {
      return {
        top:
          live > 0 ? (
            <SuggestionsBanner
              actionLabel="View suggestions"
              onAction={() => navigate(autoSuggestionsPath(state, articleId))}
            >
              {applied.where === 'live' ? (
                <>
                  Auto mode applied <BannerCount count={live} noun="Hiver AI suggestion" /> to this article.
                </>
              ) : applied.where === 'edits' ? (
                <>
                  Auto mode added <BannerCount count={live} noun="Hiver AI suggestion" /> to these unpublished edits. They go
                  live when the changes are published.
                </>
              ) : (
                <>
                  Auto mode added <BannerCount count={live} noun="Hiver AI suggestion" /> to this draft. They go live when
                  it’s published.
                </>
              )}
            </SuggestionsBanner>
          ) : null,
        editorBody: undefined,
        readOnly: false,
        editorKey,
        overlay: null,
        dialogs: null,
      };
    }
    return {
      top: (
        <AutoAppliedPanel
          items={applied.items}
          needsReview={applied.needsReview}
          open={showChanges}
          onOpenChange={setShowChanges}
          onMarkReviewed={() => {
            applied.markReviewed();
            setShowChanges(false);
          }}
        />
      ),
      replaceEditor: showChanges
        ? (heightOffset) => (
            <AutoChangesView
              title={article.title}
              baseBodyHTML={state.aiReviewHistoryByArticle[articleId]?.baseBodyHTML ?? article.bodyHTML}
              items={applied.items}
              heightOffset={heightOffset}
              onToggle={applied.toggle}
              onOpenSources={applied.setSourcesFor}
            />
          )
        : undefined,
      editorBody: undefined,
      readOnly: false,
      editorKey,
      overlay: null,
      dialogs: sourcesSheet(applied.sourcesFor, () => applied.setSourcesFor(null)),
    };
  }

  // ── Save as a draft (parked) ──
  return draftEditor();

  function draftEditor(): AutoModeEditor {
    const inDraft = changes.filter((c) => c.status === 'draft');
    const now = () => new Date().toISOString();
    const title = article?.title ?? '';
    const setInDraft = (id: string, included: boolean) =>
      dispatch({ type: 'aiReview/dispatch', articleId, action: { type: included ? 'accept' : 'reject', id } });
    return {
      top:
        article && draftBody !== undefined ? (
          <SuggestionsBanner
            secondaryAction={{ label: 'Discard draft', onClick: () => setConfirm('discard') }}
            {...(inDraft.length > 0 ? { actionLabel: 'Publish update', onAction: () => setConfirm('publish'), primary: true } : {})}
          >
            {inDraft.length > 0 ? (
              <>
                Hiver AI saved a draft update with <BannerCount count={inDraft.length} noun="change" />, marked{' '}
                <MaterialIcon name="auto_awesome" size={14} className="mx-[1px] align-[-2px] text-legacy-blue" /> in the
                margin. It isn’t live yet.
              </>
            ) : (
              <>Every change is out of Hiver AI’s draft update. Discard it to go back to editing.</>
            )}
          </SuggestionsBanner>
        ) : null,
      editorBody: draftBody,
      readOnly: draftBody !== undefined,
      editorKey,
      overlay:
        inDraft.length > 0 ? (
          <AiChangeMarkers
            changes={inDraft}
            option="merge"
            onUndo={(id) => {
              setInDraft(id, false);
              showToast('Removed from the draft update.', { label: 'Undo', onClick: () => setInDraft(id, true) });
            }}
            onOpenSources={setDraftSources}
          />
        ) : null,
      dialogs: article ? (
        <>
          {sourcesSheet(draftSources, () => setDraftSources(null))}
          <ConfirmModal
            open={confirm !== null}
            onOpenChange={(open) => {
              if (!open) setConfirm(null);
            }}
            title={confirm === 'publish' ? 'Publish update?' : 'Discard draft update?'}
            message={
              confirm === 'publish'
                ? `${pluralize(inDraft.length, 'change')} from Hiver AI will go live on “${title}”.`
                : 'Hiver AI’s draft update will be deleted. The live article stays as it is.'
            }
            confirmLabel={confirm === 'publish' ? 'Publish update' : 'Discard draft'}
            cancelVariant="secondary"
            tone={confirm === 'publish' ? 'primary' : 'danger'}
            onConfirm={() => {
              const action = confirm;
              setConfirm(null);
              if (action === 'publish') {
                dispatch({ type: 'aiReview/publish', articleId, modifierId: state.currentUserId, now: now() });
                showToast(`Update published to “${title}”.`);
              } else {
                dispatch({ type: 'ai/discardDraft', articleId, modifierId: state.currentUserId, now: now() });
                showToast('Draft update discarded.');
              }
            }}
          />
        </>
      ) : null,
    };
  }
}
