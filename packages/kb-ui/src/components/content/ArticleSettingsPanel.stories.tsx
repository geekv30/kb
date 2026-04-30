import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { RiCalendar2Line, RiAddLine } from '@remixicon/react';
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
  Placeholder,
  TagChip,
  AddChipButton,
} from './ArticleSettingsPanelAtoms';
import { Avatar } from '../primitives/Avatar';

/* ─────────────────────────────────────────────────────────────
 * ArticleSettingsPanel Playground — exercises the full new
 * composition API on `ArticleSettingsPanel`:
 *   1. `sections`   — replace the 8 built-in fields with a hand-
 *                     composed list using lifted atoms (FieldBox,
 *                     ChevronSuffix, Placeholder, CharCounter,
 *                     TagChip, AddChipButton). Eight match the
 *                     built-in defaults; the ninth adds an "SEO
 *                     Description" textarea section the panel has
 *                     no built-in equivalent for.
 *   2. `headerSlot` — a "Custom layout" pill on the right of the
 *                     panel header.
 *   3. `footerSlot` — a single muted line below the divider.
 * Multiple fields are wired to React.useState so the editing
 * affordances (slug/seoTitle counters, tag chips) are live.
 * ───────────────────────────────────────────────────────────── */

const populatedSettings: ArticleSettings = {
  author: { name: 'Varun Kelkar', initials: 'VK' },
  category: 'Managing emails',
  slug: 'how-to-reset-your-password',
  tags: ['Security', 'Account', 'Password'],
  publishDate: 'Apr 12, 2026',
  seoTitle: 'Reset Your Password — Hiver Help',
  visibility: 'Public',
  reviewers: [
    { name: 'Ananya Kapoor', initials: 'AK' },
    { name: 'Maya Rao', initials: 'MR' },
    { name: 'Tanvi Shah', initials: 'TS' },
  ],
};

const customSettings: ArticleSettings = populatedSettings;

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
  const [tags, setTags] = React.useState<string[]>(customSettings.tags ?? []);
  const [slug, setSlug] = React.useState<string>(customSettings.slug ?? '');
  const [seoTitle, setSeoTitle] = React.useState<string>(customSettings.seoTitle ?? '');

  const SLUG_MAX = 32;
  const SEO_MAX = 60;

  const sections: ArticleSettingsSection[] = [
    {
      id: 'author',
      label: 'Author',
      content: (
        <FieldBox ariaLabel="Change author">
          {customSettings.author ? (
            <>
              <Avatar
                initials={customSettings.author.initials}
                name={customSettings.author.name}
                className="size-5 text-[10px] leading-[16px]"
              />
              <span className="truncate">{customSettings.author.name}</span>
            </>
          ) : (
            <Placeholder>Select author</Placeholder>
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
          {customSettings.category ? (
            <span className="truncate">{customSettings.category}</span>
          ) : (
            <Placeholder>Select category</Placeholder>
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
            <ChevronSuffix />
          </FieldBox>
        </div>
      ),
    },
    {
      id: 'tags',
      label: 'Tags',
      content: (
        <div className="flex w-full min-h-[40px] flex-wrap items-center gap-1.5 rounded-[8px] border border-[#e5e5e5] bg-white px-2 py-1.5">
          {tags.length === 0 && <Placeholder>No tags yet</Placeholder>}
          {tags.map((t, i) => (
            <TagChip
              key={`${t}-${i}`}
              label={t}
              onRemove={() => setTags(tags.filter((_, idx) => idx !== i))}
            />
          ))}
          <AddChipButton onClick={() => setTags([...tags, 'New tag'])} />
        </div>
      ),
    },
    {
      id: 'publishDate',
      label: 'Publish date',
      content: (
        <FieldBox ariaLabel="Change publish date">
          <RiCalendar2Line aria-hidden="true" className="h-4 w-4 shrink-0 text-[#64758b]" />
          {customSettings.publishDate ? (
            <span className="truncate">{customSettings.publishDate}</span>
          ) : (
            <Placeholder>Pick a date</Placeholder>
          )}
        </FieldBox>
      ),
    },
    {
      id: 'seoTitle',
      label: 'SEO title',
      content: (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-end -mt-[26px]">
            <CharCounter count={seoTitle.length} max={SEO_MAX} />
          </div>
          <FieldBox as="div">
            <input
              type="text"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value.slice(0, SEO_MAX))}
              maxLength={SEO_MAX}
              placeholder="SEO page title"
              className="flex-1 bg-transparent text-[14px] leading-[20px] font-normal text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none"
            />
          </FieldBox>
        </div>
      ),
    },
    {
      id: 'visibility',
      label: 'Visibility',
      content: (
        <FieldBox ariaLabel="Change visibility">
          {customSettings.visibility ? (
            <span className="truncate">{customSettings.visibility}</span>
          ) : (
            <Placeholder>Select visibility</Placeholder>
          )}
          <ChevronSuffix />
        </FieldBox>
      ),
    },
    {
      id: 'reviewers',
      label: 'Reviewers',
      content: (
        <div className="flex items-center">
          {(customSettings.reviewers ?? []).map((r, i) => (
            <Avatar
              key={`${r.initials}-${i}`}
              initials={r.initials}
              name={r.name}
              className={`size-6 ring-2 ring-white${i > 0 ? ' -ml-2' : ''}`}
            />
          ))}
          <button
            type="button"
            aria-label="Add reviewer"
            className={`inline-flex size-6 items-center justify-center rounded-full border border-dashed border-[#cbd5e1] bg-white text-[#64758b] ring-2 ring-white hover:bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-black/10${(customSettings.reviewers?.length ?? 0) > 0 ? ' -ml-2' : ''}`}
          >
            <RiAddLine className="h-[14px] w-[14px]" />
          </button>
        </div>
      ),
    },
    /* The 9th section — the new one with no built-in equivalent. */
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
      value={customSettings}
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
