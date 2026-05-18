import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '../../utils/cn';

/* ─────────────────────────────────────────────────────────────
 * Tabs — pill segmented switcher used by the SEO panel for the
 * General / SEO toggle (Figma 2949:7854).
 *
 * Built on @radix-ui/react-tabs so a11y (keyboard nav, ARIA
 * tablist semantics, focus management) is handled by Radix.
 * The visual shell is a soft slate-100 (surface-muted) track
 * with white "lifted" active trigger — radix exposes
 * `data-state="active|inactive"` which we style against.
 *
 * Motion: the active trigger crossfades its bg/shadow over 150ms
 * with the strong ease-out curve (matches Button's transition
 * vocabulary). Transform isn't animated — Radix mounts each
 * trigger statically, so a CSS sliding "indicator" would require
 * a measured-rect approach that's out of scope for chunk 1.
 * `motion-safe:` gates the transition; reduced-motion users get
 * an instant state swap.
 * ───────────────────────────────────────────────────────────── */

export type TabsProps = React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>;
export type TabsListProps = React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>;
export type TabsTriggerProps = React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>;
export type TabsContentProps = React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>;

export const Tabs = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  TabsProps
>(({ className, ...rest }, ref) => (
  <TabsPrimitive.Root
    ref={ref}
    className={cn('flex flex-col gap-3', className)}
    {...rest}
  />
));
Tabs.displayName = 'Tabs';

export const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  TabsListProps
>(({ className, ...rest }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      // Figma 2949:7854 — track is bg slate-100 / surface-muted,
      // 8px radius, 2px padding, 4px gap between triggers. The
      // list hugs its triggers (`w-fit`) so the track doesn't
      // stretch with a wider container — flexbox parents would
      // otherwise stretch an `inline-flex` child to full width.
      'inline-flex w-fit items-center gap-1 rounded-[8px] bg-surface-muted p-0.5',
      className,
    )}
    {...rest}
  />
));
TabsList.displayName = 'TabsList';

export const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  TabsTriggerProps
>(({ className, ...rest }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    // 150ms crossfade for bg/shadow/color on active flip. Matches
    // Button's transition timing for visual consistency. Strong
    // ease-out curve = punchier than the default `ease`.
    style={{
      transition:
        'background-color 150ms cubic-bezier(0.23, 1, 0.32, 1), box-shadow 150ms cubic-bezier(0.23, 1, 0.32, 1), color 150ms ease',
    }}
    className={cn(
      // Figma: w-[109px] equal-width per trigger, h ~32px from
      // px-12 py-6, 13px medium, radius 8px when active (matches
      // track radius minus padding). `min-w-[101px]` (109 - 4 - 4
      // for the list padding) lets short labels keep a balanced
      // width while longer labels grow naturally — preferable to a
      // hard `w-[109px]` for a reusable primitive.
      'inline-flex h-8 min-w-[101px] items-center justify-center rounded-[8px] px-3 py-1.5',
      'font-sans text-[13px] font-medium leading-[19px]',
      'outline-none focus-visible:ring-2 focus-visible:ring-border-faint focus-visible:ring-offset-1',
      'motion-safe:transition-[background-color,box-shadow,color]',
      // Inactive: muted slate-500 text, transparent bg.
      'text-text-muted hover:text-text-secondary',
      // Active: white bg, primary text, subtle elevation.
      'data-[state=active]:bg-white data-[state=active]:text-text-primary data-[state=active]:shadow-sm',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      className,
    )}
    {...rest}
  />
));
TabsTrigger.displayName = 'TabsTrigger';

export const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  TabsContentProps
>(({ className, ...rest }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      'outline-none focus-visible:ring-2 focus-visible:ring-border-faint focus-visible:ring-offset-1 rounded-[6px]',
      className,
    )}
    {...rest}
  />
));
TabsContent.displayName = 'TabsContent';
