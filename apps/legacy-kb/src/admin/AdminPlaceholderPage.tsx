// Admin Panel pages outside this prototype. The nav rows stay live (they
// are in the real panel), so each lands on the design system's
// EmptyState instead of doing nothing.

import { ADMIN_HELP_CENTER_PATH } from '../lib/paths';
import { DsEmptyState } from './ds/DsEmptyState';

export function AdminPlaceholderPage() {
  return (
    <div className="flex h-full items-center justify-center px-[32px]">
      <DsEmptyState
        title="This page isn’t part of the prototype"
        description="The Hiver AI entry points are on Help Center and Knowledge Hub."
        action={{ label: 'Go to Help Center', to: ADMIN_HELP_CENTER_PATH }}
      />
    </div>
  );
}
