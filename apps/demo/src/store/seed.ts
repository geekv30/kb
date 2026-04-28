// Phase 7.5.2 — synchronous seed of the MockStoreState.
//
// Builds the entire in-memory store from the 6 fixture files and runs
// dev-only integrity asserts (TRD §6.3) so any fixture authoring drift
// surfaces immediately in the console while developing. The asserts
// are stripped from prod builds because the gate is `import.meta.env.DEV`.

import { users } from './fixtures/users';
import { categories } from './fixtures/categories';
import { articles } from './fixtures/articles';
import { suggestions } from './fixtures/suggestions';
import { conversationSources } from './fixtures/conversations';
import type { MockStoreState } from './types';

/* ─────────────────────────────────────────────────────────────
 * Helpers
 * ───────────────────────────────────────────────────────────── */

function keyById<T extends { id: string }>(list: T[]): Record<string, T> {
  const out: Record<string, T> = {};
  for (const item of list) out[item.id] = item;
  return out;
}

/* ─────────────────────────────────────────────────────────────
 * Dev-only integrity asserts (TRD §6.3)
 *
 * Logs to console.error so a failing fixture authoring run is loud
 * but doesn't crash the demo. Wrapped in `import.meta.env.DEV` so
 * Vite tree-shakes the entire block in production.
 * ───────────────────────────────────────────────────────────── */

function runIntegrityAsserts(state: MockStoreState): void {
  const errors: string[] = [];

  // Every article has a valid categoryId
  for (const a of Object.values(state.articles)) {
    if (!state.categories[a.categoryId]) {
      errors.push(`article ${a.id} → unknown category ${a.categoryId}`);
    }
  }

  // Every category (except root) has a valid parentId
  for (const c of Object.values(state.categories)) {
    if (c.parentId && !state.categories[c.parentId]) {
      errors.push(`category ${c.id} → unknown parent ${c.parentId}`);
    }
  }

  // Every article has a valid authorId
  for (const a of Object.values(state.articles)) {
    if (!state.users[a.authorId]) {
      errors.push(`article ${a.id} → unknown author ${a.authorId}`);
    }
  }

  // Article slugs are unique (the route layer relies on this)
  const slugSeen = new Map<string, string>();
  for (const a of Object.values(state.articles)) {
    const prior = slugSeen.get(a.slug);
    if (prior) {
      errors.push(`article slug collision: '${a.slug}' on ${prior} and ${a.id}`);
    } else {
      slugSeen.set(a.slug, a.id);
    }
  }

  // Every suggestion has a valid articleId AND that article's bodyHTML
  // contains the suggestion's anchorBlockId marker.
  for (const s of Object.values(state.suggestions)) {
    const article = state.articles[s.articleId];
    if (!article) {
      errors.push(`suggestion ${s.id} → unknown article ${s.articleId}`);
      continue;
    }
    if (!article.bodyHTML.includes(`data-block-id="${s.anchorBlockId}"`)) {
      errors.push(
        `suggestion ${s.id} → anchor data-block-id="${s.anchorBlockId}" not present in article ${s.articleId}`,
      );
    }
  }

  // Every conversation source has a valid articleId
  for (const cs of Object.values(state.conversationSources)) {
    if (!state.articles[cs.articleId]) {
      errors.push(
        `conversation source ${cs.id} → unknown article ${cs.articleId}`,
      );
    }
  }

  // Reviewer ids on article settings must resolve and must NOT include
  // the author themselves (per TRD types comment).
  for (const a of Object.values(state.articles)) {
    for (const rid of a.settings.reviewerIds) {
      if (!state.users[rid]) {
        errors.push(`article ${a.id} → unknown reviewer ${rid}`);
      }
      if (rid === a.authorId) {
        errors.push(
          `article ${a.id} → reviewer ${rid} is also the author (forbidden)`,
        );
      }
    }
  }

  // Current user is a real user
  if (!state.users[state.currentUserId]) {
    errors.push(`currentUserId ${state.currentUserId} not in users map`);
  }

  // Default-expanded ids are real categories
  for (const cid of state.expandedCategoryIds) {
    if (!state.categories[cid]) {
      errors.push(`expandedCategoryIds → unknown category ${cid}`);
    }
  }

  if (errors.length > 0) {
    // eslint-disable-next-line no-console
    console.error(
      `[MockStore.seed] integrity-assert failures (${errors.length}):\n` +
        errors.map((e) => `  • ${e}`).join('\n'),
    );
  }
}

/* ─────────────────────────────────────────────────────────────
 * Public seed()
 * ───────────────────────────────────────────────────────────── */

export function seed(): MockStoreState {
  const state: MockStoreState = {
    users: keyById(users),
    categories: keyById(categories),
    articles: keyById(articles),
    suggestions: keyById(suggestions),
    conversationSources: keyById(conversationSources),
    aiGapsStateByArticle: {},
    expandedCategoryIds: ['cat-getting-started'],
    currentUserId: 'user-aanya',
    currentToast: null,
  };

  if (import.meta.env.DEV) {
    runIntegrityAsserts(state);
  }

  return state;
}
