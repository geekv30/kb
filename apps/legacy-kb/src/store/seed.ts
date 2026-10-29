import { helpCenters, users } from './fixtures/users';
import { categories } from './fixtures/categories';
import { articles } from './fixtures/articles';
import { suggestions } from './fixtures/suggestions';
import { conversationSources } from './fixtures/conversations';
import { buildReviewDocument } from '../improvements/reviewDocument';
import type { AISuggestion, AutoModeOption, StoreState } from './types';

function keyById<T extends { id: string }>(list: T[]): Record<string, T> {
  const out: Record<string, T> = {};
  for (const item of list) out[item.id] = item;
  return out;
}

/**
 * Dev-only fixture integrity checks. Loud in the console, never fatal.
 * Guards the contract chunk 2 relies on: every suggestion anchors to a
 * real block, and every `oldHTML` is present verbatim in the body.
 */
function runIntegrityAsserts(state: StoreState): void {
  const errors: string[] = [];

  for (const a of Object.values(state.articles)) {
    if (!state.categories[a.categoryId]) errors.push(`article ${a.id} → unknown category ${a.categoryId}`);
    if (a.authorId && !state.users[a.authorId]) errors.push(`article ${a.id} → unknown author ${a.authorId}`);
    if (a.modifierId && !state.users[a.modifierId]) errors.push(`article ${a.id} → unknown modifier ${a.modifierId}`);
  }

  const slugs = new Set<string>();
  for (const a of Object.values(state.articles)) {
    if (slugs.has(a.slug)) errors.push(`duplicate article slug '${a.slug}'`);
    slugs.add(a.slug);
  }

  for (const s of Object.values(state.suggestions)) {
    const article = state.articles[s.articleId];
    if (!article) {
      errors.push(`suggestion ${s.id} → unknown article ${s.articleId}`);
      continue;
    }
    if (!article.bodyHTML.includes(`data-block-id="${s.anchorBlockId}"`)) {
      errors.push(`suggestion ${s.id} → anchor "${s.anchorBlockId}" missing from ${s.articleId}`);
    }
    if (s.payload.oldHTML && !article.bodyHTML.includes(s.payload.oldHTML)) {
      errors.push(`suggestion ${s.id} → oldHTML not found verbatim in ${s.articleId}`);
    }
    if (s.payload.newHTML && article.bodyHTML.includes(s.payload.newHTML)) {
      errors.push(`suggestion ${s.id} → newHTML already applied in ${s.articleId}`);
    }
  }

  const byArticle = new Map<string, AISuggestion[]>();
  for (const s of Object.values(state.suggestions)) {
    byArticle.set(s.articleId, [...(byArticle.get(s.articleId) ?? []), s]);
  }
  for (const [articleId, list] of byArticle) {
    const article = state.articles[articleId];
    if (!article) continue;
    for (const id of buildReviewDocument(article.bodyHTML, list).unplacedIds) {
      errors.push(`suggestion ${id} → could not be placed in ${articleId}'s body`);
    }
  }

  const sourcesPerSuggestion = new Map<string, number>();
  for (const cs of Object.values(state.conversationSources)) {
    if (!state.articles[cs.articleId]) errors.push(`source ${cs.id} → unknown article ${cs.articleId}`);
    const owner = state.suggestions[cs.suggestionId];
    if (!owner) errors.push(`source ${cs.id} → unknown suggestion ${cs.suggestionId}`);
    else if (owner.articleId !== cs.articleId) errors.push(`source ${cs.id} → suggestion ${owner.id} is on another article`);
    sourcesPerSuggestion.set(cs.suggestionId, (sourcesPerSuggestion.get(cs.suggestionId) ?? 0) + 1);
  }
  // The Sources sheet lists exactly `sourceCount` conversations.
  for (const s of Object.values(state.suggestions)) {
    const listed = sourcesPerSuggestion.get(s.id) ?? 0;
    if (listed !== s.sourceCount) errors.push(`suggestion ${s.id} → sourceCount ${s.sourceCount}, ${listed} sources listed`);
  }

  if (errors.length > 0) {
    console.error(`[legacy-kb seed] ${errors.length} integrity failure(s):\n  • ${errors.join('\n  • ')}`);
  }
}

/**
 * Fresh demo state. The store is in-memory only, so a reload always
 * starts the demo over from these fixtures.
 */
/** `?option=2` opens the prototype on the merge design; anything else is option 1. */
function optionFromUrl(): AutoModeOption {
  return new URLSearchParams(window.location.search).get('option') === '2' ? 'merge' : 'publish';
}

/** `overrides` carry the prototype's settings across a restart. */
export function seed(overrides?: Partial<Pick<StoreState, 'aiAutoApply' | 'autoModeOption'>>): StoreState {
  const state: StoreState = {
    helpCenters: keyById(helpCenters),
    activeHelpCenterId: 'hc-product',
    users: keyById(users),
    currentUserId: 'user-varun',
    categories: keyById(categories),
    categoryOrder: categories.map((c) => c.id),
    articles: keyById(articles),
    articleOrder: articles.map((a) => a.id),
    suggestions: keyById(suggestions),
    conversationSources: keyById(conversationSources),
    aiReviewByArticle: {},
    aiReviewHistoryByArticle: {},
    aiAutoApply: overrides?.aiAutoApply ?? false,
    autoModeOption: overrides?.autoModeOption ?? optionFromUrl(),
  };

  if (import.meta.env.DEV) runIntegrityAsserts(state);

  return state;
}
