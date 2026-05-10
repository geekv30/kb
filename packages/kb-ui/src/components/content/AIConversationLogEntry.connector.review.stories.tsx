import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { FigmaCompare } from '../../_review/FigmaCompare';
import logAtomConnectorFigma from '../../../../../design/screenshots/log-atom-connector.png';
import { figmaNode } from './AIConversationLogEntry.connector.figma';

/* ─────────────────────────────────────────────────────────────
 * AIConversationLogEntry — Connector segment review.
 *
 * Figma library-check cell `155:1805` (874 × 17): the dashed
 * vertical connector spacer that appears between rows when an
 * entry has no row body in that slot. Color #94a3b8, axis at
 * left-[13.5px] (matching the parent connector in the entry).
 * ───────────────────────────────────────────────────────────── */

const meta: Meta = {
  title: 'Review/Content/AIConversationLogEntry/Connector',
  parameters: { layout: 'padded' },
  globals: { backgrounds: { value: 'white' } },
};
export default meta;

function ConnectorReview() {
  return (
    <FigmaCompare
      storyKey="content-ai-conversation-log-entry-connector"
      figmaImage={logAtomConnectorFigma}
      componentLabel="AIConversationLogEntry · Connector segment"
      frameLabel="Figma · log-atoms / Connector"
      figmaNodeUrl={`https://www.figma.com/design/${figmaNode.fileKey}/?node-id=${figmaNode.nodeId.replace(':', '-')}`}
    >
      <div className="font-sans" style={{ width: 874 }}>
        {/* Single dashed vertical line — 17 px tall, axis at the
         * 28-px icon column's center (left-[13.5px]). */}
        <div className="relative h-[17px]">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-[13.5px] border-l border-dashed border-[#94a3b8]"
          />
        </div>
      </div>
    </FigmaCompare>
  );
}

export const Playground: StoryObj = {
  render: () => <ConnectorReview />,
};
