import * as React from 'react';
import { ChevronRight } from '@untitledui/icons';
import { cn } from '../../utils/cn';
import { CompanyLogo } from '../brand/CompanyLogo';

/* ─────────────────────────────────────────────────────────────
 * SerpPreview — Google Search Engine Result Page (SERP) card.
 *
 * Mirrors how the article would render in a Google search result —
 * a header row ("G" + "Google search preview"), then the article's
 * favicon + breadcrumb URL, the blue link title, and the muted
 * description.
 *
 * Pure presentational: every visible piece is driven by props.
 * Parent supplies live values from the SEO panel fields (meta
 * title, description, base URL, breadcrumb crumbs); the preview
 * updates on every keystroke.
 *
 * Figma reference: 251DTRmxl2L6jmXd3FWzHe / 2949:7844 (default state)
 *
 * Card chrome:
 *   bg #fcfcfc, border #f1f5f9 (border-surface-muted),
 *   radius 12px, px 16 / py 12, inner gap 12.
 *
 * Title color #0c3e9d is custom (closest to Google's deep link blue).
 * No matching kb-ui token yet — inlined here; can be promoted later
 * if a second surface needs it.
 *
 * Truncation: title + breadcrumb crumbs + description all clip to
 * a single line via ellipsis to keep the card height stable while
 * the user types. Real Google results wrap; we trade fidelity to
 * the live medium for predictability in the editor.
 * ───────────────────────────────────────────────────────────── */

export type SerpPreviewProps = {
  /** Meta title — appears as the blue link line. */
  title?: string;
  /** Meta description — appears as the muted body line. */
  description?: string;
  /** URL host displayed before the breadcrumb crumbs. */
  baseUrl?: string;
  /** Breadcrumb segments rendered between baseUrl and title-as-crumb. */
  breadcrumbPath?: string[];
  /** Displayed when `title` is empty/whitespace. */
  titleFallback?: string;
  /** Displayed when `description` is empty/whitespace. */
  descriptionFallback?: string;
  className?: string;
};

/* ─────────────────────────────────────────────────────────────
 * Multi-color Google "G" mark — inlined SVG with the full
 * 0–48 viewBox so all four color quadrants render without edge-
 * cropping. Default size 16 matches the bumped favicon below
 * (see comment on the favicon row for why we run at 16, not 14).
 * Standard 4-color brand swatches.
 * ───────────────────────────────────────────────────────────── */

function GoogleGMark({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ flexShrink: 0, display: 'block' }}
    >
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
 * One breadcrumb segment + trailing chevron divider. Truncates
 * with ellipsis when its label is long enough to overflow.
 * ───────────────────────────────────────────────────────────── */

function BreadcrumbCrumb({ label }: { label: string }) {
  return (
    <>
      <ChevronRight
        size={12}
        aria-hidden="true"
        className="shrink-0 text-text-primary"
      />
      <span
        className="min-w-0 truncate text-[13px] font-normal leading-[19px] text-text-primary"
      >
        {label}
      </span>
    </>
  );
}

export function SerpPreview({
  title,
  description,
  baseUrl,
  breadcrumbPath,
  titleFallback = 'Untitled',
  descriptionFallback = 'No description yet.',
  className,
}: SerpPreviewProps) {
  const displayTitle =
    title && title.trim().length > 0 ? title.trim() : titleFallback;
  const displayDescription =
    description && description.trim().length > 0
      ? description.trim()
      : descriptionFallback;
  const displayBase =
    baseUrl && baseUrl.trim().length > 0 ? baseUrl.trim() : 'help.hiverhq.com';
  const crumbs = (breadcrumbPath ?? []).filter(
    (c) => typeof c === 'string' && c.trim().length > 0,
  );

  return (
    <div
      data-kb-part="serp-preview"
      className={cn(
        // Card chrome — Figma 2949:7982
        'flex w-full flex-col gap-3 rounded-[12px] border border-surface-muted bg-[#fcfcfc] px-4 py-3',
        className,
      )}
    >
      {/* Header row — "G" + "Google search preview" */}
      <div className="flex w-full items-center gap-1.5">
        <GoogleGMark size={16} />
        <span className="text-[13px] font-normal leading-[19px] text-text-muted">
          Google search preview
        </span>
      </div>

      {/* Body — favicon + breadcrumb, title, description */}
      <div className="flex w-full flex-col gap-1.5">
        {/* Favicon + breadcrumb URL row */}
        <div className="flex w-full items-center gap-1.5">
          {/* Hiver's own favicon — yellow product variant `#FEC32A` to match
              Figma 2949:8003 (which uses `imgHiverLogo`, not the dark app-rail
              variant). Rendered at 16px (rather than the Figma frame's 14×14)
              because CompanyLogo's inner Hiver glyph paths sit close to the
              rounded-rect edges of the 24-unit viewBox — at 14px the corner
              curve visibly clips against the white glyph's tips. Bumping to
              16 gives ~2 extra rendered pixels per side, restoring the
              breathing room shown in Figma without changing the shared SVG.
              Google G is bumped in lockstep so the two icons stay paired. */}
          <CompanyLogo size={16} bgColor="#FEC32A" className="shrink-0" />
          {/* Crumb stack — flex-1 so it can truncate; title-as-crumb
              is the only flex-grow element. */}
          <div className="flex min-w-0 flex-1 items-center gap-0.5">
            <span
              className="shrink-0 truncate text-[13px] font-normal leading-[19px] text-text-primary"
            >
              {displayBase}
            </span>
            {crumbs.map((crumb, i) => (
              <BreadcrumbCrumb key={`${crumb}-${i}`} label={crumb} />
            ))}
            <ChevronRight
              size={12}
              aria-hidden="true"
              className="shrink-0 text-text-primary"
            />
            <span
              className="min-w-0 flex-1 truncate text-[13px] font-normal leading-[19px] text-text-primary"
            >
              {displayTitle}
            </span>
          </div>
        </div>

        {/* Title — blue link, 16px medium, single-line truncate */}
        <p
          className="truncate text-[16px] font-medium leading-6"
          style={{ color: '#0c3e9d' }}
        >
          {displayTitle}
        </p>

        {/* Description — muted, 13px regular */}
        <p className="text-[13px] font-normal leading-[19px] text-text-muted">
          {displayDescription}
        </p>
      </div>
    </div>
  );
}
