import * as React from 'react';
import {
  Settings01,
  ChevronUp,
  ChevronDown,
  Calendar,
  Plus,
} from '@untitledui/icons';
import { cn } from '../../utils/cn';
import { Avatar } from '../primitives/Avatar';
import {
  FieldLabel,
  FieldBox,
  ChevronSuffix,
  CharCounter,
  Placeholder,
  TagChip,
  AddChipButton,
} from './ArticleSettingsPanelAtoms';

/* ─────────────────────────────────────────────────────────────
 * Types
 * ───────────────────────────────────────────────────────────── */

export type ArticleVisibility = 'Public' | 'Internal' | 'Draft';

export type ArticleSettingsPerson = {
  name: string;
  initials: string;
};

export type ArticleSettings = {
  author?: ArticleSettingsPerson;
  category?: string;
  slug?: string;
  tags?: string[];
  publishDate?: string; // e.g. "Apr 12, 2026"
  seoTitle?: string;
  visibility?: ArticleVisibility;
  reviewers?: ArticleSettingsPerson[];
};

/**
 * Composition entry for the `sections` prop. When supplied, the panel renders
 * one `<FieldLabel>` + `content` block per entry instead of the 8 hardcoded
 * fields. Visual chrome (outer padding, divider, vertical rhythm) is shared
 * with the default render path.
 */
export type ArticleSettingsSection = {
  id: string;
  label: string;
  content: React.ReactNode;
};

export type ArticleSettingsPanelProps = {
  value?: ArticleSettings;
  onChange?: (v: ArticleSettings) => void;
  defaultCollapsed?: boolean;
  /**
   * `compact` (default `false`) — renders at 380 px width with tighter outer
   * padding/gap, suitable for narrow rails (e.g. AI Gaps review experience).
   * Field heights and click targets are preserved so keyboard/touch UX is
   * unchanged from the default 452 px variant.
   */
  compact?: boolean;
  className?: string;
  /**
   * When supplied, the panel renders this list of sections instead of the 8
   * built-in fields (author, category, slug, tags, publishDate, seoTitle,
   * visibility, reviewers). Each entry's `label` becomes a `FieldLabel`; the
   * `content` is rendered as-is. The panel chrome (header, divider, outer
   * padding, vertical rhythm) is identical to the default render path so
   * consumers can extend the panel without forking. When `undefined`, the
   * default 8-field render path is preserved exactly.
   */
  sections?: ArticleSettingsSection[];
  /**
   * Optional content rendered inside the panel's top header band, on the
   * right side, after the title and collapse toggle. Useful for action
   * menus or status banners. When `undefined`, the header renders zero
   * extra DOM and its height/padding/bottom-border are byte-identical to
   * the default render path.
   */
  headerSlot?: React.ReactNode;
  /**
   * Optional content rendered as the last child of the panel's main
   * content column, after the section list (or after the 8 default
   * fields), separated by the same divider used elsewhere in the panel.
   * Useful for save footers or compliance notes. When `undefined`, the
   * footer renders zero extra DOM and the default render path is
   * preserved exactly.
   */
  footerSlot?: React.ReactNode;
};

// Figma `53:8464` shows the slug counter reading `14/32` — the slug field
// uses a 32-char max, not 60. SEO title remains 60.
const SLUG_MAX = 32;
const SEO_MAX = 60;

/* ─────────────────────────────────────────────────────────────
 * Field: Author
 * ───────────────────────────────────────────────────────────── */

function AuthorField({
  author,
  onOpen,
}: {
  author?: ArticleSettingsPerson;
  onOpen?: () => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel>Author</FieldLabel>
      <FieldBox onClick={onOpen} ariaLabel="Change author">
        {author ? (
          <>
            <Avatar
              initials={author.initials}
              name={author.name}
              className="size-5 text-[10px] leading-[16px]"
            />
            <span className="truncate">{author.name}</span>
          </>
        ) : (
          <Placeholder>Select author</Placeholder>
        )}
        <ChevronSuffix />
      </FieldBox>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Field: Category
 * ───────────────────────────────────────────────────────────── */

function CategoryField({
  category,
  onOpen,
}: {
  category?: string;
  onOpen?: () => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel>Category</FieldLabel>
      <FieldBox onClick={onOpen} ariaLabel="Change category">
        {category ? <span className="truncate">{category}</span> : <Placeholder>Select category</Placeholder>}
        <ChevronSuffix />
      </FieldBox>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Field: Slug (with char counter)
 * ───────────────────────────────────────────────────────────── */

function SlugField({
  slug,
  onChange,
}: {
  slug?: string;
  onChange?: (v: string) => void;
}) {
  const count = slug?.length ?? 0;
  const inputId = React.useId();
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <FieldLabel>
          <label htmlFor={inputId}>Article Slug</label>
        </FieldLabel>
        <CharCounter count={count} max={SLUG_MAX} />
      </div>
      <div
        className={cn(
          'flex w-full min-h-[40px] items-center gap-2 rounded-[8px] border border-card-border bg-white px-3',
          'focus-within:border-border-faint',
        )}
      >
        <input
          id={inputId}
          type="text"
          value={slug ?? ''}
          onChange={(e) => onChange?.(e.target.value.slice(0, SLUG_MAX))}
          maxLength={SLUG_MAX}
          placeholder="article-url-slug"
          className={cn(
            'flex-1 bg-transparent text-[14px] leading-[20px] font-normal text-text-primary',
            'placeholder:text-text-disabled focus:outline-none',
          )}
        />
        <ChevronDown aria-hidden="true" className="h-4 w-4 shrink-0 text-text-disabled" />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Field: Tags
 * ───────────────────────────────────────────────────────────── */

function TagsField({
  tags,
  onChange,
}: {
  tags: string[];
  onChange?: (tags: string[]) => void;
}) {
  const handleRemove = (idx: number) => {
    const next = tags.filter((_, i) => i !== idx);
    onChange?.(next);
  };
  const handleAdd = () => {
    onChange?.([...tags, 'New tag']);
  };
  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel>Tags</FieldLabel>
      <div
        className={cn(
          'flex w-full min-h-[40px] flex-wrap items-center gap-1.5 rounded-[8px] border border-card-border bg-white',
          'px-2 py-1.5',
        )}
      >
        {tags.length === 0 && <Placeholder>No tags yet</Placeholder>}
        {tags.map((t, i) => (
          <TagChip key={`${t}-${i}`} label={t} onRemove={() => handleRemove(i)} />
        ))}
        <AddChipButton onClick={handleAdd} />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Field: Publish date
 * ───────────────────────────────────────────────────────────── */

function PublishDateField({
  date,
  onOpen,
}: {
  date?: string;
  onOpen?: () => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel>Publish date</FieldLabel>
      <FieldBox onClick={onOpen} ariaLabel="Change publish date">
        <Calendar aria-hidden="true" className="h-4 w-4 shrink-0 text-text-muted" />
        {date ? <span className="truncate">{date}</span> : <Placeholder>Pick a date</Placeholder>}
      </FieldBox>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Field: SEO title (with char counter below input)
 * ───────────────────────────────────────────────────────────── */

function SeoTitleField({
  seoTitle,
  onChange,
}: {
  seoTitle?: string;
  onChange?: (v: string) => void;
}) {
  const count = seoTitle?.length ?? 0;
  const inputId = React.useId();
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <FieldLabel>
          <label htmlFor={inputId}>SEO title</label>
        </FieldLabel>
        <CharCounter count={count} max={SEO_MAX} />
      </div>
      <div
        className={cn(
          'flex w-full min-h-[40px] items-center gap-2 rounded-[8px] border border-card-border bg-white px-3',
          'focus-within:border-border-faint',
        )}
      >
        <input
          id={inputId}
          type="text"
          value={seoTitle ?? ''}
          onChange={(e) => onChange?.(e.target.value.slice(0, SEO_MAX))}
          maxLength={SEO_MAX}
          placeholder="SEO page title"
          className={cn(
            'flex-1 bg-transparent text-[14px] leading-[20px] font-normal text-text-primary',
            'placeholder:text-text-disabled focus:outline-none',
          )}
        />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Field: Visibility
 * ───────────────────────────────────────────────────────────── */

function VisibilityField({
  visibility,
  onOpen,
}: {
  visibility?: ArticleVisibility;
  onOpen?: () => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel>Visibility</FieldLabel>
      <FieldBox onClick={onOpen} ariaLabel="Change visibility">
        {visibility ? <span className="truncate">{visibility}</span> : <Placeholder>Select visibility</Placeholder>}
        <ChevronSuffix />
      </FieldBox>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Field: Reviewers
 *
 * Horizontal stack: each avatar overlaps the previous by -ml-2.
 * Trailing + Add circular button with dashed border.
 * ───────────────────────────────────────────────────────────── */

function ReviewersField({
  reviewers,
  onAdd,
}: {
  reviewers: ArticleSettingsPerson[];
  onAdd?: () => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel>Reviewers</FieldLabel>
      <div className="flex items-center">
        {reviewers.map((r, i) => (
          <Avatar
            key={`${r.initials}-${i}`}
            initials={r.initials}
            name={r.name}
            className={cn(
              'size-6 ring-2 ring-white',
              i > 0 && '-ml-2',
            )}
          />
        ))}
        <button
          type="button"
          onClick={onAdd}
          aria-label="Add reviewer"
          className={cn(
            'inline-flex size-6 items-center justify-center rounded-full border border-dashed border-border-faint',
            'bg-white text-text-muted ring-2 ring-white',
            reviewers.length > 0 && '-ml-2',
            'hover:bg-surface-subtle focus:outline-none focus:ring-2 focus:ring-black/10',
          )}
        >
          <Plus className="h-[14px] w-[14px]" />
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Main panel
 * ───────────────────────────────────────────────────────────── */

export function ArticleSettingsPanel({
  value,
  onChange,
  defaultCollapsed = false,
  compact = false,
  className,
  sections,
  headerSlot,
  footerSlot,
}: ArticleSettingsPanelProps) {
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed);

  // Treat component as controlled when `value` + `onChange` are both supplied.
  // Keep an internal mirror so that local demo interactions (tag × and
  // reviewer +) work without a controlling parent.
  const [internal, setInternal] = React.useState<ArticleSettings>(value ?? {});

  // Sync internal state whenever the incoming `value` prop changes identity —
  // callers that only pass `value` (no onChange) use it like defaultValue.
  React.useEffect(() => {
    if (value) setInternal(value);
  }, [value]);

  const current = internal;

  const update = (patch: Partial<ArticleSettings>) => {
    const next = { ...current, ...patch };
    setInternal(next);
    onChange?.(next);
  };

  const panelId = React.useId();

  return (
    <section
      data-kb-part="article-settings-panel"
      data-kb-variant={compact ? 'compact' : 'default'}
      className={cn(
        // Figma `53:8384` ships card border `#f1f5f9` (color-border).
        // Aligns with ContentEditor; replaces the prior `#e2e8f0` drift.
        'flex flex-col rounded-[12px] border border-surface-muted bg-white',
        'shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-2px_rgba(0,0,0,0.10)]',
        // Width + outer padding swap on the compact variant.
        // Default 452 / py-6 px-[22px] (24/22)  ─  Compact 380 / px-4 py-4 (16/16).
        compact ? 'w-[380px] px-4 py-4' : 'w-[452px] py-6 px-[22px]',
        className,
      )}
    >
      {/* Header */}
      {headerSlot ? (
        <div className="flex w-full items-center gap-2">
          <button
            type="button"
            aria-expanded={!collapsed}
            aria-controls={panelId}
            onClick={() => setCollapsed((c) => !c)}
            className={cn(
              'flex flex-1 items-center gap-2 text-left',
              'focus:outline-none focus:ring-2 focus:ring-black/10 rounded-[4px]',
            )}
          >
            <Settings01 aria-hidden="true" className="h-4 w-4 shrink-0 text-text-primary" />
            <span className="flex-1 text-[14px] font-medium leading-[20px] text-text-primary">Settings</span>
            {collapsed ? (
              <ChevronDown aria-hidden="true" className="h-4 w-4 shrink-0 text-text-primary" />
            ) : (
              <ChevronUp aria-hidden="true" className="h-4 w-4 shrink-0 text-text-primary" />
            )}
          </button>
          <div className="flex items-center">{headerSlot}</div>
        </div>
      ) : (
        <button
          type="button"
          aria-expanded={!collapsed}
          aria-controls={panelId}
          onClick={() => setCollapsed((c) => !c)}
          className={cn(
            'flex w-full items-center gap-2 text-left',
            'focus:outline-none focus:ring-2 focus:ring-black/10 rounded-[4px]',
          )}
        >
          <Settings01 aria-hidden="true" className="h-4 w-4 shrink-0 text-text-primary" />
          <span className="flex-1 text-[14px] font-medium leading-[20px] text-text-primary">Settings</span>
          {collapsed ? (
            <ChevronDown aria-hidden="true" className="h-4 w-4 shrink-0 text-text-primary" />
          ) : (
            <ChevronUp aria-hidden="true" className="h-4 w-4 shrink-0 text-text-primary" />
          )}
        </button>
      )}

      {!collapsed && (
        <div id={panelId} className="flex flex-col">
          {/* Divider directly below header. Compact tightens the divider's
              top spacing to match the 12-px field gap. */}
          <div
            aria-hidden="true"
            className={cn('h-px w-full bg-card-border', compact ? 'mt-3' : 'mt-5')}
          />

          {/* Field stack — default 20-px gap, compact 12-px gap. Field
              heights (`min-h-[40px]`) are unchanged so click/touch
              targets stay identical between variants.

              When `sections` is supplied, we render the consumer's list
              instead of the 8 built-in fields. Outer wrapper, gaps, and
              divider above remain identical so chrome is shared. When
              `sections` is undefined, the original 8-field render path
              is preserved byte-for-byte. */}
          <div
            className={cn('flex flex-col', compact ? 'mt-3 gap-3' : 'mt-5 gap-5')}
          >
            {sections ? (
              sections.map((s) => (
                <div key={s.id} className="flex flex-col gap-1.5">
                  <FieldLabel>{s.label}</FieldLabel>
                  {s.content}
                </div>
              ))
            ) : (
              <>
                <AuthorField author={current.author} />
                <CategoryField category={current.category} />
                <SlugField
                  slug={current.slug}
                  onChange={(slug) => update({ slug })}
                />
                <TagsField
                  tags={current.tags ?? []}
                  onChange={(tags) => update({ tags })}
                />
                <PublishDateField date={current.publishDate} />
                <SeoTitleField
                  seoTitle={current.seoTitle}
                  onChange={(seoTitle) => update({ seoTitle })}
                />
                <VisibilityField visibility={current.visibility} />
                <ReviewersField
                  reviewers={current.reviewers ?? []}
                  onAdd={() =>
                    update({
                      reviewers: [
                        ...(current.reviewers ?? []),
                        { name: 'New User', initials: 'NU' },
                      ],
                    })
                  }
                />
              </>
            )}
            {footerSlot ? (
              <>
                <div aria-hidden="true" className="h-px w-full bg-card-border" />
                {footerSlot}
              </>
            ) : null}
          </div>
        </div>
      )}
    </section>
  );
}
