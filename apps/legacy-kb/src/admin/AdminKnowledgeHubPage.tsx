// Admin Panel › AI › Knowledge Hub (v2.hiverhq.com/app/knowledge-hub),
// pixel-matched from the live page: "Add new" tiles, "Your sources"
// filters, and the sources table (a row lights #f6f8fc on hover and
// fades its delete icon in).
//
// Entry points: a one-line note above "Your sources" saying Hiver AI has
// suggestions for articles it answers from, and the same chip as the Help
// Center page beside the help center source those articles live in. Both
// link to the help center's AI › Suggestions list and hide at 0.

import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../components/ui/Toast';
import { cn } from '../lib/cn';
import { pluralize } from '../lib/format';
import { SUGGESTIONS_HUB_PATH } from '../lib/paths';
import { AdminIcon, type AdminIconName } from './AdminIcon';
import { AiSuggestionsChip } from './AiSuggestionsChip';
import { KNOWLEDGE_SOURCES, REPLICA_HELP_CENTER_ID, type KnowledgeSource, type KnowledgeSourceType } from './adminFixtures';
import { useAiSuggestionCounts } from './useAiSuggestionCounts';

const OUT_OF_SCOPE = 'This isn’t part of the prototype.';

const SOURCE_ICON: Record<KnowledgeSourceType, AdminIconName> = {
  helpCenter: 'srcHelpCenter',
  website: 'srcWebsite',
  document: 'srcDocument',
  snippet: 'srcSnippets',
  notion: 'srcNotion',
  confluence: 'srcConfluence',
  googleDrive: 'srcGoogleDrive',
  s3: 'srcS3',
};

const ADD_NEW: { label: string; icon: AdminIconName }[] = [
  { label: 'Website', icon: 'srcWebsite' },
  { label: 'Confluence', icon: 'srcConfluence' },
  { label: 'Google drive', icon: 'srcGoogleDrive' },
  { label: 'Snippets', icon: 'srcSnippets' },
  { label: 'Document', icon: 'srcDocument' },
  { label: 'Notion', icon: 'srcNotion' },
  { label: 'Amazon S3', icon: 'srcS3' },
];

type Filter = 'all' | KnowledgeSourceType;

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'helpCenter', label: 'Help center' },
  { id: 'website', label: 'Website' },
  { id: 'document', label: 'Document' },
  { id: 'snippet', label: 'Snippet' },
  { id: 'notion', label: 'Notion' },
  { id: 'confluence', label: 'Confluence' },
  { id: 'googleDrive', label: 'Google drive' },
  { id: 's3', label: 'Amazon S3' },
];

/** Table columns from the live header: 400 / 100 / 200 / 292px; all but Source right-aligned. */
const COL = { source: 'w-[400px]', pages: 'w-[100px]', synced: 'w-[200px]', mapped: 'w-[292px]' };
const HEAD_TEXT = 'm-0 font-inter text-[11px] leading-[18px] font-normal text-admin-count uppercase';
const CELL_TEXT = 'm-0 font-inter text-[13px] leading-[18px] font-medium';

function AiSourcesNote({ articles, suggestions }: { articles: number; suggestions: number }) {
  if (articles <= 0) return null;
  return (
    <div className="mt-[28px] box-border flex items-center gap-[8px] rounded-[8px] bg-admin-pill-active-bg px-[16px] py-[10px]">
      <AdminIcon name="navHiverAi" size={16} className="text-admin-pill-active-text" />
      <p className="m-0 min-w-0 flex-1 font-inter text-[14px] leading-[20px] font-normal text-admin-row-text">
        Hiver AI found {pluralize(suggestions, 'suggestion')} for {pluralize(articles, 'article')} in{' '}
        <span className="font-medium">product help center</span>. Better articles mean better AI answers.
      </p>
      <Link
        to={SUGGESTIONS_HUB_PATH}
        className="shrink-0 rounded-[4px] font-inter text-[14px] leading-[20px] font-medium whitespace-nowrap text-admin-pill-active-text no-underline outline-none hover:underline focus-visible:shadow-[0_0_0_2px_#506dff]"
      >
        Review suggestions
      </Link>
    </div>
  );
}

function SyncedCell({ synced }: { synced: KnowledgeSource['lastSynced'] }) {
  if (synced.kind === 'failed') {
    // Live: a failed sync sits flush right in its column; dates sit left.
    return (
      <span className="flex items-center justify-end gap-[6px]">
        <AdminIcon name="errorOutline" size={16} className="text-admin-failed" />
        <span className={cn(CELL_TEXT, 'text-admin-failed')}>{synced.text}</span>
      </span>
    );
  }
  return <p className={cn(CELL_TEXT, 'text-right text-admin-kh-sub')}>{synced.text}</p>;
}

function SourceRow({ source, articlesToImprove }: { source: KnowledgeSource; articlesToImprove: number }) {
  const { showToast } = useToast();
  return (
    <div className="group box-border flex items-center border-0 border-x border-b border-solid border-admin-card-border bg-white py-[14px] pr-[26px] pl-[24px] hover:bg-admin-sidebar">
      <div className={cn(COL.source, 'flex min-w-0 items-center gap-[8px]')}>
        <span className="box-border flex size-[38px] shrink-0 items-center justify-center rounded-[3px] border border-solid border-admin-tile-border bg-white">
          <AdminIcon name={SOURCE_ICON[source.type]} size={20} className="text-admin-tile-icon" />
        </span>
        <div className="flex min-w-0 flex-col gap-[2px]">
          <div className="flex min-w-0 items-center gap-[8px]">
            <p className="m-0 truncate font-inter text-[14px] leading-[20px] font-medium text-admin-row-text">
              {source.name}
            </p>
            {source.helpCenterId === REPLICA_HELP_CENTER_ID ? (
              <AiSuggestionsChip articles={articlesToImprove} to={SUGGESTIONS_HUB_PATH} />
            ) : null}
          </div>
          {source.createdBy ? (
            <p className="m-0 truncate font-inter text-[13px] leading-[18px] font-normal text-admin-kh-sub">
              {source.createdBy}
            </p>
          ) : null}
        </div>
      </div>
      <div className={COL.pages}>
        <p className={cn(CELL_TEXT, 'text-right text-admin-row-text')}>{source.pages}</p>
      </div>
      <div className={COL.synced}>
        <SyncedCell synced={source.lastSynced} />
      </div>
      <div className={cn(COL.mapped, 'flex justify-end')}>
        {/* Live: a failed source can't be assigned — 0.45 opacity, no pointer events. */}
        <button
          type="button"
          disabled={source.lastSynced.kind === 'failed'}
          onClick={() => showToast(OUT_OF_SCOPE)}
          className="m-0 box-border flex h-[26px] cursor-pointer items-center gap-[6px] rounded-[6px] border border-dashed border-admin-assign-border bg-transparent px-[10px] py-[5px] outline-none focus-visible:shadow-[0_0_0_2px_#506dff] disabled:pointer-events-none disabled:cursor-default disabled:opacity-45"
        >
          <AdminIcon name="add" size={13} className="text-admin-assign-text" />
          <span className="font-inter text-[11px] leading-[14px] font-medium text-admin-assign-text">Assign</span>
        </button>
      </div>
      <button
        type="button"
        aria-label={`Delete ${source.name}`}
        onClick={() => showToast(OUT_OF_SCOPE)}
        className="m-0 ml-[37px] flex cursor-pointer items-center border-0 bg-transparent p-0 opacity-0 outline-none group-hover:opacity-100 focus-visible:opacity-100"
      >
        <AdminIcon name="deleteOutline" size={18} className="text-admin-count" />
      </button>
    </div>
  );
}

export function AdminKnowledgeHubPage() {
  const { showToast } = useToast();
  const { articles, suggestions } = useAiSuggestionCounts();
  const [filter, setFilter] = useState<Filter>('all');
  const rows = useMemo(
    () => (filter === 'all' ? KNOWLEDGE_SOURCES : KNOWLEDGE_SOURCES.filter((s) => s.type === filter)),
    [filter],
  );

  return (
    <div className="px-[32px] pt-[17px]">
      <div className="box-border bg-white px-[20px] pt-[16px] pb-[40px]">
        <p className="m-0 font-inter text-[20px] leading-[24px] font-medium text-admin-kh-title">Knowledge hub</p>
        <p className="m-0 mt-[4px] font-inter text-[14px] leading-[20px] font-normal text-admin-kh-sub">
          Add knowledge sources Hiver AI can use to answer questions and draft replies
        </p>

        <h2 className="m-0 mt-[28px] font-inter text-[14px] leading-[20px] font-medium text-admin-kh-heading">Add new</h2>
        <div className="mt-[14px] flex flex-wrap gap-[12px]">
          {ADD_NEW.map((tile) => (
            <button
              key={tile.label}
              type="button"
              onClick={() => showToast(OUT_OF_SCOPE)}
              className="m-0 box-border flex h-[85px] w-[200px] cursor-pointer flex-col items-center rounded-[3px] border border-solid border-admin-tile-border bg-white px-[2px] pt-[16px] pb-[4px] outline-none focus-visible:shadow-[0_0_0_2px_#506dff]"
            >
              <AdminIcon name={tile.icon} size={30} className="text-admin-tile-icon" />
              <span className="mt-[3px] font-inter text-[13px] leading-[18px] font-normal text-admin-kh-heading">
                {tile.label}
              </span>
            </button>
          ))}
        </div>

        <AiSourcesNote articles={articles} suggestions={suggestions} />

        <div className="mt-[28px] flex items-center gap-[4px]">
          <span className="font-inter text-[14px] leading-[20px] font-medium text-admin-kh-heading">Your sources</span>
          <span className="font-inter text-[14px] leading-[20px] font-medium text-admin-count">({rows.length})</span>
        </div>

        <div className="mt-[16px] flex items-center justify-between">
          <div className="flex flex-wrap items-center gap-[6px]">
            {FILTERS.map((f) => {
              const active = f.id === filter;
              return (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setFilter(f.id)}
                  className={cn(
                    'm-0 box-border h-[28px] cursor-pointer rounded-[43px] border border-solid px-[14px] py-[4px] font-inter text-[13px] leading-[18px] outline-none focus-visible:shadow-[0_0_0_2px_#506dff]',
                    active
                      ? 'border-admin-primary bg-admin-pill-active-bg font-medium text-admin-pill-active-text'
                      : 'border-admin-pill-border bg-white font-normal text-admin-kh-sub',
                  )}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => showToast(OUT_OF_SCOPE)}
            className="m-0 box-border flex h-[28px] w-[63px] cursor-pointer items-center justify-between rounded-[4px] border border-solid border-admin-pill-border bg-white py-[4px] pr-[4px] pl-[8px] outline-none"
          >
            <span className="font-inter text-[13px] leading-[18px] font-normal text-admin-row-text">All</span>
            <AdminIcon name="arrowDropDown" size={22} className="text-admin-row-text" />
          </button>
        </div>

        <div className="mt-[18px]">
          <div className="box-border flex h-[44px] items-center rounded-t-[8px] border border-solid border-admin-card-border bg-admin-sidebar py-[12px] pr-[26px] pl-[24px]">
            <p className={cn(HEAD_TEXT, COL.source)}>Source</p>
            <p className={cn(HEAD_TEXT, COL.pages, 'text-right')}>Pages</p>
            <p className={cn(HEAD_TEXT, COL.synced, 'text-right')}>Last synced</p>
            <p className={cn(HEAD_TEXT, COL.mapped, 'text-right')}>Mapped to</p>
          </div>
          {rows.map((source) => (
            <SourceRow key={source.id} source={source} articlesToImprove={articles} />
          ))}
        </div>
      </div>
    </div>
  );
}
