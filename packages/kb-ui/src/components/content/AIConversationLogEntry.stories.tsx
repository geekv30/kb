import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { AIConversationLogEntry } from './AIConversationLogEntry';
import type { ConversationSource } from '../overlays/SourcesSideSheet';

/* ─────────────────────────────────────────────────────────────
 * AIConversationLogEntry Playground — single conversation row,
 * wrapped in the same card chrome the entry ships inside in
 * production (the parent AIConversationLogsCard supplies it).
 * ───────────────────────────────────────────────────────────── */

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
  parameters: { layout: 'padded' },
  globals: { backgrounds: { value: 'canvas' } },
};
export default meta;

function AIConversationLogEntryPlayground() {
  return (
    <div className="w-[850px] rounded-[12px] border border-card-border bg-white px-5">
      <AIConversationLogEntry
        question="How do I reset my password if I can't access my recovery email?"
        timestamp="Mar 31, 2:23 PM"
        feedback="positive"
        answer="Outlined the 3-step account recovery process via billing info and support contact."
        sourceCount={3}
        sources={SAMPLE_SOURCES}
        answerDisabled={false}
        showViewAll={false}
      />
    </div>
  );
}

export const Playground: StoryObj<typeof AIConversationLogEntry> = {
  render: () => <AIConversationLogEntryPlayground />,
};
