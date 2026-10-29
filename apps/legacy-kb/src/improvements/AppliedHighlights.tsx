// Layout B: while a row in the auto-applied list is hovered, its
// paragraph in the editor gets the manual review's addition wash, drawn
// as a layer over the content (the editor's scroll container is
// `relative`), so nothing is written into the article. Scrolls the
// paragraph into view if it's out of sight.

import { useLayoutEffect, useRef, useState } from 'react';
import { appliedBlockId } from './reviewDocument';
import type { AppliedItem } from './autoApplied';

type Box = { top: number; left: number; width: number; height: number };

export function AppliedHighlights({ items, focusedId }: { items: AppliedItem[]; focusedId: string | null }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<Box | null>(null);
  const focused = items.find((i) => i.live && i.suggestion.id === focusedId);

  useLayoutEffect(() => {
    const scroller = rootRef.current?.parentElement;
    const editable = scroller?.querySelector<HTMLElement>('[role="textbox"]');
    const blockId = focused ? appliedBlockId(focused.suggestion) : undefined;
    const el = blockId ? editable?.querySelector<HTMLElement>(`[data-block-id="${CSS.escape(blockId)}"]`) : null;
    if (!scroller || !el) {
      setBox(null);
      return;
    }
    const next = { top: el.offsetTop, left: el.offsetLeft, width: el.offsetWidth, height: el.offsetHeight };
    setBox(next);
    if (next.top < scroller.scrollTop || next.top + next.height > scroller.scrollTop + scroller.clientHeight) {
      scroller.scrollTo({ top: Math.max(0, next.top - scroller.clientHeight / 3), behavior: 'smooth' });
    }
  }, [focused?.suggestion.id]);

  return (
    <div ref={rootRef} aria-hidden className="pointer-events-none absolute top-0 left-0 h-0 w-full">
      {box ? (
        <div
          className="absolute rounded-[4px] bg-legacy-success-bg mix-blend-multiply motion-safe:animate-lk-fade-in-reduced"
          style={{ top: box.top - 4, left: box.left - 6, width: box.width + 12, height: box.height + 8 }}
        />
      ) : null}
    </div>
  );
}
