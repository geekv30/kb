import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { FigmaCompare } from '../../_review/FigmaCompare';
import logAtomViewAllFigma from '../../../../../design/screenshots/log-atom-view-all.png';
import { figmaNode } from './AIConversationLogEntry.view-all.figma';

/* ─────────────────────────────────────────────────────────────
 * AIConversationLogEntry — View all link review.
 *
 * Figma library-check cell `156:3957` (874 × 24): plain
 * underlined "view all" text in `#0f172a`. NOT a chip with
 * leading/trailing icons — the spec table description was
 * incorrect; the synced PNG shows a bare underlined link.
 * ───────────────────────────────────────────────────────────── */

const meta: Meta = {
  title: 'Review/Content/AIConversationLogEntry/View all',
  parameters: { layout: 'padded' },
  globals: { backgrounds: { value: 'white' } },
};
export default meta;

function ViewAllReview() {
  return (
    <FigmaCompare
      storyKey="content-ai-conversation-log-entry-view-all"
      figmaImage={logAtomViewAllFigma}
      componentLabel="AIConversationLogEntry · View all"
      frameLabel="Figma · log-atoms / View all"
      figmaNodeUrl={`https://www.figma.com/design/${figmaNode.fileKey}/?node-id=${figmaNode.nodeId.replace(':', '-')}`}
    >
      <div className="font-sans" style={{ width: 874 }}>
        <button
          type="button"
          className="text-[14px] font-normal leading-5 text-[#0f172a] underline underline-offset-2"
        >
          view all
        </button>
      </div>
    </FigmaCompare>
  );
}

export const Playground: StoryObj = {
  render: () => <ViewAllReview />,
};
