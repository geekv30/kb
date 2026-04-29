// Phase 7.5.5 — KB Editor page.
//
// Composes the canonical kb-ui exports `ContentEditor` and
// `ArticleSettingsPanel` per TRD §7.4 + PRD Journey A steps 7-11, 13-16.
//
// Responsibilities owned by this file:
//   - Resolve `:articleSlug` → store article (or render not-found).
//   - Render the 2-column flush-edge layout from the kb-ui KBEditorPage
//     story (`Default` / collapsed-shell variant).
//   - Track an in-page dirty flag (debounced body writes; settings writes
//     mark dirty immediately).
//   - Wire Save / Publish / Close / Cmd+S / Cmd+Enter and surface them
//     to the breadcrumb via `useRegisterEditorPageControls`.
//   - Discard empty new drafts on close-without-save (slug starts with
//     `untitled-` AND title is the placeholder AND body is empty).
//   - Arm the unsaved-changes guard for in-app nav + tab close.
//
// Phase 7.5.8 polish:
//   - `console.log('[toast] …')` calls replaced with real `useToast()`
//     dispatches.
//   - `window.confirm` for close-with-changes replaced with the themed
//     `ConfirmDialog` (rendered via state below).
//   - In-app nav guard now renders a React element (Radix dialog) via
//     `useUnsavedChangesGuard` — included at the bottom of the JSX.

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArticleSettingsPanel,
  ContentEditor,
  type ArticleSettings as KbUiArticleSettings,
  type ArticleSettingsPerson,
  type ArticleVisibility as KbUiArticleVisibility,
} from '@test-kb-ui/kb-ui';
import { useMockStore } from '../../store/MockStoreContext';
import {
  selectArticleBySlug,
  selectCategoryAncestors,
  selectCategoryById,
} from '../../store/selectors';
import type {
  Article,
  ArticleSettings as StoreArticleSettings,
  Category,
  User,
} from '../../store/types';
import { routes } from '../../lib/routes';
import {
  useRegisterEditorPageControls,
  type EditorPageControls,
} from '../../shell/EditorPageController';
import { useUnsavedChangesGuard } from '../../hooks/useUnsavedChangesGuard';
import { useToast } from '../../components/Toast';
import { ConfirmDialog } from '../../components/ConfirmDialog';

/* ─────────────────────────────────────────────────────────────
 * Constants
 * ───────────────────────────────────────────────────────────── */

const UNTITLED_TITLE = 'Untitled article';
const SAVE_DEBOUNCE_MS = 200;

/* ─────────────────────────────────────────────────────────────
 * Adapters — store ArticleSettings ↔ kb-ui ArticleSettings
 *
 * The shapes diverge intentionally (TRD §5.1 uses domain primitives;
 * the kb-ui panel uses presentational types). These two functions are
 * the only place the conversion happens.
 * ───────────────────────────────────────────────────────────── */

function toKbVisibility(v: StoreArticleSettings['visibility']): KbUiArticleVisibility {
  return v === 'public' ? 'Public' : 'Internal';
}

function fromKbVisibility(v?: KbUiArticleVisibility): StoreArticleSettings['visibility'] {
  // 'Draft' has no analogue in the store's `'public' | 'private'` axis;
  // treat it as private (the closest "not yet visible to readers" value).
  return v === 'Public' ? 'public' : 'private';
}

function toPerson(user: User | undefined): ArticleSettingsPerson | undefined {
  if (!user) return undefined;
  return { name: user.name, initials: user.initials };
}

function findUserByPerson(
  users: Record<string, User>,
  person: ArticleSettingsPerson | undefined,
): User | undefined {
  if (!person) return undefined;
  return Object.values(users).find(
    (u) => u.name === person.name && u.initials === person.initials,
  );
}

function adaptStoreToKbSettings(
  article: Article,
  category: Category | undefined,
  users: Record<string, User>,
  storeSettings: StoreArticleSettings,
): KbUiArticleSettings {
  const author = users[article.authorId];
  const reviewers = storeSettings.reviewerIds
    .map((id) => users[id])
    .filter((u): u is User => Boolean(u))
    .map((u) => ({ name: u.name, initials: u.initials }));
  return {
    author: toPerson(author),
    category: category?.title,
    slug: storeSettings.slug,
    tags: storeSettings.tags,
    publishDate: storeSettings.publishDate
      ? formatPublishDate(storeSettings.publishDate)
      : undefined,
    seoTitle: storeSettings.seoTitle,
    visibility: toKbVisibility(storeSettings.visibility),
    reviewers,
  };
}

/**
 * Project edits made inside the kb-ui ArticleSettingsPanel back into the
 * store's settings shape. Only the fields the panel can actually mutate
 * (slug, tags, seoTitle, visibility, reviewers) are written; author /
 * category / publishDate stay frozen — those are surfaced as read-only
 * dropdowns in v1 (per `apps/demo/_diff-report.md` settings spec).
 */
function adaptKbToStoreSettings(
  prev: StoreArticleSettings,
  next: KbUiArticleSettings,
  users: Record<string, User>,
): StoreArticleSettings {
  const reviewerIds = (next.reviewers ?? [])
    .map((p) => findUserByPerson(users, p))
    .filter((u): u is User => Boolean(u))
    .map((u) => u.id);
  return {
    ...prev,
    slug: next.slug ?? prev.slug,
    tags: next.tags ?? prev.tags,
    seoTitle: next.seoTitle ?? prev.seoTitle,
    visibility: next.visibility
      ? fromKbVisibility(next.visibility)
      : prev.visibility,
    reviewerIds,
  };
}

function formatPublishDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  // "Apr 12, 2026" — matches the kb-ui panel's expected display.
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/* ─────────────────────────────────────────────────────────────
 * Helpers
 * ───────────────────────────────────────────────────────────── */

/** Build the destination URL for "back to category" navigation. */
function categoryUrlFromAncestors(ancestors: Category[]): string {
  const slugs = ancestors.map((c) => c.slug);
  if (slugs.length >= 3) return routes.kb.deep(slugs[0], slugs[1], slugs[2]);
  if (slugs.length === 2) return routes.kb.sub(slugs[0], slugs[1]);
  if (slugs.length === 1) return routes.kb.category(slugs[0]);
  return routes.home();
}

/**
 * `true` when the article was created via "+ New" and the user has not
 * touched it (placeholder title + empty body). Used to decide whether
 * a close-without-save should `editor/discardNew` the empty draft.
 */
function isUntouchedNewDraft(
  article: Article,
  bodyHTML: string,
  title: string,
): boolean {
  if (!article.slug.startsWith('untitled-')) return false;
  if (title !== UNTITLED_TITLE) return false;
  // Tiptap renders an empty doc as `<p></p>`; treat both as empty.
  const stripped = bodyHTML.replace(/<p>\s*<\/p>/g, '').trim();
  return stripped === '';
}

/* ─────────────────────────────────────────────────────────────
 * Inline not-found state
 * ───────────────────────────────────────────────────────────── */

function ArticleNotFound({ slug }: { slug: string | undefined }) {
  return (
    <div
      data-route="kb-editor-not-found"
      className="flex flex-col items-start gap-3 py-8"
    >
      <h1 className="text-[18px] font-semibold leading-[28px] text-[#0f172a]">
        Article not found
      </h1>
      <p className="text-[14px] leading-[20px] text-[#475569]">
        No article with slug{' '}
        <code className="rounded bg-[#f1f5f9] px-1 py-0.5 text-[13px] text-[#0f172a]">
          {slug ?? '(none)'}
        </code>
        .
      </p>
      <Link
        to={routes.home()}
        className="text-[14px] font-medium text-[#0f172a] underline underline-offset-2 hover:no-underline"
      >
        Back to home
      </Link>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
 * EditorPage
 * ───────────────────────────────────────────────────────────── */

export default function EditorPage() {
  const { articleSlug } = useParams<{ articleSlug: string }>();
  const { state } = useMockStore();

  // Resolve the article from the URL slug. We snapshot it on every
  // render (cheap — ~56 articles) so that store mutations from this
  // page are reflected immediately.
  const article = articleSlug
    ? selectArticleBySlug(state, articleSlug)
    : undefined;

  /* ── Not-found early return ─────────────────────────────── */
  if (!article) {
    return <ArticleNotFound slug={articleSlug} />;
  }

  // From here down `article` is a defined Article. Pull the rest of
  // the derived data the page needs.
  return <EditorPageBody article={article} key={article.id} />;
}

/* ─────────────────────────────────────────────────────────────
 * EditorPageBody — split out so all hooks below are conditional
 * on `article` existing (avoids the hooks-rules violation that
 * would happen if we early-returned in the same component).
 *
 * The `key={article.id}` on the parent forces a fresh mount when
 * the user navigates between editors — that gives us a clean
 * dirty/draft state per article without manual reset logic.
 * ───────────────────────────────────────────────────────────── */

function EditorPageBody({ article }: { article: Article }) {
  const navigate = useNavigate();
  const { state, dispatch } = useMockStore();
  const { showToast } = useToast();
  const ancestors = selectCategoryAncestors(state, article.categoryId);
  const category = selectCategoryById(state, article.categoryId);
  const categoryUrl = categoryUrlFromAncestors(ancestors);
  // Confirm dialog state for the close-with-unsaved-changes flow. We
  // can't render the dialog synchronously inside the close handler the
  // way `window.confirm` worked — instead the close handler opens the
  // dialog and the dialog's onConfirm/onCancel resolve the navigation.
  const [closeConfirmOpen, setCloseConfirmOpen] = useState(false);

  // ── Local working copy ─────────────────────────────────────
  // Editor body and settings are tracked locally so:
  //   1. The dirty flag can compare against the article's persisted
  //      values without reading store state on every keystroke.
  //   2. Body writes can be debounced (200ms) without dropping intermediate
  //      input — the local copy stays current; the store catches up.
  //   3. The kb-ui ContentEditor seeds from `initialContent` once on
  //      mount; subsequent prop changes do NOT reseed it (matches
  //      Tiptap behaviour). The `key={article.id}` on the parent
  //      ensures a fresh editor instance per article.
  const [bodyHTML, setBodyHTML] = useState<string>(article.bodyHTML);
  const [storeSettings, setStoreSettings] = useState<StoreArticleSettings>(
    article.settings,
  );
  const [titleSnapshot] = useState<string>(article.title);
  const [isDirty, setIsDirty] = useState(false);
  // `dirtyRef` mirrors `isDirty` synchronously. The unsaved-changes
  // blocker function reads the ref so we can suppress the prompt one
  // tick before React commits a `setIsDirty(false)` — without this,
  // the explicit close-with-confirm flow races a second confirm from
  // the blocker (it sees dirty=true while the navigate fires).
  const dirtyRef = useRef(false);
  const setDirty = useCallback((v: boolean) => {
    dirtyRef.current = v;
    setIsDirty(v);
  }, []);
  // Save-just-fired guards an extra debounce flush from racing the
  // navigation that happens immediately after publish.
  const justSavedRef = useRef(false);

  /* ── Debounced body write ──────────────────────────────────
   * 200ms idle window per TRD §7.4. Keeps the store roughly in sync
   * with the editor without firing on every keystroke. The store
   * dispatch is `editor/saveDraft` (status unchanged), so debounced
   * writes are safe — they only update body+settings on a draft.
   * Note: this path does NOT clear the dirty flag (the user has not
   * explicitly saved); the explicit Save handler does.
   */
  useEffect(() => {
    if (!isDirty) return;
    if (justSavedRef.current) return;
    const handle = window.setTimeout(() => {
      dispatch({
        type: 'editor/saveDraft',
        articleId: article.id,
        bodyHTML,
        settings: storeSettings,
      });
    }, SAVE_DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [bodyHTML, storeSettings, isDirty, article.id, dispatch]);

  /* ── Project store settings into kb-ui shape ───────────────
   * The ArticleSettingsPanel is `value`-controlled; we recompute the
   * adapted settings on every render off the local `storeSettings`.
   * Cheap (constant-time over a small object).
   */
  const kbSettings = useMemo<KbUiArticleSettings>(
    () =>
      adaptStoreToKbSettings(article, category, state.users, storeSettings),
    [article, category, state.users, storeSettings],
  );

  /* ── Handlers ──────────────────────────────────────────────── */

  const handleEditorChange = useCallback((html: string) => {
    setBodyHTML(html);
    setDirty(true);
  }, []);

  const handleSettingsChange = useCallback(
    (next: KbUiArticleSettings) => {
      setStoreSettings((prev) =>
        adaptKbToStoreSettings(prev, next, state.users),
      );
      setDirty(true);
    },
    [state.users],
  );

  const handleSaveAsDraft = useCallback(() => {
    justSavedRef.current = true;
    dispatch({
      type: 'editor/saveDraft',
      articleId: article.id,
      bodyHTML,
      settings: storeSettings,
    });
    setDirty(false);
    showToast('Draft saved.', 'success');
    // Allow debounced writes again after the next tick.
    window.setTimeout(() => {
      justSavedRef.current = false;
    }, 0);
  }, [article.id, bodyHTML, storeSettings, dispatch, showToast]);

  const handlePublish = useCallback(() => {
    // Persist current edits first, then flip status. This matches a
    // real product's save-on-publish — the user's last edits before
    // hitting Publish should be part of the published version.
    justSavedRef.current = true;
    dispatch({
      type: 'editor/saveDraft',
      articleId: article.id,
      bodyHTML,
      settings: storeSettings,
    });
    dispatch({ type: 'editor/publish', articleId: article.id });
    setDirty(false);
    showToast('Article published.', 'success');
    navigate(categoryUrl);
  }, [
    article.id,
    bodyHTML,
    storeSettings,
    dispatch,
    navigate,
    categoryUrl,
    showToast,
  ]);

  const handleClose = useCallback(() => {
    // PRD Journey A steps 13-15:
    //   - New draft, never typed → silently discard + navigate.
    //   - Dirty → open the styled ConfirmDialog; on confirm navigate
    //     (no save), on cancel stay.
    //   - Clean (existing article, no edits) → navigate immediately.
    if (isUntouchedNewDraft(article, bodyHTML, titleSnapshot)) {
      dispatch({ type: 'editor/discardNew', articleId: article.id });
      showToast('Draft discarded.', 'info');
      navigate(categoryUrl);
      return;
    }
    if (isDirty) {
      setCloseConfirmOpen(true);
      return;
    }
    navigate(categoryUrl);
  }, [
    article,
    bodyHTML,
    titleSnapshot,
    isDirty,
    dispatch,
    navigate,
    categoryUrl,
    showToast,
  ]);

  const handleConfirmDiscardClose = useCallback(() => {
    // Mirror the previous window.confirm "OK" branch — flip dirty off
    // so the blocker doesn't prompt again on navigate, then leave.
    setDirty(false);
    setCloseConfirmOpen(false);
    navigate(categoryUrl);
  }, [navigate, categoryUrl, setDirty]);

  const handleCancelClose = useCallback(() => {
    setCloseConfirmOpen(false);
  }, []);

  /* ── Register controls with the breadcrumb ─────────────────
   * `useMemo` keeps the controls object stable across renders unless
   * one of its actual inputs changed — prevents the breadcrumb from
   * thrashing the editor controls slot on every keystroke.
   */
  const editorControls = useMemo<EditorPageControls>(
    () => ({
      saveDisabled: !isDirty,
      // Publish remains enabled even on a clean editor — the user can
      // publish an existing draft as-is. PRD §7.3 lists no "publish
      // disabled" state for the editor route.
      publishDisabled: false,
      onSaveAsDraft: handleSaveAsDraft,
      onPublish: handlePublish,
      onClose: handleClose,
    }),
    [isDirty, handleSaveAsDraft, handlePublish, handleClose],
  );
  useRegisterEditorPageControls(editorControls);

  /* ── Unsaved-changes guard ─────────────────────────────────
   * Untouched-new-drafts are silently discardable (no confirm), so we
   * only arm the guard when the editor is dirty AND the article is
   * not the empty new-draft case (which has its own discard path).
   *
   * `isDirtyNow` reads the synchronous ref so the in-app blocker
   * suppresses its own prompt during explicit close-with-confirm
   * flows (the page handler shows window.confirm + flips the ref
   * synchronously before calling navigate(); without this, the
   * blocker would fire a SECOND confirm because the React state
   * commit hasn't landed yet).
   */
  const armGuard =
    isDirty && !isUntouchedNewDraft(article, bodyHTML, titleSnapshot);
  const guardElement = useUnsavedChangesGuard({
    isDirty: armGuard,
    isDirtyNow: () => dirtyRef.current,
  });

  /* ── Keyboard shortcuts (Cmd/Ctrl+S, Cmd/Ctrl+Enter) ───────── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;
      // Cmd/Ctrl + S — Save as draft.
      if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        if (isDirty) handleSaveAsDraft();
        return;
      }
      // Cmd/Ctrl + Enter — Publish.
      if (e.key === 'Enter') {
        e.preventDefault();
        handlePublish();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isDirty, handleSaveAsDraft, handlePublish]);

  /* ── Initial caret focus ───────────────────────────────────
   * Tiptap exposes its DOM via the rendered `.ProseMirror` element.
   * We focus it once on mount so the user can immediately type.
   */
  const editorColumnRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = editorColumnRef.current?.querySelector<HTMLElement>(
      '.ProseMirror',
    );
    el?.focus({ preventScroll: true });
  }, []);

  /* ── Render ─────────────────────────────────────────────────
   * 2-column flush-edge layout per the kb-ui KBEditorPage `Default`
   * story. Editor sits flush LEFT; settings panel hugs RIGHT via
   * `justify-between`. The shell already pads `main` by 24px, so this
   * row carries no horizontal padding of its own.
   */
  return (
    <div
      data-route="kb-editor"
      data-article-id={article.id}
      data-article-slug={article.slug}
      data-article-status={article.status}
      data-dirty={isDirty ? 'true' : 'false'}
      className="flex flex-row justify-between items-start gap-6"
    >
      <div
        ref={editorColumnRef}
        data-kb-part="editor-column"
        className="max-w-[720px] w-full"
      >
        <ContentEditor
          initialContent={article.bodyHTML}
          onChange={handleEditorChange}
          placeholder="Start writing your article…"
          className="w-full max-w-full"
        />
      </div>

      <div data-kb-part="settings-column" className="w-[380px] shrink-0">
        <ArticleSettingsPanel
          value={kbSettings}
          onChange={handleSettingsChange}
          compact
        />
      </div>

      {/* Close-with-unsaved-changes confirm — opened by handleClose */}
      <ConfirmDialog
        open={closeConfirmOpen}
        title="Discard unsaved changes?"
        message="You have unsaved changes in this article. Leaving now will discard them."
        confirmLabel="Discard changes"
        cancelLabel="Stay on page"
        confirmVariant="destructive"
        onConfirm={handleConfirmDiscardClose}
        onCancel={handleCancelClose}
      />

      {/* In-app navigation guard (rail clicks, breadcrumb, browser back). */}
      {guardElement}
    </div>
  );
}
