import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { Badge } from './Badge';
import { FigmaCompare } from '../../_review/FigmaCompare';
import badgeFigma from '../../../../../design/screenshots/tag.png';
import { figmaNode } from './Badge.figma';

const meta: Meta<typeof Badge> = {
  title: 'Review/Primitives/Badge',
  component: Badge,
  parameters: { layout: 'padded' },
  globals: { backgrounds: { value: 'white' } },
};
export default meta;

function BadgeReview() {
  return (
    <FigmaCompare
      storyKey="primitives-badge"
      figmaImage={badgeFigma}
      componentLabel="Badge"
      frameLabel="Figma · Tag library"
      figmaNodeUrl={`https://www.figma.com/design/${figmaNode.fileKey}/?node-id=${figmaNode.nodeId.replace(':', '-')}`}
    >
      <div
        className="font-sans"
        style={{
          position: 'relative',
          width: 172,
          height: 153,
        }}
      >
        {/* Published — Figma container at (37, 49) */}
        <div style={{ position: 'absolute', left: 37, top: 49 }}>
          <Badge variant="published">Published</Badge>
        </div>
        {/* Draft — Figma container at (37, 94) */}
        <div style={{ position: 'absolute', left: 37, top: 94 }}>
          <Badge variant="draft">Draft</Badge>
        </div>
      </div>
    </FigmaCompare>
  );
}

export const Playground: StoryObj<typeof Badge> = {
  render: () => <BadgeReview />,
};
