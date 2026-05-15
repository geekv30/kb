// Completion card — shown after the user clicks "Got it" on step 3.
//
// v4: unified visual language with WelcomeCard. Same width (max-w-md),
// same chip pattern ("YOU'RE ALL SET"), same tile styling, same
// typography (20px headline), same spacing rhythm (p-7, mt-5, mt-1,
// mt-6, mt-7). Now surfaces 6 distinct features in a 2x3 grid.

import {
  useEffect,
  useRef,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import {
  ClockRewind,
  Command,
  Globe02,
  LayersThree01,
  MessageChatCircle,
  SearchSm,
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

/* 6 distinct features — none overlap with WelcomeCard's
   File explorer / AI Gaps / Detailed analytics tiles. */
const TILES: ChangelogTile[] = [
  {
    icon: <Command className="h-[18px] w-[18px] text-slate-700" />,
    title: 'Keyboard shortcuts',
    body: 'Press ? anywhere to see them all',
  },
  {
    icon: <ClockRewind className="h-[18px] w-[18px] text-slate-700" />,
    title: 'Autosave & version history',
    body: 'Every keystroke saved; restore any earlier draft',
  },
  {
    icon: <MessageChatCircle className="h-[18px] w-[18px] text-slate-700" />,
    title: 'Inline comment threads',
    body: 'Collaborate on a paragraph without leaving the article',
  },
  {
    icon: <SearchSm className="h-[18px] w-[18px] text-slate-700" />,
    title: 'Faster, smarter search',
    body: 'Better ranking and instant previews',
  },
  {
    icon: <LayersThree01 className="h-[18px] w-[18px] text-slate-700" />,
    title: 'Bulk actions on articles',
    body: 'Select multiple to move, archive, or tag at once',
  },
  {
    icon: <Globe02 className="h-[18px] w-[18px] text-slate-700" />,
    title: 'Multi-language drafts',
    body: 'Write one article in multiple languages from one view',
  },
];

/* Tighter cadence than v3 since there's more to reveal. */
const TILE_DELAYS_MS = [300, 350, 400, 450, 500, 550];
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

  /* Sparkle animation delays. */
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
          'relative w-full max-w-md rounded-2xl bg-white p-7 shadow-2xl',
          'focus:outline-none',
        )}
      >
        {/* X close — top-right. Same position + sizing as WelcomeCard. */}
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

        {/* Illustration — drawn-in check with sparkles. Same 56px scale
            as WelcomeCard's compass relative to the card. */}
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
            <circle cx={28} cy={28} r={20} fill="url(#completion-bg)" />
            <circle
              cx={28}
              cy={28}
              r={20}
              fill="none"
              stroke="#e2e8f0"
              strokeWidth={1}
            />

            {/* Drawn-in check (green-600 #16a34a). */}
            <path
              d="M20 29 L25.5 34.5 L36 24"
              fill="none"
              stroke="#16a34a"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={checkStyle}
            />

            {/* Sparkles at four corners — scaled for the 56px viewBox. */}
            <g transform="translate(46,14)">
              <g style={sparkleStyle(3)} fill="#fbbf24">
                <path d="M0 -4 L1 -1 L4 0 L1 1 L0 4 L-1 1 L-4 0 L-1 -1 Z" />
              </g>
            </g>
            <g transform="translate(45,44)">
              <g style={sparkleStyle(0)} fill="#94a3b8">
                <path d="M0 -3 L0.8 -0.8 L3 0 L0.8 0.8 L0 3 L-0.8 0.8 L-3 0 L-0.8 -0.8 Z" />
              </g>
            </g>
            <g transform="translate(11,42)">
              <g style={sparkleStyle(1)} fill="#fbbf24">
                <path d="M0 -4 L1 -1 L4 0 L1 1 L0 4 L-1 1 L-4 0 L-1 -1 Z" />
              </g>
            </g>
            <g transform="translate(12,14)">
              <g style={sparkleStyle(2)} fill="#94a3b8">
                <path d="M0 -3 L0.8 -0.8 L3 0 L0.8 0.8 L0 3 L-0.8 0.8 L-3 0 L-0.8 -0.8 Z" />
              </g>
            </g>
          </svg>
        </div>

        {/* Chip — "YOU'RE ALL SET". Bookends the welcome chip. */}
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
            <span>You&rsquo;re all set</span>
          </div>
        </div>

        {/* Headline + subtitle — same 20px / 14px scale as WelcomeCard. */}
        <h2
          id="completion-title"
          className="mt-5 text-center text-[20px] font-semibold leading-7 text-slate-900"
        >
          Tour complete
        </h2>
        <p
          id="completion-subtitle"
          className="mt-1 text-center text-[14px] leading-relaxed text-slate-600"
        >
          A few other improvements you&rsquo;ll notice as you go
        </p>

        {/* 2x3 changelog grid — 6 tiles. */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          {TILES.map((tile, i) => (
            <div
              key={tile.title}
              style={tileStyle(i)}
              className={cn(
                'rounded-lg border border-slate-200 bg-white p-3',
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
