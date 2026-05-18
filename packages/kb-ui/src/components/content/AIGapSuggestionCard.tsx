// Figma: 9aGp5t9fH1d0PXi4LMhOdb#74:9431 (3×4 card grid — active + accepted + dismissed)
//        9aGp5t9fH1d0PXi4LMhOdb#81:16926 (active Addition in context)
//        9aGp5t9fH1d0PXi4LMhOdb#81:16342 (active Replace in context)
//        9aGp5t9fH1d0PXi4LMhOdb#81:15737 (active Removal in context)
//        251DTRmxl2L6jmXd3FWzHe#2829:9484 (idle / state=default — recessed paired card)
import * as React from 'react';
import {
  Check,
  XClose,
  Plus,
  RefreshCcw01,
  File04,
  ReverseLeft,
} from '@untitledui/icons';
import { cn } from '../../utils/cn';
import { tokens } from '../../tokens';
import { AICard } from './AICard';
import { NavArrow } from './NavArrow';
import type {
  AISuggestion,
  AISuggestionState,
  AISuggestionType,
} from './ai-suggestion-types';

export type SuggestionTypeMeta = {
  label: string;
  color: string;
  Icon: React.ComponentType<{ className?: string }>;
};

export type AIGapSuggestionCardProps = {
  suggestion: AISuggestion;
  state: AISuggestionState;
  onPrev?: () => void;
  onNext?: () => void;
  onOpenSources?: (id: string) => void;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  onUndo?: (id: string) => void;
  /**
   * Chunk 4 — click handler for the idle card. Fires when the user
   * clicks anywhere on a paired `state="idle"` card to activate it.
   * Wraps the entire card in a `<button>`-like surface (Radix-style
   * keyboard semantics: Enter / Space).
   */
  onActivate?: (id: string) => void;
  /**
   * Chunk 4 — `false` disables the up-arrow on the active card.
   * Defaults to `true` (arrow stays clickable). Has no effect when
   * `state !== 'active'`.
   */
  canGoPrev?: boolean;
  /**
   * Chunk 4 — `false` disables the down-arrow on the active card.
   * Defaults to `true`. Has no effect when `state !== 'active'`.
   */
  canGoNext?: boolean;
  className?: string;
  actions?: React.ReactNode;
  meta?: React.ReactNode;
  decisionLabels?: { accepted: string; dismissed: string };
  typeRegistry?: Record<string, SuggestionTypeMeta>;
  /**
   * Chunk 5 — optional `X / Y` position indicator rendered on the
   * `active` card next to the type chip. `index` is 1-based (the
   * user-facing position of this card in the ORIGINAL suggestion
   * list, NOT the unresolved-only subset). `total` is the full count.
   * Suppressed on `idle` / `accepted` / `dismissed` states.
   *
   * Figma has no explicit spec for this indicator at chunk 5 lock;
   * the inline rendering uses `text-12 font-medium text-text-muted`
   * to read as a quiet secondary label that doesn't compete with
   * the type chip's color treatment. Flagged in the PR description.
   */
  position?: { index: number; total: number };
};

/* ─────────────────────────────────────────────────────────────
 * Type chip — color-coded label + glyph per suggestion type.
 *
 * Hex literals mirrored 1:1 in tokens.css (--color-ai-addition /
 * -replace / -removal). Inline because Tailwind arbitrary classes
 * for dynamic per-type color don't tree-shake via the inline
 * style path used here, and the same literals also feed inline
 * SVG fill.
 * ───────────────────────────────────────────────────────────── */

export const DEFAULT_GAP_TYPES: Record<string, SuggestionTypeMeta> = {
  addition: { label: 'Addition', color: tokens.color.aiAddition, Icon: Plus },
  replace: { label: 'Replace', color: tokens.color.aiReplace, Icon: RefreshCcw01 },
  removal: { label: 'Removal', color: tokens.color.aiRemoval, Icon: XClose },
};

function TypeChip({
  type,
  registry,
}: {
  type: AISuggestionType;
  registry: Record<string, SuggestionTypeMeta>;
}) {
  const meta = registry[type];
  // Figma 74:10470 / 81:16974 / 81:16996 — TypeChip label is 14/20 medium
  // across active, idle, and collapsed states. Earlier 12/18 sizing was a
  // mis-pulled token from an older Figma revision.
  const labelClass =
    'text-[14px] font-medium leading-[20px] whitespace-nowrap';
  if (!meta) {
    return (
      <span
        data-kb-part="ai-gap-type-chip"
        data-kb-type={type}
        className="inline-flex items-center gap-[6px]"
        style={{ color: tokens.color.textDisabled }}
      >
        <span className={labelClass}>{type}</span>
      </span>
    );
  }
  const { label, color, Icon } = meta;
  return (
    <span
      data-kb-part="ai-gap-type-chip"
      data-kb-type={type}
      className="inline-flex items-center gap-[6px]"
      style={{ color }}
    >
      <Icon className="h-[14px] w-[14px] shrink-0" />
      <span className={labelClass}>{label}</span>
    </span>
  );
}

function SourcesButton({
  count,
  onClick,
  disabled,
}: {
  count: number;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-hidden={disabled || undefined}
      tabIndex={disabled ? -1 : undefined}
      className={cn(
        'inline-flex items-center gap-1 rounded-[4px] px-1.5 py-1',
        // Per Figma `ai-gap-active-addition.png` — '4 Sources' is
        // weight=normal, not medium. Lighter weight also improves
        // visual baseline alignment with the icon + adjacent NavArrow
        // / accept-reject pills (medium gave a heavier optical feel).
        'text-[14px] font-normal leading-[20px] text-text-meta',
        // Specific properties on the transition (no `transition-colors`
        // catch-all). Strong ease-out curve for instant hover feedback.
        disabled
          ? 'cursor-default'
          : 'transition-[background-color,color,transform] duration-[160ms] [transition-timing-function:var(--ease-out-strong)] hover:bg-surface-muted hover:text-text-primary motion-safe:active:scale-[0.96]',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-black/10',
      )}
    >
      <File04 aria-hidden="true" className="h-4 w-4" />
      <span>{count} Sources</span>
    </button>
  );
}

function RejectButton({
  onClick,
  disabled,
}: {
  onClick?: (e: React.MouseEvent) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-hidden={disabled || undefined}
      tabIndex={disabled ? -1 : undefined}
      aria-label={disabled ? undefined : 'Reject suggestion'}
      // Emil-style press feedback: 0.94 scale on `:active`. Subtle but
      // present, confirming the click landed. Specific property names
      // on the transition (no `transition: all`). `motion-safe` gates
      // the scale so reduced-motion users get the color flip only.
      className={cn(
        'inline-flex size-6 items-center justify-center rounded-full bg-[var(--color-btn-danger-bg)]',
        // Hover bg derived from --color-ai-removal (#d52c1f) at ~12% over white.
        'text-ai-removal',
        disabled
          ? 'cursor-default'
          : 'transition-[background-color,transform] duration-[160ms] [transition-timing-function:var(--ease-out-strong)] hover:bg-[#fad9d6] motion-safe:active:scale-[0.94]',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-black/10',
      )}
    >
      <XClose aria-hidden="true" className="h-[14px] w-[14px]" />
    </button>
  );
}

function AcceptButton({
  onClick,
  disabled,
}: {
  onClick?: (e: React.MouseEvent) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-hidden={disabled || undefined}
      tabIndex={disabled ? -1 : undefined}
      aria-label={disabled ? undefined : 'Accept suggestion'}
      className={cn(
        // Figma 74:10490 — bg=background/neutral/subtle (#f1f5f9),
        // icon=icon/neutral/default (#0f172a). Same pill shape as
        // the reject button (rounded-full). Hover deepens the bg one
        // step to keep affordance visible on the light fill.
        'inline-flex size-6 items-center justify-center rounded-full bg-surface-muted',
        'text-text-primary',
        // Emil-style press feedback: 0.94 scale on `:active` + strong
        // ease-out curve for instant feedback. Specific property names
        // on the transition. `motion-safe` gates the scale.
        disabled
          ? 'cursor-default'
          : 'transition-[background-color,transform] duration-[160ms] [transition-timing-function:var(--ease-out-strong)] hover:bg-card-border motion-safe:active:scale-[0.94]',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-black/10',
      )}
    >
      <Check aria-hidden="true" className="h-[14px] w-[14px]" />
    </button>
  );
}

export function AIGapSuggestionCard({
  suggestion,
  state,
  onPrev,
  onNext,
  onOpenSources,
  onAccept,
  onReject,
  onUndo,
  onActivate,
  canGoPrev = true,
  canGoNext = true,
  className,
  actions,
  meta,
  decisionLabels,
  typeRegistry,
  position,
}: AIGapSuggestionCardProps) {
  const resolvedRegistry = typeRegistry ?? DEFAULT_GAP_TYPES;
  if (state === 'accepted' || state === 'dismissed') {
    const decisionLabel =
      state === 'accepted'
        ? (decisionLabels?.accepted ?? 'ACCEPTED')
        : (decisionLabels?.dismissed ?? 'DISMISSED');
    // Collapsed chip — short single-row pill (~40-48px tall).
    //
    // PR #90 audit inflated the chip to `px-[22px] py-[24px]` (76px total
    // height) by pulling values from Figma's standalone chip frame
    // (74:10491 / 74:10581) which sits in a wide spec grid where it's
    // padded to match the active card width. In the actual editor rail,
    // the chip is meant to read as a quiet terminal-state pill, not a
    // full-bleed card. Reverted to AICard's collapsed default
    // (`px-3 py-2`) and trimmed the divider from h-[28px] to h-4.
    // Label kept at 13/19 medium #64748b per Figma 74:10502 / 74:10592.
    return (
      <AICard
        mode="collapsed"
        className={cn(
          // Canvas BG matches the rail backdrop; padding is AICard's
          // collapsed default (px-3 py-2). Do not re-add the 22/24
          // override — see comment above.
          'bg-canvas',
          // Gentle settle on mount — fires when the active card flips
          // to a decision chip. 200ms opacity+scale via the kb-ui
          // `kb-chip-enter` keyframe. `motion-safe:` gates the animation
          // so reduced-motion users see the chip mount instantly.
          'motion-safe:animate-kb-chip-enter',
          className,
        )}
        data-kb-component="ai-gap-suggestion-card"
        data-kb-state={state}
        data-kb-type={suggestion.type}
      >
        <TypeChip type={suggestion.type} registry={resolvedRegistry} />
        <span
          aria-hidden
          className="mx-3 h-4 w-px shrink-0 bg-card-divider"
        />
        <span className="text-[13px] font-medium leading-[19px] text-text-muted">
          {decisionLabel}
        </span>
        <button
          type="button"
          onClick={() => onUndo?.(suggestion.id)}
          aria-label={`Undo ${state} for ${suggestion.title}`}
          className={cn(
            'ml-auto inline-flex size-7 items-center justify-center rounded-full',
            // Specific properties on the transition + Emil-style press scale
            // (motion-safe — reduced-motion users only see the color flip).
            'text-text-primary transition-[background-color,transform] duration-[160ms] [transition-timing-function:var(--ease-out-strong)] motion-safe:active:scale-[0.92]',
            'hover:bg-surface-muted',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-black/10',
          )}
        >
          <ReverseLeft aria-hidden="true" className="h-4 w-4" />
        </button>
      </AICard>
    );
  }

  /* ─────────────────────────────────────────────────────────────
   * Active + Idle share the same slot composition (header /
   * meta+title+description / footer) — only the chrome differs:
   *
   *   active  → bg=white, AICard default geometry, hairline divider
   *             above the footer, title=text-primary.
   *
   *   idle    → bg=canvas (#f5f5f5), border=#f1f5f9 (border-border),
   *             shadow-lg, px-[22px] py-[24px], NO divider, footerGap
   *             20px, title=text-secondary (#334155). Matches Figma
   *             251DTRmxl2L6jmXd3FWzHe#2829:9484 (state=default) — the
   *             recessed paired-card look that peeks under the active
   *             AI Suggestions summary card in the editor rail.
   * ───────────────────────────────────────────────────────────── */
  const isIdle = state === 'idle';

  // Chunk 4 — idle cards are click-to-activate. The whole card acts as the
  // primary click target so users don't need to hit a tiny CTA. The
  // accept/reject pills inside the footer keep their own click handlers
  // (so users can decide directly from the idle state) — those handlers
  // call `stopPropagation()` to avoid double-firing the card-body
  // activation.
  const handleIdleActivate = isIdle && onActivate
    ? () => onActivate(suggestion.id)
    : undefined;
  const handleIdleKey = handleIdleActivate
    ? (e: React.KeyboardEvent<HTMLElement>) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleIdleActivate();
        }
      }
    : undefined;

  // Idle footer accept/reject — wrap caller's handlers so the card-body
  // click doesn't ALSO fire on the same gesture. NavArrow + SourcesButton
  // stay disabled on idle (per spec — they're confusing on a recessed
  // card and aren't part of the user's explicit ask).
  const handleIdleAccept = isIdle && onAccept
    ? (e: React.MouseEvent) => {
        e.stopPropagation();
        onAccept(suggestion.id);
      }
    : undefined;
  const handleIdleReject = isIdle && onReject
    ? (e: React.MouseEvent) => {
        e.stopPropagation();
        onReject(suggestion.id);
      }
    : undefined;

  return (
    <AICard
      mode="active"
      className={cn(
        // Figma 74:10466 (active) / 2829:9484 (idle) — both share padding
        // (px-22 py-24), 12px radius, faint border (#f1f5f9), and Shadows/lg.
        // Override AICard's `p-4` default → Figma padding.
        'border-border shadow-lg px-[22px] py-[24px]',
        // Idle differs from active only by bg (canvas grey vs white).
        isIdle ? 'bg-canvas' : 'bg-white',
        // Click-to-activate surface for idle cards. Pointer cursor + soft
        // hover lift indicate clickability without breaking the recessed
        // visual treatment. Tightened to specific properties + strong
        // ease-out curve so the hover feels intentional (not the bare
        // CSS `ease-out`). Subtle `:active:scale-[0.995]` confirms
        // the click landed without competing with the card's own
        // shadow lift. All transforms gated `motion-safe:`.
        isIdle && handleIdleActivate &&
          'cursor-pointer transition-[box-shadow,transform] duration-[200ms] [transition-timing-function:var(--ease-out-strong)] hover:shadow-xl motion-safe:active:scale-[0.995] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/15',
        className,
      )}
      onClick={handleIdleActivate}
      onKeyDown={handleIdleKey}
      role={isIdle && handleIdleActivate ? 'button' : undefined}
      tabIndex={isIdle && handleIdleActivate ? 0 : undefined}
      aria-label={
        isIdle && handleIdleActivate
          ? `Activate suggestion: ${suggestion.title}`
          : undefined
      }
      data-kb-component="ai-gap-suggestion-card"
      data-kb-state={state}
      data-kb-type={suggestion.type}
      header={
        state === 'active' && position ? (
          <div className="flex w-full items-center justify-between gap-2">
            <TypeChip type={suggestion.type} registry={resolvedRegistry} />
            <span
              data-kb-part="ai-gap-position"
              aria-label={`Suggestion ${position.index} of ${position.total}`}
              className="text-[12px] font-medium leading-[18px] text-text-muted tabular-nums"
            >
              {position.index} / {position.total}
            </span>
          </div>
        ) : (
          <TypeChip type={suggestion.type} registry={resolvedRegistry} />
        )
      }
      body={
        <>
          {meta}
          <h3
            data-kb-part="ai-gap-title"
            // Figma 74:10476 — title is 14/20 medium #334155 (slateTextBody)
            // for both active and idle. Earlier active used text-primary
            // (#0f172a) which was darker than the Figma spec.
            className="mt-2 text-[14px] font-medium leading-[20px] text-text-secondary"
          >
            {suggestion.title}
          </h3>
          <p
            data-kb-part="ai-gap-description"
            className="mt-1 text-[14px] font-normal leading-[20px] text-text-muted"
          >
            {suggestion.description}
          </p>
        </>
      }
      // Figma 74:10466 / 2829:9484 — NO horizontal divider between body and
      // footer in either active or idle. Card uses a 20px gap instead.
      showFooterDivider={false}
      footerGap={20}
      footer={
        actions !== undefined ? (
          actions
        ) : isIdle ? (
          // Idle keeps the active chrome (arrows / sources / accept-reject)
          // for visual parity, but NavArrow + SourcesButton stay disabled —
          // they're confusing on a recessed paired card. Accept/Reject are
          // ENABLED on idle so users can decide directly without first
          // activating the card; `stopPropagation` in the handlers
          // prevents the card-body click from also firing `onActivate`.
          <>
            <div className="flex items-center gap-1">
              <NavArrow direction="up" disabled />
              <NavArrow direction="down" disabled />
            </div>
            <div className="flex items-center gap-2">
              <SourcesButton count={suggestion.sourceCount} disabled />
              <RejectButton
                onClick={handleIdleReject}
                disabled={!handleIdleReject}
              />
              <AcceptButton
                onClick={handleIdleAccept}
                disabled={!handleIdleAccept}
              />
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-1">
              <NavArrow
                direction="up"
                onClick={onPrev}
                disabled={!canGoPrev}
              />
              <NavArrow
                direction="down"
                onClick={onNext}
                disabled={!canGoNext}
              />
            </div>
            <div className="flex items-center gap-2">
              <SourcesButton
                count={suggestion.sourceCount}
                onClick={() => onOpenSources?.(suggestion.id)}
              />
              <RejectButton onClick={() => onReject?.(suggestion.id)} />
              <AcceptButton onClick={() => onAccept?.(suggestion.id)} />
            </div>
          </>
        )
      }
    />
  );
}
