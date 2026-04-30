// Figma: 9aGp5t9fH1d0PXi4LMhOdb#74:8927 (isolated cards; context: 74:8928)
import * as React from 'react';
import {
  RiFile3Line,
  RiPencilLine,
  RiBookOpenLine,
  RiFolderTransferLine,
  RiMailLine,
} from '@remixicon/react';
import { cn } from '../../utils/cn';

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
 * Constants — tokens verified against Figma 74:8927
 *
 *   Brand pink   : #D92FFF (start of the AiIcon gradient — used for
 *                  all "suggestion" glyphs so they read as a family)
 *   Title text   : #0f172a
 *   Description  : #64758b (muted body — matches Figma screenshot)
 *   Divider      : #f1f5f9 (1px, full inner width)
 *   Meta label   : #475569 (meta text — matches kb-ui tokens)
 *   Meta dim     : #94a3b8 (middot separator)
 *   Border       : #e5e5e5
 *   Hover bg     : #f8fafc
 *   Radius       : 12 (card)
 *   Padding      : 20/24 (inner)
 * ───────────────────────────────────────────────────────────── */

// mirror of --color-ai-pink — kept inline so Ri* icons accept color prop
const PINK = '#D92FFF';

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
export const DEFAULT_SUGGESTION_KINDS: Record<string, SuggestionKindMeta> = {
  'article-edit': {
    label: 'Article Edit',
    icon: <RiPencilLine size={16} color={PINK} />,
  },
  'new-article': {
    label: 'New Article',
    icon: <RiBookOpenLine size={16} color={PINK} />,
  },
  'move-article': {
    label: 'Move Article',
    icon: <RiFolderTransferLine size={16} color={PINK} />,
  },
};

export type SuggestionCardProps = {
  /**
   * Leading icon beside the title. Defaults to a pink-tinted
   * `RiFile3Line` (matches Figma doc-icon). Pass a custom node to
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
      <span className="flex items-center gap-[6px] text-[14px] font-medium text-[#475569]">
        {entry.icon}
        <span className="inline-flex items-center gap-1">
          {pathFrom ?? ''}
          <span aria-hidden className="text-[#94a3b8]">
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
      <span className="flex items-center gap-[6px] text-[14px] font-medium text-[#475569]">
        {kind}
      </span>
    );
  }

  return (
    <span className="flex items-center gap-[6px] text-[14px] font-medium text-[#475569]">
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
      className="mx-[8px] text-[14px] font-medium text-[#94a3b8] leading-none select-none"
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
  const titleIcon = icon ?? <RiFile3Line size={18} color={PINK} />;

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
        clickable && 'cursor-pointer hover:bg-[#f8fafc]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f172a]/20',
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
        <span className="text-[14px] font-semibold leading-5 text-[#0f172a] truncate">
          {title}
        </span>
      </div>

      {/* Row 2 — description. Aligns to card left padding, not under the
          title text — verified against Figma 74:8927 (description starts
          flush with icon, not indented past it). */}
      <p
        data-kb-part="suggestion-description"
        className="text-[14px] font-normal leading-5 text-[#64758b]"
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

      {/* Row 3 — meta row: kind · conversations · impact */}
      <div
        data-kb-part="suggestion-meta"
        className="flex items-center flex-wrap"
      >
        <KindChip kind={kind} pathFrom={pathFrom} pathTo={pathTo} registry={registry} />
        {meta !== undefined ? (
          <>
            <MetaDot />
            {meta}
          </>
        ) : (
          <>
            <MetaDot />
            <span className="flex items-center gap-[6px] text-[14px] font-medium text-[#475569]">
              <RiMailLine size={16} />
              {conversationCount} Conversations
            </span>
            <MetaDot />
            <span className="text-[12px] font-medium leading-5 text-[#475569] tracking-[0.04em]">
              {impact.toUpperCase()} IMPACT
            </span>
          </>
        )}
      </div>
    </div>
  );
}
