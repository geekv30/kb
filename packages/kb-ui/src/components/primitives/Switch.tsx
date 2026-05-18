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
 * Sizing (measured from Figma):
 *  - Track: 32 × 16, fully rounded (radius 8px = half-height)
 *  - Knob:  12 × 12, ~2px inset
 *  - Travel: ~16px (left:2.4 → left:17.8)
 *
 * Colors:
 *  - Off track: #edf1f6 (background/neutral/default in Figma).
 *    The closest kb-ui token is --color-border-faint (#cbd5e1)
 *    which reads too dark — we use an inline color to match.
 *    A token sweep could later promote #edf1f6 to a named token
 *    if more components need it.
 *  - On track: black (--color-btn-primary)
 *  - Knob: white
 *
 * Motion: 200ms bg-color + transform with the strong ease-out
 * curve, `motion-safe`-gated. Press feedback via
 * `motion-safe:active:scale-[0.97]` on the track, mirroring
 * Button's :active behavior.
 * ───────────────────────────────────────────────────────────── */

export type SwitchProps = React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>;

export const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  SwitchProps
>(({ className, disabled, ...rest }, ref) => (
  <SwitchPrimitive.Root
    ref={ref}
    disabled={disabled}
    style={{
      transition:
        'background-color 200ms cubic-bezier(0.23, 1, 0.32, 1), transform 120ms cubic-bezier(0.23, 1, 0.32, 1)',
    }}
    className={cn(
      // Track. Figma: 32×16, rounded-full, off bg #edf1f6, on bg black.
      'relative inline-flex h-4 w-8 shrink-0 cursor-pointer items-center rounded-full',
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
        transition: 'transform 200ms cubic-bezier(0.23, 1, 0.32, 1)',
      }}
      className={cn(
        // Knob. Figma: 12×12, white, soft shadow, sits 2px from
        // edges. Translate to ~16px on checked (32 - 12 - 2*2 = 16).
        'pointer-events-none block size-3 rounded-full bg-white shadow-sm',
        'translate-x-0.5 data-[state=checked]:translate-x-[18px]',
      )}
    />
  </SwitchPrimitive.Root>
));
Switch.displayName = 'Switch';
