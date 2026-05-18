// AIGapRail — Y-paired absolute-positioned rail for the AI Gaps review
// flow.
//
// Replaces the legacy `flex flex-col gap-4` stack with a tall column in
// which:
//   - The `summary` slot sits at the top of the rail in normal flow and
//     scrolls with the page (no longer sticky — the previous sticky
//     positioning caused the summary to visually clip the first paired
//     card whose anchor sat in the first ~200px of the article).
//   - Each `items[i].node` (paired suggestion card) is absolutely
//     positioned and vertically anchored to its matching DOM anchor in
//     `articleRef`, identified by `data-suggestion-id`.
//   - A top-to-bottom collision walk ensures cards don't overlap; the
//     walk is SEEDED with `summaryHeight + minGap` so the first paired
//     card is always pushed below the summary's flow space, even when
//     its anchor sits at a low article-Y.
//   - The `minGap` between cards is enforced by pinning each card's
//     top to `max(targetTop, prevBottom + minGap)`.
//   - When a card is offset from its anchor's true Y by more than
//     `connectorTolerance` px (default 24), a 1px dotted vertical
//     connector renders on the card's left edge back toward the anchor.
//     Below tolerance the connector is suppressed — the visual rule is
//     "show it only when the pairing isn't obvious".
//   - `transition: top 200ms ease-out` on each card so future reflows
//     (chunk 4 activation, chunk 5 accept/reject) animate smoothly.
//
// Coordinate-space translation: anchors live in the article body
// container; cards live in this rail. Both containers are siblings in a
// flex row, so we translate `articleAnchorOffsetTop` → rail-space top by
// adding `(articleRect.top - railRect.top)` measured via
// `getBoundingClientRect()` relative to the viewport. This handles every
// case where the two columns don't start at the same Y (e.g. when the
// article body has a wrapping header above it).
import * as React from 'react';
import { cn } from '../../utils/cn';
import { useAnchorPositions } from '../../hooks/useAnchorPositions';

/* ─────────────────────────────────────────────────────────────
 * Types
 * ───────────────────────────────────────────────────────────── */

export type AIGapRailItem = {
  /** Stable id matching the `data-suggestion-id` on the article anchor. */
  id: string;
  /** The card to render at the paired Y position. */
  node: React.ReactNode;
};

export type AIGapRailProps = {
  /**
   * Reference to the article body container — the element whose subtree
   * contains the `data-suggestion-id` anchors. Used both as the
   * measurement container for `useAnchorPositions` AND as the
   * coordinate-space origin for translating anchor offsetTops into
   * rail-space tops.
   */
  articleRef: React.RefObject<HTMLElement | null>;
  /**
   * Slot rendered at the top of the rail in normal flow. Typically the
   * `<AISuggestionsCard>` summary card. The rail measures the slot's
   * rendered height and uses it to seed the collision walk so the first
   * paired card is never visually overlapped by the summary.
   */
  summary: React.ReactNode;
  /**
   * Paired suggestion cards. Order is preserved for the collision walk
   * (top-to-bottom). Each item's `id` MUST match the `data-suggestion-id`
   * on its anchor in the article — items whose anchors aren't found are
   * rendered at a fallback position (stacked at the bottom of the rail).
   */
  items: AIGapRailItem[];
  /** Minimum gap (px) between cards during collision walk. Default 12. */
  minGap?: number;
  /**
   * Maximum offset (px) between a card's pinned top and its anchor's true
   * Y before a dotted connector renders. Default 24.
   */
  connectorTolerance?: number;
  className?: string;
};

/* ─────────────────────────────────────────────────────────────
 * Helpers
 * ───────────────────────────────────────────────────────────── */

const DEFAULT_MIN_GAP = 12;
const DEFAULT_CONNECTOR_TOLERANCE = 24;
/**
 * Fallback card height (px) used in the collision walk when a card
 * hasn't been measured yet (first paint). Picked to match the active
 * `AIGapSuggestionCard` height in Figma — close enough that the rail's
 * `min-height` computation is roughly correct on first frame.
 */
const FALLBACK_CARD_HEIGHT = 184;

type CardLayout = {
  id: string;
  /** Anchor's true Y in rail-space (the target top). */
  target: number;
  /** Pinned top after the collision walk. */
  top: number;
  /** Whether to show the dotted connector (|top - target| > tolerance). */
  showConnector: boolean;
  /**
   * Signed Y delta = `top - target`. Positive → card pushed DOWN from its
   * anchor (connector extends UP from card top toward the anchor). Negative
   * → card pulled UP above its anchor (connector extends DOWN from card
   * bottom toward the anchor). Zero → no offset, no connector.
   */
  delta: number;
};

/* ─────────────────────────────────────────────────────────────
 * Component
 * ───────────────────────────────────────────────────────────── */

export function AIGapRail({
  articleRef,
  summary,
  items,
  minGap = DEFAULT_MIN_GAP,
  connectorTolerance = DEFAULT_CONNECTOR_TOLERANCE,
  className,
}: AIGapRailProps) {
  const railRef = React.useRef<HTMLDivElement>(null);
  const summaryRef = React.useRef<HTMLDivElement>(null);
  // Per-card refs so we can measure rendered heights for the collision
  // walk. Keyed by item.id so re-ordering doesn't blow up the map.
  const cardRefsRef = React.useRef<Map<string, HTMLDivElement | null>>(
    new Map(),
  );
  // Cached measured heights so consumers can read them in render.
  const [cardHeights, setCardHeights] = React.useState<Record<string, number>>(
    () => ({}),
  );
  // Measured height of the summary slot. Used to seed the collision
  // walk so the first paired card always sits below the summary.
  const [summaryHeight, setSummaryHeight] = React.useState(0);
  // Translation offset between article container and rail container, in
  // viewport coordinates. Recomputed on resize / layout.
  const [coordOffset, setCoordOffset] = React.useState(0);

  /* ── Anchor offsets in article-container space ─────────────── */
  const ids = React.useMemo(() => items.map((i) => i.id), [items]);
  const anchorPositions = useAnchorPositions({
    containerRef: articleRef,
    ids,
  });

  /* ── Measure card heights ──────────────────────────────────── */
  // ResizeObserver on each rendered card. Heights drive the collision
  // walk's `prevBottom`. Coalesced into a single state update per frame
  // via rAF so React doesn't re-render twice per resize.
  React.useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    let rafId: number | null = null;
    let cancelled = false;
    const pending: Record<string, number> = {};

    const flush = () => {
      rafId = null;
      if (cancelled) return;
      setCardHeights((prev) => {
        let changed = false;
        const next: Record<string, number> = { ...prev };
        for (const [id, h] of Object.entries(pending)) {
          if (next[id] !== h) {
            next[id] = h;
            changed = true;
          }
        }
        // Drop heights for ids no longer in the items list.
        const activeIds = new Set(ids);
        for (const k of Object.keys(next)) {
          if (!activeIds.has(k)) {
            delete next[k];
            changed = true;
          }
        }
        for (const k of Object.keys(pending)) delete pending[k];
        return changed ? next : prev;
      });
    };

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const el = entry.target as HTMLElement;
        const id = el.getAttribute('data-rail-card-id');
        if (!id) continue;
        pending[id] = entry.contentRect.height;
      }
      if (rafId === null) rafId = requestAnimationFrame(flush);
    });

    for (const item of items) {
      const el = cardRefsRef.current.get(item.id);
      if (el) observer.observe(el);
    }

    return () => {
      cancelled = true;
      observer.disconnect();
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [items, ids]);

  /* ── Measure summary slot height ───────────────────────────── */
  // Seeds the collision walk so the first paired card never lands in
  // the rail-Y range occupied by the summary's flow space. ResizeObserver
  // catches summary mode swaps (pre-review ↔ reviewing ↔ terminal) which
  // change the slot's rendered height.
  React.useEffect(() => {
    const el = summaryRef.current;
    if (!el) return;
    const measure = () => {
      setSummaryHeight((prev) => {
        const next = el.getBoundingClientRect().height;
        return prev === next ? prev : next;
      });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  /* ── Article ↔ rail coordinate-space translation ───────────── */
  React.useEffect(() => {
    const measureOffset = () => {
      const rail = railRef.current;
      const article = articleRef.current;
      if (!rail || !article) return;
      // `getBoundingClientRect().top` is viewport-relative. The
      // difference is article-space-top → rail-space-top.
      const offset =
        article.getBoundingClientRect().top -
        rail.getBoundingClientRect().top;
      setCoordOffset((prev) => (prev === offset ? prev : offset));
    };
    measureOffset();
    // Re-measure on resize and on layout-affecting subtree mutations
    // (the article body's height changes when suggestions are
    // accepted/dismissed and ArticleBody re-flows).
    const onResize = () => measureOffset();
    window.addEventListener('resize', onResize);
    let mo: MutationObserver | null = null;
    const article = articleRef.current;
    if (article) {
      mo = new MutationObserver(measureOffset);
      mo.observe(article, { subtree: true, childList: true, characterData: true });
    }
    return () => {
      window.removeEventListener('resize', onResize);
      if (mo) mo.disconnect();
    };
  }, [articleRef]);

  /* ── Collision walk — pin each card top to max(target, prev+gap) ── */
  // Seeded with `summaryHeight + minGap` so the first paired card is
  // always positioned BELOW the summary slot's flow space. Without the
  // seed, a suggestion anchor at e.g. article-Y=50 would land at rail-Y
  // 50 and be visually clipped by the summary (which occupies rail-Y
  // 0 → summaryHeight in normal flow).
  const layouts: CardLayout[] = React.useMemo(() => {
    const out: CardLayout[] = [];
    let prevBottom = summaryHeight > 0 ? summaryHeight + minGap : 0;
    for (const item of items) {
      const rawAnchor = anchorPositions[item.id];
      // Skip the connector + use a fallback top when the anchor isn't
      // measured yet — keeps first paint legible (cards stack near the
      // top instead of jumping when measurements land).
      const hasAnchor = typeof rawAnchor === 'number';
      const target = hasAnchor ? rawAnchor + coordOffset : prevBottom;
      const top = Math.max(target, prevBottom);
      const height = cardHeights[item.id] ?? FALLBACK_CARD_HEIGHT;
      const delta = top - target;
      const showConnector = hasAnchor && Math.abs(delta) > connectorTolerance;
      out.push({ id: item.id, target, top, showConnector, delta });
      prevBottom = top + height + minGap;
    }
    return out;
  }, [
    items,
    anchorPositions,
    coordOffset,
    cardHeights,
    minGap,
    connectorTolerance,
    summaryHeight,
  ]);

  /* ── Rail min-height: tallest card-bottom across the walk ──── */
  const minHeight = React.useMemo(() => {
    let bottom = 0;
    for (const l of layouts) {
      const height = cardHeights[l.id] ?? FALLBACK_CARD_HEIGHT;
      bottom = Math.max(bottom, l.top + height);
    }
    return bottom;
  }, [layouts, cardHeights]);

  /* ── First-paint opacity: hide cards until anchors are measured ─ */
  // Strictly a FIRST-FRAME flicker gate. We latch `ready` to `true` on the
  // first effect tick — never flip it back to `false` afterwards. Anchors
  // legitimately disappear when their suggestions are accepted/dismissed (S1
  // accepted → PlainSentences; S3 accepted → null; etc.), and previously the
  // gate's `Object.keys(anchorPositions).length > 0` check would flip back
  // to `false` in those terminal states and hide every collapsed-chip card
  // with opacity 0. The collision walk already handles missing anchors via
  // the `prevBottom` fallback, so cards still position correctly when only
  // some / none of their anchors are mounted.
  const [ready, setReady] = React.useState(false);
  React.useEffect(() => {
    if (ready) return;
    setReady(true);
  }, [ready]);

  return (
    <aside
      ref={railRef}
      data-kb-component="ai-gap-rail"
      data-kb-part="ai-gaps-rail"
      className={cn(
        // Cards inside are absolutely positioned, so the rail must be
        // `relative` and have an explicit min-height. The summary
        // slot sits in normal flow at the top; everything below it is
        // absolute-positioned, so a flex layout wouldn't add value.
        'relative w-[380px] shrink-0',
        className,
      )}
      style={{ minHeight: minHeight ? `${minHeight}px` : undefined }}
    >
      {/* Summary slot — sits in normal flow at the top of the rail.
          Its measured height seeds the collision walk so paired cards
          never land in its rail-Y range. */}
      <div
        ref={summaryRef}
        data-kb-part="ai-gap-rail-summary"
      >
        {summary}
      </div>

      {items.map((item) => {
        const layout = layouts.find((l) => l.id === item.id);
        if (!layout) return null;
        return (
          <RailCard
            key={item.id}
            id={item.id}
            top={layout.top}
            ready={ready}
            showConnector={layout.showConnector}
            delta={layout.delta}
            registerRef={(el) => {
              if (el) cardRefsRef.current.set(item.id, el);
              else cardRefsRef.current.delete(item.id);
            }}
          >
            {item.node}
          </RailCard>
        );
      })}
    </aside>
  );
}

/* ─────────────────────────────────────────────────────────────
 * RailCard — single absolute-positioned card slot.
 *
 * Owns the `position: absolute`, the `top` transition, the optional
 * dotted connector chrome, and the first-paint opacity-0 → opacity-1
 * fade once positions are known. The card content itself stays
 * untouched — we don't restyle `AIGapSuggestionCard`.
 * ───────────────────────────────────────────────────────────── */

type RailCardProps = {
  id: string;
  top: number;
  ready: boolean;
  showConnector: boolean;
  /** Signed offset from anchor (top - target). Drives connector direction. */
  delta: number;
  registerRef: (el: HTMLDivElement | null) => void;
  children: React.ReactNode;
};

function RailCard({
  id,
  top,
  ready,
  showConnector,
  delta,
  registerRef,
  children,
}: RailCardProps) {
  // Track previous `top` so we can flip `will-change: top` on only
  // while a transition is in flight. After the transition end we drop
  // `will-change` so it doesn't sit on the layer indefinitely.
  const prevTopRef = React.useRef(top);
  const [willChange, setWillChange] = React.useState(false);
  React.useEffect(() => {
    if (prevTopRef.current !== top) {
      prevTopRef.current = top;
      setWillChange(true);
    }
  }, [top]);
  const onTransitionEnd = React.useCallback(
    (e: React.TransitionEvent<HTMLDivElement>) => {
      if (e.propertyName === 'top') setWillChange(false);
    },
    [],
  );

  return (
    <div
      ref={registerRef}
      data-rail-card-id={id}
      data-kb-part="ai-gap-rail-card"
      data-rail-connector={showConnector ? 'true' : 'false'}
      onTransitionEnd={onTransitionEnd}
      className={cn(
        // Absolute position so multiple cards can coexist in a tall
        // rail without flexbox squashing them together.
        'absolute left-0 right-0',
        // 260ms with strong custom in-out curve. Rail-card reflow is
        // on-screen MOVEMENT (existing card moving to a new pinned top
        // when neighbours accept/dismiss/activate), so `ease-in-out` is
        // the right family per Emil's framework — natural accel/decel.
        // The custom `--ease-in-out-strong` curve has more punch than
        // bare `ease-in-out` and makes the reflow feel intentional.
        // `prefers-reduced-motion: reduce` is honoured via the global
        // gate in tokens.css.
        'motion-safe:transition-[top,opacity] motion-safe:duration-[260ms]',
        ready ? 'opacity-100' : 'opacity-0',
      )}
      style={{
        top: `${top}px`,
        willChange: willChange ? 'top' : undefined,
        transitionTimingFunction: 'var(--ease-in-out-strong)',
      }}
    >
      {showConnector && (
        <span
          aria-hidden="true"
          data-kb-part="ai-gap-rail-connector"
          // 1px dotted vertical line on the card's left edge, extending
          // back toward the anchor. When `delta > 0` (card pushed DOWN
          // from anchor) the line runs UP from the card top a distance
          // of `delta` px. When `delta < 0` (card pulled UP above anchor)
          // the line runs DOWN from card bottom by `|delta|` px. Token
          // color `border-border` per the chunk 3 spec.
          className="pointer-events-none absolute -left-3 border-l border-dotted border-border"
          style={
            delta > 0
              ? { top: `-${delta}px`, height: `${delta}px` }
              : { bottom: `${delta}px`, height: `${-delta}px` }
          }
        />
      )}
      {children}
    </div>
  );
}
