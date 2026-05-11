import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { SideSheet } from './SideSheet';

const meta: Meta<typeof SideSheet> = {
  title: 'Components/Overlays/Side Sheet',
  component: SideSheet,
  parameters: { layout: 'fullscreen' },
  globals: { backgrounds: { value: 'canvas' } },
};
export default meta;

const SAMPLE_CITATIONS = [
  {
    senderName: 'Ava Johnson',
    timestamp: 'Feb 4, 2:45 PM',
    subject: "I can't log into my account.",
    snippet: "I'm experiencing syncing problems on my devices....",
  },
  {
    senderName: 'Sophie Lee',
    timestamp: 'Feb 4, 9:45 PM',
    subject: "I can't log into my account.",
    snippet: "I'm having trouble syncing my devices. My data is...",
  },
  {
    senderName: 'Emma Garcia',
    timestamp: 'Feb 4, 4:45 PM',
    subject: "I can't log into my account.",
    snippet: "I'm facing syncing issues on my devices. My data i...",
  },
];

function SideSheetPlayground() {
  const [open, setOpen] = React.useState(true);
  return (
    <div className="bg-[#f5f5f5] min-h-screen p-6">
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
        title="Sources"
        count={3}
      >
        <div className="flex flex-col gap-3">
          {SAMPLE_CITATIONS.map((citation) => (
            <div
              key={citation.senderName}
              className="rounded-[8px] border border-[#e5e5e5] p-3 flex flex-col gap-1"
            >
              <div className="text-[12px] text-[#64748b] flex items-center gap-2">
                <span>{citation.senderName}</span>
                <span>·</span>
                <span>{citation.timestamp}</span>
              </div>
              <div className="text-[14px] font-medium text-[#0f172a]">
                {citation.subject}
              </div>
              <div className="text-[13px] text-[#475569] truncate">
                {citation.snippet}
              </div>
            </div>
          ))}
        </div>
      </SideSheet>
    </div>
  );
}

export const Playground: StoryObj<typeof SideSheet> = {
  render: () => <SideSheetPlayground />,
};
