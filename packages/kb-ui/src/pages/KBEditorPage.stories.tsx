import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import '../tokens.css';
import {
  RiQuillPenLine,
  RiBarChartBoxLine,
  RiSettings5Line,
} from '@remixicon/react';
import { AppShell } from '../components/shell/AppShell';
import { KBBreadcrumbBar } from '../components/shell/KBBreadcrumbBar';
import { SideNavRail } from '../components/nav/SideNavRail';
import { FileExplorerNav, type NavItem } from '../components/nav/FileExplorerNav';
import { ContentEditor } from '../components/content/ContentEditor';
import {
  ArticleSettingsPanel,
  type ArticleSettings,
} from '../components/content/ArticleSettingsPanel';
import { Avatar } from '../components/primitives/Avatar';
import { CompanyLogo } from '../components/brand/CompanyLogo';
import { AiIcon } from '../components/brand/AiIcon';

/* ─────────────────────────────────────────────────────────────
 * KB Editor Page — Figma `9aGp5t9fH1d0PXi4LMhOdb#53:8464`
 *
 * `53:8464` is the **collapsed shell state** of the editor page:
 *   - SideNavRail and FileExplorerNav are hidden (AppShell's new
 *     `sidebarCollapsed` prop unmounts both).
 *   - Content column spans full viewport width.
 *   - Breadcrumb's leading icon is a HOME glyph (`RiHome5Line`), not
 *     the side-panel toggle used in the expanded state.
 *   - Editor card and Settings panel sit side-by-side (no stacking
 *     needed — full viewport has room for 720 + 24 + 452 ≈ 1196 px).
 *
 * Single `Default` story driven by Storybook controls:
 *   - `sidebarCollapsed` — when true, rail + explorer are unmounted (Figma
 *     `53:8464`). When false, the expanded shell renders for regression.
 *   - `populated` — when true, editor seeds with the reset-password HTML
 *     and `populatedSettings`. When false, blank editor + empty settings
 *     (greenfield state).
 *
 * Breadcrumb path is selected internally based on `sidebarCollapsed` to
 * keep the trail consistent with the visible side-nav state (collapsed →
 * Getting Started chain, expanded → Offer Multi-channel chain).
 * ───────────────────────────────────────────────────────────── */

// Meta declared at bottom of file (after wrapper) so it can reference
// `EditorPage` for `component`/`args`/`render`.

/* ------- Side nav rail ------- */

const railItems = [
  { id: 'ai', icon: <AiIcon size={16} />, label: 'AI' },
  { id: 'editor', icon: <RiQuillPenLine size={16} />, label: 'Editor' },
  { id: 'analytics', icon: <RiBarChartBoxLine size={16} />, label: 'Analytics' },
  { id: 'settings', icon: <RiSettings5Line size={16} />, label: 'Settings' },
];

/* ------- File explorer tree — active article: "How to Reset Your Password" ------- */

const navItems: NavItem[] = [
  { id: 'getting-started', type: 'folder', title: 'Getting Started', count: 12 },
  {
    id: 'offer-multi',
    type: 'folder',
    title: 'Offer Multi-channel Support',
    count: 9,
    children: [
      {
        id: 'manage-emails',
        type: 'folder',
        title: 'Managing emails',
        count: 3,
        children: [
          {
            id: 'managing-emails-reset',
            type: 'article',
            title: 'How to Reset Your Password',
            status: 'draft',
          },
          {
            id: 'managing-emails-labels',
            type: 'article',
            title: 'Setting up labels and filters',
            status: 'published',
          },
          {
            id: 'managing-emails-threading',
            type: 'article',
            title: 'Email threading best practices',
            status: 'published',
          },
        ],
      },
      { id: 'manage-live-chat', type: 'folder', title: 'Manage live chat messages', count: 7 },
      { id: 'manage-calls', type: 'folder', title: 'Manage calls', count: 3 },
      { id: 'manage-whatsapp', type: 'folder', title: 'Manage WhatsApp messages', count: 3 },
    ],
  },
  { id: 'automate-workflows', type: 'folder', title: 'Automate Workflows', count: 8 },
  { id: 'manage-sla', type: 'folder', title: 'Manage SLA Policies', count: 8 },
  { id: 'collaborating', type: 'folder', title: 'Collaborating with your team', count: 5 },
  { id: 'hiver-ai', type: 'folder', title: 'Hiver AI', count: 3 },
  { id: 'self-service', type: 'folder', title: 'Enable self-service', count: 6 },
];

/* ------- Breadcrumb trails ------- */

/**
 * Collapsed-state breadcrumb path from Figma `53:8464`:
 *   Getting Started / Integrating Hiver in Slack / Hiver in Incognito /
 *   How to reset your Password
 *
 * Note lowercase "reset your Password" matches Figma.
 */
const collapsedBreadcrumbItems = [
  { id: 'getting-started', label: 'Getting Started' },
  { id: 'integrating-slack', label: 'Integrating Hiver in Slack' },
  { id: 'hiver-incognito', label: 'Hiver in Incognito' },
  { id: 'current', label: 'How to reset your Password' },
];

/**
 * Expanded-state breadcrumb (`WithSidebars` story) keeps the previous
 * product-tree path rooted in "Offer Multi-channel Support", matching
 * the selected article in the explorer tree.
 */
const expandedBreadcrumbItems = [
  { id: 'offer-multi', label: 'Offer Multi-channel Support' },
  { id: 'manage-emails', label: 'Managing emails' },
  { id: 'current', label: 'How to Reset Your Password' },
];

/* ------- Editor body ------- */

/**
 * Figma `53:8464` shows, directly under the H1:
 *   "Last updated 9 months ago"   — subtitle, 14/20 #64758b
 *
 * Per spec we are NOT modifying `ContentEditor.tsx`; the subtitle is
 * injected as a first paragraph in the editor content. Tiptap strips most
 * inline styles, so the subtitle renders as plain body text (paragraph)
 * rather than the Figma's grey 14 px. This visual delta is called out in
 * `_diff-report.md`. The spec-ed content (line + placement) is preserved.
 */
const RESET_PASSWORD_HTML = `
<h1>How to Reset Your Password</h1>
<p>Last updated 9 months ago</p>
<p>Your Hiver account password can be reset through several methods depending on how you access the platform. This guide covers all available reset options for both standard accounts and SSO-managed accounts.</p>

<h2>Resetting from the Web Dashboard</h2>
<p>follow the instructions :</p>
<ol>
  <li>Go to <a href="https://app.hiver.com">app.hiver.com</a> and click <strong>"Sign In"</strong></li>
  <li>Click <strong>"Forgot Password?"</strong> below the sign-in form</li>
  <li>Enter the email address associated with your Hiver account</li>
  <li>Click <strong>"Send Reset Link"</strong> — you'll receive an email within 2 minutes</li>
  <li>Click the reset link in the email and enter your new password</li>
  <li>Confirm your new password and click <strong>"Reset Password"</strong></li>
</ol>

<h3>Important notes</h3>
<p>The reset link expires after <mark data-color="ai">30 minutes for security reasons — always use the latest email received</mark>. If you don't see the email, check your spam folder.</p>

<h3>Admin panel override</h3>
<p>Admins can reset passwords on behalf of team members via the admin panel. This is the fastest path for SSO-managed accounts and locked users.</p>
`.trim();

/* ------- Settings seed values ------- */

/**
 * Populated settings — Figma `53:8464` shows Author = "Varun K" and
 * Category = "Hiver in Incognito". Story data only; no component changes.
 */
const populatedSettings: ArticleSettings = {
  author: { name: 'Varun K', initials: 'A' },
  category: 'Hiver in Incognito',
  slug: 'how-to-reset-your-password',
  tags: ['Security', 'Account', 'Password'],
  publishDate: 'Apr 12, 2026',
  seoTitle: 'Reset Your Password — Hiver Help',
  visibility: 'Public',
  reviewers: [
    { name: 'Aditya Kapoor', initials: 'AK' },
    { name: 'Maya Rao', initials: 'MR' },
    { name: 'Tanvi Shah', initials: 'TS' },
  ],
};

const emptySettings: ArticleSettings = {
  tags: [],
  reviewers: [],
};

/* ─────────────────────────────────────────────────────────────
 * Composition wrapper
 * ───────────────────────────────────────────────────────────── */

type EditorPageProps = {
  /** Controls whether rail + explorer are rendered. Default collapsed (matches Figma `53:8464`). */
  sidebarCollapsed: boolean;
  /**
   * When true, editor seeds with reset-password HTML and `populatedSettings`.
   * When false, blank editor body + `emptySettings` (greenfield state).
   */
  populated: boolean;
};

function EditorPage({ sidebarCollapsed, populated }: EditorPageProps) {
  // Pick baked-in seed data based on the `populated` toggle. Both branches
  // use module-level constants so identity is stable and the editor's
  // initial-content effect doesn't refire when toggling unrelated controls.
  const initialSettings = populated ? populatedSettings : emptySettings;
  const initialHTML = populated ? RESET_PASSWORD_HTML : '';
  // Breadcrumb path is paired with sidebar state so the trail matches
  // what's visible in the explorer (or, in the collapsed case, the home
  // chain from Figma `53:8464`).
  const breadcrumbItems = sidebarCollapsed
    ? collapsedBreadcrumbItems
    : expandedBreadcrumbItems;

  const editorRootRef = React.useRef<HTMLDivElement>(null);
  const [activeNavId, setActiveNavId] = React.useState('managing-emails-reset');
  const [settings, setSettings] = React.useState<ArticleSettings>(initialSettings);
  const [collapsed, setCollapsed] = React.useState(sidebarCollapsed);

  // Sync local state with control changes: toggling `sidebarCollapsed` or
  // `populated` from the Storybook controls panel should reset the local
  // wrapper state to match — otherwise the user's prior in-component
  // edits (e.g. tags they added) shadow the new arg value.
  React.useEffect(() => {
    setCollapsed(sidebarCollapsed);
  }, [sidebarCollapsed]);
  React.useEffect(() => {
    setSettings(initialSettings);
  }, [initialSettings]);

  const dispatchSave = () => {
    const editorDom = editorRootRef.current?.querySelector('.ProseMirror');
    if (editorDom) {
      editorDom.dispatchEvent(new Event('kb-editor-save'));
    }
  };

  const handleToggleSidebar = () => {
    // eslint-disable-next-line no-console
    console.log('toggle sidebar:', !collapsed);
    setCollapsed((c) => !c);
  };

  return (
    <AppShell
      sidebarCollapsed={collapsed}
      onToggleSidebar={handleToggleSidebar}
      rail={
        <SideNavRail
          theme="light"
          items={railItems}
          activeId="editor"
          brandLogo={<CompanyLogo size={24} />}
          bottomSlot={<Avatar initials="V" name="Varun Kelkar" />}
        />
      }
      explorer={
        <FileExplorerNav
          theme="light"
          title="Editor"
          items={navItems}
          activeId={activeNavId}
          onItemClick={(id) => {
            // eslint-disable-next-line no-console
            console.log('nav click:', id);
            setActiveNavId(id);
          }}
        />
      }
      breadcrumb={
        <KBBreadcrumbBar
          variant="editor"
          items={breadcrumbItems}
          sidebarCollapsed={collapsed}
          onToggleSidebar={handleToggleSidebar}
          onSaveAsDraft={() => {
            // eslint-disable-next-line no-console
            console.log('save as draft');
            dispatchSave();
          }}
          onPublish={() => {
            // eslint-disable-next-line no-console
            console.log('publish');
            dispatchSave();
          }}
          onClose={() => {
            // eslint-disable-next-line no-console
            console.log('close');
          }}
        />
      }
    >
      {/*
        Layout row behaviour differs by sidebar state:

        - Collapsed (Figma `53:8464`): rail + explorer are unmounted, the
          content column owns the full viewport. Editor hugs the LEFT
          edge, settings panel hugs the RIGHT edge; the space between is
          absorbed by `justify-between` so outer padding (`px-6`) is the
          only breathing room against the viewport edges. This matches
          the "flush-edges" layout invariant (see `_layout-invariants.md`).
        - Expanded (`WithSidebars`): content column is narrower (vw − 54
          − 288), so below the `xl` (1280) breakpoint the columns stack.
          The centred/`items-start` gap behaviour is preserved for this
          case — the flush-edges rule is a collapsed-shell behaviour.
      */}
      {/*
        NOTE on padding: the shell's `main` element already applies
        `pt-[12px] pr-6 pb-6 pl-6` (see `AppShell.tsx`). The flush-edges
        invariant is that editor.left = main.left (i.e. 24 px from the
        content column). Adding `px-6` here would double that to 48 px,
        so this row intentionally has no horizontal padding of its own.
      */}
      <div
        data-kb-part="editor-page-columns"
        className={
          collapsed
            ? 'flex flex-row justify-between items-start gap-6'
            : 'flex flex-col xl:flex-row gap-6 items-start'
        }
      >
        <div
          ref={editorRootRef}
          data-kb-part="editor-column"
          className={
            collapsed
              ? 'max-w-[720px] w-full'
              : 'flex-1 min-w-0 max-w-[720px] w-full'
          }
        >
          <ContentEditor
            initialContent={initialHTML ?? ''}
            onChange={(html) => {
              void html;
            }}
            onSave={(html) => {
              // eslint-disable-next-line no-console
              console.log('onSave fired — bytes:', html.length);
            }}
            className="w-full max-w-full"
          />
        </div>

        <div
          data-kb-part="settings-column"
          className={collapsed ? 'w-[452px] shrink-0' : 'shrink-0'}
        >
          <ArticleSettingsPanel value={settings} onChange={setSettings} />
        </div>
      </div>
    </AppShell>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Meta + Stories
 * ───────────────────────────────────────────────────────────── */

const meta: Meta<typeof EditorPage> = {
  title: 'Patterns/Knowledge Base/Editor Page',
  parameters: { layout: 'fullscreen' },
  component: EditorPage,
  args: {
    sidebarCollapsed: true,
    populated: true,
  },
  argTypes: {
    sidebarCollapsed: {
      control: 'boolean',
      description:
        'When true, rail + explorer are unmounted (matches Figma `53:8464`). When false, expanded shell renders.',
    },
    populated: {
      control: 'boolean',
      description:
        'When true, editor seeds with reset-password HTML + populated settings. When false, blank greenfield state.',
    },
  },
  render: (args) => <EditorPage {...args} />,
};
export default meta;

export const Default: StoryObj<typeof EditorPage> = {};
