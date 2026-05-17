// Phase 7.5.3 — Route-aware wrapper around `KBBreadcrumbBar`.
//
// Variant logic per TRD §4.4:
//   - `/kb/...`        → category variant, items derived from category
//                        ancestor chain (deepest URL segment wins).
//   - `/ai-optimise`   → category variant, single item "AI Optimise".
//   - `/analytics/*`   → category variant, single item "Analytics".
//   - `/settings`      → category variant, single item "Settings".
//   - `/articles/.../edit` and `/ai-optimise/.../review` → editor variant
//     (collapsed shell), full ancestor chain + article title, with
//     publish/save/× action buttons. Handlers `console.log` for now —
//     real wiring lands in Phases 7.5.5 (editor) and 7.5.6 (AI Gaps).
//
// The breadcrumb segments are NOT clickable in this phase (the
// underlying `KBBreadcrumbBar` renders them as `<a href="#">` with
// `e.preventDefault()` so visited-state styling stays clean). Real
// segment navigation lands in Phase 7.5.4 once category pages exist.

import { useCallback, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  EditorBreadcrumbActions,
  formatArticleTitle,
  isPublishEnabled,
  KBBreadcrumbBar,
  type KBBreadcrumbItem,
} from '@test-kb-ui/kb-ui';
import { useMockStore } from '../store/MockStoreContext';
import {
  selectArticleBySlug,
  selectCategoryAncestors,
  selectCategoryBySlug,
  selectSuggestionsForArticle,
} from '../store/selectors';
import { routes } from '../lib/routes';
import { useEditorPageControls } from './EditorPageController';
import { useToast } from '../components/Toast';
import { ConfirmDialog, useSidebarCollapse } from '@test-kb-ui/kb-ui';

type BreadcrumbConfig = {
  items: KBBreadcrumbItem[];
  /**
   * `true` for collapsed-shell routes (editor + AI Gaps review). In
   * that mode the leading icon flips to home + the action buttons
   * (Save / Publish / ×) appear.
   */
  collapsed: boolean;
};

function fallback(label: string): BreadcrumbConfig {
  return { items: [{ id: label.toLowerCase(), label }], collapsed: false };
}

export function BreadcrumbBar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const params = useParams<{
    topLevel?: string;
    mid?: string;
    depth2?: string;
    articleSlug?: string;
  }>();
  const { state, dispatch } = useMockStore();
  const { showToast } = useToast();
  // Sidebar collapse context — only present under ShellLayout. Under
  // CollapsedShellLayout this is `null` (editor + AI Gaps routes), and
  // the leading-icon click keeps its existing home-navigation behavior.
  const sidebar = useSidebarCollapse();
  // AI Gaps "Discard review?" confirm dialog state. The dialog renders
  // outside the breadcrumb's KB element since Radix portals to <body>.
  const [aiGapsDiscardOpen, setAiGapsDiscardOpen] = useState(false);
  // Editor page (when mounted) registers its handlers + dirty flag here.
  // `null` when no editor page is mounted — fall back to placeholders.
  const editorControls = useEditorPageControls();
  const isEditorRoute =
    pathname.startsWith('/articles/') &&
    pathname.endsWith('/edit') &&
    !!params.articleSlug;

  /* ── AI Gaps route detection ─────────────────────────────── */
  const isAiGapsRoute =
    pathname.startsWith('/ai-optimise/') &&
    pathname.endsWith('/review') &&
    !!params.articleSlug;
  const aiGapsArticle = isAiGapsRoute && params.articleSlug
    ? selectArticleBySlug(state, params.articleSlug)
    : undefined;
  const aiGapsState = aiGapsArticle
    ? state.aiGapsStateByArticle[aiGapsArticle.id]
    : undefined;
  const aiGapsSuggestions = aiGapsArticle
    ? selectSuggestionsForArticle(state, aiGapsArticle.id)
    : [];
  const aiGapsAlreadyPublished =
    aiGapsArticle && aiGapsSuggestions.length > 0
      ? aiGapsSuggestions.every((s) => s.status === 'published')
      : false;
  const aiGapsPublishDisabled = aiGapsArticle
    ? aiGapsAlreadyPublished ||
      !isPublishEnabled(aiGapsState?.decisions ?? {})
    : false;
  const aiGapsHasDecisions =
    aiGapsState != null && Object.keys(aiGapsState.decisions).length > 0;

  const config = useMemo<BreadcrumbConfig>(() => {
    /* ── Editor (collapsed shell) ──────────────────────────── */
    if (pathname.startsWith('/articles/') && params.articleSlug) {
      const article = selectArticleBySlug(state, params.articleSlug);
      if (!article) {
        return { items: [{ id: 'unknown', label: 'Unknown article' }], collapsed: true };
      }
      const ancestors = selectCategoryAncestors(state, article.categoryId);
      return {
        items: [
          ...ancestors.map((c) => ({ id: c.id, label: c.title })),
          { id: article.id, label: formatArticleTitle(article.title) },
        ],
        collapsed: true,
      };
    }

    /* ── AI Gaps review (collapsed shell) ──────────────────── */
    if (
      pathname.startsWith('/ai-optimise/') &&
      pathname.endsWith('/review') &&
      params.articleSlug
    ) {
      const article = selectArticleBySlug(state, params.articleSlug);
      if (!article) {
        return { items: [{ id: 'unknown', label: 'Unknown article' }], collapsed: true };
      }
      const ancestors = selectCategoryAncestors(state, article.categoryId);
      return {
        items: [
          ...ancestors.map((c) => ({ id: c.id, label: c.title })),
          { id: article.id, label: formatArticleTitle(article.title) },
        ],
        collapsed: true,
      };
    }

    /* ── KB browse (shell) ─────────────────────────────────── */
    if (pathname.startsWith('/kb/')) {
      const slug = params.depth2 ?? params.mid ?? params.topLevel;
      if (!slug) return fallback('Knowledge Base');
      const cat = selectCategoryBySlug(state, slug);
      if (!cat) return fallback('Knowledge Base');
      const ancestors = selectCategoryAncestors(state, cat.id);
      return {
        items: ancestors.map((c) => ({ id: c.id, label: c.title })),
        collapsed: false,
      };
    }

    /* ── Single-item routes ────────────────────────────────── */
    if (pathname.startsWith('/ai-optimise')) return fallback('AI Optimise');
    if (pathname.startsWith('/analytics')) return fallback('Analytics');
    if (pathname.startsWith('/settings')) return fallback('Settings');

    return fallback('Knowledge Base');
  }, [pathname, params, state]);

  // Collapsed-shell `home` icon click → return to the article's category
  // page. For non-article cases (shouldn't reach here since collapsed is
  // false elsewhere), fall back to the default KB landing.
  const handleHomeClick = () => {
    if (params.articleSlug) {
      const article = selectArticleBySlug(state, params.articleSlug);
      if (article) {
        const ancestors = selectCategoryAncestors(state, article.categoryId);
        const slugs = ancestors.map((c) => c.slug);
        if (slugs.length === 1) navigate(routes.kb.category(slugs[0]));
        else if (slugs.length === 2) navigate(routes.kb.sub(slugs[0], slugs[1]));
        else if (slugs.length >= 3)
          navigate(routes.kb.deep(slugs[0], slugs[1], slugs[2]));
        return;
      }
    }
    navigate(routes.home());
  };

  /* ── AI Gaps handlers (Phase 7.5.6 + 7.5.8 polish) ───────── */
  const aiGapsHandlers = isAiGapsRoute && aiGapsArticle
    ? {
        onPublish: () => {
          if (aiGapsAlreadyPublished) return;
          dispatch({
            type: 'aiGaps/publish',
            articleId: aiGapsArticle.id,
            now: new Date().toISOString(),
          });
          showToast('Suggestions applied and published.', 'success');
          navigate(routes.aiOptimise.hub());
        },
        onSaveAsDraft: () => {
          // AI Gaps decisions are auto-saved on every dispatch — Save as
          // draft surfaces an info toast so the user knows the click
          // registered and decisions are preserved.
          showToast('Decisions auto-saved.', 'info');
        },
        onClose: () => {
          if (aiGapsHasDecisions) {
            // Open the Radix-themed confirm dialog instead of the
            // browser's `window.confirm`.
            setAiGapsDiscardOpen(true);
            return;
          }
          navigate(routes.aiOptimise.hub());
        },
      }
    : null;

  // Resolve the AI Gaps discard-confirm flow. Lives outside the inline
  // handler so the dialog's onConfirm can dispatch + navigate cleanly.
  const handleAiGapsDiscardConfirm = useCallback(() => {
    setAiGapsDiscardOpen(false);
    if (aiGapsArticle) {
      dispatch({ type: 'aiGaps/reset', articleId: aiGapsArticle.id });
    }
    navigate(routes.aiOptimise.hub());
  }, [aiGapsArticle, dispatch, navigate]);

  /* ── Editor route handlers (Phase 7.5.5) ──────────────────── */
  // Resolution order on the editor route:
  //   1. If the editor page has registered controls via the
  //      EditorPageController context, use them. This is the normal
  //      path — the page owns the dirty flag and the navigation.
  //   2. If the page has not yet registered (first paint between
  //      `useLayoutEffect` ticks) fall back to the home-click handler
  //      so the buttons never become unresponsive.
  const editorHandlers = isEditorRoute
    ? editorControls ?? {
        saveDisabled: true,
        publishDisabled: false,
        onSaveAsDraft: handleHomeClick,
        onPublish: handleHomeClick,
        onClose: handleHomeClick,
      }
    : null;

  // Action-handler resolution priority:
  //   editor route → editorHandlers (from page)
  //   AI Gaps route → aiGapsHandlers (computed inline above)
  //   else → no editor variant rendered (variant === 'category')
  const activeHandlers = editorHandlers ?? aiGapsHandlers;

  // Placeholder fallbacks for non-editor/non-AI-Gaps routes that still
  // render the editor variant breadcrumb. Toast surface keeps the click
  // observable so the demo never feels dead.
  const placeholderSave = useCallback(() => {
    showToast('Coming soon.', 'info');
  }, [showToast]);
  const placeholderPublish = useCallback(() => {
    showToast('Coming soon.', 'info');
  }, [showToast]);

  // Leading-icon resolution:
  //   - Under ShellLayout (sidebar context present) → leading click
  //     toggles the user's sidebar collapse, and the breadcrumb's
  //     `sidebarCollapsed` prop reflects that toggle state.
  //   - Under CollapsedShellLayout (sidebar context null) → existing
  //     behavior verbatim: action handlers' onClose, or handleHomeClick.
  const effectiveCollapsed = sidebar !== null ? sidebar.collapsed : config.collapsed;
  const handleLeadingClick =
    sidebar !== null
      ? () => sidebar.toggle()
      : activeHandlers
        ? activeHandlers.onClose
        : handleHomeClick;

  return (
    <>
      <KBBreadcrumbBar
        sidebarCollapsed={effectiveCollapsed}
        leadingIcon={sidebar !== null ? 'sidebar-toggle' : 'auto'}
        items={config.items}
        onCollapse={handleLeadingClick}
        onToggleSidebar={handleLeadingClick}
        actions={config.collapsed ? (
          // Wrapping span carries the native `title=` tooltip so a disabled
          // Publish button still surfaces a hover hint (disabled buttons
          // don't dispatch their own pointer events in every browser, but
          // hover over the wrapper still resolves the tooltip). `display:
          // contents` so the wrapper has no box of its own and the inner
          // `EditorBreadcrumbActions` flex layout is unaffected.
          <span
            style={{ display: 'contents' }}
            title={
              editorHandlers?.publishDisabled && editorHandlers.publishDisabledReason
                ? editorHandlers.publishDisabledReason
                : undefined
            }
          >
            <EditorBreadcrumbActions
              onSaveAsDraft={activeHandlers ? activeHandlers.onSaveAsDraft : placeholderSave}
              onPublish={activeHandlers ? activeHandlers.onPublish : placeholderPublish}
              onClose={activeHandlers ? activeHandlers.onClose : handleHomeClick}
              publishDisabled={
                editorHandlers
                  ? editorHandlers.publishDisabled
                  : aiGapsHandlers
                    ? aiGapsPublishDisabled
                    : false
              }
              saveDisabled={editorHandlers ? editorHandlers.saveDisabled : undefined}
            />
          </span>
        ) : undefined}
      />

      {/* AI Gaps "Discard review?" confirm — Radix portal to <body>. */}
      <ConfirmDialog
        open={aiGapsDiscardOpen}
        title="Discard review?"
        message="Your accept and reject decisions for this review will be cleared. The suggestions remain available to review again later."
        confirmLabel="Discard review"
        cancelLabel="Keep reviewing"
        confirmVariant="destructive"
        onConfirm={handleAiGapsDiscardConfirm}
        onCancel={() => setAiGapsDiscardOpen(false)}
      />
    </>
  );
}
