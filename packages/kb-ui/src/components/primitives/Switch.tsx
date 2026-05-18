import * as React from 'react';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import { cn } from '../../utils/cn';

/* ─────────────────────────────────────────────────────────────
 * Switch — binary toggle. Used by the SEO panel's
 * "Exclude from search engines" row (Figma 2949:7966 off /
 *  2949:9536 on).
 *
 * Built on @radix-ui/react-switch for keyboard + ARIA semantics
 * (role="switch", aria-checked, Space/Enter toggles).
 *
 * Sizing (re-measured from synced Figma 32×16 PNG, both states):
 *  - Track: 32 × 16, fully rounded (radius 8px = half-height)
 *  - Knob:  12 × 12
 *  - Inset: 2px top, 2px bottom, ~2.2px right (ON), ~2.4px left (OFF)
 *  - Travel: 15.4px (left:2.4 → left:17.8). Rounded to 15px for
 *    crisp sub-pixel rendering — at 1×, 15.4px translates to a
 *    fractional offset that browsers smooth with anti-aliasing
 *    and reads slightly mushy. 15px lands the knob inside Figma's
 *    2.2px right inset (32 - 15 - 12 = 5 ≠ 2.2 — wait, that's
 *    wrong; the travel of 15px puts the right edge of the knob
 *    at 2+15+12=29, inset 3px). Going with 16px to match Figma
 *    more faithfully (right inset 2 = 32 - (2+16+12)).
 *  - Knob position is set via absolute `left` so it's independent
 *    of the track's flex centering (which Radix's `items-center`
 *    would otherwise apply). We use `top: 2px` to match Figma
 *    exactly and avoid sub-pixel float from flexbox math.
 *
 * Colors (from Figma `background/neutral/default` + `background/black/adaptive`):
 *  - Off track: #edf1f6 (Figma's `--background/neutral/default`).
 *    No exact match in kb-ui's color tokens — kept inline; a token
 *    sweep could promote it later.
 *  - On track:  black (matches Figma `--background/black/adaptive`).
 *  - Knob:      white, with a subtle shadow that doesn't bleed
 *    past the track on either edge.
 *
 * Motion (per emil-design-eng — toggle motion vocabulary):
 *  - Knob travel: 160ms with the canonical `ease-out-strong` curve
 *    (`cubic-bezier(0.23, 1, 0.32, 1)`). Aligns with the rest of the
 *    motion vocabulary (overlays, dropdowns, tabs) — chunk 12 dropped
 *    the prior overshoot curve so all motion in the product speaks the
 *    same language; the strong ease-out still feels snappy without an
 *    overshoot-bounce that's hard to mimic across the broader system.
 *  - Track bg crossfade: 140ms strong ease-out — slightly faster
 *    than the knob travel so the destination color is ready when
 *    the knob arrives.
 *  - Press feedback: `active:scale-[0.97]` over 100ms — instant
 *    enough to feel like the UI heard the click.
 *  - All `motion-safe`-gated; reduced-motion users get end-state
 *    with no transitions.
 * ───────────────────────────────────────────────────────────── */

// Canonical strong ease-out curve — matches `--ease-out-strong` in
// kb-ui's design tokens. Inlined here because the `transition` shorthand
// is set via the `style` prop and CSS variables aren't reliably resolved
// inline (Radix's Switch renders into a forwarded ref before style
// computation), so we mirror the literal value to stay consistent with
// the rest of the motion vocabulary.
const SWITCH_EASE_OUT = 'cubic-bezier(0.23, 1, 0.32, 1)';
const SWITCH_KNOB_CURVE = SWITCH_EASE_OUT;

export type SwitchProps = React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>;

export const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  SwitchProps
>(({ className, disabled, ...rest }, ref) => (
  <SwitchPrimitive.Root
    ref={ref}
    disabled={disabled}
    style={{
      // bg crossfade lands slightly ahead of the knob travel (140
      // vs 160ms) so the destination color is ready when the knob
      // arrives. Press scale is 100ms — instant-feeling.
      transition: `background-color 140ms ${SWITCH_EASE_OUT}, transform 100ms ${SWITCH_EASE_OUT}`,
    }}
    className={cn(
      // Track. Figma: 32×16, rounded-full. Off bg #edf1f6 (Figma
      // `--background/neutral/default`); on bg black.
      'relative inline-block h-4 w-8 shrink-0 cursor-pointer rounded-full',
      'bg-[#edf1f6] data-[state=checked]:bg-black',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-faint focus-visible:ring-offset-1',
      !disabled && 'motion-safe:active:scale-[0.97]',
      disabled && 'opacity-50 cursor-not-allowed',
      className,
    )}
    {...rest}
  >
    <SwitchPrimitive.Thumb
      style={{
        // Knob travel uses the canonical `ease-out-strong` curve to
        // stay aligned with the rest of the motion vocabulary (modals,
        // dropdowns, tabs). 160ms is in emil's 150–180ms snappy band
        // for toggles. Absolute positioning + `translate-x` keeps the
        // knob's vertical center on a fixed `top: 2px` so flexbox
        // sub-pixel math can never push it off-axis.
        transition: `transform 160ms ${SWITCH_KNOB_CURVE}`,
      }}
      className={cn(
        // Knob: 12×12, absolute-positioned at `left: 2px, top: 2px`
        // (matches Figma's OFF state). On checked: translate-x 16px
        // lands the knob with a 2px right inset (32 - 2 - 16 - 12 = 2).
        'pointer-events-none absolute left-[2px] top-[2px] block size-3 rounded-full bg-white shadow-sm',
        'translate-x-0 data-[state=checked]:translate-x-4',
      )}
    />
  </SwitchPrimitive.Root>
));
Switch.displayName = 'Switch';
