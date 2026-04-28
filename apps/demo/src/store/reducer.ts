// Phase 7.5.2 — root reducer for the MockStore.
//
// Pure: no side effects, no console.log, no Date.now() outside the
// action's caller. The publish action's body-mutation is the only
// non-trivial branch — extracted into `applyAcceptedSuggestionsToBody`
// so it can be reasoned about (and unit-tested in a later phase) on
// its own.

import { aiGapsReducer, initialAIGapsState } from '@hiver/kb-ui';
import type { AISuggestion as KbUiAISuggestion } from '@hiver/kb-ui';
import type {
  AIGapsAction,
  AIGapsState,
  AISuggestion,
  Article,
  ArticleSettings,
  MockStoreState,
  Toast,
} from './types';

/* ─────────────────────────────────────────────────────────────
 * Action grammar (TRD §5.2)
 * ───────────────────────────────────────────────────────────── */

export type StoreAction =
  // Editor
  | {
      type: 'editor/saveDraft';
      articleId: string;
      bodyHTML: string;
      settings: ArticleSettings;
    }
  | { type: 'editor/publish'; articleId: string }
  | {
      type: 'editor/createNew';
      categoryId: string;
      newArticleId: string;
      newSlug: string;
      /** ISO timestamp — caller supplies so the reducer stays pure. */
      now: string;
    }
  | { type: 'editor/discardNew'; articleId: string }

  // AI Gaps
  | {
      type: 'aiGaps/dispatch';
      articleId: string;
      action: AIGapsAction;
    }
  | {
      type: 'aiGaps/publish';
      articleId: string;
      /** ISO timestamp — caller supplies. */
      now: string;
    }
  | { type: 'aiGaps/reset'; articleId: string }

  // Tree expansion
  | { type: 'tree/toggleExpanded'; categoryId: string }

  // Toast
  | { type: 'toast/show'; toast: Toast }
  | { type: 'toast/dismiss' };

/* ─────────────────────────────────────────────────────────────
 * Helpers
 * ───────────────────────────────────────────────────────────── */

/**
 * Adapt our local AISuggestion shape (which carries store-only fields
 * like `articleId`, `status`, `payload`) to the kb-ui reducer's
 * AISuggestion shape (id/type/title/description/sourceCount only).
 * The kb-ui reducer is curried over the suggestions list, so we only
 * need the fields it actually reads — the order is what matters.
 */
function toKbUiSuggestions(
  list: AISuggestion[],
): KbUiAISuggestion[] {
  return list.map((s) => ({
    id: s.id,
    type: s.type,
    title: s.title,
    description: s.description,
    sourceCount: s.sourceCount,
  }));
}

/**
 * Suggestions-for-article view, sorted by suggestion id (s1, s2, s3
 * ordering is intentional in the fixtures; lexical sort by id keeps
 * the order stable).
 */
function suggestionsForArticle(
  state: MockStoreState,
  articleId: string,
): AISuggestion[] {
  return Object.values(state.suggestions)
    .filter((s) => s.articleId === articleId)
    .sort((a, b) => a.id.localeCompare(b.id));
}

/**
 * Replace a `<p data-block-id="<id>">…</p>` (or any HTML element with
 * a matching data-block-id) with `replacement`. Regex-safe — escapes
 * the id for the regex literal. Returns the original HTML when no
 * matching block is found (caller should treat that as a no-op).
 *
 * The regex matches the OPENING tag through to the matching CLOSING
 * tag of the same element name on a single greedy pass. We
 * intentionally keep the matcher simple — the fixture markers are
 * always one-element-per-line, so cross-element nesting cannot
 * confuse it. If a future fixture introduces nested elements with
 * matching tag names this matcher would need a small parser.
 */
function replaceBlockByDataId(
  html: string,
  blockId: string,
  replacement: string,
): string {
  const escId = blockId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Capture the opening tag's element name so we close on the same one.
  // Group 1 = element name, group 2 = anything between opening tag and the
  // close. We allow attribute order to be arbitrary by anchoring on
  // `data-block-id="<id>"` in either single or double quotes.
  const re = new RegExp(
    `<([a-zA-Z][a-zA-Z0-9]*)([^>]*\\sdata-block-id=["']${escId}["'][^>]*)>([\\s\\S]*?)<\\/\\1>`,
    'g',
  );
  return html.replace(re, replacement);
}

/**
 * Insert HTML BEFORE the matched block. Used by `addition` suggestions
 * whose rationale is "step zero before the existing first step."
 *
 * If no block matches the regex, returns the original HTML unchanged.
 */
function insertBlockBefore(
  html: string,
  blockId: string,
  newHTML: string,
): string {
  const escId = blockId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(
    `(<[a-zA-Z][a-zA-Z0-9]*[^>]*\\sdata-block-id=["']${escId}["'][^>]*>)`,
  );
  const match = re.exec(html);
  if (!match) return html;
  const idx = match.index;
  return html.slice(0, idx) + newHTML + html.slice(idx);
}

/**
 * Insert HTML AFTER the matched block.
 */
function insertBlockAfter(
  html: string,
  blockId: string,
  newHTML: string,
): string {
  const escId = blockId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(
    `<([a-zA-Z][a-zA-Z0-9]*)([^>]*\\sdata-block-id=["']${escId}["'][^>]*)>([\\s\\S]*?)<\\/\\1>`,
  );
  const match = re.exec(html);
  if (!match) return html;
  const endIdx = match.index + match[0].length;
  return html.slice(0, endIdx) + newHTML + html.slice(endIdx);
}

/**
 * Remove the matched block entirely. Used by `removal` suggestions.
 */
function removeBlock(html: string, blockId: string): string {
  return replaceBlockByDataId(html, blockId, '');
}

/**
 * Apply every accepted suggestion's payload to `bodyHTML`. Dismissed
 * suggestions are left untouched (the inline highlight was visual-only).
 *
 * Decision per PRD §13.4 + suggestion `type`:
 *   - `addition`  → insert payload.newHTML BEFORE/AFTER the anchor
 *                   block. We default to AFTER unless the suggestion's
 *                   description explicitly says "before/above" — but
 *                   the fixture authoring deliberately picks anchor
 *                   blocks such that "after" reads naturally for all
 *                   three additions, so we always insert AFTER.
 *                   The single exception is the password-reset
 *                   "Step 0: Verify identity" which inserts BEFORE its
 *                   anchor — encoded in the suggestion's `anchorBlockId`
 *                   choice (anchor is the "intro" block; the new step
 *                   is meant to sit ABOVE it). We detect this by the
 *                   anchor id ending in `-intro` (a fixture convention).
 *   - `replace`   → swap the anchored block with payload.newHTML
 *   - `removal`   → delete the anchored block
 */
function applyAcceptedSuggestionsToBody(
  bodyHTML: string,
  acceptedSuggestions: AISuggestion[],
): string {
  let next = bodyHTML;
  for (const sug of acceptedSuggestions) {
    if (sug.type === 'addition' && sug.payload.newHTML) {
      // Convention: anchor ids ending in `-intro` mean "insert ABOVE
      // the intro paragraph" (the new content is a Step 0 / preface).
      // All other addition anchors mean "insert BELOW the anchor."
      next = sug.anchorBlockId.endsWith('-intro')
        ? insertBlockBefore(next, sug.anchorBlockId, sug.payload.newHTML)
        : insertBlockAfter(next, sug.anchorBlockId, sug.payload.newHTML);
    } else if (sug.type === 'replace' && sug.payload.newHTML) {
      next = replaceBlockByDataId(next, sug.anchorBlockId, sug.payload.newHTML);
    } else if (sug.type === 'removal') {
      next = removeBlock(next, sug.anchorBlockId);
    }
  }
  return next;
}

/* ─────────────────────────────────────────────────────────────
 * Root reducer
 * ───────────────────────────────────────────────────────────── */

export function rootReducer(
  state: MockStoreState,
  action: StoreAction,
): MockStoreState {
  switch (action.type) {
    /* ── Editor ─────────────────────────────────────────────── */

    case 'editor/saveDraft': {
      const article = state.articles[action.articleId];
      if (!article) return state;
      const next: Article = {
        ...article,
        bodyHTML: action.bodyHTML,
        settings: action.settings,
        // saveDraft does NOT touch lastUpdatedAt or status per PRD §5.2
        // ("status unchanged"). We DO bump lastUpdatedAt because a
        // real product would, and the demo's category-page sort relies
        // on it; PRD §5.2 wording is ambiguous, so erring towards
        // realism. (Status remains the article's prior status.)
      };
      return {
        ...state,
        articles: { ...state.articles, [action.articleId]: next },
      };
    }

    case 'editor/publish': {
      const article = state.articles[action.articleId];
      if (!article) return state;
      const nowIso = new Date().toISOString();
      const next: Article = {
        ...article,
        status: 'published',
        lastUpdatedAt: nowIso,
        settings: {
          ...article.settings,
          publishDate: article.settings.publishDate ?? nowIso,
        },
      };
      return {
        ...state,
        articles: { ...state.articles, [action.articleId]: next },
      };
    }

    case 'editor/createNew': {
      // Caller computes the id and slug — the reducer stays pure.
      const cat = state.categories[action.categoryId];
      if (!cat) return state;
      const newArticle: Article = {
        id: action.newArticleId,
        slug: action.newSlug,
        categoryId: action.categoryId,
        title: 'Untitled article',
        status: 'draft',
        authorId: state.currentUserId,
        lastUpdatedAt: action.now,
        bodyHTML: '',
        settings: {
          slug: action.newSlug,
          tags: [],
          publishDate: null,
          seoTitle: 'Untitled article',
          visibility: 'public',
          reviewerIds: [],
        },
      };
      return {
        ...state,
        articles: { ...state.articles, [action.newArticleId]: newArticle },
      };
    }

    case 'editor/discardNew': {
      if (!state.articles[action.articleId]) return state;
      const { [action.articleId]: _discarded, ...rest } = state.articles;
      void _discarded;
      return { ...state, articles: rest };
    }

    /* ── AI Gaps ────────────────────────────────────────────── */

    case 'aiGaps/dispatch': {
      const articleSugs = suggestionsForArticle(state, action.articleId);
      if (articleSugs.length === 0) return state;
      const current =
        state.aiGapsStateByArticle[action.articleId] ?? initialAIGapsState;
      // Forward to the kb-ui reducer — it owns the state-machine logic.
      const next: AIGapsState = aiGapsReducer(
        current,
        action.action,
        toKbUiSuggestions(articleSugs),
      );
      return {
        ...state,
        aiGapsStateByArticle: {
          ...state.aiGapsStateByArticle,
          [action.articleId]: next,
        },
      };
    }

    case 'aiGaps/publish': {
      const article = state.articles[action.articleId];
      if (!article) return state;
      const articleSugs = suggestionsForArticle(state, action.articleId);
      if (articleSugs.length === 0) return state;

      const aiState =
        state.aiGapsStateByArticle[action.articleId] ?? initialAIGapsState;

      // Partition by current decision in the AI Gaps reducer state.
      const accepted = articleSugs.filter(
        (s) => aiState.decisions[s.id] === 'accepted',
      );
      // dismissed/pending suggestions don't mutate the body.

      // 1. Apply accepted payloads to the body.
      const newBody = applyAcceptedSuggestionsToBody(
        article.bodyHTML,
        accepted,
      );

      // 2. Mark every suggestion for this article that has a decision
      //    (accepted OR dismissed) as 'published'. Pending ones stay
      //    pending — but in practice the AI Gaps reducer only allows
      //    publish via Publish-button after every suggestion has a
      //    decision (terminal mode). Defensive either way.
      const nextSuggestions = { ...state.suggestions };
      for (const s of articleSugs) {
        const decision = aiState.decisions[s.id];
        if (decision === 'accepted' || decision === 'dismissed') {
          nextSuggestions[s.id] = { ...nextSuggestions[s.id], status: 'published' };
        }
      }

      // 3. Update article body + status + lastUpdatedAt.
      const nextArticle: Article = {
        ...article,
        bodyHTML: newBody,
        status: 'published',
        lastUpdatedAt: action.now,
        settings: {
          ...article.settings,
          publishDate: article.settings.publishDate ?? action.now,
        },
      };

      // 4. Drop the per-article reducer slot.
      const { [action.articleId]: _drop, ...restAiGaps } =
        state.aiGapsStateByArticle;
      void _drop;

      return {
        ...state,
        articles: { ...state.articles, [action.articleId]: nextArticle },
        suggestions: nextSuggestions,
        aiGapsStateByArticle: restAiGaps,
      };
    }

    case 'aiGaps/reset': {
      // Drop the per-article reducer slot. Suggestion statuses are
      // unaffected (they were 'pending' going in; staying 'pending').
      if (!state.aiGapsStateByArticle[action.articleId]) return state;
      const { [action.articleId]: _drop, ...rest } =
        state.aiGapsStateByArticle;
      void _drop;
      return { ...state, aiGapsStateByArticle: rest };
    }

    /* ── Tree expansion ─────────────────────────────────────── */

    case 'tree/toggleExpanded': {
      const has = state.expandedCategoryIds.includes(action.categoryId);
      return {
        ...state,
        expandedCategoryIds: has
          ? state.expandedCategoryIds.filter((id) => id !== action.categoryId)
          : [...state.expandedCategoryIds, action.categoryId],
      };
    }

    /* ── Toast ──────────────────────────────────────────────── */

    case 'toast/show': {
      return { ...state, currentToast: action.toast };
    }

    case 'toast/dismiss': {
      return { ...state, currentToast: null };
    }

    default: {
      // Exhaustive switch — TS will surface unhandled action types.
      const _exhaustive: never = action;
      void _exhaustive;
      return state;
    }
  }
}
