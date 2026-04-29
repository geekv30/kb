// Phase 7.5.3 + 7.5.8 — Shell layout for routes that show the rail
// + sub-nav + breadcrumb (per TRD §7.1).
//
// Phase 7.5.8 polish:
//   - Suspense fallback now uses `<PageProgressBar />` (top-edge
//     indeterminate band) per PRD §12.6.
//   - `<Outlet />` is wrapped in `<RouteTransition />` so route swaps
//     fade in over 150ms (PRD §12.3).
//   - `useFocusOnRouteChange()` hands focus to the page's primary
//     `<h1>` after navigation (PRD §12.2).

import { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AppShell } from '@test-kb-ui/kb-ui';
import { AppRail } from '../shell/AppRail';
import { EditorExplorer } from '../shell/EditorExplorer';
import { AnalyticsExplorer } from '../shell/AnalyticsExplorer';
import { AISubNavbar } from '../shell/AISubNavbar';
import { BreadcrumbBar } from '../shell/BreadcrumbBar';
import { PageProgressBar } from '../components/PageProgressBar';
import { RouteTransition } from '../components/RouteTransition';
import { useFocusOnRouteChange } from '../hooks/useFocusOnRouteChange';

function RouteAwareExplorer() {
  const { pathname } = useLocation();
  if (pathname.startsWith('/kb')) return <EditorExplorer />;
  if (pathname.startsWith('/ai-optimise')) return <AISubNavbar />;
  if (pathname.startsWith('/analytics')) return <AnalyticsExplorer />;
  // Settings deliberately renders no explorer — the rail icon stays
  // active but the middle column is empty (PRD §4.4).
  return null;
}

export default function ShellLayout() {
  useFocusOnRouteChange();
  return (
    <AppShell
      rail={<AppRail />}
      explorer={<RouteAwareExplorer />}
      breadcrumb={<BreadcrumbBar />}
    >
      <Suspense fallback={<PageProgressBar />}>
        <RouteTransition>
          <Outlet />
        </RouteTransition>
      </Suspense>
    </AppShell>
  );
}
