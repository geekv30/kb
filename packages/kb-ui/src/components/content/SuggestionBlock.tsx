// Figma: 9aGp5t9fH1d0PXi4LMhOdb#74:10788 (frames 3, 6, 7, 8 — inline block variants)
//        9aGp5t9fH1d0PXi4LMhOdb#81:16926 (Addition — green block in body)
//        9aGp5t9fH1d0PXi4LMhOdb#81:16342 (Replace — red + green stacked)
//        9aGp5t9fH1d0PXi4LMhOdb#81:15737 (Removal — red block over existing content)
import * as React from 'react';
import { cn } from '../../utils/cn';
import type { AISuggestionType } from './ai-suggestion-types';

/* ─────────────────────────────────────────────────────────────
 * Types
 * ───────────────────────────────────────────────────────────── */

export type SuggestionBlockProps = {
  type: AISuggestionType;
  /**
   * Wrapped article content for `addition` and `removal`.
   * Unused when `type === 'replace'` — use `oldContent` and `newContent` instead.
   */
  children?: React.ReactNode;
  /** Replace-only: the content that is being replaced (rendered in red). */
  oldContent?: React.ReactNode;
  /** Replace-only: the content that replaces it (rendered in green). */
  newContent?: React.ReactNode;
  /**
   * Optional anchor id — used by the editor to `scrollIntoView` onto this block.
   * Emitted on the root element so a single scroll lands on the whole pair
   * (both halves) when `type === 'replace'`.
   */
  id?: string;
  className?: string;
};

/* ─────────────────────────────────────────────────────────────
 * Variant visuals
 *
 * Colors chosen to read legibly on a white article body and stay
 * distinct from Tailwind's default red/green hues so the diff
 * signal is obvious without overwhelming the surrounding text.
 * ───────────────────────────────────────────────────────────── */

type VariantKey = 'addition' | 'removal';

const VARIANT_CLASS: Record<VariantKey, string> = {
  // Addition → soft green wash + 3px green left bar.
  addition: 'bg-ai-addition-wash border-l-[3px] border-ai-addition',
  // Removal → soft red wash + 3px red left bar. Uses 10% red for body
  // readability over text (mirrors the design's pastel tint).
  removal: 'bg-ai-removal-wash border-l-[3px] border-ai-removal',
};

function HalfBlock({
  variant,
  children,
}: {
  variant: VariantKey;
  children: React.ReactNode;
}) {
  return (
    <div
      data-kb-part="suggestion-block-half"
      data-kb-variant={variant}
      className={cn(
        'rounded-[8px] px-4 py-3',
        VARIANT_CLASS[variant],
      )}
    >
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Component
 * ───────────────────────────────────────────────────────────── */

export function SuggestionBlock({
  type,
  children,
  oldContent,
  newContent,
  id,
  className,
}: SuggestionBlockProps) {
  const rootProps = {
    id,
    'data-kb-component': 'suggestion-block',
    'data-kb-type': type,
  } as const;

  if (type === 'replace') {
    return (
      <div
        {...rootProps}
        className={cn('flex flex-col gap-2', className)}
      >
        <HalfBlock variant="removal">{oldContent}</HalfBlock>
        <HalfBlock variant="addition">{newContent}</HalfBlock>
      </div>
    );
  }

  // Addition / Removal — single block wraps children.
  return (
    <div
      {...rootProps}
      className={cn(
        'rounded-[8px] px-4 py-3',
        VARIANT_CLASS[type],
        className,
      )}
    >
      {children}
    </div>
  );
}
