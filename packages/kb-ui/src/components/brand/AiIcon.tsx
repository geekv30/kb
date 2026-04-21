import * as React from 'react';

export type AiIconProps = React.SVGProps<SVGSVGElement> & {
  /** Rendered size in px. Default 16 (matches the rail's 16x16 glyph slot). */
  size?: number;
};

/**
 * AI sparkle mark — 4-point star rendered with a magenta→peach linear
 * gradient stroke. Used as the "AI" slot icon in `SideNavRail`.
 *
 * Source of truth:
 *   Figma file: 9aGp5t9fH1d0PXi4LMhOdb (library-check)
 *   Vector node: I1:4349;206:6843;12619:15996;517:21335
 *   (inside the SideNavRail AI nav item 1:4349)
 *
 * Extraction details (via Figma Plugin API, 2026-04-21):
 *   - Shape: 13.333 x 13.333 sparkle (4-point star path),
 *     centered in a 16x16 frame.
 *   - Stroke: GRADIENT_LINEAR, stroke-weight 1.4.
 *   - Stop 0 (pos 0): rgb(217, 47, 255)  = #D92FFF
 *   - Stop 1 (pos 1): rgb(255, 201, 135) = #FFC987
 *   - Gradient transform (Figma 2x3, in normalized object-bounding-box space):
 *       [[ 0.98271,  0.10255, -0.07961],
 *        [-0.10250,  0.11847,  0.49054]]
 *     Mapping (0,0)→(−0.07961, 0.49054), (1,0)→(0.90309, 0.38804).
 *     Faithfully reproduced here via <linearGradient gradientUnits="objectBoundingBox">.
 */
export function AiIcon({
  size = 16,
  className,
  ...rest
}: AiIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      <defs>
        <linearGradient
          id="kb-ai-icon-gradient"
          gradientUnits="objectBoundingBox"
          x1="-0.07961"
          y1="0.49054"
          x2="0.90309"
          y2="0.38804"
        >
          <stop offset="0" stopColor="#D92FFF" />
          <stop offset="1" stopColor="#FFC987" />
        </linearGradient>
      </defs>
      {/*
        Figma vector path is authored in the shape's local 13.333x13.333 box.
        Translate by (1.333, 1.333) to center inside a 16x16 canvas (matches
        the 16-frame with 8.33%/8.35% insets observed in Figma).
      */}
      <g transform="translate(1.3333 1.3333)">
        <path
          d="M 6.6667 0 L 5.799 3.4707 C 5.6297 4.1479 5.5451 4.4865 5.3687 4.7621 C 5.2128 5.0058 5.0058 5.2128 4.7621 5.3687 C 4.4865 5.5451 4.1479 5.6297 3.4707 5.799 L 0 6.6667 L 3.4707 7.5343 C 4.1479 7.7037 4.4865 7.7883 4.7621 7.9646 C 5.0058 8.1205 5.2128 8.3275 5.3687 8.5713 C 5.5451 8.8468 5.6297 9.1855 5.799 9.8627 L 6.6667 13.3333 L 7.5343 9.8627 C 7.7037 9.1855 7.7883 8.8468 7.9646 8.5713 C 8.1205 8.3275 8.3275 8.1205 8.5713 7.9646 C 8.8468 7.7883 9.1855 7.7037 9.8627 7.5343 L 13.3333 6.6667 L 9.8627 5.799 C 9.1855 5.6297 8.8468 5.5451 8.5713 5.3687 C 8.3275 5.2128 8.1205 5.0058 7.9646 4.7621 C 7.7883 4.4865 7.7037 4.1479 7.5343 3.4707 L 6.6667 0 Z"
          stroke="url(#kb-ai-icon-gradient)"
          strokeWidth="1.4"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}
