// Admin Panel pages outside this prototype. The nav rows stay live (they
// are in the real panel), so each lands here instead of doing nothing.

import { Link } from 'react-router-dom';
import { ADMIN_HELP_CENTER_PATH, ADMIN_KNOWLEDGE_HUB_PATH } from '../lib/paths';

const LINK = 'font-inter text-[14px] leading-[20px] font-medium text-admin-primary no-underline hover:underline';

export function AdminPlaceholderPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-[8px] px-[32px] text-center">
      <p className="m-0 font-inter text-[16px] leading-[24px] font-semibold text-admin-title">
        This page isn’t part of the prototype
      </p>
      <p className="m-0 font-inter text-[14px] leading-[20px] text-admin-meta">
        The AI suggestion entry points are on these two pages:
      </p>
      <div className="mt-[4px] flex gap-[16px]">
        <Link to={ADMIN_HELP_CENTER_PATH} className={LINK}>
          Help Center
        </Link>
        <Link to={ADMIN_KNOWLEDGE_HUB_PATH} className={LINK}>
          Knowledge Hub
        </Link>
      </div>
    </div>
  );
}
