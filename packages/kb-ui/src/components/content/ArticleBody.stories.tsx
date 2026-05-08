import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { ArticleBody } from './ArticleBody';

/* ─────────────────────────────────────────────────────────────
 * ArticleBody Playground — fully populated article using every
 * region slot (header, beforeS1, s1, betweenS1AndS2, s2.before/
 * after, betweenS2AndS3, s3, afterS3) with realistic shared-inbox
 * content lifted straight from the Hiver KB.
 * ───────────────────────────────────────────────────────────── */

const meta: Meta<typeof ArticleBody> = {
  title: 'Components/Article/Article Body',
  component: ArticleBody,
  parameters: { layout: 'padded' },
  globals: { backgrounds: { value: 'canvas' } },
};
export default meta;

function ArticleBodyPlayground() {
  return (
    <ArticleBody
      decisions={{ s1: 'inactive', s2: 'inactive', s3: 'inactive' }}
      regions={{
        header: (
          <>
            <h1 style={{ margin: 0, marginBottom: 8 }}>
              Setting up shared inboxes in Hiver
            </h1>
            <p style={{ margin: 0, color: '#666' }}>
              Last updated by Priya Menon — April 2026
            </p>
          </>
        ),
        beforeS1: (
          <p>
            Shared inboxes let your team collaborate on a single email address —
            like support@ or billing@ — directly inside Gmail. Every teammate sees
            the same conversations, can claim ownership, and reply on behalf of
            the group without forwarding threads back and forth.
          </p>
        ),
        s1: [
          'Hiver also supports nested shared inboxes, so larger teams can split a parent inbox (e.g. support@) into focused sub-queues like billing-support@ or onboarding@ without leaving Gmail.',
        ],
        betweenS1AndS2: (
          <p>
            To create a shared inbox, open the Hiver sidebar and click the plus
            icon next to "Shared Inboxes." You'll be prompted to enter the email
            address you want to share.
          </p>
        ),
        s2: {
          before: [
            'Once the inbox is created, only the admin who set it up can see incoming conversations until teammates are added manually.',
          ],
          after: [
            'Once the inbox is created, every teammate you invite gets immediate access to incoming conversations — no manual sync step required.',
          ],
        },
        betweenS2AndS3: (
          <p>
            Invite teammates from the inbox settings panel. They'll receive an
            email invitation and, once accepted, the shared inbox will appear in
            their Gmail sidebar alongside their personal mail.
          </p>
        ),
        s3: [
          'Note: shared inboxes created before March 2024 used a legacy permissions model and may need to be migrated manually from the admin console before new teammates can be added.',
        ],
        afterS3: (
          <p>
            That's it — your team is ready to triage email together. For more on
            assigning conversations and SLAs, see the Collaboration guide.
          </p>
        ),
      }}
    />
  );
}

export const Playground: StoryObj<typeof ArticleBody> = {
  render: () => <ArticleBodyPlayground />,
};
