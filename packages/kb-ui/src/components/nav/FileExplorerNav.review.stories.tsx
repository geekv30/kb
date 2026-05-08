import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import '../../tokens.css';
import { FileExplorerNav, type NavItem } from './FileExplorerNav';
import { FigmaCompare } from '../../_review/FigmaCompare';
import fileExplorerNavFigma from '../../../../../design/screenshots/file-explorer-nav.png';
import { figmaNode } from './FileExplorerNav.figma';

const meta: Meta<typeof FileExplorerNav> = {
  title: 'Review/Navigation/FileExplorerNav',
  component: FileExplorerNav,
  parameters: { layout: 'padded' },
  globals: { backgrounds: { value: 'white' } },
};
export default meta;

// Tree mirrors the Figma raster: "Getting Started" (active, expanded) with
// 3 nested folders + 1 article, then a long flat list of sibling categories.
const tree: NavItem[] = [
  {
    type: 'folder',
    id: 'getting-started',
    title: 'Getting Started',
    count: 12,
    children: [
      { type: 'folder', id: 'gs-setup', title: 'Setting up Hiver in G...', count: 2, children: [] },
      { type: 'folder', id: 'gs-first', title: 'First Steps', count: 7, children: [] },
      { type: 'folder', id: 'gs-settings', title: 'Hiver Settings', count: 3, children: [] },
      { type: 'article', id: 'gs-syncing', title: 'Syncing past emails whil...', status: 'published' },
    ],
  },
  { type: 'folder', id: 'multi-channel', title: 'Offer Multi-channel Sup...', count: 9, children: [] },
  { type: 'folder', id: 'automate', title: 'Automate Workflows', count: 8, children: [] },
  { type: 'folder', id: 'sla', title: 'Manage SLA Policies', count: 8, children: [] },
  { type: 'folder', id: 'collab', title: 'Collaborating with your t...', count: 5, children: [] },
  { type: 'folder', id: 'hiver-ai', title: 'Hiver AI', count: 3, children: [] },
  { type: 'folder', id: 'self-service', title: 'Enable self-service', count: 6, children: [] },
  { type: 'folder', id: 'crm-1', title: 'Manage customer relatio...', count: 12, children: [] },
  { type: 'folder', id: 'crm-2', title: 'Manage customer relatio...', count: 12, children: [] },
  { type: 'folder', id: 'reporting', title: 'Reporting and analytics', count: 12, children: [] },
  { type: 'folder', id: 'apps', title: 'Apps and integrations', count: 12, children: [] },
];

function FileExplorerNavReview() {
  const [activeId, setActiveId] = useState<string>('getting-started');
  return (
    <FigmaCompare
      storyKey="navigation-file-explorer-nav"
      figmaImage={fileExplorerNavFigma}
      componentLabel="FileExplorerNav"
      frameLabel="Figma · Article explorer / option 11"
      figmaNodeUrl={`https://www.figma.com/design/${figmaNode.fileKey}/?node-id=${figmaNode.nodeId.replace(':', '-')}`}
    >
      <div className="font-sans" style={{ width: 288, height: 635 }}>
        <FileExplorerNav
          theme="light"
          title="Editor"
          items={tree}
          activeId={activeId}
          onItemClick={setActiveId}
          variant="tree"
          showSearch
        />
      </div>
    </FigmaCompare>
  );
}

export const Playground: StoryObj<typeof FileExplorerNav> = {
  render: () => <FileExplorerNavReview />,
};
