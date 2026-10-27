// Pure root reducer. Callers supply timestamps so the reducer stays
// deterministic.

import type { Article, Category, StoreState } from './types';

export type StoreAction =
  | { type: 'article/create'; article: Article }
  | { type: 'article/updateBody'; articleId: string; bodyHTML: string }
  | { type: 'article/updateTitle'; articleId: string; title: string }
  | { type: 'article/updateSlug'; articleId: string; slug: string }
  | { type: 'article/setAuthor'; articleId: string; authorId: string | null }
  | { type: 'article/move'; articleId: string; categoryId: string }
  | { type: 'article/publish'; articleId: string; modifierId: string; now: string }
  | { type: 'article/unpublish'; articleId: string; modifierId: string; now: string }
  | { type: 'article/delete'; articleId: string }
  | { type: 'category/create'; category: Category };

function patchArticle(
  state: StoreState,
  articleId: string,
  patch: Partial<Article>,
): StoreState {
  const existing = state.articles[articleId];
  if (!existing) return state;
  return {
    ...state,
    articles: { ...state.articles, [articleId]: { ...existing, ...patch } },
  };
}

export function rootReducer(state: StoreState, action: StoreAction): StoreState {
  switch (action.type) {
    case 'article/create':
      return {
        ...state,
        articles: { ...state.articles, [action.article.id]: action.article },
        articleOrder: [...state.articleOrder, action.article.id],
      };
    case 'article/updateBody':
      return patchArticle(state, action.articleId, { bodyHTML: action.bodyHTML });
    case 'article/updateTitle':
      return patchArticle(state, action.articleId, { title: action.title });
    case 'article/updateSlug':
      return patchArticle(state, action.articleId, { slug: action.slug });
    case 'article/setAuthor':
      return patchArticle(state, action.articleId, { authorId: action.authorId });
    case 'article/move':
      return patchArticle(state, action.articleId, { categoryId: action.categoryId });
    case 'article/publish':
      return patchArticle(state, action.articleId, {
        status: 'PUBLISHED',
        lastActivity: 'published',
        modifierId: action.modifierId,
        modifiedAt: action.now,
      });
    case 'article/unpublish':
      return patchArticle(state, action.articleId, {
        status: 'DRAFT',
        lastActivity: 'updated',
        modifierId: action.modifierId,
        modifiedAt: action.now,
      });
    case 'article/delete': {
      if (!state.articles[action.articleId]) return state;
      const { [action.articleId]: _removed, ...rest } = state.articles;
      void _removed;
      return {
        ...state,
        articles: rest,
        articleOrder: state.articleOrder.filter((id) => id !== action.articleId),
      };
    }
    case 'category/create':
      return {
        ...state,
        categories: { ...state.categories, [action.category.id]: action.category },
        categoryOrder: [...state.categoryOrder, action.category.id],
      };
    default: {
      const exhaustive: never = action;
      return exhaustive;
    }
  }
}
