import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import {
  AnalyticsSideNav,
  type AnalyticsSideNavItem,
} from './AnalyticsSideNav';

const meta: Meta<typeof AnalyticsSideNav> = {
  title: 'Components/Navigation/Analytics Side Nav',
  component: AnalyticsSideNav,
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj<typeof AnalyticsSideNav>;

const items: AnalyticsSideNavItem[] = [
  { id: 'views', label: 'Article Views and Engagement' },
  { id: 'search', label: 'Search' },
  { id: 'ai', label: 'AI Answer Performance' },
];

export const Default: Story = {
  render: () => (
    <div className="flex h-screen">
      <AnalyticsSideNav items={items} activeId="ai" />
    </div>
  ),
};

export const ArticleActive: Story = {
  render: () => (
    <div className="flex h-screen">
      <AnalyticsSideNav items={items} activeId="views" />
    </div>
  ),
};

export const Interactive: Story = {
  render: () => {
    const [activeId, setActiveId] = React.useState<string>('ai');
    return (
      <div className="flex h-screen">
        <AnalyticsSideNav
          items={items}
          activeId={activeId}
          onItemClick={setActiveId}
        />
      </div>
    );
  },
};
