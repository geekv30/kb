// Marks the paragraphs Hiver AI changed in auto mode, inside the article
// editor, so the change is visible where people actually read the
// article. Each changed block gets a light tint, a 2px blue bar in the
// editor's left gutter and a ✦ button on it. The button opens a card
// under the paragraph: who changed it and when, the conversations behind
// it, the text before and after, and the way back.
//
// The layer sits inside the editor's scroll container (which is
// `relative`), so block `offsetTop`s line up and everything scrolls with
// the content. It re-measures when the text or the size changes.

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Button } from '../components/ui/Button';
import { MaterialIcon } from '../components/ui/MaterialIcon';
import { cn } from '../lib/cn';
import { pluralize, whenText } from '../lib/format';
import type { AutoChange } from '../store/selectors';
import type { AISuggestion, AutoModeOption } from '../store/types';

export interface AiChangeMarkersProps {
  /** Changes to mark (the unchecked ones). */
  changes: AutoChange[];
  option: AutoModeOption;
  /** publish: restore the original on the live article. merge: take it out of the draft. */
  onUndo: (id: string) => void;
  onOpenSources: (id: string) => void;
}

type Box = { top: number; left: number; width: number; height: number };

/** The block a change lives in once applied: the added block, or the replaced one. */
function changedBlockId(s: AISuggestion): string | undefined {
  if (s.type === 'replace') return s.anchorBlockId;
  if (s.type === 'addition') return /data-block-id="([^"]+)"/.exec(s.payload.newHTML ?? '')?.[1];
  return undefined; // A removed block has nothing left to mark.
}

function htmlToText(html: string | undefined): string {
  if (!html) return '';
  const el = document.createElement('div');
  el.innerHTML = html;
  return (el.textContent ?? '').replace(/\s+/g, ' ').trim();
}

function undoLabel(s: AISuggestion, option: AutoModeOption): string {
  if (option === 'merge') return 'Remove from draft';
  return s.type === 'addition' ? 'Remove paragraph' : 'Restore original';
}

export function AiChangeMarkers({ changes, option, onUndo, onOpenSources }: AiChangeMarkersProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [boxes, setBoxes] = useState<Record<string, Box>>({});
  const [openId, setOpenId] = useState<string | null>(null);

  const measure = useCallback(() => {
    const editable = rootRef.current?.parentElement?.querySelector<HTMLElement>('[role="textbox"]');
    if (!editable) return;
    const next: Record<string, Box> = {};
    for (const { suggestion } of changes) {
      const blockId = changedBlockId(suggestion);
      const el = blockId ? editable.querySelector<HTMLElement>(`[data-block-id="${CSS.escape(blockId)}"]`) : null;
      if (el) next[suggestion.id] = { top: el.offsetTop, left: el.offsetLeft, width: el.offsetWidth, height: el.offsetHeight };
    }
    setBoxes(next);
  }, [changes]);

  useLayoutEffect(() => {
    measure();
    const editable = rootRef.current?.parentElement?.querySelector<HTMLElement>('[role="textbox"]');
    if (!editable) return;
    const ro = new ResizeObserver(measure);
    ro.observe(editable);
    const mo = new MutationObserver(measure);
    mo.observe(editable, { subtree: true, childList: true, characterData: true });
    return () => {
      ro.disconnect();
      mo.disconnect();
    };
  }, [measure]);

  // A change that was kept or undone closes its card.
  useEffect(() => {
    if (openId && !changes.some((c) => c.suggestion.id === openId)) setOpenId(null);
  }, [changes, openId]);

  useEffect(() => {
    if (!openId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenId(null);
    };
    const onDown = (e: MouseEvent) => {
      const target = e.target as Element | null;
      if (!target?.closest('[data-ai-change-card], [data-ai-change-marker], [role="dialog"]')) setOpenId(null);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('mousedown', onDown);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('mousedown', onDown);
    };
  }, [openId]);

  return (
    <div ref={rootRef} aria-hidden={changes.length === 0} className="pointer-events-none absolute top-0 left-0 h-0 w-full">
      {changes.map(({ suggestion }) => {
        const box = boxes[suggestion.id];
        if (!box) return null;
        const open = openId === suggestion.id;
        return (
          <div key={suggestion.id}>
            {/* Tint over the changed block; multiply keeps the text crisp. */}
            <div
              className={cn(
                'absolute rounded-[4px] mix-blend-multiply transition-colors duration-150',
                open ? 'bg-[#dbe8fb]' : 'bg-legacy-wash',
              )}
              style={{ top: box.top - 4, left: box.left - 6, width: box.width + 12, height: box.height + 8 }}
            />
            <div
              className="absolute w-[2px] rounded-full bg-legacy-blue"
              style={{ top: box.top - 4, left: 8, height: box.height + 8 }}
            />
            <div className="pointer-events-auto absolute" style={{ top: box.top - 2, left: 0 }} data-ai-change-marker>
              {/* No hover tooltip: the editor's edge clips it, and the banner explains the ✦. */}
              <button
                type="button"
                aria-expanded={open}
                aria-label={`Changed by Hiver AI: ${suggestion.title}`}
                onClick={() => setOpenId(open ? null : suggestion.id)}
                className="m-0 flex size-[18px] cursor-pointer items-center justify-center rounded-full border-0 bg-legacy-blue p-0 outline-none transition-transform duration-150 ease-out-strong hover:scale-110 focus-visible:shadow-[0_0_0_2px_#ffffff,0_0_0_4px_#1473e6]"
              >
                <MaterialIcon name="auto_awesome" size={12} className="text-white" />
              </button>
            </div>
            {open ? (
              <ChangeCard
                suggestion={suggestion}
                option={option}
                style={{ top: box.top + box.height + 10, left: box.left, width: Math.min(480, box.width) }}
                onUndo={() => onUndo(suggestion.id)}
                onOpenSources={() => onOpenSources(suggestion.id)}
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

interface ChangeCardProps {
  suggestion: AISuggestion;
  option: AutoModeOption;
  style: React.CSSProperties;
  onUndo: () => void;
  onOpenSources: () => void;
}

const LABEL = 'm-0 p-0 text-[11px] leading-[16px] font-semibold tracking-[0.04em] text-legacy-meta uppercase';
const TEXT = 'm-0 mt-[2px] line-clamp-4 p-0 text-[13px] leading-[20px]';

function ChangeCard({ suggestion, option, style, onUndo, onOpenSources }: ChangeCardProps) {
  // Opening near the bottom of the editor would hide the actions; bring the card into view.
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    ref.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, []);
  const before = htmlToText(suggestion.payload.oldHTML);
  const after = htmlToText(suggestion.payload.newHTML);
  const when = suggestion.autoAppliedAt ? whenText(suggestion.autoAppliedAt) : 'recently';
  return (
    <section
      ref={ref}
      data-ai-change-card
      aria-label={`Change by Hiver AI: ${suggestion.title}`}
      className="pointer-events-auto absolute z-[20] box-border rounded-[6px] border border-solid border-legacy-input-border bg-white p-[16px] font-inter shadow-legacy-modal motion-safe:animate-lk-suggestion-mount"
      style={style}
    >
      <div className="flex items-center gap-[6px]">
        <MaterialIcon name="auto_awesome" size={16} className="text-legacy-blue" />
        <span className="text-[13px] leading-[20px] font-medium text-legacy-ink">
          {option === 'publish' ? 'Changed by Hiver AI' : 'In Hiver AI’s draft update'}
        </span>
        <span className="ml-auto text-[12px] leading-[20px] text-legacy-meta">
          {option === 'publish' ? `Live · ${when}` : `Not live yet · ${when}`}
        </span>
      </div>
      <h3 className="m-0 mt-[8px] p-0 text-[14px] leading-[20px] font-medium text-legacy-ink">{suggestion.title}</h3>
      <button
        type="button"
        onClick={onOpenSources}
        className="m-0 mt-[2px] cursor-pointer border-0 bg-transparent p-0 font-inter text-[13px] leading-[20px] font-medium text-legacy-blue hover:underline"
      >
        Based on {pluralize(suggestion.sourceCount, 'customer conversation')}
      </button>

      <div className="mt-[12px] grid gap-[10px] border-0 border-t border-solid border-legacy-input-border pt-[12px]">
        <div>
          <p className={LABEL}>Before</p>
          {before ? (
            <p className={cn(TEXT, 'text-legacy-body')}>{before}</p>
          ) : (
            <p className={cn(TEXT, 'text-legacy-meta italic')}>Nothing. This paragraph is new.</p>
          )}
        </div>
        <div>
          <p className={LABEL}>After</p>
          {after ? (
            <p className={cn(TEXT, 'text-legacy-ink')}>{after}</p>
          ) : (
            <p className={cn(TEXT, 'text-legacy-meta italic')}>Removed.</p>
          )}
        </div>
      </div>

      <div className="mt-[16px] flex items-center justify-end gap-[8px]">
        <Button variant="secondary" onClick={onUndo} className="h-[32px] px-[12px] py-0 text-[13px] leading-[20px]">
          {undoLabel(suggestion, option)}
        </Button>
      </div>
    </section>
  );
}
