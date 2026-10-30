import { editedBadge } from '../../assets/legacy';
import { Tooltip } from './Tooltip';

/** Live tooltip on the "Edited" badge and the table's warning glyph. */
export const UNPUBLISHED_EDITS_TOOLTIP = 'There are edits on this article that are not published yet';

/** The warning triangle, verbatim from the live `editedIcons.svg` (drawn at x 8.86–21.14, y 5.46–16.25). */
const WARNING_PATH =
  'M15.5047 5.74965L21.0615 15.3746C21.1127 15.4633 21.1397 15.5639 21.1397 15.6663C21.1397 15.7687 21.1127 15.8693 21.0615 15.958C21.0103 16.0467 20.9367 16.1203 20.848 16.1715C20.7593 16.2227 20.6588 16.2496 20.5564 16.2496H9.44269C9.3403 16.2496 9.23971 16.2227 9.15103 16.1715C9.06236 16.1203 8.98872 16.0467 8.93752 15.958C8.88633 15.8693 8.85937 15.7687 8.85938 15.6663C8.85938 15.5639 8.88633 15.4633 8.93753 15.3746L14.4944 5.74965C14.5456 5.66098 14.6192 5.58735 14.7079 5.53615C14.7965 5.48496 14.8971 5.45801 14.9995 5.45801C15.1019 5.45801 15.2025 5.48496 15.2912 5.53615C15.3799 5.58735 15.4535 5.66098 15.5047 5.74965ZM10.453 15.083H19.546L14.9995 7.20798L10.453 15.083ZM14.4162 13.333H15.5829V14.4996H14.4162V13.333ZM14.4162 9.24965H15.5829V12.1663H14.4162V9.24965Z';

export interface EditedBadgeProps {
  /** Hiver AI's changes are among the unpublished edits: "Edited by AI". */
  byAI?: boolean;
  tooltip: string;
}

/**
 * Editor top bar badge for an article with unpublished edits. "Edited" is
 * the live 74x22 asset; "Edited by AI" redraws it at the same geometry
 * (#EF9542 fill, 2px radius, white warning glyph + 13px medium label).
 */
export function EditedBadge({ byAI = false, tooltip }: EditedBadgeProps) {
  return (
    <Tooltip content={tooltip} placement="bottom-center" className="cursor-default">
      {byAI ? (
        <span className="box-border flex h-[22px] items-center gap-[6px] rounded-[2px] bg-[#EF9542] pr-[9px] pl-[9px] font-inter text-[13px] leading-[22px] font-medium whitespace-nowrap text-white">
          <svg width={12.28} height={10.79} viewBox="8.86 5.46 12.28 10.79" aria-hidden className="block shrink-0">
            <path d={WARNING_PATH} fill="white" />
          </svg>
          Edited by AI
        </span>
      ) : (
        <img src={editedBadge} alt="Edited" width={74} height={22} className="block" />
      )}
    </Tooltip>
  );
}
