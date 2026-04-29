import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { ArticleBody } from './ArticleBody';

const meta: Meta<typeof ArticleBody> = {
  title: 'Components/Article/Article Body',
  component: ArticleBody,
  parameters: { layout: 'padded' },
  args: {
    decisions: { s1: 'inactive', s2: 'inactive', s3: 'inactive' },
    regions: {
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
      s1: (
        <p>
          Hiver also supports nested shared inboxes, so larger teams can split a
          parent inbox (e.g. support@) into focused sub-queues like
          billing-support@ or onboarding@ without leaving Gmail.
        </p>
      ),
      betweenS1AndS2: (
        <p>
          To create a shared inbox, open the Hiver sidebar and click the plus
          icon next to "Shared Inboxes." You'll be prompted to enter the email
          address you want to share.
        </p>
      ),
      s2: {
        before: (
          <p>
            Once the inbox is created, only the admin who set it up can see
            incoming conversations until teammates are added manually.
          </p>
        ),
        after: (
          <p>
            Once the inbox is created, every teammate you invite gets immediate
            access to incoming conversations — no manual sync step required.
          </p>
        ),
      },
      betweenS2AndS3: (
        <p>
          Invite teammates from the inbox settings panel. They'll receive an
          email invitation and, once accepted, the shared inbox will appear in
          their Gmail sidebar alongside their personal mail.
        </p>
      ),
      s3: (
        <p>
          Note: shared inboxes created before March 2024 used a legacy
          permissions model and may need to be migrated manually from the admin
          console before new teammates can be added.
        </p>
      ),
      afterS3: (
        <p>
          That's it — your team is ready to triage email together. For more on
          assigning conversations and SLAs, see the Collaboration guide.
        </p>
      ),
    },
  },
  render: (args) => (
    <div style={{ background: '#f5f5f5', padding: 32 }}>
      <ArticleBody {...args} />
    </div>
  ),
};
export default meta;

export const Default: StoryObj<typeof ArticleBody> = {};
