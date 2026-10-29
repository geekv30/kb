import { useMemo, useState, type ReactNode } from 'react';
import { MaterialIcon } from '../../components/ui/MaterialIcon';
import { ConfirmModal } from '../../components/ui/Modal';
import { useToast } from '../../components/ui/Toast';
import { AiChangeMarkers } from '../../improvements/AiChangeMarkers';
import { SourcesSheet } from '../../improvements/SourcesSheet';
import { BannerCount, type SuggestionsBannerProps } from '../../improvements/SuggestionsBanner';
import { pluralize } from '../../lib/format';
import { selectAutoChanges, selectAutoDraftBody, selectConversationSources } from '../../store/selectors';
import { useStore } from '../../store/StoreContext';
import type { Article } from '../../store/types';

type DraftConfirm = 'publish' | 'discard';

/** "marked ✦ in the margin", with the same sparkle the markers use. */
const MARGIN_HINT = (
  <>
    marked <MaterialIcon name="auto_awesome" size={14} className="mx-[1px] align-[-2px] text-legacy-blue" /> in the
    margin
  </>
);

export interface AutoModeEditor {
  /** Banner over the editor, or `undefined` when nothing needs a look. */
  banner: Omit<SuggestionsBannerProps, 'children'> & { children: ReactNode } | undefined;
  /** Merge option: the draft update's body, shown instead of the live one. */
  editorBody: string | undefined;
  readOnly: boolean;
  /** Changes when an AI change is applied or taken back, so the editor reseeds. */
  editorKey: string;
  overlay: ReactNode;
  /** Sources sheet and confirm dialogs. */
  dialogs: ReactNode;
}

/**
 * Everything the edit page needs for an article Hiver AI changed in auto
 * mode: the banner that says so, the markers on each changed paragraph
 * and what Keep / Restore original / Remove from draft do.
 *
 *   publish → the editor shows the live article; restoring a change puts
 *             the original back live at once (with Undo in the toast).
 *   merge   → the editor shows Hiver AI's draft update, read-only until
 *             it's published or discarded.
 */
export function useAutoModeEditor(article: Article | undefined): AutoModeEditor {
  const { state, dispatch } = useStore();
  const { showToast } = useToast();
  const option = state.autoModeOption;
  const articleId = article?.id ?? '';

  const changes = useMemo(
    () => (article ? selectAutoChanges(state, articleId) : []),
    [state.suggestions, state.aiReviewByArticle, state.aiReviewHistoryByArticle, article?.bodyHTML, articleId],
  );
  const draftBody = useMemo(
    () => (article && option === 'merge' ? selectAutoDraftBody(state, articleId) : undefined),
    [state.suggestions, state.aiReviewByArticle, article?.bodyHTML, articleId, option],
  );
  const unchecked = changes.filter((c) => c.unchecked);
  const inDraft = changes.filter((c) => c.status === 'draft');

  const [sourcesFor, setSourcesFor] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<DraftConfirm | null>(null);
  const now = () => new Date().toISOString();

  const keep = (id: string) => dispatch({ type: 'ai/keepAutoChange', suggestionId: id });
  const toggleLive = (id: string) =>
    dispatch({ type: 'ai/toggleAutoChange', suggestionId: id, modifierId: state.currentUserId, now: now() });
  const setInDraft = (id: string, included: boolean) =>
    dispatch({ type: 'aiReview/dispatch', articleId, action: { type: included ? 'accept' : 'reject', id } });

  const undo = (id: string) => {
    if (option === 'publish') {
      toggleLive(id);
      showToast('Original text restored on the live article.', { label: 'Undo', onClick: () => toggleLive(id) });
    } else {
      setInDraft(id, false);
      showToast('Removed from the draft update.', { label: 'Undo', onClick: () => setInDraft(id, true) });
    }
  };

  const title = article?.title ?? '';
  let banner: AutoModeEditor['banner'];
  if (option === 'publish' && unchecked.length > 0) {
    banner = {
      children: (
        <>
          Hiver AI changed <BannerCount count={unchecked.length} noun="paragraph" /> in this article, {MARGIN_HINT}.
          Keep each change or restore the original.
        </>
      ),
      actionLabel: 'Keep all',
      onAction: () => {
        unchecked.forEach((c) => keep(c.suggestion.id));
        showToast('All changes kept.');
      },
    };
  } else if (option === 'merge' && draftBody !== undefined) {
    banner = {
      children:
        inDraft.length > 0 ? (
          <>
            Hiver AI saved a draft update with <BannerCount count={inDraft.length} noun="change" />, {MARGIN_HINT}. It
            isn’t live yet.
          </>
        ) : (
          <>Every change is out of Hiver AI’s draft update. Discard it to go back to editing.</>
        ),
      secondaryAction: { label: 'Discard draft', onClick: () => setConfirm('discard') },
      ...(inDraft.length > 0 ? { actionLabel: 'Publish update', onAction: () => setConfirm('publish'), primary: true } : {}),
    };
  }

  const sources = sourcesFor ? selectConversationSources(state, sourcesFor) : [];

  return {
    banner,
    editorBody: draftBody,
    readOnly: draftBody !== undefined,
    editorKey: changes.map((c) => `${c.suggestion.id}:${c.status}`).join('|'),
    overlay:
      unchecked.length > 0 ? (
        <AiChangeMarkers changes={unchecked} option={option} onKeep={keep} onUndo={undo} onOpenSources={setSourcesFor} />
      ) : null,
    dialogs: article ? (
      <>
        <SourcesSheet
          open={sourcesFor !== null}
          onOpenChange={(open) => {
            if (!open) setSourcesFor(null);
          }}
          sources={sources}
        />
        <ConfirmModal
          open={confirm !== null}
          onOpenChange={(open) => {
            if (!open) setConfirm(null);
          }}
          title={confirm === 'publish' ? 'Publish update?' : 'Discard draft update?'}
          message={
            confirm === 'publish'
              ? `${pluralize(inDraft.length, 'change')} from Hiver AI will go live on “${title}”.`
              : `Hiver AI’s draft update will be deleted. The live article stays as it is.`
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
