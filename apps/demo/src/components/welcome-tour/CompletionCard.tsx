// Completion card — shown after the user clicks "Got it" on step 3.
//
// v4: unified visual language with WelcomeCard. Same width (max-w-md),
// same chip pattern ("YOU'RE ALL SET"), same tile styling, same
// typography (20px headline), same spacing rhythm (p-7, mt-5, mt-1,
// mt-6, mt-7). Now surfaces 6 distinct features in a 2x3 grid.

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import {
  AlertCircle,
  Command,
  Keyboard01,
  MessageChatCircle,
  Pencil02,
  ShieldTick,
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

/* 6 distinct features — all real per kb-mcp/product/feature-map.md.
   No overlap with WelcomeCard's File explorer / AI Gaps / Analytics tiles. */
const TILES: ChangelogTile[] = [
  {
    icon: <Command className="h-[18px] w-[18px] text-slate-700" />,
    title: 'Slash-command editor',
    body: 'Type / anywhere to insert headings, lists, code, tables, and more',
  },
  {
    icon: <Pencil02 className="h-[18px] w-[18px] text-slate-700" />,
    title: 'Selection bubble menu',
    body: 'Select text for instant formatting, links, and AI actions',
  },
  {
    icon: <ShieldTick className="h-[18px] w-[18px] text-slate-700" />,
    title: 'Smart publish gate',
    body: 'Publishing stays disabled until your AI suggestions are reviewed',
  },
  {
    icon: <MessageChatCircle className="h-[18px] w-[18px] text-slate-700" />,
    title: 'Conversation sources',
    body: 'Every AI suggestion shows the customer tickets behind it',
  },
  {
    icon: <AlertCircle className="h-[18px] w-[18px] text-slate-700" />,
    title: 'Articles needing attention',
    body: 'Analytics flags low-helpfulness articles automatically',
  },
  {
    icon: <Keyboard01 className="h-[18px] w-[18px] text-slate-700" />,
    title: 'Keyboard-first workflow',
    body: 'Press ? for shortcuts; navigate AI review with j/k, decide with y/n',
  },
];

/* Tile stagger — starts at 200ms so the cascade kicks in shortly
 * after the card lands (card itself transitions in over ~350ms,
 * with 200ms the first tile begins under the headline before the
 * card fully settles). 60ms between tiles keeps the cascade tight
 * — long enough to read as a sequence, short enough to avoid
 * blocking interaction. Previously front-loaded at 300ms with 50ms
 * steps, which pushed the last tile (550ms) past the user's
 * attention window. */
const TILE_DELAYS_MS = [200, 260, 320, 380, 440, 500];
const SPARKLE_DELAYS_MS = [700, 800, 900, 1000];
const CHECK_DRAW_DELAY_MS = 200;
const CHECK_DRAW_DUR_MS = 500;

/* Per-sparkle phase offsets so the shimmer feels organic (not all
   pulsing in unison). Values in ms. Duration bumped to 3500ms (from
   2800) — gives the scale + opacity cycle more breathing room so the
   shimmer reads as a gentle "alive" beat rather than a fast pulse. */
const SPARKLE_SHIMMER_PHASE_MS = [0, 700, 1400, 350];
const SPARKLE_SHIMMER_DURATION_MS = 3500;

export type CompletionCardProps = {
  onDismiss: () => void;
};

export function CompletionCard({ onDismiss }: CompletionCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const checkPathRef = useRef<SVGPathElement | null>(null);
  const reduceMotion = useReducedMotion();

  /* Measured length of the check stroke. Read from the DOM via
   * `getTotalLength()` so the keyframe's `stroke-dashoffset: from`
   * matches the actual path length exactly — previously hard-coded
   * to 36 in CSS, which would silently break if the path's `d` ever
   * changed. The measurement runs once on mount; we publish it as a
   * CSS variable on the path so the keyframe (which uses
   * `var(--check-path-length, 36)`) picks it up automatically. */
  const [checkLength, setCheckLength] = useState<number | null>(null);
  useLayoutEffect(() => {
    const path = checkPathRef.current;
    if (path === null) return;
    // getTotalLength is a DOM method on SVGGeometryElement — covers
    // every browser we care about. Wrapping in a try/catch avoids
    // SSR pre-paint errors if this ever ran outside the browser.
    try {
      const len = path.getTotalLength();
      if (len > 0) setCheckLength(len);
    } catch {
      /* leave checkLength null — keyframe fallback (36) kicks in */
    }
  }, []);

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

  /* Mount-flip pattern (data-mounted equivalent) — initial render uses
   * the "from" styles, then a layout-effect + rAF flips to "to" so the
   * CSS transition runs. Unlike keyframe `animation`, transitions are
   * interruptible: if the user dismisses mid-mount the next mount
   * retargets smoothly instead of restarting from zero.
   *
   * Why useLayoutEffect + double-rAF? useLayoutEffect runs after DOM
   * commit but before paint, and double-rAF guarantees the browser
   * has painted the "from" frame before we flip — otherwise React
   * batches the initial render with the post-effect state and no
   * transition plays. */
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
  const cardDuration = reduceMotion ? 100 : 350;

  /* Backdrop — opacity transition (interruptible). */
  const backdropStyle: CSSProperties = {
    opacity: mounted ? 1 : 0,
    transition: `opacity ${backdropDuration}ms cubic-bezier(0.23, 1, 0.32, 1)`,
  };

  /* Card — opacity + scale transition. Starting scale dropped from
   * 0.96 → 0.94 so the "growing in" motion reads more clearly.
   * 0.96 was so close to 1 that the scale step was barely
   * perceptible on a fast monitor; 0.94 gives the entrance enough
   * visual travel without crossing into "feels like a popup". */
  const cardStyle: CSSProperties = {
    opacity: mounted ? 1 : 0,
    transform: mounted ? 'scale(1)' : 'scale(0.94)',
    transition: reduceMotion
      ? `opacity ${cardDuration}ms ${SMOOTH_CUBIC}`
      : `opacity ${cardDuration}ms ${SMOOTH_CUBIC}, transform ${cardDuration}ms ${SMOOTH_CUBIC}`,
    willChange: 'opacity, transform',
  };

  /* Per-tile stagger — same target as the previous `completion-tile-in`
   * keyframe (translateY 6px → 0, opacity 0 → 1) but each tile gets a
   * transition-delay equal to its previous animation-delay. Tiles can
   * now be interrupted (e.g. if the card is dismissed mid-cascade,
   * tiles smoothly fade back instead of jumping). */
  const tileStyle = (index: number): CSSProperties => {
    if (reduceMotion) {
      return {
        opacity: mounted ? 1 : 0,
        transition: `opacity 100ms cubic-bezier(0.23, 1, 0.32, 1)`,
      };
    }
    return {
      opacity: mounted ? 1 : 0,
      transform: mounted ? 'translateY(0)' : 'translateY(6px)',
      transition:
        `opacity 350ms cubic-bezier(0.23, 1, 0.32, 1) ${TILE_DELAYS_MS[index]}ms, ` +
        `transform 350ms cubic-bezier(0.23, 1, 0.32, 1) ${TILE_DELAYS_MS[index]}ms`,
      willChange: 'opacity, transform',
    };
  };

  /* Sparkle animation — initial pop, then a finite shimmer loop that
   * settles after 5 iterations (~17.5s at 3500ms). Infinite shimmer
   * is visual noise once the celebration moment has passed; capping
   * iterations lets the sparkles read as "alive" without becoming
   * permanent fixtures. `forwards` keeps the final keyframe so they
   * don't snap back at the end of the last iteration.
   *
   * reduceMotion users still get the plain fade-in (no shimmer at all).
   * Per-element delays land via `SPARKLE_SHIMMER_PHASE_MS` so the
   * four sparkles twinkle out of unison.
   *
   * Static transform-box + transform-origin moved to
   * `.completion-sparkle` class in welcome-tour-animations.css — only
   * the dynamic `animation` (which carries the per-element delay)
   * stays inline here. */
  const sparkleStyle = (index: number): CSSProperties => ({
    animation: reduceMotion
      ? `welcome-fade-in 100ms ease-out both`
      : (
          `completion-sparkle-in 300ms ease-out ${SPARKLE_DELAYS_MS[index]}ms both, ` +
          `completion-sparkle-shimmer ${SPARKLE_SHIMMER_DURATION_MS}ms ease-in-out ` +
          `${SPARKLE_DELAYS_MS[index] + 300 + SPARKLE_SHIMMER_PHASE_MS[index]}ms 5 forwards`
        ),
  });

  /* Checkmark draw-in. Uses the measured path length (or 36 fallback
   * until the layout effect commits) so the dasharray/dashoffset
   * match the real geometry exactly. The keyframe pulls the start
   * offset from `--check-path-length` so we don't have to inject the
   * measurement into the animation string — it stays a stable CSS
   * keyframe across renders.
   *
   * Easing changed from bare `ease-out` to a strong ease-in-out
   * (movement curve from easings.dev / Emil Kowalski's principles).
   * Stroke draws are "on-screen movement", not entrance fades, so
   * the in-out acceleration profile gives the check a confident
   * sweep through its middle instead of a soft start. */
  const measuredLength = checkLength ?? 36;
  const checkStyle: CSSProperties = reduceMotion
    ? { strokeDashoffset: 0 }
    : {
        strokeDasharray: measuredLength,
        strokeDashoffset: measuredLength,
        // Published as a CSS variable so the keyframe's `from`
        // resolves to the real length. Cast through CSSProperties so
        // TS accepts the custom property.
        ['--check-path-length' as keyof CSSProperties]: measuredLength,
        animation: `completion-check-draw ${CHECK_DRAW_DUR_MS}ms cubic-bezier(0.77, 0, 0.175, 1) ${CHECK_DRAW_DELAY_MS}ms forwards`,
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
          'relative w-full max-w-xl rounded-2xl bg-white p-7 shadow-2xl',
          'focus:outline-none',
        )}
      >
        {/* X close — top-right. Same position + sizing as WelcomeCard. */}
        <button
          type="button"
          aria-label="Close"
          onClick={onDismiss}
          // 160ms strong ease-out on transform so the press-scale feels
          // instant. Pairs with `active:scale-[0.97]` for the standard
          // button-feedback pattern from Emil Kowalski's principles.
          style={{ transition: 'background-color 160ms ease, color 160ms ease, transform 160ms cubic-bezier(0.23, 1, 0.32, 1)' }}
          className={cn(
            'absolute right-4 top-4 inline-flex h-6 w-6 items-center justify-center rounded-md',
            'text-slate-400 hover:bg-slate-100 hover:text-slate-700',
            'active:scale-[0.97]',
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

            {/* Drawn-in check (green-600 #16a34a). The ref is used
                by the useLayoutEffect above to read the path's actual
                `getTotalLength()` and publish it as a CSS variable —
                replaces the previous hard-coded `36` magic number. */}
            <path
              ref={checkPathRef}
              d="M20 29 L25.5 34.5 L36 24"
              fill="none"
              stroke="#16a34a"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={checkStyle}
            />

            {/* Sparkles at four corners — scaled for the 56px viewBox.
                Outer pair (amber 4-radius stars) carry the visual
                weight at scale(1.10); inner pair (slate 3-radius
                stars) reads as supporting detail at scale(1.0). The
                base scale composes with the shimmer keyframe's
                scale() via SVG transform stacking — outer pair peaks
                at ~1.21, inner pair at ~1.10. */}
            <g transform="translate(46,14) scale(1.10)">
              <g
                className="completion-sparkle"
                style={sparkleStyle(3)}
                fill="#fbbf24"
              >
                <path d="M0 -4 L1 -1 L4 0 L1 1 L0 4 L-1 1 L-4 0 L-1 -1 Z" />
              </g>
            </g>
            <g transform="translate(45,44)">
              <g
                className="completion-sparkle"
                style={sparkleStyle(0)}
                fill="#94a3b8"
              >
                <path d="M0 -3 L0.8 -0.8 L3 0 L0.8 0.8 L0 3 L-0.8 0.8 L-3 0 L-0.8 -0.8 Z" />
              </g>
            </g>
            <g transform="translate(11,42) scale(1.10)">
              <g
                className="completion-sparkle"
                style={sparkleStyle(1)}
                fill="#fbbf24"
              >
                <path d="M0 -4 L1 -1 L4 0 L1 1 L0 4 L-1 1 L-4 0 L-1 -1 Z" />
              </g>
            </g>
            <g transform="translate(12,14)">
              <g
                className="completion-sparkle"
                style={sparkleStyle(2)}
                fill="#94a3b8"
              >
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
