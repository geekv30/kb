// Figma: 9aGp5t9fH1d0PXi4LMhOdb#137:4022 (Addition — per-sentence green highlights)
//        9aGp5t9fH1d0PXi4LMhOdb#137:4132 (Removal — per-sentence red highlights)
//        9aGp5t9fH1d0PXi4LMhOdb#74:10788 (AI Gaps editor — inline review flow)
import * as React from 'react';
import { cn } from '../../utils/cn';
import { tokens } from '../../tokens';
import type { AISuggestionType } from './ai-suggestion-types';

/* ─────────────────────────────────────────────────────────────
 * Types
 *
 * Per-sentence mode (preferred):
 *   <SuggestionBlock type="addition" sentences={["First.", "Second."]} />
 *   Each entry renders in its own highlighted block; gaps between blocks
 *   so the white background reads through. Matches Figma 137:4022 /
 *   137:4132.
 *
 *   Each entry can be either:
 *     - A string — rendered as 16px body text inside a single highlight
 *       span. CSS `box-decoration-break: clone` keeps the wash tight to
 *       each wrapped line (no full-width slab).
 *     - A ReactNode — full consumer control over what gets highlighted.
 *       Use `<SuggestionHighlight>` inside the node to mark which inline
 *       text receives the wash; everything outside it stays on the white
 *       background. Useful for numbered list items where the numeral
 *       should sit outside the highlight, or headings that need
 *       custom typography.
 *
 * Block mode (legacy fallback):
 *   <SuggestionBlock type="addition">{children}</SuggestionBlock>
 *   Renders a single block-level wash. Used when the content can't be
 *   meaningfully decomposed into sentences (icons, embeds, mixed media).
 *
 * Replace:
 *   `oldSentences` + `newSentences` for the per-sentence path,
 *   `oldContent` + `newContent` for the block-level path.
 * ───────────────────────────────────────────────────────────── */

export type SuggestionSentence = string | React.ReactNode;

export type SuggestionBlockProps = {
  type: AISuggestionType;
  /** Per-sentence content for `addition` and `removal`. */
  sentences?: SuggestionSentence[];
  /** Replace-only per-sentence pair. */
  oldSentences?: SuggestionSentence[];
  newSentences?: SuggestionSentence[];
  /** Legacy block-mode children for `addition` / `removal`. */
  children?: React.ReactNode;
  /** Legacy block-mode replace halves. */
  oldContent?: React.ReactNode;
  newContent?: React.ReactNode;
  /** Optional anchor id — used by the editor to `scrollIntoView`. */
  id?: string;
  /**
   * Optional suggestion identifier. When set, emitted as
   * `data-suggestion-id` on the outermost element so consumers (e.g. the
   * AI Gaps editor) can resolve a suggestion's DOM anchor via
   * `useAnchorPositions` without coupling to the legacy `id="s1|s2|s3"`
   * convention.
   */
  suggestionId?: string;
  className?: string;
};

/* ─────────────────────────────────────────────────────────────
 * Variant visuals — exact hex values from Figma 137:4022 / 137:4132.
 * Lighter than the legacy block washes so the highlight reads as a
 * pastel preview tint rather than a saturated full-block fill.
 * ───────────────────────────────────────────────────────────── */

type VariantKey = 'addition' | 'removal';

const SENTENCE_BG: Record<VariantKey, string> = {
  addition: tokens.color.highlight,
  // #fce8e8 — pastel removal wash; not yet in design tokens. TODO: tokenize in Chunk 4.
  removal: '#fce8e8',
};

const BLOCK_VARIANT_CLASS: Record<VariantKey, string> = {
  addition: 'bg-ai-addition-wash border-l-[3px] border-ai-addition',
  removal: 'bg-ai-removal-wash border-l-[3px] border-ai-removal',
};

/* ─────────────────────────────────────────────────────────────
 * <SuggestionHighlight> — public helper for JSX-entry consumers.
 *
 * Reads `--kb-suggestion-bg` from its closest SuggestionBlock ancestor
 * and applies it as the inline highlight wash. Use inside JSX entries
 * passed to `sentences[]` when only a portion of the entry should be
 * highlighted (e.g. text-after-numeral).
 *
 *   <NumberedItem index={1}>
 *     <SuggestionHighlight>Open the app on your device</SuggestionHighlight>
 *   </NumberedItem>
 * ───────────────────────────────────────────────────────────── */

export function SuggestionHighlight({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      data-kb-part="suggestion-highlight"
      className={cn('rounded-[2px] px-[2px]', className)}
      style={{
        backgroundColor: 'var(--kb-suggestion-bg)',
        boxDecorationBreak: 'clone',
        WebkitBoxDecorationBreak: 'clone',
      }}
    >
      {children}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Per-sentence row renderer
 *
 * String entries → wrapped in a single highlight span, defaulted to
 * 16px / 24px body type.
 *
 * JSX entries → rendered verbatim. The consumer can use
 * `<SuggestionHighlight>` inside to mark which fragments receive the
 * wash; if the entry contains no `<SuggestionHighlight>` the entire
 * JSX node is implicitly wrapped (so simple JSX like a styled `<span>`
 * still gets the expected wash without extra plumbing).
 * ───────────────────────────────────────────────────────────── */

function SentenceList({
  variant,
  sentences,
}: {
  variant: VariantKey;
  sentences: SuggestionSentence[];
}) {
  const bg = SENTENCE_BG[variant];

  return (
    <div
      data-kb-part="suggestion-block-sentences"
      data-kb-variant={variant}
      className="flex flex-col gap-[4px]"
      style={
        {
          ['--kb-suggestion-bg' as string]: bg,
        } as React.CSSProperties
      }
    >
      {sentences.map((sentence, i) => {
        if (typeof sentence === 'string') {
          return (
            <div
              key={i}
              className="text-[16px] leading-[24px] text-text-primary"
            >
              <SuggestionHighlight>{sentence}</SuggestionHighlight>
            </div>
          );
        }
        // JSX entry. If the consumer used <SuggestionHighlight> inside,
        // their explicit highlights win. Otherwise the implicit wrap
        // covers the whole entry. The cheap discriminator is the
        // presence of any descendant carrying the part marker — but
        // detecting that on a ReactNode tree is hairy. Instead, we
        // always render the JSX as-is wrapped in a transparent row and
        // let the consumer pick: emit `<SuggestionHighlight>` for fine
        // control, or wrap their whole entry in `<SuggestionHighlight>`
        // explicitly. This keeps the rule simple and predictable.
        return <div key={i}>{sentence}</div>;
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Block-mode renderer (legacy)
 * ───────────────────────────────────────────────────────────── */

function BlockHalf({
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
      className={cn('rounded-[8px] px-4 py-3', BLOCK_VARIANT_CLASS[variant])}
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
  sentences,
  oldSentences,
  newSentences,
  children,
  oldContent,
  newContent,
  id,
  suggestionId,
  className,
}: SuggestionBlockProps) {
  // Emit `data-suggestion-id` only when the consumer provides one — keeps
  // the DOM clean for legacy callers and gives `useAnchorPositions` a
  // single deterministic selector.
  const rootProps = {
    id,
    'data-kb-component': 'suggestion-block',
    'data-kb-type': type,
    ...(suggestionId ? { 'data-suggestion-id': suggestionId } : {}),
  } as const;

  /* ── Replace ─────────────────────────────────────────────── */

  if (type === 'replace') {
    const hasSentencePair =
      (oldSentences && oldSentences.length > 0) ||
      (newSentences && newSentences.length > 0);

    if (hasSentencePair) {
      return (
        <div {...rootProps} className={cn('flex flex-col gap-2', className)}>
          {oldSentences && oldSentences.length > 0 && (
            <SentenceList variant="removal" sentences={oldSentences} />
          )}
          {newSentences && newSentences.length > 0 && (
            <SentenceList variant="addition" sentences={newSentences} />
          )}
        </div>
      );
    }

    // Legacy block-mode replace.
    return (
      <div {...rootProps} className={cn('flex flex-col gap-2', className)}>
        <BlockHalf variant="removal">{oldContent}</BlockHalf>
        <BlockHalf variant="addition">{newContent}</BlockHalf>
      </div>
    );
  }

  /* ── Addition / Removal ──────────────────────────────────── */

  if (sentences && sentences.length > 0) {
    return (
      <div {...rootProps} className={className}>
        <SentenceList variant={type} sentences={sentences} />
      </div>
    );
  }

  // Legacy block-mode for non-sentence content (lists, headings, embeds).
  return (
    <div
      {...rootProps}
      className={cn(
        'rounded-[8px] px-4 py-3',
        BLOCK_VARIANT_CLASS[type],
        className,
      )}
    >
      {children}
    </div>
  );
}
