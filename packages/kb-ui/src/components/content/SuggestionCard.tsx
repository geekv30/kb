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

export type SuggestionKind = 'article-edit' | 'new-article' | 'move-article';
export type SuggestionImpact = 'high' | 'medium' | 'low';

export type SuggestionCardProps = {
  /**
   * Leading icon beside the title. Defaults to a pink-tinted
   * `RiFile3Line` (matches Figma doc-icon). Pass a custom node to
   * override (e.g. for `move-article` you may want a folder glyph).
   */
  icon?: React.ReactNode;
  title: string;
  description: string;
  kind: SuggestionKind;
  conversationCount: number;
  impact: SuggestionImpact;
  /**
   * Only used when `kind === 'move-article'` — rendered as
   * `{pathFrom} › {pathTo}` in the kind slot. Ignored otherwise.
   */
  pathFrom?: string;
  pathTo?: string;
  onClick?: () => void;
  className?: string;
};

/* ─────────────────────────────────────────────────────────────
 * Constants — tokens verified against Figma 74:8927
 *
 *   Brand pink   : #D92FFF (start of the AiIcon gradient — used for
 *                  all "suggestion" glyphs so they read as a family)
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

// mirror of --color-ai-pink — kept inline so Ri* icons accept color prop
const PINK = '#D92FFF';

/* ─────────────────────────────────────────────────────────────
 * Kind chip — icon + label in the meta row
 * ───────────────────────────────────────────────────────────── */

type KindChipProps = Pick<SuggestionCardProps, 'kind' | 'pathFrom' | 'pathTo'>;

function KindChip({ kind, pathFrom, pathTo }: KindChipProps) {
  if (kind === 'article-edit') {
    return (
      <span className="flex items-center gap-[6px] text-[14px] font-medium text-[#475569]">
        <RiPencilLine size={16} color={PINK} />
        Article Edit
      </span>
    );
  }

  if (kind === 'new-article') {
    return (
      <span className="flex items-center gap-[6px] text-[14px] font-medium text-[#475569]">
        <RiBookOpenLine size={16} color={PINK} />
        New Article
      </span>
    );
  }

  // move-article — tighten the path internal gap so the eye reads
  // `[folder] [pathFrom › pathTo]` as one unit. Outer chip→middot→count
  // gap stays 8 px (set by `mx-[8px]` in `MetaDot`).
  return (
    <span className="flex items-center gap-[6px] text-[14px] font-medium text-[#475569]">
      <RiFolderTransferLine size={16} color={PINK} />
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
        className="text-[14px] font-normal leading-5 text-[#64748b]"
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
        <KindChip kind={kind} pathFrom={pathFrom} pathTo={pathTo} />
        <MetaDot />
        <span className="flex items-center gap-[6px] text-[14px] font-medium text-[#475569]">
          <RiMailLine size={16} />
          {conversationCount} Conversations
        </span>
        <MetaDot />
        <span className="text-[12px] font-medium leading-5 text-[#475569] tracking-[0.04em]">
          {impact.toUpperCase()} IMPACT
        </span>
      </div>
    </div>
  );
}
