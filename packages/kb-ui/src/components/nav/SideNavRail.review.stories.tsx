import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { RiQuillPenLine, RiSettings5Line } from '@remixicon/react';
import '../../tokens.css';
import { SideNavRail } from './SideNavRail';
import { Avatar } from '../primitives/Avatar';
import { CompanyLogo } from '../brand/CompanyLogo';
import { AiIcon } from '../brand/AiIcon';
import { FigmaCompare } from '../../_review/FigmaCompare';
import sideNavRailFigma from '../../../../../design/screenshots/side-nav-rail.png';
import { figmaNode } from './SideNavRail.figma';

const meta: Meta<typeof SideNavRail> = {
  title: 'Review/Navigation/SideNavRail',
  component: SideNavRail,
  parameters: { layout: 'padded' },
  globals: { backgrounds: { value: 'white' } },
};
export default meta;

const items = [
  { id: 'ai', icon: <AiIcon size={16} />, label: 'AI' },
  { id: 'editor', icon: <RiQuillPenLine size={16} />, label: 'Editor' },
  { id: 'settings', icon: <RiSettings5Line size={16} />, label: 'Settings' },
];

function SideNavRailReview() {
  const [activeId, setActiveId] = useState<string>('editor');
  return (
    <FigmaCompare
      storyKey="navigation-side-nav-rail"
      figmaImage={sideNavRailFigma}
      componentLabel="SideNavRail"
      frameLabel="Figma · Side nav / option 12"
      figmaNodeUrl={`https://www.figma.com/design/${figmaNode.fileKey}/?node-id=${figmaNode.nodeId.replace(':', '-')}`}
    >
      <div className="font-sans" style={{ width: 54, height: 635 }}>
        <SideNavRail
          theme="light"
          items={items}
          activeId={activeId}
          onItemClick={setActiveId}
          brandLogo={<CompanyLogo size={24} />}
          bottomSlot={<Avatar initials="VK" />}
        />
      </div>
    </FigmaCompare>
  );
}

export const Playground: StoryObj<typeof SideNavRail> = {
  render: () => <SideNavRailReview />,
};
