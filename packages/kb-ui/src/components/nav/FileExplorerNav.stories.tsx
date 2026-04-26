import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { FileExplorerNav, type NavItem } from './FileExplorerNav';

const meta: Meta<typeof FileExplorerNav> = {
  title: 'Components/Navigation/FileExplorerNav',
  component: FileExplorerNav,
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj<typeof FileExplorerNav>;

// Realistic KB tree: 3 levels of nesting + articles at multiple depths.
const tree: NavItem[] = [
  // Root-level article (depth 0)
  {
    type: 'article',
    id: 'changelog',
    title: 'Changelog',
    status: 'published',
  },
  {
    type: 'folder',
    id: 'getting-started',
    title: 'Getting Started',
    count: 4,
    children: [
      { type: 'article', id: 'gs-intro', title: 'Introduction', status: 'published' },
      { type: 'article', id: 'gs-install', title: 'Installation', status: 'published' },
      { type: 'article', id: 'gs-quick', title: 'Quick Start', status: 'draft' },
      {
        type: 'folder',
        id: 'gs-tutorials',
        title: 'Tutorials',
        count: 3,
        children: [
          { type: 'article', id: 'tut-first-article', title: 'Your first article', status: 'published' },
          { type: 'article', id: 'tut-organize', title: 'Organizing content', status: 'published' },
          { type: 'article', id: 'tut-publish', title: 'Publishing workflows', status: 'draft' },
        ],
      },
    ],
  },
  {
    type: 'folder',
    id: 'product',
    title: 'Product Documentation',
    count: 5,
    children: [
      {
        type: 'folder',
        id: 'product-inbox',
        title: 'Shared Inbox',
        count: 3,
        children: [
          { type: 'article', id: 'inbox-overview', title: 'Inbox overview', status: 'published' },
          { type: 'article', id: 'inbox-assignments', title: 'Assigning conversations', status: 'published' },
          { type: 'article', id: 'inbox-snooze', title: 'Snoozing threads', status: 'draft' },
        ],
      },
      {
        type: 'folder',
        id: 'product-automations',
        title: 'Automations',
        count: 2,
        children: [
          { type: 'article', id: 'auto-rules', title: 'Rule-based automations', status: 'published' },
          { type: 'article', id: 'auto-ai', title: 'AI-powered routing', status: 'draft' },
        ],
      },
    ],
  },
  {
    type: 'folder',
    id: 'advanced',
    title: 'Advanced',
    count: 2,
    children: [
      { type: 'article', id: 'adv-perf', title: 'Performance tuning', status: 'published' },
      { type: 'article', id: 'adv-hooks', title: 'Custom webhooks guide', status: 'draft' },
    ],
  },
  {
    type: 'folder',
    id: 'api-reference',
    title: 'API Reference',
    count: 0,
    children: [],
  },
];

export const Light: Story = {
  render: () => (
    <div style={{ height: '100vh', display: 'flex' }}>
      <FileExplorerNav theme="light" title="Editor" items={tree} activeId="tut-organize" />
    </div>
  ),
};

export const ActiveFolder: Story = {
  render: () => (
    <div style={{ height: '100vh', display: 'flex' }}>
      <FileExplorerNav theme="light" title="Editor" items={tree} activeId="product-inbox" />
    </div>
  ),
};

export const RootArticleActive: Story = {
  render: () => (
    <div style={{ height: '100vh', display: 'flex' }}>
      <FileExplorerNav theme="light" title="Editor" items={tree} activeId="changelog" />
    </div>
  ),
};

// Figma variant: `.menu-items` set State=default — no row active, all folders collapsed.
// Covers the zero-selection initial state otherwise missing from the current story set.
export const Default: Story = {
  render: () => (
    <div style={{ height: '100vh', display: 'flex' }}>
      <FileExplorerNav theme="light" title="Editor" items={tree} />
    </div>
  ),
};
