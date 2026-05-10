import type { Meta, StoryObj } from '@storybook/react-vite';
import { RiCursorAiLine, RiFileTextLine } from '@remixicon/react';
import '../../tokens.css';
import { ConversationRow } from './AIConversationLogEntryAtoms';
import { FigmaCompare } from '../../_review/FigmaCompare';
import logAtomTailSearchResultClickedFigma from '../../../../../design/screenshots/log-atom-tail-search-result-clicked.png';
import { figmaNode } from './AIConversationLogEntry.tail-search-result-clicked.figma';

/* ─────────────────────────────────────────────────────────────
 * AIConversationLogEntry — Tail · Search result clicked review.
 *
 * Figma library-check cell `156:3965` (874 × 24): cursor-ai +
 * `·` separator + document icon + "search result clicked by the
 * user" (no underline; lowercase per Figma — the cell labels
 * this asymmetric on purpose vs Ticket / Source).
 * ───────────────────────────────────────────────────────────── */

const meta: Meta = {
  title: 'Review/Content/AIConversationLogEntry/Tail Search result clicked',
  parameters: { layout: 'padded' },
  globals: { backgrounds: { value: 'white' } },
};
export default meta;

function TailSearchResultClickedReview() {
  return (
    <FigmaCompare
      storyKey="content-ai-conversation-log-entry-tail-search-result-clicked"
      figmaImage={logAtomTailSearchResultClickedFigma}
      componentLabel="AIConversationLogEntry · Tail · Search result clicked"
      frameLabel="Figma · log-atoms / Tail · Search result clicked"
      figmaNodeUrl={`https://www.figma.com/design/${figmaNode.fileKey}/?node-id=${figmaNode.nodeId.replace(':', '-')}`}
    >
      <div className="font-sans" style={{ width: 874 }}>
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
              search result clicked by the user
            </span>
          </div>
        </ConversationRow>
      </div>
    </FigmaCompare>
  );
}

export const Playground: StoryObj = {
  render: () => <TailSearchResultClickedReview />,
};
