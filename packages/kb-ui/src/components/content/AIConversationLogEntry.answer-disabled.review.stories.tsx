import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { ConversationRow } from './AIConversationLogEntryAtoms';
import { AiIcon } from '../brand/AiIcon';
import { FigmaCompare } from '../../_review/FigmaCompare';
import logAtomAnswerDisabledFigma from '../../../../../design/screenshots/log-atom-answer-disabled.png';
import { figmaNode } from './AIConversationLogEntry.answer-disabled.figma';

/* ─────────────────────────────────────────────────────────────
 * AIConversationLogEntry — AI answer disabled review.
 *
 * Figma library-check cell `156:3961` (874 × 24): bare AI sparkle
 * (low-opacity / disabled) + "AI could not provide an answer" in
 * `#94a3b8`.
 * ───────────────────────────────────────────────────────────── */

const meta: Meta = {
  title: 'Review/Content/AIConversationLogEntry/Answer disabled',
  parameters: { layout: 'padded' },
  globals: { backgrounds: { value: 'white' } },
};
export default meta;

function AnswerDisabledReview() {
  return (
    <FigmaCompare
      storyKey="content-ai-conversation-log-entry-answer-disabled"
      figmaImage={logAtomAnswerDisabledFigma}
      componentLabel="AIConversationLogEntry · Answer disabled"
      frameLabel="Figma · log-atoms / Answer disabled"
      figmaNodeUrl={`https://www.figma.com/design/${figmaNode.fileKey}/?node-id=${figmaNode.nodeId.replace(':', '-')}`}
    >
      <div className="font-sans" style={{ width: 874 }}>
        <ConversationRow
          hideConnectorAbove
          hideConnectorBelow
          icon={
            <span className="opacity-40">
              <AiIcon size={16} />
            </span>
          }
        >
          <p className="pt-[1px] text-[14px] font-normal leading-5 text-[#94a3b8]">
            AI could not provide an answer
          </p>
        </ConversationRow>
      </div>
    </FigmaCompare>
  );
}

export const Playground: StoryObj = {
  render: () => <AnswerDisabledReview />,
};
