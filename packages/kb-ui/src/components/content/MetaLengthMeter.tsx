import * as React from 'react';
import { cn } from '../../utils/cn';

/* ─────────────────────────────────────────────────────────────
 * MetaLengthMeter — pure presentational length+verdict pill for
 * the SEO panel's Meta title / Description fields.
 *
 * Renders inline: `{count} / {max}  ·  {Verdict label}` where the
 * verdict label takes a verdict-keyed color and the rest is muted.
 *
 * Verdict computation lives in the consumer (SeoTabBody) — this
 * component just renders the prop. The locked algorithm (Meta
 * title 70 / Description 160 thresholds; +1 AI bump) is documented
 * in the SeoTabBody source.
 *
 * Color palette (Figma 2949:7844):
 *   - optimal       → --color-success-text (#086e3f) — green
 *   - acceptable    → #d97706 — amber. NO kb-ui token for amber
 *                     (token sweep candidate; see code comment).
 *   - short/long/   → --color-trend-down (#d52c1f) — red
 *     hard-cap
 *
 * Motion (per emil-design-eng — "prevent jarring changes"):
 *   - The verdict word color transitions over 200ms ease-out so
 *     that rapid typing across threshold boundaries doesn't strobe
 *     red → amber → green. The 200ms duration is slow enough to
 *     read as a smooth gradient between adjacent verdicts, fast
 *     enough not to lag behind the typist's next keystroke.
 *   - `motion-safe`-gated. Reduced-motion users see instant
 *     color swaps (which is the prior behavior).
 * ───────────────────────────────────────────────────────────── */

export type MetaLengthVerdict =
  | 'short'
  | 'acceptable'
  | 'optimal'
  | 'long'
  | 'hard-cap';

export type MetaLengthMeterProps = {
  count: number;
  max: number;
  verdict: MetaLengthVerdict;
  className?: string;
};

const VERDICT_LABEL: Record<MetaLengthVerdict, string> = {
  short: 'Short',
  acceptable: 'Acceptable',
  optimal: 'Optimal',
  long: 'Long',
  // Hard-cap visually reads as "Too long" — distinct from soft "Long"
  // so users know overflow is genuinely problematic.
  'hard-cap': 'Too long',
};

const VERDICT_CLASS: Record<MetaLengthVerdict, string> = {
  // Reuses --color-success-text — same green as addition badges.
  optimal: 'text-success-text',
  // Amber. No `text-amber-*` token in kb-ui (token sweep candidate:
  // promote `#d55206` to e.g. --color-warning-text when a second
  // amber consumer lands). #d55206 matches Figma --text/warning/default
  // (2949:7901). Previously #d97706 — the prior pick was visually
  // similar but a half-step lighter than Figma.
  acceptable: 'text-[#d55206]',
  // Reuses --color-trend-down — same red as removal/down trend.
  short: 'text-trend-down',
  long: 'text-trend-down',
  'hard-cap': 'text-trend-down',
};

export function MetaLengthMeter({
  count,
  max,
  verdict,
  className,
}: MetaLengthMeterProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-[12px] font-normal leading-[18px] tabular-nums',
        className,
      )}
      aria-live="polite"
    >
      <span className="text-text-muted">
        {count} / {max}
      </span>
      <span className="text-text-muted" aria-hidden="true">
        ·
      </span>
      <span
        className={cn(
          VERDICT_CLASS[verdict],
          // 200ms ease-out color crossfade. The verdict word reads
          // as a smooth fade between adjacent states rather than a
          // hard snap as the user types across thresholds.
          'motion-safe:transition-colors motion-safe:duration-200 motion-safe:ease-out',
        )}
      >
        {VERDICT_LABEL[verdict]}
      </span>
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────
 * computeMetaLengthVerdict — shared helper for callers that want
 * the locked verdict algorithm without re-implementing it.
 *
 * Algorithm (locked — see chunk-3 brief):
 *   META TITLE (max 70):
 *     0–29:   short
 *     30–49:  acceptable
 *     50–60:  optimal
 *     61–70:  long
 *     >70:    hard-cap
 *
 *   DESCRIPTION (max 160):
 *     0–99:   short
 *     100–119: acceptable
 *     120–155: optimal
 *     156–160: long
 *     >160:   hard-cap
 *
 *   AI bump: when `aiRefinedAt` is set AND the user hasn't typed
 *   since (caller passes `bumpToOptimal=true`), bump the verdict
 *   one step towards optimal:
 *     acceptable → optimal
 *     short → acceptable
 *     long → acceptable
 *     hard-cap → long
 *     optimal stays optimal
 *
 * The caller decides whether the bump is active. We don't take
 * `aiRefinedAt` directly because the staleness check (did the user
 * type after the refine?) is store-state, not derivable from this
 * pure function.
 * ───────────────────────────────────────────────────────────── */

export function computeMetaLengthVerdict({
  count,
  field,
  aiBumpActive = false,
}: {
  count: number;
  field: 'metaTitle' | 'description';
  aiBumpActive?: boolean;
}): MetaLengthVerdict {
  let v: MetaLengthVerdict;
  if (field === 'metaTitle') {
    if (count <= 29) v = 'short';
    else if (count <= 49) v = 'acceptable';
    else if (count <= 60) v = 'optimal';
    else if (count <= 70) v = 'long';
    else v = 'hard-cap';
  } else {
    if (count <= 99) v = 'short';
    else if (count <= 119) v = 'acceptable';
    else if (count <= 155) v = 'optimal';
    else if (count <= 160) v = 'long';
    else v = 'hard-cap';
  }
  if (!aiBumpActive) return v;
  // Single-step bump towards optimal.
  if (v === 'acceptable') return 'optimal';
  if (v === 'short') return 'acceptable';
  if (v === 'long') return 'acceptable';
  if (v === 'hard-cap') return 'long';
  return v;
}
