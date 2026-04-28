import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import '../tokens.css';
import {
  RiQuillPenLine,
  RiBarChartBoxLine,
  RiSettings5Line,
  RiMagicLine,
  RiSparkling2Line,
} from '@remixicon/react';
import { AppShell } from '../components/shell/AppShell';
import { KBBreadcrumbBar } from '../components/shell/KBBreadcrumbBar';
import { SideNavRail, type NavRailItem } from '../components/nav/SideNavRail';
import {
  FileExplorerNav,
  type NavItem,
} from '../components/nav/FileExplorerNav';
import { SuggestionCard } from '../components/content/SuggestionCard';
import { Avatar } from '../components/primitives/Avatar';
import { CompanyLogo } from '../components/brand/CompanyLogo';
import { AiIcon } from '../components/brand/AiIcon';

/* ─────────────────────────────────────────────────────────────
 * KB AI Optimise Hub — Figma `9aGp5t9fH1d0PXi4LMhOdb#74:8928`
 *
 * Pattern story composing Round 1 atoms into the AI Optimise hub page
 * (frame 1 of the AI Suggestions flow — see `ai-suggestions-flow.md`
 * section 1 `ai-optimise-01`).
 *
 * Three-column layout:
 *   [1] SideNavRail (54)         — ai (active), editor, analytics, settings
 *   [2] FileExplorerNav flat (288) — AI Centre (section) + AI Optimise (item, active)
 *   [3] Content column (938)     — breadcrumb + page header + 3 suggestion cards
 *
 * Convention notes:
 *   - Settings icon = `RiSettings5Line` (matches existing page stories;
 *     spec suggested `RiSettings3Line`/`RiSettingsLine` — CLAUDE.md rule
 *     #3 says match existing conventions, so `5Line` wins).
 *   - Page header is built inline rather than using `PageHeader` — the
 *     hub doesn't have a CTA button and `PageHeader` hard-wires one;
 *     it also uses 18px/gap-0.5 typography whereas the hub uses 24/20
 *     with a 4px gap per Figma.
 * ───────────────────────────────────────────────────────────── */

// Meta declared after the wrapper (see bottom of file) so it can reference
// `AIOptimiseHubPage` for `component`/`render`.

/* ------- Rail items (column 1) ------- */

const railItems: NavRailItem[] = [
  { id: 'ai', icon: <AiIcon size={16} />, label: 'AI' },
  { id: 'editor', icon: <RiQuillPenLine size={16} />, label: 'Editor' },
  { id: 'analytics', icon: <RiBarChartBoxLine size={16} />, label: 'Analytics' },
  { id: 'settings', icon: <RiSettings5Line size={16} />, label: 'Settings' },
];

/* ------- Sub-nav items (column 2) ------- */

const subNavItems: NavItem[] = [
  {
    id: 'ai-centre',
    type: 'article',
    title: 'AI Centre',
    kind: 'section',
    icon: <AiIcon size={16} />,
  },
  {
    id: 'ai-optimise',
    type: 'article',
    title: 'AI Optimise',
    kind: 'item',
    icon: <RiMagicLine size={16} />,
  },
];

/* ------- Breadcrumb ------- */

const breadcrumbItems = [{ id: 'ai-optimise', label: 'AI Optimise' }];

/* ------- Suggestion data (hardcoded inline per story convention) ------- */

type SuggestionSeed = {
  id: string;
  title: string;
  description: string;
  kind: 'article-edit' | 'new-article' | 'move-article';
  conversationCount: number;
  impact: 'high' | 'medium' | 'low';
  pathFrom?: string;
  pathTo?: string;
};

const suggestions: SuggestionSeed[] = [
  {
    id: 'reset-password',
    title: 'How to reset Password',
    description:
      'Updating reset instructions, legacy URL and removing outdated instructions',
    kind: 'article-edit',
    conversationCount: 12,
    impact: 'high',
  },
  {
    id: 'two-factor-auth',
    title: 'How to enable two-factor authentication',
    description:
      'AI will write an article on how to enable two-factor authentication under security > SSO',
    kind: 'new-article',
    conversationCount: 15,
    impact: 'medium',
  },
  {
    id: 'process-reimbursements',
    title: 'How to process reimbursements',
    description: 'moving this article from billing to reimbursements',
    kind: 'move-article',
    conversationCount: 8,
    impact: 'low',
    pathFrom: 'Billing',
    pathTo: 'Reimbursements',
  },
];

/* ─────────────────────────────────────────────────────────────
 * AIOptimiseHubPage — composition wrapper.
 *
 * `AppShell.children` is wrapped in a `<main>` with
 * `pl-6 pr-6 pt-[12px] pb-6` (see AppShell.tsx), so this component does
 * NOT re-add horizontal padding on its children.
 * ───────────────────────────────────────────────────────────── */

function AIOptimiseHubPage() {
  /*
   * Suggestion-list mask is conditional on overflow.
   *
   * The default story renders 3 cards which fit in the viewport — applying
   * a bottom-edge mask unconditionally fades the third card even though
   * nothing is being clipped. We observe the nearest scrollable ancestor
   * (the AppShell `<main>`) and only enable the mask when its
   * scrollHeight > clientHeight. A `ResizeObserver` keeps that decision in
   * sync as cards are added/removed or the viewport resizes.
   */
  const listRef = React.useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = React.useState(false);

  React.useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const check = () => {
      const scroller = list.closest('main');
      if (!scroller) return;
      setIsOverflowing(scroller.scrollHeight > scroller.clientHeight);
    };
    check();
    const ro = new ResizeObserver(check);
    ro.observe(list);
    if (list.parentElement) ro.observe(list.parentElement);
    return () => ro.disconnect();
  }, []);

  const maskStyle = isOverflowing
    ? {
        maskImage:
          'linear-gradient(to bottom, black, black calc(100% - 120px), transparent)',
        WebkitMaskImage:
          'linear-gradient(to bottom, black, black calc(100% - 120px), transparent)',
      }
    : undefined;

  return (
    <AppShell
      rail={
        <SideNavRail
          theme="light"
          items={railItems}
          activeId="ai"
          brandLogo={<CompanyLogo size={24} />}
          bottomSlot={<Avatar initials="A" />}
        />
      }
      explorer={
        <FileExplorerNav
          variant="flat"
          theme="light"
          title="AI"
          headerIcon={<RiSparkling2Line size={16} />}
          items={subNavItems}
          activeId="ai-optimise"
          onItemClick={(id) => {
            // eslint-disable-next-line no-console
            console.log('sub-nav click:', id);
          }}
        />
      }
      breadcrumb={
        <KBBreadcrumbBar
          variant="category"
          items={breadcrumbItems}
          onCollapse={() => {
            // eslint-disable-next-line no-console
            console.log('collapse');
          }}
        />
      }
    >
      {/* Page header — inline. Title 24/semibold, subtitle 14/regular,
          4px gap between title and subtitle. mb-6 after the block. */}
      <header data-kb-part="ai-hub-page-header" className="mb-6">
        <h1 className="text-[24px] font-semibold leading-[32px] text-[#0f172a]">
          AI Optimise
        </h1>
        <p className="mt-[4px] text-[14px] font-normal leading-5 text-[#475569]">
          AI-powered suggestions to improve your Knowledge Base and support
          operations.
        </p>
      </header>

      {/*
        Suggestion list — Figma 74:8928 shows the third card dimmed because
        the list bleeds past the viewport fold. We implement that with a
        bottom-edge mask on the list container (NOT per-card opacity).
        The mask is applied **only when the list actually overflows** —
        see the `useEffect` above. With 3 cards in a 900-tall viewport
        nothing overflows, so the fade is suppressed and all three render
        at full opacity.

        `calc(100% - 120px)` forces a fixed fade zone (~120 px tall)
        regardless of container height — predictable across viewport
        sizes once overflow does kick in.
      */}
      <div
        data-kb-part="suggestion-list"
        ref={listRef}
        className="flex flex-col gap-[16px]"
        style={maskStyle}
      >
        {suggestions.map((s) => (
          <SuggestionCard
            key={s.id}
            title={s.title}
            description={s.description}
            kind={s.kind}
            conversationCount={s.conversationCount}
            impact={s.impact}
            pathFrom={s.pathFrom}
            pathTo={s.pathTo}
            onClick={() => {
              // eslint-disable-next-line no-console
              console.log('suggestion click:', s.id);
            }}
          />
        ))}
      </div>
    </AppShell>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Meta + Stories
 *
 * Single `Default` story. The wrapper currently has no toggleable
 * primitive props worth exposing — surfacing controls would mean
 * fabricating fake ones. Per the refactor rules we keep `Default`
 * with empty args and an empty controls panel.
 * ───────────────────────────────────────────────────────────── */

const meta: Meta<typeof AIOptimiseHubPage> = {
  title: 'Patterns/AI Optimisation/AI Optimise Hub',
  parameters: {
    layout: 'fullscreen',
    viewport: { defaultViewport: 'responsive' },
  },
  component: AIOptimiseHubPage,
  render: () => (
    // h-screen decorator so AppShell's h-screen has a concrete height to fill.
    <div className="h-screen w-full">
      <AIOptimiseHubPage />
    </div>
  ),
};
export default meta;

/** Default AI Optimise hub at 1280×900 — matches Figma `74:8928`. */
export const Default: StoryObj<typeof AIOptimiseHubPage> = {};
