// `{ id → offsetTop }` for `[data-suggestion-id]` anchors inside a
// positioned container. Forked from kb-ui `useAnchorPositions`: measures
// on mount, re-measures (rAF-coalesced) on window resize and on any
// subtree mutation, and only emits a new object when a value changes.
// Ids whose anchor isn't in the DOM are omitted, not reported as 0.

import { useEffect, useMemo, useRef, useState, type RefObject } from 'react';

const ATTRIBUTE = 'data-suggestion-id';

function sameMap(a: Record<string, number>, b: Record<string, number>): boolean {
  const keys = Object.keys(a);
  if (keys.length !== Object.keys(b).length) return false;
  return keys.every((k) => k in b && a[k] === b[k]);
}

function measure(container: HTMLElement, ids: string[]): Record<string, number> {
  const next: Record<string, number> = {};
  for (const id of ids) {
    const el = container.querySelector<HTMLElement>(`[${ATTRIBUTE}="${CSS.escape(id)}"]`);
    if (!el) continue;
    let top = 0;
    let cur: HTMLElement | null = el;
    while (cur && cur !== container) {
      top += cur.offsetTop;
      cur = cur.offsetParent as HTMLElement | null;
    }
    if (cur) next[id] = top;
  }
  return next;
}

export function useAnchorPositions(containerRef: RefObject<HTMLElement | null>, ids: string[]): Record<string, number> {
  const idsKey = useMemo(() => [...ids].sort().join('\u0000'), [ids]);
  const [positions, setPositions] = useState<Record<string, number>>({});
  const idsRef = useRef(ids);
  idsRef.current = ids;
  const positionsRef = useRef(positions);
  positionsRef.current = positions;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let rafId: number | null = null;
    let cancelled = false;

    const commit = (next: Record<string, number>) => {
      if (sameMap(positionsRef.current, next)) return;
      positionsRef.current = next;
      setPositions(next);
    };
    const schedule = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        const c = containerRef.current;
        if (!cancelled && c) commit(measure(c, idsRef.current));
      });
    };

    commit(measure(container, idsRef.current));
    window.addEventListener('resize', schedule);
    const mo = new MutationObserver(schedule);
    mo.observe(container, { subtree: true, childList: true, characterData: true });
    // Web fonts swap in after first paint and shift every block.
    void document.fonts?.ready.then(schedule);

    return () => {
      cancelled = true;
      window.removeEventListener('resize', schedule);
      mo.disconnect();
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [idsKey, containerRef]);

  return positions;
}
