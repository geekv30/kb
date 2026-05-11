import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import {
  RiAddLine,
  RiArrowDownSLine,
  RiArrowRightSLine,
  RiBookOpenLine,
  RiCloseLine,
  RiDeleteBinLine,
  RiFile3Line,
  RiFolderLine,
  RiLayoutLeftLine,
  RiMailLine,
  RiMore2Line,
  RiQuillPenLine,
  RiSearchLine,
  RiSendPlaneLine,
  RiSettings5Line,
} from '@remixicon/react';
import { AiIcon, CompanyLogo } from '../brand';

/* ------------------------------------------------------------------ */
/* Shared layout primitives (local to this file — no new dependencies) */
/* ------------------------------------------------------------------ */

type SectionProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

function Section({ title, description, children }: SectionProps) {
  return (
    <section className="mb-12">
      <h2 className="text-[20px] leading-[28px] font-semibold text-[#0f172a] mb-1">
        {title}
      </h2>
      {description ? (
        <p className="text-[14px] leading-[20px] text-[#475569] mb-6">
          {description}
        </p>
      ) : (
        <div className="mb-6" />
      )}
      {children}
    </section>
  );
}

type RowProps = {
  name: string;
  meta?: string;
  children: React.ReactNode;
};

function Row({ name, meta, children }: RowProps) {
  return (
    <div className="grid grid-cols-[240px_1fr] items-center gap-6 py-3 border-b border-[#e2e8f0] last:border-b-0">
      <div className="flex flex-col">
        <code className="text-[12px] leading-[18px] font-medium text-[#0f172a] font-mono">
          {name}
        </code>
        {meta ? (
          <span className="text-[12px] leading-[18px] text-[#64748b] font-mono">
            {meta}
          </span>
        ) : null}
      </div>
      <div className="flex items-center">{children}</div>
    </div>
  );
}

function Page({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen p-10 bg-white"
      style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
    >
      <div className="max-w-[960px] mx-auto">{children}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

const typeScale = [
  {
    name: 'heading/lg',
    sample: 'The quick brown fox jumps over the lazy dog',
    classes: 'text-[24px] leading-[32px] font-semibold',
    meta: 'Inter SemiBold · 24 / 32',
  },
  {
    name: 'heading/md',
    sample: 'The quick brown fox jumps over the lazy dog',
    classes: 'text-[20px] leading-[28px] font-semibold',
    meta: 'Inter SemiBold · 20 / 28',
  },
  {
    name: 'title-md',
    sample: 'The quick brown fox jumps over the lazy dog',
    classes: 'text-[18px] leading-[28px] font-semibold',
    meta: 'Inter SemiBold · 18 / 28',
  },
  {
    name: 'title-sm',
    sample: 'The quick brown fox jumps over the lazy dog',
    classes: 'text-[16px] leading-[24px] font-semibold',
    meta: 'Inter SemiBold · 16 / 24',
  },
  {
    name: 'body-sm-medium',
    sample: 'The quick brown fox jumps over the lazy dog',
    classes: 'text-[14px] leading-[20px] font-medium',
    meta: 'Inter Medium · 14 / 20',
  },
  {
    name: 'body-sm-regular',
    sample: 'The quick brown fox jumps over the lazy dog',
    classes: 'text-[14px] leading-[20px] font-normal',
    meta: 'Inter Regular · 14 / 20',
  },
  {
    name: 'body-xs-medium',
    sample: 'The quick brown fox jumps over the lazy dog',
    classes: 'text-[12px] leading-[18px] font-medium',
    meta: 'Inter Medium · 12 / 18',
  },
  {
    name: 'body-xs-regular',
    sample: 'The quick brown fox jumps over the lazy dog',
    classes: 'text-[12px] leading-[18px] font-normal',
    meta: 'Inter Regular · 12 / 18',
  },
] as const;

const textColors = [
  { name: 'text/neutral/default', hex: '#0f172a', onDark: false },
  { name: 'text/neutral/subtle', hex: '#475569', onDark: false },
  { name: 'text/white/adaptive', hex: '#ffffff', onDark: true },
  { name: 'text/accent/green/default', hex: '#086e3f', onDark: false },
  { name: 'text/accent/gray/default', hex: '#525252', onDark: false },
  // Post-#58 (#63): new tokens for Tiptap link mark + hover. Migrated ContentEditor CSS template
  // strings from inline hex to `var(--color-link)` / `var(--color-link-hover)`.
  { name: 'text/interactive/link', hex: '#2563eb', onDark: false },
  { name: 'text/interactive/link-hover', hex: '#1d4ed8', onDark: false },
] as const;

const backgroundColors = [
  { name: 'background/canvas/white', hex: '#ffffff' },
  { name: 'background/canvas/default', hex: '#f5f5f5' },
  { name: 'background/canvas/subtle', hex: '#fcfcfc' },
  { name: 'background/neutral/faint', hex: '#f8fafc' },
  { name: 'background/black/static', hex: '#000000' },
  { name: 'background/accents/green/default', hex: '#42cd83' },
  { name: 'background/accents/green/soft', hex: '#f2fdf6' },
  // Phase 15 — added: softest success wash, HelpfulnessTag up + Badge published.
  { name: 'background/success/wash-subtle', hex: '#f2fcf6' },
  { name: 'background/accents/gray/soft', hex: '#e5e5e5' },
  { name: 'background/accents/gray/default', hex: '#898989' },
  { name: 'background/accents/gray/strong', hex: '#2d2d2d' },
] as const;

const borderColors = [
  { name: 'border/slate_blue/subtle', hex: '#e2e8f0' },
  // Phase 15 — added: new `--color-border-faint` token (slate-300). Same hex as `default`,
  // distinct semantic (soft hairlines, chevron separators, pressed-state bg).
  { name: 'border/slate_blue/faint', hex: '#cbd5e1' },
  { name: 'border/slate_blue/default', hex: '#cbd5e1' },
  // Phase 15 — unified to #e2e8f0 (neutral-200 → slate-200, card + input borders unified).
  { name: 'border/neutral/subtle', hex: '#e2e8f0' },
] as const;

const iconColors = [
  { name: 'icon/neutral/default', hex: '#0f172a' },
  { name: 'icon/neutral/subtle', hex: '#475569' },
  // Phase 15 — `icon/neutral/faint` (typo'd hex) consolidated into `muted` (#64748b).
  // Backing token `--color-text-faint` was dropped as a duplicate of `--color-text-muted`.
  { name: 'icon/neutral/muted', hex: '#64748b' },
  { name: 'icon/white/static', hex: '#ffffff', onDark: true },
  { name: 'icon/success/subtle', hex: '#086e3f' },
  { name: 'icon/accents/green/default', hex: '#086e3f' },
  { name: 'icon/accents/purple/default', hex: '#6634ef' },
] as const;

const spacingScale = [
  { name: 'none', px: 0 },
  { name: 'xs', px: 2 },
  { name: 'sm', px: 4 },
  { name: 'md', px: 6 },
  { name: 'lg', px: 8 },
  { name: 'xl', px: 12 },
  { name: '2xl', px: 16 },
  { name: '3xl', px: 20 },
  { name: '4xl', px: 24 },
] as const;

const radiusScale = [
  { name: 'none', px: 0 },
  { name: 'xs', px: 2 },
  { name: 'sm', px: 4 },
  { name: 'md', px: 6 },
  { name: 'lg', px: 8 },
  { name: 'smooth', px: 999 },
] as const;

// Every Remix icon actually imported across packages/kb-ui/src/**
// Grouped by where they appear. Size reflects the default used at call sites.
const iconCatalog = [
  {
    group: 'Rail',
    entries: [
      { name: 'AiIcon (brand)', node: <AiIcon />, size: 16 },
      {
        name: 'CompanyLogo (brand)',
        node: <CompanyLogo size={24} />,
        size: 24,
      },
      { name: 'RiQuillPenLine', node: <RiQuillPenLine size={16} />, size: 16 },
      { name: 'RiFolderLine', node: <RiFolderLine size={16} />, size: 16 },
      {
        name: 'RiSettings5Line',
        node: <RiSettings5Line size={16} />,
        size: 16,
      },
    ],
  },
  {
    group: 'Explorer',
    entries: [
      { name: 'RiQuillPenLine', node: <RiQuillPenLine size={16} />, size: 16 },
      { name: 'RiSearchLine', node: <RiSearchLine size={16} />, size: 16 },
      { name: 'RiFolderLine', node: <RiFolderLine size={16} />, size: 16 },
      { name: 'RiFile3Line', node: <RiFile3Line size={16} />, size: 16 },
      {
        name: 'RiArrowRightSLine',
        node: <RiArrowRightSLine size={16} />,
        size: 16,
      },
      {
        name: 'RiArrowDownSLine',
        node: <RiArrowDownSLine size={16} />,
        size: 16,
      },
      { name: 'RiMore2Line', node: <RiMore2Line size={16} />, size: 16 },
    ],
  },
  {
    group: 'Breadcrumb',
    entries: [
      {
        name: 'RiLayoutLeftLine',
        node: <RiLayoutLeftLine size={14} />,
        size: 14,
      },
      {
        name: 'RiSendPlaneLine',
        node: <RiSendPlaneLine size={14} />,
        size: 14,
      },
      { name: 'RiCloseLine', node: <RiCloseLine size={16} />, size: 16 },
    ],
  },
  {
    group: 'Table',
    entries: [
      { name: 'RiFolderLine', node: <RiFolderLine size={16} />, size: 16 },
      { name: 'RiFile3Line', node: <RiFile3Line size={16} />, size: 16 },
      { name: 'RiMore2Line', node: <RiMore2Line size={16} />, size: 16 },
      {
        name: 'RiArrowRightSLine',
        node: <RiArrowRightSLine size={16} />,
        size: 16,
      },
    ],
  },
  {
    group: 'Buttons',
    entries: [
      { name: 'RiAddLine', node: <RiAddLine size={14} />, size: 14 },
      { name: 'RiDeleteBinLine', node: <RiDeleteBinLine size={14} />, size: 14 },
      {
        name: 'RiSendPlaneLine',
        node: <RiSendPlaneLine size={14} />,
        size: 14,
      },
    ],
  },
  {
    group: 'Other',
    entries: [
      { name: 'RiMailLine', node: <RiMailLine size={16} />, size: 16 },
      {
        name: 'RiBookOpenLine',
        node: <RiBookOpenLine size={22} />,
        size: 22,
      },
    ],
  },
] as const;

/* ------------------------------------------------------------------ */
/* Section renderers                                                   */
/* ------------------------------------------------------------------ */

function TypographySection() {
  return (
    <Section
      title="Typography"
      description="All text styles used across the KB component library. Font family is Inter everywhere."
    >
      <div className="rounded-lg border border-[#e2e8f0] px-6 bg-white">
        {typeScale.map((row) => (
          <Row key={row.name} name={row.name} meta={row.meta}>
            <span className={`${row.classes} text-[#0f172a]`}>
              {row.sample}
            </span>
          </Row>
        ))}
      </div>
    </Section>
  );
}

function TextColorSection() {
  return (
    <Section
      title="Text colors"
      description="text/* tokens. Sample renders in the token's color."
    >
      <div className="rounded-lg border border-[#e2e8f0] px-6 bg-white">
        {textColors.map((c) => (
          <Row key={c.name} name={c.name} meta={c.hex}>
            <div className="flex items-center gap-4">
              <span
                className="inline-block w-7 h-7 rounded border border-[#e2e8f0]"
                style={{ background: c.hex }}
                aria-hidden="true"
              />
              {c.onDark ? (
                <span
                  className="px-3 py-1 rounded text-[14px] leading-[20px] font-medium"
                  style={{ background: '#0f172a', color: c.hex }}
                >
                  The quick brown fox
                </span>
              ) : (
                <span
                  className="text-[14px] leading-[20px] font-medium"
                  style={{ color: c.hex }}
                >
                  The quick brown fox jumps over the lazy dog
                </span>
              )}
            </div>
          </Row>
        ))}
      </div>
    </Section>
  );
}

function BackgroundColorSection() {
  return (
    <Section
      title="Background colors"
      description="background/* tokens. Swatches outlined with border/slate_blue/subtle so white-on-white is still visible."
    >
      <div className="rounded-lg border border-[#e2e8f0] px-6 bg-white">
        {backgroundColors.map((c) => (
          <Row key={c.name} name={c.name} meta={c.hex}>
            <div
              className="w-12 h-12 rounded border border-[#e2e8f0]"
              style={{ background: c.hex }}
              aria-hidden="true"
            />
          </Row>
        ))}
      </div>
    </Section>
  );
}

function BorderColorSection() {
  return (
    <Section
      title="Border colors"
      description="border/* tokens. Shown as a 4px visible band so you can read the shade."
    >
      <div className="rounded-lg border border-[#e2e8f0] px-6 bg-white">
        {borderColors.map((c) => (
          <Row key={c.name} name={c.name} meta={c.hex}>
            <div className="flex items-center gap-4">
              <div
                className="w-48 h-3 rounded"
                style={{ background: c.hex }}
                aria-hidden="true"
              />
              <div
                className="w-12 h-12 rounded bg-white"
                style={{ border: `2px solid ${c.hex}` }}
                aria-hidden="true"
              />
            </div>
          </Row>
        ))}
      </div>
    </Section>
  );
}

function IconColorSection() {
  return (
    <Section
      title="Icon colors"
      description="icon/* tokens. Each row shows a Remix icon filled with the token color."
    >
      <div className="rounded-lg border border-[#e2e8f0] px-6 bg-white">
        {iconColors.map((c) => (
          <Row key={c.name} name={c.name} meta={c.hex}>
            {c.onDark ? (
              <span
                className="inline-flex items-center justify-center w-9 h-9 rounded"
                style={{ background: '#0f172a' }}
              >
                <RiFolderLine size={20} style={{ color: c.hex }} />
              </span>
            ) : (
              <RiFolderLine size={20} style={{ color: c.hex }} />
            )}
          </Row>
        ))}
      </div>
    </Section>
  );
}

function IconCatalogSection() {
  return (
    <Section
      title="Icons used"
      description="Every Remix icon actually imported in packages/kb-ui/src/**, rendered at its call-site size. Brand marks (AiIcon, CompanyLogo) appear at the top of the Rail group."
    >
      <div className="space-y-8">
        {iconCatalog.map((group) => (
          <div
            key={group.group}
            className="rounded-lg border border-[#e2e8f0] bg-white p-6"
          >
            <h3 className="text-[14px] leading-[20px] font-medium text-[#475569] mb-4 uppercase tracking-wide">
              {group.group}
            </h3>
            <div className="grid grid-cols-6 gap-4">
              {group.entries.map((entry, i) => (
                <div
                  key={`${group.group}-${entry.name}-${i}`}
                  className="flex flex-col items-center gap-2 p-3 rounded border border-[#e2e8f0] bg-[#fcfcfc]"
                >
                  <div
                    className="flex items-center justify-center text-[#0f172a]"
                    style={{ height: 32 }}
                  >
                    {entry.node}
                  </div>
                  <code className="text-[11px] leading-[16px] font-mono text-[#475569] text-center">
                    {entry.name}
                  </code>
                  <code className="text-[10px] leading-[14px] font-mono text-[#64748b]">
                    {entry.size}px
                  </code>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function IconSizesSection() {
  const sizes = [12, 14, 16, 20, 24] as const;
  return (
    <Section
      title="Icon sizes"
      description="RiFolderLine rendered at every size used across the library — eyeball to confirm size consistency."
    >
      <div className="rounded-lg border border-[#e2e8f0] bg-white p-6">
        <div className="flex items-end gap-8">
          {sizes.map((s) => (
            <div
              key={s}
              className="flex flex-col items-center gap-2"
            >
              <div
                className="flex items-center justify-center text-[#0f172a]"
                style={{ width: 32, height: 32 }}
              >
                <RiFolderLine size={s} />
              </div>
              <code className="text-[12px] leading-[18px] font-mono text-[#475569]">
                {s}px
              </code>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

function SpacingSection() {
  return (
    <Section
      title="Spacing scale"
      description="scale/space/* tokens. Each bar's width is the token's px value."
    >
      <div className="rounded-lg border border-[#e2e8f0] px-6 bg-white">
        {spacingScale.map((s) => (
          <Row key={s.name} name={`space/${s.name}`} meta={`${s.px}px`}>
            {s.px === 0 ? (
              <span className="text-[12px] leading-[18px] text-[#64748b] font-mono">
                (zero — no bar)
              </span>
            ) : (
              <div
                className="h-3 rounded-sm border border-[#e2e8f0]"
                style={{ width: `${s.px}px`, background: '#f8fafc' }}
                aria-hidden="true"
              />
            )}
          </Row>
        ))}
      </div>
    </Section>
  );
}

function RadiusSection() {
  return (
    <Section
      title="Radius scale"
      description="scale/radius/* tokens. Each square has the token's border-radius applied."
    >
      <div className="rounded-lg border border-[#e2e8f0] bg-white p-6">
        <div className="flex flex-wrap gap-8">
          {radiusScale.map((r) => (
            <div key={r.name} className="flex flex-col items-center gap-2">
              <div
                className="w-12 h-12 bg-[#f8fafc] border border-[#cbd5e1]"
                style={{ borderRadius: `${r.px}px` }}
                aria-hidden="true"
              />
              <code className="text-[12px] leading-[18px] font-mono text-[#0f172a]">
                radius/{r.name}
              </code>
              <code className="text-[11px] leading-[16px] font-mono text-[#64748b]">
                {r.px}px
              </code>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* Storybook meta + stories                                            */
/* ------------------------------------------------------------------ */

const meta: Meta = {
  title: 'Foundations/Overview',
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'white' },
  },
};

export default meta;
type Story = StoryObj;

export const Overview: Story = {
  name: 'Overview (all tokens)',
  render: () => (
    <Page>
      <header className="mb-10">
        <h1 className="text-[24px] leading-[32px] font-semibold text-[#0f172a]">
          Foundations
        </h1>
        <p className="text-[14px] leading-[20px] text-[#475569] mt-1">
          Every design token and every icon, on one page — source of visual
          verification for the KB component library. Extracted from the Figma
          library (file key 9aGp5t9fH1d0PXi4LMhOdb).
        </p>
      </header>

      <TypographySection />
      <TextColorSection />
      <BackgroundColorSection />
      <BorderColorSection />
      <IconColorSection />
      <IconCatalogSection />
      <IconSizesSection />
      <SpacingSection />
      <RadiusSection />
    </Page>
  ),
};

export const Typography: Story = {
  render: () => (
    <Page>
      <header className="mb-10">
        <h1 className="text-[24px] leading-[32px] font-semibold text-[#0f172a]">
          Typography
        </h1>
      </header>
      <TypographySection />
    </Page>
  ),
};

export const Colors: Story = {
  render: () => (
    <Page>
      <header className="mb-10">
        <h1 className="text-[24px] leading-[32px] font-semibold text-[#0f172a]">
          Colors
        </h1>
      </header>
      <TextColorSection />
      <BackgroundColorSection />
      <BorderColorSection />
      <IconColorSection />
    </Page>
  ),
};

export const Icons: Story = {
  render: () => (
    <Page>
      <header className="mb-10">
        <h1 className="text-[24px] leading-[32px] font-semibold text-[#0f172a]">
          Icons
        </h1>
      </header>
      <IconCatalogSection />
      <IconSizesSection />
    </Page>
  ),
};

export const SpacingAndRadius: Story = {
  name: 'Spacing & Radius',
  render: () => (
    <Page>
      <header className="mb-10">
        <h1 className="text-[24px] leading-[32px] font-semibold text-[#0f172a]">
          Spacing &amp; Radius
        </h1>
      </header>
      <SpacingSection />
      <RadiusSection />
    </Page>
  ),
};
