import type { Meta, StoryObj } from '@storybook/react-vite';
import { BookOpen01, Cursor02 } from '@untitledui/icons';
import '../../tokens.css';
import { ConversationRow } from './AIConversationLogEntryAtoms';
import { FigmaCompare } from '../../_review/FigmaCompare';
import logAtomTailSourceClickedFigma from '../../../../../design/screenshots/log-atom-tail-source-clicked.png';
import { figmaNode } from './AIConversationLogEntry.tail-source-clicked.figma';

/* ─────────────────────────────────────────────────────────────
 * AIConversationLogEntry — Tail · Source clicked review.
 *
 * Figma library-check cell `156:3943` (874 × 24): cursor-ai +
 * `·` separator + book-open icon + "Source clicked by the user"
 * (with "Source" underlined).
 * ───────────────────────────────────────────────────────────── */

const meta: Meta = {
  title: 'Review/Content/AIConversationLogEntry/Tail Source clicked',
  parameters: { layout: 'padded' },
  globals: { backgrounds: { value: 'white' } },
};
export default meta;

function TailSourceClickedReview() {
  return (
    <FigmaCompare
      storyKey="content-ai-conversation-log-entry-tail-source-clicked"
      figmaImage={logAtomTailSourceClickedFigma}
      componentLabel="AIConversationLogEntry · Tail · Source clicked"
      frameLabel="Figma · log-atoms / Tail · Source clicked"
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
            <BookOpen01
              aria-hidden="true"
              className="h-4 w-4 shrink-0 text-[#475569]"
            />
            <span className="text-[13px] font-normal leading-[19px] text-[#475569]">
              <span className="text-[#0f172a] underline underline-offset-2">Source</span>{' '}
              clicked by the user
            </span>
          </div>
        </ConversationRow>
      </div>
    </FigmaCompare>
  );
}

export const Playground: StoryObj = {
  render: () => <TailSourceClickedReview />,
};
