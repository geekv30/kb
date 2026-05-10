import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { AIConversationLogsCard } from './AIConversationLogsCard';
import { AIConversationLogEntry } from './AIConversationLogEntry';
import type { ConversationSource } from '../overlays/SourcesSideSheet';
import { FigmaCompare } from '../../_review/FigmaCompare';
import aiConversationLogsCardFigma from '../../../../../design/screenshots/ai-conversation-logs-card.png';
import { figmaNode } from './AIConversationLogsCard.figma';

/* ─────────────────────────────────────────────────────────────
 * AIConversationLogsCard — full surface review.
 *
 * Figma library-check `156:3987` ("logs" frame) wraps the
 * `SupportPerformanceCard` (`156:4854`, 890×756): a headerless
 * card containing three `<AIConversationLogEntry>` rows separated
 * by hairline dividers (#e2e8f0). The frame is a pure entries-only
 * surface — no title / subtitle / sort / toggle chrome. Production
 * `AIConversationLogsCard` defaults to rendering that header, so
 * this review surface uses the new `header={null}` slot to suppress
 * it (entries paint directly to the card's padded edge).
 *
 * Inline drift fixed in this dispatch:
 *   - Outer card border `--color-card-border` (#e5e5e5) was off by
 *     one shade from Figma. AIConversationLogsCard now overrides to
 *     `#e2e8f0` (matches `156:3987` outer stroke). Local-only —
 *     other consumers of `Card` are unaffected.
 *   - Inter-entry divider colour was `#e5e5e5`, also off vs Figma's
 *     `#e2e8f0`. Switched to match.
 *   - Added `header` slot so callers can suppress the canonical
 *     header chrome (replacing or removing it). `header={null}`
 *     drops the entire title + toolbar + divider stack and lets
 *     entries occupy the full card. `sortOptions`, `sortBy`, and
 *     `ticketCreatedFilter` are now optional on the props type
 *     (only consumed by the default header path).
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

const meta: Meta<typeof AIConversationLogsCard> = {
  title: 'Review/Content/AIConversationLogsCard',
  component: AIConversationLogsCard,
  parameters: { layout: 'padded' },
  globals: { backgrounds: { value: 'white' } },
};
export default meta;

function AIConversationLogsCardReview() {
  return (
    <FigmaCompare
      storyKey="content-ai-conversation-logs-card"
      figmaImage={aiConversationLogsCardFigma}
      componentLabel="AIConversationLogsCard"
      frameLabel="Figma · logs / SupportPerformanceCard"
      figmaNodeUrl={`https://www.figma.com/design/${figmaNode.fileKey}/?node-id=${figmaNode.nodeId.replace(':', '-')}`}
    >
      <div className="font-sans" style={{ width: 890 }}>
        <AIConversationLogsCard header={null}>
          {/* Entry 1 — positive feedback, sources only, no tail. */}
          <AIConversationLogEntry
            question="How do I reset my password if I can't access my recovery email?"
            timestamp="Mar 31, 2:23 PM"
            feedback="positive"
            answer="Outlined the 3-step account recovery process via billing info and support contact."
            sourceCount={3}
            sources={SAMPLE_SOURCES}
          />

          {/* Entry 2 — no feedback, sources, follow-up sub-thread with
           * source-clicked tail, plus a `view all` link. */}
          <AIConversationLogEntry
            question="How do I set up Slack notifications for my team?"
            timestamp="Mar 28, 2:23 PM"
            feedback={null}
            answer="Walked through the Slack integration setup, notification scope settings, and OAuth re-authorization steps"
            sourceCount={3}
            sources={SAMPLE_SOURCES}
            followUp={{
              question: 'How do i do this and that?',
              answer: 'Explained about the OAuth setup',
              sourceCount: 3,
              sources: SAMPLE_SOURCES,
              tail: { kind: 'source-clicked', actor: 'the user' },
            }}
            showViewAll
          />

          {/* Entry 3 — negative feedback, AI failure (greyed answer,
           * no sources link), search-result-clicked tail. */}
          <AIConversationLogEntry
            question="Does Hiver have HIPAA compliance?"
            timestamp="Mar 27, 2:23 PM"
            feedback="negative"
            answer="AI could not provide an answer"
            answerDisabled
            sourceCount={0}
            tail={{ kind: 'search-result-clicked', actor: 'the user' }}
          />
        </AIConversationLogsCard>
      </div>
    </FigmaCompare>
  );
}

export const Playground: StoryObj<typeof AIConversationLogsCard> = {
  render: () => <AIConversationLogsCardReview />,
};
