// Phase 7.5.3 — Route-aware wrapper around the local `AISubNav` for the
// `/ai-optimise/*` surface.
//
// Two rows per Figma `74:8871` (AI Optimise hub):
//   1. AI Centre  — kind=section, no-op for v1 (PRD §10 decision 2). Phase
//      7.5.8 will replace the placeholder console.log with a `Coming soon`
//      toast; until then we keep behaviour observable but harmless.
//   2. AI Optimise — kind=item, active on both `/ai-optimise` and
//      `/ai-optimise/.../review`. Click navigates to the hub.

import { RiMagicLine } from '@remixicon/react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AiIcon } from '@hiver/kb-ui';
import { AISubNav, type AISubNavItem } from './AISubNav';
import { routes } from '../lib/routes';
import { useToast } from '../components/Toast';

const subNavItems: AISubNavItem[] = [
  {
    id: 'ai-centre',
    icon: <AiIcon size={18} />,
    label: 'AI Centre',
    kind: 'section',
  },
  {
    id: 'ai-optimise',
    icon: <RiMagicLine size={18} />,
    label: 'AI Optimise',
    kind: 'item',
  },
];

export function AISubNavbar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { showToast } = useToast();
  // Active is `ai-optimise` whenever we're anywhere under /ai-optimise.
  const activeId = pathname.startsWith('/ai-optimise') ? 'ai-optimise' : undefined;

  return (
    <AISubNav
      items={subNavItems}
      activeId={activeId}
      onItemClick={(id) => {
        if (id === 'ai-optimise') {
          navigate(routes.aiOptimise.hub());
          return;
        }
        // AI Centre is intentionally a no-op (PRD §10 decision 2). The
        // toast confirms the click registered without committing to a
        // destination we don't ship.
        showToast('Coming soon.', 'info');
      }}
    />
  );
}
