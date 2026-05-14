// Phase 7.5.3 + 7.5.8 — Collapsed shell layout for the editor and
// AI Gaps review routes (per TRD §7.2).
//
// Rail + explorer are unmounted (`sidebarCollapsed`); breadcrumb stays
// in editor variant via `BreadcrumbBar`'s route-aware logic. Content
// fills the full viewport.
//
// Phase 7.5.8 polish:
//   - Suspense fallback → PageProgressBar
//   - Lazy route chunks are loaded via <Suspense>; the first-visit
//     progress bar is the only navigation indicator.
//   - useFocusOnRouteChange runs (the editor route overrides via its
//     own Tiptap autofocus; the focus hook detects an active
//     ProseMirror element and steps aside).

import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { AppShell } from '@test-kb-ui/kb-ui';
import { BreadcrumbBar } from '../shell/BreadcrumbBar';
import { PageProgressBar } from '../components/PageProgressBar';
import { useFocusOnRouteChange } from '../hooks/useFocusOnRouteChange';

export default function CollapsedShellLayout() {
  useFocusOnRouteChange();
  return (
    <AppShell sidebarCollapsed breadcrumb={<BreadcrumbBar />}>
      <Suspense fallback={<PageProgressBar />}>
        <Outlet />
      </Suspense>
    </AppShell>
  );
}
