import * as React from 'react';
import { cn } from '../../utils/cn';
import { Skeleton } from './Skeleton';

/* ─────────────────────────────────────────────────────────────
 * Textarea — single-line + multi-line text field used across the
 * SEO panel, category-description editor, and a few generic forms.
 *
 * Public surface (chunks 1-5):
 *   - value / onChange / placeholder / charCount / disabled / error
 *   - id / name / initialHeight / resize / className / textareaClassName
 *   - footerEnd   → bottom row slot rendered alongside charCount.
 *   - refining    → switches the textarea contents to a content-aware
 *                   shimmer Skeleton overlay (chunk 5).
 *   - refineSlot  → pinned bottom-right CTA inside the textarea frame.
 *                   The slot is rendered above the contents (z-index)
 *                   and dims to opacity-50 while `refining`.
 *
 * Chunk-5 refining state behaviour (per emil-design-eng motion brief
 * + chunk-12 exit-phase fix):
 *   1. The textarea's RENDERED height is captured one render BEFORE
 *      `refining` flips true via a layout effect — Skeleton bars are
 *      sized to match so there's zero layout jump when shimmer kicks in.
 *   2. Content fade-out (entering refining): 100ms opacity 1 → 0 linear.
 *      Linear is correct here: the fade fires at the moment of click, so
 *      the system's response should land deliberately — a fast linear
 *      vanish doesn't compete with the upcoming skeleton mount.
 *   3. Content fade-in (exiting refining): 150ms opacity 0 → 1 with
 *      `var(--ease-out-strong)`. The strong ease-out lets the new AI
 *      text feel like it "lands" instead of glides — matches the rest
 *      of the system's overlay vocabulary.
 *   4. Skeleton exit: when `refining` flips false, we keep the Skeleton
 *      mounted for one short cycle (100ms) while `kb-tabs-content-out`
 *      plays, then unmount. Without this exit phase the skeleton was
 *      yanked from the DOM the moment refining ended, making the new
 *      text appear to "snap in" under a still-visible (one-frame-stale)
 *      skeleton. The crossfade window also gets a brief `blur(2px) → 0`
 *      filter on the textarea contents so the two-objects-overlapping
 *      smell of the crossfade is masked — Emil's standard textbook
 *      crossfade pattern.
 *   5. The Skeleton's own shimmer pseudo-element (`kb-skeleton-shimmer`,
 *      1.6s linear infinite) handles the in-flight loading motion.
 *   6. Textarea becomes `readOnly` while refining so the user can't
 *      race the AI service; the underlying value is preserved so an
 *      error path can restore prior text without losing edits.
 *   7. `motion-safe:` gates the fade transitions so reduced-motion
 *      users get instant swaps.
 * ───────────────────────────────────────────────────────────── */

export type TextareaProps = {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  charCount?: { current: number; max: number };
  disabled?: boolean;
  /** When true the textarea border flips to red. Same pattern as
   *  TextInput.error (Honey-DS 6322:25311 — #dc2626). */
  error?: boolean;
  id?: string;
  name?: string;
  /** Initial height in pixels. Default 80. */
  initialHeight?: number;
  /** Resize behavior. Default 'vertical'. */
  resize?: 'vertical' | 'horizontal' | 'both' | 'none';
  className?: string;
  /** Override classes applied to the inner <textarea>. */
  textareaClassName?: string;
  /** Optional slot rendered at the bottom-right inside the textarea
   *  shell (e.g. the SEO panel's "✦ Refine with AI" affordance). */
  footerEnd?: React.ReactNode;
  /**
   * When true the textarea contents are visually hidden and replaced
   * with a content-aware shimmer Skeleton overlay. Used by the SEO
   * panel's "Refine with AI" affordance. While `refining` is true:
   *   - The native textarea becomes `readOnly` (value is preserved).
   *   - Contents fade out (100ms) then the Skeleton overlay appears
   *     sized to the textarea's last-measured height.
   *   - The slot rendered via `refineSlot` is dimmed to opacity-50
   *     and made `pointer-events-none` so it can't re-fire.
   */
  refining?: boolean;
  /**
   * Optional slot pinned at the bottom-right corner INSIDE the
   * textarea frame (e.g. the SEO panel's "✦ Refine with AI" CTA).
   * Distinct from `footerEnd` which lives in the bottom-row beneath
   * the textarea body. Visually anchored via absolute positioning so
   * it overlays text without consuming layout space.
   */
  refineSlot?: React.ReactNode;
};

const resizeClassMap: Record<NonNullable<TextareaProps['resize']>, string> = {
  vertical: 'resize-y',
  horizontal: 'resize-x',
  both: 'resize',
  none: 'resize-none',
};

/* Always hide the native browser resize handle (the diagonal grip at the
 * bottom-right). The `resize` prop controls user-resize behaviour via the
 * resize-* utility above; when `resize='vertical'` users can still drag the
 * textarea taller, the grip just isn't drawn. Removing the grip is critical
 * inside the SEO panel where it visually collides with the pinned
 * `refineSlot` button (Figma 2949:7844). */
const HIDE_NATIVE_RESIZE_GRIP_CLASS =
  '[&::-webkit-resizer]:hidden';

// Skeleton-exit dwell time. Matches `kb-tabs-content-out` (100ms)
// in tokens.css so the overlay finishes fading just as the textarea
// reaches full opacity on its 150ms fade-in. The 50ms head-start the
// textarea gets is deliberate — Emil's textbook crossfade has the
// incoming object slightly ahead so the eye lands on "real text"
// before the skeleton is fully gone.
const SKELETON_EXIT_MS = 100;

export function Textarea({
  value,
  onChange,
  placeholder,
  charCount,
  disabled,
  error,
  id,
  name,
  initialHeight = 80,
  resize = 'vertical',
  className,
  textareaClassName,
  footerEnd,
  refining = false,
  refineSlot,
}: TextareaProps) {
  /* ── Height measurement ──────────────────────────────────────
   * We capture the textarea's rendered height the moment BEFORE
   * `refining` flips true so the Skeleton overlay can match it
   * exactly. After that we keep the measured height latched until
   * `refining` flips false — preventing any height jump when the
   * Skeleton replaces real text. */
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);
  const [measuredHeight, setMeasuredHeight] = React.useState<number | null>(
    null,
  );
  const wasRefiningRef = React.useRef<boolean>(refining);

  /* ── Skeleton exit phase (chunk-12 emil pass) ────────────────
   * When `refining` flips false the Skeleton overlay used to vanish
   * the same frame the AI text re-appeared — a crossfade where one
   * side is instant looks like a snap, even when the other side has
   * the correct fade. We keep the Skeleton mounted for `SKELETON_EXIT_MS`
   * after `refining` drops, running `kb-tabs-content-out` on its
   * wrapper so it fades out on top of the textarea fading back in.
   * Reduce-motion users skip the wait (instant unmount, matching
   * the reduce-motion default of "no crossfade window"). */
  const [isExitingSkeleton, setIsExitingSkeleton] = React.useState(false);
  const exitTimerRef = React.useRef<number | null>(null);

  React.useLayoutEffect(() => {
    // Capture height on the render where `refining` becomes true.
    // The textarea node still exists at this point (it's just
    // readOnly + opacity-0), so getBoundingClientRect().height
    // returns its actual visible size.
    if (refining && !wasRefiningRef.current) {
      const rect = textareaRef.current?.getBoundingClientRect();
      if (rect && rect.height > 0) {
        setMeasuredHeight(rect.height);
      }
      // Cancel any in-flight exit (rapid retoggle) — refining is
      // back on, so the skeleton stays visible at full opacity.
      if (exitTimerRef.current !== null) {
        window.clearTimeout(exitTimerRef.current);
        exitTimerRef.current = null;
      }
      setIsExitingSkeleton(false);
    }
    // Fire the exit phase on refining true → false.
    if (!refining && wasRefiningRef.current) {
      setIsExitingSkeleton(true);
      if (exitTimerRef.current !== null) {
        window.clearTimeout(exitTimerRef.current);
      }
      exitTimerRef.current = window.setTimeout(() => {
        setIsExitingSkeleton(false);
        exitTimerRef.current = null;
      }, SKELETON_EXIT_MS);
    }
    wasRefiningRef.current = refining;
  }, [refining]);

  // Cleanup any pending timer on unmount so we don't setState on
  // a torn-down component (which React 18 warns on in dev).
  React.useEffect(() => {
    return () => {
      if (exitTimerRef.current !== null) {
        window.clearTimeout(exitTimerRef.current);
        exitTimerRef.current = null;
      }
    };
  }, []);

  // Compute the Skeleton's row count + widths from the latched
  // height. Each row is 16px tall + 12px gap, so a typical 80px
  // textarea fits 3 rows (16 + 12 + 16 + 12 + 16 = 72px). For taller
  // textareas we add more rows up to a sensible cap; for shorter
  // ones we drop to 2 rows. Last row clamps to 45% to feel naturalistic.
  const skeletonProps = React.useMemo(() => {
    const h = measuredHeight ?? initialHeight;
    // Row pattern: 16px rows + 12px gap. Aim to fill ~85% of the
    // available height so the bars don't crowd the top/bottom edge.
    const usable = Math.max(0, h - 8); // leave 8px of breathing room
    const rowH = 16;
    const gap = 12;
    // rows: solve rowH * n + gap * (n - 1) <= usable
    //   → n <= (usable + gap) / (rowH + gap)
    const n = Math.max(2, Math.min(4, Math.floor((usable + gap) / (rowH + gap))));
    const widths: Array<number | string> = [];
    for (let i = 0; i < n; i++) {
      widths.push(i === n - 1 ? '45%' : '100%');
    }
    return { rows: n, widths, gap, height: rowH };
  }, [measuredHeight, initialHeight]);

  return (
    <div
      className={cn(
        // `relative` so the absolute `refineSlot` anchors inside the
        // outer shell. `overflow-hidden` keeps the shimmer pseudo-
        // element clipped to the rounded border.
        'relative flex flex-col gap-1.5 overflow-hidden rounded-lg border bg-white px-3 py-2',
        error ? 'border-[#dc2626]' : 'border-[#e2e8f0]',
        disabled && 'opacity-50 cursor-not-allowed',
        className,
      )}
    >
      {/* Stack: the native textarea + the Skeleton overlay sit in the
          same flex slot. While refining, the textarea fades to 0 and
          the Skeleton fades in. We DO NOT toggle `display: none` so
          the textarea retains its layout box (height stays steady). */}
      <div className="relative min-h-0 flex-1">
        <textarea
          ref={textareaRef}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={refining}
          aria-invalid={error || undefined}
          aria-busy={refining || undefined}
          tabIndex={refining ? -1 : undefined}
          style={{
            // While refining, lock to measured height so the Skeleton
            // overlay can match exactly. Otherwise honour initialHeight.
            //
            // Autosize: `fieldSizing: 'content'` grows the textarea to
            // fit content past the `minHeight` floor. CSS-native, no
            // JS / no re-renders. Falls back gracefully to a fixed
            // `minHeight` frame on Firefox <144 (the textarea simply
            // stops growing — the user can still scroll). While
            // `refining`, content is hidden (opacity-0) so field-sizing
            // has nothing to measure and the `min-height` floor
            // (latched to the pre-refine measured height) keeps the
            // frame stable for the Skeleton overlay.
            //
            // We intentionally DO NOT transition the height change —
            // per emil-design-eng, animating `height` is a known
            // layout-thrash + perf hazard, AND autosize snaps are
            // typically ≤ 20px per linebreak. With frequent typing
            // (the common case), a height transition would constantly
            // retarget mid-flight, producing the soft-landing-rubbery
            // feel users describe as "laggy". The absence of a
            // transition reads as crisp instead of jumpy.
            //
            // Asymmetric fade timing for the refining state (chunk 12
            // emil pass) — refining IS where motion lives. The fade
            // ENTERING refining is 100ms linear: a fast vanish that
            // doesn't compete with the upcoming skeleton mount, and
            // linear is appropriate at the trigger moment. The fade
            // EXITING refining is 150ms with `var(--ease-out-strong)`:
            // the new AI text gets a deliberate landing curve that
            // matches the rest of the overlay/dropdown vocabulary.
            // Filter blur(2px → 0) on exit masks the brief crossfade
            // overlap with the still-fading Skeleton above.
            //
            // The inline style is the only reliable way to switch
            // transition properties asymmetrically based on state —
            // Tailwind's transition-* utilities don't compose well
            // when both duration AND timing function flip mid-state.
            minHeight: `${
              refining && measuredHeight ? measuredHeight : initialHeight
            }px`,
            fieldSizing: 'content',
            transitionProperty: 'opacity, filter',
            transitionDuration: refining ? '100ms, 100ms' : '150ms, 150ms',
            transitionTimingFunction: refining
              ? 'linear, linear'
              : 'var(--ease-out-strong), var(--ease-out-strong)',
          } as React.CSSProperties}
          className={cn(
            'block w-full min-w-0 flex-1 border-0 bg-transparent p-0 text-[14px] font-normal leading-5 text-text-primary outline-none placeholder:text-text-muted disabled:cursor-not-allowed',
            resizeClassMap[resize],
            // Hide the native diagonal resize grip (WebKit/Blink).
            // Drag-to-resize via `resize-y` still works; only the
            // grip glyph is suppressed. See HIDE_NATIVE_RESIZE_GRIP_CLASS.
            HIDE_NATIVE_RESIZE_GRIP_CLASS,
            // Reserve bottom space when the absolutely-positioned
            // `refineSlot` is present (e.g. SEO panel's "✦ Refine
            // with AI" CTA). The slot is `h-7` (28px) pinned at
            // `bottom-2` (8px), so its vertical range is 8 → 36px
            // from the bottom edge. `pb-12` (48px) keeps wrapped text
            // from sliding under the button. Without a slot we keep
            // the textarea flush so existing single-textarea consumers
            // (CategoryDescription, generic forms) don't grow.
            refineSlot && 'pb-12',
            // Opacity + filter target state. While refining: invisible
            // and slightly blurred (the latter masks the crossfade
            // smell when the Skeleton overlay sits on top). On exit:
            // opacity-100 + blur-0 — fades in over 150ms ease-out-strong
            // via the inline transition above.
            refining
              ? 'opacity-0 motion-safe:blur-[2px]'
              : 'opacity-100 motion-safe:blur-0',
            // Reduce-motion users skip the filter transition entirely
            // (no movement-equivalent perception cost; the swap is
            // instant which is the a11y default for content swaps).
            'motion-reduce:!transition-none',
            textareaClassName,
          )}
        />

        {(refining || isExitingSkeleton) && (
          <div
            /* Skeleton overlay — absolutely positioned over the textarea
               so it doesn't push layout.
               Mount-in: `kb-tabs-content-in` (150ms opacity 0 → 1, strong
               ease-out) fires once when `refining` first kicks in, so
               the shimmer feels like a confident "the AI is working"
               state rather than a sluggish reveal.
               Exit (chunk 12 emil pass): when `refining` flips false we
               keep the overlay mounted for SKELETON_EXIT_MS while
               `kb-tabs-content-out` plays (100ms opacity 1 → 0, strong
               ease-out). Without this exit phase the skeleton was yanked
               from the DOM the moment refining ended, producing a hard
               cut even though the textarea was fading in underneath.
               The 50ms head-start the textarea has over the skeleton
               (150ms fade-in vs 100ms fade-out) means the eye lands on
               "real text" before the shimmer is fully gone — the Emil
               textbook crossfade pattern.
               The Skeleton's own kb-skeleton-shimmer animation handles
               the in-flight loading sweep at 1.6s linear infinite. */
            aria-hidden="true"
            data-kb-part="textarea-refining-overlay"
            className={cn(
              'pointer-events-none absolute inset-0 flex items-start',
              // Mount-in plays whenever the wrapper enters refining.
              // Exit plays when the wrapper is in the `isExitingSkeleton`
              // tail — same animation utility namespace so both classes
              // resolve to keyframes registered in tokens.css. The exit
              // animation uses `animation-fill-mode: forwards` so the
              // overlay holds at opacity:0 during the unmount-timer
              // handoff (~100ms) without a flash-back to opacity:1.
              isExitingSkeleton
                ? 'motion-safe:animate-kb-tabs-content-out'
                : 'motion-safe:animate-kb-tabs-content-in',
            )}
          >
            <Skeleton
              rows={skeletonProps.rows}
              widths={skeletonProps.widths}
              gap={skeletonProps.gap}
              height={skeletonProps.height}
              radius={4}
            />
          </div>
        )}
      </div>

      {/* refineSlot — absolutely pinned at the bottom-right corner of
          the textarea frame. Sits ABOVE the Skeleton overlay (z-10) so
          it stays interactive (or visibly dimmed) while refining.
          The 8px inset matches the Figma `#2949:7886` placement. */}
      {refineSlot && (
        <div
          className={cn(
            'absolute bottom-2 right-2 z-10',
            // Dim + freeze the slot while refining so the user can't
            // re-fire the action mid-flight. The slot is responsible
            // for its own visual treatment; we add a global dim hook
            // so consumers who don't dim themselves still get the
            // correct affordance.
            refining && 'pointer-events-none opacity-50',
            'motion-safe:transition-opacity motion-safe:duration-150 motion-safe:ease-out',
          )}
        >
          {refineSlot}
        </div>
      )}

      {(charCount || footerEnd) && (
        <div className="flex items-center justify-end gap-2">
          {charCount && (
            <span className="shrink-0 text-[12px] font-normal leading-[18px] text-text-muted tabular-nums">
              {charCount.current}/{charCount.max}
            </span>
          )}
          {footerEnd}
        </div>
      )}
    </div>
  );
}
