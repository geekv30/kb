import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Cell, CellText, TableRow, TableShell, TitleCell, type TableColumn } from '../components/table/LegacyTable';
import { EmptyState } from '../components/ui/EmptyState';
import { ImpactPill } from '../components/ui/Pill';
import { SearchField } from '../components/ui/SearchField';
import { Tabs, type TabOption } from '../components/ui/Tabs';
import { AUTO_MODE_COPY } from '../improvements/autoModeCopy';
import { pluralize, whenText } from '../lib/format';
import { suggestionsReviewPath } from '../lib/paths';
import { useStore } from '../store/StoreContext';
import {
  selectAutoChanges,
  selectAutoWhere,
  selectCategories,
  selectSuggestionArticles,
  type ArticleSuggestionSummary,
  type AutoChange,
  type AutoWhere,
  type SuggestionHubTab,
} from '../store/selectors';
import { CategoryTopBar } from './category/CategoryTopBar';
import { PageHeader } from './category/CategoryHeader';


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

/** Auto tab: what changed and when it arrived take IMPACT's place. */
function autoColumns(whenLabel: string): ReadonlyArray<TableColumn> {
  return [
    COLUMNS[0],
    COLUMNS[1],
    { id: 'changes', label: 'SUGGESTIONS', width: 180 },
    COLUMNS[3],
    { id: 'when', label: whenLabel },
  ];
}

const EMPTY: Record<Exclude<SuggestionHubTab, 'AUTO'>, { title: string; info: string }> = {
  TO_REVIEW: {
    title: 'No suggestions to review',
    info: 'Hiver AI will suggest improvements as new customer conversations come in.',
  },
  REVIEWED: {
    title: 'No reviewed articles yet',
    info: 'Articles you publish changes to or mark as reviewed will show here.',
  },
};

/**
 * To review: "3 suggestions" until a decision lands, then "2 of 3 reviewed".
 * Reviewed: what happened to them, e.g. "2 published · 1 dismissed".
 */
function suggestionsLabel(row: ArticleSuggestionSummary): string {
  if (row.stage === 'REVIEWED') {
    const parts: string[] = [];
    if (row.published > 0) parts.push(`${row.published} ${row.auto && row.article.status === 'DRAFT' ? 'applied' : 'published'}`);
    if (row.dismissed > 0) parts.push(`${row.dismissed} ${row.auto ? 'reverted' : 'dismissed'}`);
    return parts.join(' · ');
  }
  if (row.reviewed === 0) return pluralize(row.total, 'suggestion');
  return `${row.reviewed} of ${row.total} reviewed`;
}

/**
 * "3 suggestions", "2 suggestions · 1 reverted" after a revert, and
 * "· in draft" when they wait in a draft rather than unpublished edits.
 */
function autoChangesLabel(changes: AutoChange[], where: AutoWhere): string {
  const applied = changes.filter((c) => c.status === 'applied').length;
  const reverted = changes.length - applied;
  const parts = [pluralize(applied, 'suggestion')];
  if (reverted > 0) parts.push(`${reverted} reverted`);
  if (where === 'draft') parts.push('in draft');
  return parts.join(' · ');
}

function AutoHubRow({ row, columns }: { row: ArticleSuggestionSummary; columns: ReadonlyArray<TableColumn> }) {
  const navigate = useNavigate();
  const { state } = useStore();
  const href = suggestionsReviewPath(row.article.slug);
  const changes = selectAutoChanges(state, row.article.id);
  return (
    <TableRow onOpen={() => navigate(href)}>
      <TitleCell title={row.article.title} href={href} width={COLUMNS[0].width} />
      <Cell width={columns[1]?.width}>
        <CellText>{row.category?.title ?? 'Uncategorized'}</CellText>
      </Cell>
      <Cell width={columns[2]?.width}>
        <CellText>{autoChangesLabel(changes, selectAutoWhere(state, row.article.id))}</CellText>
      </Cell>
      <Cell width={columns[3]?.width}>
        <CellText>{pluralize(row.conversations, 'conversation')}</CellText>
      </Cell>
      <Cell>
        <CellText>{row.autoAppliedAt ? whenText(row.autoAppliedAt) : ''}</CellText>
      </Cell>
    </TableRow>
  );
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
  // The prototype bar links here with `{ tab }` to show where a batch landed.
  const location = useLocation();
  const linkedTab = (location.state as { tab?: SuggestionHubTab } | null)?.tab;
  const [tab, setTab] = useState<SuggestionHubTab>(linkedTab ?? 'TO_REVIEW');
  useEffect(() => {
    if (linkedTab) setTab(linkedTab);
  }, [location.key]);
  const [query, setQuery] = useState('');

  const copy = AUTO_MODE_COPY;
  const autoRows = selectSuggestionArticles(state, 'AUTO');
  // The third tab appears once auto mode is on (or has left something behind).
  const showAuto = state.aiAutoApply || autoRows.length > 0;
  const tabs: ReadonlyArray<TabOption<SuggestionHubTab>> = [
    { value: 'TO_REVIEW', label: 'To review' },
    ...(showAuto ? [{ value: 'AUTO' as const, label: copy.tag }] : []),
    { value: 'REVIEWED', label: 'Reviewed' },
  ];
  const activeTab = tab === 'AUTO' && !showAuto ? 'TO_REVIEW' : tab;
  const columns = activeTab === 'AUTO' ? autoColumns(copy.whenColumn) : COLUMNS;

  const rows = activeTab === 'AUTO' ? autoRows : selectSuggestionArticles(state, activeTab);
  const q = query.trim().toLowerCase();
  const visible = q ? rows.filter((r) => r.article.title.toLowerCase().includes(q)) : rows;
  const firstCategory = selectCategories(state)[0];

  const emptyCopy =
    activeTab === 'AUTO'
      ? copy.empty
      : activeTab === 'TO_REVIEW' && state.aiAutoApply
        ? { title: EMPTY.TO_REVIEW.title, info: `Auto mode is on, so new suggestions go to ${copy.tag}.` }
        : EMPTY[activeTab];

  const empty =
    rows.length === 0 ? (
      <EmptyState {...emptyCopy} />
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
        description={
          state.aiAutoApply
            ? copy.hubDescription
            : 'Improvements Hiver AI drafted from recent customer conversations. Review them before they go live.'
        }
      />
      <Tabs tabs={tabs} value={activeTab} onChange={setTab} label="Suggestion status" />
      <TableShell columns={columns} empty={empty}>
        {visible.map((row) =>
          activeTab === 'AUTO' ? (
            <AutoHubRow key={row.article.id} row={row} columns={columns} />
          ) : (
            <HubRow key={row.article.id} row={row} />
          ),
        )}
      </TableShell>
    </>
  );
}
