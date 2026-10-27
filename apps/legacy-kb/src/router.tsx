import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from './shell/AppShell';
import { CategoryPage } from './routes/CategoryPage';
import { ArticleEditPage } from './routes/ArticleEditPage';
import { ArticleReviewPage } from './routes/ArticleReviewPage';
import { NotFound } from './routes/NotFound';

// URLs mirror the live app: /<help center slug>/category/<category slug>
// and /<help center slug>/category/<category slug>/article/edit/<article slug>.
// `/article/review/<article slug>` is the AI suggestions review view.
// Unlike the live app, the edit route renders on a direct load.
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
      { path: 'category/:categorySlug/article/review/:articleSlug', element: <ArticleReviewPage /> },
      { path: '*', element: <NotFound /> },
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
