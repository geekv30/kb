import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { SuggestionBlock } from './SuggestionBlock';

/**
 * The block lives inline inside an article body, which is itself
 * roughly 620px wide inside the editor shell. Mimic that width so
 * the wash proportions read correctly.
 */
const CANVAS: React.CSSProperties = {
  background: '#ffffff',
  padding: 32,
  width: 620,
};

const BODY_TYPE: React.CSSProperties = {
  color: '#0f172a',
  fontFamily: 'Inter, system-ui, sans-serif',
  fontSize: 14,
  lineHeight: '22px',
};

const H2: React.CSSProperties = {
  ...BODY_TYPE,
  fontSize: 18,
  lineHeight: '26px',
  fontWeight: 600,
  margin: 0,
};

const H3: React.CSSProperties = {
  ...BODY_TYPE,
  fontSize: 16,
  lineHeight: '24px',
  fontWeight: 600,
  margin: '12px 0 0 0',
};

const PARA: React.CSSProperties = {
  ...BODY_TYPE,
  margin: '8px 0 0 0',
};

const ARTICLE_PARA: React.CSSProperties = {
  ...BODY_TYPE,
  margin: '12px 0 0 0',
};

const LIST: React.CSSProperties = {
  ...BODY_TYPE,
  margin: '12px 0 0 0',
  paddingLeft: 20,
  listStyleType: 'decimal',
};

const ADDITION_CONTENT = (
  <>
    <h2 style={H2}>Resetting Your Password via Mobile App</h2>
    <ol style={LIST}>
      <li>Open the Hiver mobile app and tap your profile icon in the bottom-right corner.</li>
      <li>Navigate to Settings → Security → Change Password.</li>
      <li>Tap &ldquo;Forgot Password?&rdquo; to receive a reset link via email.</li>
      <li>Check your registered email for the reset link (arrives within 2 minutes).</li>
      <li>Tap the link from your mobile device — it will open directly in the app.</li>
      <li>Enter your new password (minimum 12 characters, must include one uppercase letter and one number).</li>
    </ol>
  </>
);

const REMOVAL_CONTENT = (
  <>
    <h2 style={H2}>Troubleshooting</h2>
    <h3 style={H3}>Resetting via Chrome Extension</h3>
    <p style={PARA}>
      If you&apos;re using the Hiver Chrome Extension, you can reset your password by clicking the gear icon → Account → Reset Password. This will redirect you to the web dashboard to complete the reset process.
    </p>
  </>
);

const OLD_CONTENT = (
  <p style={{ ...BODY_TYPE, margin: 0 }}>
    Navigate to the admin panel at <strong>admin.hiver.com/legacy/users</strong> and select the user whose password needs to be reset.
  </p>
);

const NEW_CONTENT = (
  <p style={{ ...BODY_TYPE, margin: 0 }}>
    Navigate to the admin panel at <strong>admin.hiver.com/settings/users</strong> and select the user whose password needs to be reset. You can also use the search bar to quickly find users by name or email.
  </p>
);

const meta: Meta<typeof SuggestionBlock> = {
  title: 'Components/AI/Suggestion Block',
  component: SuggestionBlock,
  parameters: { layout: 'padded' },
  globals: { backgrounds: { value: 'white' } },
};
export default meta;

function SuggestionBlockPlayground() {
  return (
    <div style={CANVAS}>
      <h2 style={H2}>Reset Your Password</h2>
      <p style={ARTICLE_PARA}>
        If you&apos;ve forgotten your Hiver password, you can reset it in a few
        steps. The process below covers the standard web flow — additional
        guidance for our mobile and extension surfaces is included where
        relevant.
      </p>
      <SuggestionBlock type="addition" oldContent={OLD_CONTENT} newContent={NEW_CONTENT}>
        {ADDITION_CONTENT}
      </SuggestionBlock>
      <p style={ARTICLE_PARA}>
        Once your password is reset, you&apos;ll be signed out of all active
        sessions across web, mobile, and the Chrome extension. Sign back in with
        your new credentials to resume.
      </p>
      <SuggestionBlock type="removal" oldContent={OLD_CONTENT} newContent={NEW_CONTENT}>
        {REMOVAL_CONTENT}
      </SuggestionBlock>
    </div>
  );
}

export const Playground: StoryObj<typeof SuggestionBlock> = {
  render: () => <SuggestionBlockPlayground />,
};
