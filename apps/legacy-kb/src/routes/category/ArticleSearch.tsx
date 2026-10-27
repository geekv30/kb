import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchIcon } from '../../assets/legacy';
import { StatusPill } from '../../components/ui/Pill';
import { CloseGlyph } from '../../components/ui/Modal';
import { cn } from '../../lib/cn';
import { useStore } from '../../store/StoreContext';
import { searchArticles } from '../../store/selectors';
import type { Article } from '../../store/types';

/** Live search only queries past 3 characters. */
const MIN_QUERY_LENGTH = 4;

/*
 * Live search (chunk 854 `W`/`V`/`G`/`X`/`K`): underline-only field with
 * a 1px #d6e0eb bottom border (#1473e6 on focus), 14/28 input with the
 * search glyph as a 16px background at 0 16px, padding 10 10 10 26.
 * Results card: 20px top padding, grouped by category (12/28 #09274a
 * headings), rows padding 6px 16px with #f2f2f2 hover.
 */
export function ArticleSearch() {
  const { state } = useStore();
  const navigate = useNavigate();
  const rootRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const open = query.length >= MIN_QUERY_LENGTH && !dismissed;
  const groups = useMemo(() => {
    const byCategory = new Map<string, Article[]>();
    for (const article of searchArticles(state, query)) {
      const title = state.categories[article.categoryId]?.title ?? '';
      byCategory.set(title, [...(byCategory.get(title) ?? []), article]);
    }
    return [...byCategory.entries()];
  }, [state, query]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setDismissed(true);
    };
    window.addEventListener('mousedown', onDown);
    return () => window.removeEventListener('mousedown', onDown);
  }, [open]);

  const openArticle = (article: Article) => {
    const categorySlug = state.categories[article.categoryId]?.slug;
    if (!categorySlug) return;
    setQuery('');
    navigate(`/product/category/${categorySlug}/article/edit/${article.slug}`);
  };

  return (
    <div
      ref={rootRef}
      className={cn(
        'relative box-border flex w-full flex-col justify-between rounded-[5px] pt-0 pr-0 pb-[10px] pl-0',
        open && 'shadow-legacy-search',
      )}
    >
      <div className="box-border flex w-full px-[15px]">
        <div className="box-border flex w-full items-center border-0 border-b border-solid border-legacy-divider focus-within:border-legacy-blue">
          <input
            type="text"
            role="combobox"
            aria-expanded={open}
            aria-controls="article-search-results"
            aria-label="Search articles"
            placeholder="Search articles"
            value={query}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onChange={(e) => {
              setQuery(e.target.value);
              setDismissed(false);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setDismissed(true);
            }}
            className="w-full border-0 bg-no-repeat pt-[10px] pr-[10px] pb-[10px] pl-[26px] text-[14px] leading-[28px] font-normal outline-none placeholder:text-legacy-meta"
            style={{
              backgroundImage: `url(${searchIcon})`,
              backgroundPosition: '0 16px',
              backgroundSize: '16px 16px',
            }}
          />
          {(focused || open) && query.length > 0 ? (
            <button
              type="button"
              aria-label="Clear search"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setQuery('')}
              className="m-0 flex cursor-pointer border-0 bg-transparent p-0"
            >
              <CloseGlyph size={16} />
            </button>
          ) : null}
        </div>
      </div>
      {open ? (
        <div
          id="article-search-results"
          role="listbox"
          className="absolute top-[50px] z-[1000] box-border max-h-[230px] w-full overflow-x-hidden overflow-y-auto rounded-[5px] bg-white pt-[20px] pb-[5px] shadow-legacy-search-results outline-none"
        >
          {groups.length > 0 ? (
            groups.map(([categoryTitle, articles]) => (
              <div key={categoryTitle} className="flex flex-col" role="group" aria-label={categoryTitle}>
                <div className="flex px-[16px]">
                  <span className="p-0 text-[12px] leading-[28px] font-normal text-legacy-ink">{categoryTitle}</span>
                </div>
                <ul className="m-0 w-full cursor-pointer list-none px-0 py-[6px]">
                  {articles.map((article) => (
                    <li
                      key={article.id}
                      role="option"
                      aria-selected={false}
                      tabIndex={0}
                      onClick={() => openArticle(article)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') openArticle(article);
                      }}
                      className="m-0 cursor-pointer px-[16px] py-[6px] outline-none hover:bg-legacy-search-hover focus-visible:bg-legacy-search-hover"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[14px] leading-[28px] font-normal text-legacy-ink">{article.title}</span>
                        <StatusPill status={article.status} context="search" />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          ) : (
            <p className="mt-0 mr-0 mb-[16px] ml-[16px] text-[12px] leading-[28px] font-normal text-legacy-meta">
              No results found for ‘{query}’
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
