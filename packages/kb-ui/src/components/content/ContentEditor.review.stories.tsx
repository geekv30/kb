import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { ContentEditor } from './ContentEditor';
import { FigmaCompare } from '../../_review/FigmaCompare';
import contentEditorFigma from '../../../../../design/screenshots/content-editor.png';
import { figmaNode } from './ContentEditor.figma';

const meta: Meta<typeof ContentEditor> = {
  title: 'Review/Content/ContentEditor',
  component: ContentEditor,
  parameters: { layout: 'padded' },
  globals: { backgrounds: { value: 'white' } },
};
export default meta;

/**
 * Figma frame `53:2315` is the 720-px-wide editor card showing a fully
 * populated KB article ("How to Reset Your Password") with H1 title,
 * "Last updated" subtitle, intro paragraph, two H2 sections each with a
 * 6-step ordered list, an SSO subsection (H2 + 3 paragraphs with bold
 * inline domains), and a Password Requirements section (H2 + intro +
 * unordered bullet list).
 *
 * The production `ContentEditor` is Tiptap-based and renders ONLY the
 * rich-text body — the H1 title and "Last updated" subtitle in Figma
 * are page-header chrome that lives outside the editor. We seed the
 * editor with HTML that mirrors the body content (paragraphs, H2s,
 * ordered/unordered lists, inline `<strong>` for bold, link styling on
 * the admin URLs) so the side-by-side comparison covers everything
 * `ContentEditor` is responsible for.
 *
 * **Read-only mode** (`readOnly`) is used so the bubble menu, slash
 * popup, and caret never appear in the side-by-side view — they would
 * obscure the body content. The `placeholder` is suppressed for the
 * same reason.
 *
 * **Inline drift fixed in this dispatch**: production card border was
 * `#e2e8f0`; Figma `53:2316` ships `#f1f5f9` (the canonical
 * `--color-border` token). `ContentEditor.tsx` now uses `#f1f5f9` to
 * stay aligned with the rest of the editor surface.
 *
 * **Deferred — flagged for follow-up**:
 *   - Title (H1) + "Last updated" header inside the editor card. The
 *     Figma frame includes them inside the editor's card chrome, but
 *     the production component is body-only. Wiring them in would
 *     change the public API (new `title` / `subtitle` props or a new
 *     header slot). Defer to a structured-API change.
 *   - Tiptap renders ordered-list numerals at `1.` `2.` `3.` while
 *     Figma uses `ms-[24px]` indented decimals — visually equivalent
 *     but the spacing math differs by ~2 px. Out of scope for a
 *     CSS-level fix without overriding ProseMirror list styles
 *     globally.
 */
const SEED_HTML = `
<p>Your Hiver account password can be reset through several methods depending on how you access the platform. This guide covers all available reset options for both standard accounts and SSO-managed accounts.</p>
<h2>Resetting from the Web Dashboard</h2>
<ol>
  <li>Go to app.hiver.com and click <strong>"Sign In"</strong></li>
  <li>Click <strong>"Forgot Password?"</strong> below the sign-in form</li>
  <li>Enter the email address associated with your Hiver account</li>
  <li>Click <strong>"Send Reset Link"</strong> — you'll receive an email within 2 minutes</li>
  <li>Click the reset link in the email and enter your new password</li>
  <li>Confirm your new password and click <strong>"Reset Password"</strong></li>
</ol>
<h2>Resetting Your Password via Mobile App</h2>
<ol>
  <li>Open the Hiver mobile app and tap your profile icon in the bottom-right corner.</li>
  <li>Navigate to Settings → Security → Change Password.</li>
  <li>Tap "Forgot Password?" to receive a reset link via email.</li>
  <li>Check your registered email for the reset link (arrives within 2 minutes).</li>
  <li>Tap the link from your mobile device — it will open directly in the app.</li>
  <li>Enter your new password (minimum 12 characters, must include one uppercase letter and one number).</li>
</ol>
<h2>SSO Password Reset (Admin Only)</h2>
<p>If your organization uses Single Sign-On (SSO), individual users cannot reset their passwords through Hiver. Instead, an administrator must initiate the reset from the identity provider or the Hiver admin panel.</p>
<p>Navigate to the admin panel at <strong>admin.hiver.com/legacy/users</strong> and select the user whose password needs to be reset.</p>
<p>Navigate to the admin panel at <strong>admin.hiver.com/settings/users</strong> and select the user whose password needs to be reset. You can also use the search bar to quickly find users by name or email.</p>
<h2>Password Requirements</h2>
<p>Your new password must meet the following requirements:</p>
<ul>
  <li>Minimum 12 characters</li>
  <li>At least one uppercase letter (A-Z)</li>
  <li>At least one lowercase letter (a-z)</li>
  <li>At least one number (0-9)</li>
  <li>Cannot match any of your last 5 passwords</li>
</ul>
`;

function ContentEditorReview() {
  return (
    <FigmaCompare
      storyKey="content-content-editor"
      figmaImage={contentEditorFigma}
      componentLabel="ContentEditor"
      frameLabel="Figma · Editor body (Reset Password article)"
      figmaNodeUrl={`https://www.figma.com/design/${figmaNode.fileKey}/?node-id=${figmaNode.nodeId.replace(':', '-')}`}
    >
      {/*
        Manual title + subtitle band sits ABOVE the editor card so the
        side-by-side surface reflects what the user actually sees in the
        Figma frame. The band is NOT part of the production
        `ContentEditor` (see flagged-for-follow-up note above) — it lives
        only on the review canvas. Width matches the 720-px editor card.
      */}
      <div className="font-sans" style={{ width: 720 }}>
        <div
          className="rounded-t-[12px] border border-b-0 border-[#f1f5f9] bg-white px-10 pt-10 pb-3"
          style={{
            boxShadow:
              '0px 8px 12px -4px rgba(0,0,0,0.05), 0px 4px 6px -2px rgba(0,0,0,0.10)',
          }}
        >
          <h1 className="m-0 text-[24px] font-semibold leading-[32px] text-[#0f172a]">
            How to Reset Your Password
          </h1>
          <p className="mt-3 mb-0 text-[14px] font-normal leading-[20px] text-[#475569]">
            Last updated 9 months ago
          </p>
        </div>
        <ContentEditor
          initialContent={SEED_HTML}
          readOnly
          className="rounded-t-none border-t-0"
        />
      </div>
    </FigmaCompare>
  );
}

export const Playground: StoryObj<typeof ContentEditor> = {
  render: () => <ContentEditorReview />,
};
