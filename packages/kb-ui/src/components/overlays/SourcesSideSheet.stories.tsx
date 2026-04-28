import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import {
  SourcesSideSheet,
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
