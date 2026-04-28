// Phase 7.5.3 — Route-aware wrapper around `SideNavRail`.
//
// Reads the current pathname to compute the active rail icon (per
// PRD §4.3) and routes clicks via `useNavigate`. The four icon set,
// brand logo, and bottom avatar match the canonical composition used
// in every kb-ui page story (e.g. `KBAIOptimiseHubPage`) so this shell
// stays visually identical to those frames.

import {
  RiBarChartBoxLine,
  RiQuillPenLine,
  RiSettings5Line,
} from '@remixicon/react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  AiIcon,
  Avatar,
  CompanyLogo,
  SideNavRail,
  type NavRailItem,
} from '@hiver/kb-ui';
import { useMockStore } from '../store/MockStoreContext';
import { selectCurrentUser } from '../store/selectors';
import { DEFAULT_KB_CATEGORY_SLUG, routes } from '../lib/routes';

/** Stable rail-item ids — used for active comparison and click routing. */
type RailSection = 'ai' | 'editor' | 'analytics' | 'settings';

const railItems: NavRailItem[] = [
  { id: 'ai', icon: <AiIcon size={16} />, label: 'AI' },
  { id: 'editor', icon: <RiQuillPenLine size={16} />, label: 'Editor' },
  { id: 'analytics', icon: <RiBarChartBoxLine size={16} />, label: 'Analytics' },
  { id: 'settings', icon: <RiSettings5Line size={16} />, label: 'Settings' },
];

/**
 * Route → rail-section mapping per PRD §4.3.
 * Editor and `/articles/*` both light up the Editor icon (the editor
 * route is collapsed-shell, but the rail is unmounted there — this
 * mapping is still useful for any future shared-state derivation).
 */
function activeSectionForPath(pathname: string): RailSection {
  if (pathname.startsWith('/ai-optimise')) return 'ai';
  if (pathname.startsWith('/analytics')) return 'analytics';
  if (pathname.startsWith('/settings')) return 'settings';
  // Both `/kb/*` and `/articles/*` belong to the editor section.
  return 'editor';
}

/** Click destination per rail icon (PRD §7.1 persistent shell table). */
function destinationForSection(section: RailSection): string {
  switch (section) {
    case 'ai':
      return routes.aiOptimise.hub();
    case 'analytics':
      return routes.analytics.articlePerformance();
    case 'settings':
      return routes.settings();
    case 'editor':
      return routes.kb.category(DEFAULT_KB_CATEGORY_SLUG);
  }
}

export function AppRail() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { state } = useMockStore();
  const currentUser = selectCurrentUser(state);
  const activeId = activeSectionForPath(pathname);

  return (
    <SideNavRail
      theme="light"
      items={railItems}
      activeId={activeId}
      brandLogo={<CompanyLogo size={24} />}
      bottomSlot={<Avatar initials={currentUser?.initials ?? 'A'} />}
      onItemClick={(id) => {
        const section = id as RailSection;
        navigate(destinationForSection(section));
      }}
    />
  );
}
