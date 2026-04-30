import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { SideSheet } from './SideSheet';

const meta: Meta<typeof SideSheet> = {
  title: 'Components/Overlays/Side Sheet',
  component: SideSheet,
  parameters: { layout: 'fullscreen' },
};
export default meta;

export const Default: StoryObj<typeof SideSheet> = {
  render: () => {
    const [open, setOpen] = React.useState(false);
    return (
      <div className="p-6">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-[6px] border border-[#e5e5e5] bg-white px-3 py-2 text-[14px] font-medium text-[#0f172a] hover:bg-[#f8fafc]"
        >
          Open side sheet
        </button>
        <SideSheet
          open={open}
          onOpenChange={setOpen}
          title="Citations"
          count={3}
        >
          <div className="flex flex-col gap-3">
            <div className="rounded-[8px] border border-[#e5e5e5] p-3 text-[14px]">
              Citation 1
            </div>
            <div className="rounded-[8px] border border-[#e5e5e5] p-3 text-[14px]">
              Citation 2
            </div>
            <div className="rounded-[8px] border border-[#e5e5e5] p-3 text-[14px]">
              Citation 3
            </div>
          </div>
        </SideSheet>
      </div>
    );
  },
};
