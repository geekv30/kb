// Phase 7.5.3 — Route-aware wrapper around `FileExplorerNav` (flat
// variant) for the Analytics surface (`/analytics/*`).
//
// Uses the canonical 3 items returned by `selectAnalyticsExplorerItems`.
// Active id is derived from the current pathname; click navigates to
// the matching tab.

import { useMemo } from 'react';
import { RiBarChartBoxLine } from '@remixicon/react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FileExplorerNav } from '@hiver/kb-ui';
import { useMockStore } from '../store/MockStoreContext';
import { selectAnalyticsExplorerItems } from '../store/selectors';
import { routes } from '../lib/routes';

const ID_TO_PATH: Record<string, string> = {
  'analytics-article-performance': routes.analytics.articlePerformance(),
  'analytics-search': routes.analytics.search(),
  'analytics-ai-answer-performance': routes.analytics.aiAnswer(),
};

const PATH_TO_ID: Record<string, string> = {
  [routes.analytics.articlePerformance()]: 'analytics-article-performance',
  [routes.analytics.search()]: 'analytics-search',
  [routes.analytics.aiAnswer()]: 'analytics-ai-answer-performance',
};

export function AnalyticsExplorer() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { state } = useMockStore();
  const items = useMemo(() => selectAnalyticsExplorerItems(state), [state]);
  const activeId = PATH_TO_ID[pathname];

  return (
    <FileExplorerNav
      title="Analytics"
      headerIcon={<RiBarChartBoxLine size={16} />}
      variant="flat"
      items={items}
      activeId={activeId}
      onItemClick={(id) => {
        const next = ID_TO_PATH[id];
        if (next) navigate(next);
      }}
    />
  );
}
