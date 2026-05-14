// Figma: 9aGp5t9fH1d0PXi4LMhOdb#74:10788 (AI Gaps review flow)
//        frames 2/3/5/6/8/10 — varying per-suggestion state
//        137:4022 (per-sentence addition highlights)
//        137:4132 (per-sentence removal highlights)
//
// Read-mode article body used by the AI Gaps review experience.
//
// The component owns the **decision-to-render** logic for the three
// suggestion regions (s1 addition, s2 replace, s3 removal):
//
//   - `inactive` / `active` → the region content is wrapped in a
//     `SuggestionBlock` of the matching variant. Per-sentence highlights
//     are applied (each `sentences[]` entry gets its own green/red block
//     with a 4px gap between blocks — matches Figma 137:4022 / 137:4132).
//   - `accepted` (s1 addition)  → region rendered as plain body text.
//   - `accepted` (s2 replace)   → only the `after` half rendered, plain.
//   - `accepted` (s3 removal)   → region hidden.
//   - `dismissed` (s1 addition) → region hidden (addition never applied).
//   - `dismissed` (s2 replace)  → `before` half rendered, plain (revert).
//   - `dismissed` (s3 removal)  → region rendered as plain body text.
//
// **The article copy itself lives in the consumer.** ArticleBody no longer
// hardcodes any specific article — it accepts a `regions` object whose
// fields carry the surrounding-article markup AND the per-region content
// as **sentence arrays** (one entry per highlighted line / list-item /
// heading). The consumer chooses which markup to render between/around
// the suggestion slots; ArticleBody only handles the SuggestionBlock
// wrapping per the decision state above.
//
// Sentence entries can be plain strings (rendered as 16px body text) or
// JSX nodes (preserves heading/list-item typography). See
// `KBAIGapsExperience.stories.tsx` for the canonical example.
import * as React from 'react';
import { cn } from '../../utils/cn';
import { SuggestionBlock } from './SuggestionBlock';
import type { SuggestionSentence } from './SuggestionBlock';

/* ─────────────────────────────────────────────────────────────
 * Types
 * ───────────────────────────────────────────────────────────── */

export type ArticleSuggestionDecision =
  | 'inactive'
  | 'active'
  | 'accepted'
  | 'dismissed';

export type ArticleBodyDecisions = {
  /** s1 — addition block wrapping consumer-provided new content. */
  s1: ArticleSuggestionDecision;
  /** s2 — replace block swapping consumer-provided before/after halves. */
  s2: ArticleSuggestionDecision;
  /** s3 — removal block wrapping consumer-provided existing content. */
  s3: ArticleSuggestionDecision;
};

/**
 * Article-shaped slot map. Every slot is required so the rendered output
 * is fully determined by the consumer — the component supplies no fallback
 * markup. Pass `null` (or an empty fragment) for any slot you don't need.
 *
 * Render order is fixed:
 *   `header` → `beforeS1` → s1 region → `betweenS1AndS2` → s2 region
 *           → `betweenS2AndS3` → s3 region → `afterS3`
 *
 * The s1/s2/s3 regions are wrapped per the decision state — see the
 * file-top JSDoc for the full table.
 *
 * The s1/s3 slots and the s2 before/after halves accept **sentence arrays**:
 * each entry renders as one highlighted block (per-sentence highlights
 * with gaps). Strings → body text. JSX nodes → preserve typography
 * (e.g. headings, list items with their numerals).
 */
export type ArticleBodyRegions = {
  /** Top of the article — typically heading + subtitle/byline. */
  header: React.ReactNode;
  /** Body content between the header and the s1 region. */
  beforeS1: React.ReactNode;
  /**
   * s1 — addition. Each entry renders as one highlighted block when
   * `inactive`/`active`. When `accepted`, entries flow back as plain
   * body content. Hidden when `dismissed`.
   */
  s1: SuggestionSentence[];
  /** Body content between the s1 and s2 regions. */
  betweenS1AndS2: React.ReactNode;
  /**
   * s2 — replace. The `before` half is the existing content; the `after`
   * half is the proposed replacement. When `inactive`/`active`, both are
   * shown as per-sentence diff (red `before` then green `after`). When
   * `accepted`, only `after` renders as plain text. When `dismissed`,
   * only `before` renders as plain text.
   */
  s2: { before: SuggestionSentence[]; after: SuggestionSentence[] };
  /** Body content between the s2 and s3 regions. */
  betweenS2AndS3: React.ReactNode;
  /**
   * s3 — removal. Each entry renders as one highlighted block when
   * `inactive`/`active`. When `dismissed`, entries flow back as plain
   * body content. Hidden when `accepted`.
   */
  s3: SuggestionSentence[];
  /** Trailing body content after the s3 region. Optional. */
  afterS3?: React.ReactNode;
};

/**
 * Optional map from slot key (`s1`/`s2`/`s3`) to the originating
 * suggestion's stable id (the data model's `AISuggestion.id`). When set,
 * the matching slot's `SuggestionBlock` emits `data-suggestion-id` so
 * consumers can resolve DOM anchors via `useAnchorPositions`. Decoupled
 * from `regions` because the article markup is static while the
 * suggestion ids are derived at runtime from a per-article fixture.
 */
export type ArticleBodySuggestionIds = {
  s1?: string;
  s2?: string;
  s3?: string;
};

export type ArticleBodyProps = {
  /**
   * Per-suggestion state.
   * - `inactive` — highlight block rendered, not the focused suggestion.
   * - `active`   — highlight block rendered, is the focused suggestion.
   * - `accepted` — highlight removed; content applied per suggestion type.
   * - `dismissed`— highlight removed; content reverted per suggestion type.
   *
   * For static frames, `active` and `inactive` render identically — the
   * distinction exists so the active block can be a scroll target via
   * `SuggestionBlock`'s `id` (the component wires `id="s1|s2|s3"` onto
   * the wrapping block).
   */
  decisions: ArticleBodyDecisions;
  /**
   * Article markup (header + body content + per-region content). Required —
   * ArticleBody does not provide any default copy.
   *
   * The component owns the SuggestionBlock wrapping for s1/s2/s3 based on
   * `decisions`; the consumer owns the surrounding HTML between regions.
   */
  regions: ArticleBodyRegions;
  /**
   * Optional — suggestion ids per slot. When provided, propagated to the
   * matching SuggestionBlock as `data-suggestion-id`. The legacy
   * `id="s1|s2|s3"` anchors are preserved alongside.
   */
  suggestionIds?: ArticleBodySuggestionIds;
  className?: string;
};

/* ─────────────────────────────────────────────────────────────
 * Plain-flow renderer — used when a region is `accepted`/`dismissed`
 * and the highlights drop, leaving the underlying content rendered
 * inline as part of the article body.
 *
 * Strings stack as paragraphs; JSX entries render as-is. Each entry
 * is wrapped in its own block so list items / headings retain their
 * intended layout once the highlight chrome is gone.
 * ───────────────────────────────────────────────────────────── */

function PlainSentences({ sentences }: { sentences: SuggestionSentence[] }) {
  return (
    <>
      {sentences.map((s, i) =>
        typeof s === 'string' ? (
          <p
            key={i}
            className="mb-2 text-[16px] leading-[24px] text-text-primary last:mb-0"
          >
            {s}
          </p>
        ) : (
          <React.Fragment key={i}>{s}</React.Fragment>
        ),
      )}
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Per-suggestion renderers — encode the accept/dismiss semantics
 * ───────────────────────────────────────────────────────────── */

function S1Region({
  decision,
  content,
  suggestionId,
}: {
  decision: ArticleSuggestionDecision;
  content: SuggestionSentence[];
  suggestionId?: string;
}) {
  if (decision === 'accepted') {
    // Addition accepted → content kept as plain body text.
    return <PlainSentences sentences={content} />;
  }
  if (decision === 'dismissed') {
    // Addition dismissed → content never added.
    return null;
  }
  // inactive | active → per-sentence highlight block.
  return (
    <SuggestionBlock
      type="addition"
      id="s1"
      suggestionId={suggestionId}
      className="mb-4"
      sentences={content}
    />
  );
}

function S2Region({
  decision,
  before,
  after,
  suggestionId,
}: {
  decision: ArticleSuggestionDecision;
  before: SuggestionSentence[];
  after: SuggestionSentence[];
  suggestionId?: string;
}) {
  if (decision === 'accepted') {
    // Replace accepted → new content remains as plain text.
    return <PlainSentences sentences={after} />;
  }
  if (decision === 'dismissed') {
    // Replace dismissed → old content remains.
    return <PlainSentences sentences={before} />;
  }
  // inactive | active → per-sentence red (old) + green (new) stacked pair.
  return (
    <SuggestionBlock
      type="replace"
      id="s2"
      suggestionId={suggestionId}
      className="mb-4"
      oldSentences={before}
      newSentences={after}
    />
  );
}

function S3Region({
  decision,
  content,
  suggestionId,
}: {
  decision: ArticleSuggestionDecision;
  content: SuggestionSentence[];
  suggestionId?: string;
}) {
  if (decision === 'accepted') {
    // Removal accepted → content deleted.
    return null;
  }
  if (decision === 'dismissed') {
    // Removal dismissed → existing content stays as plain body.
    return <PlainSentences sentences={content} />;
  }
  // inactive | active → per-sentence red wash over the existing content.
  return (
    <SuggestionBlock
      type="removal"
      id="s3"
      suggestionId={suggestionId}
      className="mb-4"
      sentences={content}
    />
  );
}

/* ─────────────────────────────────────────────────────────────
 * Component
 * ───────────────────────────────────────────────────────────── */

export function ArticleBody({
  decisions,
  regions,
  suggestionIds,
  className,
}: ArticleBodyProps) {
  return (
    <article
      data-kb-component="article-body"
      data-kb-s1={decisions.s1}
      data-kb-s2={decisions.s2}
      data-kb-s3={decisions.s3}
      className={cn(
        'w-full max-w-[720px] rounded-[12px] border border-card-border bg-white',
        'shadow-[0_1px_2px_rgba(15,23,42,0.04)]',
        'p-8',
        className,
      )}
    >
      {regions.header}
      {regions.beforeS1}
      <S1Region
        decision={decisions.s1}
        content={regions.s1}
        suggestionId={suggestionIds?.s1}
      />
      {regions.betweenS1AndS2}
      <S2Region
        decision={decisions.s2}
        before={regions.s2.before}
        after={regions.s2.after}
        suggestionId={suggestionIds?.s2}
      />
      {regions.betweenS2AndS3}
      <S3Region
        decision={decisions.s3}
        content={regions.s3}
        suggestionId={suggestionIds?.s3}
      />
      {regions.afterS3}
    </article>
  );
}
