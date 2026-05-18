import * as React from 'react';
import { Settings01, ChevronUp, ChevronDown } from '@untitledui/icons';
import { cn } from '../../utils/cn';
import { Avatar } from '../primitives/Avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../primitives';
import {
  FieldLabel,
  FieldBox,
  ChevronSuffix,
  CharCounter,
} from './ArticleSettingsPanelAtoms';

/* ─────────────────────────────────────────────────────────────
 * Types
 * ───────────────────────────────────────────────────────────── */

export type ArticleSettingsPerson = {
  name: string;
  initials: string;
};

export type ArticleSettings = {
  author?: ArticleSettingsPerson;
  category?: string;
  slug?: string;
};

/**
 * Composition entry for the `sections` prop. When supplied, the panel renders
 * one `<FieldLabel>` + `content` block per entry instead of the General-tab
 * default fields. Visual chrome (outer padding, divider, vertical rhythm) is
 * shared with the default render path.
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
   * When supplied, the panel renders this list of sections instead of the
   * General-tab default fields (author, category, slug). Each entry's
   * `label` becomes a `FieldLabel`; the `content` is rendered as-is. The
   * panel chrome (header, divider, outer padding, vertical rhythm) is
   * identical to the default render path so consumers can extend the panel
   * without forking. When `undefined`, the default render path is preserved
   * exactly.
   *
   * Note: when `sections` is supplied, the General/SEO tabs are NOT
   * rendered — the consumer is fully driving content.
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
   * content column, after the section list (or after the default fields),
   * separated by the same divider used elsewhere in the panel. Useful for
   * save footers or compliance notes. When `undefined`, the footer renders
   * zero extra DOM and the default render path is preserved exactly.
   */
  footerSlot?: React.ReactNode;
};

// Figma `53:8464` shows the slug counter reading `14/32` — the slug field
// uses a 32-char max.
const SLUG_MAX = 32;

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
          <span className="text-text-disabled">Select author</span>
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
        {category ? (
          <span className="truncate">{category}</span>
        ) : (
          <span className="text-text-disabled">Select category</span>
        )}
        <ChevronSuffix />
      </FieldBox>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Field: Slug (with char counter, no trailing chevron — Figma 2945:7756)
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
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
 * SEO tab placeholder
 *
 * Chunk 2 of 5 of the SEO panel scaffold — the SEO tab body is wired up
 * but content is intentionally deferred to chunk 3. The placeholder uses
 * the same vertical rhythm as the field stack so swapping it for real
 * content in chunk 3 doesn't visibly shift the panel chrome.
 * ───────────────────────────────────────────────────────────── */

function SeoTabPlaceholder() {
  return (
    <div className="flex min-h-[120px] items-center justify-center px-2 py-6">
      <p className="text-center text-[13px] leading-[20px] font-normal text-text-muted">
        SEO settings will appear here in the next iteration.
      </p>
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
  // Tabs are panel-internal for now (chunk 2). If a future chunk needs
  // controlled tabs, we'll lift this to a prop.
  const [activeTab, setActiveTab] = React.useState<'general' | 'seo'>('general');

  // Treat component as controlled when `value` + `onChange` are both supplied.
  // Keep an internal mirror so the panel works without a controlling parent.
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
        // Aligns with ContentEditor.
        'flex flex-col rounded-[12px] border border-surface-muted bg-white',
        'shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-2px_rgba(0,0,0,0.10)]',
        // Width + outer padding swap on the compact variant.
        // Default 452 / py-6 px-[22px]  ─  Compact 380 / px-4 py-4.
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
              top spacing to match the smaller field gap. */}
          <div
            aria-hidden="true"
            className={cn('h-px w-full bg-card-border', compact ? 'mt-3' : 'mt-5')}
          />

          {sections ? (
            /* Consumer-driven sections — no tabs, just the section list
               using shared vertical rhythm. Preserved exactly so existing
               composition consumers (Storybook Playground, future
               extension callsites) keep working without churn. */
            <div
              className={cn(
                'flex flex-col',
                compact ? 'mt-3 gap-3' : 'mt-5 gap-5',
              )}
            >
              {sections.map((s) => (
                <div key={s.id} className="flex flex-col gap-1.5">
                  <FieldLabel>{s.label}</FieldLabel>
                  {s.content}
                </div>
              ))}
              {footerSlot ? (
                <>
                  <div aria-hidden="true" className="h-px w-full bg-card-border" />
                  {footerSlot}
                </>
              ) : null}
            </div>
          ) : (
            /* Default render path — General/SEO tabs above the field
               stack. Figma `2945:7756` places the tab group below the
               divider and above the field column. */
            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as 'general' | 'seo')}
              className={cn(compact ? 'mt-3 gap-3' : 'mt-5 gap-5')}
            >
              <TabsList aria-label="Article settings tabs">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="seo">SEO</TabsTrigger>
              </TabsList>

              <TabsContent
                value="general"
                className={cn('flex flex-col', compact ? 'gap-3' : 'gap-5')}
              >
                <AuthorField author={current.author} />
                <CategoryField category={current.category} />
                <SlugField
                  slug={current.slug}
                  onChange={(slug) => update({ slug })}
                />
                {footerSlot ? (
                  <>
                    <div aria-hidden="true" className="h-px w-full bg-card-border" />
                    {footerSlot}
                  </>
                ) : null}
              </TabsContent>

              <TabsContent value="seo">
                <SeoTabPlaceholder />
              </TabsContent>
            </Tabs>
          )}
        </div>
      )}
    </section>
  );
}
