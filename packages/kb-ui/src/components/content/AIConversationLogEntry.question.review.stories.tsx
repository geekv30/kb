import type { Meta, StoryObj } from '@storybook/react-vite';
import { RiSearchLine } from '@remixicon/react';
import '../../tokens.css';
import { ConversationRow } from './AIConversationLogEntryAtoms';
import { FigmaCompare } from '../../_review/FigmaCompare';
import logAtomQuestionFigma from '../../../../../design/screenshots/log-atom-question.png';
import { figmaNode } from './AIConversationLogEntry.question.figma';

/* ─────────────────────────────────────────────────────────────
 * AIConversationLogEntry — Question row (no feedback) review.
 *
 * Figma library-check cell `155:1781` (874 × 44): `#f1f5f9`
 * 28 × 28 round pill containing `RiSearchLine` (#475569) + the
 * question text only (no thumbs-up / no timestamp).
 * ───────────────────────────────────────────────────────────── */

const meta: Meta = {
  title: 'Review/Content/AIConversationLogEntry/Question',
  parameters: { layout: 'padded' },
  globals: { backgrounds: { value: 'white' } },
};
export default meta;

function QuestionReview() {
  return (
    <FigmaCompare
      storyKey="content-ai-conversation-log-entry-question"
      figmaImage={logAtomQuestionFigma}
      componentLabel="AIConversationLogEntry · Question (no feedback)"
      frameLabel="Figma · log-atoms / Question"
      figmaNodeUrl={`https://www.figma.com/design/${figmaNode.fileKey}/?node-id=${figmaNode.nodeId.replace(':', '-')}`}
    >
      <div className="font-sans" style={{ width: 874 }}>
        <ConversationRow
          hideConnectorAbove
          hideConnectorBelow
          iconPill
          icon={
            <RiSearchLine aria-hidden="true" className="h-4 w-4 text-[#475569]" />
          }
        >
          <p className="pt-[5px] text-[14px] font-medium leading-5 text-[#0f172a]">
            How do I reset my password if I can&apos;t access my recovery email?
          </p>
        </ConversationRow>
      </div>
    </FigmaCompare>
  );
}

export const Playground: StoryObj = {
  render: () => <QuestionReview />,
};
