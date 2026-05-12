import type { Meta, StoryObj } from '@storybook/react-vite';
import { Cursor02, Tag01 } from '@untitledui/icons';
import '../../tokens.css';
import { ConversationRow } from './AIConversationLogEntryAtoms';
import { FigmaCompare } from '../../_review/FigmaCompare';
import logAtomTailTicketFigma from '../../../../../design/screenshots/log-atom-tail-ticket.png';
import { figmaNode } from './AIConversationLogEntry.tail-ticket.figma';

/* ─────────────────────────────────────────────────────────────
 * AIConversationLogEntry — Tail · Ticket created review.
 *
 * Figma library-check cell `156:3922` (874 × 24): cursor-ai +
 * `·` separator + price-tag icon + "Ticket created by the user"
 * (with "Ticket" underlined).
 * ───────────────────────────────────────────────────────────── */

const meta: Meta = {
  title: 'Review/Content/AIConversationLogEntry/Tail Ticket',
  parameters: { layout: 'padded' },
  globals: { backgrounds: { value: 'white' } },
};
export default meta;

function TailTicketReview() {
  return (
    <FigmaCompare
      storyKey="content-ai-conversation-log-entry-tail-ticket"
      figmaImage={logAtomTailTicketFigma}
      componentLabel="AIConversationLogEntry · Tail · Ticket created"
      frameLabel="Figma · log-atoms / Tail · Ticket created"
      figmaNodeUrl={`https://www.figma.com/design/${figmaNode.fileKey}/?node-id=${figmaNode.nodeId.replace(':', '-')}`}
    >
      <div className="font-sans" style={{ width: 874 }}>
        <ConversationRow
          hideConnectorAbove
          hideConnectorBelow
          icon={
            <Cursor02
              aria-hidden="true"
              className="h-4 w-4 text-[#64748b]"
            />
          }
        >
          <div className="flex items-center gap-2 pt-[1px]">
            <span aria-hidden="true" className="text-[14px] leading-5 text-[#64748b]">·</span>
            <Tag01
              aria-hidden="true"
              className="h-4 w-4 shrink-0 text-[#475569]"
            />
            <span className="text-[13px] font-normal leading-[19px] text-[#475569]">
              <span className="text-[#0f172a] underline underline-offset-2">Ticket</span>{' '}
              created by the user
            </span>
          </div>
        </ConversationRow>
      </div>
    </FigmaCompare>
  );
}

export const Playground: StoryObj = {
  render: () => <TailTicketReview />,
};
