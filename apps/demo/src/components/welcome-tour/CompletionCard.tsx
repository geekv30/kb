// Completion card — shown after the user clicks "Got it" on step 3.
//
// Replaces the silent fade-out with a gratification beat: a small
// drawn-in checkmark with sparkles, a "You're all set" headline, and
// a 2x2 grid of changelog tiles surfacing four other improvements.
//
// Visual choreography (after card mount):
//   - 0ms     card opacity 0→1 + scale 0.96→1 (350ms)
//   - 200ms   green checkmark begins drawing in (~500ms, stroke-dash)
//   - 300ms   tile 1 fades+slides in (translateY 6→0, opacity 0→1, 350ms)
//   - 380ms   tile 2
//   - 460ms   tile 3
//   - 540ms   tile 4
//   - 700ms   sparkle 1 (top-right) fades+scales in (300ms)
//   - 800ms   sparkle 2 (bottom-right)
//   - 900ms   sparkle 3 (bottom-left)
//   - 1000ms  sparkle 4 (top-left)
//
// On dismiss (Got it OR X), the parent overlay drives the fade-out and
// transitions tour state to 'done' (which writes localStorage = 'seen').

import {
  useEffect,
  useRef,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import {
  Command,
  Route,
  SearchSm,
  Stars02,
  X,
} from '@untitledui/icons';
import { Button } from '@test-kb-ui/kb-ui';
import { cn } from '../../lib/cn';
import { useReducedMotion } from './useReducedMotion';

const SMOOTH_CUBIC = 'cubic-bezier(0.16, 1, 0.3, 1)';

type ChangelogTile = {
  icon: React.ReactNode;
  title: string;
  body: string;
};

const TILES: ChangelogTile[] = [
  {
    icon: <Command className="h-[18px] w-[18px] text-slate-700" />,
    title: 'Keyboard shortcuts',
    body: 'Press ? anywhere to see them all',
  },
  {
    icon: <Stars02 className="h-[18px] w-[18px] text-slate-700" />,
    title: 'AI suggestions',
    body: 'Get inline help on tone, clarity, and gaps',
  },
  {
    icon: <SearchSm className="h-[18px] w-[18px] text-slate-700" />,
    title: 'Faster search',
    body: 'Smarter ranking and instant previews',
  },
  {
    icon: <Route className="h-[18px] w-[18px] text-slate-700" />,
    title: 'Quick-action breadcrumbs',
    body: 'Jump between articles without losing context',
  },
];

const TILE_DELAYS_MS = [300, 380, 460, 540];
const SPARKLE_DELAYS_MS = [700, 800, 900, 1000];
const CHECK_DRAW_DELAY_MS = 200;
const CHECK_DRAW_DUR_MS = 500;

export type CompletionCardProps = {
  onDismiss: () => void;
};

export function CompletionCard({ onDismiss }: CompletionCardProps) {
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
      '[data-completion-primary="true"]',
    );
    primary?.focus();
  }, []);

  const backdropDuration = reduceMotion ? 80 : 200;
  const cardDuration = reduceMotion ? 100 : 350;
  const cardDelay = reduceMotion ? 0 : 0;

  /* Backdrop. */
  const backdropStyle: CSSProperties = {
    animation: `welcome-fade-in ${backdropDuration}ms ease-out both`,
  };

  /* Card. */
  const cardStyle: CSSProperties = {
    animation: `welcome-card-in ${cardDuration}ms ${SMOOTH_CUBIC} ${cardDelay}ms both`,
  };

  /* Per-tile stagger. */
  const tileStyle = (index: number): CSSProperties => ({
    animation: reduceMotion
      ? `welcome-fade-in 100ms ease-out both`
      : `completion-tile-in 350ms ease-out ${TILE_DELAYS_MS[index]}ms both`,
  });

  /* Sparkle animation delays. Sparkles are positioned via inline
   * SVG x/y attributes (NOT transform) so the CSS animation can use
   * the transform property cleanly without fighting. */
  const sparkleStyle = (index: number): CSSProperties => ({
    animation: reduceMotion
      ? `welcome-fade-in 100ms ease-out both`
      : `completion-sparkle-in 300ms ease-out ${SPARKLE_DELAYS_MS[index]}ms both`,
    transformOrigin: 'center',
    transformBox: 'fill-box',
  });

  /* Checkmark draw-in. */
  const checkStyle: CSSProperties = reduceMotion
    ? { strokeDashoffset: 0 }
    : {
        strokeDasharray: 36,
        strokeDashoffset: 36,
        animation: `completion-check-draw ${CHECK_DRAW_DUR_MS}ms ease-out ${CHECK_DRAW_DELAY_MS}ms forwards`,
      };

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-[9000] flex items-center justify-center p-4"
    >
      <div
        aria-hidden="true"
        onClick={onDismiss}
        style={backdropStyle}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
      />

      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="completion-title"
        aria-describedby="completion-subtitle"
        onKeyDown={handleKeyDown}
        style={cardStyle}
        className={cn(
          'relative w-full max-w-2xl rounded-2xl bg-white p-8 shadow-2xl',
          'focus:outline-none',
        )}
      >
        {/* X close — top-right. */}
        <button
          type="button"
          aria-label="Close"
          onClick={onDismiss}
          className={cn(
            'absolute right-4 top-4 inline-flex h-6 w-6 items-center justify-center rounded-md',
            'text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300',
          )}
        >
          <X className="h-[18px] w-[18px]" />
        </button>

        {/* Illustration — drawn-in check with sparkles. */}
        <div className="flex justify-center">
          <svg
            width={88}
            height={88}
            viewBox="0 0 88 88"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <defs>
              <radialGradient
                id="completion-bg"
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
            <circle cx={44} cy={44} r={28} fill="url(#completion-bg)" />
            <circle
              cx={44}
              cy={44}
              r={28}
              fill="none"
              stroke="#e2e8f0"
              strokeWidth={1}
            />

            {/* Drawn-in check (green-600 #16a34a). */}
            <path
              d="M32 45 L40 53 L56 36"
              fill="none"
              stroke="#16a34a"
              strokeWidth={3.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={checkStyle}
            />

            {/* Sparkles — four 4-point stars at 28px from center.
                Positions (delta from center 44,44):
                  TR: ( 28, -22 )     → (72, 22)  delay 1000ms (idx 3)
                  BR: ( 26,  24 )     → (70, 68)  delay 700ms  (idx 0)
                  BL: (-26,  22 )     → (18, 66)  delay 800ms  (idx 1)
                  TL: (-24, -22 )     → (20, 22)  delay 900ms  (idx 2)
            */}
            {/* TR — amber.
                Outer g handles SVG positioning; inner g is the CSS-
                animated target (scales from its own bbox center). */}
            <g transform="translate(72,22)">
              <g style={sparkleStyle(3)} fill="#fbbf24">
                <path d="M0 -5 L1.2 -1.2 L5 0 L1.2 1.2 L0 5 L-1.2 1.2 L-5 0 L-1.2 -1.2 Z" />
              </g>
            </g>
            {/* BR — slate */}
            <g transform="translate(70,68)">
              <g style={sparkleStyle(0)} fill="#94a3b8">
                <path d="M0 -4 L1 -1 L4 0 L1 1 L0 4 L-1 1 L-4 0 L-1 -1 Z" />
              </g>
            </g>
            {/* BL — amber */}
            <g transform="translate(18,66)">
              <g style={sparkleStyle(1)} fill="#fbbf24">
                <path d="M0 -5 L1.2 -1.2 L5 0 L1.2 1.2 L0 5 L-1.2 1.2 L-5 0 L-1.2 -1.2 Z" />
              </g>
            </g>
            {/* TL — slate */}
            <g transform="translate(20,22)">
              <g style={sparkleStyle(2)} fill="#94a3b8">
                <path d="M0 -4 L1 -1 L4 0 L1 1 L0 4 L-1 1 L-4 0 L-1 -1 Z" />
              </g>
            </g>
          </svg>
        </div>

        {/* Headline + subtitle. */}
        <h2
          id="completion-title"
          className="mt-5 text-center text-[22px] font-semibold leading-7 text-slate-900"
        >
          You&rsquo;re all set
        </h2>
        <p
          id="completion-subtitle"
          className="mt-1 text-center text-[14px] leading-relaxed text-slate-600"
        >
          A few other improvements you&rsquo;ll notice as you go
        </p>

        {/* 2x2 changelog grid. */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          {TILES.map((tile, i) => (
            <div
              key={tile.title}
              style={tileStyle(i)}
              className={cn(
                'rounded-lg border border-slate-200 bg-white p-4',
                'transition-colors hover:bg-slate-50',
              )}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-100">
                  {tile.icon}
                </div>
                <div className="text-[13px] font-semibold leading-5 text-slate-900">
                  {tile.title}
                </div>
              </div>
              <p className="mt-1 text-[12px] leading-relaxed text-slate-500">
                {tile.body}
              </p>
            </div>
          ))}
        </div>

        {/* Footer — single primary CTA. */}
        <div className="mt-7 flex items-center justify-end">
          <Button
            variant="primary"
            onClick={onDismiss}
            data-completion-primary="true"
          >
            Got it
          </Button>
        </div>
      </div>
    </div>
  );
}
