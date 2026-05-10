import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { ConversationRow } from './AIConversationLogEntryAtoms';
import { AiIcon } from '../brand/AiIcon';
import { FigmaCompare } from '../../_review/FigmaCompare';
import logAtomAnswerFigma from '../../../../../design/screenshots/log-atom-answer.png';
import { figmaNode } from './AIConversationLogEntry.answer.figma';

/* ─────────────────────────────────────────────────────────────
 * AIConversationLogEntry — AI answer row review.
 *
 * Figma library-check cell `155:1809` (874 × 24): bare AI sparkle
 * (no pill) + answer text in `#0f172a`.
 * ───────────────────────────────────────────────────────────── */

const meta: Meta = {
  title: 'Review/Content/AIConversationLogEntry/Answer',
  parameters: { layout: 'padded' },
  globals: { backgrounds: { value: 'white' } },
};
export default meta;

function AnswerReview() {
  return (
    <FigmaCompare
      storyKey="content-ai-conversation-log-entry-answer"
      figmaImage={logAtomAnswerFigma}
      componentLabel="AIConversationLogEntry · Answer"
      frameLabel="Figma · log-atoms / Answer"
      figmaNodeUrl={`https://www.figma.com/design/${figmaNode.fileKey}/?node-id=${figmaNode.nodeId.replace(':', '-')}`}
    >
      <div className="font-sans" style={{ width: 874 }}>
        <ConversationRow
          hideConnectorAbove
          hideConnectorBelow
          icon={<AiIcon size={16} />}
        >
          <p className="pt-[1px] text-[14px] font-normal leading-5 text-[#0f172a]">
            Outlined the 3-step account recovery process via billing info and support contact.
          </p>
        </ConversationRow>
      </div>
    </FigmaCompare>
  );
}

export const Playground: StoryObj = {
  render: () => <AnswerReview />,
};
