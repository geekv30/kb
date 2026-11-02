// Small building blocks shared by the AI suggestions review cards,
// re-skinned to the old Help Center: Material Icons Outlined glyphs,
// Inter, the legacy blue/green/red tokens, flat 1px-bordered surfaces.
//
// No UA reset is loaded in this app (see styles.css), so every native
// <button> here restates border, background, padding, and font.

import { forwardRef, type ButtonHTMLAttributes, type MouseEvent, type ReactNode } from 'react';
import { downArrow } from '../assets/legacy';
import { MaterialIcon } from '../components/ui/MaterialIcon';
import { Tooltip } from '../components/ui/Tooltip';
import { cn } from '../lib/cn';
import type { AISuggestionType } from '../store/types';

/* ── Suggestion type label ─────────────────────────────────── */

interface SuggestionTypeMeta {
  label: string;
  /** Once Hiver AI has made the change (auto mode): "Added", "Replaced", "Removed". */
  doneLabel: string;
  /** Material Icons Outlined ligature. */
  icon: string;
  textClass: string;
}

export const SUGGESTION_TYPE_META: Record<AISuggestionType, SuggestionTypeMeta> = {
  addition: { label: 'Addition', doneLabel: 'Added', icon: 'add', textClass: 'text-legacy-success' },
  replace: { label: 'Replace', doneLabel: 'Replaced', icon: 'sync', textClass: 'text-legacy-replace' },
  removal: { label: 'Removal', doneLabel: 'Removed', icon: 'close', textClass: 'text-legacy-danger' },
};

export interface SuggestionTypeLabelProps {
  type: AISuggestionType;
  /** The change is already made, so the label reads in the past tense. */
  done?: boolean;
}

/** Icon + label in the type's color; the label text carries the meaning, not just the color. */
export function SuggestionTypeLabel({ type, done = false }: SuggestionTypeLabelProps) {
  const meta = SUGGESTION_TYPE_META[type];
  return (
    <span
      data-part="suggestion-type"
      className={cn('inline-flex items-center gap-[4px] text-[12px] leading-[20px] font-medium', meta.textClass)}
    >
      <MaterialIcon name={meta.icon} size={16} className={meta.textClass} />
      {done ? meta.doneLabel : meta.label}
    </span>
  );
}

/* ── AI mark ───────────────────────────────────────────────── */

export function AIMark({ size }: { size: 16 | 20 }) {
  return <MaterialIcon name="auto_awesome" size={size} className="text-legacy-blue" />;
}

/* ── Count pill ────────────────────────────────────────────── */

export function CountPill({ count, label }: { count: number; label: string }) {
  return (
    <span
      aria-label={label}
      className="inline-block rounded-[15px] bg-legacy-nav-active px-[8px] py-[1px] text-[12px] leading-[20px] font-medium text-legacy-body tabular-nums"
    >
      {count}
    </span>
  );
}

/* ── 32px icon button (old icon-button hover wash) ─────────── */

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Accessible name; icon-only buttons have no visible text. */
  label: string;
  children: ReactNode;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, className, children, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      className={cn(
        'm-0 flex size-[32px] shrink-0 cursor-pointer items-center justify-center rounded-[4px] border-0 bg-transparent p-0 font-inter outline-none',
        'transition-[background-color,transform] duration-[160ms] ease-out-strong hover:bg-legacy-icon-hover motion-safe:active:scale-[0.92]',
        'disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent',
        'focus-visible:shadow-[0_0_0_2px_#1473e6]',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
});

export interface NavArrowsProps {
  onPrev?: () => void;
  onNext?: () => void;
  prevDisabled?: boolean;
  nextDisabled?: boolean;
}

/** Previous / next suggestion — the old `downArrow.svg`, flipped for "previous". */
export function NavArrows({ onPrev, onNext, prevDisabled, nextDisabled }: NavArrowsProps) {
  return (
    <div className="flex items-center">
      <IconButton label="Previous suggestion" onClick={onPrev} disabled={prevDisabled || !onPrev}>
        <img src={downArrow} alt="" width={20} height={20} draggable={false} className="rotate-180" />
      </IconButton>
      <IconButton label="Next suggestion" onClick={onNext} disabled={nextDisabled || !onNext}>
        <img src={downArrow} alt="" width={20} height={20} draggable={false} />
      </IconButton>
    </div>
  );
}

/* ── Accept / Dismiss circles ──────────────────────────────── */

export interface DecisionButtonProps {
  decision: 'accept' | 'dismiss';
  /** Suggestion title, for the accessible name. */
  suggestionTitle: string;
  onClick: (e: MouseEvent<HTMLButtonElement>) => void;
}

const DECISION_COPY = {
  accept: { verb: 'Accept', shortcut: 'Y', icon: 'check' },
  dismiss: { verb: 'Dismiss', shortcut: 'N', icon: 'close' },
} as const;

/**
 * 24px tinted circle (kb-ui Accept / Reject) with a tooltip naming the
 * keyboard shortcut. Dismiss sits on a red wash, Accept on a neutral
 * one — no blue; the page's Publish is the primary. Press feedback is
 * a 0.94 scale (motion-safe only).
 */
export function DecisionButton({ decision, suggestionTitle, onClick }: DecisionButtonProps) {
  const copy = DECISION_COPY[decision];
  return (
    <Tooltip content={`${copy.verb} (${copy.shortcut})`}>
      <button
        type="button"
        aria-label={`${copy.verb} suggestion: ${suggestionTitle}`}
        aria-keyshortcuts={copy.shortcut}
        onClick={onClick}
        className={cn(
          'm-0 flex size-[24px] cursor-pointer items-center justify-center rounded-full border-0 p-0 outline-none',
          'transition-[background-color,transform] duration-[160ms] ease-out-strong motion-safe:active:scale-[0.94]',
          'focus-visible:shadow-[0_0_0_2px_#ffffff,0_0_0_4px_#1473e6]',
          decision === 'accept'
            ? 'bg-legacy-nav-active hover:bg-legacy-disabled'
            : 'bg-legacy-danger-bg hover:bg-legacy-danger-bg-hover',
        )}
      >
        <MaterialIcon
          name={copy.icon}
          size={16}
          className={decision === 'accept' ? 'text-legacy-ink' : 'text-legacy-danger'}
        />
      </button>
    </Tooltip>
  );
}

/**
 * Auto mode's one action on an applied suggestion: the DecisionButton's
 * 24px neutral circle with an undo glyph. Same weight as Accept, so the
 * card stays calm; the page's Mark as reviewed is the primary.
 */
export function RevertButton({ suggestionTitle, onClick }: { suggestionTitle: string; onClick: () => void }) {
  return (
    <Tooltip content="Revert to original">
      <button
        type="button"
        aria-label={`Revert suggestion: ${suggestionTitle}`}
        onClick={onClick}
        className={cn(
          'm-0 flex size-[24px] cursor-pointer items-center justify-center rounded-full border-0 p-0 outline-none',
          'transition-[background-color,transform] duration-[160ms] ease-out-strong motion-safe:active:scale-[0.94]',
          'focus-visible:shadow-[0_0_0_2px_#ffffff,0_0_0_4px_#1473e6]',
          'bg-legacy-nav-active hover:bg-legacy-disabled',
        )}
      >
        <MaterialIcon name="undo" size={16} className="text-legacy-ink" />
      </button>
    </Tooltip>
  );
}
