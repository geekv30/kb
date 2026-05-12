import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { KBBreadcrumbBar } from './KBBreadcrumbBar';
import { EditorBreadcrumbActions } from './EditorBreadcrumbActions';
import { FigmaCompare } from '../../_review/FigmaCompare';
import kbBreadcrumbBarFigma from '../../../../../design/screenshots/kb-breadcrumb-bar.png';
import { figmaNode } from './KBBreadcrumbBar.figma';

const meta: Meta<typeof KBBreadcrumbBar> = {
  title: 'Review/Shell/KBBreadcrumbBar',
  component: KBBreadcrumbBar,
  parameters: { layout: 'padded' },
  globals: { backgrounds: { value: 'white' } },
};
export default meta;

/**
 * Figma frame `50:8395` is the editor variant of the breadcrumb bar:
 *   - leading **home** glyph (sidebar-collapsed shell)
 *   - 4-level breadcrumb path with the trailing item rendered as a
 *     pill (`bg #f8fafc`, `rounded-4`)
 *   - right-aligned action trio: Save as draft (ghost) / Publish
 *     (primary, send-plane icon) / Close (icon button)
 *
 * The frame's outer container is 1280×54 with the inner content
 * insetted by 22 px on the left (matches `pl-[22px]` in the
 * production component). We pass `sidebarCollapsed` so the leading
 * icon resolves to `Home01`, and route the action trio through
 * `EditorBreadcrumbActions` (the canonical right-slot consumer).
 *
 * **Inline drift fixed in this dispatch**: the production component
 * always rendered the 1px vertical divider between the leading icon
 * and the breadcrumb path. Figma omits it in the collapsed/home state.
 * `KBBreadcrumbBar` now suppresses the divider when
 * `sidebarCollapsed === true` to match both shell states.
 */
function KBBreadcrumbBarReview() {
  return (
    <FigmaCompare
      storyKey="shell-kb-breadcrumb-bar"
      figmaImage={kbBreadcrumbBarFigma}
      componentLabel="KBBreadcrumbBar"
      frameLabel="Figma · Editor breadcrumb (sidebar collapsed)"
      figmaNodeUrl={`https://www.figma.com/design/${figmaNode.fileKey}/?node-id=${figmaNode.nodeId.replace(':', '-')}`}
    >
      <div className="font-sans" style={{ width: 1280, height: 54 }}>
        <KBBreadcrumbBar
          sidebarCollapsed
          items={[
            { id: '1', label: 'Getting Started' },
            { id: '2', label: 'Integrating Hiver in Slack' },
            { id: '3', label: 'Hiver in Incognito' },
            { id: '4', label: 'How to reset your Password' },
          ]}
          actions={
            <EditorBreadcrumbActions
              onSaveAsDraft={() => {}}
              onPublish={() => {}}
              onClose={() => {}}
              publishDisabled={false}
            />
          }
        />
      </div>
    </FigmaCompare>
  );
}

export const Playground: StoryObj<typeof KBBreadcrumbBar> = {
  render: () => <KBBreadcrumbBarReview />,
};
