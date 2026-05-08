import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { Breadcrumb } from './Breadcrumb';
import { FigmaCompare } from '../../_review/FigmaCompare';
import breadcrumbFigma from '../../../../../design/screenshots/breadcrumb.png';
import { figmaNode } from './Breadcrumb.figma';

const meta: Meta<typeof Breadcrumb> = {
  title: 'Review/Primitives/Breadcrumb',
  component: Breadcrumb,
  parameters: { layout: 'padded' },
  globals: { backgrounds: { value: 'white' } },
};
export default meta;

function BreadcrumbReview() {
  return (
    <FigmaCompare
      storyKey="primitives-breadcrumb"
      figmaImage={breadcrumbFigma}
      componentLabel="Breadcrumb"
      frameLabel="Figma · Breadcrumb library"
      figmaNodeUrl={`https://www.figma.com/design/${figmaNode.fileKey}/?node-id=${figmaNode.nodeId.replace(':', '-')}`}
    >
      <div
        className="font-sans"
        style={{
          position: 'relative',
          width: 938,
          height: 54,
        }}
      >
        {/* Breadcrumb instance at (22, 16) inside the 938x54 container per Figma metadata */}
        <div style={{ position: 'absolute', left: 22, top: 16 }}>
          <Breadcrumb
            items={[
              { id: 'home', label: 'Home', onClick: () => {} },
              { id: 'getting-started', label: 'Getting Started' },
            ]}
          />
        </div>
      </div>
    </FigmaCompare>
  );
}

export const Playground: StoryObj<typeof Breadcrumb> = {
  render: () => <BreadcrumbReview />,
};
