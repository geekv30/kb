// Phase 7.5.3 + 7.5.8 — Router configuration.
//
// Two layout routes (per TRD §4.1):
//   - `<ShellLayout />`         wraps shell routes (rail + sub-nav + breadcrumb)
//   - `<CollapsedShellLayout />` wraps editor / AI Gaps review (breadcrumb only)
//
// Page components are wrapped in `React.lazy()` so each route ships
// in its own chunk (per TRD §4.5 + PRD §12.6). The Suspense fallback
// inside each layout handles the chunk-loading state.
//
// `RedirectToDefault` and `NotFoundPage` are imported eagerly — they
// are tiny and the redirect needs to render synchronously on `/`.
//
// Phase 7.5.8 polish:
//   - `errorElement: <RouteErrorBoundary />` on every leaf route so a
//     thrown render error is caught locally + the shell stays mounted
//     (PRD §12.5 / TRD §4.6 + §8.7). React Router renders the
//     errorElement in place of the failing route's Outlet content,
//     which means the rail/sub-nav/breadcrumb remain interactive.

import { lazy } from 'react';
import { Navigate, createBrowserRouter } from 'react-router-dom';
import ShellLayout from './routes/ShellLayout';
import CollapsedShellLayout from './routes/CollapsedShellLayout';
import RedirectToDefault from './routes/RedirectToDefault';
import NotFoundPage from './routes/NotFoundPage';
import { routes } from './lib/routes';
import { RouteErrorBoundary } from './components/RouteErrorBoundary';

/* ── Lazy page chunks ────────────────────────────────────────── */

const CategoryPage = lazy(() => import('./routes/kb/CategoryPage'));
const EditorPage = lazy(() => import('./routes/kb/EditorPage'));
const HubPage = lazy(() => import('./routes/ai-optimise/HubPage'));
const ReviewPage = lazy(() => import('./routes/ai-optimise/ReviewPage'));
const ArticlePerformancePage = lazy(
  () => import('./routes/analytics/ArticlePerformancePage'),
);
const SearchPage = lazy(() => import('./routes/analytics/SearchPage'));
const AIAnswerPerformancePage = lazy(
  () => import('./routes/analytics/AIAnswerPerformancePage'),
);
const SettingsPlaceholder = lazy(() => import('./routes/SettingsPlaceholder'));

/** Shorthand — every leaf route uses the same error element. */
const err = { errorElement: <RouteErrorBoundary /> } as const;

/* ── Route table ─────────────────────────────────────────────── */

export const router = createBrowserRouter([
  // Root redirect — must be FIRST so it matches before the catch-all.
  { path: '/', element: <RedirectToDefault /> },

  // Shell layout — rail + sub-nav + breadcrumb persist.
  {
    element: <ShellLayout />,
    errorElement: <ShellLayout />,
    children: [
      // KB browse — three depths.
      { path: '/kb/:topLevel', element: <CategoryPage />, ...err },
      { path: '/kb/:topLevel/:mid', element: <CategoryPage />, ...err },
      { path: '/kb/:topLevel/:mid/:depth2', element: <CategoryPage />, ...err },

      // AI Optimise hub.
      { path: '/ai-optimise', element: <HubPage />, ...err },

      // Analytics — three sibling tabs + index redirect.
      {
        path: '/analytics',
        element: <Navigate to={routes.analytics.articlePerformance()} replace />,
      },
      {
        path: '/analytics/article-performance',
        element: <ArticlePerformancePage />,
        ...err,
      },
      { path: '/analytics/search', element: <SearchPage />, ...err },
      {
        path: '/analytics/ai-answer-performance',
        element: <AIAnswerPerformancePage />,
        ...err,
      },

      // Settings placeholder.
      { path: '/settings', element: <SettingsPlaceholder />, ...err },
    ],
  },

  // Collapsed shell layout — breadcrumb only, full-width content.
  {
    element: <CollapsedShellLayout />,
    errorElement: <CollapsedShellLayout />,
    children: [
      { path: '/articles/:articleSlug/edit', element: <EditorPage />, ...err },
      {
        path: '/ai-optimise/:articleSlug/review',
        element: <ReviewPage />,
        ...err,
      },
    ],
  },

  // Catch-all 404 — standalone (no shell). MUST be last.
  { path: '*', element: <NotFoundPage /> },
]);
