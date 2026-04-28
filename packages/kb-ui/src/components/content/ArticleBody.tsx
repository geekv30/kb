// Figma: 9aGp5t9fH1d0PXi4LMhOdb#74:10788 (AI Gaps review flow)
//        frames 2/3/5/6/8/10 — varying per-suggestion state
//
// Read-mode article body used by the AI Gaps review experience.
//
// The component owns the **decision-to-render** logic for the three
// suggestion regions (s1 addition, s2 replace, s3 removal):
//
//   - `inactive` / `active` → the region content is wrapped in a
//     `SuggestionBlock` of the matching variant (green addition wash for
//     s1, red+green stacked diff for s2, red removal wash for s3).
//   - `accepted` (s1 addition)  → region rendered as plain body text.
//   - `accepted` (s2 replace)   → only the `after` half rendered, plain.
//   - `accepted` (s3 removal)   → region hidden.
//   - `dismissed` (s1 addition) → region hidden (addition never applied).
//   - `dismissed` (s2 replace)  → `before` half rendered, plain (revert).
//   - `dismissed` (s3 removal)  → region rendered as plain body text.
//
// **The article copy itself lives in the consumer.** ArticleBody no longer
// hardcodes any specific article — it accepts a `regions` object whose
// fields carry the surrounding-article markup AND the per-region content.
// The consumer chooses which markup to render between/around the
// suggestion slots; ArticleBody only handles the SuggestionBlock wrapping
// per the decision state above.
//
// Typography helpers are deliberately NOT exported. Consumers should
// either author plain HTML/JSX inside the region slots (the SuggestionBlock
// chrome will apply automatic background tints) or co-locate their own
// typography components matching their article's style. The stories file
// at `src/pages/KBAIGapsExperience.stories.tsx` shows the canonical
// example consumer.
import * as React from 'react';
import { cn } from '../../utils/cn';
import { SuggestionBlock } from './SuggestionBlock';

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
 */
export type ArticleBodyRegions = {
  /** Top of the article — typically heading + subtitle/byline. */
  header: React.ReactNode;
  /** Body content between the header and the s1 region. */
  beforeS1: React.ReactNode;
  /**
   * s1 — addition. Rendered as plain body text when `accepted`; wrapped
   * in a green addition `SuggestionBlock` when `inactive`/`active`;
   * hidden when `dismissed`.
   */
  s1: React.ReactNode;
  /** Body content between the s1 and s2 regions. */
  betweenS1AndS2: React.ReactNode;
  /**
   * s2 — replace. The `before` half is the existing content; the `after`
   * half is the proposed replacement. When `inactive`/`active`, both are
   * shown stacked inside a `SuggestionBlock` of type `replace`. When
   * `accepted`, only `after` renders as plain body text. When
   * `dismissed`, only `before` renders as plain body text.
   */
  s2: { before: React.ReactNode; after: React.ReactNode };
  /** Body content between the s2 and s3 regions. */
  betweenS2AndS3: React.ReactNode;
  /**
   * s3 — removal. Rendered as plain body text when `dismissed`; wrapped
   * in a red removal `SuggestionBlock` when `inactive`/`active`; hidden
   * when `accepted`.
   */
  s3: React.ReactNode;
  /** Trailing body content after the s3 region. Optional. */
  afterS3?: React.ReactNode;
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
  className?: string;
};

/* ─────────────────────────────────────────────────────────────
 * Per-suggestion renderers — encode the accept/dismiss semantics
 * ───────────────────────────────────────────────────────────── */

function S1Region({
  decision,
  content,
}: {
  decision: ArticleSuggestionDecision;
  content: React.ReactNode;
}) {
  if (decision === 'accepted') {
    // Addition accepted → content kept as plain body text.
    return <>{content}</>;
  }
  if (decision === 'dismissed') {
    // Addition dismissed → content never added.
    return null;
  }
  // inactive | active → highlight block.
  return (
    <SuggestionBlock type="addition" id="s1" className="mb-4">
      {content}
    </SuggestionBlock>
  );
}

function S2Region({
  decision,
  before,
  after,
}: {
  decision: ArticleSuggestionDecision;
  before: React.ReactNode;
  after: React.ReactNode;
}) {
  if (decision === 'accepted') {
    // Replace accepted → new content remains as plain text.
    return <>{after}</>;
  }
  if (decision === 'dismissed') {
    // Replace dismissed → old content remains.
    return <>{before}</>;
  }
  // inactive | active → red (old) + green (new) stacked pair.
  return (
    <SuggestionBlock
      type="replace"
      id="s2"
      className="mb-4"
      oldContent={before}
      newContent={after}
    />
  );
}

function S3Region({
  decision,
  content,
}: {
  decision: ArticleSuggestionDecision;
  content: React.ReactNode;
}) {
  if (decision === 'accepted') {
    // Removal accepted → content deleted.
    return null;
  }
  if (decision === 'dismissed') {
    // Removal dismissed → existing content stays as plain body.
    return <>{content}</>;
  }
  // inactive | active → red wash over the existing content.
  return (
    <SuggestionBlock type="removal" id="s3" className="mb-4">
      {content}
    </SuggestionBlock>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Component
 * ───────────────────────────────────────────────────────────── */

export function ArticleBody({
  decisions,
  regions,
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
      <S1Region decision={decisions.s1} content={regions.s1} />
      {regions.betweenS1AndS2}
      <S2Region
        decision={decisions.s2}
        before={regions.s2.before}
        after={regions.s2.after}
      />
      {regions.betweenS2AndS3}
      <S3Region decision={decisions.s3} content={regions.s3} />
      {regions.afterS3}
    </article>
  );
}
