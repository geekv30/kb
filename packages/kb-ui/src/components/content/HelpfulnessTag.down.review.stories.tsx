import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { HelpfulnessTag } from './HelpfulnessTag';
import { FigmaCompare } from '../../_review/FigmaCompare';
import helpfulnessTagDownFigma from '../../../../../design/screenshots/helpfulness-tag-down.png';
import { figmaNode } from './HelpfulnessTag.down.figma';

/* ─────────────────────────────────────────────────────────────
 * HelpfulnessTag — "down" variant review canvas (Phase 15d.B).
 *
 * Figma library-check cell `155:258` renders a hug-content pill:
 *   bg #fff7f5, text #d52c1f, "24%", radius 6, py 2px, px 8px.
 *
 * The production component carries min-w-[40px] so percentages
 * line up cleanly in analytics columns; the Figma library cell
 * shows the pill's natural hug width (~37 px logical). For
 * pixel parity here we override the minimum to 0.
 * ───────────────────────────────────────────────────────────── */

const meta: Meta<typeof HelpfulnessTag> = {
  title: 'Review/Content/HelpfulnessTag/Down',
  component: HelpfulnessTag,
  parameters: { layout: 'padded' },
  globals: { backgrounds: { value: 'white' } },
};
export default meta;

function HelpfulnessTagDownReview() {
  return (
    <FigmaCompare
      storyKey="content-helpfulness-tag-down"
      figmaImage={helpfulnessTagDownFigma}
      componentLabel="HelpfulnessTag (down)"
      frameLabel="Figma · library-check / down"
      figmaNodeUrl={`https://www.figma.com/design/${figmaNode.fileKey}/?node-id=${figmaNode.nodeId.replace(':', '-')}`}
    >
      <div className="font-sans">
        <HelpfulnessTag value="24%" variant="down" className="min-w-0" />
      </div>
    </FigmaCompare>
  );
}

export const Playground: StoryObj<typeof HelpfulnessTag> = {
  render: () => <HelpfulnessTagDownReview />,
};
