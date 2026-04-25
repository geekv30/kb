import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import '../tokens.css';
import { AppShell } from '../components/shell/AppShell';
import { KBBreadcrumbBar } from '../components/shell/KBBreadcrumbBar';
import { ArticleBody } from '../components/content/ArticleBody';
import type {
  ArticleBodyDecisions,
  ArticleSuggestionDecision,
} from '../components/content/ArticleBody';
import { AISuggestionsCard } from '../components/content/AISuggestionsCard';
import { AIGapSuggestionCard } from '../components/content/AIGapSuggestionCard';
import { ArticleSettingsPanel } from '../components/content/ArticleSettingsPanel';
import type { ArticleSettings } from '../components/content/ArticleSettingsPanel';
import type { AISuggestion } from '../components/content/ai-suggestion-types';
import {
  SourcesSideSheet,
  type ConversationSource,
} from '../components/overlays/SourcesSideSheet';
import { useAIGapsReducer } from './useAIGapsReducer';

/* ─────────────────────────────────────────────────────────────
 * KB AI Gaps Experience — Figma `9aGp5t9fH1d0PXi4LMhOdb#74:10788`
 *
 * Six **static** frame stories corresponding to the 10-frame flow-doc at
 * `ai-suggestions-flow.md`. Each story pins the 3-suggestion decision tuple
 * + the right-rail card stack to a specific review moment; no state
 * machine. A stateful variant will be dispatched in round 3 (P6.5b).
 *
 * Frame map:
 *   Frame 2  `81:17189`  pre-review             — all `inactive`, AI Suggestions card
 *   Frame 3  `81:16926`  active addition        — s1 `active`, stacked s2 preview
 *   Frame 5  `81:16634`  first accepted         — s1 `accepted`, s2 `active`
 *   Frame 6  `81:16342`  active replace         — same decisions as Frame 5,
 *                                                 different conceptual scroll
 *   Frame 8  `81:15737`  active removal         — s1/s2 `accepted`, s3 `active`
 *   Frame 10 `81:14752`  terminal               — all `accepted`, Suggestions card
 *
 * Convention notes:
 *   - Every story renders `AppShell` with `sidebarCollapsed=true` — rail +
 *     explorer unmounted, content column spans the viewport. Matches the
 *     Figma editor chrome (no left rail visible in any of the six frames).
 *   - Right rail is a 380-wide column rendering the real
 *     `ArticleSettingsPanel` in its `compact` variant — phase R3 dropped
 *     the earlier presentational stand-in once `compact` shipped, so the
 *     editor's settings panel and the AI Gaps rail now share one source
 *     of truth.
 *   - The rail is `sticky top-4` so it stays visible while the article
 *     body scrolls (matches the interactive flow's behaviour and avoids
 *     Frame 8's rail scrolling off-screen).
 *   - Publish button flips disabled → enabled once at least one suggestion
 *     is `accepted` (Frames 2/3 disabled, Frames 5/6/8/10 enabled).
 * ───────────────────────────────────────────────────────────── */

const meta: Meta = {
  title: 'Patterns/KB AI Gaps',
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj;

/* ─────────────────────────────────────────────────────────────
 * Shared data
 * ───────────────────────────────────────────────────────────── */

const breadcrumbItems = [
  { id: 'getting-started', label: 'Getting Started' },
  { id: 'slack', label: 'Integrating Hiver in Slack' },
  { id: 'incognito', label: 'Hiver in Incognito' },
  { id: 'article', label: 'How to reset your Password' },
];

const s1Addition: AISuggestion = {
  id: 's1',
  type: 'addition',
  title: 'Mobile app password reset instructions',
  description:
    'Add detailed mobile app password reset instructions with proper steps and bullet points',
  sourceCount: 4,
};

const s2Replace: AISuggestion = {
  id: 's2',
  type: 'replace',
  title: 'Update outdated URL',
  description: 'Removing old link and adding new',
  sourceCount: 4,
};

const s3Removal: AISuggestion = {
  id: 's3',
  type: 'removal',
  title: 'Legacy Instructions',
  description:
    'Remove outdated reference to the old Chrome extension reset flow and steps',
  sourceCount: 4,
};

const SUMMARY =
  'Refining the article with updated instruction set, updating link and by removing legacy instructions';

/* ─────────────────────────────────────────────────────────────
 * Settings panel data
 *
 * Real `ArticleSettingsPanel` in its `compact` variant (380 px width,
 * matches the rail). Module-level so identity is stable across the six
 * static stories + Interactive — keeps the panel from re-deriving its
 * internal mirror state on every story render.
 * ───────────────────────────────────────────────────────────── */

const dummySettings: ArticleSettings = {
  author: { name: 'Aileen Kelly', initials: 'AK' },
  category: 'Getting Started',
  slug: 'reset-password',
  tags: ['password', 'security'],
  publishDate: 'Apr 12, 2026',
  seoTitle: 'How to reset your password — Hiver KB',
  visibility: 'Public',
  reviewers: [
    { name: 'Mara Reyes', initials: 'MR' },
    { name: 'Tom Singh', initials: 'TS' },
  ],
};

/* ─────────────────────────────────────────────────────────────
 * Shell wrapper — same layout for every frame; the rail + decisions vary.
 * ───────────────────────────────────────────────────────────── */

type FrameShellProps = {
  decisions: ArticleBodyDecisions;
  rail: React.ReactNode;
  publishDisabled: boolean;
};

function FrameShell({ decisions, rail, publishDisabled }: FrameShellProps) {
  return (
    <AppShell
      sidebarCollapsed={true}
      breadcrumb={
        <KBBreadcrumbBar
          variant="editor"
          sidebarCollapsed={true}
          items={breadcrumbItems}
          publishDisabled={publishDisabled}
          onSaveAsDraft={() => {
            // eslint-disable-next-line no-console
            console.log('[ai-gaps] save as draft');
          }}
          onPublish={() => {
            // eslint-disable-next-line no-console
            console.log('[ai-gaps] publish');
          }}
          onClose={() => {
            // eslint-disable-next-line no-console
            console.log('[ai-gaps] close');
          }}
        />
      }
    >
      <div
        data-kb-part="ai-gaps-columns"
        className="flex flex-row justify-between items-start gap-6"
      >
        <ArticleBody decisions={decisions} className="max-w-[720px] w-full" />
        <aside
          data-kb-part="ai-gaps-rail"
          /*
           * `sticky top-4` keeps the rail in view as the article scrolls
           * inside <main>. The Interactive render already used this — the
           * static frames inherit it now so Frame 8 (with three rail cards
           * + accepted chips) doesn't push the rail off-screen.
           */
          className="w-[380px] shrink-0 flex flex-col gap-4 sticky top-4"
        >
          {rail}
        </aside>
      </div>
    </AppShell>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Noop handlers — static stories don't need real wiring.
 * ───────────────────────────────────────────────────────────── */

const noop = () => {
  // eslint-disable-next-line no-console
  console.log('[ai-gaps] noop — interactive wiring in P6.5b');
};

const noopWithId = (id: string) => {
  // eslint-disable-next-line no-console
  console.log('[ai-gaps] noop id=', id);
};

/* ─────────────────────────────────────────────────────────────
 * Frame 2 — pre-review
 *
 * Figma `81:17189`. All three suggestions rendered as highlight blocks in
 * the body (green / red+green / red). Right rail: Settings collapsed +
 * AI Suggestions card with `Review Suggestions (3)`. Publish disabled.
 * ───────────────────────────────────────────────────────────── */

export const Frame2PreReview: Story = {
  name: 'Frame 2 — Pre-review',
  render: () => (
    <div className="h-screen w-full">
      <FrameShell
        decisions={{ s1: 'inactive', s2: 'inactive', s3: 'inactive' }}
        publishDisabled={true}
        rail={
          <>
            <ArticleSettingsPanel compact defaultCollapsed value={dummySettings} />
            <AISuggestionsCard
              mode="pre-review"
              count={3}
              summary={SUMMARY}
              onReview={noop}
              onPrev={noop}
              onNext={noop}
            />
          </>
        }
      />
    </div>
  ),
};

/* ─────────────────────────────────────────────────────────────
 * Frame 3 — active addition (s1)
 *
 * Figma `81:16926`. First suggestion active; second suggestion previewed
 * beneath at reduced opacity (Figma shows a dimmed card stacked below the
 * active one). Publish still disabled (no accepts yet).
 * ───────────────────────────────────────────────────────────── */

export const Frame3ActiveAddition: Story = {
  name: 'Frame 3 — Active Addition',
  render: () => (
    <div className="h-screen w-full">
      <FrameShell
        decisions={{ s1: 'active', s2: 'inactive', s3: 'inactive' }}
        publishDisabled={true}
        rail={
          <>
            <ArticleSettingsPanel compact defaultCollapsed value={dummySettings} />
            <AIGapSuggestionCard
              suggestion={s1Addition}
              state="active"
              onPrev={noop}
              onNext={noop}
              onOpenSources={noopWithId}
              onAccept={noopWithId}
              onReject={noopWithId}
            />
            {/*
              Stacked next-suggestion preview. The earlier opacity-60
              wrapper read as washed-out (text contrast dropped below
              4.5:1 against white) — we now communicate "preview" via a
              tinted #f8fafc background while keeping the inner card's
              text and border at full contrast. Inner card border is
              preserved with the descendant selector so the slate-tint
              doesn't dilute the existing visual edge.
            */}
            <div
              data-kb-preview="true"
              className="relative rounded-[12px] bg-[#f8fafc] [&>*]:!border-card-border"
            >
              <AIGapSuggestionCard
                suggestion={s2Replace}
                state="active"
                onPrev={noop}
                onNext={noop}
                onOpenSources={noopWithId}
                onAccept={noopWithId}
                onReject={noopWithId}
              />
            </div>
          </>
        }
      />
    </div>
  ),
};

/* ─────────────────────────────────────────────────────────────
 * Frame 5 — first accepted + active replace
 *
 * Figma `81:16634`. Addition accepted → plain body copy. s2 is now the
 * active card with the replace diff visible inline. Publish flips to
 * enabled from here on.
 * ───────────────────────────────────────────────────────────── */

export const Frame5AcceptedAddition: Story = {
  name: 'Frame 5 — Accepted Addition',
  render: () => (
    <div className="h-screen w-full">
      <FrameShell
        decisions={{ s1: 'accepted', s2: 'active', s3: 'inactive' }}
        publishDisabled={false}
        rail={
          <>
            <ArticleSettingsPanel compact defaultCollapsed value={dummySettings} />
            <AIGapSuggestionCard
              suggestion={s1Addition}
              state="accepted"
              onUndo={noopWithId}
            />
            <AIGapSuggestionCard
              suggestion={s2Replace}
              state="active"
              onPrev={noop}
              onNext={noop}
              onOpenSources={noopWithId}
              onAccept={noopWithId}
              onReject={noopWithId}
            />
          </>
        }
      />
    </div>
  ),
};

/* ─────────────────────────────────────────────────────────────
 * Frame 6 — active replace (same decisions as Frame 5)
 *
 * Figma `81:16342`. The only difference from Frame 5 is the conceptual
 * scroll position on the article body — a static story can't simulate
 * that. Rendering Frame 6 identically to Frame 5 so reviewers can
 * inspect the same state under a named story.
 * ───────────────────────────────────────────────────────────── */

/*
 * Frame 6 differs from Frame 5 only by article scroll position — Frame 5
 * loads at the top, Frame 6 lands centred on the s2 region (per
 * `ai-suggestions-flow.md` §6 "Active Replace"). We extract the render
 * into a component so a `useEffect` can perform the one-shot scroll on
 * mount; `behavior: 'instant'` keeps the story from animating into the
 * scrolled state on first paint.
 */
function Frame6Render() {
  React.useEffect(() => {
    const el = document.getElementById('s2');
    if (el) el.scrollIntoView({ block: 'center', behavior: 'instant' });
  }, []);

  return (
    <div className="h-screen w-full">
      <FrameShell
        decisions={{ s1: 'accepted', s2: 'active', s3: 'inactive' }}
        publishDisabled={false}
        rail={
          <>
            <ArticleSettingsPanel compact defaultCollapsed value={dummySettings} />
            <AIGapSuggestionCard
              suggestion={s1Addition}
              state="accepted"
              onUndo={noopWithId}
            />
            <AIGapSuggestionCard
              suggestion={s2Replace}
              state="active"
              onPrev={noop}
              onNext={noop}
              onOpenSources={noopWithId}
              onAccept={noopWithId}
              onReject={noopWithId}
            />
          </>
        }
      />
    </div>
  );
}

export const Frame6ActiveReplace: Story = {
  name: 'Frame 6 — Active Replace',
  render: () => <Frame6Render />,
};

/* ─────────────────────────────────────────────────────────────
 * Frame 8 — active removal (s3)
 *
 * Figma `81:15737`. Two suggestions accepted (chips), third is the active
 * removal with red wash over Troubleshooting + Chrome Extension section.
 * ───────────────────────────────────────────────────────────── */

export const Frame8ActiveRemoval: Story = {
  name: 'Frame 8 — Active Removal',
  render: () => (
    <div className="h-screen w-full">
      <FrameShell
        decisions={{ s1: 'accepted', s2: 'accepted', s3: 'active' }}
        publishDisabled={false}
        rail={
          <>
            <ArticleSettingsPanel compact defaultCollapsed value={dummySettings} />
            <AIGapSuggestionCard
              suggestion={s1Addition}
              state="accepted"
              onUndo={noopWithId}
            />
            <AIGapSuggestionCard
              suggestion={s2Replace}
              state="accepted"
              onUndo={noopWithId}
            />
            <AIGapSuggestionCard
              suggestion={s3Removal}
              state="active"
              onPrev={noop}
              onNext={noop}
              onOpenSources={noopWithId}
              onAccept={noopWithId}
              onReject={noopWithId}
            />
          </>
        }
      />
    </div>
  ),
};

/* ─────────────────────────────────────────────────────────────
 * Frame 10 — terminal (all reviewed)
 *
 * Figma `81:14752`. All three accepted. Rail morphs from review-mode
 * into summary: Settings + `Suggestions [3]` terminal card with disabled
 * `✓ Reviewed All` pill. Dispatch notes the 3 accepted chips are
 * optional below the terminal card — Figma shows them hidden, so we
 * match Figma and omit them.
 * ───────────────────────────────────────────────────────────── */

export const Frame10Terminal: Story = {
  name: 'Frame 10 — Terminal',
  render: () => (
    <div className="h-screen w-full">
      <FrameShell
        decisions={{ s1: 'accepted', s2: 'accepted', s3: 'accepted' }}
        publishDisabled={false}
        rail={
          <>
            <ArticleSettingsPanel compact defaultCollapsed value={dummySettings} />
            <AISuggestionsCard
              mode="terminal"
              count={3}
              summary={SUMMARY}
              onPrev={noop}
              onNext={noop}
            />
          </>
        }
      />
    </div>
  ),
};

/* ─────────────────────────────────────────────────────────────
 * Interactive story (P6.5b)
 *
 * Wraps the same static composition above in a reducer-driven state
 * machine that implements the full 10-frame flow from
 * `ai-suggestions-flow.md`. User presses `Review Suggestions (N)` →
 * cycles through suggestions → ends in terminal state. Accept / reject /
 * undo / prev / next / sources-sheet all wired. Keyboard shortcuts
 * (`j`/`k`/`y`/`n`/`↑`/`↓`/`Enter`/`Esc`) can be toggled off via the
 * `enableKeyboard` arg.
 *
 * Composition inherits exactly from the static frames above — same
 * `AppShell`, same right-rail width (380), same `ArticleBody` width
 * constraints. The reducer lives in `./useAIGapsReducer.ts`.
 * ───────────────────────────────────────────────────────────── */

// Module-level so identity is stable across renders of the story.
// Stable identity lets `useAIGapsReducer` treat the list as immutable
// and keeps the reducer closure from re-binding every render.
const interactiveSuggestions: AISuggestion[] = [s1Addition, s2Replace, s3Removal];

// All three suggestions share the same support-conversation fixture,
// per ai-suggestions-flow.md §frame 4. If the flow ever scopes sources
// per suggestion, replace with a `Record<suggestionId, ConversationSource[]>`.
const sharedSources: ConversationSource[] = [
  {
    id: '1',
    senderName: 'Ava Johnson',
    timestamp: 'Feb 4, 2:45 PM',
    subject: "I can't log into my account.",
    snippet: "I'm experiencing syncing problems on my devices...",
  },
  {
    id: '2',
    senderName: 'Sophie Lee',
    timestamp: 'Feb 4, 9:45 PM',
    subject: "I can't log into my account.",
    snippet: "I'm having trouble syncing my devices. My data is...",
  },
  {
    id: '3',
    senderName: 'Emma Garcia',
    timestamp: 'Feb 4, 4:45 PM',
    subject: "I can't log into my account.",
    snippet: "I'm facing syncing issues on my devices. My data i...",
  },
  {
    id: '4',
    senderName: 'Emma Johnson',
    timestamp: 'February 4, 1:45 PM',
    subject: "I'm unable to access my account.",
    snippet: "I'm experiencing syncing issues on my devices. M...",
  },
];

type InteractiveRenderProps = {
  /**
   * When true, window-level keydown listener maps j/k/ArrowDown/ArrowUp/
   * y/n/Enter/Esc to reducer actions. Default true. Exposed as a
   * Storybook arg for reviewers who want to exercise the pure click flow.
   */
  enableKeyboard?: boolean;
};

/**
 * For `ArticleBody.decisions`:
 * - If the suggestion has been explicitly decided → use its decision
 *   (`'accepted' | 'dismissed'`). These map 1:1 onto the `ArticleBody`
 *   decision vocabulary.
 * - Else if it matches the current active index AND we're reviewing →
 *   `'active'` so ArticleBody can later style it differently.
 * - Else → `'inactive'` (highlight visible but not focused). Pre-review
 *   and terminal both land here for non-decided suggestions.
 */
function buildArticleDecisions(
  suggestions: AISuggestion[],
  activeIndex: number,
  decisions: Record<string, 'accepted' | 'dismissed'>,
  mode: 'pre-review' | 'reviewing' | 'terminal',
): ArticleBodyDecisions {
  const state: Record<string, ArticleSuggestionDecision> = {};
  for (let i = 0; i < suggestions.length; i += 1) {
    const s = suggestions[i];
    const decided = decisions[s.id];
    if (decided) {
      state[s.id] = decided;
      continue;
    }
    if (mode === 'reviewing' && i === activeIndex) {
      state[s.id] = 'active';
      continue;
    }
    state[s.id] = 'inactive';
  }
  // The three suggestion ids (s1/s2/s3) are hardcoded by ArticleBody. If
  // `interactiveSuggestions` ever diverges, ArticleBody needs updating too.
  return {
    s1: state['s1'] ?? 'inactive',
    s2: state['s2'] ?? 'inactive',
    s3: state['s3'] ?? 'inactive',
  };
}

function InteractiveRender({ enableKeyboard = true }: InteractiveRenderProps) {
  const { state, dispatch, publishEnabled } = useAIGapsReducer(
    interactiveSuggestions,
  );
  const activeSuggestion = interactiveSuggestions[state.activeIndex];

  /* ─────────────────────────────────────────────────────────
   * Scroll side effects
   *
   * Two distinct scroll behaviours:
   * 1. `reviewing` — scroll the active suggestion block into view.
   *    Target is looked up by `SuggestionBlock`'s `id` prop, which it
   *    emits on its root DOM element.
   * 2. `terminal` — scroll the <main> back to the top (per frame 10
   *    annotation: "will scroll to top once the last suggestion is
   *    acted upon").
   *
   * `scrollIntoView` walks up to the nearest scrollable ancestor, which
   * is the `<main>` inside `AppShell` (`overflow-y-auto`). `window` is
   * not scrollable here because `AppShell` clips at `h-screen` +
   * `overflow-hidden`. We therefore NEVER use `window.scrollTo`.
   * ───────────────────────────────────────────────────────────── */
  React.useEffect(() => {
    if (state.mode === 'reviewing') {
      const id = interactiveSuggestions[state.activeIndex]?.id;
      if (!id) return;
      const el = document.getElementById(id);
      // `el` can be null if the active suggestion's block has been
      // removed (e.g. an addition that was dismissed, or a removal that
      // was accepted). Silently no-op in that case — the user can prev/
      // next to a still-rendered block.
      if (el) {
        el.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
      return;
    }
    // Both `terminal` (frame 10) and `pre-review` (post-reset) scroll
    // <main> to the top. This keeps the close/reset handler from
    // leaving the user mid-article, and matches flow-doc §frame 10:
    // "will scroll to top once the last suggestion is acted upon".
    const main = document.querySelector('main');
    if (main) {
      main.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [state.mode, state.activeIndex]);

  /* ─────────────────────────────────────────────────────────
   * Keyboard shortcuts
   *
   * Bindings:
   *   j / ArrowDown  →  next
   *   k / ArrowUp    →  prev
   *   y / Enter      →  accept active
   *   n              →  reject active
   *   Escape         →  close sources sheet (Radix Dialog also handles
   *                     this natively; wired for parity when the sheet is
   *                     open but focus has escaped the portal)
   *
   * Bails when:
   *   - `enableKeyboard` is false (story arg)
   *   - sources sheet is open and key isn't Escape
   *   - mode is not `reviewing` (pre-review / terminal have no accept
   *     semantics, only the card's own click targets)
   *
   * Also bails if focus is inside an input/textarea so the keyboard
   * layer doesn't hijack typing. (No inputs exist in this story today
   * but future settings expansion might.)
   * ───────────────────────────────────────────────────────────── */
  React.useEffect(() => {
    if (!enableKeyboard) return;
    function handler(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || target?.isContentEditable) {
        return;
      }
      if (state.sourcesFor) {
        if (e.key === 'Escape') dispatch({ type: 'closeSources' });
        return;
      }
      if (state.mode !== 'reviewing') return;
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
    }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [enableKeyboard, state.mode, state.sourcesFor, activeSuggestion, dispatch]);

  const articleDecisions = buildArticleDecisions(
    interactiveSuggestions,
    state.activeIndex,
    state.decisions,
    state.mode,
  );

  return (
    <div className="h-screen w-full">
      <AppShell
        sidebarCollapsed={true}
        breadcrumb={
          <KBBreadcrumbBar
            variant="editor"
            sidebarCollapsed={true}
            items={breadcrumbItems}
            publishDisabled={!publishEnabled}
            onSaveAsDraft={() => {
              // eslint-disable-next-line no-console
              console.log('[ai-gaps/interactive] save as draft');
            }}
            onPublish={() => {
              // eslint-disable-next-line no-console
              console.log('[ai-gaps/interactive] publish');
            }}
            onClose={() => dispatch({ type: 'reset' })}
          />
        }
      >
        <div
          data-kb-part="ai-gaps-columns"
          className="flex flex-row justify-between items-start gap-6"
        >
          <ArticleBody
            decisions={articleDecisions}
            className="max-w-[720px] w-full"
          />
          <aside
            data-kb-part="ai-gaps-rail"
            /*
             * `sticky top-4` keeps the rail in view as the article scrolls
             * inside <main>. Round 2's static frames didn't need this since
             * state was fixed per story; in the interactive flow the user
             * auto-scrolls between suggestions and the rail must follow.
             */
            className="w-[380px] shrink-0 flex flex-col gap-4 sticky top-4"
          >
            <ArticleSettingsPanel compact defaultCollapsed value={dummySettings} />

            {state.mode === 'pre-review' && (
              <AISuggestionsCard
                mode="pre-review"
                count={interactiveSuggestions.length}
                summary={SUMMARY}
                onReview={() => dispatch({ type: 'review' })}
                onPrev={() => dispatch({ type: 'prev' })}
                onNext={() => dispatch({ type: 'next' })}
              />
            )}

            {state.mode === 'reviewing' &&
              interactiveSuggestions.map((s) => {
                const decision = state.decisions[s.id];
                if (decision) {
                  // Reviewed suggestions persist as chips in the rail so
                  // the user can undo at any time — matches flow-doc
                  // frames 5/7/8.
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
                // Un-decided, non-active suggestions are invisible in the
                // rail during `reviewing` — matches frames 3/5/7/8.
                return null;
              })}

            {state.mode === 'terminal' && (
              <>
                <AISuggestionsCard
                  mode="terminal"
                  count={interactiveSuggestions.length}
                  summary={SUMMARY}
                  onPrev={() => dispatch({ type: 'prev' })}
                  onNext={() => dispatch({ type: 'next' })}
                />
                {/*
                 * Show every decision chip below the terminal card so the
                 * user can still undo any individual decision. Figma hides
                 * these in frame 10, but the dispatch explicitly calls out
                 * that undo must remain available from the terminal screen
                 * so the user can re-open a dismissed or accepted item.
                 */}
                {interactiveSuggestions.map((s) => {
                  const decision = state.decisions[s.id];
                  if (!decision) return null;
                  return (
                    <AIGapSuggestionCard
                      key={s.id}
                      suggestion={s}
                      state={decision}
                      onUndo={(id) => dispatch({ type: 'undo', id })}
                    />
                  );
                })}
              </>
            )}
          </aside>
        </div>
      </AppShell>

      <SourcesSideSheet
        open={state.sourcesFor !== null}
        onOpenChange={(open) => {
          if (!open) dispatch({ type: 'closeSources' });
        }}
        sources={sharedSources}
      />
    </div>
  );
}

export const Interactive: StoryObj<InteractiveRenderProps> = {
  name: 'Interactive',
  args: { enableKeyboard: true },
  argTypes: {
    enableKeyboard: {
      control: 'boolean',
      description:
        'Toggle window-level keyboard shortcuts (j/k/y/n/arrows/Enter/Esc)',
    },
  },
  render: (args) => <InteractiveRender {...args} />,
};
