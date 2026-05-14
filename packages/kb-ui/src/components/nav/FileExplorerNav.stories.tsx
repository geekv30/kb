import type { Meta, StoryObj } from '@storybook/react-vite';
import * as React from 'react';
import { DotsVertical } from '@untitledui/icons';
import '../../tokens.css';
import { FileExplorerNav, type NavItem } from './FileExplorerNav';

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

// Walk the tree to resolve the active item's title for the right-pane label.
function findTitle(items: NavItem[], id: string): string | null {
  for (const item of items) {
    if (item.id === id) return item.title;
    if (item.children && item.children.length > 0) {
      const sub = findTitle(item.children, id);
      if (sub) return sub;
    }
  }
  return null;
}

function FileExplorerNavPlayground() {
  const [activeId, setActiveId] = React.useState<string>('tut-organize');
  const activeTitle = findTitle(tree, activeId) ?? activeId;

  return (
    <div className="flex h-screen">
      <FileExplorerNav
        title="Editor"
        items={tree}
        activeId={activeId}
        onItemClick={(id) => setActiveId(id)}
        variant="tree"
        showSearch={true}
      />
      <div className="flex-1 bg-[#f5f5f5] flex items-center justify-center">
        <span className="text-[14px] text-[#64748b]">
          Editing: {activeTitle}
        </span>
      </div>
    </div>
  );
}

const meta: Meta<typeof FileExplorerNav> = {
  title: 'Components/Navigation/FileExplorerNav',
  component: FileExplorerNav,
  parameters: { layout: 'fullscreen' },
  globals: { backgrounds: { value: 'canvas' } },
};
export default meta;

export const Playground: StoryObj<typeof FileExplorerNav> = {
  render: () => <FileExplorerNavPlayground />,
};

/* ─────────────────────────────────────────────────────────────
 * WithRowActions — demonstrates the `renderRowAction` prop:
 * a per-row 3-dot button that reveals on hover, replacing the
 * count badge (folders) / status dot (articles). Click stops
 * propagation so it does not trigger row navigation.
 * ───────────────────────────────────────────────────────────── */
function FileExplorerNavWithRowActions() {
  const [activeId, setActiveId] = React.useState<string>('tut-organize');
  const activeTitle = findTitle(tree, activeId) ?? activeId;

  return (
    <div className="flex h-screen">
      <FileExplorerNav
        title="Editor"
        items={tree}
        activeId={activeId}
        onItemClick={(id) => setActiveId(id)}
        variant="tree"
        renderRowAction={(item) => (
          <button
            type="button"
            aria-label="Open menu"
            className="flex h-7 w-7 items-center justify-center rounded-[4px] hover:bg-[#f1f5f9] text-text-meta"
            onClick={(e) => {
              e.stopPropagation();
              // eslint-disable-next-line no-console
              console.log('row menu', item.id);
            }}
          >
            <DotsVertical className="h-4 w-4" />
          </button>
        )}
      />
      <div className="flex-1 bg-[#f5f5f5] flex items-center justify-center">
        <span className="text-[14px] text-[#64748b]">
          Editing: {activeTitle}
        </span>
      </div>
    </div>
  );
}

export const WithRowActions: StoryObj<typeof FileExplorerNav> = {
  render: () => <FileExplorerNavWithRowActions />,
};
