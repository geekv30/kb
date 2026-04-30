import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { KBBreadcrumbBar } from './KBBreadcrumbBar';
import { EditorBreadcrumbActions } from './EditorBreadcrumbActions';

const meta: Meta<typeof KBBreadcrumbBar> = {
  title: 'Components/Navigation/KB Breadcrumb Bar',
  component: KBBreadcrumbBar,
  parameters: { layout: 'fullscreen' },
  globals: { backgrounds: { value: 'canvas' } },
};
export default meta;

function KBBreadcrumbBarPlayground() {
  return (
    <div className="font-sans">
      <KBBreadcrumbBar
        sidebarCollapsed={false}
        items={[
          { id: '1', label: 'Offer Multi-channel Support' },
          { id: '2', label: 'Managing emails' },
          { id: '3', label: 'Search, filter, and create email views' },
        ]}
        actions={
          <EditorBreadcrumbActions
            onSaveAsDraft={() => {}}
            onPublish={() => {}}
            onClose={() => {}}
            publishDisabled={false}
          />
        }
      />
      <div className="bg-white p-6" style={{ height: 320 }}>
        <p className="text-[14px] leading-5 text-[#64748b]">
          Article body goes here…
        </p>
      </div>
    </div>
  );
}

export const Playground: StoryObj<typeof KBBreadcrumbBar> = {
  render: () => <KBBreadcrumbBarPlayground />,
};
