import type { Meta, StoryObj } from '@storybook/react-vite';
import { Plus, ArrowUp } from '@untitledui/icons';
import '../../tokens.css';
import { Button } from './Button';
import { FigmaCompare } from '../../_review/FigmaCompare';
import buttonFigma from '../../../../../design/screenshots/button.png';
import { figmaNode } from './Button.figma';

const meta: Meta<typeof Button> = {
  title: 'Review/Primitives/Button',
  component: Button,
  parameters: { layout: 'padded' },
  globals: { backgrounds: { value: 'white' } },
};
export default meta;

function ButtonReview() {
  return (
    <FigmaCompare
      storyKey="primitives-button"
      figmaImage={buttonFigma}
      componentLabel="Button"
      frameLabel="Figma · Button library"
      figmaNodeUrl={`https://www.figma.com/design/${figmaNode.fileKey}/?node-id=${figmaNode.nodeId.replace(':', '-')}`}
    >
      <div
        className="grid font-sans"
        style={{
          gridTemplateColumns: 'auto auto auto',
          columnGap: 11,
          rowGap: 14,
          justifyContent: 'start',
          alignItems: 'start',
          padding: '44px 39px',
          width: 357,
          height: 166,
        }}
      >
        <Button variant="primary" icon={<Plus size={14} />} onClick={() => {}}>
          New
        </Button>
        <Button variant="subtle" icon={<ArrowUp size={14} />} onClick={() => {}}>
          Button
        </Button>
        <Button variant="danger" icon={<ArrowUp size={14} />} onClick={() => {}}>
          Button
        </Button>

        <div />
        <Button variant="outline" icon={<ArrowUp size={14} />} onClick={() => {}}>
          Button
        </Button>
        <Button variant="danger-outline" icon={<ArrowUp size={14} />} onClick={() => {}}>
          Button
        </Button>
      </div>
    </FigmaCompare>
  );
}

export const Playground: StoryObj<typeof Button> = {
  render: () => <ButtonReview />,
};
