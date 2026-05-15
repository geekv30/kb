// Figma: 9aGp5t9fH1d0PXi4LMhOdb#74:10788 (AI Gaps review flow)
//        frames 2/3/5/6/8/10 — varying per-suggestion state
//        137:4022 (per-sentence addition highlights)
//        137:4132 (per-sentence removal highlights)
//
// Read-mode article body used by the AI Gaps review experience.
//
// The component owns the **decision-to-render** logic for the three
// suggestion regions (s1 addition, s2 replace, s3 removal). The rule is
// **only `active` renders the colored highlight wash**. Every other state
// (inactive, accepted, dismissed) renders plain article text so the reader
// can scan the article naturally — the rail's collapsed chip is the sole
// indicator of a decided suggestion.
//
//   - s1 addition
//       inactive → plain (preview the proposed addition, no wash)
//       active   → green wash via SuggestionBlock
//       accepted → plain (addition kept)
//       dismissed → hidden (addition reverted, article reverts to baseline)
//   - s2 replace
//       inactive → plain `before` (current article state)
//       active   → red(before) + green(after) wash via SuggestionBlock
//       accepted → plain `after` (replacement applied)
//       dismissed → plain `before` (revert)
//   - s3 removal
//       inactive → plain (text still in article, no wash)
//       active   → red strike wash via SuggestionBlock
//       accepted → hidden (text removed)
//       dismissed → plain (text kept)
//
// Every slot ALWAYS emits an invisible `data-suggestion-id` anchor (even
// when the slot's content is hidden, e.g. dismissed addition / accepted
// removal). The anchor lets the AIGapRail's `useAnchorPositions` lookup
// keep pairing the rail card to a stable article-Y for the lifetime of the
// review — without it, the rail card would jump to its fallback (stacked
// under summary) the moment its suggestion was decided.
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
 * Anchor stub — invisible `data-suggestion-id` carrier rendered when a
 * slot's content is hidden (s1 dismissed, s3 accepted). Has zero visual
 * footprint but preserves the article-Y the rail uses for pairing the
 * collapsed chip card to its anchor's original position.
 *
 * Doubles as a legacy `id="s1|s2|s3"` scroll target so the chunk-4
 * rAF smooth-scroll still has something to scroll to.
 * ───────────────────────────────────────────────────────────── */

function AnchorStub({
  id,
  suggestionId,
}: {
  id: string;
  suggestionId?: string;
}) {
  return (
    <span
      id={id}
      data-kb-part="suggestion-anchor-stub"
      {...(suggestionId ? { 'data-suggestion-id': suggestionId } : {})}
      // `block` + zero height so it shows up in `offsetTop` measurements
      // (inline `span`s without `block` can have funky offset behaviour
      // depending on the layout context) without affecting the flow.
      className="block h-0 w-full"
      aria-hidden="true"
    />
  );
}

/* ─────────────────────────────────────────────────────────────
 * Per-suggestion renderers — encode the accept/dismiss semantics.
 *
 * Only `active` renders the SuggestionBlock wash. All other states
 * render plain article text. Every variant emits a stable
 * `data-suggestion-id` anchor — either via the SuggestionBlock itself
 * (active) or via an invisible `AnchorStub` wrapper (plain / hidden).
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
  if (decision === 'active') {
    // Active addition → per-sentence green highlight block. SuggestionBlock
    // already emits `id="s1"` + `data-suggestion-id`, so no stub needed.
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
  if (decision === 'dismissed') {
    // Addition dismissed → content never added; emit a stub so the rail
    // still has an article-Y to pair the collapsed dismissed chip to.
    return <AnchorStub id="s1" suggestionId={suggestionId} />;
  }
  // inactive | accepted → plain body text + stub anchor (the PlainSentences
  // emit no `data-suggestion-id` so we wrap with a stub).
  return (
    <>
      <AnchorStub id="s1" suggestionId={suggestionId} />
      <PlainSentences sentences={content} />
    </>
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
  if (decision === 'active') {
    // Active replace → per-sentence red (old) + green (new) stacked pair.
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
  // inactive → plain `before` (current state of the article).
  // accepted → plain `after` (replacement applied).
  // dismissed → plain `before` (revert).
  const sentences = decision === 'accepted' ? after : before;
  return (
    <>
      <AnchorStub id="s2" suggestionId={suggestionId} />
      <PlainSentences sentences={sentences} />
    </>
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
  if (decision === 'active') {
    // Active removal → per-sentence red wash over the existing content.
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
  if (decision === 'accepted') {
    // Removal accepted → content deleted; emit a stub for the chip pairing.
    return <AnchorStub id="s3" suggestionId={suggestionId} />;
  }
  // inactive | dismissed → plain body text + stub anchor.
  return (
    <>
      <AnchorStub id="s3" suggestionId={suggestionId} />
      <PlainSentences sentences={content} />
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Component
 *
 * `forwardRef` so consumers (e.g. the AI Gaps rail) can pass a ref to
 * the rendered `<article>` and measure the subtree's anchor offsets
 * relative to it. The ref is intentionally typed `HTMLElement` (not
 * `HTMLDivElement`) to match the `<article>` landmark.
 * ───────────────────────────────────────────────────────────── */

export const ArticleBody = React.forwardRef<HTMLElement, ArticleBodyProps>(
  function ArticleBody(
    { decisions, regions, suggestionIds, className },
    ref,
  ) {
    return (
      <article
        ref={ref}
        data-kb-component="article-body"
        data-kb-s1={decisions.s1}
        data-kb-s2={decisions.s2}
        data-kb-s3={decisions.s3}
        className={cn(
          // `relative` makes the article a positioned ancestor so anchor
          // descendants (SuggestionBlock with `data-suggestion-id`) have
          // `offsetParent === article`. This is what `useAnchorPositions`
          // walks; without it the walk goes off-chain to `<body>` and
          // anchor offsets come back empty (the rail then falls back to
          // its stacked layout).
          'relative w-full max-w-[720px] rounded-[12px] border border-card-border bg-white',
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
  },
);
