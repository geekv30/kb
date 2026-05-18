import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import { SerpPreview } from './SerpPreview';

const meta: Meta<typeof SerpPreview> = {
  title: 'Components/Content/SerpPreview',
  component: SerpPreview,
  parameters: { layout: 'padded' },
  globals: { backgrounds: { value: 'white' } },
};
export default meta;

function SerpPreviewPlayground() {
  return (
    <div className="flex flex-col gap-8 font-sans" style={{ maxWidth: 408 }}>
      <h2 className="text-[16px] font-semibold leading-6 text-text-primary">
        SerpPreview
      </h2>

      {/* Default — Figma 2949:7844 reference */}
      <section className="flex flex-col gap-2">
        <p className="text-[12px] font-medium uppercase tracking-wide text-text-muted">
          Default — realistic content
        </p>
        <SerpPreview
          title="Search, filter, and create email views"
          description="Complete guide to setting up shared inboxes in Hiver, inviting team members, and resolving common access issues."
          baseUrl="help.hiverhq.com"
          breadcrumbPath={['getting-started']}
        />
      </section>

      {/* Long values — truncation behavior */}
      <section className="flex flex-col gap-2">
        <p className="text-[12px] font-medium uppercase tracking-wide text-text-muted">
          Long title + description (truncate)
        </p>
        <SerpPreview
          title="A really long meta title that should clip at one line with an ellipsis and not push the rest of the card vertically"
          description="A description that is also quite long and runs past comfortable limits. Google would wrap this across two or three lines in practice, but we render it on a single line in the preview card so the layout stays stable."
          baseUrl="help.hiverhq.com"
          breadcrumbPath={['getting-started', 'advanced-configurations']}
        />
      </section>

      {/* Empty fields — fallback placeholders */}
      <section className="flex flex-col gap-2">
        <p className="text-[12px] font-medium uppercase tracking-wide text-text-muted">
          Empty fields (fallback placeholders)
        </p>
        <SerpPreview baseUrl="help.hiverhq.com" />
      </section>

      {/* No crumbs — host + title-as-crumb only */}
      <section className="flex flex-col gap-2">
        <p className="text-[12px] font-medium uppercase tracking-wide text-text-muted">
          No breadcrumb path
        </p>
        <SerpPreview
          title="Index article living at the host root"
          description="Articles that live directly under the host root collapse their breadcrumb to host > title."
          baseUrl="help.hiverhq.com"
        />
      </section>
    </div>
  );
}

export const Playground: StoryObj<typeof SerpPreview> = {
  render: () => <SerpPreviewPlayground />,
};
