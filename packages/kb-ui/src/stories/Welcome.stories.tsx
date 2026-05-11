import type { Meta, StoryObj } from '@storybook/react-vite';

/**
 * Welcome page for the Hiver KB component library.
 *
 * NOTE: this used to be `Welcome.mdx`, but Storybook 10.3.5's `@storybook/addon-docs`
 * MDX plugin emits an absolute `file://...` import for `useMDXComponents`
 * (from `mdx-plugin-*.js` via `import.meta.resolve('@storybook/addon-docs/mdx-react-shim')`),
 * which Vite's import-analysis plugin cannot resolve. See `logs.md` / dispatch notes.
 * The landing page is rendered as a plain React story instead.
 */

const card = (idx: number, title: string, body: React.ReactNode): React.ReactNode => (
  <div
    key={idx}
    style={{
      padding: 20,
      border: '1px solid #e5e5e5',
      borderRadius: 8,
      background: '#ffffff',
    }}
  >
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: 6,
        background: '#f1ebff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
      }}
    >
      <span style={{ color: '#6634ef', fontWeight: 700, fontSize: 14 }}>{idx}</span>
    </div>
    <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 6px' }}>{title}</h3>
    <p style={{ fontSize: 13, lineHeight: 1.5, color: '#64748b', margin: 0 }}>{body}</p>
  </div>
);

function WelcomePage(): JSX.Element {
  return (
    <div
      style={{
        fontFamily: '"Inter", -apple-system, sans-serif',
        color: '#0f172a',
        maxWidth: 920,
      }}
    >
      <h1 style={{ fontSize: 32, fontWeight: 700, margin: '0 0 8px', letterSpacing: '-0.01em' }}>
        Welcome to Hiver KB Components
      </h1>

      <p style={{ fontSize: 18, lineHeight: 1.6, color: '#475569', marginTop: 8, marginBottom: 32 }}>
        <strong style={{ color: '#0f172a' }}>@test-kb-ui/kb-ui</strong> is a pixel-perfect, 1:1 React
        component library for{' '}
        <a
          href="https://app.hiverkb.com"
          style={{ color: '#6634ef', textDecoration: 'none' }}
          target="_blank"
          rel="noreferrer"
        >
          app.hiverkb.com
        </a>
        . Designers, PMs, and engineers should be able to build any new KB feature from a PRD
        alone &mdash; zero bespoke Figma effort, 100% visual cohesion with the product.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: 16,
          margin: '32px 0',
        }}
      >
        {card(
          1,
          'Design parity',
          'Every component matches Figma exactly — token-for-token across padding, radius, typography, and color.',
        )}
        {card(
          2,
          'Composable shells',
          <>
            Rail + Explorer + Breadcrumb compose into <code style={{ fontSize: 12 }}>AppShell</code>{' '}
            at a 1280 viewport &mdash; the same layout app.hiverkb.com ships.
          </>,
        )}
        {card(
          3,
          'Accessible',
          <>
            WCAG AA contrast, keyboard-friendly navigation, and{' '}
            <code style={{ fontSize: 12 }}>aria-*</code> on every interactive icon.
          </>,
        )}
      </div>

      <h2 style={{ fontSize: 20, fontWeight: 600, margin: '24px 0 8px' }}>How to navigate</h2>

      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: 14,
          margin: '16px 0 32px',
        }}
      >
        <thead>
          <tr style={{ borderBottom: '1px solid #e5e5e5' }}>
            <th
              style={{
                textAlign: 'left',
                padding: '10px 12px',
                fontWeight: 600,
                color: '#0f172a',
                width: 220,
              }}
            >
              Section
            </th>
            <th
              style={{
                textAlign: 'left',
                padding: '10px 12px',
                fontWeight: 600,
                color: '#0f172a',
              }}
            >
              What&rsquo;s in it
            </th>
          </tr>
        </thead>
        <tbody>
          <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
            <td style={{ padding: '10px 12px', fontWeight: 500 }}>Getting Started</td>
            <td style={{ padding: '10px 12px', color: '#475569' }}>
              This welcome page and onboarding docs.
            </td>
          </tr>
          <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
            <td style={{ padding: '10px 12px', fontWeight: 500 }}>Foundations</td>
            <td style={{ padding: '10px 12px', color: '#475569' }}>
              Design tokens &mdash; typography, colors, icons, spacing, radius.
            </td>
          </tr>
          <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
            <td style={{ padding: '10px 12px', fontWeight: 500 }}>Components</td>
            <td style={{ padding: '10px 12px', color: '#475569' }}>
              <strong>Primitives</strong> (Button, Badge, Avatar&hellip;),{' '}
              <strong>Navigation</strong> (SideNavRail, FileExplorerNav),{' '}
              <strong>Content</strong> (DataTable, PageHeader&hellip;), <strong>Shell</strong>{' '}
              (AppShell, KBBreadcrumbBar).
            </td>
          </tr>
          <tr>
            <td style={{ padding: '10px 12px', fontWeight: 500 }}>Patterns</td>
            <td style={{ padding: '10px 12px', color: '#475569' }}>
              Full-page compositions &mdash; e.g. KB Category Page.
            </td>
          </tr>
        </tbody>
      </table>

      <h2 style={{ fontSize: 20, fontWeight: 600, margin: '24px 0 8px' }}>Links</h2>

      <ul style={{ fontSize: 14, lineHeight: 1.8, paddingLeft: 20, margin: '0 0 32px' }}>
        <li>
          <a
            href="https://www.figma.com/design/9aGp5t9fH1d0PXi4LMhOdb/library-check"
            target="_blank"
            rel="noreferrer"
            style={{ color: '#6634ef', textDecoration: 'none' }}
          >
            Figma &mdash; library-check (component library)
          </a>
        </li>
        <li>
          <a
            href="https://www.figma.com/design/251DTRmxl2L6jmXd3FWzHe/kb-gaps"
            target="_blank"
            rel="noreferrer"
            style={{ color: '#6634ef', textDecoration: 'none' }}
          >
            Figma &mdash; kb-gaps (screens)
          </a>
        </li>
        <li>
          Internal: <code style={{ fontSize: 13 }}>design/_layout-invariants.md</code>,{' '}
          <code style={{ fontSize: 13 }}>design/_tokens.md</code>
        </li>
      </ul>

      <p
        style={{
          fontSize: 12,
          color: '#94a3b8',
          margin: 0,
          paddingTop: 16,
          borderTop: '1px solid #f1f5f9',
        }}
      >
        Built with React 18, TypeScript, Tailwind, and Radix primitives. Distributed as{' '}
        <code style={{ fontSize: 11 }}>@test-kb-ui/kb-ui</code>.
      </p>
    </div>
  );
}

const meta: Meta<typeof WelcomePage> = {
  title: 'Getting Started/Welcome',
  component: WelcomePage,
  parameters: {
    layout: 'padded',
    options: { showPanel: false },
  },
};

export default meta;
type Story = StoryObj<typeof WelcomePage>;

export const Welcome: Story = {};
