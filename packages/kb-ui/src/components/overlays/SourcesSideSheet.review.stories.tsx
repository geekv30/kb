import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { SourcesSideSheet, type ConversationSource } from './SourcesSideSheet';
import { FigmaCompare } from '../../_review/FigmaCompare';
import sourcesFigmaImg from '../../../../../design/screenshots/sources-sidesheet.png';
import { figmaNode } from './SourcesSideSheet.figma';

const meta: Meta<typeof SourcesSideSheet> = {
  title: 'Review/Overlays/SourcesSideSheet',
  component: SourcesSideSheet,
  parameters: { layout: 'padded' },
  globals: { backgrounds: { value: 'white' } },
};
export default meta;

/* Realistic Hiver-style support conversations — matches PRD §13.5 ("Cannot
 * log in after password reset") and the senders shown in the Figma raster. */
const sources: ConversationSource[] = [
  {
    id: 'conv-1',
    senderName: 'Ava Johnson',
    senderEmail: 'ava.johnson@northwind.example',
    timestamp: 'Feb 4, 2:45 PM',
    subject: "I can't log into my account.",
    snippet:
      "I'm experiencing syncing problems on my devices. My data is not loading after I reset my password.",
  },
  {
    id: 'conv-2',
    senderName: 'Sophie Lee',
    senderEmail: 'sophie.lee@brightlabs.example',
    timestamp: 'Feb 4, 9:45 PM',
    subject: "I can't log into my account.",
    snippet:
      "I'm having trouble syncing my devices. My data is not appearing on my phone after the password reset.",
  },
  {
    id: 'conv-3',
    senderName: 'Emma Garcia',
    senderEmail: 'emma.garcia@helio.example',
    timestamp: 'Feb 4, 4:45 PM',
    subject: "I can't log into my account.",
    snippet:
      "I'm facing syncing issues on my devices. My data is missing after I changed my password yesterday.",
  },
  {
    id: 'conv-4',
    senderName: 'Emma Johnson',
    senderEmail: 'emma.johnson@orbit.example',
    timestamp: 'February 4, 1:45 PM',
    subject: "I'm unable to access my account.",
    snippet:
      "I'm experiencing syncing issues on my devices. My account does not load after the password reset flow.",
  },
];

/* Width + height match the Figma frame (973 × 603 at 1×). The sheet is
 * docked to the right at width 400 — the rest of the frame is the dimmed
 * editor backdrop behind the sheet (the `bg-black/85` wash that the portal
 * Overlay renders in production). */
const FRAME_W = 973;
const FRAME_H = 603;
const SHEET_W = 400;

function SourcesSideSheetReview() {
  return (
    <FigmaCompare
      storyKey="overlays-sources-side-sheet"
      figmaImage={sourcesFigmaImg}
      componentLabel="SourcesSideSheet"
      frameLabel="Figma · Sources side sheet"
      figmaNodeUrl={`https://www.figma.com/design/${figmaNode.fileKey}/?node-id=${figmaNode.nodeId.replace(':', '-')}`}
      componentBackground="transparent"
    >
      <div
        data-kb-review="sources-side-sheet-frame"
        className="relative bg-black/85"
        style={{ width: FRAME_W, height: FRAME_H }}
      >
        {/* Right-docked inline sheet — uses the canonical
         * `SourcesSideSheet` with the new `inline` prop, so the chrome
         * here is byte-identical to production (no recreated markup). */}
        <div
          className="absolute inset-y-0 right-0"
          style={{ width: SHEET_W }}
        >
          <SourcesSideSheet
            open
            onOpenChange={() => {}}
            sources={sources}
            inline
          />
        </div>
      </div>
    </FigmaCompare>
  );
}

export const Default: StoryObj<typeof SourcesSideSheet> = {
  render: () => <SourcesSideSheetReview />,
};
