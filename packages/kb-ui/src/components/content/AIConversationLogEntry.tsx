// Figma: 251DTRmxl2L6jmXd3FWzHe#2045:9269 (AI Search & Conversation logs card)
import * as React from 'react';
import {
  RiQuestionLine,
  RiThumbUpFill,
  RiThumbDownFill,
  RiBookOpenLine,
  RiCornerDownRightLine,
  RiPriceTag3Line,
} from '@remixicon/react';
import { cn } from '../../utils/cn';
import { AiIcon } from '../brand/AiIcon';
import {
  SourcesSideSheet,
  type ConversationSource,
} from '../overlays/SourcesSideSheet';

/* ─────────────────────────────────────────────────────────────
 * Types
 * ───────────────────────────────────────────────────────────── */

export type AIConversationFeedback = 'positive' | 'negative' | null;

export type AIConversationTail =
  | { kind: 'ticket-created'; actor?: string }
  | { kind: 'source-clicked'; actor?: string };

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
};

/* ─────────────────────────────────────────────────────────────
 * Layout primitives
 *
 * Each entry is laid out as a vertical column of rows. Every row
 * uses `pl-6` (24 px) to reserve a fixed-width left rail; the
 * row's icon sits absolutely at `left-0` w-4 (16 px) inside the
 * rail. A single absolutely-positioned dotted vertical line on
 * the entry root spans top→bottom of the rail, drawn at
 * `left-[7px]` so it bisects the 16 px icon column.
 *
 * This "shared connector" approach is simpler than per-row
 * `:before` pseudo-elements because:
 *   1. The dotted line is one element, easy to start/stop at
 *      the right vertical positions.
 *   2. Icons are absolute → can vertically align to the row's
 *      first text line via `top-1` regardless of text wrapping.
 *   3. The follow-up row's "↳" corner-arrow visually breaks
 *      the line at the right place naturally — the icon's
 *      opaque BG (white card) sits over the dotted line.
 * ───────────────────────────────────────────────────────────── */

type RowProps = {
  icon: React.ReactNode;
  children: React.ReactNode;
  right?: React.ReactNode;
  /**
   * Extra top padding on the row — used to space rows apart.
   * The icon is positioned at `top-[2px]` to align with the
   * first line of text given Tailwind's default `leading-5`.
   */
  className?: string;
};

function Row({ icon, children, right, className }: RowProps) {
  return (
    <div className={cn('relative pl-6', className)}>
      {/* Icon column — absolute positioning means it does not
       * affect the row's text column flow, and aligns vertically
       * with the first line of text via `top-[2px]`. White bg
       * makes the icon "punch through" the dotted connector. */}
      <span
        aria-hidden="true"
        className="absolute left-0 top-[2px] inline-flex h-4 w-4 items-center justify-center bg-white"
      >
        {icon}
      </span>
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">{children}</div>
        {right ? <div className="flex shrink-0 items-center gap-2">{right}</div> : null}
      </div>
    </div>
  );
}

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
        <RiThumbUpFill
          aria-hidden="true"
          className="h-3.5 w-3.5 text-[#086e3f]"
        />
      ) : feedback === 'negative' ? (
        <RiThumbDownFill
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

/* Tail row — "↳ <icon> <Underlined> <suffix>" */
type TailRowProps = {
  tail: AIConversationTail;
};

function TailRow({ tail }: TailRowProps) {
  const actor = tail.actor ?? 'the user';

  if (tail.kind === 'ticket-created') {
    return (
      <Row
        icon={
          <RiCornerDownRightLine
            aria-hidden="true"
            className="h-4 w-4 text-[#64758b]"
          />
        }
      >
        <div className="flex items-center gap-2 pt-[1px]">
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
      </Row>
    );
  }

  // source-clicked
  return (
    <Row
      icon={
        <RiCornerDownRightLine
          aria-hidden="true"
          className="h-4 w-4 text-[#64758b]"
        />
      }
    >
      <div className="flex items-center gap-2 pt-[1px]">
        <RiBookOpenLine
          aria-hidden="true"
          className="h-4 w-4 shrink-0 text-[#475569]"
        />
        <span className="text-[13px] font-normal leading-[19px] text-[#475569]">
          <span className="text-[#0f172a] underline underline-offset-2">Source</span>{' '}
          clicked by {actor}
        </span>
      </div>
    </Row>
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
       * are `bg-white` so they appear to break the line cleanly.
       * `inset-y-5` matches the entry's `py-5` so the line spans
       * from just below the question icon to just above the last
       * tail icon. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-5 left-[7.5px] border-l border-dashed border-[#cbd5e1]"
      />

      {/* Row 1 — Question + (feedback | timestamp) */}
      <Row
        icon={
          <RiQuestionLine
            aria-hidden="true"
            className="h-4 w-4 text-[#475569]"
          />
        }
        right={<FeedbackTimestamp feedback={feedback} timestamp={timestamp} />}
      >
        <p className="pt-[1px] text-[14px] font-medium leading-5 text-[#0f172a]">
          {question}
        </p>
      </Row>

      {/* Row 2 — AI sparkle + answer */}
      <Row icon={<AiIcon size={16} />}>
        <p
          className={cn(
            'pt-[1px] text-[14px] font-normal leading-5',
            answerDisabled ? 'text-[#94a3b8]' : 'text-[#0f172a]',
          )}
        >
          {answer}
        </p>
      </Row>

      {/* Row 3 — Sources link (optional) */}
      {sourceCount > 0 ? (
        <Row
          icon={
            <RiBookOpenLine
              aria-hidden="true"
              className="h-4 w-4 text-[#475569]"
            />
          }
        >
          <div className="pt-[1px]">
            <SourcesLink count={sourceCount} onClick={() => openSheet(sources)} />
          </div>
        </Row>
      ) : null}

      {/* Follow-up sub-thread (optional) */}
      {followUp ? (
        <>
          {/* Row 4 — "↳ follow up : Q <question text>" */}
          <Row
            icon={
              <RiCornerDownRightLine
                aria-hidden="true"
                className="h-4 w-4 text-[#64758b]"
              />
            }
          >
            <div className="flex items-center gap-2 pt-[1px]">
              <span className="text-[13px] font-normal leading-[19px] text-[#475569]">
                follow up :
              </span>
              <RiQuestionLine
                aria-hidden="true"
                className="h-4 w-4 shrink-0 text-[#475569]"
              />
              <span className="text-[14px] font-medium leading-5 text-[#0f172a]">
                {followUp.question}
              </span>
            </div>
          </Row>

          {/* Row 5 — Follow-up AI answer */}
          <Row icon={<AiIcon size={16} />}>
            <p className="pt-[1px] text-[14px] font-normal leading-5 text-[#0f172a]">
              {followUp.answer}
            </p>
          </Row>

          {/* Row 6 — Follow-up sources */}
          {followUp.sourceCount > 0 ? (
            <Row
              icon={
                <RiBookOpenLine
                  aria-hidden="true"
                  className="h-4 w-4 text-[#475569]"
                />
              }
            >
              <div className="pt-[1px]">
                <SourcesLink
                  count={followUp.sourceCount}
                  onClick={() => openSheet(followUp.sources)}
                />
              </div>
            </Row>
          ) : null}

          {/* Row 7 — Follow-up tail row */}
          {followUp.tail ? <TailRow tail={followUp.tail} /> : null}
        </>
      ) : null}

      {/* Tail row at end of entry (when no follow-up wraps it) */}
      {tail ? <TailRow tail={tail} /> : null}

      {/* "view all" link — outside the rail, sits below the entry */}
      {showViewAll ? (
        <div className="pl-6">
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
