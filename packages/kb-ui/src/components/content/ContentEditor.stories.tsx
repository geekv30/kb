import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { ContentEditor } from './ContentEditor';
import { AppShell } from '../shell/AppShell';
import { KBBreadcrumbBar } from '../shell/KBBreadcrumbBar';
import { SideNavRail } from '../nav/SideNavRail';
import { FileExplorerNav } from '../nav/FileExplorerNav';
import { RiQuillPenLine } from '@remixicon/react';

const meta: Meta<typeof ContentEditor> = {
  title: 'Components/Content/ContentEditor',
  component: ContentEditor,
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof ContentEditor>;

const SAMPLE_HTML = `
<h1>How to Reset Your Password</h1>
<p>Your Hiver account password can be reset through several methods depending on how you access the platform. This guide covers all available reset options for both standard accounts and SSO-managed accounts.</p>

<h2>Resetting from the Web Dashboard</h2>
<ol>
  <li>Go to <a href="https://app.hiver.com">app.hiver.com</a> and click <strong>"Sign In"</strong></li>
  <li>Click <strong>"Forgot Password?"</strong> below the sign-in form</li>
  <li>Enter the email address associated with your Hiver account</li>
  <li>Click <strong>"Send Reset Link"</strong> — you'll receive an email within 2 minutes</li>
  <li>Click the reset link in the email and enter your new password</li>
</ol>

<h3>Important notes</h3>
<p>The reset link expires after <mark data-color="ai">30 minutes for security reasons — always use the latest email received</mark>. If you don't see the email, check your spam folder.</p>

<p>For command-line users, you can also verify your password reset status:</p>
<pre><code class="language-javascript">const status = await hiver.auth.checkResetStatus({
  email: 'user@example.com',
  requestId: 'req_abc123'
});
console.log(status.expiresAt);</code></pre>

<p>Use <code>hiver.auth.resetPassword()</code> for programmatic flows.</p>

<h3>Admin panel override</h3>
<table>
  <tr>
    <th>Method</th>
    <th>When to use</th>
    <th>Time to reset</th>
  </tr>
  <tr>
    <td>Self-serve</td>
    <td>Standard accounts</td>
    <td>~2 minutes</td>
  </tr>
  <tr>
    <td>Admin panel</td>
    <td>SSO-managed</td>
    <td>~5 minutes</td>
  </tr>
  <tr>
    <td>Support ticket</td>
    <td>Locked accounts</td>
    <td>24-48 hours</td>
  </tr>
</table>

<blockquote>Passwords must be at least 12 characters and include uppercase, lowercase, a number, and a symbol.</blockquote>
`.trim();

export const Interactive: Story = {
  name: 'Interactive',
  render: () => (
    <div style={{ background: '#f5f5f5', padding: 32, minHeight: 600 }}>
      <ContentEditor placeholder="Start writing your article…" />
    </div>
  ),
};

export const Empty: Story = {
  name: 'Empty',
  render: () => (
    <div style={{ background: '#f5f5f5', padding: 32, minHeight: 600 }}>
      <ContentEditor placeholder="Start writing your article…" />
    </div>
  ),
};

export const WithContent: Story = {
  name: 'WithContent',
  render: () => (
    <div style={{ background: '#f5f5f5', padding: 32, minHeight: 900 }}>
      <ContentEditor initialContent={SAMPLE_HTML} />
    </div>
  ),
};

export const ReadOnly: Story = {
  name: 'ReadOnly',
  render: () => (
    <div style={{ background: '#f5f5f5', padding: 32, minHeight: 900 }}>
      <ContentEditor initialContent={SAMPLE_HTML} readOnly />
    </div>
  ),
};

/* ──────────────────────────────────────────────────────────────
 * Pattern: minimal KB Editor Page composition
 * AppShell + KBBreadcrumbBar (editor variant) + ContentEditor.
 * Full editor page (incl. Settings panel) lands in Phase 5 step 3.
 * ──────────────────────────────────────────────────────────── */

const EDITOR_CRUMBS = [
  { id: 'home', label: 'Home' },
  { id: 'getting-started', label: 'Getting Started' },
  { id: 'integrating-slack', label: 'Integrating Hiver in Slack' },
  { id: 'incognito', label: 'Hiver in Incognito' },
  { id: 'reset-password', label: 'How to reset your Password' },
];

const NAV_ITEMS = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    type: 'folder' as const,
    count: 12,
    children: [
      { id: 'integrating-slack', title: 'Integrating Hiver in Slack', type: 'folder' as const, count: 3 },
      {
        id: 'incognito',
        title: 'Hiver in Incognito',
        type: 'folder' as const,
        count: 4,
        children: [
          { id: 'reset-password', title: 'How to reset your Password', type: 'article' as const, status: 'draft' as const },
        ],
      },
    ],
  },
];

export const KBEditorPagePattern: Story = {
  name: 'Patterns / KB Editor Page',
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div style={{ width: 1280, height: 900, overflow: 'hidden' }}>
      <AppShell
        rail={
          <SideNavRail
            items={[{ id: 'editor', icon: <RiQuillPenLine size={16} />, label: 'Editor' }]}
            activeId="editor"
            theme="light"
          />
        }
        explorer={<FileExplorerNav items={NAV_ITEMS} activeId="reset-password" />}
        breadcrumb={
          <KBBreadcrumbBar
            items={EDITOR_CRUMBS}
            variant="editor"
            onSaveAsDraft={() => {}}
            onPublish={() => {}}
            onClose={() => {}}
          />
        }
      >
        <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0' }}>
          <ContentEditor initialContent={SAMPLE_HTML} />
        </div>
      </AppShell>
    </div>
  ),
};
