// Phase 7.5.8 — 150ms cross-fade for route content (PRD §12.3 / TRD §8.4).
//
// We key the wrapper div by `useLocation().key` so React unmounts and
// remounts on every route change, replaying the `kb-route-fade-in`
// keyframe. Out-fade is intentionally skipped — a fully-keyed
// crossfade requires an exit-animation library, and the visual win at
// 150ms is small.

import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

export function RouteTransition({ children }: { children: ReactNode }) {
  const location = useLocation();
  return (
    <div
      key={location.key}
      data-kb-part="route-transition"
      className="animate-route-fade-in"
    >
      {children}
    </div>
  );
}
