import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { SourcesSideSheet, type ConversationSource } from './SourcesSideSheet';

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

function SourcesSideSheetPlayground() {
  const [open, setOpen] = React.useState(true);
  return (
    <div className="bg-[#f5f5f5] min-h-screen p-8">
      <div className="mx-auto max-w-[720px] rounded-[12px] border border-[#e5e5e5] bg-white p-6">
        <h2 className="text-[18px] font-semibold leading-7 text-[#0f172a]">
          How do I reset my password if I can&apos;t access my recovery email?
        </h2>
        <p className="mt-3 text-[14px] leading-6 text-[#475569]">
          To reset your password without access to your recovery email, follow the 3-step
          account recovery process: verify your identity using a backup phone number or
          authenticator app, answer two security questions tied to your account, and confirm
          a one-time code sent to a trusted device. Once verified, you&apos;ll be prompted
          to set a new password and re-link a current recovery email.
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-4 inline-flex items-center gap-1.5 rounded-[6px] bg-white border border-[#e5e5e5] px-3 py-1.5 text-[13px] font-medium text-[#475569] hover:bg-[#f8fafc]"
        >
          View 4 sources
        </button>
      </div>
      <SourcesSideSheet open={open} onOpenChange={setOpen} sources={SAMPLE_SOURCES} />
    </div>
  );
}

const meta: Meta<typeof SourcesSideSheet> = {
  title: 'Components/Overlays/Sources Side Sheet',
  component: SourcesSideSheet,
  parameters: { layout: 'fullscreen' },
  globals: { backgrounds: { value: 'canvas' } },
};
export default meta;

export const Playground: StoryObj<typeof SourcesSideSheet> = {
  render: () => <SourcesSideSheetPlayground />,
};
