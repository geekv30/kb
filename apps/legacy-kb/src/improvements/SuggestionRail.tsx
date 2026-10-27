// Y-paired suggestion rail, forked from kb-ui `AIGapRail` with a
// `width` prop and the old app's border color.
//
//   - `summary` sits in normal flow at the top.
//   - Each card is absolutely positioned at its anchor's Y (the
//     `data-suggestion-id` element inside `articleRef`), translated into
//     rail space.
//   - A top-to-bottom collision walk, seeded below the summary, pins each
//     card to max(anchor Y, previous bottom + minGap). The active card
//     then reclaims its anchor Y by sliding earlier cards up, so the card
//     under review always sits level with its highlight when it can.
//   - A card whose anchor Y falls outside it by more than
//     `connectorTolerance` px gets a 1px dotted connector on its left
//     edge running back to the anchor.
//   - Cards glide to new tops (260ms strong ease-in-out); reduced motion
//     jumps instead.

import { useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react';
import { cn } from '../lib/cn';
import { useAnchorPositions } from './useAnchorPositions';

export interface SuggestionRailItem {
  /** Matches the anchor's `data-suggestion-id`. */
  id: string;
  node: ReactNode;
}

export interface SuggestionRailProps {
  articleRef: RefObject<HTMLElement | null>;
  summary: ReactNode;
  items: SuggestionRailItem[];
  /**
   * The card under review. Pinned to its anchor when the walk would push
   * it down; cards above it slide up to make room.
   */
  activeId?: string;
  /** Rail width in px. */
  width: number;
  minGap?: number;
  connectorTolerance?: number;
  className?: string;
}

/** Height assumed for a card that hasn't been measured yet. */
const FALLBACK_CARD_HEIGHT = 160;

interface CardLayout {
  id: string;
  top: number;
  /** Dotted connector, in card-local px, or null when the pairing is obvious. */
  connector: { top: number; height: number } | null;
}

/**
 * A connector only when the anchor's Y falls outside the card by more
 * than `tolerance`: above it (card pushed down) or below its bottom
 * (card pulled up). If the card already spans its anchor, no line.
 */
function connectorFor(delta: number, height: number, tolerance: number): CardLayout['connector'] {
  if (delta > tolerance) return { top: -delta, height: delta };
  if (-delta > height + tolerance) return { top: height, height: -delta - height };
  return null;
}

export function SuggestionRail({
  articleRef,
  summary,
  items,
  activeId,
  width,
  minGap = 12,
  connectorTolerance = 24,
  className,
}: SuggestionRailProps) {
  const railRef = useRef<HTMLElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const cardEls = useRef(new Map<string, HTMLDivElement>());
  const [cardHeights, setCardHeights] = useState<Record<string, number>>({});
  const [summaryHeight, setSummaryHeight] = useState(0);
  const [coordOffset, setCoordOffset] = useState(0);

  const ids = useMemo(() => items.map((i) => i.id), [items]);
  const anchors = useAnchorPositions(articleRef, ids);

  /* Card heights — one ResizeObserver, rAF-coalesced. */
  useEffect(() => {
    let rafId: number | null = null;
    const pending: Record<string, number> = {};
    const flush = () => {
      rafId = null;
      // Snapshot first: the updater must be pure (StrictMode runs it twice).
      const batch = { ...pending };
      for (const k of Object.keys(pending)) delete pending[k];
      const live = new Set(ids);
      setCardHeights((prev) => {
        const next = { ...prev, ...batch };
        for (const k of Object.keys(next)) if (!live.has(k)) delete next[k];
        const changed =
          Object.keys(next).length !== Object.keys(prev).length || Object.keys(next).some((k) => next[k] !== prev[k]);
        return changed ? next : prev;
      });
    };
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const id = (entry.target as HTMLElement).dataset.railCardId;
        if (id) pending[id] = (entry.target as HTMLElement).offsetHeight;
      }
      if (rafId === null) rafId = requestAnimationFrame(flush);
    });
    for (const id of ids) {
      const el = cardEls.current.get(id);
      if (el) observer.observe(el);
    }
    return () => {
      observer.disconnect();
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [items, ids]);

  /* Summary height seeds the walk; mode swaps change it. */
  useEffect(() => {
    const el = summaryRef.current;
    if (!el) return;
    const measureSummary = () => setSummaryHeight(el.getBoundingClientRect().height);
    measureSummary();
    const observer = new ResizeObserver(measureSummary);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  /* Article space → rail space. */
  useEffect(() => {
    const measureOffset = () => {
      const rail = railRef.current;
      const article = articleRef.current;
      if (!rail || !article) return;
      setCoordOffset(article.getBoundingClientRect().top - rail.getBoundingClientRect().top);
    };
    measureOffset();
    window.addEventListener('resize', measureOffset);
    const article = articleRef.current;
    const mo = article ? new MutationObserver(measureOffset) : null;
    if (article && mo) mo.observe(article, { subtree: true, childList: true, characterData: true });
    return () => {
      window.removeEventListener('resize', measureOffset);
      mo?.disconnect();
    };
  }, [articleRef]);

  const layouts = useMemo<CardLayout[]>(() => {
    const seed = summaryHeight > 0 ? summaryHeight + minGap : 0;
    const heightOf = (id: string) => cardHeights[id] ?? FALLBACK_CARD_HEIGHT;

    // Forward walk: each card at max(anchor Y, previous bottom + gap).
    const targets: number[] = [];
    const hasAnchor: boolean[] = [];
    const tops: number[] = [];
    let prevBottom = seed;
    items.forEach((item, i) => {
      const anchor = anchors[item.id];
      hasAnchor[i] = typeof anchor === 'number';
      targets[i] = typeof anchor === 'number' ? anchor + coordOffset : prevBottom;
      tops[i] = Math.max(targets[i]!, prevBottom);
      prevBottom = tops[i]! + heightOf(item.id) + minGap;
    });

    // Active card wins its anchor: if the walk pushed it down, pull the
    // cards above it up (never above the stacked minimum under the
    // summary), then re-walk the cards below it.
    const a = activeId ? items.findIndex((it) => it.id === activeId) : -1;
    if (a >= 0 && tops[a]! > targets[a]!) {
      let stackMin = seed;
      for (let i = 0; i < a; i += 1) stackMin += heightOf(items[i]!.id) + minGap;
      tops[a] = Math.max(targets[a]!, stackMin);
      for (let i = a - 1; i >= 0; i -= 1) {
        tops[i] = Math.min(tops[i]!, tops[i + 1]! - minGap - heightOf(items[i]!.id));
      }
      for (let i = a + 1; i < items.length; i += 1) {
        tops[i] = Math.max(targets[i]!, tops[i - 1]! + heightOf(items[i - 1]!.id) + minGap);
      }
    }

    return items.map((item, i) => ({
      id: item.id,
      top: tops[i]!,
      connector: hasAnchor[i] ? connectorFor(tops[i]! - targets[i]!, heightOf(item.id), connectorTolerance) : null,
    }));
  }, [items, anchors, coordOffset, cardHeights, minGap, connectorTolerance, summaryHeight, activeId]);

  const minHeight = layouts.reduce(
    (bottom, l) => Math.max(bottom, l.top + (cardHeights[l.id] ?? FALLBACK_CARD_HEIGHT)),
    0,
  );

  // First-frame flicker gate, latched: once shown, cards stay visible
  // even when their anchors disappear (accepted removals etc.).
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!ready) setReady(true);
  }, [ready]);

  return (
    <aside
      ref={railRef}
      aria-label="AI suggestions"
      className={cn('relative shrink-0', className)}
      style={{ width, minHeight: minHeight || undefined }}
    >
      <div ref={summaryRef} data-part="rail-summary">
        {summary}
      </div>
      {items.map((item) => {
        const layout = layouts.find((l) => l.id === item.id);
        if (!layout) return null;
        return (
          <div
            key={item.id}
            ref={(el) => {
              if (el) cardEls.current.set(item.id, el);
              else cardEls.current.delete(item.id);
            }}
            data-rail-card-id={item.id}
            data-rail-connector={layout.connector ? 'true' : 'false'}
            className={cn(
              'absolute right-0 left-0',
              'motion-safe:transition-[top,opacity] motion-safe:duration-[260ms] motion-safe:ease-in-out-strong',
              'motion-reduce:transition-[opacity] motion-reduce:duration-[100ms] motion-reduce:ease-out',
              ready ? 'opacity-100' : 'opacity-0',
            )}
            style={{ top: layout.top }}
          >
            {layout.connector ? (
              <span
                aria-hidden
                className="pointer-events-none absolute -left-[12px] border-0 border-l border-dotted border-legacy-input-border"
                style={layout.connector}
              />
            ) : null}
            {item.node}
          </div>
        );
      })}
    </aside>
  );
}
