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
  AIGapRail,
  AIGapSuggestionCard,
  AISuggestionsCard,
  ArticleBody,
  ArticleSettingsPanel,
  SourcesSideSheet,
  hasUndecidedNeighbour,
  smoothScrollTo,
  type AIGapRailItem,
  type AISuggestion as KbUiAISuggestion,
  type AISuggestionDecision,
  type ArticleBodyDecisions,
  type ArticleSuggestionDecision,
  type ArticleSettings as KbUiArticleSettings,
  type ConversationSource as KbUiConversationSource,
} from '@test-kb-ui/kb-ui';
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
        <p className="text-[16px] font-medium leading-[24px] text-text-primary">
          Article not found.
        </p>
        <Link
          to={routes.aiOptimise.hub()}
          className="mt-2 text-[14px] font-medium leading-[20px] text-text-primary underline underline-offset-2 hover:text-[#1e293b]"
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

  // `aiState.activeIndex` can be -1 (chunk 5 sentinel for "no active
  // card" after strict-forward auto-advance runs off the end of the
  // list). `Array[-1]` is `undefined` so downstream `?.id` checks no-op.
  const activeSuggestion =
    aiState.activeIndex >= 0 ? kbSuggestions[aiState.activeIndex] : undefined;

  // Chunk 5 — remaining unresolved count drives the compact reviewing
  // summary's count pill.
  const resolvedCount = Object.keys(effectiveDecisions).length;
  const remaining = kbSuggestions.length - resolvedCount;

  /* ── Scroll side effects (chunk 4 — rAF smooth scroll) ───
   *
   * Mirrors the kb-ui Interactive story: position the active highlight's
   * center at 40% of the viewport height so the rest of the article
   * stays visible below it. Driven by the rAF-based `smoothScrollTo`
   * utility — bails on prefers-reduced-motion, cancels on manual
   * scroll input mid-flight.
   * ─────────────────────────────────────────────────────── */
  React.useEffect(() => {
    const main = document.querySelector('main') as HTMLElement | null;
    if (!main) return;
    if (effectiveMode === 'reviewing') {
      const id = kbSuggestions[aiState.activeIndex]?.id;
      if (!id) return;
      const slot = slotMap.get(id);
      if (!slot) return;
      const el = document.getElementById(slot);
      if (!el) return;
      const mainRect = main.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      const viewportH = mainRect.height;
      const elCenterFromTop = elRect.top - mainRect.top + elRect.height / 2;
      const targetCenterY = viewportH * 0.4;
      const target = Math.max(0, main.scrollTop + elCenterFromTop - targetCenterY);
      smoothScrollTo({ target, duration: 400, scrollElement: main });
      return;
    }
    smoothScrollTo({ target: 0, duration: 400, scrollElement: main });
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
          // Chunk 5 — `activeIndex = -1` (no active card) means accept
          // is a no-op. The user must navigate or click to focus a card
          // before deciding.
          if (!activeId) return;
          e.preventDefault();
          dispatch({ type: 'accept', id: activeId });
          break;
        case 'n':
          if (!activeId) return;
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

  // Inverse of `slotMap` — `{ s1: suggestionId, s2: ..., s3: ... }`.
  // `ArticleBody` propagates each entry to the matching SuggestionBlock
  // as `data-suggestion-id`. Built from the same fixture sort the slot
  // mapping uses so the two sides can never disagree.
  const articleSuggestionIds = React.useMemo(() => {
    const out: { s1?: string; s2?: string; s3?: string } = {};
    for (const [id, slot] of slotMap.entries()) {
      out[slot] = id;
    }
    return out;
  }, [slotMap]);

  // Ref to the ArticleBody root — passed to AIGapRail so cards can be
  // Y-paired to their `data-suggestion-id` anchors. ArticleBody renders
  // an `<article>` so we widen the type accordingly.
  const articleRef = React.useRef<HTMLElement>(null);

  /* ── Rail composition — chunk 4: active flow ──────────────────
   *
   * Summary card switches mode:
   *   pre-review → full detail + "Review Suggestions (N)" CTA
   *   reviewing  → compact header (icon + title + count pill)
   *   terminal   → "Suggestions" + count + disabled "Reviewed All" pill
   *
   * Paired idle cards are click-to-activate via `onActivate` which
   * dispatches `activateSuggestion`. Active card's up/down arrows
   * are disabled at the boundaries (no unresolved card prev/next of
   * the active one) via `canGoPrev` / `canGoNext`.
   * ───────────────────────────────────────────────────────────── */
  const canGoPrev = hasUndecidedNeighbour(
    kbSuggestions,
    effectiveDecisions,
    aiState.activeIndex,
    'prev',
  );
  const canGoNext = hasUndecidedNeighbour(
    kbSuggestions,
    effectiveDecisions,
    aiState.activeIndex,
    'next',
  );

  const summaryNode = (
    <>
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
          onReview={() => {
            const firstId = kbSuggestions[0]?.id;
            if (firstId) {
              dispatch({ type: 'activateSuggestion', id: firstId });
            }
          }}
          onPrev={() => dispatch({ type: 'prev' })}
          onNext={() => dispatch({ type: 'next' })}
        />
      )}
      {effectiveMode === 'reviewing' && (
        <AISuggestionsCard
          mode="reviewing"
          count={remaining}
          summary={SUMMARY}
        />
      )}
      {effectiveMode === 'terminal' && (
        <AISuggestionsCard
          mode="terminal"
          count={kbSuggestions.length}
          summary={SUMMARY}
          onPrev={() => dispatch({ type: 'prev' })}
          onNext={() => dispatch({ type: 'next' })}
        />
      )}
    </>
  );

  const railItems = React.useMemo<AIGapRailItem[]>(() => {
    return kbSuggestions.map((s, i) => {
      const decision = effectiveDecisions[s.id];
      if (decision) {
        return {
          id: s.id,
          node: (
            <AIGapSuggestionCard
              suggestion={s}
              state={decision}
              onUndo={
                isAlreadyPublished
                  ? undefined
                  : (id) => dispatch({ type: 'undo', id })
              }
            />
          ),
        };
      }
      if (effectiveMode === 'reviewing' && s.id === activeSuggestion?.id) {
        return {
          id: s.id,
          node: (
            <AIGapSuggestionCard
              suggestion={s}
              state="active"
              onPrev={() => dispatch({ type: 'prev' })}
              onNext={() => dispatch({ type: 'next' })}
              onOpenSources={(id) =>
                dispatch({ type: 'openSources', id })
              }
              onAccept={(id) => dispatch({ type: 'accept', id })}
              onReject={(id) => dispatch({ type: 'reject', id })}
              canGoPrev={canGoPrev}
              canGoNext={canGoNext}
              // Chunk 5 — 1-based position in the ORIGINAL list so the
              // user always sees "I'm on N of M" regardless of which
              // earlier cards have been resolved.
              position={{ index: i + 1, total: kbSuggestions.length }}
            />
          ),
        };
      }
      // pre-review + reviewing-non-active → idle paired card. Clicking
      // an idle card dispatches `activateSuggestion` (chunk 4); the
      // accept/reject pills inside the card dispatch their respective
      // actions directly so users can decide without first activating.
      // When the article is already published (PRD §9.5) suppress all
      // three handlers so the historical chips can't be re-touched.
      return {
        id: s.id,
        node: (
          <AIGapSuggestionCard
            suggestion={s}
            state="idle"
            onActivate={
              isAlreadyPublished
                ? undefined
                : (id) => dispatch({ type: 'activateSuggestion', id })
            }
            onAccept={
              isAlreadyPublished
                ? undefined
                : (id) => dispatch({ type: 'accept', id })
            }
            onReject={
              isAlreadyPublished
                ? undefined
                : (id) => dispatch({ type: 'reject', id })
            }
          />
        ),
      };
    });
  }, [
    kbSuggestions,
    effectiveMode,
    effectiveDecisions,
    activeSuggestion,
    isAlreadyPublished,
    dispatch,
    canGoPrev,
    canGoNext,
  ]);

  return (
    <div data-route="ai-optimise-review" className="w-full">
      <div
        data-kb-part="ai-gaps-columns"
        className="flex flex-row justify-between items-start gap-6"
      >
        <ArticleBody
          ref={articleRef}
          decisions={articleDecisions}
          regions={passwordResetRegions}
          suggestionIds={articleSuggestionIds}
          className="max-w-[720px] w-full"
        />
        <AIGapRail
          articleRef={articleRef}
          summary={summaryNode}
          items={railItems}
        />
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
