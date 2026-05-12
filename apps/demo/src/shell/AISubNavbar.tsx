// Phase 7.5.3 — Route-aware wrapper around `FileExplorerNav` (flat variant)
// for the `/ai-optimise/*` surface.
//
// The flat variant matches the editor's FileExplorerNav header pattern:
// "AI Centre" is the header title (with AiIcon glyph), and the single
// "AI Optimise" row sits below. Per Figma `74:8871`, clicking the row
// navigates to the AI Optimise hub; the "AI Centre" label is the panel
// header itself (not a clickable row), so no toast is required.

import { MagicWand02 } from '@untitledui/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { AiIcon, FileExplorerNav, type NavItem } from '@test-kb-ui/kb-ui';
import { routes } from '../lib/routes';

const items: NavItem[] = [
  {
    id: 'ai-optimise',
    title: 'AI Optimise',
    type: 'article',
    kind: 'item',
    icon: <MagicWand02 size={18} />,
  },
];

export function AISubNavbar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const activeId = pathname.startsWith('/ai-optimise') ? 'ai-optimise' : undefined;

  return (
    <FileExplorerNav
      title="AI Centre"
      headerIcon={<AiIcon size={18} />}
      variant="flat"
      items={items}
      activeId={activeId}
      onItemClick={(id) => {
        if (id === 'ai-optimise') {
          navigate(routes.aiOptimise.hub());
        }
      }}
    />
  );
}
