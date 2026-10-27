import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../store/StoreContext';
import { selectArticlesInCategory, selectCategoryBySlug, type ArticleFilter } from '../store/selectors';
import { ArticleTable } from './category/ArticleTable';
import { ArticleTabs } from './category/ArticleTabs';
import { CategoryHeader } from './category/CategoryHeader';
import { CategoryTopBar } from './category/CategoryTopBar';
import { NotFound } from './NotFound';

/** `/product/category/:categorySlug` — article list for one category. */
export function CategoryPage() {
  const { categorySlug } = useParams();
  const navigate = useNavigate();
  const { state } = useStore();
  const [filterByCategory, setFilterByCategory] = useState<Record<string, ArticleFilter>>({});

  const category = selectCategoryBySlug(state, categorySlug);
  if (!category) {
    return <NotFound title="This category doesn’t exist" message="It may have been renamed or deleted." />;
  }

  const filter = filterByCategory[category.id] ?? 'ALL';
  const articles = selectArticlesInCategory(state, category.id, filter);

  return (
    <>
      <CategoryTopBar
        currentUser={state.users[state.currentUserId]}
        onNewArticle={() => navigate(`/product/category/${category.slug}/article/add`)}
      />
      <CategoryHeader category={category} />
      <ArticleTabs
        value={filter}
        onChange={(next) => setFilterByCategory((prev) => ({ ...prev, [category.id]: next }))}
      />
      <ArticleTable category={category} articles={articles} filter={filter} />
    </>
  );
}
