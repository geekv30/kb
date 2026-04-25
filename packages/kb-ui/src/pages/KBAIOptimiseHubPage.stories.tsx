import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import '../tokens.css';
import {
  RiQuillPenLine,
  RiSettings5Line,
  RiMagicLine,
} from '@remixicon/react';
import { AppShell } from '../components/shell/AppShell';
import { KBBreadcrumbBar } from '../components/shell/KBBreadcrumbBar';
import { SideNavRail, type NavRailItem } from '../components/nav/SideNavRail';
import { AISubNav, type AISubNavItem } from '../components/nav/AISubNav';
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
 *   [1] SideNavRail (dark, 54)   — ai (active), editor, settings
 *   [2] AISubNav (288)           — AI Centre (section) + AI Optimise (item, active)
 *   [3] Content column (938)     — breadcrumb + page header + 3 suggestion cards
 *
 * Convention notes:
 *   - Settings icon = `RiSettings5Line` (matches existing page stories;
 *     spec suggested `RiSettings3Line`/`RiSettingsLine` — CLAUDE.md rule
 *     #3 says match existing conventions, so `5Line` wins).
 *   - Rail has 3 nav items (vs 4 in category/editor pages) — the AI hub
 *     drops the `folders` slot per Figma 74:8928.
 *   - Page header is built inline rather than using `PageHeader` — the
 *     hub doesn't have a CTA button and `PageHeader` hard-wires one;
 *     it also uses 18px/gap-0.5 typography whereas the hub uses 24/20
 *     with a 4px gap per Figma.
 * ───────────────────────────────────────────────────────────── */

const meta: Meta = {
  title: 'Patterns/KB AI Optimise Hub',
  parameters: {
    layout: 'fullscreen',
    viewport: { defaultViewport: 'responsive' },
  },
};
export default meta;
type Story = StoryObj;

/* ------- Rail items (column 1, dark theme) ------- */

const railItems: NavRailItem[] = [
  { id: 'ai', icon: <AiIcon size={16} />, label: 'AI' },
  { id: 'editor', icon: <RiQuillPenLine size={16} />, label: 'Editor' },
  { id: 'settings', icon: <RiSettings5Line size={16} />, label: 'Settings' },
];

/* ------- Sub-nav items (column 2) ------- */

const subNavItems: AISubNavItem[] = [
  {
    id: 'ai-centre',
    icon: <AiIcon size={18} />,
    label: 'AI Centre',
    kind: 'section',
  },
  {
    id: 'ai-optimise',
    icon: <RiMagicLine size={18} />,
    label: 'AI Optimise',
    kind: 'item',
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
          theme="dark"
          items={railItems}
          activeId="ai"
          brandLogo={
            /*
             * H1 — Wrap CompanyLogo in a 40 × 40 tile that matches the
             * logo's own background so the brand mark blends with the dark
             * rail. Without this wrapper the 24 × 24 logo silhouette reads
             * as a discontinuous tile against the rail's #1a1a1a (the
             * logo's internal `#2D2D2D` rect is one shade lighter). 40 ×
             * 40 / radius 8 mirrors the established logo-frame in
             * KBCategoryPage's pixel-polish pass (logs.md 2026-04-18).
             */
            <div className="flex size-[40px] items-center justify-center rounded-[8px] bg-[#2d2d2d]">
              <CompanyLogo size={24} />
            </div>
          }
          bottomSlot={<Avatar initials="A" />}
        />
      }
      explorer={
        <AISubNav
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
 * Stories
 * ───────────────────────────────────────────────────────────── */

/** Default AI Optimise hub at 1280×900 — matches Figma `74:8928`. */
export const Default: Story = {
  render: () => (
    // h-screen decorator so AppShell's h-screen has a concrete height to fill.
    <div className="h-screen w-full">
      <AIOptimiseHubPage />
    </div>
  ),
};
