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
import { SeoTabBody, type SeoTabBodyValue } from './SeoTabBody';

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
  /* ── SEO tab fields (chunk 3) ─────────────────────────────── */
  /** Meta title displayed in search results / browser tab. ≤70 chars
   *  for the verdict to stay out of the hard-cap red state. */
  metaTitle?: string;
  /** Meta description shown in the search snippet. ≤160 chars. */
  metaDescription?: string;
  /** Base URL used for the auto-generated URL field — e.g.
   *  `"help.hiverhq.com"`. The full URL becomes
   *  `${urlBase}/${categoryPath.join('/')}/${slug}`. */
  urlBase?: string;
  /** Category-path crumbs that appear between the base and the slug
   *  in the auto-URL. */
  categoryPath?: string[];
  /** Admin-only override for the canonical URL. When non-empty, the
   *  disclosure opens automatically. */
  canonicalUrl?: string;
  /** When true, the article emits `noindex` / `nofollow` meta tags
   *  and the SERP preview is suppressed. */
  excludeFromSearch?: boolean;
  /** Ms timestamp of the last AI refine on the meta title /
   *  description. Drives the SEO panel's verdict-bump behaviour
   *  while staleness is true. */
  aiRefinedAt?: number;
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
  /**
   * Optional async hook to "refine" the SEO description via an AI
   * service. When supplied, the SEO tab renders a "✦ Refine with AI"
   * affordance pinned to the bottom-right of the Description textarea.
   * Clicking it disables the CTA, replaces the textarea with a
   * shimmer skeleton, and on resolve patches `metaDescription` +
   * `aiRefinedAt`. Errors are surfaced via `onToastError`.
   *
   * Forwarded as-is to `<SeoTabBody>`.
   */
  onRefineDescription?: (currentDescription: string) => Promise<string>;
  /**
   * Optional error toast hook for the Refine-with-AI flow. kb-ui
   * ships no toast primitive, so the demo wires this to its own
   * toast system.
   */
  onToastError?: (message: string) => void;
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
 * Adapt the panel's ArticleSettings value to SeoTabBody's value
 * shape. Only the SEO-relevant fields flow through.
 * ───────────────────────────────────────────────────────────── */

function toSeoTabValue(s: ArticleSettings): SeoTabBodyValue {
  return {
    metaTitle: s.metaTitle,
    metaDescription: s.metaDescription,
    urlBase: s.urlBase,
    slug: s.slug,
    categoryPath: s.categoryPath,
    canonicalUrl: s.canonicalUrl,
    excludeFromSearch: s.excludeFromSearch,
    aiRefinedAt: s.aiRefinedAt,
  };
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
  onRefineDescription,
  onToastError,
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

              {/* TabsContent mount fade: per emil-design-eng, content
                  swap without transition reads as a hard snap. Radix
                  unmounts the inactive panel on every state flip, so
                  a CSS transition between data-states won't fire (the
                  outgoing element is removed from the DOM before any
                  transition can complete). Instead, we use a 150ms
                  ease-out keyframe (`animate-kb-tabs-content-in`) that
                  runs once on mount of the newly-active panel.
                  `motion-safe:` gates the animation; reduced-motion
                  users get an instant swap. */}
              <TabsContent
                value="general"
                className={cn(
                  'flex flex-col',
                  compact ? 'gap-3' : 'gap-5',
                  'motion-safe:animate-kb-tabs-content-in',
                )}
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

              <TabsContent
                value="seo"
                className="motion-safe:animate-kb-tabs-content-in"
              >
                <SeoTabBody
                  value={toSeoTabValue(current)}
                  onChange={(patch) => update(patch)}
                  onRefineDescription={onRefineDescription}
                  onToastError={onToastError}
                />
              </TabsContent>
            </Tabs>
          )}
        </div>
      )}
    </section>
  );
}
