// Phase 7.5.3 + 7.5.8 — Shell layout for routes that show the rail
// + sub-nav + breadcrumb (per TRD §7.1).
//
// Phase 7.5.8 polish:
//   - Suspense fallback now uses `<PageProgressBar />` (top-edge
//     indeterminate band) per PRD §12.6.
//   - Lazy route chunks are loaded via <Suspense>; the first-visit
//     progress bar is the only navigation indicator.
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
import { useFocusOnRouteChange } from '../hooks/useFocusOnRouteChange';
import {
  SidebarCollapseProvider,
  useSidebarCollapse,
} from '../shell/SidebarCollapseContext';

function RouteAwareExplorer() {
  const { pathname } = useLocation();
  if (pathname.startsWith('/kb')) return <EditorExplorer />;
  if (pathname.startsWith('/ai-optimise')) return <AISubNavbar />;
  if (pathname.startsWith('/analytics')) return <AnalyticsExplorer />;
  // Settings deliberately renders no explorer — the rail icon stays
  // active but the middle column is empty (PRD §4.4).
  return null;
}

function ShellLayoutInner() {
  const sidebar = useSidebarCollapse();
  return (
    <AppShell
      rail={<AppRail />}
      explorer={<RouteAwareExplorer />}
      breadcrumb={<BreadcrumbBar />}
      sidebarCollapsed={sidebar?.collapsed ?? false}
    >
      <Suspense fallback={<PageProgressBar />}>
        <Outlet />
      </Suspense>
    </AppShell>
  );
}

export default function ShellLayout() {
  useFocusOnRouteChange();
  return (
    <SidebarCollapseProvider>
      <ShellLayoutInner />
    </SidebarCollapseProvider>
  );
}
