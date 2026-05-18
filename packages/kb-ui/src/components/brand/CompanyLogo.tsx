import * as React from 'react';

export type CompanyLogoProps = React.SVGProps<SVGSVGElement> & {
  /** Rendered size in px. Default 24. */
  size?: number;
  src?: string;
  glyph?: React.ReactNode;
  /**
   * Background color of the rounded-rect wrapper / svg fill. Defaults to
   * `#2D2D2D` (the dark variant used in the app rail). The SERP preview
   * uses the yellow product favicon variant (`#FEC32A`) — pass that color
   * explicitly when rendering the Hiver favicon inline with text.
   */
  bgColor?: string;
};

/**
 * Hiver company mark — 24×24 rounded rect with the inner Hiver glyph rendered
 * in white. Default bg `#2D2D2D` (dark variant used in the app rail). Pass
 * `bgColor="#FEC32A"` to render the yellow product favicon variant used in
 * the SERP preview (Figma 2949:8003).
 *
 * Source asset: /CompanyLogo.svg (repo root).
 *
 * Override slots (defaults preserved when both are undefined):
 * - `src`: render an <img> inside the rounded-rect wrapper.
 * - `glyph`: render arbitrary React content inside the rounded-rect wrapper.
 */
export function CompanyLogo({
  size = 24,
  className,
  src,
  glyph,
  bgColor = '#2D2D2D',
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
          backgroundColor: bgColor,
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
          backgroundColor: bgColor,
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
      <rect width="24" height="24" rx="4" fill={bgColor} />
      <path
        d="M12.855 11.2344C14.7431 11.2345 16.2739 12.7661 16.2739 14.6543V18.7949C14.3857 18.7949 12.8551 17.2642 12.855 15.376V11.2344ZM7.72607 5.20508C9.61434 5.20508 11.145 6.73575 11.145 8.62402V18.4346C9.25685 18.4345 7.72607 16.9038 7.72607 15.0156V5.20508Z"
        fill="white"
      />
    </svg>
  );
}
