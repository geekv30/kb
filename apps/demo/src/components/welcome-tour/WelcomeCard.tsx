// Step 0 — the centered welcome modal that introduces the tour.
//
// v4: unified visual language with CompletionCard. Same width (max-w-md),
// same chip pattern, same tile styling, same typography, same spacing
// rhythm. Adds a small illustration at the top matching completion's
// radial-gradient backdrop + slate glyph language.

import {
  useEffect,
  useRef,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import {
  ArrowRight,
  BarChartSquare02,
  Folder,
  XClose,
} from '@untitledui/icons';
import { AiIcon, Button } from '@test-kb-ui/kb-ui';
import { cn } from '../../lib/cn';
import { useReducedMotion } from './useReducedMotion';

/* Smooth Apple-style cubic for entrance animations. */
const SMOOTH_CUBIC = 'cubic-bezier(0.16, 1, 0.3, 1)';

type FeatureRowProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
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
      <p className="mt-1 text-[12px] leading-relaxed text-slate-500">
        {description}
      </p>
    </div>
  );
}

export type WelcomeCardProps = {
  onStart: () => void;
  onSkip: () => void;
};

export function WelcomeCard({ onStart, onSkip }: WelcomeCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const reduceMotion = useReducedMotion();

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

  const backdropDuration = reduceMotion ? 80 : 200;
  const cardDuration = reduceMotion ? 100 : 300;
  const cardDelay = reduceMotion ? 0 : 100;

  /* Backdrop: bg-slate-950/60 with backdrop-blur, fades in. */
  const backdropStyle: CSSProperties = {
    animation: `welcome-fade-in ${backdropDuration}ms ease-out both`,
  };

  /* Card: opacity 0→1 + scale 0.96→1, staged after backdrop. */
  const cardStyle: CSSProperties = {
    animation: `welcome-card-in ${cardDuration}ms ${SMOOTH_CUBIC} ${cardDelay}ms both`,
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
          'relative w-full max-w-md rounded-2xl bg-white p-7 shadow-2xl',
          'focus:outline-none',
        )}
      >
        {/* Top-right close — matches CompletionCard's exact position +
            sizing: top-4 right-4, 18px X icon in slate-400. */}
        <button
          type="button"
          aria-label="Close welcome tour"
          onClick={onSkip}
          className={cn(
            'absolute right-4 top-4 inline-flex h-6 w-6 items-center justify-center rounded-md',
            'text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300',
          )}
        >
          <XClose className="h-[18px] w-[18px]" />
        </button>

        {/* Illustration — small compass/direction glyph on radial-
            gradient slate-100 → white backdrop. Mirrors completion's
            visual language so the two cards bookend each other. */}
        <div className="flex justify-center">
          <svg
            width={56}
            height={56}
            viewBox="0 0 56 56"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <defs>
              <radialGradient
                id="welcome-bg"
                cx="50%"
                cy="50%"
                r="50%"
                fx="50%"
                fy="50%"
              >
                <stop offset="0%" stopColor="#f1f5f9" />
                <stop offset="100%" stopColor="#ffffff" />
              </radialGradient>
            </defs>

            {/* Soft circular backdrop. */}
            <circle cx={28} cy={28} r={20} fill="url(#welcome-bg)" />
            <circle
              cx={28}
              cy={28}
              r={20}
              fill="none"
              stroke="#e2e8f0"
              strokeWidth={1}
            />

            {/* Compass needle — slate-700 stroke. Diamond/needle shape
                pointing NE (representing "explore what's new"). */}
            <path
              d="M28 16 L33 28 L28 26 L23 28 Z"
              fill="#334155"
              stroke="#334155"
              strokeWidth={1}
              strokeLinejoin="round"
            />
            <path
              d="M28 40 L33 28 L28 30 L23 28 Z"
              fill="none"
              stroke="#94a3b8"
              strokeWidth={1.5}
              strokeLinejoin="round"
            />
            {/* Center pivot dot. */}
            <circle cx={28} cy={28} r={1.5} fill="#334155" />
          </svg>
        </div>

        {/* Chip — "WHAT'S NEW". Same pattern bookended on completion. */}
        <div className="mt-4 flex justify-center">
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
          Welcome back, your KB just got a refresh
        </h2>

        <p
          id="welcome-tour-subtitle"
          className="mt-1 text-center text-[14px] leading-relaxed text-slate-600"
        >
          A few things moved around. Here&rsquo;s a quick tour of what&rsquo;s
          new &mdash; under a minute.
        </p>

        {/* Feature tiles — full-width rows. Same internal structure as
            CompletionCard tiles, just in single-column layout. */}
        <div className="mt-6 flex flex-col gap-3">
          <FeatureRow
            icon={<Folder className="text-slate-700" />}
            title="File explorer in the sidebar"
            description="Browse your categories and articles like files in a tree."
          />
          <FeatureRow
            icon={<AiIcon size={18} />}
            title="AI Gaps & Suggestions"
            description="See where your content needs improvement, powered by real ticket conversations."
          />
          <FeatureRow
            icon={<BarChartSquare02 className="text-slate-700" />}
            title="Detailed analytics"
            description="Per-article performance, search insights, and AI answer quality."
          />
        </div>

        <div className="mt-7 flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={onSkip}>
            I&rsquo;ll explore on my own
          </Button>
          <Button
            variant="primary"
            onClick={onStart}
            data-welcome-primary="true"
          >
            Show me what&rsquo;s new
            <ArrowRight className="h-[14px] w-[14px]" />
          </Button>
        </div>
      </div>
    </div>
  );
}
