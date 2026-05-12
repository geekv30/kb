import type { Meta, StoryObj } from '@storybook/react-vite';
import { BookOpen01 } from '@untitledui/icons';
import '../../tokens.css';
import { ConversationRow } from './AIConversationLogEntryAtoms';
import { FigmaCompare } from '../../_review/FigmaCompare';
import logAtomSourcesFigma from '../../../../../design/screenshots/log-atom-sources.png';
import { figmaNode } from './AIConversationLogEntry.sources.figma';

/* ─────────────────────────────────────────────────────────────
 * AIConversationLogEntry — Sources link row review.
 *
 * Figma library-check cell `156:1947` (874 × 24): bare book-open
 * icon + "3 Sources" underlined link in `#0f172a`.
 * ───────────────────────────────────────────────────────────── */

const meta: Meta = {
  title: 'Review/Content/AIConversationLogEntry/Sources',
  parameters: { layout: 'padded' },
  globals: { backgrounds: { value: 'white' } },
};
export default meta;

function SourcesReview() {
  return (
    <FigmaCompare
      storyKey="content-ai-conversation-log-entry-sources"
      figmaImage={logAtomSourcesFigma}
      componentLabel="AIConversationLogEntry · Sources link"
      frameLabel="Figma · log-atoms / Sources"
      figmaNodeUrl={`https://www.figma.com/design/${figmaNode.fileKey}/?node-id=${figmaNode.nodeId.replace(':', '-')}`}
    >
      <div className="font-sans" style={{ width: 874 }}>
        <ConversationRow
          hideConnectorAbove
          hideConnectorBelow
          icon={
            <BookOpen01
              aria-hidden="true"
              className="h-4 w-4 text-[#475569]"
            />
          }
        >
          <span className="text-[14px] font-normal leading-5 text-[#0f172a] underline underline-offset-2">
            3 Sources
          </span>
        </ConversationRow>
      </div>
    </FigmaCompare>
  );
}

export const Playground: StoryObj = {
  render: () => <SourcesReview />,
};
