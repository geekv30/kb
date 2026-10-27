import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cell, CellText, TableRow, TableShell, TitleCell, type TableColumn } from '../components/table/LegacyTable';
import { EmptyState } from '../components/ui/EmptyState';
import { ImpactPill } from '../components/ui/Pill';
import { SearchField } from '../components/ui/SearchField';
import { Tabs, type TabOption } from '../components/ui/Tabs';
import { pluralize } from '../lib/format';
import { suggestionsReviewPath } from '../lib/paths';
import { useStore } from '../store/StoreContext';
import {
  selectCategories,
  selectSuggestionArticles,
  type ArticleSuggestionSummary,
  type SuggestionHubTab,
} from '../store/selectors';
import { CategoryTopBar } from './category/CategoryTopBar';
import { PageHeader } from './category/CategoryHeader';

const TABS: ReadonlyArray<TabOption<SuggestionHubTab>> = [
  { value: 'TO_REVIEW', label: 'To review' },
  { value: 'PUBLISHED', label: 'Published' },
];

/*
 * 1167px table at a 1470 viewport. TITLE is 446: room for a full
 * 30-character title (~230px) plus breathing space, without the article
 * table's 506 leaving a void before CATEGORY. The four data columns then
 * share an even ~180 rhythm (IMPACT takes the remaining 181).
 */
const COLUMNS = [
  { id: 'title', label: 'TITLE', width: 446 },
  { id: 'category', label: 'CATEGORY', width: 180 },
  { id: 'suggestions', label: 'SUGGESTIONS', width: 180 },
  { id: 'basedOn', label: 'BASED ON', width: 180 },
  { id: 'impact', label: 'IMPACT' },
] as const satisfies ReadonlyArray<TableColumn>;

const EMPTY: Record<SuggestionHubTab, { title: string; info: string }> = {
  TO_REVIEW: {
    title: 'No suggestions to review',
    info: 'Hiver AI will suggest improvements as new customer conversations come in.',
  },
  PUBLISHED: {
    title: 'No published suggestions yet',
    info: 'Articles you update with AI suggestions will show here.',
  },
};

/** "3 suggestions" until a decision lands, then "2 of 3 reviewed". */
function suggestionsLabel(row: ArticleSuggestionSummary): string {
  if (row.stage === 'PUBLISHED') return `${row.total} published`;
  if (row.reviewed === 0) return pluralize(row.total, 'suggestion');
  return `${row.reviewed} of ${row.total} reviewed`;
}

function HubRow({ row }: { row: ArticleSuggestionSummary }) {
  const navigate = useNavigate();
  const href = suggestionsReviewPath(row.article.slug);
  return (
    <TableRow onOpen={() => navigate(href)}>
      <TitleCell title={row.article.title} href={href} width={COLUMNS[0].width} />
      <Cell width={COLUMNS[1].width}>
        <CellText>{row.category?.title ?? 'Uncategorized'}</CellText>
      </Cell>
      <Cell width={COLUMNS[2].width}>
        <CellText>{suggestionsLabel(row)}</CellText>
      </Cell>
      <Cell width={COLUMNS[3].width}>
        <CellText>{pluralize(row.conversations, 'conversation')}</CellText>
      </Cell>
      <Cell>
        <div className="box-border flex w-full flex-row items-center justify-start">
          <ImpactPill impact={row.impact} />
        </div>
      </Cell>
    </TableRow>
  );
}

/**
 * `/product/ai/suggestions` — the AI section's hub: every article with
 * AI suggestions, in the category page's layout (top bar, header block,
 * tabs, article table).
 */
export function SuggestionsHubPage() {
  const { state } = useStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState<SuggestionHubTab>('TO_REVIEW');
  const [query, setQuery] = useState('');

  const rows = selectSuggestionArticles(state, tab);
  const q = query.trim().toLowerCase();
  const visible = q ? rows.filter((r) => r.article.title.toLowerCase().includes(q)) : rows;
  const firstCategory = selectCategories(state)[0];

  const empty =
    rows.length === 0 ? (
      <EmptyState {...EMPTY[tab]} />
    ) : visible.length === 0 ? (
      <EmptyState title={`No results found for ‘${query.trim()}’`} info="Try a different article title." />
    ) : undefined;

  return (
    <>
      <CategoryTopBar
        currentUser={state.users[state.currentUserId]}
        onNewArticle={() => navigate(`/product/category/${firstCategory?.slug ?? 'getting-started'}/article/add`)}
        search={
          <div className="relative box-border flex w-full flex-col pb-[10px]">
            <SearchField
              aria-label="Search suggestions"
              placeholder="Search suggestions"
              value={query}
              onValueChange={setQuery}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setQuery('');
              }}
            />
          </div>
        }
      />
      <PageHeader
        icon="auto_awesome"
        title="Suggestions"
        description="Improvements Hiver AI drafted from recent customer conversations. Review them before they go live."
      />
      <Tabs tabs={TABS} value={tab} onChange={setTab} label="Suggestion status" />
      <TableShell columns={COLUMNS} empty={empty}>
        {visible.map((row) => (
          <HubRow key={row.article.id} row={row} />
        ))}
      </TableShell>
    </>
  );
}
