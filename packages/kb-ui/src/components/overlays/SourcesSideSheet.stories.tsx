import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { Button } from '../primitives';
import {
  SourcesSideSheet,
  type ConversationSource,
} from './SourcesSideSheet';

const meta: Meta<typeof SourcesSideSheet> = {
  title: 'Components/Overlays/Sources Side Sheet',
  component: SourcesSideSheet,
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj<typeof SourcesSideSheet>;

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

export const Default: Story = {
  render: () => {
    const [open, setOpen] = React.useState(true);
    return (
      <SourcesSideSheet
        open={open}
        onOpenChange={setOpen}
        sources={SAMPLE_SOURCES}
      />
    );
  },
};

export const Interactive: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false);
    return (
      <div
        style={{
          height: '100vh',
          width: '100vw',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f5f5f5',
        }}
      >
        <Button onClick={() => setOpen(true)}>Open sources</Button>
        <SourcesSideSheet
          open={open}
          onOpenChange={setOpen}
          sources={SAMPLE_SOURCES}
          onSourceClick={(id) => console.log('Clicked source:', id)}
        />
      </div>
    );
  },
};
