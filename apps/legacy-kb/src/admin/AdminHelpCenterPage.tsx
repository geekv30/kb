// Admin Panel › Resources › Help Center (v2.hiverhq.com/app/knowledge_base),
// pixel-matched from the live page. The live "limit of 25 knowledge
// bases" banner is account state, so it is left out and "Create Help
// Center" shows its enabled (primary) style.
//
// Entry point: the help center that has Hiver AI suggestions gets an
// "N articles to improve" chip after its Internal / External tag, linking
// to the help center's AI › Suggestions list.

import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ui/Toast';
import { cn } from '../lib/cn';
import { SUGGESTIONS_HUB_PATH } from '../lib/paths';
import { AdminIcon, type AdminIconName } from './AdminIcon';
import { AdminTooltip } from './AdminTooltip';
import { AiSuggestionsChip } from './AiSuggestionsChip';
import { ADMIN_HELP_CENTERS, REPLICA_HELP_CENTER_ID, type AdminHelpCenter } from './adminFixtures';
import { useAiSuggestionCounts } from './useAiSuggestionCounts';

const OUT_OF_SCOPE = 'This isn’t part of the prototype.';

function VisibilityTag({ visibility }: { visibility: AdminHelpCenter['visibility'] }) {
  const internal = visibility === 'internal';
  return (
    <span className="box-border inline-flex shrink-0 items-center gap-[2px] rounded-[24px] border border-solid border-admin-tag-border bg-white py-[3px] pr-[7px] pl-[5px]">
      {/* The live lock sits in an 18px-tall box, so Internal tags are 26px
          tall and External (globe) tags 20px. */}
      <span className={cn('flex w-[12px] items-center justify-center', internal ? 'h-[18px]' : 'h-[12px]')}>
        <AdminIcon name={internal ? 'hcLock' : 'hcGlobe'} size={12} className="text-admin-tag-text" />
      </span>
      <span className="font-inter text-[13px] leading-[11px] font-normal tracking-[0.25px] text-admin-tag-text capitalize">
        {visibility}
      </span>
    </span>
  );
}

interface ActionProps {
  label: string;
  icon: AdminIconName;
  onClick: () => void;
}

function CardAction({ label, icon, onClick }: ActionProps) {
  return (
    <AdminTooltip content={label}>
      <button
        type="button"
        aria-label={label}
        onClick={onClick}
        className="m-0 flex size-[32px] cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0 outline-none transition-colors duration-150 hover:bg-admin-action-hover focus-visible:bg-admin-action-hover"
      >
        <AdminIcon name={icon} size={20} />
      </button>
    </AdminTooltip>
  );
}

function HelpCenterCard({ helpCenter, articlesToImprove }: { helpCenter: AdminHelpCenter; articlesToImprove: number }) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const isReplica = helpCenter.id === REPLICA_HELP_CENTER_ID;
  const openReplica = (path: string) => (isReplica ? navigate(path) : showToast(OUT_OF_SCOPE));

  return (
    <li className="box-border flex items-center gap-[19px] rounded-[5px] border border-solid border-admin-card-border p-[32px]">
      <AdminIcon name="hcFile" size={24} />
      <div className="flex min-w-0 flex-1 flex-col gap-[4px]">
        <div className="flex items-center gap-[12px] pt-[2px]">
          <span className="font-inter text-[14px] leading-[20px] font-semibold tracking-[0.23px] text-admin-title">
            {helpCenter.name}
          </span>
          <span className="flex items-center gap-[8px]">
            <VisibilityTag visibility={helpCenter.visibility} />
            {isReplica ? <AiSuggestionsChip articles={articlesToImprove} to={SUGGESTIONS_HUB_PATH} /> : null}
          </span>
        </div>
        <span className="font-inter text-[13px] leading-[18px] font-normal text-admin-meta">{helpCenter.meta}</span>
      </div>
      <div className="flex items-center gap-[24px]">
        <CardAction label="Open Help Center" icon="hcOpen" onClick={() => openReplica('/product')} />
        <CardAction
          label="Edit Help Center"
          icon="hcEdit"
          onClick={() => openReplica('/product/category/getting-started')}
        />
        <CardAction label="Delete Help Center" icon="hcDelete" onClick={() => showToast(OUT_OF_SCOPE)} />
      </div>
    </li>
  );
}

export function AdminHelpCenterPage() {
  const { showToast } = useToast();
  const { articles } = useAiSuggestionCounts();

  return (
    <div className="mx-auto box-border w-full max-w-[1230px] px-[67px] pt-[64px] pb-[64px]">
      <header className="flex h-[28px] items-center justify-between">
        {/* Live: icon 2px and title 3px below the 28px row's top, not centered. */}
        <h1 className="m-0 flex items-start gap-[8px] self-start p-0">
          <AdminIcon name="hcTitle" size={20} className="mt-[2px]" />
          <span className="mt-[3px] font-inter text-[16px] leading-[normal] font-semibold text-admin-title">
            Help Center
          </span>
        </h1>
        <button
          type="button"
          onClick={() => showToast(OUT_OF_SCOPE)}
          className="m-0 box-border flex h-[28px] cursor-pointer items-center rounded-[4px] border-0 bg-admin-primary px-[12px] py-[4px] font-open-sans text-[12px] leading-[20px] font-medium tracking-[0.4px] text-white outline-none transition-colors duration-[250ms] ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-admin-primary-hover focus-visible:shadow-[0_0_0_2px_#ffffff,0_0_0_4px_#506dff]"
        >
          {/* MUI startIcon: -2px left, 8px right. */}
          <AdminIcon name="add" size={14} className="mr-[8px] -ml-[2px] text-white" />
          Create Help Center
        </button>
      </header>

      <ul className="m-0 mt-[36px] flex list-none flex-col gap-[24px] p-0">
        {ADMIN_HELP_CENTERS.map((hc) => (
          <HelpCenterCard key={hc.id} helpCenter={hc} articlesToImprove={articles} />
        ))}
      </ul>
    </div>
  );
}
