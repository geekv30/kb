// Prototype controls, not product UI: a dark pill at the bottom of every
// screen. It switches between the two auto-mode designs (restarting the
// demo) and delivers the incoming batch of suggestions, so you can watch
// where they land with auto mode off, on (option 1), or on (option 2).

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/cn';
import { pluralize } from '../lib/format';
import { SUGGESTIONS_HUB_PATH } from '../lib/paths';
import { suggestions as suggestionFixtures } from '../store/fixtures/suggestions';
import { useStore } from '../store/StoreContext';
import type { AutoLayout, AutoModeOption } from '../store/types';

const LAYOUTS: Array<{ value: AutoLayout; label: string; param: string }> = [
  { value: 'rail', label: 'A · On the review page', param: 'a' },
  { value: 'list', label: 'B · On the edit page', param: 'b' },
];

const PILL_BUTTON =
  'm-0 cursor-pointer whitespace-nowrap rounded-full border-0 px-[10px] py-[4px] font-inter text-[12px] leading-[16px] font-medium outline-none focus-visible:shadow-[0_0_0_2px_#60a5fa]';

export interface PrototypeBarProps {
  /** Distance from the viewport bottom: above the sidebar's New Category button by default. */
  bottom?: number;
}

/**
 * In the sidebar's empty lower corner, above New Category, so it never
 * covers the page being judged. Collapsed to a small chip by default;
 * the open state survives navigation.
 */
export function PrototypeBar({ bottom = 80 }: PrototypeBarProps) {
  const { state, dispatch } = useStore();
  const [open, setOpen] = useState(() => {
    try {
      return window.sessionStorage.getItem('proto-bar-open') === '1';
    } catch {
      return false;
    }
  });
  const toggle = (next: boolean) => {
    setOpen(next);
    try {
      window.sessionStorage.setItem('proto-bar-open', next ? '1' : '0');
    } catch {
      // Storage blocked: the bar just starts collapsed next time.
    }
  };
  const navigate = useNavigate();
  const incoming = Object.values(state.suggestions).filter((s) => s.status === 'incoming');
  const delivered = Object.values(state.suggestions).filter((s) => INCOMING_IDS.has(s.id));
  const arrived = incoming.length === 0;
  const articles = new Set(delivered.map((s) => s.articleId)).size;

  const restart = (option: AutoModeOption) => {
    const url = new URL(window.location.href);
    url.searchParams.set('option', option === 'merge' ? '2' : '1');
    window.history.replaceState(window.history.state, '', url);
    dispatch({ type: 'proto/restart', option });
  };

  // Same data, different presentation: switching layouts needs no restart.
  const setLayout = (layout: (typeof LAYOUTS)[number]) => {
    const url = new URL(window.location.href);
    url.searchParams.set('layout', layout.param);
    window.history.replaceState(window.history.state, '', url);
    dispatch({ type: 'proto/setAutoLayout', layout: layout.value });
  };

  const arrivedText = !state.aiAutoApply
    ? `${pluralize(delivered.length, 'suggestion')} sent to To review`
    : state.autoModeOption === 'publish'
      ? `Auto mode applied ${pluralize(delivered.length, 'suggestion')} to ${pluralize(articles, 'article')}`
      : `Hiver AI saved ${pluralize(articles, 'draft update')}`;

  if (!open) {
    return (
      <button
        type="button"
        aria-label="Open prototype controls"
        onClick={() => toggle(true)}
        style={{ bottom }}
        className="fixed left-[14px] z-[2000] flex cursor-pointer items-center gap-[6px] rounded-full border-0 bg-[#0f172a] px-[12px] py-[6px] font-inter text-[11px] leading-[16px] font-semibold tracking-[0.04em] text-[#cbd5e1] uppercase shadow-[0_4px_16px_rgba(15,23,42,0.35)] outline-none hover:text-white focus-visible:shadow-[0_0_0_2px_#60a5fa]"
      >
        <span aria-hidden className="size-[6px] rounded-full bg-[#86efac]" />
        Prototype · Layout {state.autoLayout === 'list' ? 'B' : 'A'}
      </button>
    );
  }

  // A narrow card that fits the 243px sidebar, so it never covers the page.
  return (
    <div
      role="region"
      aria-label="Prototype controls"
      style={{ bottom }}
      className="fixed left-[14px] z-[2000] box-border flex w-[215px] flex-col gap-[8px] rounded-[10px] bg-[#0f172a] p-[10px] font-inter text-[12px] leading-[16px] text-[#cbd5e1] shadow-[0_4px_16px_rgba(15,23,42,0.35)]"
    >
      <div className="flex items-center justify-between pl-[4px]">
        <span className="font-semibold tracking-[0.04em] text-[#94a3b8] uppercase">Prototype</span>
        <button
          type="button"
          aria-label="Hide prototype controls"
          onClick={() => toggle(false)}
          className={cn(PILL_BUTTON, 'bg-transparent px-[8px] text-[#94a3b8] hover:text-white')}
        >
          ✕
        </button>
      </div>
      {/* The draft-update design (`?option=2`) is parked; only the layouts are on show. */}
      <div className="flex flex-col gap-[2px] rounded-[8px] bg-[#1e293b] p-[2px]" role="group" aria-label="How auto-applied suggestions are shown">
        {LAYOUTS.map((layout) => {
          const selected = state.autoLayout === layout.value;
          return (
            <button
              key={layout.value}
              type="button"
              aria-pressed={selected}
              onClick={() => setLayout(layout)}
              className={cn(PILL_BUTTON, 'rounded-[6px] text-left', selected ? 'bg-white text-[#0f172a]' : 'bg-transparent text-[#cbd5e1] hover:text-white')}
            >
              {layout.label}
            </button>
          );
        })}
      </div>
      {arrived ? (
        <button
          type="button"
          onClick={() => navigate(SUGGESTIONS_HUB_PATH, { state: { tab: state.aiAutoApply ? 'AUTO' : 'TO_REVIEW' } })}
          className={cn(PILL_BUTTON, 'rounded-[6px] bg-transparent text-left whitespace-normal text-[#86efac] hover:text-white')}
        >
          {arrivedText} →
        </button>
      ) : (
        <button
          type="button"
          onClick={() => dispatch({ type: 'ai/receiveSuggestions', now: new Date().toISOString() })}
          className={cn(PILL_BUTTON, 'rounded-[6px] bg-[#2563eb] text-white hover:bg-[#3b82f6]')}
        >
          Simulate new conversations
        </button>
      )}
      <button
        type="button"
        onClick={() => restart(state.autoModeOption)}
        className={cn(PILL_BUTTON, 'rounded-[6px] bg-transparent text-left text-[#94a3b8] hover:text-white')}
      >
        Restart prototype
      </button>
    </div>
  );
}

/** The batch the prototype delivers: whatever the fixtures mark `incoming`. */
const INCOMING_IDS = new Set(suggestionFixtures.filter((s) => s.status === 'incoming').map((s) => s.id));
