import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import {
  AIConversationLogEntry,
  type AIConversationLogEntryProps,
} from './AIConversationLogEntry';
import type { ConversationSource } from '../overlays/SourcesSideSheet';

const meta: Meta<typeof AIConversationLogEntry> = {
  title: 'Components/Content/AI Conversation Log Entry',
  component: AIConversationLogEntry,
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div className="w-[850px] rounded-[12px] border border-card-border bg-white px-5">
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof AIConversationLogEntry>;

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
    subject: 'Password reset link not arriving.',
    snippet: "I'm having trouble syncing my devices. My data is...",
  },
  {
    id: '3',
    senderName: 'Emma Garcia',
    timestamp: 'Feb 4, 4:45 PM',
    subject: 'Recovery email options',
    snippet: "I'm facing syncing issues on my devices. My data i...",
  },
];

export const Default: Story = {
  args: {
    question: "How do I reset my password if I can't access my recovery email?",
    timestamp: 'Mar 31, 2:23 PM',
    feedback: 'positive',
    answer:
      'Outlined the 3-step account recovery process via billing info and support contact.',
    sourceCount: 3,
    sources: SAMPLE_SOURCES,
  } satisfies AIConversationLogEntryProps,
};

export const WithTicketCreated: Story = {
  args: {
    question: 'Why was I charged twice this month?',
    timestamp: 'Mar 30, 1:23 PM',
    feedback: null,
    answer:
      'Explained duplicate charge scenarios and how to report via the billing dashboard. Included 5–7 day refund timeline as well as an apology for the duplicate charge.',
    sourceCount: 3,
    sources: SAMPLE_SOURCES,
    tail: { kind: 'ticket-created' },
  } satisfies AIConversationLogEntryProps,
};

export const WithFollowUp: Story = {
  args: {
    question: 'How do I set up Slack notifications for my team?',
    timestamp: 'Mar 28, 2:23 PM',
    feedback: null,
    answer:
      'Walked through the Slack integration setup, notification scope settings, and OAuth re-authorization steps',
    sourceCount: 3,
    sources: SAMPLE_SOURCES,
    followUp: {
      question: 'How do i do this and that?',
      answer: 'Explained about the OAuth setup',
      sourceCount: 3,
      sources: SAMPLE_SOURCES,
      tail: { kind: 'source-clicked' },
    },
    showViewAll: true,
    onViewAll: () => alert('view all clicked'),
  } satisfies AIConversationLogEntryProps,
};

export const Negative: Story = {
  args: {
    question: 'Does Hiver have HIPAA compliance?',
    timestamp: 'Mar 27, 2:23 PM',
    feedback: 'negative',
    answer: 'AI could not provide an answer',
    answerDisabled: true,
    sourceCount: 0,
    tail: { kind: 'source-clicked' },
  } satisfies AIConversationLogEntryProps,
};
