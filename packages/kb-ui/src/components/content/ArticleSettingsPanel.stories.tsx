import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../tokens.css';
import {
  ArticleSettingsPanel,
  type ArticleSettings,
  type ArticleSettingsSection,
} from './ArticleSettingsPanel';
import {
  FieldBox,
  ChevronSuffix,
  CharCounter,
} from './ArticleSettingsPanelAtoms';
import { Avatar } from '../primitives/Avatar';

/* ─────────────────────────────────────────────────────────────
 * ArticleSettingsPanel Playground — exercises the composition
 * API on `ArticleSettingsPanel`:
 *   1. `sections`   — replace the built-in General/SEO tab content
 *                     with a hand-composed list using lifted atoms
 *                     (FieldBox, ChevronSuffix, CharCounter).
 *                     Three sections mirror the General-tab default
 *                     fields; the fourth adds an "SEO Description"
 *                     textarea section the panel has no built-in
 *                     equivalent for.
 *   2. `headerSlot` — a "Custom layout" pill on the right of the
 *                     panel header.
 *   3. `footerSlot` — a single muted line below the divider.
 * Slug is wired to React.useState so the counter is live.
 * ───────────────────────────────────────────────────────────── */

const populatedSettings: ArticleSettings = {
  author: { name: 'Varun Kelkar', initials: 'VK' },
  category: 'Managing emails',
  slug: 'how-to-reset-your-password',
};

const meta: Meta<typeof ArticleSettingsPanel> = {
  title: 'Components/Article/Article Settings Panel',
  component: ArticleSettingsPanel,
  parameters: { layout: 'padded' },
  globals: { backgrounds: { value: 'canvas' } },
};
export default meta;

function CustomSeoDescriptionSection({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <FieldBox as="div" className="min-h-[80px] items-start py-2">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        aria-label="SEO description"
        placeholder="Write a short SEO description for this article"
        className="flex-1 resize-none bg-transparent text-[14px] leading-[20px] font-normal text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none"
      />
    </FieldBox>
  );
}

function ArticleSettingsPanelPlayground() {
  const [seoDescription, setSeoDescription] = React.useState('');
  const [slug, setSlug] = React.useState<string>(populatedSettings.slug ?? '');

  const SLUG_MAX = 32;

  const sections: ArticleSettingsSection[] = [
    {
      id: 'author',
      label: 'Author',
      content: (
        <FieldBox ariaLabel="Change author">
          {populatedSettings.author ? (
            <>
              <Avatar
                initials={populatedSettings.author.initials}
                name={populatedSettings.author.name}
                className="size-5 text-[10px] leading-[16px]"
              />
              <span className="truncate">{populatedSettings.author.name}</span>
            </>
          ) : (
            <span className="text-text-disabled">Select author</span>
          )}
          <ChevronSuffix />
        </FieldBox>
      ),
    },
    {
      id: 'category',
      label: 'Category',
      content: (
        <FieldBox ariaLabel="Change category">
          {populatedSettings.category ? (
            <span className="truncate">{populatedSettings.category}</span>
          ) : (
            <span className="text-text-disabled">Select category</span>
          )}
          <ChevronSuffix />
        </FieldBox>
      ),
    },
    {
      id: 'slug',
      label: 'Article Slug',
      content: (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-end -mt-[26px]">
            <CharCounter count={slug.length} max={SLUG_MAX} />
          </div>
          <FieldBox as="div">
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value.slice(0, SLUG_MAX))}
              maxLength={SLUG_MAX}
              placeholder="article-url-slug"
              className="flex-1 bg-transparent text-[14px] leading-[20px] font-normal text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none"
            />
          </FieldBox>
        </div>
      ),
    },
    /* Custom section — no built-in equivalent. */
    {
      id: 'seoDescription',
      label: 'SEO Description',
      content: (
        <CustomSeoDescriptionSection
          value={seoDescription}
          onChange={setSeoDescription}
        />
      ),
    },
  ];

  const headerPill = (
    <span className="inline-flex h-[22px] items-center rounded-full bg-[#f1f5f9] px-2 text-[12px] font-medium leading-[18px] text-[#475569]">
      Custom layout
    </span>
  );

  const footerNote = (
    <p className="text-[12px] leading-[18px] font-normal text-[#94a3b8]">
      SEO fields are auto-checked on publish.
    </p>
  );

  return (
    <ArticleSettingsPanel
      value={populatedSettings}
      defaultCollapsed={false}
      sections={sections}
      headerSlot={headerPill}
      footerSlot={footerNote}
    />
  );
}

export const Playground: StoryObj<typeof ArticleSettingsPanel> = {
  render: () => <ArticleSettingsPanelPlayground />,
};

/* ─────────────────────────────────────────────────────────────
 * Default tabs — exercises the built-in General/SEO tab path
 * with the trimmed 3-field General body and the SEO placeholder.
 * ───────────────────────────────────────────────────────────── */

export const DefaultTabs: StoryObj<typeof ArticleSettingsPanel> = {
  render: () => (
    <ArticleSettingsPanel value={populatedSettings} />
  ),
};
