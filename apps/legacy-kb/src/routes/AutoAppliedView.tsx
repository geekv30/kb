import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { backIcon } from '../assets/legacy';
import { Button } from '../components/ui/Button';
import { MaterialIcon } from '../components/ui/MaterialIcon';
import { cn } from '../lib/cn';
import { SUGGESTIONS_HUB_PATH } from '../lib/paths';
import { AutoAppliedCard } from '../improvements/AutoAppliedCard';
import { AutoAppliedStory, decorateLiveBody } from '../improvements/autoApplied';
import { CountPill } from '../improvements/ReviewAtoms';
import { SourcesSheet } from '../improvements/SourcesSheet';
import { SuggestionRail, type SuggestionRailItem } from '../improvements/SuggestionRail';
import { useAutoApplied } from '../improvements/useAutoApplied';
import { useStore } from '../store/StoreContext';

/** Same rail width as the manual review. */
const RAIL_WIDTH = 340;

/**
 * Layout A — `/product/ai/suggestions/:slug` for an article Hiver AI
 * changed in auto mode. The manual review's layout (article + rail), so
 * "suggestion" looks the same in both modes, but every card is already
 * applied: the article shows the live text with each suggestion numbered
 * and washed green, and each card offers Revert.
 */
export function AutoAppliedView({ articleId }: { articleId: string }) {
  const navigate = useNavigate();
  const { state } = useStore();
  const article = state.articles[articleId];
  const auto = useAutoApplied(articleId);
  const articleRef = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);

  const bodyHTML = useMemo(
    () => (article ? decorateLiveBody(article.bodyHTML, auto.items) : ''),
    [article?.bodyHTML, auto.items],
  );
  const railItems = useMemo<SuggestionRailItem[]>(
    () =>
      auto.items.map((item) => ({
        id: item.suggestion.id,
        node: <AutoAppliedCard item={item} onToggle={auto.toggle} onOpenSources={auto.setSourcesFor} />,
      })),
    [auto.items, auto.toggle, auto.setSourcesFor],
  );

  if (!article) return null;
  const live = auto.items.filter((i) => i.live).length;

  return (
    <>
      <div className="relative box-border flex w-full shrink-0 flex-row items-center justify-between pt-[25px] pr-[40px] pb-[10px] pl-[20px]">
        <Button variant="ghost" iconSrc={backIcon} onClick={() => navigate(SUGGESTIONS_HUB_PATH)}>
          Back
        </Button>
        {auto.needsReview ? (
          <Button variant="primary" onClick={auto.markReviewed}>
            Mark as reviewed
          </Button>
        ) : null}
        <span
          aria-hidden
          className={cn(
            'pointer-events-none absolute right-0 bottom-0 left-0 h-px bg-legacy-table-border',
            'transition-opacity duration-150 ease-out motion-reduce:duration-100',
            scrolled ? 'opacity-100' : 'opacity-0',
          )}
        />
      </div>

      <div onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 0)} className="min-h-0 flex-1 overflow-y-auto">
        {/* The story first: auto mode, what Hiver AI did to this article, what you can do. */}
        <section
          aria-label="Auto mode"
          className="mt-[24px] mr-[40px] ml-[65px] box-border flex items-start gap-[12px] rounded-[4px] border border-solid border-legacy-input-border bg-legacy-wash px-[16px] py-[12px] font-inter"
        >
          <MaterialIcon name="auto_awesome" size={20} className="mt-[1px] shrink-0 text-legacy-blue" />
          <AutoAppliedStory state={state} items={auto.items} articleId={articleId} />
        </section>

        <div className="box-border flex flex-row items-start gap-[40px] pt-[32px] pr-[40px] pb-[80px] pl-[65px]">
          <article
            ref={articleRef}
            aria-label={article.title}
            className="ck-content relative box-border w-full max-w-[720px] min-w-0 flex-1 break-words text-legacy-editor"
          >
            <h1>{article.title}</h1>
            <div dangerouslySetInnerHTML={{ __html: bodyHTML }} />
          </article>
          <SuggestionRail
            articleRef={articleRef}
            width={RAIL_WIDTH}
            items={railItems}
            className="mt-[27px]"
            summary={
              <div className="flex h-[32px] items-center gap-[8px] font-inter">
                <h2 className="m-0 p-0 text-[14px] leading-[17px] font-medium text-legacy-ink">Auto-applied suggestions</h2>
                <CountPill count={live} label={`${live} live`} />
              </div>
            }
          />
        </div>
      </div>

      <SourcesSheet
        open={auto.sourcesFor !== null}
        onOpenChange={(open) => {
          if (!open) auto.setSourcesFor(null);
        }}
        sources={auto.sources}
      />
    </>
  );
}
