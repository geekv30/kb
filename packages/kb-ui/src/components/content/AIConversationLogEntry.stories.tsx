import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  RiQuestionLine,
  RiSparkling2Line,
  RiPriceTag3Line,
} from '@remixicon/react';
import '../../tokens.css';
import { AIConversationLogEntry } from './AIConversationLogEntry';
import { ConversationRow } from './AIConversationLogEntryAtoms';
import type { ConversationSource } from '../overlays/SourcesSideSheet';

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

const meta: Meta<typeof AIConversationLogEntry> = {
  title: 'Components/AI/AI Conversation Log Entry',
  component: AIConversationLogEntry,
  parameters: { layout: 'centered' },
  args: {
    question: "How do I reset my password if I can't access my recovery email?",
    timestamp: 'Mar 31, 2:23 PM',
    feedback: 'positive',
    answer:
      'Outlined the 3-step account recovery process via billing info and support contact.',
    sourceCount: 3,
    sources: SAMPLE_SOURCES,
    answerDisabled: false,
    showViewAll: false,
  },
  render: (args) => (
    <div className="w-[850px] rounded-[12px] border border-card-border bg-white px-5">
      <AIConversationLogEntry {...args} />
    </div>
  ),
};
export default meta;

export const Default: StoryObj<typeof AIConversationLogEntry> = {};

export const CustomRows: StoryObj<typeof AIConversationLogEntry> = {
  name: 'Custom Rows',
  args: {
    question: "How do I reset my password if I can't access my recovery email?",
    timestamp: 'Mar 31, 2:23 PM',
    feedback: 'positive',
    answer:
      'Outlined the 3-step account recovery process via billing info and support contact.',
    sourceCount: 3,
    sources: SAMPLE_SOURCES,
    answerDisabled: false,
    showViewAll: false,
    rows: [
      <ConversationRow
        key="row-question"
        icon={<RiQuestionLine className="h-4 w-4 text-[#475569]" />}
      >
        What's the company refund policy?
      </ConversationRow>,
      <ConversationRow
        key="row-answer"
        icon={<RiSparkling2Line className="h-4 w-4 text-[#7c3aed]" />}
      >
        Refunds are processed within 5-7 business days.
      </ConversationRow>,
      <ConversationRow
        key="row-cost"
        icon={<RiPriceTag3Line className="h-4 w-4 text-[#475569]" />}
      >
        Cost: $0.0024 (210 input + 80 output tokens)
      </ConversationRow>,
    ],
  },
};
