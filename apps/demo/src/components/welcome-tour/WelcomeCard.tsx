// Step 0 — the centered welcome modal that introduces the tour.
//
// Mounts inside the WelcomeTourOverlay's portal. Builds its own
// backdrop + card (rather than reusing kb-ui Modal) because:
//   - We need the backdrop to *coexist* with the spotlight overlay
//     in later steps without the kb-ui modal's z-index/Radix focus
//     trap fighting our custom trap.
//   - We need precise control over the staged backdrop→card→content
//     entrance choreography.
//
// Focus trap, Esc handling, and scroll lock are owned by the parent
// overlay/provider so this component is purely presentational.

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
  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-lg border border-card-border p-4',
        'transition-colors duration-150 hover:bg-slate-50',
      )}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-slate-50 text-text-primary [&>svg]:h-[18px] [&>svg]:w-[18px]">
        {icon}
      </div>
      <div className="flex min-w-0 flex-col gap-0.5">
        <div className="text-[13px] font-medium leading-5 text-text-primary">
          {title}
        </div>
        <div className="text-[12px] leading-[18px] text-slate-600">
          {description}
        </div>
      </div>
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
        {/* Top-right close. */}
        <button
          type="button"
          aria-label="Close welcome tour"
          onClick={onSkip}
          className={cn(
            'absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-md',
            'text-slate-500 transition-colors hover:bg-slate-100 hover:text-text-primary',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300',
          )}
        >
          <XClose className="h-[14px] w-[14px]" />
        </button>

        {/* Neutral "What's new" chip — understated, no gradient. */}
        <div
          className={cn(
            'mb-4 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2 py-0.5',
            'text-[11px] font-medium uppercase tracking-wide text-slate-700',
          )}
        >
          <span
            aria-hidden="true"
            className="inline-block h-1.5 w-1.5 rounded-full bg-slate-500"
          />
          <span>What&rsquo;s new</span>
        </div>

        <h2
          id="welcome-tour-title"
          className="text-xl font-semibold leading-7 text-text-primary"
        >
          Welcome back, your KB just got a refresh
        </h2>

        <p
          id="welcome-tour-subtitle"
          className="mt-2 text-sm leading-5 text-slate-600"
        >
          A few things moved around. Here&rsquo;s a quick tour of what&rsquo;s
          new &mdash; under a minute.
        </p>

        <div className="mt-5 flex flex-col gap-4">
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
