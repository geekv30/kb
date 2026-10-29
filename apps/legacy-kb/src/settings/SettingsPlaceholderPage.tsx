// Settings pages outside this prototype (Branding, Access). The sidebar
// rows stay live, as in the real app, so each lands here instead of
// doing nothing.

import { Link } from 'react-router-dom';
import { EmptyState } from '../components/ui/EmptyState';
import { SITE_SETTINGS_PATH } from '../lib/paths';

export function SettingsPlaceholderPage() {
  return (
    <div className="flex flex-col items-center px-[40px]">
      <EmptyState title="This page isn’t part of the prototype" info="The Hiver AI setting is in Site settings." />
      <Link
        to={SITE_SETTINGS_PATH}
        className="mt-[16px] font-inter text-[14px] leading-[17px] font-medium text-legacy-blue no-underline hover:underline"
      >
        Go to Site settings
      </Link>
    </div>
  );
}
