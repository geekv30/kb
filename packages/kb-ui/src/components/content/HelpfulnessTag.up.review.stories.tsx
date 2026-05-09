import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { HelpfulnessTag } from './HelpfulnessTag';
import { FigmaCompare } from '../../_review/FigmaCompare';
import helpfulnessTagUpFigma from '../../../../../design/screenshots/helpfulness-tag-up.png';
import { figmaNode } from './HelpfulnessTag.up.figma';

/* ─────────────────────────────────────────────────────────────
 * HelpfulnessTag — "up" variant review canvas (Phase 15d.B).
 *
 * Figma library-check cell `155:259` renders a hug-content pill:
 *   bg #f2fcf6, text #086e3f, "91%", radius 6, py 2px, px 8px.
 *
 * The production component carries min-w-[40px] so percentages
 * line up cleanly in analytics columns; the Figma library cell
 * shows the pill's natural hug width (~36 px logical). For
 * pixel parity here we override the minimum to 0.
 * ───────────────────────────────────────────────────────────── */

const meta: Meta<typeof HelpfulnessTag> = {
  title: 'Review/Content/HelpfulnessTag/Up',
  component: HelpfulnessTag,
  parameters: { layout: 'padded' },
  globals: { backgrounds: { value: 'white' } },
};
export default meta;

function HelpfulnessTagUpReview() {
  return (
    <FigmaCompare
      storyKey="content-helpfulness-tag-up"
      figmaImage={helpfulnessTagUpFigma}
      componentLabel="HelpfulnessTag (up)"
      frameLabel="Figma · library-check / up"
      figmaNodeUrl={`https://www.figma.com/design/${figmaNode.fileKey}/?node-id=${figmaNode.nodeId.replace(':', '-')}`}
    >
      <div className="font-sans">
        <HelpfulnessTag value="91%" variant="up" className="min-w-0" />
      </div>
    </FigmaCompare>
  );
}

export const Playground: StoryObj<typeof HelpfulnessTag> = {
  render: () => <HelpfulnessTagUpReview />,
};
