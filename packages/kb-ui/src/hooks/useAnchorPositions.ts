// `useAnchorPositions` — read-only DOM-position tracker for anchored
// content. Given a container ref and a list of stable ids, the hook
// returns a map of `{ id → offsetTop }` where `offsetTop` is measured
// relative to `containerRef.current` (NOT the viewport).
//
// Designed for the AI Gaps review flow: the suggestion rail needs to
// know where each `SuggestionBlock` lives inside the scrollable article
// container so it can scroll the active block into view or render a
// vertical mini-map. The contract is intentionally narrow so the hook
// can be reused for any anchor-id-based scroll target (TOCs, jump
// menus, etc.).
//
// Behaviour:
//   - Measures on mount, after layout has settled.
//   - Re-measures on `window` resize. Coalesced via `requestAnimationFrame`
//     so a burst of resize events produces one measurement per frame.
//   - Re-measures when the container subtree changes — a `MutationObserver`
//     with `{ subtree: true, childList: true, characterData: true }` is
//     attached to `containerRef.current`. Same rAF coalescing.
//   - Re-measures when the `ids` array's CONTENTS change (not its
//     identity — consumers building `ids` inline in render shouldn't
//     trigger spurious re-measures). We key effects on the sorted-joined
//     id string for stable equality.
//   - Returns are memoized: a new object identity is only produced when
//     the position map actually changes (deep compare keys + values).
//
// If an id has no matching element in the DOM, it is OMITTED from the
// returned map (rather than reported as `0`). Consumers can distinguish
// "anchor not yet mounted" from "anchor at top of container" by checking
// `id in result`.
//
// No new dependencies — `ResizeObserver` and `MutationObserver` are both
// native browser APIs. SSR-safe: all DOM reads are gated on the existence
// of `containerRef.current`, which is `null` on the server.
import * as React from 'react';

/* ─────────────────────────────────────────────────────────────
 * Types
 * ───────────────────────────────────────────────────────────── */

export type UseAnchorPositionsOptions = {
  /** Scrollable parent. All offsets are measured against this element. */
  containerRef: React.RefObject<HTMLElement | null>;
  /** Stable ids to look up in the container's subtree. */
  ids: string[];
  /** Data attribute on the anchor element. Defaults to `data-suggestion-id`. */
  attribute?: string;
};

/* ─────────────────────────────────────────────────────────────
 * Helpers
 * ───────────────────────────────────────────────────────────── */

const DEFAULT_ATTRIBUTE = 'data-suggestion-id';

function shallowEqualMap(
  a: Record<string, number>,
  b: Record<string, number>,
): boolean {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;
  for (const k of aKeys) {
    if (!(k in b)) return false;
    if (a[k] !== b[k]) return false;
  }
  return true;
}

/**
 * Compute `{ id → offsetTop }` for every id whose anchor is present in
 * the container's subtree. `offsetTop` is computed by walking the
 * element's `offsetParent` chain up to (and stopping at) `container`,
 * which handles arbitrary positioning ancestors between the anchor and
 * the container — `el.offsetTop` alone is relative to the nearest
 * positioned ancestor, which may not be our container.
 */
function measure(
  container: HTMLElement,
  ids: string[],
  attribute: string,
): Record<string, number> {
  const next: Record<string, number> = {};
  for (const id of ids) {
    // Escape characters that would break a CSS attribute selector.
    // The double quotes around the value cover most realistic ids
    // (uuids, slugs); we strip any embedded double quotes defensively.
    const safe = id.replace(/"/g, '\\"');
    const el = container.querySelector<HTMLElement>(
      `[${attribute}="${safe}"]`,
    );
    if (!el) continue;

    let top = 0;
    let cur: HTMLElement | null = el;
    while (cur && cur !== container) {
      top += cur.offsetTop;
      cur = cur.offsetParent as HTMLElement | null;
    }
    // If we walked off the offsetParent chain without hitting the
    // container (e.g. the anchor lives in a fixed-positioned subtree),
    // skip it rather than report a misleading offset.
    if (!cur) continue;
    next[id] = top;
  }
  return next;
}

/* ─────────────────────────────────────────────────────────────
 * Hook
 * ───────────────────────────────────────────────────────────── */

/**
 * Track the `offsetTop` of one or more DOM anchors inside a scrollable
 * container. See file-top JSDoc for the full contract.
 *
 * Returns a stable object reference: a new identity is only emitted
 * when the resulting position map differs by key or value.
 */
export function useAnchorPositions({
  containerRef,
  ids,
  attribute = DEFAULT_ATTRIBUTE,
}: UseAnchorPositionsOptions): Record<string, number> {
  // Sort + join the ids so the effect dependency is stable across
  // identity-only re-creations of the array (e.g. consumers building
  // `[a, b, c]` inline each render).
  const idsKey = React.useMemo(() => {
    return [...ids].sort().join('\x00');
  }, [ids]);

  // The measured map. Stored in state so React re-renders the consumer
  // when positions change. The reducer only commits a new identity when
  // the contents differ (see `commit` below).
  const [positions, setPositions] = React.useState<Record<string, number>>(
    () => ({}),
  );

  // Keep the latest `ids` and `attribute` accessible inside long-lived
  // observer callbacks without re-creating the observer for every
  // identity change.
  const idsRef = React.useRef(ids);
  idsRef.current = ids;
  const attributeRef = React.useRef(attribute);
  attributeRef.current = attribute;

  // Track the latest committed map so the rAF-driven measure callback
  // can compare against it without going through React state (which is
  // asynchronous).
  const positionsRef = React.useRef(positions);
  positionsRef.current = positions;

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let rafId: number | null = null;
    let cancelled = false;

    const commit = (next: Record<string, number>) => {
      if (shallowEqualMap(positionsRef.current, next)) return;
      positionsRef.current = next;
      setPositions(next);
    };

    const schedule = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        if (cancelled) return;
        const c = containerRef.current;
        if (!c) return;
        commit(measure(c, idsRef.current, attributeRef.current));
      });
    };

    // Initial measurement — synchronous so the first render after mount
    // already has accurate offsets if the DOM is ready.
    commit(measure(container, idsRef.current, attributeRef.current));

    // Subsequent updates — coalesced via rAF.
    const onResize = () => schedule();
    window.addEventListener('resize', onResize);

    const mo = new MutationObserver(schedule);
    mo.observe(container, {
      subtree: true,
      childList: true,
      characterData: true,
    });

    return () => {
      cancelled = true;
      window.removeEventListener('resize', onResize);
      mo.disconnect();
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
    // `idsKey` and `attribute` re-trigger the effect when the
    // measurement target changes. `containerRef` is intentionally not
    // a dependency — React refs don't trigger re-runs and the closure
    // reads `containerRef.current` lazily inside `schedule`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey, attribute]);

  return positions;
}
