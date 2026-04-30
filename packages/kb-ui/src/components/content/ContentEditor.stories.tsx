import type { Meta, StoryObj } from '@storybook/react-vite';
import { RiMagicLine, RiInformationLine } from '@remixicon/react';
import '../../tokens.css';
import { ContentEditor, DEFAULT_TOOLBAR_ITEMS, type ToolbarItemDef } from './ContentEditor';
import type { SlashCommand } from './SlashCommandMenu';

/* ─────────────────────────────────────────────────────────────
 * ContentEditor Playground — single richest demo of the editor:
 * a fully-populated Tiptap article (SAMPLE_HTML) PLUS a custom
 * toolbar (bold/italic/link + an "uppercase selection" magic
 * action) PLUS a custom slash command (Callout). Demonstrates
 * the editor with content AND extension hooks on one screen.
 * ───────────────────────────────────────────────────────────── */

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

const customToolbar: ToolbarItemDef[] = [
  ...DEFAULT_TOOLBAR_ITEMS.filter((i) => ['bold', 'italic', 'link'].includes(i.id)),
  {
    id: 'uppercase',
    label: 'Uppercase selection',
    icon: <RiMagicLine className="h-4 w-4" />,
    onClick: (editor) => {
      const { from, to } = editor.state.selection;
      const text = editor.state.doc.textBetween(from, to, ' ');
      if (text) {
        editor
          .chain()
          .focus()
          .insertContentAt({ from, to }, text.toUpperCase())
          .run();
      }
    },
  },
];

const customSlash: SlashCommand[] = [
  {
    id: 'callout',
    title: 'Callout',
    subtitle: 'Insert a callout block',
    icon: RiInformationLine,
    aliases: ['note', 'info', 'callout'],
    command: (editor, range) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertContent('<blockquote><p>Callout: </p></blockquote>')
        .run();
    },
  },
];

const meta: Meta<typeof ContentEditor> = {
  title: 'Components/Article/Content Editor',
  component: ContentEditor,
  parameters: { layout: 'padded' },
  globals: { backgrounds: { value: 'canvas' } },
};
export default meta;

function ContentEditorPlayground() {
  return (
    <div className="min-h-[900px]">
      <ContentEditor
        initialContent={SAMPLE_HTML}
        placeholder="Start writing your article…"
        readOnly={false}
        toolbarItems={customToolbar}
        slashCommands={customSlash}
      />
    </div>
  );
}

export const Playground: StoryObj<typeof ContentEditor> = {
  render: () => <ContentEditorPlayground />,
};
