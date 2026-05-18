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
 * Chunk-5 refining state behaviour (per emil-design-eng motion brief):
 *   1. The textarea's RENDERED height is captured one render BEFORE
 *      `refining` flips true via a layout effect — Skeleton bars are
 *      sized to match so there's zero layout jump when shimmer kicks in.
 *   2. Content fade-out: 100ms opacity 1 → 0 (linear is fine; the eye
 *      barely sees it). On exit: 150ms opacity 0 → 1 with strong
 *      ease-out so the new AI text feels like it "lands".
 *   3. The Skeleton's own shimmer pseudo-element (`kb-skeleton-shimmer`,
 *      1.6s linear infinite) handles the in-flight loading motion.
 *   4. Textarea becomes `readOnly` while refining so the user can't
 *      race the AI service; the underlying value is preserved so an
 *      error path can restore prior text without losing edits.
 *   5. `motion-safe:` gates the fade transitions so reduced-motion
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
    }
    wasRefiningRef.current = refining;
  }, [refining]);

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
            minHeight: `${
              refining && measuredHeight ? measuredHeight : initialHeight
            }px`,
          }}
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
            // Fade out the contents on entering refining state.
            // 100ms opacity 1 → 0 is fast enough to read as "the
            // text vanished" without flashing through unparsed copy.
            refining ? 'opacity-0' : 'opacity-100',
            'motion-safe:transition-opacity motion-safe:duration-100 motion-safe:ease-linear',
            textareaClassName,
          )}
        />

        {refining && (
          <div
            /* Skeleton overlay — absolutely positioned over the textarea
               so it doesn't push layout. Fade-in mirrors the textarea's
               fade-out: 150ms opacity 0 → 1 with strong ease-out so the
               shimmer feels like a confident "the AI is working" state
               rather than a sluggish reveal.
               The wrapper has `animate-kb-tabs-content-in` (150ms
               opacity-only fade, strong ease-out) which fires once on
               mount when refining first kicks in. The Skeleton's own
               kb-skeleton-shimmer animation handles the in-flight
               loading sweep at 1.6s linear infinite. */
            aria-hidden="true"
            data-kb-part="textarea-refining-overlay"
            className={cn(
              'pointer-events-none absolute inset-0 flex items-start',
              'motion-safe:animate-kb-tabs-content-in',
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
