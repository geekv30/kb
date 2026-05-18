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
 * Multi-color Google "G" mark — inlined SVG rather than CDN-loaded.
 * Sized 14px to match the Figma header glyph (14×14 outer, 12×12
 * inner). Standard 4-color brand swatches.
 * ───────────────────────────────────────────────────────────── */

function GoogleGMark({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <path
        d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z"
        fill="#EA4335"
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
        <GoogleGMark size={14} />
        <span className="text-[13px] font-normal leading-[19px] text-text-muted">
          Google search preview
        </span>
      </div>

      {/* Body — favicon + breadcrumb, title, description */}
      <div className="flex w-full flex-col gap-1.5">
        {/* Favicon + breadcrumb URL row */}
        <div className="flex w-full items-center gap-1.5">
          {/* Hiver's own favicon — 14px to match Figma 2949:8003 */}
          <CompanyLogo size={14} className="shrink-0" />
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
