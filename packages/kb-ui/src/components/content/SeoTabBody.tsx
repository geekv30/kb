import * as React from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { Check, ChevronDown, ChevronUp, Copy01, InfoCircle } from '@untitledui/icons';
import { cn } from '../../utils/cn';
import { Field } from '../primitives/Field';
import { TextInput } from '../primitives/TextInput';
import { Textarea } from '../primitives/Textarea';
import { Switch } from '../primitives/Switch';
import { CodeChip } from '../primitives/CodeChip';
import { Button } from '../primitives/Button';
import { AiIcon } from '../brand/AiIcon';
import {
  MetaLengthMeter,
  computeMetaLengthVerdict,
  type MetaLengthVerdict,
} from './MetaLengthMeter';
import { SerpPreview } from './SerpPreview';

/* ─────────────────────────────────────────────────────────────
 * SeoTabBody — the SEO tab body of `ArticleSettingsPanel`.
 *
 * Renders the 6 SEO sections in order:
 *   1. Meta title          (TextInput + MetaLengthMeter, max 70)
 *   2. Description         (Textarea + MetaLengthMeter, max 160)
 *   3. URL                 (read-only TextInput + copy button)
 *   4. Advanced disclosure (collapsible canonical URL override)
 *   5. Exclude toggle      (Switch + helper paragraph w/ CodeChips)
 *   6. Search result live preview  (SerpPreview, swaps with NoPreviewState
 *      when excludeFromSearch is ON — cross-fade via kb-tabs-content-in)
 *
 * Figma references:
 *   - 2949:7844 — default state (preview rendered)
 *   - 2949:8306 — canonical URL disclosure expanded
 *   - 2949:9407 — exclude toggle ON (preview replaced by empty state)
 *
 * Chunk 3 scope: static fields only.
 * Chunk 4 adds the SERP preview card + empty state.
 * The "✦ Refine with AI" affordance on Description (chunk 5) is
 * intentionally NOT rendered here yet.
 *
 * Verdict algorithm + AI bump logic lives in `MetaLengthMeter.ts`
 * (`computeMetaLengthVerdict`). This component owns the "is the AI
 * bump still active?" staleness check via a ref-tracked
 * `aiRefinedAt` watermark: the bump applies while
 * `aiRefinedAt === lastSeenAiRefinedAt` (no keystrokes since the
 * refine landed). The next keystroke advances the watermark and
 * clears the bump.
 *
 * The component is fully controlled — every field flows through
 * `onChange`. Parents adapt store actions to the patch shape.
 * ───────────────────────────────────────────────────────────── */

export type SeoTabBodyValue = {
  metaTitle?: string;
  metaDescription?: string;
  /** Base URL, e.g. "help.hiverhq.com". Drives the auto-generated
   *  URL field. */
  urlBase?: string;
  /** Article slug — appears at the end of the auto-URL. */
  slug?: string;
  /** Category path crumbs — e.g. ["getting-started"]. Appear
   *  between urlBase and slug in the auto-URL. */
  categoryPath?: string[];
  /** When non-empty, the canonical override card is opened by
   *  default. */
  canonicalUrl?: string;
  excludeFromSearch?: boolean;
  /** Ms timestamp of the last AI refine. When set AND the user has
   *  not typed since (this component tracks staleness internally),
   *  the verdict gets a +1 bump towards optimal. */
  aiRefinedAt?: number;
};

export type SeoTabBodyProps = {
  value: SeoTabBodyValue;
  onChange: (patch: Partial<SeoTabBodyValue>) => void;
  /**
   * Optional async hook to "refine" the description via an AI service.
   * The current description is passed in; the resolved string replaces
   * the description and a fresh `aiRefinedAt` timestamp is written via
   * `onChange` (which bumps the verdict +1 toward optimal until the
   * user types again).
   *
   * When this prop is undefined the "✦ Refine with AI" CTA is not
   * rendered — the description renders as a plain Textarea. Consumers
   * (e.g. apps/demo) supply this via a mock or real service.
   *
   * Errors thrown from the promise are surfaced via `onToastError` if
   * provided; otherwise they are logged via `console.warn` and the
   * description is left untouched.
   */
  onRefineDescription?: (currentDescription: string) => Promise<string>;
  /**
   * Optional error toast hook. Used when `onRefineDescription` rejects.
   * kb-ui ships no toast primitive, so this is the demo's wiring seam.
   * The implementation receives a short user-facing message.
   */
  onToastError?: (message: string) => void;
  className?: string;
};

const META_TITLE_MAX = 70;
const META_DESC_MAX = 160;

const META_TITLE_TOOLTIP =
  'The title that appears in search engine results and browser tabs. Aim for 50–60 characters.';
const META_DESC_TOOLTIP =
  'A short summary shown under the title in search results. Aim for 120–155 characters.';
const URL_TOOLTIP =
  'The web address where this article will be published, derived from your article slug.';
const EXCLUDE_TOOLTIP =
  'When enabled, this article won\'t appear in Google, Bing, or other search results.';
const SEARCH_PREVIEW_TOOLTIP =
  'How this article will appear in a Google search result.';

/* ─────────────────────────────────────────────────────────────
 * Helpers
 * ───────────────────────────────────────────────────────────── */

function buildAutoUrl(value: SeoTabBodyValue): string {
  const base = value.urlBase?.trim() ?? '';
  const path = (value.categoryPath ?? []).filter(Boolean).join('/');
  const slug = value.slug?.trim() ?? '';
  const parts = [base, path, slug].filter(Boolean);
  return parts.join('/');
}

/* ─────────────────────────────────────────────────────────────
 * Copy-suffix button — reused by the URL field + canonical
 * override field.
 *
 * Self-contained: copies to clipboard on click, swaps the icon
 * in place from Copy01 → Check for ~1.5s as visual confirmation,
 * then reverts. No toast hook needed (this is the standard
 * inline-confirmation pattern used by GitHub, Linear, Vercel,
 * etc.).
 *
 * Motion (per emil-design-eng): 120ms ease-out opacity crossfade
 * — sub-200ms so it reads as instant confirmation. Both icons
 * are stacked absolutely so the swap is byte-aligned (no layout
 * shift). `motion-safe:` gates the transition so reduced-motion
 * users see an instant swap.
 *
 * Color: stays on the neutral text-muted / text-primary token
 * for both idle and copied states. A green tint here would add
 * noise to a 6×6 icon nested in a dense settings panel — the
 * shape change (copy → check) already carries the signal.
 * ───────────────────────────────────────────────────────────── */

const COPY_REVERT_MS = 1500;

function CopyButton({
  url,
  ariaLabel,
}: {
  url: string;
  ariaLabel: string;
}) {
  const [copied, setCopied] = React.useState(false);
  const timeoutRef = React.useRef<number | null>(null);

  // Clean up any in-flight revert timer on unmount so we don't
  // setState after teardown (e.g. tab swap during the 1.5s window).
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url).catch(() => {
        /* clipboard errors are non-fatal — keep the icon swap so the
           user still gets the same visual feedback they expect. */
      });
    }
    // Clear any pending revert and restart the 1.5s window. This
    // makes repeated clicks feel responsive — each click extends
    // the check icon's dwell time instead of racing the prior timer.
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
    }
    setCopied(true);
    timeoutRef.current = window.setTimeout(() => {
      setCopied(false);
      timeoutRef.current = null;
    }, COPY_REVERT_MS);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={ariaLabel}
      aria-live="polite"
      className={cn(
        'relative inline-flex h-6 w-6 items-center justify-center rounded-[4px]',
        'text-text-muted hover:text-text-primary hover:bg-surface-muted',
        'transition-colors',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-border-faint',
      )}
    >
      {/* Stacked icons — both rendered, opacity toggled so the swap
          is layout-stable. 120ms opacity crossfade, motion-safe-gated. */}
      <Copy01
        size={14}
        aria-hidden="true"
        className={cn(
          'absolute',
          'motion-safe:transition-opacity motion-safe:duration-[120ms] motion-safe:ease-out',
          copied ? 'opacity-0' : 'opacity-100',
        )}
      />
      <Check
        size={14}
        aria-hidden="true"
        className={cn(
          'absolute',
          'motion-safe:transition-opacity motion-safe:duration-[120ms] motion-safe:ease-out',
          copied ? 'opacity-100' : 'opacity-0',
        )}
      />
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Advanced disclosure — collapsible canonical URL override.
 *
 * Reveal motion: 220ms `grid-template-rows: 0fr → 1fr` per the
 * FileExplorerNav pattern. `motion-reduce:transition-none` for
 * a11y. The disclosure auto-opens when `canonicalUrl` is already
 * populated on mount (controlled toggle thereafter).
 * ───────────────────────────────────────────────────────────── */

// Canonical strong ease-out — wires to `--ease-out-strong` in tokens.css.
// Chunk 12: dropped the literal `cubic-bezier(...)` in favor of the var
// so disclosure motion stays in lockstep with the rest of the system.
const DISCLOSURE_EASE_OUT = 'var(--ease-out-strong)';
const DISCLOSURE_DURATION_MS = 220;

/* SerpPreview ↔ NoPreviewState crossfade transition (Section 6).
 *
 * Inline style instead of an arbitrary Tailwind class because
 * `transition-property: opacity, filter` needs an explicit comma-
 * separated list — Tailwind v4's `transition-[a,b]` arbitrary syntax
 * is ambiguous around comma handling and underscores get rewritten
 * to spaces, so the inline style is the most predictable surface.
 *
 * `motion-reduce:!transition-none` at the call site overrides this
 * for reduce-motion users, so they get an instant swap (the content
 * swap is a state change, not navigation — instant is the a11y default). */
const CROSSFADE_TRANSITION_STYLE: React.CSSProperties = {
  transitionProperty: 'opacity, filter',
  transitionDuration: '200ms',
  transitionTimingFunction: 'var(--ease-out-strong)',
};

function CanonicalOverrideDisclosure({
  canonicalUrl,
  onChange,
}: {
  canonicalUrl: string;
  onChange: (next: string) => void;
}) {
  // Auto-open if already populated; otherwise default closed.
  const [open, setOpen] = React.useState(() => canonicalUrl.trim() !== '');
  const inputId = React.useId();
  const panelId = React.useId();

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={panelId}
        // Figma 2949:7932 — 13px font-medium #64758b. Sits flush against
        // the URL input above (parent column owns the 6px gap), so no
        // additional top padding here.
        className={cn(
          'inline-flex items-center gap-1 self-start px-0.5 text-[13px] font-medium leading-[19px]',
          'text-text-muted hover:text-text-secondary transition-colors',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-border-faint rounded-[4px]',
        )}
      >
        <span>Advanced : override canonical URL</span>
        {open ? (
          <ChevronUp size={14} aria-hidden="true" className="text-text-muted" />
        ) : (
          <ChevronDown size={14} aria-hidden="true" className="text-text-muted" />
        )}
      </button>

      <div
        id={panelId}
        style={{
          display: 'grid',
          gridTemplateRows: open ? '1fr' : '0fr',
          transition: `grid-template-rows ${DISCLOSURE_DURATION_MS}ms ${DISCLOSURE_EASE_OUT}`,
        }}
        className="motion-reduce:transition-none"
      >
        <div style={{ overflow: 'hidden', minHeight: 0 }}>
          {/* Inset sub-surface — lighter bg + slate border + 12px radius.
              Padding consistent w/ the panel's 14px field rhythm. */}
          <div className="flex flex-col gap-2 rounded-[12px] border border-card-border bg-[#fcfcfc] p-3">
            <TextInput
              id={inputId}
              value={canonicalUrl}
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://example.com/canonical-url"
              suffix={
                <CopyButton
                  url={canonicalUrl}
                  ariaLabel="Copy canonical URL"
                />
              }
            />
            <p className="text-[13px] font-normal leading-[19px] text-text-muted">
              Use this when the same content lives on another domain you own
              (e.g. a developer docs site). Leave empty to use the
              auto-generated URL.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Main component
 * ───────────────────────────────────────────────────────────── */

/* ─────────────────────────────────────────────────────────────
 * RefineWithAIButton — pinned bottom-right inside the Description
 * textarea. Built on the Button primitive's `subtle` variant per
 * user direction so it reads as a real pressable pill (slate-100
 * background) instead of the prior plain text+icon affordance,
 * which visually collided with the now-hidden native resize handle.
 *
 * Size override: the default Button is h-8 / px-3 (32×N) — too tall
 * to sit cleanly inside the textarea's bottom-right inset. We
 * shrink to h-7 / px-2.5 (28×N) via className so the pill nests
 * inside the textarea's 8px inset without crowding the text rows
 * above it. Text size + sparkle size stay on the Button's defaults
 * so this stays close to the design system.
 *
 * Motion: inherited from Button — `motion-safe:active:scale-[0.97]`
 * + 120ms strong ease-out transition on transform/colors. Disabled
 * state (during refining) is handled by Button (opacity-50 +
 * pointer-events-none).
 * ───────────────────────────────────────────────────────────── */

function RefineWithAIButton({
  onClick,
  disabled,
}: {
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <Button
      variant="subtle"
      onClick={onClick}
      disabled={disabled}
      aria-label="Refine description with AI"
      data-kb-part="refine-with-ai-button"
      icon={<AiIcon size={12} aria-hidden="true" />}
      // Shrink Button's default h-8 / px-3 to h-7 / px-2.5 / text-[13px]
      // so the pill nests neatly inside the textarea inset (Figma
      // 2949:7886). Stays a subtle slate-100 pill on the surface.
      className="h-7 px-2.5 text-[13px] font-medium leading-[19px]"
    >
      Refine with AI
    </Button>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Main component
 * ───────────────────────────────────────────────────────────── */

export function SeoTabBody({
  value,
  onChange,
  onRefineDescription,
  onToastError,
  className,
}: SeoTabBodyProps) {
  const metaTitle = value.metaTitle ?? '';
  const metaDescription = value.metaDescription ?? '';
  const autoUrl = buildAutoUrl(value);
  const excluded = value.excludeFromSearch ?? false;

  // AI bump staleness watermark. The bump is active as long as the
  // user has not typed since the refine landed — i.e. the current
  // `aiRefinedAt` matches our tracked watermark. Any onChange call
  // advances the watermark (set during the update flow below), which
  // clears the bump until the next refine.
  //
  // We use a ref + state so the bump's visual effect re-renders when
  // the watermark changes, while the watermark itself doesn't trigger
  // its own update.
  const [aiBumpStaleAt, setAiBumpStaleAt] = React.useState<number | undefined>(
    undefined,
  );
  const aiBumpActive =
    value.aiRefinedAt !== undefined && value.aiRefinedAt !== aiBumpStaleAt;

  // Patches that mutate the user-edited text fields invalidate the AI
  // bump. Patches that don't (e.g. excludeFromSearch toggle) leave it
  // alone.
  const handlePatchWithBumpInvalidation = (patch: Partial<SeoTabBodyValue>) => {
    if (
      Object.prototype.hasOwnProperty.call(patch, 'metaTitle') ||
      Object.prototype.hasOwnProperty.call(patch, 'metaDescription')
    ) {
      // Mark current refine timestamp stale — subsequent renders will
      // see aiBumpActive === false until a fresh refine comes in.
      if (value.aiRefinedAt !== undefined && value.aiRefinedAt !== aiBumpStaleAt) {
        setAiBumpStaleAt(value.aiRefinedAt);
      }
    }
    onChange(patch);
  };

  // Only Description has a Refine-with-AI path, so only its verdict
  // is eligible for the +1 bump. The Meta title's verdict ignores
  // `aiBumpActive` — otherwise refining the description would also
  // bump the title's verdict, which is a scope leak across fields.
  const titleVerdict: MetaLengthVerdict = computeMetaLengthVerdict({
    count: metaTitle.length,
    field: 'metaTitle',
    aiBumpActive: false,
  });
  const descVerdict: MetaLengthVerdict = computeMetaLengthVerdict({
    count: metaDescription.length,
    field: 'description',
    aiBumpActive,
  });

  const titleHardCap = metaTitle.length > META_TITLE_MAX;
  const descHardCap = metaDescription.length > META_DESC_MAX;

  const metaTitleId = React.useId();
  const metaDescId = React.useId();
  const urlId = React.useId();

  /* ── Refine-with-AI in-flight state ─────────────────────────
   * Local: tracks whether `onRefineDescription` is currently
   * resolving. Drives:
   *   - Textarea `refining` (Skeleton overlay + readOnly)
   *   - RefineWithAIButton disabled (prevents re-fire)
   *   - MetaLengthMeter freeze (renders last-known count+verdict,
   *     does NOT recompute while the content is shimmering)
   *
   * The freeze is critical for perceived correctness: if the meter
   * recomputed against the live `value.metaDescription` (which is
   * stale during the refine — we haven't called onChange yet) the
   * user would see the verdict jiggle as the skeleton shimmers.
   * Worse: if a parent prematurely cleared the description while
   * refining was true, the meter would flash to "Short / red" mid-
   * flight, then snap back to a fresh verdict when the AI lands.
   *
   * `frozenMeterRef` captures the count+verdict snapshot at the
   * moment refining flips true. We render the snapshot via the
   * `hintEnd` slot while refining; once refining flips false we
   * resume rendering live values (which now reflect the AI patch).
   */
  const [refining, setRefining] = React.useState(false);
  const frozenMeterRef = React.useRef<{
    count: number;
    verdict: MetaLengthVerdict;
  } | null>(null);

  // Capture the snapshot one render BEFORE the Textarea starts
  // showing the Skeleton. We do this synchronously inside the
  // handleRefine callback so the snapshot reflects the pre-click
  // state, not whatever React might land on the next render.
  const handleRefine = React.useCallback(async () => {
    if (!onRefineDescription || refining) return;
    // Freeze the meter at the pre-refine state so it doesn't
    // recompute while the Skeleton is animating.
    frozenMeterRef.current = {
      count: metaDescription.length,
      verdict: descVerdict,
    };
    setRefining(true);
    try {
      const newText = await onRefineDescription(metaDescription);
      // Land the new text + bump the verdict via `aiRefinedAt`.
      // We bypass `handlePatchWithBumpInvalidation` here — that
      // helper clears the AI bump on metaDescription patches, but
      // THIS patch is the bump itself. Reset the staleness
      // watermark so `aiBumpActive` evaluates to true on the very
      // next render.
      setAiBumpStaleAt(undefined);
      onChange({ metaDescription: newText, aiRefinedAt: Date.now() });
    } catch (err) {
      // Surface the error to the demo's toast layer if wired;
      // otherwise log + keep the original text in place.
      const message = "Couldn't refine. Try again.";
      if (onToastError) {
        onToastError(message);
      } else if (typeof console !== 'undefined' && console.warn) {
        console.warn('[SeoTabBody] refineDescription failed:', err);
      }
    } finally {
      // Clear refining + drop the snapshot. The hintEnd slot
      // re-renders against fresh live values on the next render.
      setRefining(false);
      frozenMeterRef.current = null;
    }
  }, [
    onRefineDescription,
    refining,
    metaDescription,
    descVerdict,
    onChange,
    onToastError,
  ]);

  // While refining, the meter renders the snapshot. Otherwise it
  // renders live values. This is a pure render-time switch — no
  // extra state.
  const liveDescMeter = (
    <MetaLengthMeter
      count={metaDescription.length}
      max={META_DESC_MAX}
      verdict={descVerdict}
    />
  );
  const frozenDescMeter = frozenMeterRef.current ? (
    <MetaLengthMeter
      count={frozenMeterRef.current.count}
      max={META_DESC_MAX}
      verdict={frozenMeterRef.current.verdict}
    />
  ) : (
    liveDescMeter
  );

  return (
    // Section-to-section rhythm: 28px (Figma --scale/space/5xl). Sections
    // that internally span two visual rows (URL + canonical disclosure,
    // Exclude row + helper text) collapse their internal gap to 8px so
    // they read as a single unit; the 28px outer gap then separates them
    // from neighbouring sections at the same beat as every other field.
    <div className={cn('flex flex-col gap-7', className)}>
      {/* ── 1. Meta title ─────────────────────────────────────── */}
      <Field
        label="Meta title"
        tooltip={META_TITLE_TOOLTIP}
        htmlFor={metaTitleId}
        hintEnd={
          <MetaLengthMeter
            count={metaTitle.length}
            max={META_TITLE_MAX}
            verdict={titleVerdict}
          />
        }
      >
        <TextInput
          id={metaTitleId}
          value={metaTitle}
          onChange={(e) =>
            handlePatchWithBumpInvalidation({ metaTitle: e.target.value })
          }
          placeholder="Search, filter, and create email views"
          error={titleHardCap}
        />
      </Field>

      {/* ── 2. Description ───────────────────────────────────── */}
      <Field
        label="Description"
        tooltip={META_DESC_TOOLTIP}
        htmlFor={metaDescId}
        hintEnd={refining ? frozenDescMeter : liveDescMeter}
      >
        <Textarea
          id={metaDescId}
          value={metaDescription}
          onChange={(e) =>
            handlePatchWithBumpInvalidation({ metaDescription: e.target.value })
          }
          placeholder="Brief description of this article (shown in search results)"
          error={descHardCap}
          initialHeight={80}
          resize="vertical"
          refining={refining}
          refineSlot={
            onRefineDescription ? (
              <RefineWithAIButton
                onClick={handleRefine}
                disabled={refining}
              />
            ) : undefined
          }
        />
      </Field>

      {/* ── 3+4. URL (read-only + copy) and Advanced canonical override
          live in one column. The disclosure trigger reads as sub-text
          immediately under the URL input rather than as a standalone
          section — 6px gap between the URL input and the trigger keeps
          them visually paired. The outer column gap then separates this
          pair from the next section at the standard 28px beat. */}
      <div className="flex flex-col gap-1.5">
        <Field label="URL" tooltip={URL_TOOLTIP} htmlFor={urlId}>
          <TextInput
            id={urlId}
            value={autoUrl}
            readOnly
            suffix={
              <CopyButton
                url={autoUrl}
                ariaLabel="Copy URL"
              />
            }
          />
        </Field>
        <CanonicalOverrideDisclosure
          canonicalUrl={value.canonicalUrl ?? ''}
          onChange={(next) => onChange({ canonicalUrl: next })}
        />
      </div>

      {/* ── 5. Exclude from search engines ───────────────────── */}
      {/* Inner gap matches every other section's label-to-content beat
          (Field uses gap-1.5 / 6px). The helper paragraph reads at
          13px so the inline CodeChips (which are 13px medium) match
          the surrounding text weight — without this match, the chips
          look visually larger than their wrapping copy. */}
      <div className="flex flex-col gap-1.5">
        <ExcludeFromSearchRow
          checked={excluded}
          onChange={(next) => onChange({ excludeFromSearch: next })}
        />
        <p className="text-[13px] font-normal leading-[19px] text-text-muted">
          When enabled, this article will include{' '}
          <CodeChip>noindex</CodeChip> and <CodeChip>nofollow</CodeChip> and
          will not appear in Google, Bing, or other search results.
        </p>
      </div>

      {/* ── 6. Search result live preview ────────────────────── */}
      <Field label="Search result live preview" tooltip={SEARCH_PREVIEW_TOOLTIP}>
        {/* Stable-mount cross-fade between SerpPreview and NoPreviewState.
            Chunk 12 / emil-design-eng: the previous keyed-remount pattern
            unmounted one child and re-mounted the other on every flip —
            which played `kb-tabs-content-in` on the incoming child but
            left no exit animation on the outgoing one, producing a hard
            cut from the eye's perspective even though a fade was applied
            to one side. The textbook crossfade is BOTH children mounted
            at the same time, with the inactive one absolutely positioned
            and opacity-0, the active one at opacity-1, both transitioning
            simultaneously. A `min-h` floor (88px ≈ SerpPreview's natural
            height) prevents the wrapper from collapsing to the smaller
            child's height mid-transition. The outgoing child gets a soft
            `blur(2px)` for textbook crossfade quality — masks the
            two-objects-overlapping smell without being heavy-handed.
            All motion is `motion-safe:`-gated; reduce-motion users get
            an instant swap (this is a content swap, not a navigation, so
            the a11y default of "no motion" is fine here). */}
        <div className="relative min-h-[88px]">
          <div
            data-kb-part="serp-preview-slot"
            aria-hidden={excluded || undefined}
            style={CROSSFADE_TRANSITION_STYLE}
            className={cn(
              // Active child takes the layout; inactive is absolute on
              // top of the same space so they crossfade in place.
              excluded
                ? 'pointer-events-none absolute inset-0'
                : 'relative',
              'motion-reduce:!transition-none',
              excluded
                ? 'opacity-0 motion-safe:blur-[2px]'
                : 'opacity-100 motion-safe:blur-0',
            )}
          >
            <SerpPreview
              title={value.metaTitle}
              description={value.metaDescription}
              baseUrl={value.urlBase}
              breadcrumbPath={value.categoryPath}
            />
          </div>
          <div
            data-kb-part="serp-preview-empty-slot"
            aria-hidden={!excluded || undefined}
            style={CROSSFADE_TRANSITION_STYLE}
            className={cn(
              excluded
                ? 'relative'
                : 'pointer-events-none absolute inset-0',
              'motion-reduce:!transition-none',
              excluded
                ? 'opacity-100 motion-safe:blur-0'
                : 'opacity-0 motion-safe:blur-[2px]',
            )}
          >
            <NoPreviewState />
          </div>
        </div>
      </Field>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
 * NoPreviewState — internal-only empty state for Section 6.
 *
 * Same card chrome as SerpPreview (#fcfcfc bg, surface-muted
 * border, 12px radius, 16/12 padding) with a single centered
 * muted line. Not exported — strictly paired with SeoTabBody's
 * preview-section swap.
 *
 * Figma 2949:9552 / 2949:9555.
 * ───────────────────────────────────────────────────────────── */

function NoPreviewState() {
  return (
    <div
      data-kb-part="serp-preview-empty"
      className={cn(
        'flex w-full items-center justify-center rounded-[12px]',
        'border border-surface-muted bg-[#fcfcfc] px-4 py-3',
      )}
    >
      <span className="text-[13px] font-normal leading-[19px] text-text-muted">
        no preview available
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
 * ExcludeFromSearchRow — label-on-left + tooltip + Switch-on-right.
 *
 * The Field primitive renders label+input vertically with the
 * tooltip in a separate row, so we re-implement the label+tooltip
 * cluster here to keep label and Switch on the same horizontal
 * row. Visual chrome is byte-identical to Field's label cluster
 * (same font sizes, same InfoCircle button, same tooltip portal).
 * ───────────────────────────────────────────────────────────── */

function ExcludeFromSearchRow({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  const id = React.useId();
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-1">
        <label
          htmlFor={id}
          className="text-[13px] font-medium leading-[19px] text-text-primary"
        >
          Exclude from search engines
        </label>
        <Tooltip.Provider delayDuration={150}>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <button
                type="button"
                aria-label="More information"
                className="inline-flex items-center text-text-disabled outline-none focus-visible:text-text-meta"
              >
                <InfoCircle size={14} aria-hidden="true" />
              </button>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content
                side="top"
                sideOffset={6}
                className="z-50 max-w-xs rounded-md bg-text-primary px-2 py-1 text-[12px] leading-[18px] text-white shadow-md"
              >
                {EXCLUDE_TOOLTIP}
                <Tooltip.Arrow className="fill-text-primary" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </Tooltip.Provider>
      </div>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onChange}
        aria-label="Exclude from search engines"
      />
    </div>
  );
}
