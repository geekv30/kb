import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  backIcon,
  editedBadge,
  deleteIcon,
  deleteIconHover,
  externalIcon,
  externalIconHover,
  eyeEnable,
  eyeEnableHover,
} from '../assets/legacy';
import { ArticleEditor, type ArticleEditorChange } from '../components/editor/ArticleEditor';
import { Button } from '../components/ui/Button';
import { ConfirmModal } from '../components/ui/Modal';
import { Tooltip, TooltipIconButton } from '../components/ui/Tooltip';
import { BannerCount, SuggestionsBanner } from '../improvements/SuggestionsBanner';
import { slugify } from '../lib/format';
import { suggestionsReviewPath } from '../lib/paths';
import { useElementHeight } from '../lib/useElementHeight';
import { useStore } from '../store/StoreContext';
import {
  selectArticleBySlug,
  selectCategories,
  selectCategoryBySlug,
  selectOpenSuggestionSummary,
  selectUsers,
  workingBody,
} from '../store/selectors';
import type { Article, ArticleStatus, Category } from '../store/types';
import { ArticleMetaPanel } from './edit/ArticleMetaPanel';
import { NotFound } from './NotFound';
import { useAutoModeEditor } from './edit/useAutoModeEditor';

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Space between the AI suggestions banner and the editor toolbar. */
const BANNER_GAP = 16;

type PendingConfirm = 'unpublish' | 'delete' | 'leave' | null;

/** Live tooltip on the "Edited" badge and the table's warning glyph. */
export const UNPUBLISHED_EDITS_TOOLTIP = 'There are edits on this article that are not published yet';

interface EditSessionProps {
  category: Category;
  /** `undefined` in add mode. */
  article: Article | undefined;
}

/**
 * One editing session per article (keyed by id). Title and body edits
 * write through to the store immediately; the slug is held locally and
 * committed on Publish / Unpublish, because the URL is keyed by it.
 */
function EditSession({ category, article }: EditSessionProps) {
  const { state, dispatch } = useStore();
  const navigate = useNavigate();
  const [title, setTitle] = useState(article?.edits?.title ?? article?.title ?? '');
  const [bodyHTML, setBodyHTML] = useState(article ? workingBody(article) : '');
  /** Changed in this visit: Back asks before leaving unpublished edits (live "withoutPublishArticle"). */
  const [dirty, setDirty] = useState(false);
  const [slug, setSlug] = useState(article?.slug ?? '');
  const [authorId, setAuthorId] = useState<string | null>(article ? article.authorId : state.currentUserId);
  const [pending, setPending] = useState<PendingConfirm>(null);
  const [bannerRef, bannerHeight] = useElementHeight<HTMLDivElement>();
  const suggestions = article ? selectOpenSuggestionSummary(state, article.id) : undefined;
  const auto = useAutoModeEditor(article);

  const status: ArticleStatus = article?.status ?? 'DRAFT';
  /** Live "PUBLISHED EDITED": published, with edits that aren't live yet. */
  const hasEdits = Boolean(article?.edits);
  const categoryBase = `/product/category/${category.slug}`;

  const slugTaken = Object.values(state.articles).some((a) => a.slug === slug && a.id !== article?.id);
  const slugError =
    slug.length === 0
      ? 'This field is required'
      : !SLUG_PATTERN.test(slug)
        ? 'Only lowercase alphanumeric characters, `-` are allowed.'
        : slugTaken
          ? 'A slug exists with the same name.'
          : undefined;
  const canPublish = title.trim().length > 0 && !slugError;

  // A draft changes in place; a published article collects unpublished edits.
  const handleEditorChange = ({ title: nextTitle, bodyHTML: nextBody }: ArticleEditorChange) => {
    if (nextTitle !== title) {
      setTitle(nextTitle);
      setSlug(slugify(nextTitle));
    }
    setBodyHTML(nextBody);
    setDirty(true);
    if (article) {
      dispatch({
        type: 'article/edit',
        articleId: article.id,
        title: nextTitle,
        bodyHTML: nextBody,
        modifierId: state.currentUserId,
        now: new Date().toISOString(),
      });
    }
  };

  const back = () => {
    if (hasEdits && dirty) setPending('leave');
    else navigate(categoryBase);
  };

  const commitSlug = (articleId: string) => {
    if (slug !== article?.slug) dispatch({ type: 'article/updateSlug', articleId, slug });
  };

  const now = () => new Date().toISOString();

  const publish = () => {
    if (!canPublish) return;
    if (article) {
      commitSlug(article.id);
      dispatch({ type: 'article/publish', articleId: article.id, modifierId: state.currentUserId, now: now() });
    } else {
      dispatch({
        type: 'article/create',
        article: {
          id: `art-${slug}-${Date.now().toString(36)}`,
          categoryId: category.id,
          slug,
          title: title.trim(),
          status: 'PUBLISHED',
          authorId,
          modifierId: state.currentUserId,
          lastActivity: 'published',
          modifiedAt: now(),
          bodyHTML,
        },
      });
    }
    navigate(`${categoryBase}/article/edit/${slug}`, { replace: true });
  };

  const unpublish = () => {
    if (!article) return;
    commitSlug(article.id);
    dispatch({ type: 'article/unpublish', articleId: article.id, modifierId: state.currentUserId, now: now() });
    setPending(null);
    if (!slugError) navigate(`${categoryBase}/article/edit/${slug}`, { replace: true });
  };

  const remove = () => {
    if (!article) return;
    setPending(null);
    navigate(categoryBase);
    dispatch({ type: 'article/delete', articleId: article.id });
  };

  return (
    <>
      <div className="box-border flex w-full flex-row items-center justify-between pt-[25px] pr-[40px] pb-[10px] pl-[20px]">
        <div className="box-border flex w-full">
          <Button variant="ghost" iconSrc={backIcon} onClick={back}>
            Back
          </Button>
        </div>
        <div className="box-border flex w-full flex-row items-center justify-end p-0">
          {hasEdits ? (
            <div className="box-border flex px-[15px]">
              <Tooltip content={UNPUBLISHED_EDITS_TOOLTIP} placement="bottom-center" className="cursor-default">
                <img src={editedBadge} alt="Edited" width={74} height={22} className="block" />
              </Tooltip>
            </div>
          ) : null}
          <div className="box-border flex px-[15px]">
            {status === 'PUBLISHED' && !hasEdits ? (
              <TooltipIconButton
                label="Go to article"
                src={externalIcon}
                hoverSrc={externalIconHover}
                size={20}
                onClick={() =>
                  window.open(`https://product.hiverkb.com/${category.slug}/${article?.slug ?? ''}`, '_blank', 'noopener')
                }
              />
            ) : (
              <TooltipIconButton label="Preview" src={eyeEnable} hoverSrc={eyeEnableHover} size={20} />
            )}
          </div>
          {article ? (
            <div className="box-border flex px-[15px]">
              <TooltipIconButton
                label="Delete"
                src={deleteIcon}
                hoverSrc={deleteIconHover}
                size={20}
                onClick={() => setPending('delete')}
              />
            </div>
          ) : null}
          <div className="box-border flex pl-[15px]">
            {status === 'DRAFT' || hasEdits ? (
              <Button variant="primary" disabled={!canPublish} onClick={publish}>
                {hasEdits ? 'Publish changes' : 'Publish'}
              </Button>
            ) : (
              <Button variant="secondary" onClick={() => setPending('unpublish')}>
                Unpublish
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="mt-[40px] mr-[24px] mb-[40px] ml-[40px] box-border flex min-h-0 flex-row gap-[40px]">
        <div className="box-border min-w-0 flex-1 text-legacy-body">
          {article && auto.top ? (
            <div style={{ marginBottom: BANNER_GAP }}>
              <div ref={bannerRef}>{auto.top}</div>
            </div>
          ) : article && suggestions?.stage === 'TO_REVIEW' ? (
            <div style={{ marginBottom: BANNER_GAP }}>
              <SuggestionsBanner
                ref={bannerRef}
                actionLabel="Review suggestions"
                onAction={() => navigate(suggestionsReviewPath(article.slug))}
              >
                Hiver AI suggested <BannerCount count={suggestions.total} noun="improvement" /> to this article based on{' '}
                <BannerCount count={suggestions.conversations} noun="recent customer conversation" />.
              </SuggestionsBanner>
            </div>
          ) : null}
          {/* Layout B, "Show changes": the red / green view takes the editor's place. */}
          {auto.replaceEditor ? (
            auto.replaceEditor(bannerHeight > 0 ? bannerHeight + BANNER_GAP : 0)
          ) : (
            // Reseeds (keeping the scroll position) when Hiver AI's changes are applied or taken back.
            <ArticleEditor
              contentRevision={auto.editorKey}
              title={title}
              bodyHTML={auto.editorBody ?? (article ? workingBody(article) : bodyHTML)}
              onChange={handleEditorChange}
              heightOffset={bannerHeight > 0 ? bannerHeight + BANNER_GAP : 0}
              readOnly={auto.readOnly}
              overlay={auto.overlay}
            />
          )}
        </div>
        <ArticleMetaPanel
          users={selectUsers(state)}
          authorId={authorId}
          onAuthorChange={(id) => {
            setAuthorId(id);
            if (article) dispatch({ type: 'article/setAuthor', articleId: article.id, authorId: id });
          }}
          categories={selectCategories(state)}
          categoryId={category.id}
          onCategoryChange={(id) => {
            const next = state.categories[id];
            if (!next || id === category.id) return;
            if (article) {
              dispatch({ type: 'article/move', articleId: article.id, categoryId: id });
              navigate(`/product/category/${next.slug}/article/edit/${article.slug}`, { replace: true });
            } else {
              navigate(`/product/category/${next.slug}/article/add`, { replace: true });
            }
          }}
          slug={slug}
          onSlugChange={setSlug}
          slugError={slug.length > 0 || title.length > 0 ? slugError : undefined}
        />
      </div>

      {auto.dialogs}
      {/* Live "withoutPublishArticle": red Keep Edits, white Discard Edits. */}
      <ConfirmModal
        open={pending === 'leave'}
        onOpenChange={(open) => setPending(open ? 'leave' : null)}
        title="Leave without publishing changes?"
        message="There are changes made to this article that aren’t published yet."
        confirmLabel="Keep Edits"
        cancelLabel="Discard Edits"
        onConfirm={() => {
          setPending(null);
          navigate(categoryBase);
        }}
        onCancel={() => {
          setPending(null);
          navigate(categoryBase);
          if (article) dispatch({ type: 'article/discardEdits', articleId: article.id });
        }}
      />
      <ConfirmModal
        open={pending === 'unpublish'}
        onOpenChange={(open) => setPending(open ? 'unpublish' : null)}
        title="Unpublish article"
        message="Are you sure you want to unpublish this article?"
        confirmLabel="Unpublish"
        onConfirm={unpublish}
      />
      <ConfirmModal
        open={pending === 'delete'}
        onOpenChange={(open) => setPending(open ? 'delete' : null)}
        title={status === 'PUBLISHED' ? 'Caution' : 'Delete article'}
        message={
          status === 'PUBLISHED'
            ? 'Deleting this published article will remove it from your Help Center site. Are you sure you want to do this?'
            : 'Are you sure you want to delete this article?'
        }
        confirmLabel="Delete article"
        onConfirm={remove}
      />
    </>
  );
}

export interface ArticleEditPageProps {
  mode: 'edit' | 'add';
}

/**
 * `/product/category/:categorySlug/article/edit/:articleSlug` (and the
 * `/article/add` variant). Renders on direct load, unlike the live app.
 */
export function ArticleEditPage({ mode }: ArticleEditPageProps) {
  const { categorySlug, articleSlug } = useParams();
  const { state } = useStore();
  const category = selectCategoryBySlug(state, categorySlug);
  const article = mode === 'edit' ? selectArticleBySlug(state, articleSlug) : undefined;

  if (!category) {
    return <NotFound title="This category doesn’t exist" message="It may have been renamed or deleted." />;
  }
  if (mode === 'edit' && !article) {
    return <NotFound title="This article doesn’t exist" message="It may have been moved or deleted." />;
  }
  return <EditSession key={article?.id ?? `new-${category.id}`} category={category} article={article} />;
}
