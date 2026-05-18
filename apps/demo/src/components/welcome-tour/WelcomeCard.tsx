// Step 0 — the centered welcome modal that introduces the tour.
//
// v6: copy + feature tiles externalized to the `content` prop. Visual
// chrome (chip, headline scale, tile structure, animations, focus
// trap, backdrop) is unchanged.

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react';
import { ArrowRight, XClose } from '@untitledui/icons';
import { Button } from '@test-kb-ui/kb-ui';
import { cn } from '../../lib/cn';
import { useReducedMotion } from './useReducedMotion';
import type { WelcomeContent, WelcomeFeature } from './WelcomeTourContext';

/* Smooth Apple-style cubic for entrance animations. */
const SMOOTH_CUBIC = 'cubic-bezier(0.16, 1, 0.3, 1)';

type FeatureRowProps = {
  icon: ReactNode;
  title: string;
  description?: string;
};

function FeatureRow({ icon, title, description }: FeatureRowProps) {
  // Same tile structure as CompletionCard: border, p-3, 32x32 icon
  // container, title 13px semibold, body 12px slate-500.
  return (
    <div
      className={cn(
        'rounded-lg border border-slate-200 bg-white p-3',
        'transition-colors hover:bg-slate-50',
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-100 [&>svg]:h-[18px] [&>svg]:w-[18px]">
          {icon}
        </div>
        <div className="text-[13px] font-semibold leading-5 text-slate-900">
          {title}
        </div>
      </div>
      {description !== undefined && (
        <p className="mt-1 text-[12px] leading-relaxed text-slate-500">
          {description}
        </p>
      )}
    </div>
  );
}

export type WelcomeCardProps = {
  content: WelcomeContent;
  onStart: () => void;
  onSkip: () => void;
};

export function WelcomeCard({ content, onStart, onSkip }: WelcomeCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const reduceMotion = useReducedMotion();

  const ctaLabel = content.ctaLabel ?? 'Show me around';
  const skipLabel = content.skipLabel ?? 'Skip';
  const features: WelcomeFeature[] = content.features ?? [];

  /* Focus trap — keep Tab cycling within the card. */
  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Tab') return;
    const root = cardRef.current;
    if (root === null) return;
    const focusables = root.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement as HTMLElement | null;
    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  };

  /* Auto-focus the primary CTA when the card mounts. */
  useEffect(() => {
    const root = cardRef.current;
    if (root === null) return;
    const primary = root.querySelector<HTMLElement>(
      '[data-welcome-primary="true"]',
    );
    primary?.focus();
  }, []);

  /* Mount-flip pattern — see CompletionCard for full rationale. */
  const [mounted, setMounted] = useState(false);
  useLayoutEffect(() => {
    const id1 = requestAnimationFrame(() => {
      const id2 = requestAnimationFrame(() => setMounted(true));
      cleanupRef.current = () => cancelAnimationFrame(id2);
    });
    return () => {
      cancelAnimationFrame(id1);
      cleanupRef.current?.();
    };
  }, []);

  const backdropDuration = reduceMotion ? 80 : 200;
  const cardDuration = reduceMotion ? 100 : 300;
  const cardDelay = reduceMotion ? 0 : 100;

  /* Backdrop: bg-slate-950/60 with backdrop-blur, transitions opacity. */
  const backdropStyle: CSSProperties = {
    opacity: mounted ? 1 : 0,
    transition: `opacity ${backdropDuration}ms cubic-bezier(0.23, 1, 0.32, 1)`,
  };

  /* Card: opacity 0→1 + scale 0.94→1, staged after backdrop via
   * transition-delay. Starting scale dropped from 0.96 → 0.94 so the
   * "growing in" motion reads more clearly — 0.96 was almost
   * imperceptible on a fast display. Transition (not keyframe) so a
   * rapid dismiss during the mount-in cleanly reverses instead of
   * restarting. */
  const cardStyle: CSSProperties = {
    opacity: mounted ? 1 : 0,
    transform: mounted ? 'scale(1)' : 'scale(0.94)',
    transition: reduceMotion
      ? `opacity ${cardDuration}ms ${SMOOTH_CUBIC} ${cardDelay}ms`
      : `opacity ${cardDuration}ms ${SMOOTH_CUBIC} ${cardDelay}ms, transform ${cardDuration}ms ${SMOOTH_CUBIC} ${cardDelay}ms`,
    willChange: 'opacity, transform',
  };

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-[9000] flex items-center justify-center p-4"
    >
      <div
        aria-hidden="true"
        style={backdropStyle}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
      />

      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-tour-title"
        aria-describedby="welcome-tour-subtitle"
        onKeyDown={handleKeyDown}
        style={cardStyle}
        className={cn(
          'relative w-full max-w-md rounded-2xl bg-white p-7',
          // Matches CompletionCard's custom shadow — cohesive with
          // (but stronger than) the Spotlight coach-mark's
          // `0_20px_48px_-12px_rgba(15,23,42,0.18)`. See CompletionCard
          // for the full rationale.
          'shadow-[0_24px_64px_-16px_rgba(15,23,42,0.24)]',
          'focus:outline-none',
        )}
      >
        {/* Top-right close — matches CompletionCard's exact position +
            sizing: top-4 right-4, 18px X icon in slate-400. */}
        <button
          type="button"
          aria-label="Close welcome tour"
          onClick={onSkip}
          // 160ms strong ease-out on transform so the press-scale feels
          // instant. `active:scale-[0.97]` adds the responsive press
          // feedback that the raw <button> was missing.
          style={{ transition: 'background-color 160ms ease, color 160ms ease, transform 160ms cubic-bezier(0.23, 1, 0.32, 1)' }}
          className={cn(
            'absolute right-4 top-4 inline-flex h-6 w-6 items-center justify-center rounded-md',
            'text-slate-400 hover:bg-slate-100 hover:text-slate-700',
            'active:scale-[0.97]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300',
          )}
        >
          <XClose className="h-[18px] w-[18px]" />
        </button>

        {/* Chip — "WHAT'S NEW". Leads the card (no illustration above). */}
        <div className="flex justify-center">
          <div
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2 py-0.5',
              'text-[11px] font-medium uppercase tracking-wide text-slate-700',
            )}
          >
            <span
              aria-hidden="true"
              className="inline-block h-1.5 w-1.5 rounded-full bg-slate-500"
            />
            <span>What&rsquo;s new</span>
          </div>
        </div>

        <h2
          id="welcome-tour-title"
          className="mt-5 text-center text-[20px] font-semibold leading-7 text-slate-900"
        >
          {content.title}
        </h2>

        <p
          id="welcome-tour-subtitle"
          className="mt-1 text-center text-[14px] leading-relaxed text-slate-600"
        >
          {content.body}
        </p>

        {/* Feature tiles — full-width rows. Same internal structure as
            CompletionCard tiles, just in single-column layout. */}
        {features.length > 0 && (
          <div className="mt-6 flex flex-col gap-3">
            {features.map((feature) => (
              <FeatureRow
                key={feature.id}
                icon={feature.icon}
                title={feature.title}
                description={feature.body}
              />
            ))}
          </div>
        )}

        <div className="mt-7 flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={onSkip}>
            {skipLabel}
          </Button>
          <Button
            variant="primary"
            onClick={onStart}
            data-welcome-primary="true"
          >
            {ctaLabel}
            <ArrowRight className="h-[14px] w-[14px]" />
          </Button>
        </div>
      </div>
    </div>
  );
}
