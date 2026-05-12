import type { Meta, StoryObj } from '@storybook/react-vite';
import { Plus, MessageSquare02 } from '@untitledui/icons';
import '../../tokens.css';
import { PageHeader } from './PageHeader';
import { Button } from '../primitives/Button';
import { FigmaCompare } from '../../_review/FigmaCompare';
import pageHeaderFigma from '../../../../../design/screenshots/page-header.png';
import { figmaNode } from './PageHeader.figma';

const meta: Meta<typeof PageHeader> = {
  title: 'Review/Shell/PageHeader',
  component: PageHeader,
  parameters: { layout: 'padded' },
  globals: { backgrounds: { value: 'white' } },
};
export default meta;

// Mirror the Figma raster icon — node `1:5439` ships a purple "slack" glyph
// in the dashed-square. The production PageHeader forces the icon span to
// 22×22; we hand it a Remix Slack glyph so review reflects what shipped.
function CategoryGlyph() {
  return <MessageSquare02 style={{ color: '#6634ef' }} />;
}

function PageHeaderReview() {
  return (
    <FigmaCompare
      storyKey="shell-page-header"
      figmaImage={pageHeaderFigma}
      componentLabel="PageHeader"
      frameLabel="Figma · Page header"
      figmaNodeUrl={`https://www.figma.com/design/${figmaNode.fileKey}/?node-id=${figmaNode.nodeId.replace(':', '-')}`}
    >
      {/* Figma frame is 938×58 with 24px horizontal inset (icon at x=24, CTA
          right edge at x=914). The production PageHeader has no built-in
          horizontal padding, so we apply it on the wrapper. */}
      <div
        className="font-sans"
        style={{ width: 938, height: 58, paddingLeft: 24, paddingRight: 24 }}
      >
        <PageHeader
          size="md"
          icon={<CategoryGlyph />}
          title="Getting Started"
          subtitle="Set up your account and get familiar with the basics"
          cta={
            <Button variant="primary" icon={<Plus size={14} />} onClick={() => {}}>
              New
            </Button>
          }
        />
      </div>
    </FigmaCompare>
  );
}

export const Playground: StoryObj<typeof PageHeader> = {
  render: () => <PageHeaderReview />,
};
