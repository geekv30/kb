import { useLayoutEffect, useRef, useState } from 'react';
import { cn } from '../../lib/cn';
import type { ArticleFilter } from '../../store/selectors';

const TABS: Array<{ value: ArticleFilter; label: string }> = [
  { value: 'ALL', label: 'All' },
  { value: 'DRAFT', label: 'Drafts' },
  { value: 'PUBLISHED', label: 'Published' },
];

export interface ArticleTabsProps {
  value: ArticleFilter;
  onChange: (value: ArticleFilter) => void;
}

/*
 * Live tabs (chunk 854 `qe`/`Qe`/`et`): row padding 20px 30px 0; 42px
 * strip; tabs 13/20 with 10px padding (active 500 #28476a, others 400
 * #4E6382); 3px #f2b30f underline, radius 10px, sized and positioned to
 * the active tab with a 300ms `left` transition. The underline sits in
 * an absolute wrapper with margin-bottom -42px, exactly as live, so the
 * browser resolves the same static position.
 */
export function ArticleTabs({ value, onChange }: ArticleTabsProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Partial<Record<ArticleFilter, HTMLButtonElement | null>>>({});
  const [indicator, setIndicator] = useState<{ left: number; width: number }>({ left: 0, width: 0 });

  useLayoutEffect(() => {
    const tab = tabRefs.current[value];
    const list = listRef.current;
    if (!tab || !list) return;
    setIndicator({ left: tab.offsetLeft - list.offsetLeft, width: tab.offsetWidth });
  }, [value]);

  return (
    <div className="box-border flex w-full flex-row px-[30px] pt-[20px] pb-0">
      <div className="flex h-[42px] items-center justify-between">
        <div className="absolute mt-0 mr-0 mb-[-42px] ml-0 box-border flex w-full" aria-hidden>
          <div
            className="relative z-[28] h-[3px] rounded-[10px] bg-legacy-accent transition-[left] duration-300"
            style={{ left: indicator.left, width: indicator.width }}
          />
        </div>
        <div ref={listRef} role="tablist" aria-label="Article status" className="box-border flex w-full">
          {TABS.map((tab) => {
            const selected = tab.value === value;
            return (
              <button
                key={tab.value}
                ref={(el) => {
                  tabRefs.current[tab.value] = el;
                }}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => onChange(tab.value)}
                className={cn(
                  'm-0 cursor-pointer border-0 bg-transparent p-[10px] font-inter text-[13px] leading-[20px] outline-none focus-visible:shadow-[inset_0_0_0_2px_#1473e6]',
                  selected ? 'font-medium text-legacy-body' : 'font-normal text-legacy-meta',
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
