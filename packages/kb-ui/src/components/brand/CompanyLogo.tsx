import * as React from 'react';

export type CompanyLogoProps = React.SVGProps<SVGSVGElement> & {
  /** Rendered size in px. Default 24. */
  size?: number;
  src?: string;
  glyph?: React.ReactNode;
};

/**
 * Hiver company mark — 24×24 dark rounded rect (#2D2D2D) with the inner
 * Hiver glyph rendered in white. Used in the SideNavRail brand slot.
 *
 * Source asset: /CompanyLogo.svg (repo root).
 *
 * Override slots (defaults preserved when both are undefined):
 * - `src`: render an <img> inside the dark rounded-rect wrapper.
 * - `glyph`: render arbitrary React content inside the dark rounded-rect wrapper.
 */
export function CompanyLogo({
  size = 24,
  className,
  src,
  glyph,
  ...rest
}: CompanyLogoProps) {
  if (typeof src === 'string' && src.length > 0) {
    return (
      <span
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: size,
          height: size,
          borderRadius: 4,
          backgroundColor: '#2D2D2D',
          overflow: 'hidden',
        }}
        aria-hidden="true"
      >
        <img
          src={src}
          alt=""
          width={size}
          height={size}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      </span>
    );
  }

  if (glyph !== undefined && glyph !== null) {
    return (
      <span
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: size,
          height: size,
          borderRadius: 4,
          backgroundColor: '#2D2D2D',
          overflow: 'hidden',
        }}
        aria-hidden="true"
      >
        {glyph}
      </span>
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      <rect width="24" height="24" rx="4" fill="#2D2D2D" />
      <path
        d="M12.855 11.2344C14.7431 11.2345 16.2739 12.7661 16.2739 14.6543V18.7949C14.3857 18.7949 12.8551 17.2642 12.855 15.376V11.2344ZM7.72607 5.20508C9.61434 5.20508 11.145 6.73575 11.145 8.62402V18.4346C9.25685 18.4345 7.72607 16.9038 7.72607 15.0156V5.20508Z"
        fill="white"
      />
    </svg>
  );
}
