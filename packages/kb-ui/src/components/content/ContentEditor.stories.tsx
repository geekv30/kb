import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { ContentEditor } from './ContentEditor';

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

const meta: Meta<typeof ContentEditor> = {
  title: 'Components/Article/Content Editor',
  component: ContentEditor,
  parameters: { layout: 'padded' },
  args: {
    initialContent: SAMPLE_HTML,
    placeholder: 'Start writing your article…',
    readOnly: false,
  },
  render: (args) => (
    <div style={{ background: '#f5f5f5', padding: 32, minHeight: 900 }}>
      <ContentEditor {...args} />
    </div>
  ),
};
export default meta;

export const Default: StoryObj<typeof ContentEditor> = {};
