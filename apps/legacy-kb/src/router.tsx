import { createBrowserRouter, Navigate, useParams } from 'react-router-dom';
import { AdminHelpCenterPage } from './admin/AdminHelpCenterPage';
import { AdminKnowledgeHubPage } from './admin/AdminKnowledgeHubPage';
import { AdminPlaceholderPage } from './admin/AdminPlaceholderPage';
import { AdminShell } from './admin/AdminShell';
import { ADMIN_HELP_CENTER_PATH, ADMIN_PATH, SUGGESTIONS_HUB_PATH, suggestionsReviewPath } from './lib/paths';
import { AppShell } from './shell/AppShell';
import { CategoryPage } from './routes/CategoryPage';
import { ArticleEditPage } from './routes/ArticleEditPage';
import { ArticleReviewPage } from './routes/ArticleReviewPage';
import { SuggestionsHubPage } from './routes/SuggestionsHubPage';
import { NotFound } from './routes/NotFound';

// URLs mirror the live app: /<help center slug>/category/<category slug>
// and /<help center slug>/category/<category slug>/article/edit/<article slug>.
// Unlike the live app, the edit route renders on a direct load.
//
// The AI section lives beside the categories: `/product/ai/suggestions`
// (hub) and `/product/ai/suggestions/<article slug>` (review). The
// original per-category review URL redirects there.
//
// `/hiver/admin/*` is a replica of Hiver's Admin Panel (Help Center and
// Knowledge Hub pages), where the entry points into that AI section sit.

/** `/product/category/:cat/article/review/:slug` → the AI section's review URL. */
function LegacyReviewRedirect() {
  const { articleSlug } = useParams();
  return <Navigate to={articleSlug ? suggestionsReviewPath(articleSlug) : SUGGESTIONS_HUB_PATH} replace />;
}

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/product/category/getting-started" replace /> },
  {
    path: '/product',
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/product/category/getting-started" replace /> },
      { path: 'category/:categorySlug', element: <CategoryPage /> },
      { path: 'category/:categorySlug/article/add', element: <ArticleEditPage mode="add" /> },
      { path: 'category/:categorySlug/article/edit/:articleSlug', element: <ArticleEditPage mode="edit" /> },
      { path: 'category/:categorySlug/article/review/:articleSlug', element: <LegacyReviewRedirect /> },
      { path: 'ai', element: <Navigate to={SUGGESTIONS_HUB_PATH} replace /> },
      { path: 'ai/suggestions', element: <SuggestionsHubPage /> },
      { path: 'ai/suggestions/:articleSlug', element: <ArticleReviewPage /> },
      { path: '*', element: <NotFound /> },
    ],
  },
  {
    path: ADMIN_PATH,
    element: <AdminShell />,
    children: [
      { index: true, element: <Navigate to={ADMIN_HELP_CENTER_PATH} replace /> },
      { path: 'help-center', element: <AdminHelpCenterPage /> },
      { path: 'knowledge-hub', element: <AdminKnowledgeHubPage /> },
      { path: '*', element: <AdminPlaceholderPage /> },
    ],
  },
  { path: '*', element: <Navigate to="/product/category/getting-started" replace /> },
], {
  future: {
    v7_relativeSplatPath: true,
    v7_fetcherPersist: true,
    v7_normalizeFormMethod: true,
    v7_partialHydration: true,
    v7_skipActionErrorRevalidation: true,
  },
});
