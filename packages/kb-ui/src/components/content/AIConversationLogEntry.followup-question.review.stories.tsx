import type { Meta, StoryObj } from '@storybook/react-vite';
import { RiCornerDownRightLine, RiSearchLine } from '@remixicon/react';
import '../../tokens.css';
import { ConversationRow } from './AIConversationLogEntryAtoms';
import { FigmaCompare } from '../../_review/FigmaCompare';
import logAtomFollowupQuestionFigma from '../../../../../design/screenshots/log-atom-followup-question.png';
import { figmaNode } from './AIConversationLogEntry.followup-question.figma';

/* ─────────────────────────────────────────────────────────────
 * AIConversationLogEntry — Follow-up question row review.
 *
 * Figma library-check cell `156:3934` (874 × 24): corner-arrow
 * + "follow up" + ":" separator + bare search icon + the
 * follow-up question text.
 * ───────────────────────────────────────────────────────────── */

const meta: Meta = {
  title: 'Review/Content/AIConversationLogEntry/Followup question',
  parameters: { layout: 'padded' },
  globals: { backgrounds: { value: 'white' } },
};
export default meta;

function FollowupQuestionReview() {
  return (
    <FigmaCompare
      storyKey="content-ai-conversation-log-entry-followup-question"
      figmaImage={logAtomFollowupQuestionFigma}
      componentLabel="AIConversationLogEntry · Follow-up question"
      frameLabel="Figma · log-atoms / Follow-up question"
      figmaNodeUrl={`https://www.figma.com/design/${figmaNode.fileKey}/?node-id=${figmaNode.nodeId.replace(':', '-')}`}
    >
      <div className="font-sans" style={{ width: 874 }}>
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
              How do i do this and that?
            </span>
          </div>
        </ConversationRow>
      </div>
    </FigmaCompare>
  );
}

export const Playground: StoryObj = {
  render: () => <FollowupQuestionReview />,
};
