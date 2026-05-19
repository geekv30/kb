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

import { Suspense, useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import {
  AppShell,
  SidebarCollapseProvider,
  useSidebarCollapse,
  WelcomeTourProvider,
  useTourTarget,
} from '@test-kb-ui/kb-ui';
import { AppRail } from '../shell/AppRail';
import { EditorExplorer } from '../shell/EditorExplorer';
import { AnalyticsExplorer } from '../shell/AnalyticsExplorer';
import { AISubNavbar } from '../shell/AISubNavbar';
import { BreadcrumbBar } from '../shell/BreadcrumbBar';
import { PageProgressBar } from '../components/PageProgressBar';
import { useFocusOnRouteChange } from '../hooks/useFocusOnRouteChange';
import {
  HIVER_COMPLETION,
  HIVER_TOUR_STEPS,
  HIVER_TOUR_STORAGE_KEY,
  HIVER_WELCOME,
} from '../components/welcome-tour-config';

function RouteAwareExplorer() {
  const { pathname } = useLocation();
  if (pathname.startsWith('/kb')) return <EditorExplorer />;
  if (pathname.startsWith('/ai-optimise')) return <AISubNavbar />;
  if (pathname.startsWith('/analytics')) return <AnalyticsExplorer />;
  // Settings deliberately renders no explorer — the rail icon stays
  // active but the middle column is empty (PRD §4.4).
  return null;
}

/**
 * Resolves the rail's AI and Analytics buttons (the rail markup lives
 * inside `@test-kb-ui/kb-ui` so we can't add refs directly). We watch
 * the rail container for its `[data-kb-part="rail-item"]` children and
 * register the AI button (index 0) and Analytics button (index 2) as
 * tour targets. Order matches `AppRail.tsx` railItems:
 * AI, Editor, Analytics, Settings.
 */
function useRegisterRailTourTargets(
  containerRef: React.RefObject<HTMLDivElement | null>,
) {
  const registerAi = useTourTarget('rail-ai');
  const registerAnalytics = useTourTarget('rail-analytics');

  useEffect(() => {
    const container = containerRef.current;
    if (container === null) return;

    const resolve = () => {
      const items = container.querySelectorAll<HTMLElement>(
        '[data-kb-part="rail-item"]',
      );
      // Index 0 = AI, 1 = Editor, 2 = Analytics, 3 = Settings.
      registerAi(items[0] ?? null);
      registerAnalytics(items[2] ?? null);
    };

    resolve();
    // Re-resolve if rail markup changes (defensive — rail items are stable).
    const observer = new MutationObserver(resolve);
    observer.observe(container, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      registerAi(null);
      registerAnalytics(null);
    };
  }, [containerRef, registerAi, registerAnalytics]);
}

function ShellLayoutInner() {
  const sidebar = useSidebarCollapse();
  const railRef = useRef<HTMLDivElement | null>(null);
  const registerExplorer = useTourTarget('sidebar-explorer');
  useRegisterRailTourTargets(railRef);

  return (
    <AppShell
      rail={
        <div ref={railRef} className="h-full w-full">
          <AppRail />
        </div>
      }
      explorer={
        <div ref={registerExplorer} className="h-full w-full">
          <RouteAwareExplorer />
        </div>
      }
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
    <SidebarCollapseProvider storageKey="kb-demo.sidebar.collapsed">
      <WelcomeTourProvider
        steps={HIVER_TOUR_STEPS}
        welcome={HIVER_WELCOME}
        completion={HIVER_COMPLETION}
        storageKey={HIVER_TOUR_STORAGE_KEY}
      >
        <ShellLayoutInner />
      </WelcomeTourProvider>
    </SidebarCollapseProvider>
  );
}
