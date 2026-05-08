import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { Avatar } from './Avatar';
import { FigmaCompare } from '../../_review/FigmaCompare';
import avatarFigma from '../../../../../design/screenshots/avatar.png';
import { figmaNode } from './Avatar.figma';

const meta: Meta<typeof Avatar> = {
  title: 'Review/Primitives/Avatar',
  component: Avatar,
  parameters: { layout: 'padded' },
  globals: { backgrounds: { value: 'white' } },
};
export default meta;

function AvatarReview() {
  return (
    <FigmaCompare
      storyKey="primitives-avatar"
      figmaImage={avatarFigma}
      componentLabel="Avatar"
      frameLabel="Figma · Avatar library"
      figmaNodeUrl={`https://www.figma.com/design/${figmaNode.fileKey}/?node-id=${figmaNode.nodeId.replace(':', '-')}`}
    >
      <div
        className="font-sans"
        style={{
          width: 24,
          height: 24,
        }}
      >
        <Avatar initials="A" name="A" />
      </div>
    </FigmaCompare>
  );
}

export const Playground: StoryObj<typeof Avatar> = {
  render: () => <AvatarReview />,
};
