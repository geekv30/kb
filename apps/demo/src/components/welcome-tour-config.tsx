// Hiver-specific Welcome Tour configuration.
//
// All demo-specific copy, icons, routes, and rect-computation logic
// lives here. The generic WelcomeTour primitive (Provider, hooks,
// types) lives in @test-kb-ui/kb-ui; this file feeds it Hiver's
// steps[], welcome card, completion card, and storage key.

import {
  AlertCircle,
  BarChartSquare02,
  Command,
  Folder,
  Keyboard01,
  MessageChatCircle,
  Pencil02,
  ShieldTick,
} from '@untitledui/icons';
import {
  AiIcon,
  type CompletionContent,
  type SpotlightRect,
  type TourStep,
  type WelcomeContent,
} from '@test-kb-ui/kb-ui';
import { DEFAULT_KB_CATEGORY_SLUG, routes } from '../lib/routes';

/* ── Step-specific rect helpers ─────────────────────────────── */

/**
 * Sidebar Explorer — union the header + tree (or flat) sub-elements
 * so the ring hugs the visible UI instead of the full-height aside.
 * Falls back to the registered node's full rect if either
 * sub-element is missing.
 */
function explorerRect(node: HTMLElement): SpotlightRect | null {
  const header = node.querySelector<HTMLElement>(
    '[data-kb-part="explorer-header"]',
  );
  const body =
    node.querySelector<HTMLElement>('[data-kb-part="explorer-tree"]') ??
    node.querySelector<HTMLElement>('[data-kb-part="explorer-flat"]');
  if (header === null || body === null) return null;
  const h = header.getBoundingClientRect();
  const b = body.getBoundingClientRect();
  const top = Math.min(h.top, b.top);
  const left = Math.min(h.left, b.left);
  const right = Math.max(h.right, b.right);
  const bottom = Math.max(h.bottom, b.bottom);
  if (right <= left || bottom <= top) return null;
  return { top, left, width: right - left, height: bottom - top };
}

/* ── Steps ──────────────────────────────────────────────────── */

export const HIVER_TOUR_STEPS: TourStep[] = [
  {
    id: 'sidebar-explorer',
    title: 'Browse like files',
    body:
      'Your articles and categories now live in a tree on the left. Click to open, drag to reorganize.',
    route: routes.kb.category(DEFAULT_KB_CATEGORY_SLUG),
    computeRect: explorerRect,
  },
  {
    id: 'rail-ai',
    title: 'AI Gaps & Suggestions',
    body:
      'We surface missing or thin content based on real customer questions. Tackle the highest-impact gaps first.',
    route: routes.aiOptimise.hub(),
    // Rail icon buttons have transparent backgrounds — flag so the
    // overlay can paint a white fill behind the lifted target.
    targetNeedsBackgroundFill: true,
  },
  {
    id: 'rail-analytics',
    title: 'Analytics for every article',
    body:
      'See views, helpful votes, search performance, and how AI is using your content to answer tickets.',
    route: routes.analytics.articlePerformance(),
    targetNeedsBackgroundFill: true,
  },
];

/* ── Welcome card content ───────────────────────────────────── */

export const HIVER_WELCOME: WelcomeContent = {
  title: 'Welcome back, your KB just got a refresh',
  body:
    "A few things moved around. Here’s a quick tour of what’s new — under a minute.",
  ctaLabel: 'Show me what’s new',
  skipLabel: 'I’ll explore on my own',
  features: [
    {
      id: 'file-explorer',
      title: 'File explorer in the sidebar',
      body: 'Browse your categories and articles like files in a tree.',
      icon: <Folder className="text-slate-700" />,
    },
    {
      id: 'ai-gaps',
      title: 'AI Gaps & Suggestions',
      body: 'See where your content needs improvement, powered by real ticket conversations.',
      icon: <AiIcon size={18} />,
    },
    {
      id: 'analytics',
      title: 'Detailed analytics',
      body: 'Per-article performance, search insights, and AI answer quality.',
      icon: <BarChartSquare02 className="text-slate-700" />,
    },
  ],
};

/* ── Completion card content ────────────────────────────────── */

export const HIVER_COMPLETION: CompletionContent = {
  title: 'Tour complete',
  body: 'A few other improvements you’ll notice as you go',
  ctaLabel: 'Got it',
  // 6 distinct features — all real per kb-mcp/product/feature-map.md.
  // No overlap with the WelcomeCard's File explorer / AI Gaps /
  // Analytics tiles.
  features: [
    {
      id: 'slash-editor',
      title: 'Slash-command editor',
      body:
        'Type / anywhere to insert headings, lists, code, tables, and more',
      icon: <Command className="h-[18px] w-[18px] text-slate-700" />,
    },
    {
      id: 'bubble-menu',
      title: 'Selection bubble menu',
      body: 'Select text for instant formatting, links, and AI actions',
      icon: <Pencil02 className="h-[18px] w-[18px] text-slate-700" />,
    },
    {
      id: 'publish-gate',
      title: 'Smart publish gate',
      body:
        'Publishing stays disabled until your AI suggestions are reviewed',
      icon: <ShieldTick className="h-[18px] w-[18px] text-slate-700" />,
    },
    {
      id: 'conversation-sources',
      title: 'Conversation sources',
      body: 'Every AI suggestion shows the customer tickets behind it',
      icon: (
        <MessageChatCircle className="h-[18px] w-[18px] text-slate-700" />
      ),
    },
    {
      id: 'attention-flags',
      title: 'Articles needing attention',
      body: 'Analytics flags low-helpfulness articles automatically',
      icon: <AlertCircle className="h-[18px] w-[18px] text-slate-700" />,
    },
    {
      id: 'keyboard-first',
      title: 'Keyboard-first workflow',
      body:
        'Press ? for shortcuts; navigate AI review with j/k, decide with y/n',
      icon: <Keyboard01 className="h-[18px] w-[18px] text-slate-700" />,
    },
  ],
};

/* ── Storage key (byte-identical to pre-refactor) ───────────── */

export const HIVER_TOUR_STORAGE_KEY = 'hiver-kb-welcome-tour-v1';
