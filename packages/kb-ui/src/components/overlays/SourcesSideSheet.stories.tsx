import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import {
  SourcesSideSheet,
  SourcesSideSheetMailItem,
  type ConversationSource,
} from './SourcesSideSheet';

const SAMPLE_SOURCES: ConversationSource[] = [
  {
    id: '1',
    senderName: 'Ava Johnson',
    timestamp: 'Feb 4, 2:45 PM',
    subject: "I can't log into my account.",
    snippet: "I'm experiencing syncing problems on my devices....",
  },
  {
    id: '2',
    senderName: 'Sophie Lee',
    timestamp: 'Feb 4, 9:45 PM',
    subject: "I can't log into my account.",
    snippet: "I'm having trouble syncing my devices. My data is...",
  },
  {
    id: '3',
    senderName: 'Emma Garcia',
    timestamp: 'Feb 4, 4:45 PM',
    subject: "I can't log into my account.",
    snippet: "I'm facing syncing issues on my devices. My data i...",
  },
  {
    id: '4',
    senderName: 'Emma Johnson',
    timestamp: 'February 4, 1:45 PM',
    subject: "I'm unable to access my account.",
    snippet: "I'm experiencing syncing issues on my devices. M...",
  },
];

const meta: Meta<typeof SourcesSideSheet> = {
  title: 'Components/Overlays/Sources Side Sheet',
  component: SourcesSideSheet,
  parameters: { layout: 'fullscreen' },
  args: {
    open: true,
    sources: SAMPLE_SOURCES,
  },
  render: (args) => (
    <SourcesSideSheet
      {...args}
      onOpenChange={() => {}}
    />
  ),
};
export default meta;

export const Default: StoryObj<typeof SourcesSideSheet> = {};

export const CustomItems: StoryObj<typeof SourcesSideSheet> = {
  name: 'Custom Items',
  render: () => {
    const [open, setOpen] = React.useState(true);
    return (
      <SourcesSideSheet
        open={open}
        onOpenChange={setOpen}
        sources={[]}
        count={3}
        items={[
          <SourcesSideSheetMailItem
            senderName="Anjali Kumar"
            senderEmail="anjali@hiver.com"
            subject="Welcome to the team"
            snippet="Excited to have you onboard."
            timestamp="Feb 4, 2:45 PM"
          />,
          <div className="rounded-[8px] border border-dashed border-[#cbd5e1] p-3 text-[14px] text-[#475569]">
            Custom citation row
          </div>,
          <SourcesSideSheetMailItem
            senderName="Marcus Chen"
            senderEmail="marcus@hiver.com"
            subject="Q2 roadmap review"
            snippet="Sharing the latest deck for tomorrow's sync."
            timestamp="Feb 5, 10:12 AM"
          />,
        ]}
      />
    );
  },
};
