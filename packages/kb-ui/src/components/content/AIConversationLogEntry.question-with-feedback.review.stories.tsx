import type { Meta, StoryObj } from '@storybook/react-vite';
import { SearchLg, ThumbsUp } from '@untitledui/icons';
import '../../tokens.css';
import { ConversationRow } from './AIConversationLogEntryAtoms';
import { FigmaCompare } from '../../_review/FigmaCompare';
import logAtomQuestionWithFeedbackFigma from '../../../../../design/screenshots/log-atom-question-with-feedback.png';
import { figmaNode } from './AIConversationLogEntry.question-with-feedback.figma';

/* ─────────────────────────────────────────────────────────────
 * AIConversationLogEntry — Question row WITH feedback review.
 *
 * Figma library-check cell `155:1793`: pilled question icon +
 * question text on the left, outline `ThumbsUp` (#086e3f)
 * + grey `|` separator + "Mar 31, 2:23 PM" (#475569) on the
 * right.
 * ───────────────────────────────────────────────────────────── */

const meta: Meta = {
  title: 'Review/Content/AIConversationLogEntry/Question with feedback',
  parameters: { layout: 'padded' },
  globals: { backgrounds: { value: 'white' } },
};
export default meta;

function QuestionWithFeedbackReview() {
  return (
    <FigmaCompare
      storyKey="content-ai-conversation-log-entry-question-with-feedback"
      figmaImage={logAtomQuestionWithFeedbackFigma}
      componentLabel="AIConversationLogEntry · Question (with feedback)"
      frameLabel="Figma · log-atoms / Question + feedback"
      figmaNodeUrl={`https://www.figma.com/design/${figmaNode.fileKey}/?node-id=${figmaNode.nodeId.replace(':', '-')}`}
    >
      <div className="font-sans" style={{ width: 874 }}>
        <ConversationRow
          hideConnectorAbove
          hideConnectorBelow
          iconPill
          icon={
            <SearchLg aria-hidden="true" className="h-4 w-4 text-[#475569]" />
          }
        >
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <p className="pt-[5px] text-[14px] font-medium leading-5 text-[#0f172a]">
                How do I reset my password if I can&apos;t access my recovery email?
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2 pt-[5px]">
              <ThumbsUp
                aria-hidden="true"
                className="h-3.5 w-3.5 text-[#086e3f]"
              />
              <span className="h-3 w-px bg-[#cbd5e1]" aria-hidden="true" />
              <span className="text-[13px] font-normal leading-[19px] text-[#475569]">
                Mar 31, 2:23 PM
              </span>
            </div>
          </div>
        </ConversationRow>
      </div>
    </FigmaCompare>
  );
}

export const Playground: StoryObj = {
  render: () => <QuestionWithFeedbackReview />,
};
