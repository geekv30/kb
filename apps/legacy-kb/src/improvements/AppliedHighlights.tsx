// Layout B: inside the article editor, each live auto-applied suggestion
// gets the same green wash and number as layout A, drawn as a layer over
// the content (the editor's scroll container is `relative`), so nothing
// is written into the article. Hovering a row in the list above focuses
// its paragraph: a stronger outline, scrolled into view.

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { appliedBlockId } from './reviewDocument';
import { AppliedNumber, type AppliedItem } from './autoApplied';

type Box = { top: number; left: number; width: number; height: number };

export function AppliedHighlights({ items, focusedId }: { items: AppliedItem[]; focusedId: string | null }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [boxes, setBoxes] = useState<Record<string, Box>>({});
  const live = items.filter((i) => i.live);

  const editable = () => rootRef.current?.parentElement?.querySelector<HTMLElement>('[role="textbox"]') ?? null;

  const measure = useCallback(() => {
    const root = editable();
    if (!root) return;
    const next: Record<string, Box> = {};
    for (const { suggestion } of live) {
      const id = appliedBlockId(suggestion);
      const el = id ? root.querySelector<HTMLElement>(`[data-block-id="${CSS.escape(id)}"]`) : null;
      if (el) next[suggestion.id] = { top: el.offsetTop, left: el.offsetLeft, width: el.offsetWidth, height: el.offsetHeight };
    }
    setBoxes(next);
  }, [live.map((i) => i.suggestion.id).join('|')]);

  useLayoutEffect(() => {
    measure();
    const root = editable();
    if (!root) return;
    const ro = new ResizeObserver(measure);
    ro.observe(root);
    const mo = new MutationObserver(measure);
    mo.observe(root, { subtree: true, childList: true, characterData: true });
    return () => {
      ro.disconnect();
      mo.disconnect();
    };
  }, [measure]);

  // Bring the focused paragraph into view inside the editor's scroll area.
  useEffect(() => {
    const box = focusedId ? boxes[focusedId] : undefined;
    const scroller = rootRef.current?.parentElement;
    if (!box || !scroller) return;
    const top = box.top - 16;
    const bottom = box.top + box.height + 16;
    if (top < scroller.scrollTop || bottom > scroller.scrollTop + scroller.clientHeight) {
      scroller.scrollTo({ top: Math.max(0, top - scroller.clientHeight / 3), behavior: 'smooth' });
    }
  }, [focusedId]);

  return (
    <div ref={rootRef} aria-hidden className="pointer-events-none absolute top-0 left-0 h-0 w-full">
      {live.map(({ suggestion, index }) => {
        const box = boxes[suggestion.id];
        if (!box) return null;
        const focused = focusedId === suggestion.id;
        return (
          <div key={suggestion.id}>
            <div
              className={
                focused
                  ? 'absolute rounded-[4px] bg-legacy-success-bg mix-blend-multiply shadow-[0_0_0_2px_var(--color-legacy-success)] transition-shadow duration-150'
                  : 'absolute rounded-[4px] bg-legacy-success-bg mix-blend-multiply transition-shadow duration-150'
              }
              style={{ top: box.top - 4, left: box.left - 6, width: box.width + 12, height: box.height + 8 }}
            />
            <div className="absolute" style={{ top: box.top - 1, left: 0 }}>
              <AppliedNumber index={index} live />
            </div>
          </div>
        );
      })}
    </div>
  );
}
