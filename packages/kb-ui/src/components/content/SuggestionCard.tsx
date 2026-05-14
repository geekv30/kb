// Figma: 9aGp5t9fH1d0PXi4LMhOdb#74:8927 (isolated cards; context: 74:8928)
import * as React from 'react';
import {
  File02,
  Pencil02,
  BookOpen01,
  FolderDownload,
  Mail01,
  Stars02,
} from '@untitledui/icons';
import { cn } from '../../utils/cn';
import { tokens } from '../../tokens';

/* ─────────────────────────────────────────────────────────────
 * Types
 * ───────────────────────────────────────────────────────────── */

/**
 * Built-in suggestion kinds. Kept exported as a back-compat alias
 * for the 3 default keys in `DEFAULT_SUGGESTION_KINDS`.
 *
 * The runtime `kind` prop accepts ANY string — pass a custom
 * `kindRegistry` to register additional kinds.
 */
export type SuggestionKind = 'article-edit' | 'new-article' | 'move-article';
export type SuggestionImpact = 'high' | 'medium' | 'low';

/**
 * Shape of an entry in the kind registry. The `label` is a string
 * because chip text is plain. The `icon` is a `ReactNode` so that
 * consumers can either pass a pre-rendered Remix glyph (with size /
 * color baked in to match the rest of the registry) or a custom
 * element of their choice.
 */
export type SuggestionKindMeta = {
  label: string;
  icon: React.ReactNode;
};

/* ─────────────────────────────────────────────────────────────
 * Constants — tokens verified against Figma 1958:45549
 *
 *   AI accent    : AI brand gradient (magenta → peach) — applied
 *                  to the kind-chip glyph (Pencil02 / BookOpen01 /
 *                  FolderDownload) AND the suggestions-chip glyph
 *                  (Stars02). See AI_GRADIENT_STROKE below — the
 *                  gradient stops mirror the brand AiIcon so all
 *                  AI-accent glyphs read as one visual family.
 *   Icon neutral : #0f172a — title leading icon (File02) and the
 *                  Mail01 meta icon. Matches Figma variable
 *                  `icon/neutral/default` (#0f172a) which the
 *                  reference frame uses for both glyphs.
 *   Title text   : #0f172a
 *   Description  : #64748b (muted body — matches Figma screenshot)
 *   Divider      : #f1f5f9 (1px, full inner width)
 *   Meta label   : #475569 (meta text — matches kb-ui tokens)
 *   Meta dim     : #94a3b8 (middot separator)
 *   Border       : #e5e5e5
 *   Hover bg     : #f8fafc
 *   Radius       : 12 (card)
 *   Padding      : 20/24 (inner)
 * ───────────────────────────────────────────────────────────── */

// mirror of --color-text-primary — same hex as Figma
// `icon/neutral/default` (#0f172a). Used on the title leading icon
// and the Mail01 conversations icon, matching the Figma reference.
const ICON_NEUTRAL = tokens.color.textPrimary;

/* ─────────────────────────────────────────────────────────────
 * AI gradient — magenta → peach, mirrored from the AiIcon brand
 * mark (`packages/kb-ui/src/components/brand/AiIcon.tsx`).
 *
 * The gradient id is suffixed with `-chip` so it cannot collide
 * with `kb-ai-icon-gradient` (the brand AiIcon) if both render on
 * the same screen. Stops, offsets, and direction are byte-identical
 * to the brand mark so all "AI-accent" glyphs read as one family.
 *
 *   Stop 0 (offset 0): #D92FFF (magenta)
 *   Stop 1 (offset 1): #FFC987 (peach)
 *   Direction: linear, gradientUnits="objectBoundingBox",
 *              x1=-0.07961 y1=0.49054 → x2=0.90309 y2=0.38804
 *
 * Untitled UI icons accept `color` only — internally they apply it
 * via `stroke={color}` on the root <svg>. Because SVG resolves
 * `url(#id)` references across the document, passing
 * `color="url(#kb-ai-gradient-chip)"` and rendering the <defs>
 * once at card root paints each chip icon with the gradient.
 * ───────────────────────────────────────────────────────────── */

const AI_GRADIENT_CHIP_ID = 'kb-ai-gradient-chip';
const AI_GRADIENT_STROKE = `url(#${AI_GRADIENT_CHIP_ID})`;

function AiGradientDefs() {
  // Rendered once per SuggestionCard. The <svg> is zero-sized and
  // aria-hidden — its sole purpose is to host the <defs> so that
  // sibling icons can reference `url(#kb-ai-gradient-chip)`.
  return (
    <svg
      width={0}
      height={0}
      aria-hidden
      focusable={false}
      style={{ position: 'absolute', width: 0, height: 0 }}
    >
      <defs>
        <linearGradient
          id={AI_GRADIENT_CHIP_ID}
          gradientUnits="objectBoundingBox"
          x1="-0.07961"
          y1="0.49054"
          x2="0.90309"
          y2="0.38804"
        >
          <stop offset="0" stopColor="#D92FFF" />
          <stop offset="1" stopColor="#FFC987" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/**
 * Default registry — covers the 3 historical built-in kinds. Custom
 * consumers spread or replace this map via the `kindRegistry` prop.
 *
 * Note: the chip rendered for `move-article` is special-cased inside
 * the component when both `pathFrom` and `pathTo` are passed (it
 * renders `pathFrom › pathTo` instead of the static label, mirroring
 * the original behavior). The label here is the fallback used when
 * the path props are absent.
 */
/**
 * All meta-row icons render at 14px — matches Figma 1958:45561 exactly
 * (Pencil02 / BookOpen01 / FolderDownload / Mail01 all sit in identical
 * 14×14 boxes in the Tags Container). No size compensation: copy Figma
 * literally per the project's 1:1 fidelity rule.
 */
export const DEFAULT_SUGGESTION_KINDS: Record<string, SuggestionKindMeta> = {
  'article-edit': {
    label: 'Article Edit',
    icon: <Pencil02 size={14} color={AI_GRADIENT_STROKE} />,
  },
  'new-article': {
    label: 'New Article',
    icon: <BookOpen01 size={14} color={AI_GRADIENT_STROKE} />,
  },
  'move-article': {
    label: 'Move Article',
    icon: <FolderDownload size={14} color={AI_GRADIENT_STROKE} />,
  },
};

export type SuggestionCardProps = {
  /**
   * Leading icon beside the title. Defaults to a pink-tinted
   * `File02` (matches Figma doc-icon). Pass a custom node to
   * override (e.g. for `move-article` you may want a folder glyph).
   */
  icon?: React.ReactNode;
  title: string;
  description: string;
  /**
   * Kind key. Resolved against `kindRegistry ?? DEFAULT_SUGGESTION_KINDS`
   * to pick the chip icon + label. Unknown kinds render the raw key
   * as the label and no icon — never throws.
   */
  kind: SuggestionKind | (string & {});
  /**
   * Optional — number of AI suggestions for this article. When
   * defined, renders a `<Stars02 gradient> {N} Suggestion(s)` chip
   * BETWEEN the kind chip and the Conversations chip. Singular/plural
   * follows the same convention as `conversationCount`. Left optional
   * so existing usages of `SuggestionCard` keep their 3-chip layout
   * unchanged.
   */
  suggestionCount?: number;
  conversationCount: number;
  impact: SuggestionImpact;
  /**
   * Only used when `kind === 'move-article'` — rendered as
   * `{pathFrom} › {pathTo}` in the kind slot. Ignored otherwise.
   */
  pathFrom?: string;
  pathTo?: string;
  /**
   * Optional registry of custom kinds. Merged with the default
   * registry semantics: if a key is present here it wins, otherwise
   * the component looks up the key in `DEFAULT_SUGGESTION_KINDS`.
   *
   * Consumers who want to ADD a kind without losing the defaults
   * should spread: `kindRegistry={{ ...DEFAULT_SUGGESTION_KINDS, ... }}`.
   */
  kindRegistry?: Record<string, SuggestionKindMeta>;
  /**
   * Replaces the `· N Conversations · IMPACT` portion of the meta
   * row with arbitrary content. The kind chip is always rendered
   * first, regardless of this prop. When undefined, the existing
   * `conversationCount` + `impact` shorthand is used.
   */
  meta?: React.ReactNode;
  onClick?: () => void;
  className?: string;
};

/* ─────────────────────────────────────────────────────────────
 * Kind chip — icon + label in the meta row
 * ───────────────────────────────────────────────────────────── */

type KindChipProps = {
  kind: string;
  pathFrom?: string;
  pathTo?: string;
  registry: Record<string, SuggestionKindMeta>;
};

function KindChip({ kind, pathFrom, pathTo, registry }: KindChipProps) {
  const entry = registry[kind];

  // move-article keeps its dynamic-path rendering — preserves the
  // original behavior even when consumers swap in a custom registry,
  // as long as the `move-article` key is still present in the registry.
  // Renders byte-identically to the pre-refactor code, including the
  // edge case where both path props are undefined.
  if (kind === 'move-article' && entry) {
    return (
      <span className="flex items-center gap-[2px] text-[12px] leading-[18px] font-medium text-text-meta">
        {entry.icon}
        <span className="inline-flex items-center gap-1">
          {pathFrom ?? ''}
          <span aria-hidden className="text-text-disabled">
            ›
          </span>
          {pathTo ?? ''}
        </span>
      </span>
    );
  }

  if (!entry) {
    // Unknown kind — render the raw key as label, no icon. Don't throw.
    return (
      <span className="flex items-center gap-[2px] text-[12px] leading-[18px] font-medium text-text-meta">
        {kind}
      </span>
    );
  }

  return (
    <span className="flex items-center gap-[2px] text-[12px] leading-[18px] font-medium text-text-meta">
      {entry.icon}
      {entry.label}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Dot separator (middot)
 * ───────────────────────────────────────────────────────────── */

function MetaDot() {
  return (
    <span
      aria-hidden
      className="text-[13px] leading-[19px] font-medium text-text-muted select-none"
    >
      ·
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────
 * SuggestionCard
 *
 * Full-card click target (Enter/Space when onClick is supplied).
 * Uses a <div role="button"> rather than a <button> because the
 * card contains a horizontal rule and multi-line flow text — button
 * content model restricts these in some browsers.
 * ───────────────────────────────────────────────────────────── */

export function SuggestionCard({
  icon,
  title,
  description,
  kind,
  suggestionCount,
  conversationCount,
  impact,
  pathFrom,
  pathTo,
  kindRegistry,
  meta,
  onClick,
  className,
}: SuggestionCardProps) {
  const clickable = typeof onClick === 'function';

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (!clickable) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick?.();
      }
    },
    [onClick, clickable],
  );

  const registry = kindRegistry ?? DEFAULT_SUGGESTION_KINDS;
  const titleIcon = icon ?? <File02 size={18} color={ICON_NEUTRAL} />;

  return (
    <div
      data-kb-component="suggestion-card"
      data-kb-impact={impact}
      data-kb-kind={kind}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={clickable ? onClick : undefined}
      onKeyDown={clickable ? handleKeyDown : undefined}
      className={cn(
        'flex w-full flex-col gap-[12px]',
        'rounded-[12px] border border-card-border bg-white',
        'px-[20px] py-[20px]',
        'transition-colors duration-150',
        clickable && 'cursor-pointer hover:bg-surface-subtle',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-primary/20',
        className,
      )}
    >
      {/* Row 1 — title + leading icon */}
      <div
        data-kb-part="suggestion-title"
        className="flex items-center gap-[8px]"
      >
        <span aria-hidden className="flex size-[20px] items-center justify-center shrink-0">
          {titleIcon}
        </span>
        <span className="text-[14px] font-semibold leading-5 text-text-primary truncate">
          {title}
        </span>
      </div>

      {/* Row 2 — description. Aligns to card left padding, not under the
          title text — verified against Figma 74:8927 (description starts
          flush with icon, not indented past it). */}
      <p
        data-kb-part="suggestion-description"
        className="text-[14px] font-normal leading-5 text-text-muted"
      >
        {description}
      </p>

      {/* Divider — matches Figma 74:8927 (slightly more visible than
          the `#f1f5f9` token; same tone as the card border). */}
      <div
        aria-hidden
        data-kb-part="suggestion-divider"
        className="h-px bg-card-divider w-full"
      />

      {/* Row 3 — meta row: kind · [suggestions] · conversations · impact
          Figma 1958:45561 — Tags Container. 12px gap between chips,
          icons 14×14, chip labels 12px/18px Medium, divider dot 13px/19px
          in text-text-muted (#64748b), HIGH IMPACT label 11px/18px Medium
          with 0.22px letter-spacing (≈0.02em). The `suggestionCount`
          chip uses the AI gradient stroke (Stars02 glyph) and is only
          rendered when the prop is defined — keeping existing 3-chip
          callsites unchanged. */}
      <div
        data-kb-part="suggestion-meta"
        className="flex items-center flex-wrap gap-x-[12px] gap-y-[4px]"
      >
        {/* Shared <defs> for the AI gradient — referenced by stroke=url(#…)
            on every Untitled UI line icon that carries the AI accent in
            this card (kind chip + suggestions chip). Rendered once at the
            top of the meta row so it's adjacent to its consumers. */}
        <AiGradientDefs />
        <KindChip kind={kind} pathFrom={pathFrom} pathTo={pathTo} registry={registry} />
        {meta !== undefined ? (
          <>
            <MetaDot />
            {meta}
          </>
        ) : (
          <>
            {suggestionCount !== undefined && (
              <>
                <MetaDot />
                <span
                  data-kb-part="suggestion-count"
                  className="flex items-center gap-[2px] text-[12px] leading-[18px] font-medium text-text-meta"
                >
                  <Stars02 size={14} color={AI_GRADIENT_STROKE} />
                  {suggestionCount}{' '}
                  {suggestionCount === 1 ? 'Suggestion' : 'Suggestions'}
                </span>
              </>
            )}
            <MetaDot />
            <span className="flex items-center gap-[2px] text-[12px] leading-[18px] font-medium text-text-meta">
              <Mail01 size={14} color={ICON_NEUTRAL} />
              {conversationCount} Conversations
            </span>
            <MetaDot />
            <span className="text-[11px] leading-[18px] font-medium text-text-meta tracking-[0.02em]">
              {impact.toUpperCase()} IMPACT
            </span>
          </>
        )}
      </div>
    </div>
  );
}
