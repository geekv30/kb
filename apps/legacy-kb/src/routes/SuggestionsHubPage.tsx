import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Cell, CellText, TableRow, TableShell, TitleCell, type TableColumn } from '../components/table/LegacyTable';
import { EmptyState } from '../components/ui/EmptyState';
import { MaterialIcon } from '../components/ui/MaterialIcon';
import { ImpactPill } from '../components/ui/Pill';
import { SearchField } from '../components/ui/SearchField';
import { Tabs, type TabOption } from '../components/ui/Tabs';
import { AUTO_MODE_COPY } from '../improvements/autoModeCopy';
import { pluralize, whenText } from '../lib/format';
import { suggestionsReviewPath } from '../lib/paths';
import { useStore } from '../store/StoreContext';
import {
  articleEditPath,
  selectAutoChanges,
  selectAutoNeedsLook,
  selectCategories,
  selectSuggestionArticles,
  type ArticleSuggestionSummary,
  type AutoChange,
  type SuggestionHubTab,
} from '../store/selectors';
import type { AutoModeOption } from '../store/types';
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
    { id: 'changes', label: 'CHANGES', width: 180 },
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
    if (row.published > 0) parts.push(`${row.published} published`);
    if (row.dismissed > 0) parts.push(`${row.dismissed} dismissed`);
    return parts.join(' · ');
  }
  if (row.reviewed === 0) return pluralize(row.total, 'suggestion');
  return `${row.reviewed} of ${row.total} reviewed`;
}

/**
 * publish: "2 to check" until someone keeps or restores them, then
 *          "2 applied" (+ "· 1 restored").
 * merge:   "2 in draft" (fewer once some are removed from the draft).
 */
function autoChangesLabel(changes: AutoChange[], option: AutoModeOption): string {
  const count = (status: AutoChange['status']) => changes.filter((c) => c.status === status).length;
  if (option === 'merge') return `${pluralize(count('draft'), 'change')} in draft`;
  const unchecked = changes.filter((c) => c.unchecked).length;
  if (unchecked > 0) return `${unchecked} to check`;
  const restored = count('restored');
  return restored > 0 ? `${count('live')} applied · ${restored} restored` : `${count('live')} applied`;
}

function AutoHubRow({ row, columns }: { row: ArticleSuggestionSummary; columns: ReadonlyArray<TableColumn> }) {
  const navigate = useNavigate();
  const { state } = useStore();
  // Auto changes are checked inside the article, so the row opens its editor.
  const href = articleEditPath(state, row.article.id);
  const changes = selectAutoChanges(state, row.article.id);
  return (
    <TableRow onOpen={() => navigate(href)}>
      <TitleCell title={row.article.title} href={href} width={COLUMNS[0].width} />
      <Cell width={columns[1]?.width}>
        <CellText>{row.category?.title ?? 'Uncategorized'}</CellText>
      </Cell>
      <Cell width={columns[2]?.width}>
        <CellText>{autoChangesLabel(changes, state.autoModeOption)}</CellText>
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

/*
 * Auto mode's "what changed" notice above the tabs, in the edit banner's
 * wash (#f2f6ff, 1px #d1e0f1, radius 4px): one line per article that
 * needs a look, each opening the article where its changes are marked.
 */
function AutoNotice({ rows }: { rows: ArticleSuggestionSummary[] }) {
  const { state } = useStore();
  const copy = AUTO_MODE_COPY[state.autoModeOption];
  return (
    <section
      aria-label="Changes by Hiver AI"
      className="mx-[40px] mt-[4px] mb-[16px] box-border rounded-[4px] border border-solid border-legacy-input-border bg-legacy-wash px-[16px] py-[12px] font-inter"
    >
      <p className="m-0 flex items-center gap-[12px] p-0 text-[14px] leading-[20px] font-medium text-legacy-ink">
        <MaterialIcon name="auto_awesome" size={20} className="shrink-0 text-legacy-blue" />
        {copy.notice(pluralize(rows.length, 'article'))}
      </p>
      <ul className="m-0 mt-[8px] list-none p-0 pl-[32px]">
        {rows.map((row) => {
          const changes = selectAutoChanges(state, row.article.id);
          return (
            <li key={row.article.id} className="flex items-center gap-[8px] py-[4px] text-[13px] leading-[20px]">
              <span className="font-medium text-legacy-ink">{row.article.title}</span>
              <span className="text-legacy-meta">
                · {autoChangesLabel(changes, state.autoModeOption)}
                {row.autoAppliedAt ? ` · ${whenText(row.autoAppliedAt)}` : ''}
              </span>
              <Link
                to={articleEditPath(state, row.article.id)}
                className="ml-auto font-medium whitespace-nowrap text-legacy-blue no-underline hover:underline"
              >
                {copy.noticeAction}
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
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

  const copy = AUTO_MODE_COPY[state.autoModeOption];
  const autoRows = selectSuggestionArticles(state, 'AUTO');
  const needsLook = autoRows.filter((r) => selectAutoNeedsLook(state, r.article.id));
  // The third tab appears once auto mode is on (or has left something behind).
  const showAuto = state.aiAutoApply || autoRows.length > 0;
  const tabs: ReadonlyArray<TabOption<SuggestionHubTab>> = [
    { value: 'TO_REVIEW', label: 'To review' },
    ...(showAuto ? [{ value: 'AUTO' as const, label: copy.tab }] : []),
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
        ? { title: EMPTY.TO_REVIEW.title, info: `Auto mode is on, so new suggestions go to ${copy.tab}.` }
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
      {needsLook.length > 0 ? <AutoNotice rows={needsLook} /> : null}
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
