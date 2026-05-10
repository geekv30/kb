// Figma: 251DTRmxl2L6jmXd3FWzHe#2045:9269 (AI Search & Conversation logs card)
// Atoms (per-row library-check): 9aGp5t9fH1d0PXi4LMhOdb#155:1594
import * as React from 'react';
import {
  RiSearchLine,
  RiThumbUpLine,
  RiThumbDownLine,
  RiBookOpenLine,
  RiCornerDownRightLine,
  RiCursorAiLine,
  RiPriceTag3Line,
  RiFileTextLine,
} from '@remixicon/react';
import { cn } from '../../utils/cn';
import { AiIcon } from '../brand/AiIcon';
import {
  SourcesSideSheet,
  type ConversationSource,
} from '../overlays/SourcesSideSheet';
import { ConversationRow } from './AIConversationLogEntryAtoms';

/* ─────────────────────────────────────────────────────────────
 * Types
 * ───────────────────────────────────────────────────────────── */

export type AIConversationFeedback = 'positive' | 'negative' | null;

export type AIConversationTail =
  | { kind: 'ticket-created'; actor?: string }
  | { kind: 'source-clicked'; actor?: string }
  | { kind: 'search-result-clicked'; actor?: string };

export type AIConversationFollowUp = {
  question: string;
  answer: string;
  sourceCount: number;
  /** Follow-up sources — passed to SourcesSideSheet on click. */
  sources?: ConversationSource[];
  /** Trailing tail row inside the follow-up. */
  tail?: AIConversationTail;
};

export type AIConversationLogEntryProps = {
  question: string;
  /** Pre-formatted timestamp ("Mar 31, 2:23 PM"). */
  timestamp: string;
  /** Thumbs-up = positive, thumbs-down = negative, null = no feedback shown. */
  feedback: AIConversationFeedback;
  /** AI answer text, or null when AI failed (caller should provide a fallback string in that case). */
  answer: string | null;
  /**
   * When `true`, render the answer in disabled grey (#94a3b8). Used for the
   * "AI could not provide an answer" entry.
   */
  answerDisabled?: boolean;
  /** Number of sources — when > 0, render the "N Sources" link. */
  sourceCount: number;
  /** Sources data — passed to SourcesSideSheet when the user clicks "N Sources". */
  sources?: ConversationSource[];
  /** Optional follow-up sub-thread. */
  followUp?: AIConversationFollowUp;
  /** Optional tail (for entries without follow-up — or appended after follow-up). */
  tail?: AIConversationTail;
  /** When set, renders a "view all" link at the bottom of the entry. */
  showViewAll?: boolean;
  onViewAll?: () => void;
  className?: string;
  rows?: React.ReactNode[];
};

/* ─────────────────────────────────────────────────────────────
 * Layout primitives
 *
 * Each entry is laid out as a vertical column of rows. Every row
 * uses `pl-9` (36 px) to reserve a 28 px icon column + 8 px gap;
 * the row's icon sits absolutely at `left-0` w-7 (28 px) inside
 * the rail. A single absolutely-positioned dotted vertical line
 * on the entry root spans top→bottom of the rail, drawn at
 * `left-[13.5px]` so it bisects the 28 px icon column.
 *
 * This "shared connector" approach is simpler than per-row
 * `:before` pseudo-elements because:
 *   1. The dotted line is one element, easy to start/stop at
 *      the right vertical positions.
 *   2. Icons are absolute → can vertically align to the row's
 *      first text line via `top-[2px]` regardless of text wrapping.
 *   3. The follow-up row's "↳" corner-arrow visually breaks
 *      the line at the right place naturally — the icon's
 *      opaque BG (white card) sits over the dotted line.
 *
 * Row chrome (the rail's icon column + content cell) is provided
 * by the `ConversationRow` atom in `./AIConversationLogEntryAtoms`.
 * Because this entry uses the shared connector on the root, every
 * `ConversationRow` here passes `hideConnectorAbove` AND
 * `hideConnectorBelow` so the atom does not draw its own per-row
 * connector segments on top of the shared one.
 * ───────────────────────────────────────────────────────────── */

/* ─────────────────────────────────────────────────────────────
 * Atoms — feedback glyph, sources link, tail rows
 * ───────────────────────────────────────────────────────────── */

function FeedbackTimestamp({
  feedback,
  timestamp,
}: {
  feedback: AIConversationFeedback;
  timestamp: string;
}) {
  return (
    <div className="flex items-center gap-2">
      {feedback === 'positive' ? (
        <RiThumbUpLine
          aria-hidden="true"
          className="h-3.5 w-3.5 text-[#086e3f]"
        />
      ) : feedback === 'negative' ? (
        <RiThumbDownLine
          aria-hidden="true"
          className="h-3.5 w-3.5 text-[#d52c1f]"
        />
      ) : null}
      {feedback ? <span className="h-3 w-px bg-[#cbd5e1]" aria-hidden="true" /> : null}
      <span className="text-[13px] font-normal leading-[19px] text-[#475569]">
        {timestamp}
      </span>
    </div>
  );
}

type SourcesLinkProps = {
  count: number;
  onClick: () => void;
};

function SourcesLink({ count, onClick }: SourcesLinkProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-kb-part="ai-conversation-log-sources-link"
      className={cn(
        'text-left text-[14px] font-normal leading-5 text-[#0f172a] underline underline-offset-2',
        'hover:text-[#0f172a]/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/10 focus-visible:rounded-[2px]',
      )}
    >
      {count} Sources
    </button>
  );
}

/* Tail row — "(cursor-ai) · <icon> <Underlined> <suffix>"
 *
 * Per Figma library-check (`156:3922`, `156:3943`, `156:3965`),
 * tail rows lead with a cursor-ai icon (clicking/sparkle), a
 * separator dot `·`, then the secondary icon + text. The
 * "Ticket" / "Source" / "search result" subject phrase appears
 * underlined for the actionable tails (ticket-created and
 * source-clicked) and unstyled for `search-result-clicked`
 * matching the Figma cell verbatim.
 */
type TailRowProps = {
  tail: AIConversationTail;
};

function TailRow({ tail }: TailRowProps) {
  const actor = tail.actor ?? 'the user';

  if (tail.kind === 'ticket-created') {
    return (
      <ConversationRow
        hideConnectorAbove
        hideConnectorBelow
        icon={
          <RiCursorAiLine
            aria-hidden="true"
            className="h-4 w-4 text-[#64758b]"
          />
        }
      >
        <div className="flex items-center gap-2 pt-[1px]">
          <span aria-hidden="true" className="text-[14px] leading-5 text-[#64758b]">·</span>
          <RiPriceTag3Line
            aria-hidden="true"
            className="h-4 w-4 shrink-0 text-[#475569]"
          />
          <span className="text-[13px] font-normal leading-[19px] text-[#475569]">
            <span className="text-[#0f172a] underline underline-offset-2">
              Ticket
            </span>{' '}
            created by {actor}
          </span>
        </div>
      </ConversationRow>
    );
  }

  if (tail.kind === 'source-clicked') {
    return (
      <ConversationRow
        hideConnectorAbove
        hideConnectorBelow
        icon={
          <RiCursorAiLine
            aria-hidden="true"
            className="h-4 w-4 text-[#64758b]"
          />
        }
      >
        <div className="flex items-center gap-2 pt-[1px]">
          <span aria-hidden="true" className="text-[14px] leading-5 text-[#64758b]">·</span>
          <RiBookOpenLine
            aria-hidden="true"
            className="h-4 w-4 shrink-0 text-[#475569]"
          />
          <span className="text-[13px] font-normal leading-[19px] text-[#475569]">
            <span className="text-[#0f172a] underline underline-offset-2">Source</span>{' '}
            clicked by {actor}
          </span>
        </div>
      </ConversationRow>
    );
  }

  // search-result-clicked
  return (
    <ConversationRow
      hideConnectorAbove
      hideConnectorBelow
      icon={
        <RiCursorAiLine
          aria-hidden="true"
          className="h-4 w-4 text-[#64758b]"
        />
      }
    >
      <div className="flex items-center gap-2 pt-[1px]">
        <span aria-hidden="true" className="text-[14px] leading-5 text-[#64758b]">·</span>
        <RiFileTextLine
          aria-hidden="true"
          className="h-4 w-4 shrink-0 text-[#475569]"
        />
        <span className="text-[13px] font-normal leading-[19px] text-[#475569]">
          search result clicked by {actor}
        </span>
      </div>
    </ConversationRow>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Main component
 * ───────────────────────────────────────────────────────────── */

export function AIConversationLogEntry({
  question,
  timestamp,
  feedback,
  answer,
  answerDisabled,
  sourceCount,
  sources,
  followUp,
  tail,
  showViewAll,
  onViewAll,
  className,
  rows,
}: AIConversationLogEntryProps) {
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [activeSources, setActiveSources] = React.useState<ConversationSource[]>(
    sources ?? [],
  );

  const openSheet = (sourcesForSheet?: ConversationSource[]) => {
    setActiveSources(sourcesForSheet && sourcesForSheet.length > 0 ? sourcesForSheet : sources ?? []);
    setSheetOpen(true);
  };

  return (
    <div
      data-kb-component="ai-conversation-log-entry"
      className={cn('relative flex flex-col gap-3 py-5', className)}
    >
      {/* Shared dotted connector — runs full height of the entry's
       * left rail, behind the icon glyphs. The icon glyph wrappers
       * are `bg-white` (or pill-coloured) so they appear to break
       * the line cleanly. `inset-y-5` matches the entry's `py-5`
       * so the line spans from just below the question icon to
       * just above the last tail icon. Axis at `left-[13.5px]`
       * (center of the 28-px icon column). */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-5 left-[13.5px] border-l border-dashed border-[#94a3b8]"
      />

      {rows !== undefined ? (
        <div className="flex flex-col gap-3">{rows}</div>
      ) : (
        <>
      {/* Row 1 — Question + (feedback | timestamp) */}
      <ConversationRow
        hideConnectorAbove
        hideConnectorBelow
        iconPill
        icon={
          <RiSearchLine
            aria-hidden="true"
            className="h-4 w-4 text-[#475569]"
          />
        }
      >
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <p className="pt-[5px] text-[14px] font-medium leading-5 text-[#0f172a]">
              {question}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2 pt-[5px]">
            <FeedbackTimestamp feedback={feedback} timestamp={timestamp} />
          </div>
        </div>
      </ConversationRow>

      {/* Row 2 — AI sparkle + answer */}
      <ConversationRow hideConnectorAbove hideConnectorBelow icon={<AiIcon size={16} />}>
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <p
              className={cn(
                'pt-[1px] text-[14px] font-normal leading-5',
                answerDisabled ? 'text-[#94a3b8]' : 'text-[#0f172a]',
              )}
            >
              {answer}
            </p>
          </div>
        </div>
      </ConversationRow>

      {/* Row 3 — Sources link (optional) */}
      {sourceCount > 0 ? (
        <ConversationRow
          hideConnectorAbove
          hideConnectorBelow
          icon={
            <RiBookOpenLine
              aria-hidden="true"
              className="h-4 w-4 text-[#475569]"
            />
          }
        >
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <div className="pt-[1px]">
                <SourcesLink count={sourceCount} onClick={() => openSheet(sources)} />
              </div>
            </div>
          </div>
        </ConversationRow>
      ) : null}

      {/* Follow-up sub-thread (optional) */}
      {followUp ? (
        <>
          {/* Row 4 — "↳ follow up : Q <question text>" */}
          <ConversationRow
            hideConnectorAbove
            hideConnectorBelow
            icon={
              <RiCornerDownRightLine
                aria-hidden="true"
                className="h-4 w-4 text-[#64758b]"
              />
            }
          >
            <div className="flex items-center gap-2 pt-[1px]">
              <span className="text-[13px] font-normal leading-[19px] text-[#475569]">
                follow up
              </span>
              <span aria-hidden="true" className="text-[13px] leading-[19px] text-[#475569]">:</span>
              <RiSearchLine
                aria-hidden="true"
                className="h-4 w-4 shrink-0 text-[#475569]"
              />
              <span className="text-[14px] font-medium leading-5 text-[#0f172a]">
                {followUp.question}
              </span>
            </div>
          </ConversationRow>

          {/* Row 5 — Follow-up AI answer */}
          <ConversationRow hideConnectorAbove hideConnectorBelow icon={<AiIcon size={16} />}>
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <p className="pt-[1px] text-[14px] font-normal leading-5 text-[#0f172a]">
                  {followUp.answer}
                </p>
              </div>
            </div>
          </ConversationRow>

          {/* Row 6 — Follow-up sources */}
          {followUp.sourceCount > 0 ? (
            <ConversationRow
              hideConnectorAbove
              hideConnectorBelow
              icon={
                <RiBookOpenLine
                  aria-hidden="true"
                  className="h-4 w-4 text-[#475569]"
                />
              }
            >
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <div className="pt-[1px]">
                    <SourcesLink
                      count={followUp.sourceCount}
                      onClick={() => openSheet(followUp.sources)}
                    />
                  </div>
                </div>
              </div>
            </ConversationRow>
          ) : null}

          {/* Row 7 — Follow-up tail row */}
          {followUp.tail ? <TailRow tail={followUp.tail} /> : null}
        </>
      ) : null}

      {/* Tail row at end of entry (when no follow-up wraps it) */}
      {tail ? <TailRow tail={tail} /> : null}
        </>
      )}

      {/* "view all" link — outside the rail, sits below the entry */}
      {showViewAll ? (
        <div className="pl-9">
          <button
            type="button"
            onClick={onViewAll}
            className={cn(
              'text-[14px] font-normal leading-5 text-[#0f172a] underline underline-offset-2',
              'hover:text-[#0f172a]/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/10 focus-visible:rounded-[2px]',
            )}
          >
            view all
          </button>
        </div>
      ) : null}

      {/* Sources side-sheet — entry-owned state */}
      <SourcesSideSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        sources={activeSources}
      />
    </div>
  );
}
