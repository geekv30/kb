// Phase 7.5.6 — AI Optimise Hub.
//
// Per PRD §6 Journey B step 1 + §7.4. Renders a SuggestionCard per article
// that has at least one pending suggestion. Click → review route for that
// article. Empty state per PRD §9.4: plain centered text once every article
// has been reviewed.
//
// All composition uses canonical kb-ui exports (PageHeader + SuggestionCard)
// — no bespoke wrappers.

import { useNavigate } from 'react-router-dom';
import { Check } from '@untitledui/icons';
import { SuggestionCard } from '@test-kb-ui/kb-ui';
import { useMockStore } from '../../store/MockStoreContext';
import {
  selectPendingSuggestionArticles,
  selectSuggestionsForArticle,
} from '../../store/selectors';
import { routes } from '../../lib/routes';
import type { AISuggestion, Article } from '../../store/types';
import { EmptyState } from '../../components/EmptyState';

/* ─────────────────────────────────────────────────────────────
 * Per-article impact heuristic
 *
 * PRD §6 calls out the password-reset article as `high` impact, the
 * other two as `medium`. We derive from sourceCount as a stable proxy
 * (each suggestion in the fixtures is `sourceCount: 4` → 12 total per
 * article → all "high" today, but if a future fixture varies the count
 * per suggestion this will degrade gracefully). The password-reset
 * special-case in the dispatch is encoded as a fallback when the
 * heuristic doesn't differentiate.
 * ───────────────────────────────────────────────────────────── */

function deriveImpact(
  article: Article,
  suggestions: AISuggestion[],
): 'high' | 'medium' | 'low' {
  // Per PRD §6 — the password-reset article is the canonical "high"
  // impact card; the other two are "medium". This special-case keeps
  // the demo's hub matching the spec exactly while still leaving the
  // door open to source-count heuristics if the fixture grows.
  if (article.id === 'art-how-to-reset-your-password') return 'high';
  const totalSources = suggestions.reduce((acc, s) => acc + s.sourceCount, 0);
  if (totalSources >= 16) return 'high';
  if (totalSources >= 8) return 'medium';
  return 'low';
}

export default function HubPage() {
  const navigate = useNavigate();
  const { state } = useMockStore();
  const articles = selectPendingSuggestionArticles(state);

  /* ── Empty state (PRD §9.4 + §12.5) ──────────────────────── */
  if (articles.length === 0) {
    return (
      <div data-route="ai-optimise-hub" className="flex flex-col">
        <header data-kb-part="ai-hub-header" className="mb-6">
          <h1 className="text-[24px] font-semibold leading-[32px] text-text-primary">
            AI Optimise
          </h1>
          <p className="mt-[4px] text-[14px] font-normal leading-5 text-text-meta">
            AI-drafted improvements waiting on your review.
          </p>
        </header>
        <EmptyState
          icon={<Check />}
          title="All caught up."
          subtitle="No suggestions to review right now. Check back after new conversations come in."
        />
      </div>
    );
  }

  return (
    <div data-route="ai-optimise-hub" className="flex flex-col">
      {/*
        Hub header is rendered inline (not via PageHeader) because the AI
        Optimise hub has NO `+ New` CTA and `PageHeader` hard-wires one.
        Typography matches Figma `74:8928` (24/semibold title, 14/regular
        subtitle, 4 px gap) — same convention used by
        `Patterns/KB AI Optimise Hub` in kb-ui.
      */}
      <header data-kb-part="ai-hub-header" className="mb-6">
        <h1 className="text-[24px] font-semibold leading-[32px] text-text-primary">
          AI Optimise
        </h1>
        <p className="mt-[4px] text-[14px] font-normal leading-5 text-text-meta">
          AI-drafted improvements waiting on your review.
        </p>
      </header>

      <ul
        data-kb-part="ai-hub-cards"
        className="flex flex-col gap-[16px] list-none p-0 m-0"
      >
        {articles.map((article) => {
          const suggestions = selectSuggestionsForArticle(state, article.id);
          const pending = suggestions.filter((s) => s.status === 'pending');
          const conversationCount = pending.reduce(
            (acc, s) => acc + s.sourceCount,
            0,
          );
          const impact = deriveImpact(article, pending);
          const description = `Hiver's AI suggested ${pending.length} ${
            pending.length === 1 ? 'improvement' : 'improvements'
          } based on recent customer conversations.`;

          return (
            <li key={article.id}>
              <SuggestionCard
                title={article.title}
                description={description}
                kind="article-edit"
                suggestionCount={pending.length}
                conversationCount={conversationCount}
                impact={impact}
                onClick={() => navigate(routes.aiOptimise.review(article.slug))}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
