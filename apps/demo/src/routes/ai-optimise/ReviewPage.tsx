// Phase 7.5.6 — AI Gaps Review experience.
//
// Per PRD §6 Journey B steps 2-10 + ALT branch and §7.5. Composes the
// canonical kb-ui exports (`ArticleBody` + `ArticleSettingsPanel` +
// `AISuggestionsCard` + `AIGapSuggestionCard` + `SourcesSideSheet`) with
// store-backed reducer state via `useAIGapsForArticle`.
//
// Key adaptations vs. the kb-ui Interactive story:
//   - Reducer state lives in MockStore per-article (PRD §8.5 mid-flow
//     persistence) rather than via React.useReducer.
//   - Suggestions are sourced from the store's `suggestions` slice and
//     mapped position-wise onto `ArticleBody`'s s1/s2/s3 slots.
//     `ArticleBody` now accepts a `regions` prop carrying the article
//     markup, and the demo passes `passwordResetRegions` (defined in
//     `./passwordResetRegions.tsx`) for all three AI-targeted articles
//     in v1, since the mock store doesn't yet model per-article body
//     HTML. The visual highlight chrome and slot positions are correct
//     per article, but the surrounding copy is the password-reset
//     article for every AI review session. Modelling per-article body
//     HTML in the mock store is left for a future demo iteration.
//   - PRD §9.5 terminal-state-after-publish branch: when an article was
//     previously published from this flow, all suggestions have status
//     `'published'` so we render the terminal state with chips reflecting
//     the historical decisions (read from suggestion.status interpreted as
//     the `accepted`/`dismissed` choice).

import * as React from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  AIGapSuggestionCard,
  AISuggestionsCard,
  ArticleBody,
  ArticleSettingsPanel,
  SourcesSideSheet,
  type AISuggestion as KbUiAISuggestion,
  type AISuggestionDecision,
  type ArticleBodyDecisions,
  type ArticleSuggestionDecision,
  type ArticleSettings as KbUiArticleSettings,
  type ConversationSource as KbUiConversationSource,
} from '@hiver/kb-ui';
import { useMockStore } from '../../store/MockStoreContext';
import {
  selectArticleBySlug,
  selectCategoryById,
  selectConversationSourcesForArticle,
  selectSuggestionsForArticle,
} from '../../store/selectors';
import { useAIGapsForArticle } from '../../hooks/useAIGapsForArticle';
import { routes } from '../../lib/routes';
import { passwordResetRegions } from './passwordResetRegions';
import type {
  AISuggestion as StoreAISuggestion,
  ConversationSource as StoreConversationSource,
} from '../../store/types';

/* ─────────────────────────────────────────────────────────────
 * Adapters — store types → kb-ui types
 * ───────────────────────────────────────────────────────────── */

function adaptSuggestion(s: StoreAISuggestion): KbUiAISuggestion {
  return {
    id: s.id,
    type: s.type,
    title: s.title,
    description: s.description,
    sourceCount: s.sourceCount,
  };
}

function adaptConversationSource(
  c: StoreConversationSource,
): KbUiConversationSource {
  // Format the ISO timestamp as "Mon DD, h:MM AM/PM" — matches the kb-ui
  // story fixtures and the SourcesSideSheet's expected display.
  const date = new Date(c.timestamp);
  const month = date.toLocaleString('en-US', { month: 'short' });
  const day = date.getUTCDate();
  let hour = date.getUTCHours();
  const min = date.getUTCMinutes().toString().padStart(2, '0');
  const period = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12;
  if (hour === 0) hour = 12;
  return {
    id: c.id,
    senderName: c.sender.name,
    senderEmail: c.sender.email,
    timestamp: `${month} ${day}, ${hour}:${min} ${period}`,
    subject: c.subject,
    snippet: c.snippet,
  };
}

/* ─────────────────────────────────────────────────────────────
 * Slot mapping — store suggestion id → ArticleBody slot id (s1|s2|s3)
 *
 * `ArticleBody` is hardcoded for s1/s2/s3 anchor ids. The fixtures sort
 * lexically (sug-resetpw-1 < -2 < -3) so the i-th suggestion maps to
 * `s${i+1}`. Using a runtime map (rather than hardcoding the suggestion
 * ids here) keeps the page resilient to fixture renames.
 * ───────────────────────────────────────────────────────────── */

const SLOT_KEYS = ['s1', 's2', 's3'] as const;
type SlotKey = (typeof SLOT_KEYS)[number];

function buildSlotMap(suggestions: StoreAISuggestion[]): Map<string, SlotKey> {
  const map = new Map<string, SlotKey>();
  suggestions.slice(0, 3).forEach((s, i) => {
    map.set(s.id, SLOT_KEYS[i]);
  });
  return map;
}

/* ─────────────────────────────────────────────────────────────
 * Article body decisions — derive from reducer state
 * ───────────────────────────────────────────────────────────── */

function buildArticleBodyDecisions(
  suggestions: KbUiAISuggestion[],
  activeIndex: number,
  decisions: Record<string, AISuggestionDecision>,
  mode: 'pre-review' | 'reviewing' | 'terminal',
  slotMap: Map<string, SlotKey>,
): ArticleBodyDecisions {
  const out: Record<SlotKey, ArticleSuggestionDecision> = {
    s1: 'inactive',
    s2: 'inactive',
    s3: 'inactive',
  };
  for (let i = 0; i < suggestions.length; i += 1) {
    const s = suggestions[i];
    const slot = slotMap.get(s.id);
    if (!slot) continue;
    const decided = decisions[s.id];
    if (decided) {
      out[slot] = decided;
      continue;
    }
    if (mode === 'reviewing' && i === activeIndex) {
      out[slot] = 'active';
      continue;
    }
    out[slot] = 'inactive';
  }
  return { s1: out.s1, s2: out.s2, s3: out.s3 };
}

/* ─────────────────────────────────────────────────────────────
 * Article settings adapter — store ArticleSettings → kb-ui shape
 * ───────────────────────────────────────────────────────────── */

function buildPanelSettings(
  store: ReturnType<typeof useMockStore>['state'],
  article: NonNullable<ReturnType<typeof selectArticleBySlug>>,
): KbUiArticleSettings {
  const author = store.users[article.authorId];
  const category = selectCategoryById(store, article.categoryId);
  const reviewers = article.settings.reviewerIds
    .map((id) => store.users[id])
    .filter(Boolean)
    .map((u) => ({ name: u.name, initials: u.initials }));
  const visibility =
    article.settings.visibility === 'public' ? 'Public' : 'Internal';
  return {
    author: author
      ? { name: author.name, initials: author.initials }
      : undefined,
    category: category?.title,
    slug: article.settings.slug,
    tags: article.settings.tags,
    publishDate: article.settings.publishDate
      ? formatPublishDate(article.settings.publishDate)
      : undefined,
    seoTitle: article.settings.seoTitle,
    visibility,
    reviewers,
  };
}

function formatPublishDate(iso: string): string {
  const d = new Date(iso);
  const month = d.toLocaleString('en-US', { month: 'short' });
  return `${month} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

/* ─────────────────────────────────────────────────────────────
 * Terminal-mode chips for already-published articles (PRD §9.5)
 * ───────────────────────────────────────────────────────────── */

function deriveHistoricalDecisions(
  suggestions: StoreAISuggestion[],
): Record<string, AISuggestionDecision> {
  // For published articles we don't have the historical accept/dismiss
  // breakdown — just that they were applied. We treat every published
  // suggestion as `accepted` for chip rendering. This is faithful to
  // the demo's behaviour: `aiGaps/publish` only fires when the user
  // has terminal-state decisions, so every published suggestion in
  // the seed represents a final accept/dismiss the user made earlier.
  const out: Record<string, AISuggestionDecision> = {};
  for (const s of suggestions) {
    if (s.status === 'accepted' || s.status === 'dismissed') {
      out[s.id] = s.status;
    } else if (s.status === 'published') {
      // Published implies the user previously accepted — we don't
      // distinguish historical dismissals here.
      out[s.id] = 'accepted';
    }
  }
  return out;
}

/* ─────────────────────────────────────────────────────────────
 * Component
 * ───────────────────────────────────────────────────────────── */

const SUMMARY =
  "Hiver's AI flagged improvements based on recent customer conversations. Review each suggestion below.";

export default function ReviewPage() {
  const { articleSlug } = useParams<{ articleSlug: string }>();
  const { state } = useMockStore();
  const article = articleSlug
    ? selectArticleBySlug(state, articleSlug)
    : undefined;

  /* ── 404 inside collapsed shell (PRD §9.6) ──────────────── */
  if (!article) {
    return (
      <div
        data-route="ai-optimise-review"
        className="flex flex-col items-center justify-center py-24 text-center"
      >
        <p className="text-[16px] font-medium leading-[24px] text-[#0f172a]">
          Article not found.
        </p>
        <Link
          to={routes.aiOptimise.hub()}
          className="mt-2 text-[14px] font-medium leading-[20px] text-[#0f172a] underline underline-offset-2 hover:text-[#1e293b]"
        >
          Back to AI Optimise
        </Link>
      </div>
    );
  }

  return <ReviewExperience articleId={article.id} />;
}

type ReviewExperienceProps = {
  articleId: string;
};

function ReviewExperience({ articleId }: ReviewExperienceProps) {
  const { state } = useMockStore();
  const article = state.articles[articleId];
  const storeSuggestions = selectSuggestionsForArticle(state, articleId);
  const slotMap = React.useMemo(
    () => buildSlotMap(storeSuggestions),
    [storeSuggestions],
  );
  const kbSuggestions = React.useMemo(
    () => storeSuggestions.map(adaptSuggestion),
    [storeSuggestions],
  );
  const [aiState, dispatch] = useAIGapsForArticle(articleId);
  const sourcesForArticle = React.useMemo(
    () =>
      selectConversationSourcesForArticle(state, articleId).map(
        adaptConversationSource,
      ),
    [state, articleId],
  );
  const panelSettings = React.useMemo(
    () => buildPanelSettings(state, article),
    [state, article],
  );

  /* ── PRD §9.5 — terminal mode if already published ──────── */
  const isAlreadyPublished = storeSuggestions.every(
    (s) => s.status === 'published',
  );
  const effectiveMode = isAlreadyPublished ? 'terminal' : aiState.mode;
  const effectiveDecisions = isAlreadyPublished
    ? deriveHistoricalDecisions(storeSuggestions)
    : aiState.decisions;

  const activeSuggestion = kbSuggestions[aiState.activeIndex];

  /* ── Scroll side effects (mirrors kb-ui Interactive story) ─ */
  React.useEffect(() => {
    if (effectiveMode === 'reviewing') {
      const id = kbSuggestions[aiState.activeIndex]?.id;
      if (!id) return;
      const slot = slotMap.get(id);
      if (!slot) return;
      const el = document.getElementById(slot);
      if (el) {
        el.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
      return;
    }
    // Both `terminal` and `pre-review` scroll <main> back to top.
    const main = document.querySelector('main');
    if (main) main.scrollTo({ top: 0, behavior: 'smooth' });
  }, [effectiveMode, aiState.activeIndex, kbSuggestions, slotMap]);

  /* ── Keyboard shortcuts (PRD §7.5) ──────────────────────── */
  React.useEffect(() => {
    if (effectiveMode !== 'reviewing') return;
    if (aiState.sourcesFor != null) {
      // Sheet open — only Escape works.
      const handler = (e: KeyboardEvent) => {
        if (e.key === 'Escape') dispatch({ type: 'closeSources' });
      };
      window.addEventListener('keydown', handler);
      return () => window.removeEventListener('keydown', handler);
    }

    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || target?.isContentEditable) {
        return;
      }
      const activeId = activeSuggestion?.id;
      if (!activeId) return;
      switch (e.key) {
        case 'j':
        case 'ArrowDown':
          e.preventDefault();
          dispatch({ type: 'next' });
          break;
        case 'k':
        case 'ArrowUp':
          e.preventDefault();
          dispatch({ type: 'prev' });
          break;
        case 'y':
        case 'Enter':
          e.preventDefault();
          dispatch({ type: 'accept', id: activeId });
          break;
        case 'n':
          e.preventDefault();
          dispatch({ type: 'reject', id: activeId });
          break;
        default:
          break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [effectiveMode, aiState.sourcesFor, activeSuggestion, dispatch]);

  const articleDecisions = buildArticleBodyDecisions(
    kbSuggestions,
    aiState.activeIndex,
    effectiveDecisions,
    effectiveMode,
    slotMap,
  );

  return (
    <div data-route="ai-optimise-review" className="w-full">
      <div
        data-kb-part="ai-gaps-columns"
        className="flex flex-row justify-between items-start gap-6"
      >
        <ArticleBody
          decisions={articleDecisions}
          regions={passwordResetRegions}
          className="max-w-[720px] w-full"
        />
        <aside
          data-kb-part="ai-gaps-rail"
          className="w-[380px] shrink-0 flex flex-col gap-4 sticky top-4"
        >
          <ArticleSettingsPanel
            compact
            defaultCollapsed
            value={panelSettings}
          />

          {effectiveMode === 'pre-review' && (
            <AISuggestionsCard
              mode="pre-review"
              count={kbSuggestions.length}
              summary={SUMMARY}
              onReview={() => dispatch({ type: 'review' })}
              onPrev={() => dispatch({ type: 'prev' })}
              onNext={() => dispatch({ type: 'next' })}
            />
          )}

          {effectiveMode === 'reviewing' &&
            kbSuggestions.map((s) => {
              const decision = effectiveDecisions[s.id];
              if (decision) {
                return (
                  <AIGapSuggestionCard
                    key={s.id}
                    suggestion={s}
                    state={decision}
                    onUndo={(id) => dispatch({ type: 'undo', id })}
                  />
                );
              }
              if (s.id === activeSuggestion?.id) {
                return (
                  <AIGapSuggestionCard
                    key={s.id}
                    suggestion={s}
                    state="active"
                    onPrev={() => dispatch({ type: 'prev' })}
                    onNext={() => dispatch({ type: 'next' })}
                    onOpenSources={(id) =>
                      dispatch({ type: 'openSources', id })
                    }
                    onAccept={(id) => dispatch({ type: 'accept', id })}
                    onReject={(id) => dispatch({ type: 'reject', id })}
                  />
                );
              }
              // Un-decided non-active suggestions are invisible in the rail
              // during `reviewing` — matches the kb-ui Interactive story.
              return null;
            })}

          {effectiveMode === 'terminal' && (
            <>
              <AISuggestionsCard
                mode="terminal"
                count={kbSuggestions.length}
                summary={SUMMARY}
                onPrev={() => dispatch({ type: 'prev' })}
                onNext={() => dispatch({ type: 'next' })}
              />
              {/* Decision chips below — mirrors Interactive story so the
                user can undo any decision from terminal (when not yet
                published). When already published from a previous review,
                we still render the chips so the user can see the
                historical decisions, but the undo handler is a no-op
                because the underlying suggestion is `published`. */}
              {kbSuggestions.map((s) => {
                const decision = effectiveDecisions[s.id];
                if (!decision) return null;
                return (
                  <AIGapSuggestionCard
                    key={s.id}
                    suggestion={s}
                    state={decision}
                    onUndo={
                      isAlreadyPublished
                        ? undefined
                        : (id) => dispatch({ type: 'undo', id })
                    }
                  />
                );
              })}
            </>
          )}
        </aside>
      </div>

      <SourcesSideSheet
        open={aiState.sourcesFor !== null}
        onOpenChange={(open) => {
          if (!open) dispatch({ type: 'closeSources' });
        }}
        sources={sourcesForArticle}
      />
    </div>
  );
}
