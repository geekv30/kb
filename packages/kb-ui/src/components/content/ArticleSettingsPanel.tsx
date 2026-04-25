import * as React from 'react';
import {
  RiSettings5Line,
  RiArrowUpSLine,
  RiArrowDownSLine,
  RiCalendar2Line,
  RiAddLine,
  RiCloseLine,
} from '@remixicon/react';
import { cn } from '../../utils/cn';
import { Avatar } from '../primitives/Avatar';

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
};

// Figma `53:8464` shows the slug counter reading `14/32` — the slug field
// uses a 32-char max, not 60. SEO title remains 60.
const SLUG_MAX = 32;
const SEO_MAX = 60;

/* ─────────────────────────────────────────────────────────────
 * Shared field atoms
 *
 * Every field uses a label row + 40-tall input box. The input box
 * is a div (not an <input>) because these controls are demo-only
 * for v1 — they open no real dropdown menus. See design doc.
 * ───────────────────────────────────────────────────────────── */

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-[14px] font-medium leading-[20px] text-[#0f172a]">
      {children}
    </label>
  );
}

type FieldBoxProps = {
  children: React.ReactNode;
  className?: string;
  /** When true, the box renders as a <button> so it is focusable. */
  as?: 'button' | 'div';
  onClick?: () => void;
  ariaLabel?: string;
};

function FieldBox({ children, className, as = 'button', onClick, ariaLabel }: FieldBoxProps) {
  const baseClass = cn(
    'flex w-full min-h-[40px] items-center gap-2 rounded-[8px] border border-[#e5e5e5] bg-white px-3',
    'text-[14px] leading-[20px] font-normal text-[#0f172a]',
    'transition-colors focus:outline-none focus:border-[#cbd5e1]',
    'hover:border-[#cbd5e1]',
    className,
  );

  if (as === 'button') {
    return (
      <button type="button" onClick={onClick} aria-label={ariaLabel} className={cn(baseClass, 'text-left cursor-pointer')}>
        {children}
      </button>
    );
  }
  return <div className={baseClass}>{children}</div>;
}

function ChevronSuffix() {
  return (
    <RiArrowDownSLine
      aria-hidden="true"
      className="ml-auto h-4 w-4 shrink-0 text-[#94a3b8]"
    />
  );
}

function CharCounter({ count, max }: { count: number; max: number }) {
  return (
    <span className="text-[12px] font-normal leading-[18px] text-[#94a3b8] tabular-nums">
      {count}/{max}
    </span>
  );
}

function Placeholder({ children }: { children: React.ReactNode }) {
  return <span className="text-[#94a3b8]">{children}</span>;
}

/* ─────────────────────────────────────────────────────────────
 * Tag chip (custom — Badge primitive is not quite right:
 * Badge is pill-y but doesn't have the × close affordance and
 * has specific variant colors. Panel tags match spec better
 * with a dedicated chip).
 * ───────────────────────────────────────────────────────────── */

type TagChipProps = {
  label: string;
  onRemove?: () => void;
};

function TagChip({ label, onRemove }: TagChipProps) {
  return (
    <span
      className={cn(
        'inline-flex h-[22px] items-center gap-1.5 rounded-full bg-[#f1f5f9] pl-2 pr-1',
        'text-[12px] font-medium leading-[18px] text-[#0f172a]',
      )}
    >
      <span>{label}</span>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${label}`}
          className={cn(
            'inline-flex h-[16px] w-[16px] items-center justify-center rounded-full',
            'text-[#64748b] hover:bg-[#e2e8f0] hover:text-[#0f172a]',
            'focus:outline-none focus:ring-2 focus:ring-black/10',
          )}
        >
          <RiCloseLine className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}

function AddChipButton({ onClick, label = '+ Add' }: { onClick?: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex h-[22px] items-center rounded-full border border-dashed border-[#cbd5e1] bg-white px-2',
        'text-[12px] font-medium leading-[18px] text-[#475569]',
        'hover:bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-black/10',
      )}
    >
      {label}
    </button>
  );
}

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
          'flex w-full min-h-[40px] items-center gap-2 rounded-[8px] border border-[#e5e5e5] bg-white px-3',
          'focus-within:border-[#cbd5e1]',
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
            'flex-1 bg-transparent text-[14px] leading-[20px] font-normal text-[#0f172a]',
            'placeholder:text-[#94a3b8] focus:outline-none',
          )}
        />
        <RiArrowDownSLine aria-hidden="true" className="h-4 w-4 shrink-0 text-[#94a3b8]" />
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
          'flex w-full min-h-[40px] flex-wrap items-center gap-1.5 rounded-[8px] border border-[#e5e5e5] bg-white',
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
        <RiCalendar2Line aria-hidden="true" className="h-4 w-4 shrink-0 text-[#64748b]" />
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
          'flex w-full min-h-[40px] items-center gap-2 rounded-[8px] border border-[#e5e5e5] bg-white px-3',
          'focus-within:border-[#cbd5e1]',
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
            'flex-1 bg-transparent text-[14px] leading-[20px] font-normal text-[#0f172a]',
            'placeholder:text-[#94a3b8] focus:outline-none',
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
            'inline-flex size-6 items-center justify-center rounded-full border border-dashed border-[#cbd5e1]',
            'bg-white text-[#64748b] ring-2 ring-white',
            reviewers.length > 0 && '-ml-2',
            'hover:bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-black/10',
          )}
        >
          <RiAddLine className="h-[14px] w-[14px]" />
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
        'flex flex-col rounded-[12px] border border-[#e2e8f0] bg-white',
        'shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-2px_rgba(0,0,0,0.10)]',
        // Width + outer padding swap on the compact variant.
        // Default 452 / py-6 px-[22px] (24/22)  ─  Compact 380 / px-4 py-4 (16/16).
        compact ? 'w-[380px] px-4 py-4' : 'w-[452px] py-6 px-[22px]',
        className,
      )}
    >
      {/* Header */}
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
        <RiSettings5Line aria-hidden="true" className="h-4 w-4 shrink-0 text-[#0f172a]" />
        <span className="flex-1 text-[14px] font-medium leading-[20px] text-[#0f172a]">Settings</span>
        {collapsed ? (
          <RiArrowDownSLine aria-hidden="true" className="h-4 w-4 shrink-0 text-[#0f172a]" />
        ) : (
          <RiArrowUpSLine aria-hidden="true" className="h-4 w-4 shrink-0 text-[#0f172a]" />
        )}
      </button>

      {!collapsed && (
        <div id={panelId} className="flex flex-col">
          {/* Divider directly below header. Compact tightens the divider's
              top spacing to match the 12-px field gap. */}
          <div
            aria-hidden="true"
            className={cn('h-px w-full bg-[#e5e5e5]', compact ? 'mt-3' : 'mt-5')}
          />

          {/* Field stack — default 20-px gap, compact 12-px gap. Field
              heights (`min-h-[40px]`) are unchanged so click/touch
              targets stay identical between variants. */}
          <div
            className={cn('flex flex-col', compact ? 'mt-3 gap-3' : 'mt-5 gap-5')}
          >
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
          </div>
        </div>
      )}
    </section>
  );
}
