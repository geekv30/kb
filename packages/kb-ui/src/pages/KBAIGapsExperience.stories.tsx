import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import '../tokens.css';
import { AppShell } from '../components/shell/AppShell';
import { KBBreadcrumbBar } from '../components/shell/KBBreadcrumbBar';
import { EditorBreadcrumbActions } from '../components/shell/EditorBreadcrumbActions';
import { ArticleBody } from '../components/content/ArticleBody';
import type {
  ArticleBodyDecisions,
  ArticleBodyRegions,
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
import { useAIGapsReducer } from '../hooks/useAIGapsReducer';

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

// Meta declared at the bottom of the file (after the wrapper) so it can
// reference the unified `AIGapsExperience` wrapper for `component`/`render`.

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
 * Password-reset article markup
 *
 * Authored once and threaded through every story (static + interactive)
 * via `ArticleBody`'s `regions` prop. Lives here so the canonical
 * password-reset content has a single source of truth — the demo's
 * AI review route mirrors the same shape.
 *
 * Typography helpers stay private to this file: ArticleBody no longer
 * ships them and the consumer owns the article markup, so each consumer
 * matches their own article styling. The values below are extracted
 * from Figma `9aGp5t9fH1d0PXi4LMhOdb#74:10788` to match the editor
 * chrome 1:1.
 * ───────────────────────────────────────────────────────────── */

function H1({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="mb-2 text-[24px] font-semibold leading-[32px] text-[#0f172a]">
      {children}
    </h1>
  );
}

function Subtitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-6 text-[14px] font-normal leading-[20px] text-[#64758b]">
      {children}
    </p>
  );
}

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-6 mb-3 text-[20px] font-semibold leading-[28px] text-[#0f172a]">
      {children}
    </h2>
  );
}

function H3({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mt-4 mb-2 text-[16px] font-semibold leading-[24px] text-[#0f172a]">
      {children}
    </h3>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-4 text-[16px] font-normal leading-[24px] text-[#334155]">
      {children}
    </p>
  );
}

function OL({ children }: { children: React.ReactNode }) {
  return (
    <ol className="mb-4 list-decimal pl-6 text-[16px] font-normal leading-[24px] text-[#334155] [&>li]:mb-2">
      {children}
    </ol>
  );
}

function UL({ children }: { children: React.ReactNode }) {
  return (
    <ul className="mb-4 list-disc pl-6 text-[16px] font-normal leading-[24px] text-[#334155] [&>li]:mb-2">
      {children}
    </ul>
  );
}

function Strong({ children }: { children: React.ReactNode }) {
  return (
    <strong className="font-semibold text-[#0f172a]">{children}</strong>
  );
}

const passwordResetRegions: ArticleBodyRegions = {
  header: (
    <>
      <H1>How to Reset Your Password</H1>
      <Subtitle>Last updated 2 months ago</Subtitle>
    </>
  ),
  beforeS1: (
    <P>
      Resetting your password in Hiver is simple and secure. You can update
      it from your account settings if you remember your current password,
      or use the password recovery flow if you&rsquo;ve forgotten it.
    </P>
  ),
  s1: (
    <>
      <H2>Resetting Your Password via Mobile App</H2>
      <P>
        If you&rsquo;re using the Hiver mobile app, follow these steps to
        reset your password:
      </P>
      <OL>
        <li>Open the Hiver mobile app on your device</li>
        <li>Tap on &ldquo;Forgot Password&rdquo; on the login screen</li>
        <li>Enter your registered email address</li>
        <li>Check your email for a password reset link</li>
        <li>Tap the link and follow the instructions to set a new password</li>
        <li>Log in with your new password</li>
      </OL>
    </>
  ),
  betweenS1AndS2: (
    <>
      <H2>Resetting Password via Admin Panel</H2>
      <P>
        If you&rsquo;re an administrator, you can reset passwords on behalf
        of other users:
      </P>
    </>
  ),
  s2: {
    before: (
      <P>
        Navigate to the admin panel at{' '}
        <Strong>admin.hiver.com/legacy/users</Strong> and select the user
        whose password needs to be reset.
      </P>
    ),
    after: (
      <P>
        Navigate to the admin panel at{' '}
        <Strong>admin.hiver.com/settings/users</Strong> and select the user
        whose password needs to be reset. You can also use the search bar
        to quickly find users by name or email.
      </P>
    ),
  },
  betweenS2AndS3: null,
  s3: (
    <>
      <H2>Troubleshooting</H2>
      <H3>Resetting via Chrome Extension</H3>
      <P>
        If you&rsquo;re using the Hiver Chrome Extension and experiencing
        issues resetting your password, try clearing your browser cache,
        restarting Chrome, and attempting the reset flow again. If issues
        persist, contact support.
      </P>
    </>
  ),
  afterS3: (
    <>
      <H2>Password Requirements</H2>
      <P>Your new password must meet the following criteria:</P>
      <UL>
        <li>At least 8 characters long</li>
        <li>Include at least one uppercase letter</li>
        <li>Include at least one number</li>
        <li>Include at least one special character</li>
      </UL>
    </>
  ),
};

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
          sidebarCollapsed={true}
          items={breadcrumbItems}
          actions={
            <EditorBreadcrumbActions
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
        />
      }
    >
      <div
        data-kb-part="ai-gaps-columns"
        className="flex flex-row justify-between items-start gap-6"
      >
        <ArticleBody
          decisions={decisions}
          regions={passwordResetRegions}
          className="max-w-[720px] w-full"
        />
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
 * Per-frame rail compositions
 *
 * Each helper returns the right-rail children + the matching
 * `decisions` tuple + `publishDisabled` flag for one of the six static
 * frames documented above. Inlined as helpers so the unified
 * `AIGapsExperience` wrapper can pick a frame via the `frame` arg.
 *
 * Frame map:
 *   `frame-2`  Figma `81:17189`  pre-review            — all `inactive`, AI Suggestions card
 *   `frame-3`  Figma `81:16926`  active addition       — s1 `active`, stacked s2 preview
 *   `frame-5`  Figma `81:16634`  first accepted        — s1 `accepted`, s2 `active`
 *   `frame-6`  Figma `81:16342`  active replace        — same decisions as frame-5,
 *                                                       differs only by article scroll position
 *   `frame-8`  Figma `81:15737`  active removal        — s1/s2 `accepted`, s3 `active`
 *   `frame-10` Figma `81:14752`  terminal              — all `accepted`, Suggestions card
 * ───────────────────────────────────────────────────────────── */

type StaticFrameId =
  | 'frame-2'
  | 'frame-3'
  | 'frame-5'
  | 'frame-6'
  | 'frame-8'
  | 'frame-10';

type StaticFrameComposition = {
  decisions: ArticleBodyDecisions;
  publishDisabled: boolean;
  rail: React.ReactNode;
};

function buildStaticFrame(frame: StaticFrameId): StaticFrameComposition {
  switch (frame) {
    case 'frame-2':
      return {
        decisions: { s1: 'inactive', s2: 'inactive', s3: 'inactive' },
        publishDisabled: true,
        rail: (
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
        ),
      };
    case 'frame-3':
      return {
        decisions: { s1: 'active', s2: 'inactive', s3: 'inactive' },
        publishDisabled: true,
        rail: (
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
        ),
      };
    case 'frame-5':
    case 'frame-6':
      // Frames 5 and 6 share state. Frame 6 differs only by article
      // scroll position — handled by `Frame6ScrollEffect` in the wrapper.
      return {
        decisions: { s1: 'accepted', s2: 'active', s3: 'inactive' },
        publishDisabled: false,
        rail: (
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
        ),
      };
    case 'frame-8':
      return {
        decisions: { s1: 'accepted', s2: 'accepted', s3: 'active' },
        publishDisabled: false,
        rail: (
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
        ),
      };
    case 'frame-10':
      return {
        decisions: { s1: 'accepted', s2: 'accepted', s3: 'accepted' },
        publishDisabled: false,
        rail: (
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
        ),
      };
  }
}

/*
 * Frame 6 lands the article body centred on the s2 region (per
 * `ai-suggestions-flow.md` §6 "Active Replace"). One-shot scroll on
 * mount; `behavior: 'instant'` keeps the story from animating into the
 * scrolled state on first paint. Re-keyed via the parent's `key` so the
 * effect re-fires when the user toggles the `frame` control to
 * `frame-6` from another value.
 */
function Frame6ScrollEffect() {
  React.useEffect(() => {
    const el = document.getElementById('s2');
    if (el) el.scrollIntoView({ block: 'center', behavior: 'instant' });
  }, []);
  return null;
}

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
 * constraints. The reducer lives in `../hooks/useAIGapsReducer.ts`.
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

type AIGapsExperienceProps = {
  /**
   * Which moment of the AI Gaps flow to render.
   *   - `frame-2` … `frame-10` — six static review-moment frames pulled
   *     directly from Figma. Each pins a fixed decision tuple + rail
   *     composition (see `buildStaticFrame`).
   *   - `interactive` — full reducer-driven 10-frame flow. Click `Review
   *     Suggestions` to enter review, accept/reject each suggestion,
   *     end in the terminal state. Keyboard shortcuts available when
   *     `enableKeyboard` is true.
   */
  frame:
    | 'frame-2'
    | 'frame-3'
    | 'frame-5'
    | 'frame-6'
    | 'frame-8'
    | 'frame-10'
    | 'interactive';
  /**
   * Only meaningful when `frame === 'interactive'`. When true, window-level
   * keydown listener maps j/k/ArrowDown/ArrowUp/y/n/Enter/Esc to reducer
   * actions. Reviewers can switch off to exercise the pure click flow.
   */
  enableKeyboard: boolean;
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

/* ─────────────────────────────────────────────────────────────
 * Static frame render — six fixed Figma frames + Frame 6's one-shot
 * scroll effect. Wrapped in `<div className="h-screen w-full">` to give
 * AppShell a concrete height to fill.
 * ───────────────────────────────────────────────────────────── */

function StaticFrameRender({
  frame,
}: {
  frame: Exclude<AIGapsExperienceProps['frame'], 'interactive'>;
}) {
  const { decisions, publishDisabled, rail } = buildStaticFrame(frame);
  return (
    <div className="h-screen w-full">
      {frame === 'frame-6' && <Frame6ScrollEffect />}
      <FrameShell
        decisions={decisions}
        publishDisabled={publishDisabled}
        rail={rail}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Interactive render — reducer-driven 10-frame flow. Same composition
 * as the static frames (AppShell + 720 article body + 380 rail), but
 * decisions and rail content are state-driven.
 * ───────────────────────────────────────────────────────────── */

function InteractiveRender({ enableKeyboard }: { enableKeyboard: boolean }) {
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
            sidebarCollapsed={true}
            items={breadcrumbItems}
            actions={
              <EditorBreadcrumbActions
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
          />
        }
      >
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

/* ─────────────────────────────────────────────────────────────
 * Unified wrapper — picks static vs interactive render based on the
 * `frame` arg. Component-level identity is required by Storybook's
 * args pipeline so the controls panel re-renders the same component
 * with new props rather than mounting a different story.
 * ───────────────────────────────────────────────────────────── */

function AIGapsExperience({ frame, enableKeyboard }: AIGapsExperienceProps) {
  if (frame === 'interactive') {
    return <InteractiveRender enableKeyboard={enableKeyboard} />;
  }
  // `key` forces a remount when toggling between static frames so
  // Frame 6's one-shot scroll effect re-fires each time the user
  // re-selects it from a different frame.
  return <StaticFrameRender key={frame} frame={frame} />;
}

/* ─────────────────────────────────────────────────────────────
 * Meta + Stories
 * ───────────────────────────────────────────────────────────── */

const meta: Meta<typeof AIGapsExperience> = {
  title: 'Patterns/AI Optimisation/AI Gaps',
  parameters: { layout: 'fullscreen' },
  component: AIGapsExperience,
  args: {
    frame: 'frame-2',
    enableKeyboard: true,
  },
  argTypes: {
    frame: {
      control: 'select',
      options: [
        'frame-2',
        'frame-3',
        'frame-5',
        'frame-6',
        'frame-8',
        'frame-10',
        'interactive',
      ],
      description:
        'Which moment of the AI Gaps flow to render. `frame-2` … `frame-10` are static Figma frames; `interactive` is the reducer-driven full flow.',
    },
    enableKeyboard: {
      control: 'boolean',
      description:
        'Only effective when `frame === "interactive"`. Toggle window-level keyboard shortcuts (j/k/y/n/arrows/Enter/Esc).',
    },
  },
  render: (args) => <AIGapsExperience {...args} />,
};
export default meta;

export const Default: StoryObj<typeof AIGapsExperience> = {};
